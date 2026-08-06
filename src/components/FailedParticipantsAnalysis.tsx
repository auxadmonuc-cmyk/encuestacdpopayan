import React, { useState } from 'react';
import {
  AlertTriangle,
  XCircle,
  CheckCircle2,
  UserCheck,
  Search,
  FileText,
  Printer,
  ChevronRight,
  BookOpen,
  ArrowRight,
  ShieldAlert,
  Award,
  Clock,
  Building2,
  Briefcase
} from 'lucide-react';
import { ParticipantResponse, QuestionDetail } from '../types/survey';

interface FailedParticipantsAnalysisProps {
  failedParticipants: ParticipantResponse[];
  passingThresholdPercent: number;
  totalParticipantsCount: number;
}

export const FailedParticipantsAnalysis: React.FC<FailedParticipantsAnalysisProps> = ({
  failedParticipants,
  passingThresholdPercent,
  totalParticipantsCount
}) => {
  const [selectedParticipant, setSelectedParticipant] = useState<ParticipantResponse | null>(
    failedParticipants.length > 0 ? failedParticipants[0] : null
  );
  const [searchTerm, setSearchTerm] = useState('');

  const filteredFailed = (failedParticipants || []).filter(p => {
    if (!p) return false;
    if (!searchTerm.trim()) return true;
    const term = searchTerm.toLowerCase();
    const safeStr = (val: any) => (val === null || val === undefined) ? '' : String(val).toLowerCase();
    return (
      safeStr(p.name).includes(term) ||
      safeStr(p.identification).includes(term) ||
      safeStr(p.email).includes(term) ||
      safeStr(p.regional).includes(term)
    );
  });

  const handlePrintDiagnostic = () => {
    window.print();
  };

  if (failedParticipants.length === 0) {
    return (
      <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-8 text-center max-w-2xl mx-auto my-8">
        <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle2 className="w-8 h-8" />
        </div>
        <h3 className="text-lg font-bold text-emerald-900">¡Sin Personas Reprobadas!</h3>
        <p className="text-sm text-emerald-700 mt-2">
          Todos los {totalParticipantsCount} evaluados han alcanzado o superado el puntaje mínimo de aprobación ({passingThresholdPercent}%).
        </p>
      </div>
    );
  }

  // Current active participant or first
  const current = selectedParticipant || failedParticipants[0];

  // Separate failed questions vs correct questions for active participant
  const failedQuestions = current ? current.questions.filter(q => !q.isCorrect) : [];
  const correctQuestions = current ? current.questions.filter(q => q.isCorrect) : [];

  return (
    <div className="space-y-6">
      {/* Top Banner Alert - Dark Petróleo #1F2A33 */}
      <div className="bg-petroleo text-white rounded-2xl p-6 shadow-md border border-azul-corp flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-azul-corp/50 text-mostaza rounded-xl border border-turquesa/30 flex-shrink-0">
            <ShieldAlert className="w-8 h-8" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold tracking-tight">Análisis de Diagnóstico de Reprobados</h2>
              <span className="bg-mostaza/20 text-mostaza text-xs font-bold px-2.5 py-0.5 rounded-full border border-mostaza/40">
                {failedParticipants.length} Colaboradores
              </span>
            </div>
            <p className="text-xs text-gris-claro/90 mt-1 max-w-2xl">
              Reporte detallado de respuestas incorrectas, conceptos fallados y plan de refuerzo recomendado para el personal que no alcanzó el umbral mínimo ({passingThresholdPercent}%).
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 bg-negro-suave/50 p-3 rounded-xl border border-azul-corp self-start md:self-auto">
          <div className="text-right">
            <div className="text-xs text-gris-medio">Índice de Pérdida</div>
            <div className="text-lg font-black text-mostaza">
              {Math.round((failedParticipants.length / (totalParticipantsCount || 1)) * 100)}%
            </div>
          </div>
        </div>
      </div>

      {/* Main Split Layout: Directory Left | Diagnostic Report Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Column: Failed Participants Directory (Width: 4/12) */}
        <div className="lg:col-span-4 bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden flex flex-col max-h-[850px]">
          <div className="p-4 border-b border-slate-100 bg-slate-50">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-red-500" />
                Listado de Reprobados
              </h3>
              <span className="text-xs font-semibold text-slate-500">
                {filteredFailed.length} de {failedParticipants.length}
              </span>
            </div>

            {/* Local Search */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
              <input
                type="text"
                placeholder="Filtrar por nombre o cédula..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs focus:outline-none focus:border-red-500 text-slate-800"
              />
            </div>
          </div>

          {/* List */}
          <div className="overflow-y-auto divide-y divide-slate-100 flex-1">
            {filteredFailed.map((participant) => {
              const isSelected = current && current.id === participant.id;
              const errorsCount = participant.questions.filter(q => !q.isCorrect).length;

              return (
                <button
                  key={participant.id}
                  onClick={() => setSelectedParticipant(participant)}
                  className={`w-full text-left p-3.5 transition-all flex items-center justify-between group ${
                    isSelected
                      ? 'bg-red-50/80 border-l-4 border-l-red-600 font-medium'
                      : 'hover:bg-slate-50 border-l-4 border-l-transparent'
                  }`}
                >
                  <div className="space-y-1 pr-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-900 group-hover:text-red-700">
                        {participant.name}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-[11px] text-slate-500">
                      <span>CC: {participant.identification || 'N/A'}</span>
                      <span>•</span>
                      <span className="font-semibold text-slate-700">{participant.regional}</span>
                    </div>
                    <div className="text-[10px] text-slate-400 truncate max-w-[200px]">
                      {participant.operator} - {participant.cargo}
                    </div>
                  </div>

                  <div className="text-right flex-shrink-0">
                    <div className="text-xs font-bold text-red-600 bg-red-100/80 px-2 py-0.5 rounded-full inline-block">
                      {participant.scorePercentage}%
                    </div>
                    <div className="text-[10px] text-red-500 font-medium mt-1">
                      {`${errorsCount} error${errorsCount !== 1 ? 'es' : ''}`}
                    </div>
                  </div>
                </button>
              );
            })}

            {filteredFailed.length === 0 && (
              <div className="p-6 text-center text-slate-400 text-xs">
                No se encontraron personas con ese criterio.
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Detailed Diagnostic Card (Width: 8/12) */}
        <div className="lg:col-span-8 space-y-6">
          {current ? (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden print:shadow-none print:border-none">
              
              {/* Header Ficha Técnico-Diagnóstica */}
              <div className="bg-slate-900 text-white p-6 relative">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4 mb-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="bg-red-500/20 text-red-300 text-[11px] font-bold px-2.5 py-0.5 rounded-full border border-red-500/30 uppercase tracking-wider">
                        Ficha de Diagnóstico de Errores
                      </span>
                      <span className="text-slate-400 text-xs">ID: #{current.id}</span>
                    </div>
                    <h3 className="text-xl font-bold text-white tracking-tight">
                      {current.name}
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {current.email || 'Sin correo registrado'}
                    </p>
                  </div>

                  {/* Print / Export Action */}
                  <div className="flex items-center gap-2 print:hidden">
                    <button
                      onClick={handlePrintDiagnostic}
                      className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-lg border border-slate-700 transition-colors flex items-center gap-1.5"
                      title="Imprimir informe o guardar en PDF"
                    >
                      <Printer className="w-3.5 h-3.5 text-yellow-400" />
                      <span>Imprimir / PDF</span>
                    </button>
                  </div>
                </div>

                {/* Meta details grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  <div className="bg-slate-800/60 p-2.5 rounded-lg border border-slate-700/50">
                    <div className="text-slate-400 text-[10px] uppercase font-bold flex items-center gap-1">
                      <Building2 className="w-3 h-3 text-slate-400" /> Regional
                    </div>
                    <div className="font-semibold text-slate-200 mt-0.5">{current.regional || 'N/A'}</div>
                  </div>

                  <div className="bg-slate-800/60 p-2.5 rounded-lg border border-slate-700/50">
                    <div className="text-slate-400 text-[10px] uppercase font-bold flex items-center gap-1">
                      <Briefcase className="w-3 h-3 text-slate-400" /> Operador / Cargo
                    </div>
                    <div className="font-semibold text-slate-200 mt-0.5 truncate" title={`${current.operator} - ${current.cargo}`}>
                      {current.operator} ({current.cargo})
                    </div>
                  </div>

                  <div className="bg-slate-800/60 p-2.5 rounded-lg border border-slate-700/50">
                    <div className="text-slate-400 text-[10px] uppercase font-bold flex items-center gap-1">
                      <BookOpen className="w-3 h-3 text-slate-400" /> Capacitación
                    </div>
                    <div className="font-semibold text-slate-200 mt-0.5 truncate">
                      {current.trainingType || 'General'}
                    </div>
                  </div>

                  <div className="bg-slate-800/60 p-2.5 rounded-lg border border-slate-700/50">
                    <div className="text-slate-400 text-[10px] uppercase font-bold flex items-center gap-1">
                      <Clock className="w-3 h-3 text-slate-400" /> Tiempo
                    </div>
                    <div className="font-semibold text-slate-200 mt-0.5">
                      {current.durationMinutes} minutos
                    </div>
                  </div>
                </div>

                {/* Score Banner */}
                <div className="mt-4 bg-gradient-to-r from-red-950 to-slate-900 border border-red-800/60 rounded-xl p-4 flex items-center justify-between">
                  <div>
                    <div className="text-xs text-red-300 font-medium">Puntaje Final Obtenido</div>
                    <div className="text-2xl font-black text-red-400 mt-0.5">
                      {current.totalPoints} / {current.maxPointsPossible} pts ({current.scorePercentage}%)
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-slate-400">Puntaje Mínimo Requerido</div>
                    <div className="text-sm font-bold text-yellow-400 mt-0.5">
                      {passingThresholdPercent}% (Faltaron {passingThresholdPercent - current.scorePercentage}%)
                    </div>
                  </div>
                </div>
              </div>

              {/* Body: Section of Failed Questions */}
              <div className="p-6 space-y-6">
                
                {/* 1. Failed Questions Section */}
                <div>
                  <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-200">
                    <h4 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                      <XCircle className="w-5 h-5 text-red-600" />
                      Análisis de Preguntas Erróneas ({failedQuestions.length})
                    </h4>
                    <span className="text-xs text-red-600 font-bold bg-red-50 px-2.5 py-1 rounded-md border border-red-200">
                      Atención Requerida
                    </span>
                  </div>

                  <div className="space-y-4">
                    {failedQuestions.map((q, idx) => (
                      <div
                        key={q.id || idx}
                        className="bg-red-50/50 border-2 border-red-200 rounded-xl p-4 space-y-3"
                      >
                        {/* Question Title & Points */}
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-start gap-2">
                            <span className="w-6 h-6 rounded-full bg-red-600 text-white font-black text-xs flex items-center justify-center flex-shrink-0 mt-0.5">
                              {idx + 1}
                            </span>
                            <h5 className="text-sm font-bold text-slate-900 leading-snug">
                              {q.questionText}
                            </h5>
                          </div>
                          <span className="bg-red-100 text-red-700 text-xs font-black px-2.5 py-0.5 rounded-full border border-red-300 flex-shrink-0">
                            0 / {q.maxPoints} pts
                          </span>
                        </div>

                        {/* Wrong Answer Display */}
                        <div className="bg-white rounded-lg p-3 border border-red-200 text-xs">
                          <div className="text-[11px] font-bold text-red-700 uppercase tracking-wider mb-1 flex items-center gap-1">
                            <XCircle className="w-3.5 h-3.5 text-red-500" />
                            Respuesta Entregada por el Evaluado:
                          </div>
                          <div className="font-semibold text-slate-800 italic bg-red-50/80 p-2 rounded border border-red-100">
                            "{q.userAnswer || 'Sin respuesta o respuesta en blanco'}"
                          </div>
                        </div>

                        {/* Analysis / Comments */}
                        {q.comments && (
                          <div className="bg-amber-50 rounded-lg p-3 border border-amber-200 text-xs">
                            <div className="text-[11px] font-bold text-amber-800 uppercase tracking-wider mb-1 flex items-center gap-1">
                              <BookOpen className="w-3.5 h-3.5 text-amber-600" />
                              Observación del Diagnóstico / Concepto Correcto:
                            </div>
                            <div className="text-slate-700 font-medium">
                              {q.comments}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}

                    {failedQuestions.length === 0 && (
                      <div className="p-4 bg-emerald-50 text-emerald-800 text-xs rounded-xl">
                        No hay preguntas en cero puntos. El puntaje bajo proviene de ponderaciones acumuladas.
                      </div>
                    )}
                  </div>
                </div>

                {/* 2. Correct Questions Section (Collapsible or Summary) */}
                {correctQuestions.length > 0 && (
                  <div>
                    <h4 className="text-xs font-bold text-slate-600 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      Preguntas Correctas ({correctQuestions.length})
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {correctQuestions.map((cq, cIdx) => (
                        <div key={cIdx} className="bg-emerald-50/50 border border-emerald-200 rounded-lg p-2.5 text-xs flex items-center justify-between">
                          <span className="font-medium text-slate-800 truncate pr-2" title={cq.questionText}>
                            {cq.questionText}
                          </span>
                          <span className="text-emerald-700 font-bold flex-shrink-0">
                            +{cq.pointsObtained} pts
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 3. Recommended Action Plan */}
                <div className="bg-slate-900 text-white rounded-xl p-5 space-y-3">
                  <div className="flex items-center gap-2">
                    <BookOpen className="w-5 h-5 text-yellow-400" />
                    <h4 className="text-sm font-bold uppercase tracking-wider text-white">
                      Plan de Acción Recomendado para Formación
                    </h4>
                  </div>
                  <ul className="text-xs text-slate-300 space-y-2 list-disc pl-5">
                    <li>
                      <strong>Re-capacitación focalizada:</strong> Programar una sesión de refuerzo de 20 minutos con el facilitador enfocado en las {failedQuestions.length} preguntas falladas.
                    </li>
                    <li>
                      <strong>Repetición de evaluación:</strong> Asignar nuevamente el formulario tras verificar la lectura de la cartilla o política de la compañía.
                    </li>
                    <li>
                      <strong>Acompañamiento en puesto de trabajo:</strong> Verificar en el área de {current.cargo || 'operaciones'} la aplicación de las conductas de seguridad y principios.
                    </li>
                  </ul>
                </div>

              </div>

            </div>
          ) : (
            <div className="bg-white rounded-xl border border-slate-200 p-8 text-center text-slate-400 text-sm">
              Seleccione un colaborador del listado de la izquierda para ver su diagnóstico completo.
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
