import React, { useState, useEffect } from 'react';
import {
  CheckCircle2,
  XCircle,
  Eye,
  ArrowUpDown,
  Download,
  Search,
  X,
  AlertCircle,
  Smile,
  Meh,
  Frown,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  List
} from 'lucide-react';
import { ParticipantResponse } from '../types/survey';

interface ParticipantTableProps {
  responses: ParticipantResponse[];
  onExport: () => void;
  passingThresholdPercent: number;
  searchTerm?: string;
  onSearchChange?: (term: string) => void;
  surveyType?: string;
}

export const ParticipantTable: React.FC<ParticipantTableProps> = ({
  responses,
  onExport,
  passingThresholdPercent,
  searchTerm = '',
  onSearchChange,
  surveyType
}) => {
  const isEngagement = surveyType === 'engagement';
  const [selectedParticipant, setSelectedParticipant] = useState<ParticipantResponse | null>(null);
  const [sortField, setSortField] = useState<'name' | 'scorePercentage' | 'regional' | 'totalPoints'>('scorePercentage');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Pagination State (Default 20 items per page as requested)
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [itemsPerPage, setItemsPerPage] = useState<number>(20);

  // Reset to page 1 whenever responses or search/sort change
  useEffect(() => {
    setCurrentPage(1);
  }, [responses.length, searchTerm, sortField, sortOrder, itemsPerPage]);

  const handleSort = (field: 'name' | 'scorePercentage' | 'regional' | 'totalPoints') => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
  };

  const sortedResponses = [...(responses || [])].sort((a, b) => {
    if (!a && !b) return 0;
    if (!a) return 1;
    if (!b) return -1;

    let aVal = a[sortField];
    let bVal = b[sortField];

    if (typeof aVal === 'string' || typeof bVal === 'string') {
      const strA = String(aVal ?? '');
      const strB = String(bVal ?? '');
      return sortOrder === 'asc' 
        ? strA.localeCompare(strB)
        : strB.localeCompare(strA);
    }

    const numA = Number(aVal) || 0;
    const numB = Number(bVal) || 0;

    return sortOrder === 'asc' 
      ? numA - numB
      : numB - numA;
  });

  // Calculate pagination slice
  const totalItems = sortedResponses.length;
  const isShowAll = itemsPerPage === -1;
  const totalPages = isShowAll ? 1 : Math.ceil(totalItems / (itemsPerPage || 20)) || 1;
  const safeCurrentPage = Math.min(Math.max(currentPage, 1), totalPages);

  const startIndex = isShowAll ? 0 : (safeCurrentPage - 1) * itemsPerPage;
  const endIndex = isShowAll ? totalItems : Math.min(startIndex + itemsPerPage, totalItems);
  const paginatedResponses = isShowAll ? sortedResponses : sortedResponses.slice(startIndex, endIndex);

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden mb-8">
      {/* Banner Header - Dark Petróleo #1F2A33 */}
      <div className="bg-petroleo border-b border-azul-corp px-5 py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-turquesa animate-pulse"></span>
          <h3 className="text-sm font-black text-white uppercase tracking-wide">
            PERSONAS EVALUADAS
          </h3>
          <span className="bg-azul-corp text-turquesa text-xs font-black px-2.5 py-0.5 rounded-full border border-turquesa/40">
            {totalItems} Registros
          </span>
        </div>

        <div className="flex items-center gap-3">
          {/* Items per page selector in header */}
          <div className="flex items-center gap-1.5 bg-azul-corp/70 px-2.5 py-1 rounded-lg border border-turquesa/30 text-xs text-white font-bold">
            <List className="w-3.5 h-3.5 text-turquesa" />
            <span className="text-gris-claro">Por página:</span>
            <select
              value={itemsPerPage}
              onChange={(e) => setItemsPerPage(Number(e.target.value))}
              className="bg-transparent font-black text-turquesa focus:outline-none cursor-pointer"
            >
              <option value={20} className="bg-petroleo text-white">20</option>
              <option value={50} className="bg-petroleo text-white">50</option>
              <option value={100} className="bg-petroleo text-white">100</option>
              <option value={-1} className="bg-petroleo text-white">Todos ({totalItems})</option>
            </select>
          </div>

          <button
            onClick={onExport}
            className="inline-flex items-center gap-1.5 px-3 py-1 bg-mostaza hover:bg-mostaza/90 text-petroleo text-xs font-black rounded-lg transition-colors shadow-xs"
          >
            <Download className="w-3.5 h-3.5 text-petroleo" />
            <span>Exportar Excel</span>
          </button>
        </div>
      </div>

      {/* Search Bar & Pagination info top bar */}
      <div className="p-3.5 bg-slate-50 border-b border-slate-200 flex flex-col md:flex-row items-center justify-between gap-3">
        {onSearchChange && (
          <div className="relative w-full md:w-96">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Buscar por nombre, cargo, ciudad o regional..."
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-lg text-xs focus:outline-none focus:border-teal-500 font-medium text-slate-800 placeholder-slate-400 shadow-2xs"
            />
          </div>
        )}

        {totalItems > 0 && (
          <div className="text-xs text-slate-600 font-medium">
            Mostrando <span className="font-bold text-slate-900">{totalItems > 0 ? startIndex + 1 : 0}</span> a <span className="font-bold text-slate-900">{endIndex}</span> de <span className="font-bold text-slate-900">{totalItems}</span> evaluados
          </div>
        )}
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[11px] bg-slate-50/80">
              <th className="py-3 px-5 font-bold cursor-pointer hover:text-slate-800" onClick={() => handleSort('name')}>
                <div className="flex items-center gap-1">
                  <span>NOMBRE</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-400" />
                </div>
              </th>
              <th className="py-3 px-4 font-bold cursor-pointer hover:text-slate-800" onClick={() => handleSort('regional')}>
                <div className="flex items-center gap-1">
                  <span>REGIONAL</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-400" />
                </div>
              </th>
              <th className="py-3 px-4 font-bold">SEDE / CIUDAD</th>
              <th className="py-3 px-4 font-bold">CARGO</th>
              <th className="py-3 px-4 font-bold">TIPO</th>
              <th className="py-3 px-4 font-bold cursor-pointer hover:text-slate-800" onClick={() => handleSort('totalPoints')}>
                <div className="flex items-center gap-1">
                  <span>{isEngagement ? 'CALIFICACIÓN' : 'PUNTAJE'}</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-400" />
                </div>
              </th>
              {!isEngagement && <th className="py-3 px-4 text-center font-bold">ESTADO</th>}
              <th className="py-3 px-4 text-center font-bold">SATISFACCIÓN</th>
              <th className="py-3 px-4 text-right font-bold">DETALLE</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
            {paginatedResponses.map((r, index) => {
              const status = r.statusType || (r.scorePercentage >= 90 ? 'PROMOTOR' : r.scorePercentage >= 70 ? 'NEUTRO' : 'DETRACTOR');
              const isPassed = r.passed || r.totalPoints >= r.maxPointsPossible;

              return (
                <tr key={`${r.id}-${index}`} className="hover:bg-slate-50/80 transition-colors">
                  {/* Name */}
                  <td className="py-3.5 px-5 font-bold text-slate-900 text-xs">
                    {r.name}
                  </td>

                  {/* Regional */}
                  <td className="py-3.5 px-4 font-semibold text-slate-700">
                    {r.regional || 'General'}
                  </td>

                  {/* Sede / Ciudad */}
                  <td className="py-3.5 px-4 text-slate-600 font-medium">
                    {r.city || 'DC Popayan'}
                  </td>

                  {/* Cargo */}
                  <td className="py-3.5 px-4 text-slate-600">
                    {r.cargo}
                  </td>

                  {/* Tipo Capacitación */}
                  <td className="py-3.5 px-4">
                    <span className="bg-slate-100 text-slate-700 text-[11px] font-bold px-2.5 py-0.5 rounded-md border border-slate-200 whitespace-nowrap">
                      {r.trainingType || 'Inicial'}
                    </span>
                  </td>

                  {/* Numerical Points */}
                  <td className="py-3.5 px-4">
                    <span className="font-black text-slate-900 text-xs bg-slate-100 px-2.5 py-1 rounded-md">
                      {isEngagement 
                        ? `${(r.totalPoints / (r.maxPointsPossible / 10)).toFixed(1).replace('.', ',')} / 10`
                        : `${r.totalPoints} / ${r.maxPointsPossible} pts`
                      }
                    </span>
                  </td>

                  {/* Estado (Aprobó vs Retroalimentar) */}
                  {!isEngagement && (
                    <td className="py-3.5 px-4 text-center">
                      {isPassed ? (
                        <span className="bg-teal-100 text-teal-800 text-[11px] font-black px-3 py-0.5 rounded-full uppercase tracking-wider border border-teal-300">
                          ✓ APROBÓ
                        </span>
                      ) : (
                        <span className="bg-amber-100 text-amber-900 text-[11px] font-black px-3 py-0.5 rounded-full uppercase tracking-wider border border-amber-300 whitespace-nowrap">
                          ⚠️ RETROALIMENTAR
                        </span>
                      )}
                    </td>
                  )}

                  {/* Satisfacción Pill (PROMOTOR, NEUTRO, DETRACTOR) */}
                  <td className="py-3.5 px-4 text-center">
                    {status === 'PROMOTOR' ? (
                      <span className="bg-emerald-100 text-emerald-800 text-[11px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider border border-emerald-300 inline-flex items-center gap-1">
                        <Smile className="w-3.5 h-3.5 text-emerald-600" />
                        PROMOTOR (9-10)
                      </span>
                    ) : status === 'NEUTRO' ? (
                      <span className="bg-amber-100 text-amber-800 text-[11px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider border border-amber-300 inline-flex items-center gap-1">
                        <Meh className="w-3.5 h-3.5 text-amber-600" />
                        NEUTRO (7-8)
                      </span>
                    ) : (
                      <span className="bg-red-100 text-red-800 text-[11px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider border border-red-300 inline-flex items-center gap-1">
                        <Frown className="w-3.5 h-3.5 text-red-600" />
                        DETRACTOR (0-6)
                      </span>
                    )}
                  </td>

                  {/* Action */}
                  <td className="py-3.5 px-4 text-right">
                    <button
                      onClick={() => setSelectedParticipant(r)}
                      className="p-1.5 text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors inline-flex items-center gap-1 font-medium text-xs"
                      title="Ver respuestas del evaluado"
                    >
                      <Eye className="w-3.5 h-3.5 text-slate-600" />
                      <span>Ver</span>
                    </button>
                  </td>
                </tr>
              );
            })}

            {paginatedResponses.length === 0 && (
              <tr>
                <td colSpan={9} className="p-8 text-center text-slate-400 font-medium">
                  No se encontraron evaluados para la búsqueda o filtros aplicados.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls Footer */}
      {!isShowAll && totalPages > 1 && (
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <div className="text-slate-600 font-medium">
            Página <span className="font-bold text-slate-900">{safeCurrentPage}</span> de <span className="font-bold text-slate-900">{totalPages}</span>
          </div>

          <div className="flex items-center gap-1">
            {/* First Page */}
            <button
              onClick={() => setCurrentPage(1)}
              disabled={safeCurrentPage === 1}
              className="p-1.5 rounded-md border border-slate-200 bg-white hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors text-slate-700"
              title="Primera página"
            >
              <ChevronsLeft className="w-4 h-4" />
            </button>

            {/* Previous Page */}
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={safeCurrentPage === 1}
              className="p-1.5 rounded-md border border-slate-200 bg-white hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors text-slate-700 flex items-center gap-1 px-2 font-medium"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Anterior</span>
            </button>

            {/* Page number buttons */}
            <div className="flex items-center gap-1 mx-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter(page => page === 1 || page === totalPages || Math.abs(page - safeCurrentPage) <= 1)
                .reduce<(number | string)[]>((acc, page, idx, array) => {
                  if (idx > 0 && page - (array[idx - 1] as number) > 1) {
                    acc.push('...');
                  }
                  acc.push(page);
                  return acc;
                }, [])
                .map((item, index) => {
                  if (item === '...') {
                    return <span key={`dots-${index}`} className="px-1 text-slate-400">...</span>;
                  }
                  const pageNum = item as number;
                  return (
                    <button
                      key={pageNum}
                      onClick={() => setCurrentPage(pageNum)}
                      className={`min-w-[28px] h-7 rounded-md font-bold text-xs transition-colors ${
                        safeCurrentPage === pageNum
                          ? 'bg-slate-900 text-white'
                          : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
            </div>

            {/* Next Page */}
            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={safeCurrentPage === totalPages}
              className="p-1.5 rounded-md border border-slate-200 bg-white hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors text-slate-700 flex items-center gap-1 px-2 font-medium"
            >
              <span>Siguiente</span>
              <ChevronRight className="w-4 h-4" />
            </button>

            {/* Last Page */}
            <button
              onClick={() => setCurrentPage(totalPages)}
              disabled={safeCurrentPage === totalPages}
              className="p-1.5 rounded-md border border-slate-200 bg-white hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors text-slate-700"
              title="Última página"
            >
              <ChevronsRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {selectedParticipant && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200">
            
            {/* Modal Header */}
            <div className="bg-petroleo text-white p-5 flex items-center justify-between sticky top-0 z-10 border-b border-azul-corp">
              <div>
                <span className="text-xs text-mostaza font-bold uppercase tracking-wider">
                  {isEngagement ? 'Detalle de la Encuesta Anónima' : 'Detalle de la Evaluación'}
                </span>
                <h3 className="text-lg font-bold text-white mt-0.5">
                  {selectedParticipant.name}
                </h3>
              </div>
              <button
                onClick={() => setSelectedParticipant(null)}
                className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-6">
              {/* Summary Strip */}
              <div className="grid grid-cols-2 sm:grid-cols-6 gap-3 text-xs bg-slate-50 p-4 rounded-xl border border-slate-200">
                <div>
                  <div className="text-slate-500">Cédula / Documento:</div>
                  <div className="font-bold text-slate-900">{selectedParticipant.identification || 'N/A'}</div>
                </div>
                <div>
                  <div className="text-slate-500">Regional / Ciudad:</div>
                  <div className="font-bold text-slate-900">{selectedParticipant.regional} ({selectedParticipant.city || 'N/A'})</div>
                </div>
                <div>
                  <div className="text-slate-500">Operador / Cargo:</div>
                  <div className="font-bold text-slate-900">{selectedParticipant.operator} • {selectedParticipant.cargo}</div>
                </div>
                <div>
                  <div className="text-slate-500">{isEngagement ? 'Calificación Promedio:' : 'Puntaje Numérico:'}</div>
                  <div className="font-black text-slate-900 text-xs">
                    {isEngagement 
                      ? `${(selectedParticipant.totalPoints / (selectedParticipant.maxPointsPossible / 10)).toFixed(1).replace('.', ',')} / 10`
                      : `${selectedParticipant.totalPoints} / ${selectedParticipant.maxPointsPossible} Puntos (${selectedParticipant.scorePercentage}%)`
                    }
                  </div>
                </div>
                {!isEngagement && (
                  <div>
                    <div className="text-slate-500">Estado Evaluación:</div>
                    <div className={`font-black uppercase ${
                      (selectedParticipant.passed || selectedParticipant.totalPoints >= selectedParticipant.maxPointsPossible)
                        ? 'text-teal-700' 
                        : 'text-amber-800'
                    }`}>
                      {(selectedParticipant.passed || selectedParticipant.totalPoints >= selectedParticipant.maxPointsPossible) ? '✓ APROBÓ' : '⚠️ RETROALIMENTAR'}
                    </div>
                  </div>
                )}
                <div className={isEngagement ? "col-span-2" : ""}>
                  <div className="text-slate-500">Satisfacción:</div>
                  <div className={`font-black uppercase ${
                    selectedParticipant.statusType === 'PROMOTOR' 
                      ? 'text-emerald-700' 
                      : selectedParticipant.statusType === 'NEUTRO' 
                        ? 'text-amber-700' 
                        : 'text-red-600'
                  }`}>
                    {selectedParticipant.statusType || (selectedParticipant.scorePercentage >= 90 ? 'PROMOTOR' : selectedParticipant.scorePercentage >= 70 ? 'NEUTRO' : 'DETRACTOR')}
                  </div>
                </div>
              </div>

              {/* Questions List */}
              <div>
                <h4 className="text-xs font-extrabold text-slate-700 uppercase tracking-wider mb-3">
                  {isEngagement ? 'Respuestas de Satisfacción (1-10)' : 'Respuestas de la Encuesta'} ({selectedParticipant.questions.length})
                </h4>
                <div className="space-y-3">
                  {selectedParticipant.questions.map((q, idx) => {
                    const isSatisfiedQ = isEngagement ? q.pointsObtained >= 7 : q.isCorrect;

                    return (
                      <div
                        key={idx}
                        className={`p-3.5 rounded-xl border text-xs space-y-1.5 ${
                          isSatisfiedQ ? 'bg-emerald-50/40 border-emerald-200' : 'bg-red-50/40 border-red-200'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <span className="font-bold text-slate-900">
                            {idx + 1}. {q.questionText}
                          </span>
                          <span className={`font-bold px-2 py-0.5 rounded text-[11px] ${
                            isSatisfiedQ ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
                          }`}>
                            {q.pointsObtained} / {q.maxPoints} {isEngagement ? 'Satisfacción' : 'pts'}
                          </span>
                        </div>
                        <div className="text-slate-700 bg-white p-2 rounded border border-slate-200 italic font-bold">
                          {isEngagement ? `Nivel de Satisfacción: ${q.pointsObtained}` : `"${q.userAnswer || 'Sin respuesta'}"`}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end">
              <button
                onClick={() => setSelectedParticipant(null)}
                className="px-4 py-2 bg-slate-900 text-white text-xs font-bold rounded-lg hover:bg-slate-800 transition-colors"
              >
                Cerrar
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
};

