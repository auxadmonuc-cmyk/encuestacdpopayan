import React from 'react';
import { Search, Filter, RotateCcw, MapPin, Calendar } from 'lucide-react';
import { FilterState } from '../types/survey';
import { BLOCK_LIST } from '../utils/engagementBlocks';

interface FilterBarProps {
  filters: FilterState;
  onFilterChange: (newFilters: FilterState) => void;
  onResetFilters: () => void;
  regionals: string[];
  cities: string[];
  operators: string[];
  cargos: string[];
  trainingTypes: string[];
  years: string[];
  months: string[];
  totalFilteredCount: number;
  activeSurveyType?: string;
}

export const FilterBar: React.FC<FilterBarProps> = ({
  filters,
  onFilterChange,
  onResetFilters,
  regionals,
  cities,
  operators,
  cargos,
  trainingTypes,
  years,
  months,
  totalFilteredCount,
  activeSurveyType
}) => {
  const activeFiltersCount = [
    filters.regional !== 'ALL',
    filters.city !== 'ALL',
    filters.operator !== 'ALL',
    filters.cargo !== 'ALL',
    filters.trainingType !== 'ALL',
    filters.year !== 'ALL',
    filters.month !== 'ALL',
    filters.status !== 'ALL',
    filters.satisfaction !== 'ALL',
    filters.engagementBlock && filters.engagementBlock !== 'ALL',
    filters.searchTerm.trim() !== ''
  ].filter(Boolean).length;

  return (
    <div className="bg-white rounded-xl p-4 shadow-xs border border-slate-200 space-y-3">
      {/* Filter Header */}
      <div className="flex items-center justify-between pb-2 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-emerald-600" />
          <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
            Filtros y Segmentación Multi-Criterio
          </h3>
          <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs px-2.5 py-0.5 rounded-full font-bold">
            {totalFilteredCount} resultados
          </span>
          {activeFiltersCount > 0 && (
            <span className="bg-yellow-100 text-yellow-800 border border-yellow-300 text-[11px] px-2 py-0.5 rounded-full font-bold">
              {`${activeFiltersCount} filtro${activeFiltersCount > 1 ? 's' : ''} activo${activeFiltersCount > 1 ? 's' : ''}`}
            </span>
          )}
        </div>

        <button
          onClick={onResetFilters}
          className="text-xs text-slate-500 hover:text-red-600 flex items-center gap-1 font-semibold transition-colors"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Limpiar Filtros</span>
        </button>
      </div>

      {/* Primary Grid - multi-column filter items */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2.5">
        {/* Search Input */}
        <div className="relative sm:col-span-2 lg:col-span-2 xl:col-span-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Buscar por Nombre, Cédula, Ciudad..."
            value={filters.searchTerm}
            onChange={(e) => onFilterChange({ ...filters, searchTerm: e.target.value })}
            className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:bg-white focus:outline-none focus:border-emerald-500 text-slate-800 placeholder-slate-400 font-medium"
          />
        </div>

        {/* Regional */}
        <div>
          <select
            value={filters.regional}
            onChange={(e) => onFilterChange({ ...filters, regional: e.target.value })}
            className="w-full px-2.5 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:bg-white focus:outline-none focus:border-emerald-500 text-slate-800 font-medium"
          >
            <option value="ALL">Todas las Regionales</option>
            {regionals.map(r => (
              <option key={r} value={r}>{r}</option>
            ))}
          </select>
        </div>

        {/* Ciudad (City) */}
        <div>
          <select
            value={filters.city}
            onChange={(e) => onFilterChange({ ...filters, city: e.target.value })}
            className={`w-full px-2.5 py-2 border rounded-lg text-xs focus:bg-white focus:outline-none focus:border-emerald-500 font-medium transition-colors ${
              filters.city !== 'ALL'
                ? 'bg-emerald-50 border-emerald-400 text-emerald-900 font-bold'
                : 'bg-slate-50 border-slate-200 text-slate-800'
            }`}
          >
            <option value="ALL">Todas las Ciudades</option>
            {cities.map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>

        {/* Operador */}
        <div>
          <select
            value={filters.operator}
            onChange={(e) => onFilterChange({ ...filters, operator: e.target.value })}
            className="w-full px-2.5 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:bg-white focus:outline-none focus:border-emerald-500 text-slate-800 font-medium"
          >
            <option value="ALL">Todos los Operadores</option>
            {operators.map(o => (
              <option key={o} value={o}>{o}</option>
            ))}
          </select>
        </div>

        {/* Tipo Capacitación (Inicial vs Reentrenamiento) */}
        <div>
          <select
            value={filters.trainingType}
            onChange={(e) => onFilterChange({ ...filters, trainingType: e.target.value })}
            className={`w-full px-2.5 py-2 border rounded-lg text-xs focus:bg-white focus:outline-none focus:border-emerald-500 font-medium transition-colors ${
              filters.trainingType !== 'ALL'
                ? 'bg-blue-50 border-blue-400 text-blue-900 font-bold'
                : 'bg-slate-50 border-slate-200 text-slate-800'
            }`}
          >
            <option value="ALL">Tipo: Inicial y Reentrenamiento</option>
            <option value="Inicial">Inicial</option>
            <option value="Reentrenamiento">Reentrenamiento</option>
            {trainingTypes
              .filter(t => t !== 'Inicial' && t !== 'Reentrenamiento')
              .map(t => (
                <option key={t} value={t}>{t}</option>
              ))}
          </select>
        </div>

        {/* Cargo */}
        <div>
          <select
            value={filters.cargo}
            onChange={(e) => onFilterChange({ ...filters, cargo: e.target.value })}
            className="w-full px-2.5 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:bg-white focus:outline-none focus:border-emerald-500 text-slate-800 font-medium"
          >
            <option value="ALL">Todos los Cargos</option>
            {cargos.map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>

        {/* Año (Year) */}
        <div>
          <select
            value={filters.year}
            onChange={(e) => onFilterChange({ ...filters, year: e.target.value })}
            className={`w-full px-2.5 py-2 border rounded-lg text-xs focus:bg-white focus:outline-none focus:border-emerald-500 font-medium transition-colors ${
              filters.year !== 'ALL'
                ? 'bg-emerald-50 border-emerald-400 text-emerald-900 font-bold'
                : 'bg-slate-50 border-slate-200 text-slate-800'
            }`}
          >
            <option value="ALL">Todos los Años</option>
            {years.map(y => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
        </div>

        {/* Mes (Month) */}
        <div>
          <select
            value={filters.month}
            onChange={(e) => onFilterChange({ ...filters, month: e.target.value })}
            className={`w-full px-2.5 py-2 border rounded-lg text-xs focus:bg-white focus:outline-none focus:border-emerald-500 font-medium transition-colors ${
              filters.month !== 'ALL'
                ? 'bg-emerald-50 border-emerald-400 text-emerald-900 font-bold'
                : 'bg-slate-50 border-slate-200 text-slate-800'
            }`}
          >
            <option value="ALL">Todos los Meses</option>
            {months.map(m => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>
        </div>

        {/* Filter 1: Estado de Evaluación */}
        <div>
          <select
            value={filters.status}
            onChange={(e) => onFilterChange({ ...filters, status: e.target.value as any })}
            className={`w-full px-2.5 py-2 border rounded-lg text-xs focus:bg-white focus:outline-none focus:border-emerald-500 font-bold transition-colors ${
              filters.status !== 'ALL'
                ? 'bg-teal-50 border-teal-400 text-teal-900'
                : 'bg-slate-50 border-slate-200 text-slate-800'
            }`}
          >
            <option value="ALL">Estado Evaluación: Todos</option>
            <option value="PASSED" className="text-teal-700 font-bold">✓ Aprobó (100 Puntos)</option>
            <option value="FAILED" className="text-amber-800 font-bold">⚠️ Retroalimentar (&lt; 100 Pts)</option>
          </select>
        </div>

        {/* Filter 2: Satisfacción NPS / CSAT */}
        <div>
          <select
            value={filters.satisfaction}
            onChange={(e) => onFilterChange({ ...filters, satisfaction: e.target.value as any })}
            className={`w-full px-2.5 py-2 border rounded-lg text-xs focus:bg-white focus:outline-none focus:border-emerald-500 font-bold transition-colors ${
              filters.satisfaction !== 'ALL'
                ? 'bg-purple-50 border-purple-400 text-purple-900'
                : 'bg-slate-50 border-slate-200 text-slate-800'
            }`}
          >
            <option value="ALL">Satisfacción NPS: Todas</option>
            <option value="PROMOTOR" className="text-emerald-700 font-bold">🟢 Promotor (9 y 10)</option>
            <option value="NEUTRO" className="text-amber-700 font-bold">🟡 Neutro (7 y 8)</option>
            <option value="DETRACTOR" className="text-red-700 font-bold">🔴 Detractor (0 al 6)</option>
          </select>
        </div>

        {/* Filtro Adicional para Engagement: Bloque / Dimensión */}
        {activeSurveyType === 'engagement' && (
          <div>
            <select
              value={filters.engagementBlock || 'ALL'}
              onChange={(e) => onFilterChange({ ...filters, engagementBlock: e.target.value })}
              className={`w-full px-2.5 py-2 border rounded-lg text-xs focus:bg-white focus:outline-none focus:border-emerald-500 font-bold transition-colors ${
                filters.engagementBlock && filters.engagementBlock !== 'ALL'
                  ? 'bg-amber-50 border-amber-400 text-amber-900'
                  : 'bg-slate-50 border-slate-200 text-slate-800'
              }`}
            >
              <option value="ALL">Dimensión: Todas</option>
              {BLOCK_LIST.map(block => (
                <option key={block} value={block}>{block}</option>
              ))}
            </select>
          </div>
        )}
      </div>
    </div>
  );
};
