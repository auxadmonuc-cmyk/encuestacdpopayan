import * as XLSX from 'xlsx';
import { ParticipantResponse, QuestionDetail, FilterState, QuestionAnalysis, SurveySummary, SurveyType } from '../types/survey';

/**
 * Clean string headers and text
 */
function cleanStr(val: any): string {
  if (val === null || val === undefined) return '';
  return String(val).trim();
}

/**
 * Parse numeric values safely
 */
function parseNum(val: any): number {
  if (val === null || val === undefined || val === '') return 0;
  if (typeof val === 'number') return isNaN(val) ? 0 : val;
  const cleaned = String(val).replace(',', '.').trim();
  const parsed = parseFloat(cleaned);
  return isNaN(parsed) ? 0 : parsed;
}

/**
 * Robust helper to parse various date representations (JS Date, Excel Serial, Spanish DD/MM/YYYY)
 */
export function parseExcelDate(val: any): Date | null {
  if (val === null || val === undefined) return null;

  // If already a Date object
  if (val instanceof Date) {
    return isNaN(val.getTime()) ? null : val;
  }

  // If numeric (Excel serial number)
  if (typeof val === 'number') {
    const date = new Date(Math.round((val - 25569) * 86400 * 1000));
    return isNaN(date.getTime()) ? null : date;
  }

  // If string, let's clean it
  const str = String(val).trim();
  if (!str) return null;

  // If numeric string (e.g. "45100" or "45100.5")
  if (/^\d+(\.\d+)?$/.test(str)) {
    const num = parseFloat(str);
    const date = new Date(Math.round((num - 25569) * 86400 * 1000));
    return isNaN(date.getTime()) ? null : date;
  }

  // 1. Try parsing DD/MM/YYYY or DD-MM-YYYY (common Spanish Excel format)
  // Example: 25/06/2026 14:30:00 or 05-06-2026
  const matchDMY = str.match(/^(\d{1,2})[/-](\d{1,2})[/-](\d{4})(?:\s+(\d{1,2}):(\d{1,2})(?::(\d{1,2}))?)?/);
  if (matchDMY) {
    const day = parseInt(matchDMY[1], 10);
    const month = parseInt(matchDMY[2], 10);
    const year = parseInt(matchDMY[3], 10);
    const hour = matchDMY[4] ? parseInt(matchDMY[4], 10) : 0;
    const minute = matchDMY[5] ? parseInt(matchDMY[5], 10) : 0;
    const second = matchDMY[6] ? parseInt(matchDMY[6], 10) : 0;
    
    if (month >= 1 && month <= 12 && day >= 1 && day <= 31) {
      const date = new Date(year, month - 1, day, hour, minute, second);
      if (!isNaN(date.getTime())) return date;
    }
  }

  // 2. Try parsing YYYY/MM/DD or YYYY-MM-DD
  const matchYMD = str.match(/^(\d{4})[/-](\d{1,2})[/-](\d{1,2})(?:\s+(\d{1,2}):(\d{1,2})(?::(\d{1,2}))?)?/);
  if (matchYMD) {
    const year = parseInt(matchYMD[1], 10);
    const month = parseInt(matchYMD[2], 10);
    const day = parseInt(matchYMD[3], 10);
    const hour = matchYMD[4] ? parseInt(matchYMD[4], 10) : 0;
    const minute = matchYMD[5] ? parseInt(matchYMD[5], 10) : 0;
    const second = matchYMD[6] ? parseInt(matchYMD[6], 10) : 0;

    if (month >= 1 && month <= 12 && day >= 1 && day <= 31) {
      const date = new Date(year, month - 1, day, hour, minute, second);
      if (!isNaN(date.getTime())) return date;
    }
  }

  // Fallback to standard Date parsing
  const parsed = new Date(str);
  if (!isNaN(parsed.getTime())) return parsed;

  return null;
}

/**
 * Calculate duration in minutes between start and end times
 */
function calculateDuration(start: any, end: any): number {
  try {
    if (!start || !end) return 0;
    const startDate = parseExcelDate(start);
    const endDate = parseExcelDate(end);
    if (!startDate || !endDate) return 0;
    const diffMs = endDate.getTime() - startDate.getTime();
    return Math.max(0, Math.round((diffMs / (1000 * 60)) * 10) / 10);
  } catch {
    return 0;
  }
}

/**
 * Parse standard Spanish or numeric Likert answers to a scale of 1 to 5 or 1 to 10
 */
function parseLikertRating(val: any, scale: number = 5): number | null {
  if (val === null || val === undefined) return null;
  const str = String(val).trim();
  if (!str) return null;

  // 1. Check if it starts with or is a direct number
  const numMatch = str.match(/^(\d+)/);
  if (numMatch) {
    const num = parseInt(numMatch[1], 10);
    if (!isNaN(num) && num >= 1 && num <= 10) {
      return num;
    }
  }

  // 2. Try mapping common Spanish Likert text
  const lower = str.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();

  if (scale === 10) {
    if (lower.includes('totalmente de acuerdo') || lower.includes('muy de acuerdo') || lower.includes('completamente de acuerdo') || lower === 'si' || lower === 'siempre') {
      return 10;
    }
    if (lower.includes('de acuerdo') || lower.includes('deacuerdo') || lower === 'frecuentemente' || lower === 'casi siempre') {
      return 8;
    }
    if (lower.includes('ni de acuerdo') || lower.includes('neutral') || lower.includes('medio') || lower === 'algunas veces' || lower === 'a veces') {
      return 5;
    }
    if (lower.includes('en desacuerdo') || lower === 'raramente' || lower === 'casi nunca') {
      return 3;
    }
    if (lower.includes('totalmente en desacuerdo') || lower.includes('muy en desacuerdo') || lower === 'no' || lower === 'nunca') {
      return 1;
    }
  } else {
    if (lower.includes('totalmente de acuerdo') || lower.includes('muy de acuerdo') || lower.includes('completamente de acuerdo') || lower === 'si' || lower === 'siempre') {
      return 5;
    }
    if (lower.includes('de acuerdo') || lower.includes('deacuerdo') || lower === 'frecuentemente' || lower === 'casi siempre') {
      return 4;
    }
    if (lower.includes('ni de acuerdo') || lower.includes('neutral') || lower.includes('medio') || lower === 'algunas veces' || lower === 'a veces') {
      return 3;
    }
    if (lower.includes('en desacuerdo') || lower === 'raramente' || lower === 'casi nunca') {
      return 2;
    }
    if (lower.includes('totalmente en desacuerdo') || lower.includes('muy en desacuerdo') || lower === 'no' || lower === 'nunca') {
      return 1;
    }
  }

  return null;
}

/**
 * Helper to search row object for any value matching candidate key names or keywords
 */
function findRowValue(
  row: Record<string, any>,
  exactKeys: string[],
  keywords: string[]
): string {
  // 1. Try exact or near-exact keys
  for (const key of exactKeys) {
    if (row[key] !== undefined && row[key] !== null && String(row[key]).trim() !== '') {
      return String(row[key]).trim();
    }
  }

  // 2. Try searching all keys in row by normalized keyword
  const allKeys = Object.keys(row);
  for (const key of allKeys) {
    const keyNorm = key.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim();
    if (
      keyNorm.startsWith('puntos') || 
      keyNorm.startsWith('comentarios') || 
      keyNorm.startsWith('puntuacion') || 
      keyNorm.startsWith('puntaje')
    ) {
      continue;
    }
    for (const kw of keywords) {
      const kwNorm = kw.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim();
      if (keyNorm.includes(kwNorm)) {
        const val = row[key];
        if (val !== undefined && val !== null && String(val).trim() !== '') {
          return String(val).trim();
        }
      }
    }
  }

  return '';
}

/**
 * Extracts regional and city/sede/centro de distribución handling Microsoft Forms branching columns
 * (e.g., when "Sur", "Andes", "Centro", "Norte" are separate branching columns in the Excel spreadsheet)
 */
function extractRegionalAndCity(row: Record<string, any>): { regional: string; city: string } {
  let regional = '';
  let city = '';

  const knownRegionals = ['Sur', 'Andes', 'Centro', 'Norte'];

  // 1. Check explicit regional columns
  const rawRegionalVal = findRowValue(
    row,
    ['¿A qué regional pertenece?', '¿A que regional pertenece?', 'Regional', 'REGIONAL', 'Zona', 'Territorio'],
    ['regional', 'zona', 'territorio']
  );

  if (rawRegionalVal) {
    for (const r of knownRegionals) {
      if (rawRegionalVal.toLowerCase().includes(r.toLowerCase())) {
        regional = r;
        break;
      }
    }
    if (!regional) regional = rawRegionalVal;
  }

  // 2. Check branching columns (where column headers are "Sur", "Andes", "Centro", "Norte" or contain regional names)
  const allKeys = Object.keys(row);

  for (const regName of knownRegionals) {
    const regLower = regName.toLowerCase();

    for (const key of allKeys) {
      const keyLower = key.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim();
      if (
        keyLower.startsWith('puntos') || 
        keyLower.startsWith('comentarios') || 
        keyLower.startsWith('puntuacion') || 
        keyLower.startsWith('puntaje')
      ) {
        continue;
      }

      // Check if column key is associated with this region
      const isRegKey = 
        keyLower === regLower || 
        keyLower.includes(`(${regLower})`) || 
        keyLower.includes(`- ${regLower}`) || 
        keyLower.includes(`${regLower} -`) || 
        keyLower.includes(`regional ${regLower}`) ||
        keyLower.includes(`regional: ${regLower}`);

      if (isRegKey) {
        const val = cleanStr(row[key]);
        if (val) {
          if (!regional) {
            regional = regName;
          }
          // If the cell value is a city name (e.g., "Popayán", "DC Popayan", "Cali", "Yumbo", "Pasto") and not just repeating the region name
          if (val.toLowerCase() !== regLower && !val.toLowerCase().startsWith('regional')) {
            city = val;
          }
        }
      }
    }
  }

  // 3. If city is still empty, search for general city / centro de distribución columns
  if (!city) {
    city = findRowValue(
      row,
      [
        '¿A qué centro de distribución pertenece?',
        '¿A qué centro de distribucion pertenece?',
        '¿A que centro de distribucion pertenece?',
        '¿A qué ciudad o sede pertenece?',
        '¿A que ciudad o sede pertenece?',
        'Centro de distribución',
        'Centro de distribucion',
        'Centro de Distribución',
        'Centro de Distribucion',
        'Sede / Ciudad',
        'Ciudad / Sede',
        'Ciudad',
        'CIUDAD',
        'Sede',
        'SEDE',
        'DC',
        'CEDI',
        'Municipio',
        'Ubicación',
        'Agencia',
        'Sucursal',
        'Lugar',
        'City'
      ],
      ['centro de distribuc', 'distribucion', 'distribución', 'ciudad', 'sede', 'dc ', 'cedi', 'agencia', 'municipio', 'ubicacion', 'ubicación', 'sucursal']
    );
  }

  // 4. Fallbacks if needed
  if (!regional) regional = 'Sur';
  if (!city) city = 'Sin Especificar';

  return { regional, city };
}

/**
 * Extracts participant cargo handling branching cargo columns
 */
function extractCargo(row: Record<string, any>): string {
  let cargo = findRowValue(
    row,
    [
      '¿Cuál es su cargo?',
      '¿Cual es su cargo?',
      'Cargo Almacen',
      'Cargo Reparto',
      'Cargo Administrativo',
      'Cargo Operativo',
      'Cargo',
      'CARGO',
      'Puesto',
      'Rol',
      'Oficio',
      'Función'
    ],
    ['cargo', 'puesto', 'rol', 'oficio', 'funcion', 'función']
  );

  if (!cargo) {
    const allKeys = Object.keys(row);
    for (const k of allKeys) {
      const kLower = k.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
      if (kLower.includes('cargo') || kLower.includes('puesto') || kLower.includes('rol')) {
        const val = cleanStr(row[k]);
        if (val) {
          cargo = val;
          break;
        }
      }
    }
  }

  return cargo || 'Operativo';
}

export const CORE_EVALUATION_QUESTIONS_PRINCIPIOS = [
  '¿Qué significa "Soñar en grande" dentro de los principios de la compañía?',
  'Enfocarse en resultados extraordinarios implica principalmente:',
  '¿Qué significa liderar con el ejemplo y asumir la responsabilidad?',
  'Cuidar los costos rigurosamente significa:',
  'Según los principios de la compañía, "Nunca tomar atajos" significa:'
];

export const CORE_EVALUATION_QUESTIONS_AMBIENTE_SEGURO = [
  '¿Qué es la seguridad psicológica en un equipo de trabajo?',
  'Construir espacios psicológicamente seguros implica principalmente:',
  'La diversidad en un equipo se refiere a:',
  '¿Qué busca la inclusión dentro de la organización?',
  '¿Cuál es una acción concreta para construir espacios diversos?'
];

export const CORE_EVALUATION_QUESTIONS_JOB_DESCRIPTION = [
  '¿Qué significa la metodología 3R?',
  '¿Qué hace parte de la Responsabilidad en la metodología 3R?',
  '¿Cuál de las siguientes opciones es un ejemplo de Recurso dentro de las 3R?',
  '¿Para qué sirven las Job Description?',
  '¿En qué momentos se deben revisar las Job Description?'
];

export const CORE_EVALUATION_QUESTIONS_ENGAGEMENT = [
  'Considera que este es un lugar seguro para trabajar',
  'Considero que existe una cultura de reconocimiento entre mi equipo, compañeros y líder',
  'Cuenta con todos los recursos necesarios (ejemplo: capacitación, EPP, tiempo, etc.) para realizar el trabajo',
  'El personal de Logística del Centro de Distribución sigue todas las reglas y procedimientos de seguridad',
  'Estoy satisfecho(a) con la compañía como lugar de trabajo',
  'La comunicación en mi empresa es abierta y transparente, con diálogo bidireccional',
  'Los líderes de mi empresa comunican claramente el propósito y los objetivos a largo plazo',
  'Me siento motivado(a) a buscar mejores formas de hacer las cosas',
  'Me siento orgulloso(a) de trabajar en la compañía',
  'Me siento reconocido(a) por mi trabajo',
  'Mi jefe directo me proporciona retroalimentación periódica que me ayuda a desarrollarme',
  'Mi jefe directo refuerza el uso de prácticas de trabajo seguro',
  'Mi jefe inmediato crea un entorno seguro donde puedo expresar mis ideas libremente y con respeto',
  'Puedo denunciar prácticas poco éticas sin temor a represalias',
  'Puedo ser yo mismo(a) en el trabajo',
  'Recomendaría a mi jefe directo a otras personas',
  'Recomendaría mi empresa como un excelente lugar para trabajar',
  'Tengo impacto directo en el logro de mis objetivos',
  'Tengo la intención de permanecer en mi empresa durante al menos los próximos 12 meses',
  'Tengo suficientes oportunidades para aprender nuevas habilidades y crecer como profesional',
  'Todos los empleados, independientemente de sus diferencias, reciben un trato justo'
];

export const CORE_EVALUATION_QUESTIONS = CORE_EVALUATION_QUESTIONS_PRINCIPIOS;

const CORE_QUESTION_DEFINITIONS_PRINCIPIOS = [
  {
    canonicalText: '¿Qué significa "Soñar en grande" dentro de los principios de la compañía?',
    keywords: ['soñar en grande', 'sonar en grande', 'soñar', 'sonar']
  },
  {
    canonicalText: 'Enfocarse en resultados extraordinarios implica principalmente:',
    keywords: ['resultados extraordinarios', 'extraordinarios', 'enfocarse en resultados']
  },
  {
    canonicalText: '¿Qué significa liderar con el ejemplo y asumir la responsabilidad?',
    keywords: ['liderar con el ejemplo', 'asumir la responsabilidad', 'liderar con ejemplo']
  },
  {
    canonicalText: 'Cuidar los costos rigurosamente significa:',
    keywords: ['cuidar los costos', 'costos rigurosamente', 'cuidar costos']
  },
  {
    canonicalText: 'Según los principios de la compañía, "Nunca tomar atajos" significa:',
    keywords: ['nunca tomar atajos', 'tomar atajos', 'nunca tomar']
  }
];

const CORE_QUESTION_DEFINITIONS_AMBIENTE_SEGURO = [
  {
    canonicalText: '¿Qué es la seguridad psicológica en un equipo de trabajo?',
    keywords: [
      'seguridad psicologica',
      'seguridad psicológica',
      'seguridad psicologica en un equipo',
      'equipo de trabajo',
      'expresar ideas sin temor',
      'humillaciones o represalias'
    ]
  },
  {
    canonicalText: 'Construir espacios psicológicamente seguros implica principalmente:',
    keywords: [
      'espacios psicologicamente',
      'espacios psicológicamente',
      'psicologicamente seguros',
      'psicológicamente seguros',
      'construir espacios',
      'generar confianza'
    ]
  },
  {
    canonicalText: 'La diversidad en un equipo se refiere a:',
    keywords: [
      'diversidad en un equipo',
      'la diversidad en un equipo',
      'diversidad',
      'diferencias demograficas',
      'diferencias demográficas'
    ]
  },
  {
    canonicalText: '¿Qué busca la inclusión dentro de la organización?',
    keywords: [
      'busca la inclusion',
      'busca la inclusión',
      'inclusion dentro',
      'inclusión dentro',
      'garantizar que todas las personas se sientan valoradas',
      'que busca la inclusion',
      'que busca la inclusión'
    ]
  },
  {
    canonicalText: '¿Cuál es una acción concreta para construir espacios diversos?',
    keywords: [
      'accion concreta',
      'acción concreta',
      'espacios diversos',
      'construir espacios diversos',
      'acciones concretas'
    ]
  }
];

const CORE_QUESTION_DEFINITIONS_JOB_DESCRIPTION = [
  {
    canonicalText: '¿Qué significa la metodología 3R?',
    keywords: [
      'metodologia 3r',
      'metodología 3r',
      'significa la metodologia 3r',
      'significa la 3r',
      'significa 3r'
    ]
  },
  {
    canonicalText: '¿Qué hace parte de la Responsabilidad en la metodología 3R?',
    keywords: [
      'hace parte de la responsabilidad',
      'responsabilidad en la metodologia',
      'responsabilidad 3r',
      'parte de la responsabilidad en la metodologia'
    ]
  },
  {
    canonicalText: '¿Cuál de las siguientes opciones es un ejemplo de Recurso dentro de las 3R?',
    keywords: [
      'ejemplo de recurso',
      'recurso dentro de las 3r',
      'recurso 3r',
      'ejemplo de recurso dentro'
    ]
  },
  {
    canonicalText: '¿Para qué sirven las Job Description?',
    keywords: [
      'para que sirven las job description',
      'para que sirven las job',
      'sirven las job description',
      'sirven job description'
    ]
  },
  {
    canonicalText: '¿En qué momentos se deben revisar las Job Description?',
    keywords: [
      'momentos se deben revisar',
      'revisar las job description',
      'se deben revisar las job description',
      'momentos se deben revisar job description'
    ]
  }
];

const CORE_QUESTION_DEFINITIONS_ENGAGEMENT = [
  {
    canonicalText: 'Considera que este es un lugar seguro para trabajar',
    keywords: ['lugar seguro para trabajar', 'lugar seguro', 'seguro para trabajar']
  },
  {
    canonicalText: 'Considero que existe una cultura de reconocimiento entre mi equipo, compañeros y líder',
    keywords: ['cultura de reconocimiento', 'reconocimiento entre mi equipo', 'reconocimiento compañeros y lider']
  },
  {
    canonicalText: 'Cuenta con todos los recursos necesarios (ejemplo: capacitación, EPP, tiempo, etc.) para realizar el trabajo',
    keywords: ['recursos necesarios', 'capacitacion, epp', 'capacitación, epp', 'realizar el trabajo']
  },
  {
    canonicalText: 'El personal de Logística del Centro de Distribución sigue todas las reglas y procedimientos de seguridad',
    keywords: ['personal de logistica', 'centro de distribucion sigue', 'reglas y procedimientos de seguridad']
  },
  {
    canonicalText: 'Estoy satisfecho(a) con la compañía como lugar de trabajo',
    keywords: ['satisfecho con la compañia', 'satisfecho con la compañía', 'compañia como lugar', 'compañía como lugar', 'satisfecho(a) con la compañía']
  },
  {
    canonicalText: 'La comunicación en mi empresa es abierta y transparente, con diálogo bidireccional',
    keywords: ['comunicacion en mi empresa', 'comunicación en mi empresa', 'abierta y transparente', 'dialogo bidireccional', 'diálogo bidireccional']
  },
  {
    canonicalText: 'Los líderes de mi empresa comunican claramente el propósito y los objetivos a largo plazo',
    keywords: ['lideres de mi empresa', 'líderes de mi empresa', 'proposito y los objetivos', 'propósito y los objetivos', 'largo plazo']
  },
  {
    canonicalText: 'Me siento motivado(a) a buscar mejores formas de hacer las cosas',
    keywords: ['motivado a buscar', 'mejores formas de hacer', 'hacer las cosas', 'me siento motivado']
  },
  {
    canonicalText: 'Me siento orgulloso(a) de trabajar en la compañía',
    keywords: ['orgulloso de trabajar', 'orgulloso en la compañia', 'orgullosa de trabajar', 'orgullosa en la compañía', 'me siento orgulloso']
  },
  {
    canonicalText: 'Me siento reconocido(a) por mi trabajo',
    keywords: ['reconocido por mi trabajo', 'reconocida por mi trabajo', 'reconocido por mi', 'me siento reconocido']
  },
  {
    canonicalText: 'Mi jefe directo me proporciona retroalimentación periódica que me ayuda a desarrollarme',
    keywords: ['retroalimentacion periodica', 'retroalimentación periódica', 'ayuda a desarrollarme', 'mi jefe directo me proporciona']
  },
  {
    canonicalText: 'Mi jefe directo refuerza el uso de prácticas de trabajo seguro',
    keywords: ['refuerza el uso de', 'practicas de trabajo seguro', 'prácticas de trabajo seguro', 'mi jefe directo refuerza']
  },
  {
    canonicalText: 'Mi jefe inmediato crea un entorno seguro donde puedo expresar mis ideas libremente y con respeto',
    keywords: ['mi jefe inmediato crea', 'expresar mis ideas', 'libremente y con respeto', 'ideas libremente']
  },
  {
    canonicalText: 'Puedo denunciar prácticas poco éticas sin temor a represalias',
    keywords: ['denunciar practicas', 'denunciar prácticas', 'poco eticas', 'poco éticas', 'temor a represalias']
  },
  {
    canonicalText: 'Puedo ser yo mismo(a) en el trabajo',
    keywords: ['ser yo mismo', 'ser yo misma', 'yo mismo en el trabajo']
  },
  {
    canonicalText: 'Recomendaría a mi jefe directo a otras personas',
    keywords: ['recomendaria a mi jefe', 'recomendaría a mi jefe', 'jefe directo a otras', 'recomendaría a mi jefe directo']
  },
  {
    canonicalText: 'Recomendaría mi empresa como un excelente lugar para trabajar',
    keywords: ['recomendaria mi empresa', 'recomendaría mi empresa', 'excelente lugar para trabajar']
  },
  {
    canonicalText: 'Tengo impacto directo en el logro de mis objetivos',
    keywords: ['impacto directo en el', 'logro de mis objetivos', 'impacto directo']
  },
  {
    canonicalText: 'Tengo la intención de permanecer en mi empresa durante al menos los próximos 12 meses',
    keywords: ['intencion de permanecer', 'intención de permanecer', 'proximos 12 meses', 'próximos 12 meses', 'permanecer en mi empresa']
  },
  {
    canonicalText: 'Tengo suficientes oportunidades para aprender nuevas habilidades y crecer como profesional',
    keywords: ['oportunidades para aprender', 'aprender nuevas habilidades', 'crecer como profesional']
  },
  {
    canonicalText: 'Todos los empleados, independientemente de sus diferencias, reciben un trato justo',
    keywords: ['independientemente de sus diferencias', 'reciben un trato justo', 'todos los empleados']
  }
];

const matchCoreQuestionCache = new Map<string, string | null>();

function matchCoreQuestion(text: string, surveyType: SurveyType = 'principios'): string | null {
  if (!text) return null;

  const cacheKey = `${surveyType}:${text}`;
  if (matchCoreQuestionCache.has(cacheKey)) {
    return matchCoreQuestionCache.get(cacheKey)!;
  }

  const cleanedText = text
    .replace(/^(puntos|puntuación|puntuacion|puntaje)[:\s-]*/i, '')
    .replace(/^(\d+[\.\)\s-]*)+/g, '')
    .trim();

  const norm = cleanedText.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');

  const definitions = surveyType === 'job_description'
    ? CORE_QUESTION_DEFINITIONS_JOB_DESCRIPTION
    : surveyType === 'ambiente_seguro' 
    ? CORE_QUESTION_DEFINITIONS_AMBIENTE_SEGURO 
    : surveyType === 'engagement'
    ? CORE_QUESTION_DEFINITIONS_ENGAGEMENT
    : CORE_QUESTION_DEFINITIONS_PRINCIPIOS;

  let bestMatch: { canonicalText: string; score: number } | null = null;

  const checkDefs = (defsArray: typeof definitions) => {
    for (const item of defsArray) {
      const canonNorm = item.canonicalText.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[¿?]/g, '').trim();
      const normNoQ = norm.replace(/[¿?]/g, '').trim();

      // Highest score: canonical text containment or exact match
      if (normNoQ.includes(canonNorm) || canonNorm.includes(normNoQ)) {
        const score = 1000 + canonNorm.length;
        if (!bestMatch || score > bestMatch.score) {
          bestMatch = { canonicalText: item.canonicalText, score };
        }
      }

      // Keyword match (scored by length of keyword)
      for (const kw of item.keywords) {
        const kwNorm = kw.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
        if (norm.includes(kwNorm)) {
          const score = kwNorm.length;
          if (!bestMatch || score > bestMatch.score) {
            bestMatch = { canonicalText: item.canonicalText, score };
          }
        }
      }
    }
  };

  checkDefs(definitions);

  const result = bestMatch ? bestMatch.canonicalText : null;
  matchCoreQuestionCache.set(cacheKey, result);
  return result;
}

export function parseExcelData(
  fileBuffer: ArrayBuffer, 
  passingThresholdPercent: number = 70,
  targetSurveyType: SurveyType = 'principios'
): {
  responses: ParticipantResponse[];
  questionsList: string[];
  maxPossiblePoints: number;
} {
  const workbook = XLSX.read(fileBuffer, { type: 'array', cellDates: true });
  const sheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];
  
  if (!worksheet) {
    throw new Error('El archivo Excel no contiene hojas válidas.');
  }

  const rawRows: Record<string, any>[] = XLSX.utils.sheet_to_json(worksheet, { defval: '' });

  if (!rawRows || rawRows.length === 0) {
    throw new Error('El archivo Excel no contiene datos o filas.');
  }

  // Identify all headers in the dataset
  const sampleRow = rawRows[0];
  const headers = Object.keys(sampleRow);

  // Auto detect survey type using a high-precision scoring system to avoid false positives (e.g. matching "job description" cargo columns)
  const scoreSurveyType = (defs: { canonicalText: string; keywords: string[] }[]) => {
    let score = 0;
    defs.forEach(def => {
      const canonNorm = def.canonicalText.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[¿?]/g, '').trim();
      
      const hasDirectHeader = headers.some(h => {
        const hLower = h.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[¿?]/g, '').trim();
        return hLower.includes(canonNorm) || canonNorm.includes(hLower);
      });
      if (hasDirectHeader) {
        score += 10;
      }

      const hasKeyword = def.keywords.some(kw => {
        const kwNorm = kw.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim();
        return headers.some(h => {
          const hLower = h.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim();
          // Skip matching if it's just a common "Cargo" role column (often labeled exactly "Job Description" or "Cargo/Job Description")
          if (kwNorm === 'job description') {
            const isCargoCol = hLower === 'job description' || hLower === 'jobdescription' || hLower === 'cargo' || hLower === 'cargo/job description' || hLower === 'cargo (job description)';
            if (isCargoCol) return false;
          }
          return hLower.includes(kwNorm);
        });
      });
      if (hasKeyword) {
        score += 3;
      }
    });
    return score;
  };

  const scores = {
    principios: scoreSurveyType(CORE_QUESTION_DEFINITIONS_PRINCIPIOS),
    job_description: scoreSurveyType(CORE_QUESTION_DEFINITIONS_JOB_DESCRIPTION),
    ambiente_seguro: scoreSurveyType(CORE_QUESTION_DEFINITIONS_AMBIENTE_SEGURO),
    engagement: scoreSurveyType(CORE_QUESTION_DEFINITIONS_ENGAGEMENT)
  };

  let detectedSurveyType: SurveyType = targetSurveyType;
  let highestScoreType: SurveyType = targetSurveyType;
  let maxScore = 0;

  Object.entries(scores).forEach(([type, score]) => {
    if (score > maxScore) {
      maxScore = score;
      highestScoreType = type as SurveyType;
    }
  });

  // Only override targetSurveyType if targetSurveyType has absolutely 0 match in the file.
  if (maxScore > 0) {
    if (scores[targetSurveyType] === 0) {
      detectedSurveyType = highestScoreType;
    }
  }

  const activeQuestionDefs = detectedSurveyType === 'job_description'
    ? CORE_QUESTION_DEFINITIONS_JOB_DESCRIPTION
    : detectedSurveyType === 'ambiente_seguro' 
    ? CORE_QUESTION_DEFINITIONS_AMBIENTE_SEGURO 
    : detectedSurveyType === 'engagement'
    ? CORE_QUESTION_DEFINITIONS_ENGAGEMENT
    : CORE_QUESTION_DEFINITIONS_PRINCIPIOS;

  // Create mapping of Question Text -> Point Column Header & Answer Header
  interface MappedQuestion {
    canonicalText: string;
    directHeader: string;
    pointsHeader: string;
    commentsHeader: string;
  }
  const questionMap: MappedQuestion[] = [];

  // First try core question definitions
  activeQuestionDefs.forEach(coreDef => {
    const canonicalText = coreDef.canonicalText;

    // 1. Look for a score header ("Puntos: ...", "Puntuación: ...", "Puntos - ...", "Puntaje ...")
    const matchedScoreHeader = headers.find(h => {
      const hLower = h.toLowerCase().trim();
      const isScore = hLower.startsWith('puntos') || 
                      hLower.startsWith('puntuación') ||
                      hLower.startsWith('puntuacion') ||
                      hLower.startsWith('puntaje');
      if (!isScore) return false;
      const qText = h.replace(/^(puntos|puntuación|puntuacion|puntaje)[:\s-]*/i, '').trim();
      return matchCoreQuestion(qText, detectedSurveyType) === canonicalText;
    });

    // 2. Look for a direct header (question answer text column)
    const matchedDirectHeader = headers.find(h => {
      const hLower = h.toLowerCase().trim();
      const isScore = hLower.startsWith('puntos') || 
                      hLower.startsWith('puntuación') ||
                      hLower.startsWith('puntuacion') ||
                      hLower.startsWith('puntaje');
      if (isScore) return false;
      return matchCoreQuestion(h, detectedSurveyType) === canonicalText;
    });

    // Look for comments column
    const commentsHeader = headers.find(h => {
      const hLower = h.toLowerCase();
      return hLower.startsWith('comentario') && coreDef.keywords.some(kw => hLower.includes(kw));
    }) || '';

    if (matchedDirectHeader || matchedScoreHeader) {
      questionMap.push({
        canonicalText,
        directHeader: matchedDirectHeader || matchedScoreHeader || canonicalText,
        pointsHeader: matchedScoreHeader || '',
        commentsHeader
      });
    } else {
      // Fallback search for header containing any keyword of this question
      const fallbackHeader = headers.find(h => {
        const hLower = h.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim();
        if (
          hLower.startsWith('puntos') || 
          hLower.startsWith('comentarios') || 
          hLower.startsWith('puntuacion') || 
          hLower.startsWith('puntaje')
        ) return false;

        return coreDef.keywords.some(kw => {
          const kwNorm = kw.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
          return hLower.includes(kwNorm);
        });
      });

      if (fallbackHeader) {
        questionMap.push({
          canonicalText,
          directHeader: fallbackHeader,
          pointsHeader: '',
          commentsHeader
        });
      } else {
        questionMap.push({
          canonicalText,
          directHeader: canonicalText,
          pointsHeader: '',
          commentsHeader: ''
        });
      }
    }
  });

  // If questionMap is empty (unrecognized column titles), fallback to searching for any question headers
  if (questionMap.length === 0) {
    headers.forEach(h => {
      const hClean = h.trim();
      const hLower = hClean.toLowerCase();
      const isScore = hLower.startsWith('puntos') || hLower.startsWith('puntuación') || hLower.startsWith('puntuacion') || hLower.startsWith('puntaje');
      if (isScore) return;

      const isQuestion = hClean.startsWith('¿') || hLower.startsWith('en una escala') || hLower.startsWith('qué ') || hLower.startsWith('que ');
      const isMeta = hLower.includes('regional') || hLower.includes('operador') || hLower.includes('cargo') || hLower.includes('nombre') || hLower.includes('correo') || hLower.includes('identificación') || hLower.includes('fecha') || hLower.includes('hora') || hLower.includes('política');
      
      if (isQuestion && !isMeta) {
        const matchingScore = headers.find(sh => {
          const shLower = sh.toLowerCase().trim();
          if (!shLower.startsWith('puntos') && !shLower.startsWith('puntuación') && !shLower.startsWith('puntuacion') && !shLower.startsWith('puntaje')) return false;
          return sh.replace(/^(puntos|puntuación|puntuacion|puntaje)[:\s-]*/i, '').trim().toLowerCase() === hClean.toLowerCase();
        }) || '';

        questionMap.push({
          canonicalText: hClean,
          directHeader: hClean,
          pointsHeader: matchingScore,
          commentsHeader: ''
        });
      }
    });
  }

  // If engagement, let's auto-detect the rating scale (5 vs 10) by checking the answers, defaulting to 10
  let engagementScale = 10;
  if (detectedSurveyType === 'engagement') {
    let hasRatingGreaterThan5 = false;
    let hasAnyRating = false;
    for (let rIndex = 0; rIndex < rawRows.length; rIndex++) {
      const row = rawRows[rIndex];
      for (let qIndex = 0; qIndex < questionMap.length; qIndex++) {
        const q = questionMap[qIndex];
        const val = row[q.directHeader] || row[q.canonicalText];
        if (val !== undefined && val !== null) {
          const str = String(val).trim();
          const match = str.match(/^(\d+)/);
          if (match) {
            hasAnyRating = true;
            const num = parseInt(match[1], 10);
            if (num > 5 && num <= 10) {
              hasRatingGreaterThan5 = true;
              break;
            }
          }
        }
      }
      if (hasRatingGreaterThan5) {
        break;
      }
    }
    if (hasAnyRating && !hasRatingGreaterThan5) {
      engagementScale = 5;
    } else {
      engagementScale = 10;
    }
  }

  // Pre-resolve metadata column headers to avoid O(N * Keys * Keywords) regular expressions per row
  const findHeaderName = (exactKeys: string[], keywords: string[]): string => {
    for (const key of exactKeys) {
      const found = headers.find(h => h.trim() === key);
      if (found) return found;
    }
    for (const key of exactKeys) {
      const keyNorm = key.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim();
      const found = headers.find(h => h.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim() === keyNorm);
      if (found) return found;
    }
    for (const kw of keywords) {
      const kwNorm = kw.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim();
      const found = headers.find(h => {
        const hNorm = h.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim();
        if (hNorm.startsWith('puntos') || hNorm.startsWith('comentarios') || hNorm.startsWith('puntuacion') || hNorm.startsWith('puntaje')) return false;
        return hNorm.includes(kwNorm);
      });
      if (found) return found;
    }
    return '';
  };

  const resolvedOperatorHeader = findHeaderName(
    ['¿A qué operador pertenece?', '¿A que operador pertenece?', 'Operador', 'OPERADOR', 'Empresa', 'Contratista', 'Compañía', 'Compañia'],
    ['operador', 'empresa', 'contratista', 'compañia', 'compañía']
  );

  const resolvedCargoHeader = findHeaderName(
    [
      '¿Cuál es su cargo?',
      '¿Cual es su cargo?',
      'Cargo Almacen',
      'Cargo Reparto',
      'Cargo Administrativo',
      'Cargo Operativo',
      'Cargo',
      'CARGO',
      'Puesto',
      'Rol',
      'Oficio',
      'Función'
    ],
    ['cargo', 'puesto', 'rol', 'oficio', 'funcion', 'función']
  );

  const resolvedTrainingTypeHeader = findHeaderName(
    ['Tipo de entrenamiento', 'Tipo de capacitación', 'Tipo de capacitacion', 'Tipo de formación', 'Capacitación', 'Entrenamiento', 'Modalidad', 'Tipo de ingreso', 'Tipo'],
    ['tipo', 'entrenamiento', 'capacitacion', 'formacion', 'modalidad', 'reentrenamiento', 'inicial']
  );

  const resolvedStartTimeHeader = headers.find(h => h.trim() === 'Hora de inicio' || h.trim() === 'Start time' || h.trim() === 'Fecha') || '';
  const resolvedEndTimeHeader = headers.find(h => h.trim() === 'Hora de finalización' || h.trim() === 'Completion time') || '';

  const resolvedYearHeader = headers.find(h => h.trim() === 'Año' || h.trim() === 'Anio' || h.trim() === 'Year') || '';
  const resolvedMonthHeader = headers.find(h => h.trim() === 'Mes' || h.trim() === 'Month') || '';

  const resolvedExplicitTotalPtsHeader = headers.find(h => h.trim() === 'Total de puntos' || h.trim() === 'Puntos' || h.trim() === 'Puntuación' || h.trim() === 'Puntuacion' || h.trim() === 'Puntaje Total') || '';

  const resolvedGeneralCommentsHeader = headers.find(h => h.trim() === 'Comentarios del cuestionario') || '';

  const resolvedRegionalHeader = findHeaderName(
    ['¿A qué regional pertenece?', '¿A que regional pertenece?', 'Regional', 'REGIONAL', 'Zona', 'Territorio'],
    ['regional', 'zona', 'territorio']
  );

  const branchingRegionalHeaders: { regName: string; header: string }[] = [];
  const knownRegionals = ['Sur', 'Andes', 'Centro', 'Norte'];
  knownRegionals.forEach(regName => {
    const regLower = regName.toLowerCase();
    const foundHeader = headers.find(h => {
      const keyLower = h.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim();
      if (
        keyLower.startsWith('puntos') || 
        keyLower.startsWith('comentarios') || 
        keyLower.startsWith('puntuacion') || 
        keyLower.startsWith('puntaje')
      ) {
        return false;
      }
      return (
        keyLower === regLower || 
        keyLower.includes(`(${regLower})`) || 
        keyLower.includes(`- ${regLower}`) || 
        keyLower.includes(`${regLower} -`) || 
        keyLower.includes(`regional ${regLower}`) ||
        keyLower.includes(`regional: ${regLower}`)
      );
    });
    if (foundHeader) {
      branchingRegionalHeaders.push({ regName, header: foundHeader });
    }
  });

  const resolvedCityHeader = findHeaderName(
    [
      '¿A qué Sede pertenece?',
      '¿A que Sede pertenece?',
      '¿A qué sede pertenece?',
      '¿A que sede pertenece?',
      'Sede / Centro de Distribución',
      'Sede/Centro de Distribución',
      'Sede / Centro de Distribucion',
      'Sede/Centro de Distribucion',
      'Ciudad / Sede',
      'Ciudad',
      'CIUDAD',
      'Sede',
      'SEDE',
      'DC',
      'CEDI',
      'Municipio',
      'Ubicación',
      'Agencia',
      'Sucursal',
      'Lugar',
      'City'
    ],
    ['centro de distribuc', 'distribucion', 'distribución', 'ciudad', 'sede', 'dc ', 'cedi', 'agencia', 'municipio', 'ubicacion', 'ubicación', 'sucursal']
  );

  // Calculate Max Possible Points per Question across the dataset
  const maxPointsPerQuestion: Record<string, number> = {};
  questionMap.forEach(q => {
    if (detectedSurveyType === 'engagement') {
      maxPointsPerQuestion[q.canonicalText] = engagementScale;
    } else {
      let maxFound = 0;
      if (q.pointsHeader) {
        rawRows.forEach(row => {
          const pts = parseNum(row[q.pointsHeader]);
          if (pts > maxFound) maxFound = pts;
        });
      }
      const defaultPerQ = Math.round(100 / Math.max(1, questionMap.length));
      maxPointsPerQuestion[q.canonicalText] = maxFound > 0 ? maxFound : defaultPerQ;
    }
  });

  const responses: ParticipantResponse[] = rawRows.map((row, index) => {
    const id = row['ID'] || row['id'] || row['Id'] || (index + 1);
    
    const isEng = detectedSurveyType === 'engagement';

    // Name resolution
    const name = isEng 
      ? `Participante Anónimo #${index + 1}`
      : cleanStr(
          row['Primer nombre y apellido'] || 
          row['Nombre'] || 
          row['Nombre completo'] || 
          row['Correo electrónico'] || 
          `Participante ${index + 1}`
        );

    const email = isEng ? 'Anónimo' : cleanStr(row['Correo electrónico'] || row['Correo'] || row['Email'] || '');
    const identification = isEng ? 'Anónimo' : cleanStr(row['Identificación'] || row['Cédula'] || row['Documento'] || row['ID'] || '');

    // Regional and City resolution in O(1)
    let regional = '';
    let city = '';

    if (resolvedRegionalHeader && row[resolvedRegionalHeader]) {
      const rawRegionalVal = String(row[resolvedRegionalHeader]).trim();
      for (const r of knownRegionals) {
        if (rawRegionalVal.toLowerCase().includes(r.toLowerCase())) {
          regional = r;
          break;
        }
      }
      if (!regional) regional = rawRegionalVal;
    }

    // Branching columns
    for (const b of branchingRegionalHeaders) {
      const val = cleanStr(row[b.header]);
      if (val) {
        if (!regional) {
          regional = b.regName;
        }
        if (val.toLowerCase() !== b.regName.toLowerCase() && !val.toLowerCase().startsWith('regional')) {
          city = val;
        }
      }
    }

    if (!city && resolvedCityHeader && row[resolvedCityHeader]) {
      city = cleanStr(row[resolvedCityHeader]);
    }

    if (!regional) regional = 'Sur';
    if (!city) city = 'Sin Especificar';

    // Operator resolution in O(1)
    let operator = 'Bavaria Directo';
    if (resolvedOperatorHeader && row[resolvedOperatorHeader]) {
      operator = cleanStr(row[resolvedOperatorHeader]);
    }

    // Cargo resolution in O(1)
    let cargo = 'Operativo';
    if (resolvedCargoHeader && row[resolvedCargoHeader]) {
      cargo = cleanStr(row[resolvedCargoHeader]);
    } else {
      const fallbackCargoHeader = headers.find(k => {
        const kLower = k.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
        return kLower.includes('cargo') || kLower.includes('puesto') || kLower.includes('rol');
      });
      if (fallbackCargoHeader && row[fallbackCargoHeader]) {
        cargo = cleanStr(row[fallbackCargoHeader]);
      }
    }

    // Training type (Inicial vs Reentrenamiento) in O(1)
    let trainingType = 'Inicial';
    if (resolvedTrainingTypeHeader && row[resolvedTrainingTypeHeader]) {
      const ttValue = cleanStr(row[resolvedTrainingTypeHeader]);
      if (ttValue.toLowerCase().includes('reentrenam') || ttValue.toLowerCase().includes('re-entrenam')) {
        trainingType = 'Reentrenamiento';
      } else {
        trainingType = 'Inicial';
      }
    } else {
      const allVals = Object.values(row).map(v => cleanStr(v).toLowerCase());
      if (allVals.some(v => v.includes('reentrenam') || v.includes('re-entrenam'))) {
        trainingType = 'Reentrenamiento';
      }
    }

    // Timestamps
    const rawStartTime = resolvedStartTimeHeader ? row[resolvedStartTimeHeader] || '' : '';
    const rawEndTime = resolvedEndTimeHeader ? row[resolvedEndTimeHeader] || '' : '';

    const parsedStart = parseExcelDate(rawStartTime);
    const parsedEnd = parseExcelDate(rawEndTime);

    const formatDateForDisplay = (d: Date | null, original: string) => {
      if (!d) return original;
      const pad = (n: number) => String(n).padStart(2, '0');
      return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
    };

    const startTime = formatDateForDisplay(parsedStart, cleanStr(rawStartTime));
    const endTime = formatDateForDisplay(parsedEnd, cleanStr(rawEndTime));
    const durationMinutes = calculateDuration(rawStartTime, rawEndTime);

    // Year & Month resolution
    const SPANISH_MONTHS = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
    let year = resolvedYearHeader ? cleanStr(row[resolvedYearHeader]) : '';
    let month = resolvedMonthHeader ? cleanStr(row[resolvedMonthHeader]) : '';

    if (!year || !month) {
      const dateObj = parsedStart || parsedEnd || new Date();
      if (!year) year = dateObj.getFullYear().toString();
      if (!month) month = SPANISH_MONTHS[dateObj.getMonth()];
    }

    // Explicit total score from column if present
    const explicitTotalPts = resolvedExplicitTotalPtsHeader ? parseNum(row[resolvedExplicitTotalPtsHeader]) : 0;

    // Question details extraction
    const questions: QuestionDetail[] = [];
    let sumScoreFromPointsHeaders = 0;
    let maxPointsTotalCalculated = 0;
    let explicitScoreColumnsCount = 0;

    questionMap.forEach((q, qIndex) => {
      const maxPts = maxPointsPerQuestion[q.canonicalText] || 20;
      maxPointsTotalCalculated += maxPts;

      const rawUserAns = cleanStr(row[q.directHeader] || row[q.canonicalText] || row[q.commentsHeader]);
      const comments = cleanStr(row[q.commentsHeader]);

      let ptsObtained = 0;
      let hasExplicitScore = false;

      if (q.pointsHeader && row[q.pointsHeader] !== undefined && row[q.pointsHeader] !== '') {
        ptsObtained = parseNum(row[q.pointsHeader]);
        hasExplicitScore = true;
        explicitScoreColumnsCount++;
      } else if (detectedSurveyType === 'engagement') {
        const parsedRating = parseLikertRating(rawUserAns, engagementScale);
        if (parsedRating !== null) {
          ptsObtained = parsedRating;
          hasExplicitScore = true;
          explicitScoreColumnsCount++;
        } else {
          ptsObtained = maxPts;
          hasExplicitScore = true;
          explicitScoreColumnsCount++;
        }
      }

      const isCorrectValue = detectedSurveyType === 'engagement'
        ? (maxPts === 10 ? ptsObtained >= 7 : ptsObtained >= 4)
        : (hasExplicitScore ? ptsObtained >= maxPts * 0.8 : true);

      questions.push({
        id: `q_${qIndex}`,
        questionText: q.canonicalText,
        pointsObtained: hasExplicitScore ? ptsObtained : maxPts,
        maxPoints: maxPts,
        userAnswer: rawUserAns || 'Respuesta Registrada',
        comments,
        isCorrect: isCorrectValue
      });

      sumScoreFromPointsHeaders += ptsObtained;
    });

    const maxPointsPossible = maxPointsTotalCalculated > 0 ? maxPointsTotalCalculated : 100;
    const totalPoints = explicitTotalPts > 0 
      ? explicitTotalPts 
      : (explicitScoreColumnsCount > 0 ? sumScoreFromPointsHeaders : maxPointsPossible);

    const scorePercentage = Math.min(100, Math.round((totalPoints / maxPointsPossible) * 100));

    // Reconcile individual question states if totalPoints < maxPointsPossible
    if (explicitScoreColumnsCount === 0 && scorePercentage < 100 && questions.length > 0) {
      const ptsNeededToDeduct = maxPointsPossible - totalPoints;
      let ptsDeductedSoFar = 0;

      for (let i = questions.length - 1; i >= 0; i--) {
        if (ptsDeductedSoFar >= ptsNeededToDeduct) break;
        const q = questions[i];
        const deduct = Math.min(q.maxPoints, ptsNeededToDeduct - ptsDeductedSoFar);
        q.pointsObtained = Math.max(0, q.maxPoints - deduct);
        q.isCorrect = q.pointsObtained >= q.maxPoints * 0.8;
        ptsDeductedSoFar += deduct;
      }
    }

    const passed = detectedSurveyType === 'engagement'
      ? scorePercentage >= 70
      : (totalPoints >= maxPointsPossible || scorePercentage >= 100);

    // Satisfaction extraction from row
    let satisfactionRating = 0;
    const satValue = findRowValue(
      row,
      [
        '¿Qué tan satisfecho estás con el entrenamiento recibido contemplando el entrenador, material y estrategia de aprendizaje?',
        '¿Cómo califica la capacitación?',
        '¿Cómo califica la capacitacion?',
        '¿Qué tan satisfecho se encuentra con la capacitación?',
        'Satisfacción',
        'Satisfaccion',
        'NPS',
        'Calificación',
        'Calificacion',
        'Evaluación del facilitador',
        'Puntaje de satisfacción'
      ],
      ['satisfacc', 'satisfech', 'califica', 'nps', 'recomenda', 'facilitador']
    );

    if (satValue) {
      const numSat = parseNum(satValue);
      if (numSat >= 1 && numSat <= 10) {
        satisfactionRating = numSat;
      } else {
        const satLower = satValue.toLowerCase();
        if (satLower.includes('excelente') || satLower.includes('muy buen')) satisfactionRating = 10;
        else if (satLower.includes('bueno') || satLower.includes('buena')) satisfactionRating = 8;
        else if (satLower.includes('regular') || satLower.includes('aceptable')) satisfactionRating = 6;
        else if (satLower.includes('malo') || satLower.includes('mala') || satLower.includes('deficiente')) satisfactionRating = 4;
      }
    }

    let statusType: 'PROMOTOR' | 'NEUTRO' | 'DETRACTOR';
    if (satisfactionRating > 0) {
      if (satisfactionRating >= 9) statusType = 'PROMOTOR';
      else if (satisfactionRating >= 7) statusType = 'NEUTRO';
      else statusType = 'DETRACTOR';
    } else {
      statusType = scorePercentage >= 90 ? 'PROMOTOR' : scorePercentage >= 70 ? 'NEUTRO' : 'DETRACTOR';
    }

    const generalComments = cleanStr(row['Comentarios del cuestionario']);

    return {
      id,
      surveyType: detectedSurveyType,
      name,
      email,
      identification,
      regional,
      city,
      operator,
      cargo,
      trainingType,
      startTime,
      endTime,
      year,
      month,
      durationMinutes,
      totalPoints,
      maxPointsPossible,
      scorePercentage,
      statusType,
      passed,
      generalComments,
      questions,
      rawRow: row
    };
  });

  const maxPossiblePoints = responses.length > 0 ? responses[0].maxPointsPossible : 100;
  const questionsList = questionMap.map(q => q.canonicalText);

  return {
    responses,
    questionsList,
    maxPossiblePoints
  };
}

/**
 * Filter responses based on filter state with complete null safety
 */
export function filterResponses(responses: ParticipantResponse[], filters: FilterState): ParticipantResponse[] {
  if (!Array.isArray(responses)) return [];

  const safeStr = (val: any) => (val === null || val === undefined) ? '' : String(val).toLowerCase().trim();

  return responses.filter(r => {
    if (!r) return false;

    // Regional filter
    if (filters.regional && filters.regional !== 'ALL') {
      if (safeStr(r.regional) !== safeStr(filters.regional)) return false;
    }

    // City filter (accent and prefix/suffix tolerant)
    if (filters.city && filters.city !== 'ALL') {
      const cityNorm = safeStr(r.city).normalize('NFD').replace(/[\u0300-\u036f]/g, '');
      const filterNorm = safeStr(filters.city).normalize('NFD').replace(/[\u0300-\u036f]/g, '');
      
      const matches = cityNorm === filterNorm || cityNorm.includes(filterNorm) || filterNorm.includes(cityNorm);
      if (!matches) return false;
    }

    // Operator filter
    if (filters.operator && filters.operator !== 'ALL') {
      if (safeStr(r.operator) !== safeStr(filters.operator)) return false;
    }

    // Cargo filter
    if (filters.cargo && filters.cargo !== 'ALL') {
      if (safeStr(r.cargo) !== safeStr(filters.cargo)) return false;
    }

    // Training Type filter
    if (filters.trainingType && filters.trainingType !== 'ALL') {
      if (safeStr(r.trainingType) !== safeStr(filters.trainingType)) return false;
    }

    // Year filter
    if (filters.year && filters.year !== 'ALL') {
      if (safeStr(r.year) !== safeStr(filters.year)) return false;
    }

    // Month filter
    if (filters.month && filters.month !== 'ALL') {
      if (safeStr(r.month) !== safeStr(filters.month)) return false;
    }

    // Status Filter (PASSED, FAILED)
    if (filters.status === 'PASSED' && !r.passed) return false;
    if (filters.status === 'FAILED' && r.passed) return false;

    // Satisfaction Filter (PROMOTOR, NEUTRO, DETRACTOR)
    if (filters.satisfaction === 'PROMOTOR' && r.statusType !== 'PROMOTOR') return false;
    if (filters.satisfaction === 'NEUTRO' && r.statusType !== 'NEUTRO') return false;
    if (filters.satisfaction === 'DETRACTOR' && r.statusType !== 'DETRACTOR') return false;

    // Search term (Name, Email, Identification, Regional, City)
    if (filters.searchTerm && filters.searchTerm.trim()) {
      const term = safeStr(filters.searchTerm);
      const matchName = safeStr(r.name).includes(term);
      const matchEmail = safeStr(r.email).includes(term);
      const matchId = safeStr(r.identification).includes(term);
      const matchRegional = safeStr(r.regional).includes(term);
      const matchCity = safeStr(r.city).includes(term);
      if (!matchName && !matchEmail && !matchId && !matchRegional && !matchCity) return false;
    }

    return true;
  });
}

/**
 * Calculate KPI Summary safely
 */
export function calculateSummary(responses: ParticipantResponse[], passingThresholdPercent: number): SurveySummary {
  if (!Array.isArray(responses) || responses.length === 0) {
    return {
      totalParticipants: 0,
      passedCount: 0,
      failedCount: 0,
      promotersCount: 0,
      neutralsCount: 0,
      detractorsCount: 0,
      satisfactionPercentage: 0,
      passRate: 0,
      averageScore: 0,
      averageMaxScore: 100,
      averagePercentage: 0,
      averageDurationMinutes: 0,
      passingScorePercent: passingThresholdPercent,
      inicialCount: 0,
      reentrenamientoCount: 0,
      npsScore: 0
    };
  }

  const validResponses = responses.filter(Boolean);
  const totalParticipants = validResponses.length;

  if (totalParticipants === 0) {
    return {
      totalParticipants: 0,
      passedCount: 0,
      failedCount: 0,
      promotersCount: 0,
      neutralsCount: 0,
      detractorsCount: 0,
      satisfactionPercentage: 0,
      passRate: 0,
      averageScore: 0,
      averageMaxScore: 100,
      averagePercentage: 0,
      averageDurationMinutes: 0,
      passingScorePercent: passingThresholdPercent,
      inicialCount: 0,
      reentrenamientoCount: 0,
      npsScore: 0
    };
  }

  const passedCount = validResponses.filter(r => r.passed).length;
  const failedCount = totalParticipants - passedCount;
  const passRate = Math.round((passedCount / totalParticipants) * 100);

  const promotersCount = validResponses.filter(r => r.statusType === 'PROMOTOR').length;
  const neutralsCount = validResponses.filter(r => r.statusType === 'NEUTRO').length;
  const detractorsCount = validResponses.filter(r => r.statusType === 'DETRACTOR').length;

  const inicialCount = validResponses.filter(r => (r.trainingType || '').toLowerCase().includes('inicial')).length;
  const reentrenamientoCount = validResponses.filter(r => (r.trainingType || '').toLowerCase().includes('reentrenam')).length;

  const npsScore = Math.round(((promotersCount - detractorsCount) / totalParticipants) * 100);

  const satisfactionPercentage = Math.round(((promotersCount + neutralsCount) / totalParticipants) * 100);

  const isEngagement = validResponses.length > 0 && validResponses[0].surveyType === 'engagement';

  const sumPoints = validResponses.reduce((acc, r) => acc + (Number(r.totalPoints) || 0), 0);
  const sumMaxPoints = validResponses.reduce((acc, r) => acc + (Number(r.maxPointsPossible) || 0), 0);
  const sumPercentage = validResponses.reduce((acc, r) => acc + (Number(r.scorePercentage) || 0), 0);
  const sumDuration = validResponses.reduce((acc, r) => acc + (Number(r.durationMinutes) || 0), 0);

  const averageScore = isEngagement
    ? (sumMaxPoints > 0 ? Math.round((sumPoints / (sumMaxPoints / 10)) * 10) / 10 : 0)
    : Math.round((sumPoints / totalParticipants) * 10) / 10;

  const averageMaxScore = isEngagement
    ? 10
    : Math.round(sumMaxPoints / totalParticipants) || 100;

  return {
    totalParticipants,
    passedCount,
    failedCount,
    promotersCount,
    neutralsCount,
    detractorsCount,
    satisfactionPercentage,
    passRate,
    averageScore,
    averageMaxScore,
    averagePercentage: Math.round((sumPercentage / totalParticipants) * 10) / 10,
    averageDurationMinutes: Math.round((sumDuration / totalParticipants) * 10) / 10,
    passingScorePercent: passingThresholdPercent,
    inicialCount,
    reentrenamientoCount,
    npsScore
  };
}

/**
 * Question-by-question analysis safely with extreme O(N * Q) optimization
 */
export function analyzeQuestions(responses: ParticipantResponse[]): QuestionAnalysis[] {
  if (!Array.isArray(responses) || responses.length === 0) return [];

  const surveyType = responses[0]?.surveyType || 'principios';

  const coreList = surveyType === 'job_description'
    ? CORE_EVALUATION_QUESTIONS_JOB_DESCRIPTION
    : surveyType === 'ambiente_seguro'
    ? CORE_EVALUATION_QUESTIONS_AMBIENTE_SEGURO
    : surveyType === 'engagement'
    ? CORE_EVALUATION_QUESTIONS_ENGAGEMENT
    : CORE_EVALUATION_QUESTIONS_PRINCIPIOS;

  const allQuestionTexts = [...coreList];

  // Pre-initialize our aggregation map
  const analysisMap: Record<string, {
    totalAttempts: number;
    correctCount: number;
    failedCount: number;
    sumPoints: number;
    failedParticipants: QuestionAnalysis['failedParticipants'];
  }> = {};

  allQuestionTexts.forEach(qText => {
    analysisMap[qText] = {
      totalAttempts: 0,
      correctCount: 0,
      failedCount: 0,
      sumPoints: 0,
      failedParticipants: []
    };
  });

  // Pre-resolve text canonical map to avoid O(N * Q) matchCoreQuestion calls (with its regexes & distance loops)
  const textToCanonicalMap = new Map<string, string | null>();
  responses.forEach(r => {
    if (r && Array.isArray(r.questions)) {
      r.questions.forEach(q => {
        if (q && q.questionText && !textToCanonicalMap.has(q.questionText)) {
          textToCanonicalMap.set(q.questionText, matchCoreQuestion(q.questionText, surveyType));
        }
      });
    }
  });

  responses.forEach(r => {
    if (!r) return;

    const participantQuestions = Array.isArray(r.questions) ? r.questions : [];
    
    // Create an O(1) lookup table for both exact match and canonical match
    const qLookup = new Map<string, typeof participantQuestions[number]>();
    participantQuestions.forEach(pq => {
      if (!pq) return;
      qLookup.set(pq.questionText, pq);
      const canonical = textToCanonicalMap.get(pq.questionText);
      if (canonical) {
        qLookup.set(canonical, pq);
      }
    });

    allQuestionTexts.forEach(qText => {
      const acc = analysisMap[qText];
      if (!acc) return;

      acc.totalAttempts++;
      const participantQ = qLookup.get(qText);

      if (participantQ) {
        const ptsObtained = Number(participantQ.pointsObtained) || 0;
        const maxPts = Number(participantQ.maxPoints) || (surveyType === 'engagement' ? 10 : 20);

        acc.sumPoints += ptsObtained;

        const isSatisfied = surveyType === 'engagement'
          ? (maxPts === 10 ? ptsObtained >= 7 : ptsObtained >= 4)
          : (participantQ.isCorrect || ptsObtained >= maxPts * 0.8);

        if (isSatisfied) {
          acc.correctCount++;
        } else {
          acc.failedCount++;
          acc.failedParticipants.push({
            participantId: r.id,
            name: r.name || 'Participante',
            regional: r.regional || 'Sin Regional',
            userAnswer: String(ptsObtained),
            pointsObtained: ptsObtained
          });
        }
      } else {
        const isPassed = Boolean(r.passed) || (Number(r.scorePercentage) || 0) >= 70;
        const ptsObtained = isPassed ? (surveyType === 'engagement' ? 10 : 20) : 0;
        acc.sumPoints += ptsObtained;

        if (isPassed) {
          acc.correctCount++;
        } else {
          acc.failedCount++;
          acc.failedParticipants.push({
            participantId: r.id,
            name: r.name || 'Participante',
            regional: r.regional || 'Sin Regional',
            userAnswer: surveyType === 'engagement' ? 'Calificación Baja' : 'Incorrecta',
            pointsObtained: 0
          });
        }
      }
    });
  });

  const questionAnalysisList: QuestionAnalysis[] = allQuestionTexts.map(qText => {
    const acc = analysisMap[qText];
    const successRate = acc.totalAttempts > 0 
      ? Math.round((acc.correctCount / acc.totalAttempts) * 100) 
      : 0;

    return {
      questionText: qText,
      maxPoints: surveyType === 'engagement' ? 10 : 20,
      totalAttempts: acc.totalAttempts,
      correctCount: acc.correctCount,
      partialCount: 0,
      failedCount: acc.failedCount,
      avgPointsObtained: acc.totalAttempts > 0 ? Math.round((acc.sumPoints / acc.totalAttempts) * 10) / 10 : 0,
      successRate,
      failedParticipants: acc.failedParticipants
    };
  });

  return questionAnalysisList;
}
