import { ParticipantResponse, QuestionDetail, SurveyType } from '../types/survey';

export function generateBavariaSampleData(
  passingThresholdPercent: number = 70,
  surveyType: SurveyType = 'principios'
): ParticipantResponse[] {
  const questionsPrincipios = [
    {
      text: '¿Qué significa "Soñar en grande" dentro de los principios de la compañía?',
      maxPts: 20,
      correctAnswer: 'Establecer metas ambiciosas y transformar la organización con visión de futuro.',
      wrongAnswer: 'Pensar en ideas individuales sin coordinar con el equipo.'
    },
    {
      text: 'Enfocarse en resultados extraordinarios implica principalmente:',
      maxPts: 20,
      correctAnswer: 'Buscar la excelencia operativa, disciplina y esfuerzo constante por superar expectativas.',
      wrongAnswer: 'Buscar atajos rápidos para cumplir la meta del día a cualquier costo.'
    },
    {
      text: '¿Qué significa liderar con el ejemplo y asumir la responsabilidad?',
      maxPts: 20,
      correctAnswer: 'Actuar con integridad, hacerse cargo de los resultados y guiar con acciones coherentes.',
      wrongAnswer: 'Delegar siempre las fallas a los subalternos o terceros.'
    },
    {
      text: 'Cuidar los costos rigurosamente significa:',
      maxPts: 20,
      correctAnswer: 'Tratar los recursos de la empresa como propios y eliminar desperdicios continuamente.',
      wrongAnswer: 'Escatimar en presupuestos de seguridad física o salud ocupacional.'
    },
    {
      text: 'Según los principios de la compañía, "Nunca tomar atajos" significa:',
      maxPts: 20,
      correctAnswer: 'Cumplir al 100% las normas de seguridad, ética y legalidad sin excepciones.',
      wrongAnswer: 'Saltarse pasos del procedimiento cuando hay prisa en la entrega.'
    }
  ];

  const questionsAmbienteSeguro = [
    {
      text: '¿Qué es la seguridad psicológica en un equipo de trabajo?',
      maxPts: 20,
      correctAnswer: 'Un clima laboral de confianza donde los miembros se sienten seguros para asumir riesgos, expresar ideas y admitir errores sin temor a represalias.',
      wrongAnswer: 'Un estado en el que nunca se cometen errores ni existen desacuerdos entre los miembros del equipo.'
    },
    {
      text: 'Construir espacios psicológicamente seguros implica principalmente:',
      maxPts: 20,
      correctAnswer: 'Fomentar la escucha activa, empatía, respeto, valoración de opiniones y el aprendizaje constructivo a partir de las equivocaciones.',
      wrongAnswer: 'Evitar discusiones técnicas y aceptar todas las sugerencias sin evaluación.'
    },
    {
      text: 'La diversidad en un equipo se refiere a:',
      maxPts: 20,
      correctAnswer: 'La presencia de variedad de antecedentes, perspectivas, géneros, culturas, experiencias y habilidades que enriquecen al equipo.',
      wrongAnswer: 'Tener colaboradores con el mismo perfil profesional y antecedentes similares.'
    },
    {
      text: '¿Qué busca la inclusión dentro de la organización?',
      maxPts: 20,
      correctAnswer: 'Garantizar que todas las personas tengan igualdad de oportunidades, voz, participación activa y sentido de pertenencia.',
      wrongAnswer: 'Dar un trato diferenciado exclusivo únicamente en eventos especiales.'
    },
    {
      text: '¿Cuál es una acción concreta para construir espacios diversos?',
      maxPts: 20,
      correctAnswer: 'Implementar procesos de selección equitativos, promover la participación equitativa en decisiones y rechazar todo tipo de discriminación.',
      wrongAnswer: 'Limitar la comunicación de sugerencias únicamente al nivel jerárquico superior.'
    }
  ];

  const questionsJobDescription = [
    {
      text: '¿Qué significa la metodología 3R?',
      maxPts: 20,
      correctAnswer: 'Responsabilidad, Recursos y Recompensa',
      wrongAnswer: 'Reducir, Reutilizar y Reciclar'
    },
    {
      text: '¿Qué hace parte de la Responsabilidad en la metodología 3R?',
      maxPts: 20,
      correctAnswer: 'Los procesos, protocolos y manual de funciones',
      wrongAnswer: 'Los incentivos mensuales por cumplimiento'
    },
    {
      text: '¿Cuál de las siguientes opciones es un ejemplo de Recurso dentro de las 3R?',
      maxPts: 20,
      correctAnswer: 'Carretillas',
      wrongAnswer: 'Compensación variable'
    },
    {
      text: '¿Para qué sirven las Job Description?',
      maxPts: 20,
      correctAnswer: 'Definir las responsabilidades, funciones y requisitos de un puesto de trabajo',
      wrongAnswer: 'Determinar el salario anual de todos los empleados de la empresa'
    },
    {
      text: '¿En qué momentos se deben revisar las Job Description?',
      maxPts: 20,
      correctAnswer: 'Cuando ingresa una persona nueva o hay cambios en las funciones del puesto, en la estructura del área o en los procesos del trabajo',
      wrongAnswer: 'Únicamente cuando un colaborador solicita un aumento de salario'
    }
  ];

  const questionsTemplate = surveyType === 'job_description'
    ? questionsJobDescription
    : surveyType === 'ambiente_seguro' 
    ? questionsAmbienteSeguro 
    : surveyType === 'engagement'
    ? [
        { text: 'Considera que este es un lugar seguro para trabajar', maxPts: 10, correctAnswer: '10', wrongAnswer: '5' },
        { text: 'Considero que existe una cultura de reconocimiento entre mi equipo, compañeros y líder', maxPts: 10, correctAnswer: '9', wrongAnswer: '4' },
        { text: 'Cuenta con todos los recursos necesarios (ejemplo: capacitación, EPP, tiempo, etc.) para realizar el trabajo', maxPts: 10, correctAnswer: '10', wrongAnswer: '5' },
        { text: 'El personal de Logística del Centro de Distribución sigue todas las reglas y procedimientos de seguridad', maxPts: 10, correctAnswer: '10', wrongAnswer: '6' },
        { text: 'Estoy satisfecho(a) con la compañía como lugar de trabajo', maxPts: 10, correctAnswer: '10', wrongAnswer: '4' },
        { text: 'La comunicación en mi empresa es abierta y transparente, con diálogo bidireccional', maxPts: 10, correctAnswer: '9', wrongAnswer: '4' },
        { text: 'Los líderes de mi empresa comunican claramente el propósito y los objetivos a largo plazo', maxPts: 10, correctAnswer: '9', wrongAnswer: '5' },
        { text: 'Me siento motivado(a) a buscar mejores formas de hacer las cosas', maxPts: 10, correctAnswer: '10', wrongAnswer: '6' },
        { text: 'Me siento orgulloso(a) de trabajar en la compañía', maxPts: 10, correctAnswer: '10', wrongAnswer: '5' },
        { text: 'Me siento reconocido(a) por mi trabajo', maxPts: 10, correctAnswer: '9', wrongAnswer: '4' },
        { text: 'Mi jefe directo me proporciona retroalimentación periódica que me ayuda a desarrollarme', maxPts: 10, correctAnswer: '10', wrongAnswer: '4' },
        { text: 'Mi jefe directo refuerza el uso de prácticas de trabajo seguro', maxPts: 10, correctAnswer: '10', wrongAnswer: '5' },
        { text: 'Mi jefe inmediato crea un entorno seguro donde puedo expresar mis ideas libremente y con respeto', maxPts: 10, correctAnswer: '10', wrongAnswer: '5' },
        { text: 'Puedo denunciar prácticas poco éticas sin temor a represalias', maxPts: 10, correctAnswer: '9', wrongAnswer: '3' },
        { text: 'Puedo ser yo mismo(a) en el trabajo', maxPts: 10, correctAnswer: '10', wrongAnswer: '5' },
        { text: 'Recomendaría a mi jefe directo a otras personas', maxPts: 10, correctAnswer: '10', wrongAnswer: '4' },
        { text: 'Recomendaría mi empresa como un excelente lugar para trabajar', maxPts: 10, correctAnswer: '10', wrongAnswer: '5' },
        { text: 'Tengo impacto directo en el logro de mis objetivos', maxPts: 10, correctAnswer: '9', wrongAnswer: '6' },
        { text: 'Tengo la intención de permanecer en mi empresa durante al menos los próximos 12 meses', maxPts: 10, correctAnswer: '10', wrongAnswer: '4' },
        { text: 'Tengo suficientes oportunidades para aprender nuevas habilidades y crecer como profesional', maxPts: 10, correctAnswer: '9', wrongAnswer: '4' },
        { text: 'Todos los empleados, independientemente de sus diferencias, reciben un trato justo', maxPts: 10, correctAnswer: '9', wrongAnswer: '5' }
      ]
    : questionsPrincipios;

  const sampleParticipantsRaw = [
    // Sur - DC Popayán
    { name: 'Jorge López', reg: 'Sur', city: 'DC Popayán', cargo: 'Administrativo', scorePct: 100 },
    { name: 'Fredy Yovany Guetio', reg: 'Sur', city: 'DC Popayán', cargo: 'Auxiliar de Distribución', scorePct: 80 },
    { name: 'Velasco', reg: 'Sur', city: 'DC Popayán', cargo: 'Responsable de Ruta', scorePct: 60 },

    // Sur - DC Cali
    { name: 'Luis Ángel Molina Azmaza', reg: 'Sur', city: 'DC Cali', cargo: 'Conductor de Distribución', scorePct: 80 },
    { name: 'Carlos Mario Benavides', reg: 'Sur', city: 'DC Cali', cargo: 'Conductor de Distribución', scorePct: 80 },
    { name: 'Cristian Alexander Rivas', reg: 'Sur', city: 'DC Cali', cargo: 'Auxiliar de Distribución', scorePct: 100 },
    { name: 'Diego Fernando Castro', reg: 'Sur', city: 'DC Cali', cargo: 'Responsable de Ruta', scorePct: 60 },

    // Sur - DC Yumbo
    { name: 'Danny Portillo', reg: 'Sur', city: 'DC Yumbo', cargo: 'Conductor de Distribución', scorePct: 80 },
    { name: 'Jaiver Salazar', reg: 'Sur', city: 'DC Yumbo', cargo: 'Auxiliar de Distribución', scorePct: 80 },
    { name: 'Hernán Darío Gómez', reg: 'Sur', city: 'DC Yumbo', cargo: 'Montacarguista', scorePct: 100 },

    // Sur - DC Palmira
    { name: 'Donaldo Quinayas', reg: 'Sur', city: 'DC Palmira', cargo: 'Conductor de Distribución', scorePct: 60 },
    { name: 'Heber Meneses Guevara', reg: 'Sur', city: 'DC Palmira', cargo: 'Administrativo', scorePct: 100 },

    // Sur - DC Pasto / Ipiales
    { name: 'Oveimer Caicedo', reg: 'Sur', city: 'DC Pasto', cargo: 'Responsable de Ruta', scorePct: 100 },
    { name: 'Luz Mery Agudelo', reg: 'Sur', city: 'DC Pasto', cargo: 'Auxiliar de Distribución', scorePct: 60 },
    { name: 'Alex Santiago Taimal', reg: 'Sur', city: 'DC Ipiales', cargo: 'Administrativo', scorePct: 100 },

    // Sur - DC Neiva
    { name: 'Gabriel Antonio Silva', reg: 'Sur', city: 'DC Neiva', cargo: 'Operario Almacén', scorePct: 80 },
    { name: 'Jhony Alexander Pérez', reg: 'Sur', city: 'DC Neiva', cargo: 'Conductor de Distribución', scorePct: 60 },

    // Andes - Bogotá & Tunja
    { name: 'Andrés Felipe Cardona', reg: 'Andes', city: 'DC Bogotá Calle 80', cargo: 'Administrativo', scorePct: 100 },
    { name: 'Carlos Andrés Gómez', reg: 'Andes', city: 'DC Bogotá Fontibón', cargo: 'Conductor de Distribución', scorePct: 80 },
    { name: 'Santiago Gutiérrez', reg: 'Andes', city: 'DC Tunja', cargo: 'Auxiliar de Distribución', scorePct: 100 },

    // Centro - Ibagué & Villavicencio
    { name: 'María Fernanda López', reg: 'Centro', city: 'DC Ibagué', cargo: 'Responsable de Ruta', scorePct: 80 },
    { name: 'Diana Carolina Morales', reg: 'Centro', city: 'DC Villavicencio', cargo: 'Administrativo', scorePct: 100 },

    // Norte - Barranquilla & Cartagena
    { name: 'Natalia Ruiz Ramírez', reg: 'Norte', city: 'DC Barranquilla', cargo: 'Auxiliar de Distribución', scorePct: 100 },
    { name: 'Valeria Serna Quintero', reg: 'Norte', city: 'DC Cartagena', cargo: 'Conductor de Distribución', scorePct: 80 }
  ];

  const isEngagement = surveyType === 'engagement';

  return sampleParticipantsRaw.map((p, idx) => {
    let currentScore = 0;
    const maxPossible = questionsTemplate.reduce((sum, q) => sum + q.maxPts, 0);

    const questions: QuestionDetail[] = questionsTemplate.map((qT, qIdx) => {
      // Determine if this question is correct based on target score percentage
      let isCorrect = true;
      let pts = 10;
      let ans = '';

      if (isEngagement) {
        if (p.scorePct === 100) {
          pts = qIdx % 2 === 0 ? 10 : 9;
        } else if (p.scorePct === 80) {
          pts = qIdx % 2 === 0 ? 8 : 7;
        } else {
          pts = qIdx % 2 === 0 ? 5 : 6;
        }
        ans = String(pts);
        isCorrect = pts >= 7;
      } else {
        if (p.scorePct === 80 && qIdx % 5 === 0) isCorrect = false;
        if (p.scorePct === 60 && (qIdx % 3 === 0)) isCorrect = false;

        pts = isCorrect ? qT.maxPts : Math.max(1, Math.round(qT.maxPts * 0.6));
        ans = isCorrect ? qT.correctAnswer : qT.wrongAnswer;
      }

      currentScore += pts;

      return {
        id: `q_${qIdx}`,
        questionText: qT.text,
        pointsObtained: pts,
        maxPoints: qT.maxPts,
        userAnswer: ans,
        comments: isCorrect ? 'Satisfecho' : 'Requiere atención',
        isCorrect
      };
    });

    const passed = isEngagement ? (currentScore / (maxPossible / 10) >= 7) : (currentScore >= (maxPossible * 0.7) || p.scorePct >= 70);
    const statusType: 'PROMOTOR' | 'NEUTRO' | 'DETRACTOR' = 
      p.scorePct >= 90 ? 'PROMOTOR' : p.scorePct >= 70 ? 'NEUTRO' : 'DETRACTOR';
    const trainingType = idx % 2 === 0 ? 'Inicial' : 'Reentrenamiento';

    return {
      id: idx + 1,
      surveyType,
      name: isEngagement ? `Participante Anónimo #${idx + 1}` : p.name,
      email: isEngagement ? 'Anónimo' : `${p.name.toLowerCase().replace(/\s+/g, '.')}@bavaria.co`,
      identification: isEngagement ? 'Anónimo' : `10${idx + 1}829301`,
      regional: p.reg,
      city: p.city,
      operator: 'Bavaria Directo',
      cargo: p.cargo,
      trainingType,
      startTime: '2026-07-28T09:00:00',
      endTime: '2026-07-28T09:12:00',
      year: '2026',
      month: 'Julio',
      durationMinutes: 12,
      totalPoints: currentScore,
      maxPointsPossible: maxPossible,
      scorePercentage: p.scorePct,
      statusType,
      passed,
      generalComments: passed ? 'Aprobó / Favorable' : 'Requiere Retroalimentación / Desfavorable',
      questions,
      rawRow: {}
    };
  });
}

