import React from 'react';
import { AnalyzedToken, GRAMMAR_CATEGORIES, SupportedLanguageKey } from '../types/translator';
import { X, Volume2, Info, ArrowRight, Tag } from 'lucide-react';
import { speechService } from '../utils/speech';

interface WordDetailModalProps {
  token: AnalyzedToken | null;
  languageKey: SupportedLanguageKey | null;
  bcp47: string | null;
  languageName: string | null;
  onClose: () => void;
}

export const WordDetailModal: React.FC<WordDetailModalProps> = ({
  token,
  languageKey,
  bcp47,
  languageName,
  onClose,
}) => {
  if (!token) return null;

  const categoryInfo = GRAMMAR_CATEGORIES[token.category] || GRAMMAR_CATEGORIES.other;

  const handleSpeakToken = () => {
    if (!bcp47) return;
    speechService.speak({
      text: token.text,
      lang: bcp47,
      rate: 0.85,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in">
      <div
        className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/80">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Análisis Lingüístico • {languageName || 'Detalle'}
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors"
            aria-label="Cerrar modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Word Display & Audio */}
        <div className="p-6">
          <div className="flex items-start justify-between gap-4 mb-4">
            <div>
              <div className="text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
                <span>{token.text}</span>
                {bcp47 && (
                  <button
                    onClick={handleSpeakToken}
                    className="p-1.5 rounded-lg text-indigo-600 hover:bg-indigo-50 transition-colors"
                    title={`Escuchar pronunciación de "${token.text}"`}
                  >
                    <Volume2 className="w-5 h-5" />
                  </button>
                )}
              </div>
              {token.pinyin && (
                <div className="text-sm font-semibold text-sky-700 font-mono mt-0.5">
                  Pinyin: {token.pinyin}
                </div>
              )}
              {token.romaji && (
                <div className="text-sm font-semibold text-rose-700 font-mono mt-0.5">
                  Rōmaji: {token.romaji}
                </div>
              )}
            </div>

            {/* Category Tag Badge */}
            <div
              className={`px-3 py-1.5 rounded-xl border text-xs font-bold flex items-center gap-1.5 ${categoryInfo.bgClass} ${categoryInfo.textClass} ${categoryInfo.borderClass}`}
            >
              <span>{categoryInfo.emoji}</span>
              <span>{categoryInfo.nameEs}</span>
            </div>
          </div>

          {/* Detailed breakdown list */}
          <div className="space-y-3.5 text-xs sm:text-sm">
            {/* Grammatical category info */}
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
              <div className="text-xs font-bold text-slate-500 uppercase flex items-center gap-1.5 mb-1">
                <Tag className="w-3.5 h-3.5 text-indigo-500" />
                <span>Categoría Gramatical Específica:</span>
              </div>
              <div className="font-semibold text-slate-800">
                {token.categoryLabelEs || categoryInfo.nameEs}
              </div>
              <div className="text-slate-600 text-xs mt-0.5 leading-relaxed">
                {categoryInfo.description}
              </div>
            </div>

            {/* Meaning in Spanish */}
            <div className="p-3 rounded-xl bg-sky-50/70 border border-sky-200">
              <div className="text-xs font-bold text-sky-700 uppercase flex items-center gap-1.5 mb-1">
                <Info className="w-3.5 h-3.5 text-sky-600" />
                <span>Significado en Español:</span>
              </div>
              <div className="font-bold text-sky-950 text-base">
                "{token.meaningEs}"
              </div>
            </div>

            {/* Syntactic role in sentence */}
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
              <div className="text-xs font-bold text-slate-500 uppercase mb-1">
                Función Sintáctica en la Oración:
              </div>
              <div className="font-medium text-slate-800 leading-relaxed">
                {token.syntacticRole}
              </div>
            </div>

            {/* Approximate Spanish Correspondence */}
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
              <div className="text-xs font-bold text-slate-500 uppercase flex items-center gap-1.5 mb-1">
                <ArrowRight className="w-3.5 h-3.5 text-emerald-600" />
                <span>Correspondencia aproximada en la frase en español:</span>
              </div>
              <div className="font-semibold text-slate-800">
                {token.spanishCorrespondence ? (
                  <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-900 border border-emerald-300">
                    "{token.spanishCorrespondence}"
                  </span>
                ) : (
                  <span className="text-slate-400 italic">
                    Sin correspondencia directa palabra por palabra (estructura idiomática propia).
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="mt-5 pt-3 border-t border-slate-100 flex justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-slate-800 text-white rounded-xl text-xs font-bold hover:bg-slate-900 transition-colors"
            >
              Cerrar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
