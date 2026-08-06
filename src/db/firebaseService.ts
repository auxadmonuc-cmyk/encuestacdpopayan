import { collection, getDocs, doc, query, where, setDoc, deleteDoc, disableNetwork } from 'firebase/firestore';
import { db } from '../firebase';
import { ParticipantResponse } from '../types/survey';

const RESPONSES_COLLECTION = 'responses';
const CHUNKS_COLLECTION = 'survey_chunks';

/**
 * Timeout helper to prevent hanging requests from filling the Firestore write stream queue.
 */
function withTimeout<T>(promise: Promise<T>, ms = 4500, errorMsg = 'Operación de base de datos excedió el tiempo límite'): Promise<T> {
  let timer: any;
  const timeoutPromise = new Promise<never>((_, reject) => {
    timer = setTimeout(() => {
      reject(new Error(errorMsg));
    }, ms);
  });
  return Promise.race([promise, timeoutPromise]).finally(() => {
    clearTimeout(timer);
  });
}

/**
 * Recursively sanitizes objects for Firestore by removing undefined values
 * and stripping non-essential heavy properties like rawRow.
 */
function sanitizeForFirestore(obj: any): any {
  if (obj === undefined) return null;
  if (obj === null || typeof obj !== 'object') return obj;
  if (Array.isArray(obj)) {
    return obj.map(sanitizeForFirestore);
  }
  const cleanObj: Record<string, any> = {};
  for (const key of Object.keys(obj)) {
    if (key === 'rawRow') continue; // Exclude raw Excel row to keep document lightweight
    const value = obj[key];
    if (value !== undefined) {
      cleanObj[key] = sanitizeForFirestore(value);
    }
  }
  return cleanObj;
}

let quotaExceededFlag = false;
let isDisablingNetwork = false;

export function isFirestoreQuotaExceeded(): boolean {
  return quotaExceededFlag;
}

export function resetFirestoreQuotaFlag(): void {
  quotaExceededFlag = false;
  isDisablingNetwork = false;
  try {
    localStorage.removeItem('firestore_quota_exceeded');
    localStorage.removeItem('firestore_quota_exceeded_time');
  } catch (_) {}
}

async function handleQuotaExceeded() {
  quotaExceededFlag = true;
  try {
    localStorage.setItem('firestore_quota_exceeded', 'true');
    localStorage.setItem('firestore_quota_exceeded_time', String(Date.now()));
  } catch (_) {}

  if (!isDisablingNetwork) {
    isDisablingNetwork = true;
    try {
      await disableNetwork(db);
    } catch (e) {
      // Ignore errors when disabling network
    }
  }
}

// Initial state load
try {
  const flag = localStorage.getItem('firestore_quota_exceeded');
  const timestampStr = localStorage.getItem('firestore_quota_exceeded_time');
  if (flag === 'true' && timestampStr) {
    const timestamp = parseInt(timestampStr, 10);
    // If it was set less than 4 hours ago, keep it active to avoid thrashing.
    if (Date.now() - timestamp < 4 * 60 * 60 * 1000) {
      quotaExceededFlag = true;
      setTimeout(() => {
        handleQuotaExceeded();
      }, 50);
    } else {
      localStorage.removeItem('firestore_quota_exceeded');
      localStorage.removeItem('firestore_quota_exceeded_time');
    }
  }
} catch (_) {}

function isQuotaError(err: any): boolean {
  const msg = String(err?.message || err || '').toLowerCase();
  const code = String(err?.code || '').toLowerCase();
  if (
    code.includes('resource-exhausted') || 
    code.includes('quota') ||
    msg.includes('quota') || 
    msg.includes('resource-exhausted') || 
    msg.includes('free daily') ||
    msg.includes('exhausted') ||
    msg.includes('stream limit') ||
    msg.includes('payload size') ||
    msg.includes('exceeds the limit')
  ) {
    handleQuotaExceeded();
    return true;
  }
  return false;
}

function getLocalBackupResponses(surveyType?: string): ParticipantResponse[] {
  const data: ParticipantResponse[] = [];
  try {
    if (surveyType) {
      const localKey = `firebase_backup_${surveyType}`;
      const raw = localStorage.getItem(localKey);
      if (raw) data.push(...JSON.parse(raw));
    } else {
      ['principios', 'ambiente_seguro', 'job_description', 'engagement', 'all'].forEach(st => {
        const raw = localStorage.getItem(`firebase_backup_${st}`);
        if (raw) {
          try {
            data.push(...JSON.parse(raw));
          } catch (_) {}
        }
      });
    }
  } catch (e) {
    console.warn('Error reading local storage backup:', e);
  }
  return data;
}

export async function fetchResponsesFromFirebase(surveyType?: string): Promise<ParticipantResponse[]> {
  const data: ParticipantResponse[] = [];

  if (quotaExceededFlag) {
    return getLocalBackupResponses(surveyType);
  }

  try {
    // 1. Fetch from chunked collection with timeout
    let qChunks = collection(db, CHUNKS_COLLECTION);
    if (surveyType) {
      // @ts-ignore
      qChunks = query(qChunks, where('surveyType', '==', surveyType));
    }
    const chunkSnapshot = await withTimeout(getDocs(qChunks), 15000, 'Tiempo de espera agotado al consultar Firebase');
    chunkSnapshot.forEach((docSnap) => {
      const docData = docSnap.data();
      if (Array.isArray(docData.items)) {
        data.push(...docData.items);
      }
    });

    // 2. Fetch from legacy individual docs collection (for backward compatibility)
    try {
      let qLegacy = collection(db, RESPONSES_COLLECTION);
      if (surveyType) {
        // @ts-ignore
        qLegacy = query(qLegacy, where('surveyType', '==', surveyType));
      }
      const legacySnapshot = await withTimeout(getDocs(qLegacy), 3000, 'Tiempo de espera agotado en colección legacy');
      legacySnapshot.forEach((docSnap) => {
        const docData = docSnap.data();
        if (Array.isArray(docData.items)) {
          data.push(...docData.items);
        } else if (docData.name || docData.score !== undefined) {
          data.push(docData as ParticipantResponse);
        }
      });
    } catch (_) {
      // Legacy fetch non-blocking
    }
  } catch (error) {
    isQuotaError(error);
  }

  // 3. Merge with local storage backup if present
  try {
    const localKey = surveyType ? `firebase_backup_${surveyType}` : 'firebase_backup_all';
    const localRaw = localStorage.getItem(localKey);
    if (localRaw) {
      const localItems: ParticipantResponse[] = JSON.parse(localRaw);
      const existingKeys = new Set(
        data.map((r) => `${String(r.name || '').trim().toLowerCase()}||${String(r.startTime || '').trim().toLowerCase()}`)
      );
      localItems.forEach((item) => {
        const key = `${String(item.name || '').trim().toLowerCase()}||${String(item.startTime || '').trim().toLowerCase()}`;
        if (!existingKeys.has(key)) {
          data.push(item);
          existingKeys.add(key);
        }
      });
    }
  } catch (e) {
    console.error('Error reading local storage backup:', e);
  }

  return data;
}

export async function saveResponsesToFirebase(
  responses: ParticipantResponse[],
  surveyType: string,
  mode: 'overwrite' | 'append'
) {
  if (!responses || responses.length === 0) {
    return { count: 0, quotaExceeded: quotaExceededFlag };
  }

  // 1. Immediately backup to localStorage as guaranteed safety net (stripping heavy rawRow to prevent QuotaExceededError)
  try {
    const cleanResponsesForLocal = sanitizeForFirestore(responses);
    const localKey = `firebase_backup_${surveyType}`;
    if (mode === 'overwrite') {
      localStorage.setItem(localKey, JSON.stringify(cleanResponsesForLocal));
    } else {
      const existingLocalRaw = localStorage.getItem(localKey);
      const existingLocal: ParticipantResponse[] = existingLocalRaw ? JSON.parse(existingLocalRaw) : [];
      const itemMap = new Map<string, ParticipantResponse>();
      existingLocal.forEach((r) => {
        itemMap.set(`${String(r.name || '').trim().toLowerCase()}||${String(r.startTime || '').trim().toLowerCase()}`, r);
      });
      cleanResponsesForLocal.forEach((r: ParticipantResponse) => {
        itemMap.set(`${String(r.name || '').trim().toLowerCase()}||${String(r.startTime || '').trim().toLowerCase()}`, r);
      });
      localStorage.setItem(localKey, JSON.stringify(Array.from(itemMap.values())));
    }
  } catch (e) {
    console.warn('Could not write to local storage backup:', e);
  }

  // If cloud quota was already exceeded, return immediately from local storage
  if (quotaExceededFlag) {
    const localData = getLocalBackupResponses(surveyType);
    return { count: localData.length > 0 ? localData.length : responses.length, quotaExceeded: true };
  }

  if (mode === 'overwrite') {
    try {
      await clearSurveyResponsesFromFirebase(surveyType);
    } catch (e) {
      if (isQuotaError(e)) {
        const localData = getLocalBackupResponses(surveyType);
        return { count: localData.length > 0 ? localData.length : responses.length, quotaExceeded: true };
      }
    }
  }

  let responsesToInsert = responses;

  if (mode === 'append') {
    let existing: ParticipantResponse[] = [];
    try {
      existing = await fetchResponsesFromFirebase(surveyType);
    } catch (e) {
      if (isQuotaError(e)) {
        const localData = getLocalBackupResponses(surveyType);
        return { count: localData.length > 0 ? localData.length : responses.length, quotaExceeded: true };
      }
    }

    const existingKeys = new Set(
      existing.map((r) => {
        const namePart = String(r.name || '').trim().toLowerCase();
        const timePart = String(r.startTime || '').trim().toLowerCase();
        return `${namePart}||${timePart}`;
      })
    );

    // Filter incoming array against existing DB rows and against internal duplicates
    const seenIncoming = new Set<string>();
    responsesToInsert = responses.filter((r) => {
      const namePart = String(r.name || 'Sin Nombre').trim().toLowerCase();
      const timePart = String(r.startTime || '').trim().toLowerCase();
      const key = `${namePart}||${timePart}`;
      if (existingKeys.has(key) || seenIncoming.has(key)) {
        return false;
      }
      seenIncoming.add(key);
      return true;
    });

    if (responsesToInsert.length === 0) {
      const localData = getLocalBackupResponses(surveyType);
      return { count: localData.length > 0 ? localData.length : existing.length, quotaExceeded: quotaExceededFlag };
    }
  }

  // Chunk responses: 250 responses per document reduces Firestore writes by 99.6%
  const ITEMS_PER_CHUNK = 250;
  const chunks: ParticipantResponse[][] = [];
  for (let i = 0; i < responsesToInsert.length; i += ITEMS_PER_CHUNK) {
    chunks.push(responsesToInsert.slice(i, i + ITEMS_PER_CHUNK));
  }

  // Write chunks concurrently using Promise.all with a higher timeout to prevent timeouts
  const writePromises = chunks.map(async (rawChunk, i) => {
    if (quotaExceededFlag) return;
    const cleanChunk = sanitizeForFirestore(rawChunk);
    const chunkDocRef = doc(collection(db, CHUNKS_COLLECTION));
    return withTimeout(
      setDoc(chunkDocRef, {
        surveyType,
        chunkIndex: i,
        items: cleanChunk,
        updatedAt: Date.now()
      }),
      12000,
      'Tiempo de guardado excedido en Firebase Firestore'
    );
  });

  try {
    await Promise.all(writePromises);
  } catch (error: any) {
    isQuotaError(error);
  }

  const localData = getLocalBackupResponses(surveyType);
  return { 
    count: localData.length > 0 ? localData.length : responses.length, 
    quotaExceeded: quotaExceededFlag 
  };
}

export async function clearSurveyResponsesFromFirebase(surveyType?: string) {
  // 1. Clear localStorage backup immediately
  try {
    if (surveyType) {
      localStorage.removeItem(`firebase_backup_${surveyType}`);
    } else {
      localStorage.removeItem('firebase_backup_principios');
      localStorage.removeItem('firebase_backup_ambiente_seguro');
      localStorage.removeItem('firebase_backup_job_description');
      localStorage.removeItem('firebase_backup_engagement');
      localStorage.removeItem('firebase_backup_all');
    }
  } catch (e) {
    console.warn('Could not clear local storage backup:', e);
  }

  if (quotaExceededFlag) {
    return { success: true, count: 0, quotaExceeded: true };
  }

  // 2. Clear chunked collection
  try {
    let qChunks = collection(db, CHUNKS_COLLECTION);
    if (surveyType) {
      // @ts-ignore
      qChunks = query(qChunks, where('surveyType', '==', surveyType));
    }
    const chunkSnapshot = await withTimeout(getDocs(qChunks), 5000, 'Tiempo de espera al consultar chunks para borrado');
    const docs = chunkSnapshot.docs;
    const deletePromises = docs.map((docSnap) => 
      withTimeout(deleteDoc(docSnap.ref), 6000, 'Tiempo de borrado de chunk excedido')
    );
    await Promise.all(deletePromises);
  } catch (e) {
    isQuotaError(e);
  }

  // 3. Clear legacy collection
  if (!quotaExceededFlag) {
    try {
      let qLegacy = collection(db, RESPONSES_COLLECTION);
      if (surveyType) {
        // @ts-ignore
        qLegacy = query(qLegacy, where('surveyType', '==', surveyType));
      }
      const legacySnapshot = await withTimeout(getDocs(qLegacy), 5000, 'Tiempo de espera al consultar legacy para borrado');
      const docs = legacySnapshot.docs;
      const deletePromises = docs.map((docSnap) => 
        withTimeout(deleteDoc(docSnap.ref), 6000, 'Tiempo de borrado de documento legacy excedido')
      );
      await Promise.all(deletePromises);
    } catch (e) {
      isQuotaError(e);
    }
  }

  return { success: true, count: 0, quotaExceeded: quotaExceededFlag };
}


