import React from 'react';
import { Languages, History, Columns, Sparkles, BookOpen } from 'lucide-react';

interface HeaderProps {
  onToggleHistory: () => void;
  onToggleComparison: () => void;
  onToggleLegend: () => void;
  historyCount: number;
  hasResults: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  onToggleHistory,
  onToggleComparison,
  onToggleLegend,
  historyCount,
  hasResults,
}) => {
  return (
    <header className="border-b border-slate-200 bg-white/95 backdrop-blur-sm sticky top-0 z-30 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        {/* Brand and titles */}
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-sky-600 via-indigo-600 to-pink-500 flex items-center justify-center text-white shadow-md shadow-indigo-100 flex-shrink-0">
            <Languages className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-slate-900">
                Polyglot Color Translator
              </h1>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                <Sparkles className="w-3 h-3 text-indigo-500" /> AI 7-Lang
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-600 font-medium">
              Translate, analyze and listen in seven languages
            </p>
          </div>
        </div>

        {/* Action controls */}
        <div className="flex items-center gap-2 flex-wrap self-end md:self-auto">
          <button
            onClick={onToggleLegend}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100 transition-colors focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
            title="Mostrar u ocultar la leyenda del código de colores gramatical"
          >
            <BookOpen className="w-4 h-4 text-indigo-600" />
            <span>Leyenda de Colores</span>
          </button>

          {hasResults && (
            <button
              onClick={onToggleComparison}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100 transition-colors focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
              title="Comparar las 7 traducciones simultáneamente"
            >
              <Columns className="w-4 h-4 text-emerald-600" />
              <span>Modo Comparación</span>
            </button>
          )}

          <button
            onClick={onToggleHistory}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100 transition-colors focus:outline-hidden focus:ring-2 focus:ring-indigo-500 relative"
            title="Historial de traducciones"
          >
            <History className="w-4 h-4 text-slate-600" />
            <span>Historial</span>
            {historyCount > 0 && (
              <span className="inline-flex items-center justify-center px-1.5 py-0.2 text-[10px] font-bold rounded-full bg-indigo-600 text-white">
                {historyCount}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
