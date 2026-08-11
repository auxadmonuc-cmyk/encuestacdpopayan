import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check, X, Search } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface MultiSelectProps {
  options: string[];
  selectedValues: string | string[];
  onChange: (values: string[]) => void;
  placeholder: string;
  allLabel?: string;
  activeBgClass?: string;
  activeBorderClass?: string;
  activeTextClass?: string;
}

export const MultiSelect: React.FC<MultiSelectProps> = ({
  options,
  selectedValues,
  onChange,
  placeholder,
  allLabel = 'Todos',
  activeBgClass = 'bg-emerald-50 border-emerald-400 text-emerald-900',
  activeBorderClass = 'border-emerald-400',
  activeTextClass = 'text-emerald-900'
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);

  // Convert selectedValues safely to an array of strings
  const currentSelections = React.useMemo(() => {
    if (!selectedValues) return [];
    if (Array.isArray(selectedValues)) {
      return selectedValues.filter(v => v !== 'ALL');
    }
    if (selectedValues === 'ALL') return [];
    return [selectedValues];
  }, [selectedValues]);

  const isAllSelected = currentSelections.length === 0;

  // Handle clicking outside to close the dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Reset search term when dropdown closes
  useEffect(() => {
    if (!isOpen) {
      setSearchTerm('');
    }
  }, [isOpen]);

  const toggleOption = (option: string) => {
    let nextSelections: string[];
    if (currentSelections.includes(option)) {
      nextSelections = currentSelections.filter(v => v !== option);
    } else {
      nextSelections = [...currentSelections, option];
    }
    
    if (nextSelections.length === 0) {
      onChange(['ALL']);
    } else {
      onChange(nextSelections);
    }
  };

  const handleSelectAll = () => {
    onChange(['ALL']);
  };

  const handleClearAll = () => {
    onChange(['ALL']);
  };

  const filteredOptions = options.filter(opt =>
    String(opt).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      .includes(searchTerm.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, ''))
  );

  // Dynamic button display label
  const displayLabel = React.useMemo(() => {
    if (isAllSelected) return placeholder;
    if (currentSelections.length === 1) return currentSelections[0];
    if (currentSelections.length <= 2) return currentSelections.join(', ');
    return `${currentSelections.length} seleccionados`;
  }, [currentSelections, isAllSelected, placeholder]);

  return (
    <div className="relative w-full text-left" ref={containerRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full flex items-center justify-between px-3 py-2 border rounded-lg text-xs font-semibold cursor-pointer select-none transition-all duration-150 focus:outline-none focus:ring-1 focus:ring-emerald-500/30 ${
          !isAllSelected
            ? `${activeBgClass} shadow-xs font-bold`
            : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100 hover:border-slate-300'
        }`}
      >
        <span className="truncate pr-1">{displayLabel}</span>
        <div className="flex items-center gap-1 shrink-0">
          {!isAllSelected && (
            <span
              onClick={(e) => {
                e.stopPropagation();
                handleClearAll();
              }}
              className="p-0.5 rounded-full hover:bg-black/10 text-slate-500 hover:text-slate-900 transition-colors cursor-pointer"
              title="Limpiar filtro"
            >
              <X className="w-3 h-3" />
            </span>
          )}
          <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 text-slate-500 ${isOpen ? 'rotate-180 text-slate-800' : ''}`} />
        </div>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 4 }}
            transition={{ duration: 0.12, ease: 'easeOut' }}
            className="absolute z-50 mt-1.5 w-full min-w-[220px] bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden"
          >
            {/* Quick Actions & Search */}
            <div className="p-2 border-b border-slate-100 bg-slate-50/50 space-y-2">
              {options.length > 5 && (
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Buscar..."
                    className="w-full pl-8 pr-2.5 py-1.5 bg-white border border-slate-200 rounded-md text-[11px] focus:outline-none focus:border-emerald-500 text-slate-800"
                  />
                  {searchTerm && (
                    <button
                      type="button"
                      onClick={() => setSearchTerm('')}
                      className="absolute right-2.5 top-2 text-slate-400 hover:text-slate-600"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  )}
                </div>
              )}

              <div className="flex items-center justify-between text-[10px] px-1 font-bold">
                <button
                  type="button"
                  onClick={handleSelectAll}
                  className={`px-1.5 py-0.5 rounded transition-colors ${
                    isAllSelected 
                      ? 'text-emerald-700 bg-emerald-50 border border-emerald-200' 
                      : 'text-slate-500 hover:text-slate-800 hover:bg-slate-200/50'
                  }`}
                >
                  {allLabel}
                </button>
                {!isAllSelected && (
                  <button
                    type="button"
                    onClick={handleClearAll}
                    className="text-red-600 hover:bg-red-50 px-1.5 py-0.5 rounded transition-colors"
                  >
                    Borrar Todo
                  </button>
                )}
              </div>
            </div>

            {/* Options List */}
            <div className="max-h-56 overflow-y-auto py-1 scrollbar-thin">
              {filteredOptions.length === 0 ? (
                <div className="px-3 py-4 text-center text-slate-400 text-xs italic">
                  No se encontraron resultados
                </div>
              ) : (
                filteredOptions.map((opt) => {
                  const isChecked = currentSelections.includes(opt);
                  return (
                    <div
                      key={opt}
                      onClick={() => toggleOption(opt)}
                      className={`flex items-center gap-2.5 px-3 py-2 text-xs text-slate-700 hover:bg-slate-50 cursor-pointer select-none transition-colors ${
                        isChecked ? 'font-semibold bg-emerald-50/20 text-slate-900' : ''
                      }`}
                    >
                      <div className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 transition-all ${
                        isChecked
                          ? 'border-emerald-500 bg-emerald-500 text-white'
                          : 'border-slate-300 bg-white group-hover:border-slate-400'
                      }`}>
                        {isChecked && <Check className="w-3 h-3 stroke-[3]" />}
                      </div>
                      <span className="truncate">{opt}</span>
                    </div>
                  );
                })
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
