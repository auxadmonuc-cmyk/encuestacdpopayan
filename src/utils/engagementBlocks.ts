export const ENGAGEMENT_BLOCKS: Record<string, string> = {
  // Seguridad
  'Considera que este es un lugar seguro para trabajar': 'Seguridad',
  'Cuenta con todos los recursos necesarios (ejemplo: capacitación, EPP, tiempo, etc.) para realizar el trabajo': 'Seguridad',
  'El personal de Logística del Centro de Distribución sigue todas las reglas y procedimientos de seguridad': 'Seguridad',
  'Mi jefe directo refuerza el uso de prácticas de trabajo seguro': 'Seguridad',
  'Recomendaría mi empresa como un excelente lugar para trabajar': 'Seguridad',

  // Crecimiento y reconocimiento
  'Considero que existe una cultura de reconocimiento entre mi equipo, compañeros y líder': 'Crecimiento y reconocimiento',
  'Me siento reconocido(a) por mi trabajo': 'Crecimiento y reconocimiento',
  'Mi jefe directo me proporciona retroalimentación periódica que me ayuda a desarrollarme': 'Crecimiento y reconocimiento',
  'Tengo suficientes oportunidades para aprender nuevas habilidades y crecer como profesional': 'Crecimiento y reconocimiento',

  // Comunicación y claridad
  'Estoy satisfecho(a) con la compañía como lugar de trabajo': 'Comunicación y claridad',
  'La comunicación en mi empresa es abierta y transparente, con diálogo bidireccional': 'Comunicación y claridad',
  'Los líderes de mi empresa comunican claramente el propósito y los objetivos a largo plazo': 'Comunicación y claridad',

  // Engagement
  'Me siento motivado(a) a buscar mejores formas de hacer las cosas': 'Engagement',
  'Me siento orgulloso(a) de trabajar en la compañía': 'Engagement',
  'Tengo impacto directo en el logro de mis objetivos': 'Engagement',
  'Tengo la intención de permanecer en mi empresa durante al menos los próximos 12 meses': 'Engagement',

  // Eficacia de Gerente
  'Mi jefe directo vive los 10 principios de la compañía en todo momento': 'Eficacia de Gerente',
  'Mi jefe inmediato crea un entorno seguro donde puedo expresar mis ideas libremente y con respeto': 'Eficacia de Gerente',
  'Recomendaría a mi jefe directo a otras personas': 'Eficacia de Gerente',

  // Cultura, diversidad e inclusión
  'Puedo denunciar prácticas poco éticas sin temor a represalias': 'Cultura, diversidad e inclusión',
  'Puedo ser yo mismo(a) en el trabajo': 'Cultura, diversidad e inclusión',
  'Todos los empleados, independientemente de sus diferencias, reciben un trato justo': 'Cultura, diversidad e inclusión',
  'Todos los empleados, independientemente de sus diferencias, reciben un trato justo y respetuoso': 'Cultura, diversidad e inclusión'
};

export const BLOCK_LIST = [
  'Seguridad',
  'Crecimiento y reconocimiento',
  'Comunicación y claridad',
  'Engagement',
  'Eficacia de Gerente',
  'Cultura, diversidad e inclusión'
];

export function getQuestionBlock(questionText: string): string {
  if (!questionText) return 'Otro';
  
  const clean = questionText.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[¿?]/g, '').trim();
  
  for (const [key, block] of Object.entries(ENGAGEMENT_BLOCKS)) {
    const keyClean = key.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[¿?]/g, '').trim();
    if (clean.includes(keyClean) || keyClean.includes(clean)) {
      return block;
    }
  }
  
  return 'Otro';
}
