import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { initializeFirestore, getFirestore, memoryLocalCache, Firestore } from 'firebase/firestore';
import defaultConfig from '../firebase-applet-config.json';

const metaEnv = (import.meta as any).env || {};

const config = {
  apiKey: metaEnv.VITE_FIREBASE_API_KEY || defaultConfig.apiKey,
  authDomain: metaEnv.VITE_FIREBASE_AUTH_DOMAIN || defaultConfig.authDomain,
  projectId: metaEnv.VITE_FIREBASE_PROJECT_ID || defaultConfig.projectId,
  storageBucket: metaEnv.VITE_FIREBASE_STORAGE_BUCKET || defaultConfig.storageBucket,
  messagingSenderId: metaEnv.VITE_FIREBASE_MESSAGING_SENDER_ID || defaultConfig.messagingSenderId,
  appId: metaEnv.VITE_FIREBASE_APP_ID || defaultConfig.appId,
  firestoreDatabaseId: metaEnv.VITE_FIREBASE_DATABASE_ID || defaultConfig.firestoreDatabaseId || '(default)'
};

const app = getApps().length > 0 ? getApp() : initializeApp(config);

const dbId = config.firestoreDatabaseId;

let dbInstance: Firestore;
try {
  if (dbId && dbId !== '(default)') {
    dbInstance = initializeFirestore(app, { localCache: memoryLocalCache() }, dbId);
  } else {
    dbInstance = initializeFirestore(app, { localCache: memoryLocalCache() });
  }
} catch {
  dbInstance = (dbId && dbId !== '(default)') ? getFirestore(app, dbId) : getFirestore(app);
}

export const db = dbInstance;
export const auth = getAuth(app);



