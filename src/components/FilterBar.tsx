import React from 'react';
import { Search, Filter, RotateCcw } from 'lucide-react';
import { FilterState } from '../types/survey';
import { BLOCK_LIST } from '../utils/engagementBlocks';
import { MultiSelect } from './MultiSelect';

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
  const isFilterActive = (val: any) => {
    if (!val) return false;
    if (Array.isArray(val)) {
      return val.length > 0 && !val.includes('ALL');
    }
    return val !== 'ALL';
  };

  const activeFiltersCount = [
    isFilterActive(filters.regional),
    isFilterActive(filters.city),
    isFilterActive(filters.operator),
    isFilterActive(filters.cargo),
    isFilterActive(filters.trainingType),
    isFilterActive(filters.year),
    isFilterActive(filters.month),
    filters.status !== 'ALL',
    filters.satisfaction !== 'ALL',
    filters.engagementBlock && filters.engagementBlock !== 'ALL',
    filters.searchTerm.trim() !== ''
  ].filter(Boolean).length;

  const unifiedTrainingTypes = React.useMemo(() => {
    const list = ['Inicial', 'Reentrenamiento'];
    trainingTypes.forEach(t => {
      if (t !== 'Inicial' && t !== 'Reentrenamiento' && t) {
        list.push(t);
      }
    });
    return list;
  }, [trainingTypes]);

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
          <MultiSelect
            options={regionals}
            selectedValues={filters.regional}
            onChange={(vals) => onFilterChange({ ...filters, regional: vals })}
            placeholder="Todas las Regionales"
            allLabel="Todas las Regionales"
          />
        </div>

        {/* Ciudad (City) */}
        <div>
          <MultiSelect
            options={cities}
            selectedValues={filters.city}
            onChange={(vals) => onFilterChange({ ...filters, city: vals })}
            placeholder="Todas las Ciudades"
            allLabel="Todas las Ciudades"
          />
        </div>

        {/* Operador */}
        <div>
          <MultiSelect
            options={operators}
            selectedValues={filters.operator}
            onChange={(vals) => onFilterChange({ ...filters, operator: vals })}
            placeholder="Todos los Operadores"
            allLabel="Todos los Operadores"
          />
        </div>

        {/* Tipo Capacitación (Inicial vs Reentrenamiento) */}
        <div>
          <MultiSelect
            options={unifiedTrainingTypes}
            selectedValues={filters.trainingType}
            onChange={(vals) => onFilterChange({ ...filters, trainingType: vals })}
            placeholder="Tipos: Inicial/Reentrenam..."
            allLabel="Todos los Tipos"
            activeBgClass="bg-blue-50 border-blue-400 text-blue-900"
            activeBorderClass="border-blue-400"
            activeTextClass="text-blue-900"
          />
        </div>

        {/* Cargo */}
        <div>
          <MultiSelect
            options={cargos}
            selectedValues={filters.cargo}
            onChange={(vals) => onFilterChange({ ...filters, cargo: vals })}
            placeholder="Todos los Cargos"
            allLabel="Todos los Cargos"
          />
        </div>

        {/* Año (Year) */}
        <div>
          <MultiSelect
            options={years}
            selectedValues={filters.year}
            onChange={(vals) => onFilterChange({ ...filters, year: vals })}
            placeholder="Todos los Años"
            allLabel="Todos los Años"
          />
        </div>

        {/* Mes (Month) */}
        <div>
          <MultiSelect
            options={months}
            selectedValues={filters.month}
            onChange={(vals) => onFilterChange({ ...filters, month: vals })}
            placeholder="Todos los Meses"
            allLabel="Todos los Meses"
          />
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
