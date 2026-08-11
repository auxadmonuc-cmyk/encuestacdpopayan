import React, { useState } from 'react';
import { HelpCircle, ChevronDown, ChevronUp, Users, AlertTriangle, AlertCircle, CheckCircle } from 'lucide-react';
import { QuestionAnalysis } from '../types/survey';

interface QuestionBreakdownProps {
  questionAnalysisList: QuestionAnalysis[];
  totalEvaluated: number;
  surveyType?: string;
}

export const QuestionBreakdown: React.FC<QuestionBreakdownProps> = ({ questionAnalysisList, totalEvaluated, surveyType }) => {
  const isEngagement = surveyType === 'engagement';
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  const toggleExpand = (idx: number) => {
    setExpandedIndex(expandedIndex === idx ? null : idx);
  };

  return (
    <div className="bg-white rounded-xl border border-gris-medio/30 shadow-sm overflow-hidden mb-6">
      {/* Header Banner - Elegant Dark Petróleo #1F2A33 */}
      <div className="bg-petroleo border-b border-azul-corp px-5 py-3.5 flex items-center justify-between">
        <h3 className="text-sm font-black text-white uppercase tracking-wide flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-turquesa animate-pulse"></span>
          <span>{isEngagement ? 'RESULTADOS POR FACTOR DE SATISFACCIÓN' : 'RESULTADOS POR PRINCIPIO'}</span>
          <span className="text-gris-medio">•</span>
          <span className="text-turquesa">{totalEvaluated} {isEngagement ? 'ENCUESTAS REGISTRADAS' : 'PERSONAS EVALUADAS'}</span>
        </h3>
      </div>

      {/* Table Header - Dark Azul Petróleo #1F2A33 */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-petroleo text-white font-bold uppercase tracking-wider text-[11px]">
              <th className="py-3.5 px-5 font-extrabold w-2/5">{isEngagement ? 'FACTOR / PREGUNTA' : 'PRINCIPIO / PREGUNTA'}</th>
              <th className="py-3.5 px-3 text-center font-extrabold text-menta">{isEngagement ? 'SATISFECHOS (≥7)' : 'CORRECTAS'}</th>
              <th className="py-3.5 px-3 text-center font-extrabold text-mostaza">{isEngagement ? 'BAJA SATISF. (<7)' : 'INCORRECTAS'}</th>
              <th className="py-3.5 px-5 font-extrabold">{isEngagement ? 'NPS' : '% ACIERTO'}</th>
              <th className="py-3.5 px-4 text-center font-extrabold">ESTADO</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gris-claro font-medium">
            {questionAnalysisList.map((q, idx) => {
              const isExpanded = expandedIndex === idx;
              const npsVal = q.nps ?? 0;
              const isCritical = isEngagement ? (npsVal < 0) : (q.successRate < 60);
              const isWarning = isEngagement ? (npsVal >= 0 && npsVal < 50) : (q.successRate >= 60 && q.successRate < 85);

              // Format success rate with comma decimal if needed (e.g., 56,5%)
              const successRateFormatted = q.successRate.toFixed(1).replace('.', ',');

              // For progress bar width
              const progressWidth = isEngagement 
                ? Math.max(0, Math.min(100, Math.round(((npsVal + 100) / 200) * 100)))
                : q.successRate;

              return (
                <React.Fragment key={idx}>
                  <tr 
                    onClick={() => toggleExpand(idx)}
                    className="hover:bg-gris-claro/50 cursor-pointer transition-colors"
                  >
                    {/* Question text */}
                    <td className="py-3.5 px-5 text-negro-suave font-semibold text-xs leading-relaxed">
                      {q.questionText}
                    </td>

                    {/* Correct Count */}
                    <td className="py-3.5 px-3 text-center font-extrabold text-azul-corp text-sm">
                      {q.correctCount}
                    </td>

                    {/* Incorrect Count */}
                    <td className="py-3.5 px-3 text-center font-extrabold text-mostaza text-sm">
                      {q.failedCount}
                    </td>

                    {/* % Acierto (Progress Bar + Percentage label) */}
                    <td className="py-3.5 px-5">
                      <div className="flex items-center gap-3">
                        <div className="flex-1 bg-gris-claro rounded-full h-3 overflow-hidden shadow-inner">
                          <div 
                            className={`h-3 rounded-full transition-all ${
                              isCritical ? 'bg-mostaza' : isWarning ? 'bg-amarillo-claro' : 'bg-turquesa'
                            }`}
                            style={{ width: `${progressWidth}%` }}
                          />
                        </div>
                        <span className="font-extrabold text-negro-suave text-xs w-12 text-right">
                          {isEngagement ? (npsVal > 0 ? `+${npsVal}` : npsVal) : `${successRateFormatted}%`}
                        </span>
                      </div>
                    </td>

                    {/* Estado Pill */}
                    <td className="py-3.5 px-4 text-center">
                      <div className="flex items-center justify-center gap-1">
                        {isCritical ? (
                          <span className="bg-mostaza/20 text-petroleo text-[11px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider border border-mostaza">
                            {isEngagement ? 'CRÍTICO' : 'CRÍTICO'}
                          </span>
                        ) : isWarning ? (
                          <span className="bg-amarillo-claro text-petroleo text-[11px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider border border-mostaza/50">
                            {isEngagement ? 'REVISAR' : 'REVISAR'}
                          </span>
                        ) : (
                          <span className="bg-menta/30 text-petroleo text-[11px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider border border-turquesa/50">
                            {isEngagement ? 'EXCELENTE' : 'BIEN'}
                          </span>
                        )}
                        <button className="text-gris-medio hover:text-petroleo p-0.5">
                          {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        </button>
                      </div>
                    </td>
                  </tr>

                  {/* Expanded Incorrect Answers Drawer */}
                  {isExpanded && (
                    <tr className="bg-gris-claro/60">
                      <td colSpan={5} className="p-4 border-t border-gris-medio/30 text-xs">
                        <div className="space-y-2">
                          <div className="flex items-center justify-between font-bold text-negro-suave">
                            <span className="flex items-center gap-1.5">
                              <Users className="w-4 h-4 text-azul-corp" />
                              {isEngagement 
                                ? `Personas con baja satisfacción en esta pregunta (< 7) (${q.failedParticipants.length}):`
                                : `Personas con respuesta incorrecta en esta pregunta (${q.failedParticipants.length}):`
                              }
                            </span>
                          </div>

                          {q.failedParticipants.length > 0 ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
                              {q.failedParticipants.map((fp, fpIdx) => (
                                <div key={fpIdx} className="p-2.5 bg-white rounded-lg border border-gris-medio/30 text-xs flex justify-between items-center gap-2">
                                  <div>
                                    <span className="font-bold text-negro-suave">{fp.name}</span>
                                    <span className="text-gris-medio text-[11px] ml-1.5">({fp.regional})</span>
                                  </div>
                                  <span className="text-petroleo bg-amarillo-claro/50 text-[10px] font-bold px-2.5 py-0.5 rounded border border-mostaza/30 truncate max-w-[180px]">
                                    {isEngagement ? `Calificación: ${fp.userAnswer}` : `"${fp.userAnswer}"`}
                                  </span>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="p-2.5 bg-menta/40 text-petroleo rounded-lg text-xs font-semibold">
                              {isEngagement 
                                ? '✓ Todas las personas se encuentran satisfechas con este factor.'
                                : '✓ Ninguna persona se equivocó en este principio.'
                              }
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

