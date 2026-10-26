import React, { useState } from 'react';
import { LanguageResult, GRAMMAR_CATEGORIES } from '../types/translator';
import { X, Volume2, Copy, Check } from 'lucide-react';
import { speechService } from '../utils/speech';

interface ComparisonModalProps {
  isOpen: boolean;
  onClose: () => void;
  sourceText?: string;
  sourceLangName?: string;
  sourceLangFlag?: string;
  spanishText?: string;
  results: LanguageResult[];
}

export const ComparisonModal: React.FC<ComparisonModalProps> = ({
  isOpen,
  onClose,
  sourceText,
  sourceLangName = 'Español',
  sourceLangFlag = '🇪🇸',
  spanishText,
  results,
}) => {
  const [playingKey, setPlayingKey] = useState<string | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  if (!isOpen) return null;

  const originalText = sourceText || spanishText || '';

  const handleSpeak = (res: LanguageResult) => {
    if (playingKey === res.languageKey) {
      speechService.stop();
      setPlayingKey(null);
      return;
    }

    setPlayingKey(res.languageKey);
    speechService.speak({
      text: res.fullTranslation,
      lang: res.bcp47,
      onStart: () => setPlayingKey(res.languageKey),
      onEnd: () => setPlayingKey(null),
      onError: () => setPlayingKey(null),
    });
  };

  const handleCopy = (res: LanguageResult) => {
    navigator.clipboard.writeText(res.fullTranslation);
    setCopiedKey(res.languageKey);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-900/50 backdrop-blur-xs animate-in fade-in">
      <div
        className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-5xl max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/80">
          <div>
            <h2 className="text-lg font-extrabold text-slate-900">
              Modo de Comparación Lingüística Simultánea (7 Idiomas)
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Contrasta las estructuras gramaticales, longitud y correspondencias en paralelo
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors"
            aria-label="Cerrar modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Original source preview */}
        <div className="px-6 py-3 bg-indigo-50/60 border-b border-indigo-100 flex items-center justify-between gap-3 text-xs sm:text-sm">
          <div>
            <span className="font-bold text-indigo-900 uppercase tracking-wide text-[11px] mr-2">
              Frase Original ({sourceLangName} {sourceLangFlag}):
            </span>
            <span className="font-bold text-slate-900">"{originalText}"</span>
          </div>
        </div>

        {/* Table or Matrix */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {results.map((res) => (
              <div
                key={res.languageKey}
                className="p-4 rounded-xl border border-slate-200 bg-white hover:border-indigo-300 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2 pb-2 border-b border-slate-100">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">{res.flag}</span>
                      <span className="font-bold text-slate-900 text-sm">{res.languageName}</span>
                      <span className="text-[10px] font-mono text-slate-400">({res.bcp47})</span>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleSpeak(res)}
                        className={`p-1.5 rounded-lg border transition-colors ${
                          playingKey === res.languageKey
                            ? 'bg-rose-50 text-rose-600 border-rose-300 animate-pulse'
                            : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                        }`}
                        title="Escuchar audio"
                      >
                        <Volume2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleCopy(res)}
                        className={`p-1.5 rounded-lg border transition-colors ${
                          copiedKey === res.languageKey
                            ? 'bg-emerald-50 text-emerald-600 border-emerald-300'
                            : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                        }`}
                        title="Copiar texto"
                      >
                        {copiedKey === res.languageKey ? (
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Colored tokens */}
                  <div className="flex flex-wrap gap-1 leading-relaxed mb-2">
                    {res.tokens.map((tok) => {
                      const cat = GRAMMAR_CATEGORIES[tok.category] || GRAMMAR_CATEGORIES.other;
                      return (
                        <span
                          key={tok.id}
                          className={`px-1.5 py-0.5 rounded text-xs font-bold border ${cat.bgClass} ${cat.textClass} ${cat.borderClass}`}
                          title={`${tok.categoryLabelEs}: ${tok.meaningEs}`}
                        >
                          {tok.text}
                        </span>
                      );
                    })}
                  </div>

                  {/* Phonetics */}
                  {res.phoneticTranscription && (
                    <div className="text-[11px] font-mono text-slate-600 bg-slate-50 p-2 rounded border border-slate-200 mt-2">
                      <span className="font-bold text-indigo-700 mr-1">
                        {res.phoneticLabel || 'Fonética'}:
                      </span>
                      {res.phoneticTranscription}
                    </div>
                  )}
                </div>

                <div className="mt-3 pt-2 border-t border-slate-100 text-[11px] text-slate-400 flex justify-between">
                  <span>{res.tokens.length} unidades gramaticales</span>
                  {res.grammarNotes && <span className="truncate max-w-[200px]" title={res.grammarNotes}>💡 {res.grammarNotes}</span>}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 border-t border-slate-200 bg-slate-50 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-800 text-white rounded-xl text-xs font-bold hover:bg-slate-900 transition-colors"
          >
            Cerrar Comparación
          </button>
        </div>
      </div>
    </div>
  );
};
