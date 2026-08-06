import React from 'react';
import { Users, CheckCircle2, Award, Clock, Smile, ThumbsUp, Meh, Frown, GraduationCap } from 'lucide-react';
import { SurveySummary } from '../types/survey';

interface KpiCardsProps {
  summary: SurveySummary;
  onSelectFailedFilter?: () => void;
  surveyType?: string;
}

export const KpiCards: React.FC<KpiCardsProps> = ({ summary, onSelectFailedFilter, surveyType }) => {
  const isEngagement = surveyType === 'engagement';
  const total = summary.totalParticipants || 1;
  const passedPct = Math.round((summary.passedCount / total) * 100);
  const failedPct = Math.round((summary.failedCount / total) * 100);

  const promotersPct = Math.round((summary.promotersCount / total) * 100);
  const neutralsPct = Math.round((summary.neutralsCount / total) * 100);
  const detractorsPct = Math.round((summary.detractorsCount / total) * 100);

  const inicialPct = Math.round((summary.inicialCount / total) * 100);
  const reentrenamPct = Math.round((summary.reentrenamientoCount / total) * 100);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {/* 1. TOTAL EVALUADOS Y PARTICIPANTES */}
      <div className="bg-white rounded-2xl p-5 shadow-xs border border-gris-medio/30 hover:border-petroleo flex flex-col justify-between hover:shadow-md transition-all">
        <div>
          <div className="flex items-center justify-between pb-3 border-b border-gris-claro">
            <span className="text-xs font-black text-petroleo uppercase tracking-wider">
              1. Total Evaluados
            </span>
            <div className="p-2.5 bg-petroleo border-2 border-negro-suave text-turquesa rounded-xl shadow-xs">
              <Users className="w-5 h-5" />
            </div>
          </div>
          
          <div className="mt-3.5 flex items-baseline justify-between">
            <div className="text-3xl font-black text-petroleo">{summary.totalParticipants}</div>
            <span className="text-xs font-bold bg-azul-corp/15 text-petroleo border border-azul-corp/30 px-2.5 py-1 rounded-full">
              100% Muestra
            </span>
          </div>

          <div className="mt-3.5 pt-3 border-t border-gris-claro grid grid-cols-2 gap-2 text-xs">
            <div className="bg-gris-claro/50 p-2.5 rounded-xl text-center border border-gris-medio/20">
              <span className="block text-negro-suave/70 font-bold text-[10px] uppercase">Inicial</span>
              <span className="font-extrabold text-petroleo text-sm">{summary.inicialCount}</span>
              <span className="text-[10px] text-azul-corp font-semibold block">({inicialPct}%)</span>
            </div>
            <div className="bg-gris-claro/50 p-2.5 rounded-xl text-center border border-gris-medio/20">
              <span className="block text-negro-suave/70 font-bold text-[10px] uppercase">Reentrenam.</span>
              <span className="font-extrabold text-petroleo text-sm">{summary.reentrenamientoCount}</span>
              <span className="text-[10px] text-azul-corp font-semibold block">({reentrenamPct}%)</span>
            </div>
          </div>
        </div>

        <p className="text-[11px] text-negro-suave/70 mt-3 font-medium flex items-center gap-1">
          <span className="text-turquesa font-bold">•</span> Total de registros válidos analizados
        </p>
      </div>

      {/* 2. ESTADO DE EVALUACIÓN (APROBÓ VS RETROALIMENTAR) */}
      {!isEngagement && (
        <div 
          onClick={onSelectFailedFilter}
          className="bg-white rounded-2xl p-5 shadow-xs border border-gris-medio/30 hover:border-mostaza cursor-pointer hover:shadow-md transition-all group flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-gris-claro">
              <span className="text-xs font-black text-petroleo uppercase tracking-wider">
                2. Estado de Evaluación
              </span>
              <div className="p-2.5 bg-petroleo border-2 border-negro-suave text-mostaza rounded-xl shadow-xs group-hover:bg-azul-corp transition-colors">
                <Award className="w-5 h-5" />
              </div>
            </div>

            <div className="mt-3.5 flex items-baseline justify-between">
              <div className="text-3xl font-black text-petroleo">{summary.passRate}%</div>
              <span className="text-[11px] font-bold text-petroleo bg-amarillo-claro border border-mostaza px-2.5 py-1 rounded-lg group-hover:bg-mostaza transition-colors">
                Ver Reprobados →
              </span>
            </div>

            <div className="mt-3.5 space-y-2 text-xs font-semibold">
              <div className="flex items-center justify-between text-petroleo bg-menta/30 px-2.5 py-1.5 rounded-lg border border-turquesa/40">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-turquesa"></span>
                  ✓ Aprobó (100 Pts):
                </span>
                <span className="font-black text-sm">{summary.passedCount} <span className="text-[10px] text-petroleo/70 font-semibold">({passedPct}%)</span></span>
              </div>
              <div className="flex items-center justify-between text-petroleo bg-amarillo-claro/60 px-2.5 py-1.5 rounded-lg border border-mostaza/50">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-mostaza"></span>
                  ⚠️ Retroalimentar (&lt;100 Pts):
                </span>
                <span className="font-black text-sm">{summary.failedCount} <span className="text-[10px] text-petroleo/70 font-semibold">({failedPct}%)</span></span>
              </div>
            </div>

            <div className="w-full bg-gris-claro rounded-full h-2.5 mt-3.5 overflow-hidden flex border border-gris-medio/20">
              <div className="h-full bg-turquesa" style={{ width: `${passedPct}%` }} title={`Aprobó: ${summary.passedCount}`} />
              <div className="h-full bg-mostaza" style={{ width: `${failedPct}%` }} title={`Retroalimentar: ${summary.failedCount}`} />
            </div>
          </div>

          <p className="text-[11px] text-negro-suave/70 mt-2 font-medium">
            Regla: 100 Pts = Aprobó. Menos de 100 Pts = Retroalimentar.
          </p>
        </div>
      )}

      {/* 3. PORCENTAJE DE SATISFACCIÓN (CSAT) */}
      <div className="bg-white rounded-2xl p-5 shadow-xs border border-gris-medio/30 hover:border-turquesa flex flex-col justify-between hover:shadow-md transition-all">
        <div>
          <div className="flex items-center justify-between pb-3 border-b border-gris-claro">
            <span className="text-xs font-black text-petroleo uppercase tracking-wider">
              3. % Satisfacción (CSAT)
            </span>
            <div className="p-2.5 bg-petroleo border-2 border-negro-suave text-menta rounded-xl shadow-xs">
              <Smile className="w-5 h-5" />
            </div>
          </div>

          <div className="mt-3.5 flex items-baseline justify-between">
            <div className="text-3xl font-black text-petroleo">{summary.satisfactionPercentage}%</div>
            <span className={`text-xs font-extrabold px-2.5 py-1 rounded-full border ${
              summary.satisfactionPercentage >= 80 
                ? 'bg-menta/40 text-petroleo border-turquesa/50' 
                : 'bg-amarillo-claro text-petroleo border-mostaza/50'
            }`}>
              {summary.satisfactionPercentage >= 80 ? 'Excelente' : 'Aceptable'}
            </span>
          </div>

          <p className="text-xs text-negro-suave/80 mt-2 font-medium">
            Suma de Promotores (9-10) y Neutros (7-8) sobre el total evaluado.
          </p>

          <div className="w-full bg-gris-claro rounded-full h-2.5 mt-3.5 overflow-hidden flex border border-gris-medio/20">
            <div className="h-full bg-turquesa" style={{ width: `${promotersPct}%` }} title={`Promotores: ${summary.promotersCount}`} />
            <div className="h-full bg-amarillo-claro" style={{ width: `${neutralsPct}%` }} title={`Neutros: ${summary.neutralsCount}`} />
            <div className="h-full bg-mostaza" style={{ width: `${detractorsPct}%` }} title={`Detractores: ${summary.detractorsCount}`} />
          </div>
        </div>

        <div className="mt-3 pt-2.5 border-t border-gris-claro flex justify-between text-[11px] text-negro-suave">
          <span>Satisfacción CSAT</span>
          <span className="font-extrabold text-petroleo">{summary.promotersCount + summary.neutralsCount} de {summary.totalParticipants}</span>
        </div>
      </div>

      {/* 4. CLASIFICACIÓN PROMOTOR / NEUTRO / DETRACTOR */}
      <div className="bg-white rounded-2xl p-5 shadow-xs border border-gris-medio/30 hover:border-azul-corp flex flex-col justify-between hover:shadow-md transition-all">
        <div>
          <div className="flex items-center justify-between pb-3 border-b border-gris-claro">
            <span className="text-xs font-black text-petroleo uppercase tracking-wider">
              4. Clasificación NPS
            </span>
            <div className="p-2.5 bg-petroleo border-2 border-negro-suave text-amarillo-claro rounded-xl shadow-xs">
              <ThumbsUp className="w-5 h-5" />
            </div>
          </div>

          <div className="mt-2.5 space-y-1.5 text-xs font-semibold">
            <div className="flex items-center justify-between text-petroleo bg-menta/30 px-2.5 py-1.5 rounded-lg border border-turquesa/30">
              <span className="flex items-center gap-1.5">
                <Smile className="w-3.5 h-3.5 text-turquesa" />
                Promotores (9-10):
              </span>
              <span className="font-black text-sm">{summary.promotersCount} <span className="text-[10px] text-azul-corp font-semibold">({promotersPct}%)</span></span>
            </div>

            <div className="flex items-center justify-between text-petroleo bg-amarillo-claro/50 px-2.5 py-1.5 rounded-lg border border-mostaza/30">
              <span className="flex items-center gap-1.5">
                <Meh className="w-3.5 h-3.5 text-mostaza" />
                Neutros (7-8):
              </span>
              <span className="font-black text-sm">{summary.neutralsCount} <span className="text-[10px] text-petroleo/70 font-semibold">({neutralsPct}%)</span></span>
            </div>

            <div className="flex items-center justify-between text-petroleo bg-gris-claro/70 px-2.5 py-1.5 rounded-lg border border-gris-medio/30">
              <span className="flex items-center gap-1.5">
                <Frown className="w-3.5 h-3.5 text-negro-suave" />
                Detractores (0-6):
              </span>
              <span className="font-black text-sm">{summary.detractorsCount} <span className="text-[10px] text-negro-suave/70 font-semibold">({detractorsPct}%)</span></span>
            </div>
          </div>
        </div>

        <div className="mt-3 pt-2.5 border-t border-gris-claro flex items-center justify-between text-xs">
          <span className="text-negro-suave font-bold">NPS Neto:</span>
          <span className={`font-black text-sm px-2 py-0.5 rounded-md ${
            summary.npsScore >= 0 
              ? 'bg-menta/30 text-petroleo border border-turquesa/40' 
              : 'bg-amarillo-claro text-petroleo border border-mostaza'
          }`}>
            {summary.npsScore > 0 ? `+${summary.npsScore}` : summary.npsScore} pts
          </span>
        </div>
      </div>

      {/* 5. TIPO DE CAPACITACIÓN (INICIAL VS REENTRENAMIENTO) */}
      <div className="bg-white rounded-2xl p-5 shadow-xs border border-gris-medio/30 hover:border-turquesa flex flex-col justify-between hover:shadow-md transition-all">
        <div>
          <div className="flex items-center justify-between pb-3 border-b border-gris-claro">
            <span className="text-xs font-black text-petroleo uppercase tracking-wider">
              5. Tipo de Capacitación
            </span>
            <div className="p-2.5 bg-petroleo border-2 border-negro-suave text-turquesa rounded-xl shadow-xs">
              <GraduationCap className="w-5 h-5" />
            </div>
          </div>

          <div className="mt-3.5 space-y-2.5">
            <div>
              <div className="flex justify-between text-xs font-bold text-petroleo">
                <span className="flex items-center gap-1">📘 Inicial</span>
                <span>{summary.inicialCount} ({inicialPct}%)</span>
              </div>
              <div className="w-full bg-gris-claro rounded-full h-2 mt-1 overflow-hidden border border-gris-medio/20">
                <div className="h-full bg-azul-corp rounded-full" style={{ width: `${inicialPct}%` }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-bold text-petroleo">
                <span className="flex items-center gap-1">🟣 Reentrenamiento</span>
                <span>{summary.reentrenamientoCount} ({reentrenamPct}%)</span>
              </div>
              <div className="w-full bg-gris-claro rounded-full h-2 mt-1 overflow-hidden border border-gris-medio/20">
                <div className="h-full bg-turquesa rounded-full" style={{ width: `${reentrenamPct}%` }} />
              </div>
            </div>
          </div>
        </div>

        <p className="text-[11px] text-negro-suave/70 mt-3 font-medium">
          Comparativa por modalidad de instrucción recibida.
        </p>
      </div>

      {/* 6. PUNTAJE PROMEDIO EVALUACIÓN */}
      <div className="bg-white rounded-2xl p-5 shadow-xs border border-gris-medio/30 hover:border-mostaza flex flex-col justify-between hover:shadow-md transition-all">
        <div>
          <div className="flex items-center justify-between pb-3 border-b border-gris-claro">
            <span className="text-xs font-black text-petroleo uppercase tracking-wider">
              {isEngagement ? '6. Satisfacción Promedio' : '6. Puntaje Promedio'}
            </span>
            <div className="p-2.5 bg-petroleo border-2 border-negro-suave text-mostaza rounded-xl shadow-xs">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>

          <div className="mt-3.5">
            <div className="flex items-baseline gap-1.5">
              <span className="text-3xl font-black text-petroleo">{summary.averageScore}</span>
              <span className="text-xs font-extrabold text-negro-suave/70">/ {summary.averageMaxScore} {isEngagement ? 'Pts' : 'Pts'}</span>
            </div>
            
            <div className="mt-2.5 flex items-center justify-between text-xs bg-gris-claro/60 p-2 rounded-xl border border-gris-medio/20">
              <span className="text-negro-suave font-semibold">{isEngagement ? 'Calificación General:' : 'Efectividad Global:'}</span>
              <span className="font-extrabold text-petroleo bg-amarillo-claro px-2 py-0.5 rounded-md border border-mostaza/40">
                {isEngagement ? `${summary.averageScore} / 10` : `${summary.averagePercentage}%`}
              </span>
            </div>
          </div>
        </div>

        <p className="text-[11px] text-negro-suave/70 mt-3 font-medium">
          {isEngagement ? 'Nivel de satisfacción promedio en una escala de 1 a 10.' : 'Puntaje numérico promedio obtenido en el examen.'}
        </p>
      </div>

      {/* 7. TIEMPO PROMEDIO DILIGENCIAMIENTO */}
      <div className="bg-white rounded-2xl p-5 shadow-xs border border-gris-medio/30 hover:border-petroleo flex flex-col justify-between hover:shadow-md transition-all">
        <div>
          <div className="flex items-center justify-between pb-3 border-b border-gris-claro">
            <span className="text-xs font-black text-petroleo uppercase tracking-wider">
              7. Tiempo Promedio
            </span>
            <div className="p-2.5 bg-petroleo border-2 border-negro-suave text-gris-claro rounded-xl shadow-xs">
              <Clock className="w-5 h-5" />
            </div>
          </div>

          <div className="mt-3.5">
            <div className="text-3xl font-black text-petroleo">
              {summary.averageDurationMinutes} <span className="text-sm font-bold text-negro-suave/70">min</span>
            </div>
            <div className="mt-2.5 text-xs text-negro-suave bg-gris-claro/60 p-2 rounded-xl border border-gris-medio/20 font-semibold">
              Aproximadamente {Math.round(summary.averageDurationMinutes * 60)} segundos por prueba
            </div>
          </div>
        </div>

        <p className="text-[11px] text-negro-suave/70 mt-3 font-medium">
          Tiempo transcurrido desde el inicio hasta el envío.
        </p>
      </div>
    </div>
  );
};

