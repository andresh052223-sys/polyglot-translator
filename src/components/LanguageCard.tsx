import React, { useState } from 'react';
import {
  LanguageResult,
  AnalyzedToken,
  GrammarCategory,
  GRAMMAR_CATEGORIES,
} from '../types/translator';
import {
  Volume2,
  VolumeX,
  RotateCcw,
  Copy,
  Check,
  Eye,
  EyeOff,
  TableProperties,
  Sparkles,
  Info,
  ExternalLink,
} from 'lucide-react';
import { speechService } from '../utils/speech';

interface LanguageCardProps {
  result: LanguageResult;
  globalSpeed: number;
  highlightCategory: GrammarCategory | null;
  onSelectToken: (token: AnalyzedToken, result: LanguageResult) => void;
}

export const LanguageCard: React.FC<LanguageCardProps> = ({
  result,
  globalSpeed,
  highlightCategory,
  onSelectToken,
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [showPlain, setShowPlain] = useState(false);
  const [showWordTable, setShowWordTable] = useState(false);
  const [audioError, setAudioError] = useState<string | null>(null);
  const [localSpeed, setLocalSpeed] = useState<number>(globalSpeed);

  const handlePlayAudio = () => {
    if (isPlaying) {
      speechService.stop();
      setIsPlaying(false);
      return;
    }

    setAudioError(null);
    setIsPlaying(true);

    const success = speechService.speak({
      text: result.fullTranslation,
      lang: result.bcp47,
      rate: localSpeed,
      onStart: () => setIsPlaying(true),
      onEnd: () => setIsPlaying(false),
      onError: (err) => {
        setIsPlaying(false);
        setAudioError(err.message || 'No se pudo reproducir la voz para este idioma.');
      },
    });

    if (!success) {
      setIsPlaying(false);
    }
  };

  const handleReplayAudio = () => {
    speechService.stop();
    setIsPlaying(false);
    setTimeout(() => {
      handlePlayAudio();
    }, 50);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(result.fullTranslation);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col justify-between overflow-hidden">
      {/* Card Header */}
      <div className="px-5 py-3.5 bg-slate-50/70 border-b border-slate-100 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <span className="text-2xl drop-shadow-xs" role="img" aria-label={result.languageName}>
            {result.flag}
          </span>
          <div>
            <h3 className="text-base font-extrabold text-slate-900 leading-tight">
              {result.languageName}
            </h3>
            <span className="text-[11px] font-mono text-slate-500 font-medium">
              {result.bcp47}
            </span>
          </div>
        </div>

        {/* Card Utility Actions */}
        <div className="flex items-center gap-1">
          {/* Toggle Plain / Color Grammar */}
          <button
            type="button"
            onClick={() => setShowPlain(!showPlain)}
            className={`p-1.5 rounded-lg border transition-colors ${
              showPlain
                ? 'bg-amber-50 text-amber-700 border-amber-200'
                : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
            }`}
            title={showPlain ? 'Mostrar colores gramaticales' : 'Mostrar texto plano sin colores'}
          >
            {showPlain ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>

          {/* Toggle Word Breakdown Table */}
          <button
            type="button"
            onClick={() => setShowWordTable(!showWordTable)}
            className={`p-1.5 rounded-lg border transition-colors ${
              showWordTable
                ? 'bg-indigo-50 text-indigo-700 border-indigo-200'
                : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
            }`}
            title="Mostrar tabla de análisis palabra por palabra"
          >
            <TableProperties className="w-4 h-4" />
          </button>

          {/* Copy Button */}
          <button
            type="button"
            onClick={handleCopy}
            className={`p-1.5 rounded-lg border transition-colors ${
              isCopied
                ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
            }`}
            title="Copiar esta traducción"
          >
            {isCopied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Main Translation Content */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          {/* Translated Sentence */}
          <div className="min-h-[72px] flex items-center mb-3">
            {showPlain ? (
              <p className="text-xl sm:text-2xl font-bold text-slate-900 leading-relaxed font-sans select-text">
                {result.fullTranslation}
              </p>
            ) : (
              <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 leading-relaxed">
                {result.tokens.map((token) => {
                  const cat = GRAMMAR_CATEGORIES[token.category] || GRAMMAR_CATEGORIES.other;
                  const isHighlighted =
                    highlightCategory !== null && highlightCategory === token.category;
                  const isDimmed =
                    highlightCategory !== null && highlightCategory !== token.category;

                  return (
                    <button
                      key={token.id}
                      type="button"
                      onClick={() => onSelectToken(token, result)}
                      className={`group relative inline-flex flex-col items-center px-2.5 py-1.5 rounded-xl border text-sm sm:text-base font-bold transition-all text-left cursor-pointer ${
                        cat.bgClass
                      } ${cat.textClass} ${cat.borderClass} ${
                        isHighlighted
                          ? 'ring-2 ring-indigo-600 shadow-md scale-105 z-10'
                          : isDimmed
                          ? 'opacity-35 scale-95'
                          : 'hover:brightness-95 hover:shadow-xs active:scale-95'
                      }`}
                      title={`${cat.nameEs} (${token.categoryLabelEs || cat.key}): ${token.meaningEs}`}
                    >
                      <span className="tracking-tight">{token.text}</span>
                      {/* Sub-label for accessibility & grammatical awareness */}
                      <span className="text-[9px] font-semibold tracking-wider opacity-75 uppercase -mt-0.5">
                        {token.category === 'main_verb'
                          ? 'VERB'
                          : token.category === 'auxiliary_verb'
                          ? 'AUX'
                          : token.category === 'negation'
                          ? 'NEG'
                          : token.category === 'noun'
                          ? 'SUST'
                          : token.category === 'adjective'
                          ? 'ADJ'
                          : token.category === 'adverb'
                          ? 'ADV'
                          : token.category === 'preposition'
                          ? 'PREP'
                          : token.category === 'article'
                          ? 'ART'
                          : token.category === 'pronoun'
                          ? 'PRON'
                          : 'OTRO'}
                      </span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Phonetic Transcription (Mandarin Pinyin or Japanese Romaji) */}
          {result.phoneticTranscription && (
            <div className="mt-3 p-3 rounded-xl bg-slate-50 border border-slate-200/80 flex items-start gap-2 text-xs">
              <span className="px-1.5 py-0.5 rounded bg-indigo-100 text-indigo-800 font-bold text-[10px] uppercase tracking-wide flex-shrink-0 mt-0.5">
                {result.phoneticLabel || 'Pronunciación'}
              </span>
              <span className="text-slate-800 font-mono font-medium leading-relaxed tracking-wide select-text">
                {result.phoneticTranscription}
              </span>
            </div>
          )}

          {/* Grammar Notes if present */}
          {result.grammarNotes && (
            <div className="mt-2 text-[11px] text-slate-500 italic bg-amber-50/50 border border-amber-200/60 rounded-lg p-2 flex items-start gap-1.5">
              <Info className="w-3.5 h-3.5 text-amber-600 flex-shrink-0 mt-0.5" />
              <span>{result.grammarNotes}</span>
            </div>
          )}

          {/* Word Table Breakdown (Collapsible) */}
          {showWordTable && (
            <div className="mt-4 pt-3 border-t border-slate-100 animate-in fade-in duration-150">
              <div className="text-xs font-bold text-slate-700 mb-2 flex items-center justify-between">
                <span>Análisis Lingüístico Palabra por Palabra:</span>
                <span className="text-[10px] text-slate-400 font-normal">
                  ({result.tokens.length} unidades identificadas)
                </span>
              </div>
              <div className="overflow-x-auto max-h-56 scrollbar-thin rounded-lg border border-slate-200">
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="bg-slate-100 text-slate-600 sticky top-0 font-semibold text-[11px]">
                    <tr>
                      <th className="p-2 border-b border-slate-200">Palabra</th>
                      <th className="p-2 border-b border-slate-200">Categoría</th>
                      <th className="p-2 border-b border-slate-200">Significado ES</th>
                      <th className="p-2 border-b border-slate-200">Función Sintáctica</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 bg-white">
                    {result.tokens.map((tok) => {
                      const cat = GRAMMAR_CATEGORIES[tok.category] || GRAMMAR_CATEGORIES.other;
                      return (
                        <tr
                          key={tok.id}
                          onClick={() => onSelectToken(tok, result)}
                          className="hover:bg-slate-50 cursor-pointer transition-colors"
                        >
                          <td className="p-2 font-bold text-slate-900 whitespace-nowrap">
                            <span
                              className={`px-1.5 py-0.5 rounded text-[11px] border ${cat.bgClass} ${cat.textClass} ${cat.borderClass}`}
                            >
                              {tok.text}
                            </span>
                            {tok.pinyin && (
                              <span className="block text-[10px] text-slate-400 font-mono">
                                {tok.pinyin}
                              </span>
                            )}
                            {tok.romaji && (
                              <span className="block text-[10px] text-slate-400 font-mono">
                                {tok.romaji}
                              </span>
                            )}
                          </td>
                          <td className="p-2 whitespace-nowrap">
                            <span className="font-semibold text-slate-700">
                              {tok.categoryLabelEs || cat.nameEs}
                            </span>
                          </td>
                          <td className="p-2 text-slate-800 font-medium">{tok.meaningEs}</td>
                          <td className="p-2 text-slate-500 text-[11px]">{tok.syntacticRole}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Audio error feedback */}
          {audioError && (
            <div className="mt-3 p-2 rounded-lg bg-rose-50 text-rose-700 text-xs flex items-center justify-between">
              <span>{audioError}</span>
              <button
                type="button"
                onClick={() => setAudioError(null)}
                className="text-rose-500 font-bold ml-2"
              >
                ✕
              </button>
            </div>
          )}
        </div>

        {/* Audio Controls Footer */}
        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-2 flex-wrap">
          {/* Main Play / Stop Button */}
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={handlePlayAudio}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold text-xs transition-all ${
                isPlaying
                  ? 'bg-rose-600 text-white shadow-xs animate-pulse ring-2 ring-rose-400'
                  : 'bg-indigo-50 text-indigo-700 border border-indigo-200 hover:bg-indigo-100'
              }`}
              title={isPlaying ? 'Detener pronunciación' : 'Escuchar pronunciación completa'}
            >
              {isPlaying ? (
                <>
                  <VolumeX className="w-3.5 h-3.5" />
                  <span>Detener</span>
                </>
              ) : (
                <>
                  <Volume2 className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Escuchar</span>
                </>
              )}
            </button>

            {/* Repeat button */}
            <button
              type="button"
              onClick={handleReplayAudio}
              disabled={isPlaying}
              className="p-1.5 rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-40 transition-colors"
              title="Repetir audio"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Speed badge/picker */}
          <div className="flex items-center gap-1 text-[11px] text-slate-500 font-medium">
            <span>Velocidad:</span>
            {[0.75, 1.0, 1.25].map((spd) => (
              <button
                key={spd}
                type="button"
                onClick={() => setLocalSpeed(spd)}
                className={`px-1.5 py-0.5 rounded text-[10px] font-bold transition-colors ${
                  localSpeed === spd
                    ? 'bg-slate-800 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {spd}x
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
