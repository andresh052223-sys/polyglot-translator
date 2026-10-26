import React from 'react';
import { GRAMMAR_CATEGORIES, GrammarCategory } from '../types/translator';
import { HelpCircle, Filter, X } from 'lucide-react';

interface GrammarLegendProps {
  isOpen: boolean;
  onClose: () => void;
  activeFilter: GrammarCategory | null;
  onSelectFilter: (category: GrammarCategory | null) => void;
}

export const GrammarLegend: React.FC<GrammarLegendProps> = ({
  isOpen,
  onClose,
  activeFilter,
  onSelectFilter,
}) => {
  if (!isOpen) return null;

  const categories = Object.values(GRAMMAR_CATEGORIES);

  return (
    <div className="bg-white border-b border-slate-200 shadow-sm transition-all duration-200 animate-in fade-in slide-in-from-top-2">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        {/* Header bar of legend */}
        <div className="flex items-center justify-between gap-3 mb-3 pb-2 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <span className="text-base font-bold text-slate-800">
              Leyenda Oficial del Código de Colores Gramatical
            </span>
            <span className="text-xs text-slate-500 hidden sm:inline">
              (Haz clic en cualquier categoría para filtrarla y resaltarla en todas las tarjetas)
            </span>
          </div>

          <div className="flex items-center gap-2">
            {activeFilter && (
              <button
                onClick={() => onSelectFilter(null)}
                className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-md bg-amber-50 text-amber-800 border border-amber-200 hover:bg-amber-100 transition-colors"
                title="Quitar filtro"
              >
                <X className="w-3.5 h-3.5" />
                <span>Restablecer filtro ({activeFilter})</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
              title="Cerrar panel de leyenda"
              aria-label="Cerrar leyenda"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Legend grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2.5">
          {categories.map((cat) => {
            const isSelected = activeFilter === cat.key;
            const isLightBg = cat.key === 'noun' || cat.key === 'adjective' || cat.key === 'other';

            return (
              <button
                key={cat.key}
                type="button"
                onClick={() => onSelectFilter(isSelected ? null : cat.key)}
                className={`text-left p-3 rounded-xl transition-all text-xs flex flex-col justify-between shadow-xs ${
                  cat.bgClass
                } ${cat.borderClass} ${
                  isSelected
                    ? 'ring-3 ring-indigo-600 shadow-md scale-[1.02]'
                    : 'hover:brightness-95 hover:shadow-sm'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-1 mb-1.5">
                    <span className={`font-extrabold flex items-center gap-1.5 ${isLightBg ? 'text-slate-900' : 'text-white'}`}>
                      <span className="text-base">{cat.emoji}</span>
                      <span className="uppercase tracking-wider text-[11px]">{cat.nameEs}</span>
                    </span>
                    <span
                      className={`px-1.5 py-0.5 rounded text-[10px] font-extrabold uppercase shadow-xs ${cat.badgeBgClass}`}
                    >
                      {cat.key === 'auxiliary_verb' ? 'AUX' : cat.key === 'main_verb' ? 'VERB' : cat.key === 'negation' ? 'NEG' : cat.key.slice(0, 4)}
                    </span>
                  </div>
                  <div className={`font-bold text-[11px] leading-tight mb-1 ${isLightBg ? 'text-slate-800' : 'text-white/90'}`}>
                    {cat.colorName}
                  </div>
                  <p className={`text-[11px] leading-relaxed line-clamp-3 ${isLightBg ? 'text-slate-700' : 'text-white/80'}`}>
                    {cat.description}
                  </p>
                </div>
                <div className={`mt-2.5 pt-1.5 border-t text-[10px] font-mono italic truncate ${isLightBg ? 'border-slate-400/40 text-slate-700' : 'border-white/20 text-white/75'}`}>
                  Ej: {cat.example}
                </div>
              </button>
            );
          })}
        </div>

        {/* Accessibility & rules notes */}
        <div className="mt-3 pt-2 text-[11px] text-slate-500 flex flex-wrap items-center justify-between gap-2 border-t border-slate-100">
          <div className="flex items-center gap-1.5">
            <HelpCircle className="w-3.5 h-3.5 text-indigo-500 flex-shrink-0" />
            <span>
              <strong>Regla sintáctica:</strong> Verbos principales (azul #3B82F6), verbos auxiliares (verde #22C55E),
              negaciones (rojo #EF4444) y pronombres (naranja #F97316). Posesivos determinantes van en otras palabras (blanco #FFFFFF).
            </span>
          </div>
          <span className="text-slate-400">
            Cada palabra incluye su etiqueta accesible y color correspondiente.
          </span>
        </div>
      </div>
    </div>
  );
};
