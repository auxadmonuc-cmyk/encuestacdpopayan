import React from 'react';
import { BLOCK_LIST, getQuestionBlock } from '../utils/engagementBlocks';
import { ParticipantResponse } from '../types/survey';
import { Shield, TrendingUp, MessageSquare, Heart, Award, Users, CheckCircle2, AlertTriangle, ArrowRight } from 'lucide-react';

interface EngagementBlockTableProps {
  responses: ParticipantResponse[];
  activeBlock: string;
  onBlockSelect: (block: string) => void;
}

export const EngagementBlockTable: React.FC<EngagementBlockTableProps> = ({
  responses,
  activeBlock,
  onBlockSelect
}) => {
  // Calculate metrics for each block
  const blockMetrics = BLOCK_LIST.map((blockName) => {
    let totalScore = 0;
    let totalPossible = 0;
    let totalAnswers = 0;
    let favorableAnswers = 0;
    let promotersCount = 0;
    let detractorsCount = 0;
    let questionCount = 0;

    // Determine questions in this block
    const sampleResponse = responses[0];
    if (sampleResponse && Array.isArray(sampleResponse.questions)) {
      questionCount = sampleResponse.questions.filter(
        (q) => getQuestionBlock(q.questionText) === blockName
      ).length;
    }

    responses.forEach((r) => {
      if (!r || !Array.isArray(r.questions)) return;
      r.questions.forEach((q) => {
        if (getQuestionBlock(q.questionText) === blockName) {
          totalScore += q.pointsObtained;
          totalPossible += q.maxPoints;
          totalAnswers++;
          // Favorable is >= 7 for 1-10 scale
          if (q.pointsObtained >= 7) {
            favorableAnswers++;
          }
          const score10 = q.maxPoints > 0 ? (q.pointsObtained / q.maxPoints) * 10 : 0;
          if (score10 >= 9.0) {
            promotersCount++;
          } else if (score10 <= 6.0) {
            detractorsCount++;
          }
        }
      });
    });

    const averageScore = totalAnswers > 0 ? (totalScore / totalAnswers) : 0;
    const favorabilityPercent = totalAnswers > 0 ? Math.round((favorableAnswers / totalAnswers) * 100) : 0;
    const nps = totalAnswers > 0 ? Math.round(((promotersCount - detractorsCount) / totalAnswers) * 100) : 0;

    return {
      name: blockName,
      questionCount,
      averageScore: Math.round(averageScore * 10) / 10,
      favorabilityPercent,
      nps,
      totalAnswers
    };
  });

  // Icon selector helper
  const getBlockIcon = (name: string) => {
    switch (name) {
      case 'Seguridad':
        return <Shield className="w-4 h-4 text-emerald-600" />;
      case 'Crecimiento y reconocimiento':
        return <TrendingUp className="w-4 h-4 text-blue-600" />;
      case 'Comunicación y claridad':
        return <MessageSquare className="w-4 h-4 text-purple-600" />;
      case 'Engagement':
        return <Heart className="w-4 h-4 text-rose-600" />;
      case 'Eficacia de Gerente':
        return <Award className="w-4 h-4 text-amber-600" />;
      case 'Cultura, diversidad e inclusión':
        return <Users className="w-4 h-4 text-indigo-600" />;
      default:
        return <Shield className="w-4 h-4 text-slate-600" />;
    }
  };

  const getLevelBadge = (avg: number) => {
    if (avg >= 8.0) {
      return (
        <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-800 text-[10px] font-black px-2 py-0.5 rounded-full border border-emerald-200">
          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
          <span>ALTO</span>
        </span>
      );
    } else if (avg >= 6.5) {
      return (
        <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-800 text-[10px] font-black px-2 py-0.5 rounded-full border border-amber-200">
          <CheckCircle2 className="w-3 h-3 text-amber-500" />
          <span>MEDIO</span>
        </span>
      );
    } else {
      return (
        <span className="inline-flex items-center gap-1 bg-red-50 text-red-800 text-[10px] font-black px-2 py-0.5 rounded-full border border-red-200">
          <AlertTriangle className="w-3 h-3 text-red-500" />
          <span>CRÍTICO</span>
        </span>
      );
    }
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
      {/* Table Banner */}
      <div className="bg-petroleo border-b border-azul-corp px-5 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-turquesa animate-pulse"></span>
          <h3 className="text-sm font-black text-white uppercase tracking-wide">
            Resumen de Bloques y Dimensiones de Engagement
          </h3>
        </div>
        <span className="bg-azul-corp text-turquesa text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider border border-turquesa/30">
          6 Dimensiones
        </span>
      </div>

      <div className="p-3 bg-slate-50 border-b border-slate-200">
        <p className="text-xs text-slate-600 font-medium">
          💡 <span className="font-bold">Interactividad:</span> Haz clic en una dimensión para segmentar el análisis de preguntas por este bloque específico. Las calificaciones se basan en una escala de 1 a 10.
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[11px] bg-slate-50/80">
              <th className="py-3 px-5 font-bold">DIMENSIÓN / BLOQUE</th>
              <th className="py-3 px-4 text-center font-bold">PREGUNTAS</th>
              <th className="py-3 px-4 text-center font-bold">PROMEDIO CALIF. (1-10)</th>
              <th className="py-3 px-4 text-center font-bold">NPS</th>
              <th className="py-3 px-4 text-center font-bold">NIVEL</th>
              <th className="py-3 px-5 text-right font-bold">FILTRAR</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
            {blockMetrics.map((b) => {
              const isSelected = activeBlock === b.name;
              return (
                <tr
                  key={b.name}
                  onClick={() => onBlockSelect(isSelected ? 'ALL' : b.name)}
                  className={`cursor-pointer transition-colors ${
                    isSelected
                      ? 'bg-emerald-50/70 hover:bg-emerald-50 font-bold'
                      : 'hover:bg-slate-50/80'
                  }`}
                >
                  {/* Block Name */}
                  <td className="py-3.5 px-5 font-bold text-slate-900 text-xs flex items-center gap-2.5">
                    <div className={`p-1.5 rounded-lg border ${isSelected ? 'bg-emerald-100 border-emerald-300' : 'bg-slate-100 border-slate-200'}`}>
                      {getBlockIcon(b.name)}
                    </div>
                    <span>{b.name}</span>
                  </td>

                  {/* Question Count */}
                  <td className="py-3.5 px-4 text-center text-slate-600 font-semibold">
                    {b.questionCount}
                  </td>

                  {/* Average Score */}
                  <td className="py-3.5 px-4 text-center">
                    <span className={`font-black text-xs px-2.5 py-1 rounded-md ${
                      b.averageScore >= 8.0 
                        ? 'bg-emerald-50 text-emerald-900 border border-emerald-200' 
                        : b.averageScore >= 6.5 
                        ? 'bg-amber-50 text-amber-900 border border-amber-200' 
                        : 'bg-red-50 text-red-900 border border-red-200'
                    }`}>
                      {b.averageScore.toFixed(1).replace('.', ',')} / 10
                    </span>
                  </td>

                  {/* NPS */}
                  <td className="py-3.5 px-4 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-16 bg-slate-100 rounded-full h-1.5 overflow-hidden">
                        <div
                          className={`h-full rounded-full ${
                            b.nps >= 50 
                              ? 'bg-emerald-500' 
                              : b.nps >= 0 
                              ? 'bg-amber-500' 
                              : 'bg-red-500'
                          }`}
                          style={{ width: `${Math.max(0, Math.min(100, Math.round(((b.nps + 100) / 200) * 100)))}%` }}
                        />
                      </div>
                      <span className="font-black text-slate-900 w-10 text-left">
                        {b.nps > 0 ? `+${b.nps}` : b.nps}
                      </span>
                    </div>
                  </td>

                  {/* Level Badge */}
                  <td className="py-3.5 px-4 text-center">
                    {getLevelBadge(b.averageScore)}
                  </td>

                  {/* Action Link */}
                  <td className="py-3.5 px-5 text-right">
                    <span className={`inline-flex items-center gap-1 text-[11px] font-black uppercase transition-colors ${
                      isSelected ? 'text-emerald-700' : 'text-slate-400 group-hover:text-slate-600'
                    }`}>
                      <span>{isSelected ? 'Filtrado' : 'Seleccionar'}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
