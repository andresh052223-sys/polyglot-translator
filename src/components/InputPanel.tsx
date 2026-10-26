import React, { useState } from 'react';
import {
  Sparkles,
  Volume2,
  Trash2,
  Copy,
  Check,
  FileDown,
  Printer,
  ChevronDown,
  Zap,
  Globe,
  Compass,
  AlertCircle,
} from 'lucide-react';
import { speechService } from '../utils/speech';
import { CANONICAL_EXAMPLES } from '../data/canonicalExamples';
import {
  SUPPORTED_LANGUAGES,
  SupportedLanguageKey,
  LanguageConfig,
} from '../types/translator';

interface InputPanelProps {
  inputText: string;
  onChangeInput: (text: string) => void;
  sourceLanguageKey: SupportedLanguageKey;
  onChangeSourceLanguage: (langKey: SupportedLanguageKey) => void;
  autoDetect: boolean;
  onToggleAutoDetect: (enabled: boolean) => void;
  detectedLanguageKey: SupportedLanguageKey | null;
  detectionMessage: string | null;
  onTranslate: () => void;
  onClear: () => void;
  onCopyAll: () => void;
  onExportPdf: () => void;
  onExportText: () => void;
  onExportMarkdown: () => void;
  onSelectExample: (exampleId: string) => void;
  isLoading: boolean;
  hasResults: boolean;
  speechSpeed: number;
  onChangeSpeechSpeed: (speed: number) => void;
  error: string | null;
}

export const InputPanel: React.FC<InputPanelProps> = ({
  inputText,
  onChangeInput,
  sourceLanguageKey,
  onChangeSourceLanguage,
  autoDetect,
  onToggleAutoDetect,
  detectedLanguageKey,
  detectionMessage,
  onTranslate,
  onClear,
  onCopyAll,
  onExportPdf,
  onExportText,
  onExportMarkdown,
  onSelectExample,
  isLoading,
  hasResults,
  speechSpeed,
  onChangeSpeechSpeed,
  error,
}) => {
  const [isPlayingSource, setIsPlayingSource] = useState(false);
  const [copiedAll, setCopiedAll] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false);

  const sourceConfig: LanguageConfig =
    SUPPORTED_LANGUAGES.find((l) => l.key === sourceLanguageKey) || SUPPORTED_LANGUAGES[0];

  const handleSpeakSource = () => {
    if (!inputText.trim()) return;
    if (isPlayingSource) {
      speechService.stop();
      setIsPlayingSource(false);
      return;
    }

    setIsPlayingSource(true);
    speechService.speak({
      text: inputText.trim(),
      lang: sourceConfig.bcp47,
      rate: speechSpeed,
      onStart: () => setIsPlayingSource(true),
      onEnd: () => setIsPlayingSource(false),
      onError: (err) => {
        setIsPlayingSource(false);
        console.warn('Source speech error:', err);
      },
    });
  };

  const handleCopyAllClick = () => {
    onCopyAll();
    setCopiedAll(true);
    setTimeout(() => setCopiedAll(false), 2000);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
      e.preventDefault();
      onTranslate();
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-md p-5 sm:p-6 mb-8 transition-shadow hover:shadow-lg">
      {/* 1. SECCIÓN PRINCIPAL: SELECTOR DE IDIOMA DE ORIGEN & DETECCIÓN AUTOMÁTICA */}
      <div className="mb-4 pb-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex flex-col gap-1.5 flex-1">
          <label
            htmlFor="source-lang-select"
            className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5"
          >
            <Globe className="w-4 h-4 text-indigo-600" />
            <span>Idioma de origen / Source Language</span>
          </label>

          <div className="flex items-center gap-2 flex-wrap">
            {/* Dropdown selector */}
            <div className="relative inline-block">
              <select
                id="source-lang-select"
                value={sourceLanguageKey}
                onChange={(e) => {
                  onChangeSourceLanguage(e.target.value as SupportedLanguageKey);
                }}
                className="appearance-none pl-3 pr-9 py-2 text-sm font-bold bg-slate-50 border border-slate-300 rounded-xl text-slate-800 hover:border-indigo-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-hidden cursor-pointer transition-all shadow-xs"
              >
                {SUPPORTED_LANGUAGES.map((lang, index) => (
                  <option key={lang.key} value={lang.key}>
                    {index + 1}. {lang.name} {lang.flag} ({lang.nativeName})
                  </option>
                ))}
              </select>
              <ChevronDown className="w-4 h-4 text-slate-500 pointer-events-none absolute right-3 top-1/2 -translate-y-1/2" />
            </div>

            {/* Switch / Toggle de Detección Automática */}
            <button
              type="button"
              onClick={() => onToggleAutoDetect(!autoDetect)}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                autoDetect
                  ? 'bg-indigo-50 text-indigo-700 border-indigo-300 ring-2 ring-indigo-200'
                  : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
              }`}
              title="Identifica automáticamente el idioma al escribir o pegar una frase"
            >
              <Compass className={`w-3.5 h-3.5 ${autoDetect ? 'text-indigo-600 animate-spin' : 'text-slate-500'}`} />
              <span>Detectar idioma automáticamente / Auto-detect</span>
              <span
                className={`ml-1 text-[10px] font-bold px-1.5 py-0.2 rounded-full ${
                  autoDetect ? 'bg-indigo-600 text-white' : 'bg-slate-200 text-slate-600'
                }`}
              >
                {autoDetect ? 'ON' : 'OFF'}
              </span>
            </button>
          </div>
        </div>

        {/* Dynamic target languages info reminder */}
        <div className="sm:text-right flex flex-col justify-end">
          <div className="text-[11px] font-semibold text-slate-400">
            Se traducirá a exactamente 7 idiomas:
          </div>
          <div className="flex items-center sm:justify-end gap-1 mt-0.5">
            {SUPPORTED_LANGUAGES.filter((l) => l.key !== sourceLanguageKey).map((l) => (
              <span
                key={l.key}
                className="text-base cursor-default transform hover:scale-125 transition-transform"
                title={`${l.name} (${l.nativeName})`}
              >
                {l.flag}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Auto-detect feedback banner if enabled */}
      {autoDetect && (
        <div className="mb-3 animate-in fade-in duration-200">
          {detectedLanguageKey ? (
            <div className="p-2.5 rounded-xl bg-indigo-50/80 border border-indigo-200 text-indigo-900 text-xs flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
                <span>
                  <strong>Idioma detectado:</strong>{' '}
                  {SUPPORTED_LANGUAGES.find((l) => l.key === detectedLanguageKey)?.name}{' '}
                  {SUPPORTED_LANGUAGES.find((l) => l.key === detectedLanguageKey)?.flag}
                </span>
                <span className="text-[11px] text-indigo-600/80">
                  (Puedes cambiarlo manualmente en el selector si lo deseas)
                </span>
              </div>
            </div>
          ) : detectionMessage ? (
            <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
              <span>{detectionMessage}</span>
            </div>
          ) : (
            <div className="p-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-500 text-xs">
              Escribe tu frase para detectar automáticamente el idioma de origen.
            </div>
          )}
        </div>
      )}

      {/* 2. BARRA SUPERIOR DEL TEXTAREA: ETIQUETA ADAPTADA, AUDIO ORIGINAL & VELOCIDAD */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-2.5">
        <label
          htmlFor="polyglot-text-input"
          className="text-sm font-bold text-slate-800 flex items-center gap-2"
        >
          <span className="w-2.5 h-2.5 rounded-full bg-indigo-500 animate-pulse"></span>
          <span>{sourceConfig.inputLabel}:</span>
        </label>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Audio of original sentence in its source language */}
          <button
            type="button"
            onClick={handleSpeakSource}
            disabled={!inputText.trim()}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border transition-all ${
              isPlayingSource
                ? 'bg-emerald-50 text-emerald-700 border-emerald-300 ring-2 ring-emerald-400'
                : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed'
            }`}
            title={`Escuchar pronunciación original en ${sourceConfig.name} (${sourceConfig.flag})`}
          >
            <Volume2
              className={`w-4 h-4 ${
                isPlayingSource ? 'text-emerald-600 animate-bounce' : 'text-slate-600'
              }`}
            />
            <span>
              {isPlayingSource
                ? `Detener audio (${sourceConfig.name})`
                : `Escuchar en ${sourceConfig.name} ${sourceConfig.flag}`}
            </span>
          </button>

          {/* Speed control selector */}
          <div className="flex items-center gap-1 bg-slate-50 border border-slate-200 rounded-lg p-0.5 text-xs">
            <span className="text-[11px] font-bold text-slate-500 px-1.5">Velocidad:</span>
            {[0.75, 1.0, 1.25].map((speed) => (
              <button
                key={speed}
                type="button"
                onClick={() => onChangeSpeechSpeed(speed)}
                className={`px-2 py-0.5 rounded text-[11px] font-bold transition-colors ${
                  speechSpeed === speed
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'text-slate-600 hover:bg-slate-200'
                }`}
              >
                {speed}x
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 3. MAIN TEXTAREA: Placeholder dinámico según idioma de origen */}
      <div className="relative">
        <textarea
          id="polyglot-text-input"
          value={inputText}
          onChange={(e) => onChangeInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={sourceConfig.placeholder}
          rows={3}
          className="w-full px-4 py-3 text-base sm:text-lg rounded-xl border border-slate-300 focus:border-indigo-500 focus:ring-3 focus:ring-indigo-100 outline-hidden transition-all resize-y text-slate-900 placeholder:text-slate-400 leading-relaxed font-medium"
        />
        <div className="text-[11px] text-slate-400 flex justify-between items-center mt-1 px-1">
          <span>
            Presiona{' '}
            <kbd className="px-1.5 py-0.5 bg-slate-100 border border-slate-300 rounded font-mono text-[10px] text-slate-700">
              Ctrl/Cmd + Enter
            </kbd>{' '}
            para traducir
          </span>
          <span>{inputText.length} caracteres</span>
        </div>
      </div>

      {/* Error display if any */}
      {error && (
        <div className="mt-3 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs sm:text-sm flex items-start gap-2 animate-in fade-in">
          <span className="font-bold text-rose-600">Error:</span>
          <span className="flex-1">{error}</span>
        </div>
      )}

      {/* 4. BARRA DE BOTONES DE ACCIÓN */}
      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100">
        <div className="flex items-center gap-2 flex-wrap">
          {/* Main Translate Button con indicación del idioma de origen */}
          <button
            type="button"
            onClick={onTranslate}
            disabled={isLoading || !inputText.trim()}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm bg-gradient-to-r from-indigo-600 via-indigo-700 to-sky-600 text-white shadow-md shadow-indigo-200 hover:brightness-105 active:scale-98 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none"
          >
            {isLoading ? (
              <>
                <svg className="animate-spin w-4 h-4 text-white" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                </svg>
                <span>Traduciendo a los 7 idiomas...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-amber-300" />
                <span>
                  {sourceConfig.translateBtnText} → 7 Idiomas
                </span>
              </>
            )}
          </button>

          {/* Clear button */}
          <button
            type="button"
            onClick={onClear}
            disabled={isLoading || (!inputText && !hasResults)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            title="Borrar texto y traducciones"
          >
            <Trash2 className="w-4 h-4 text-slate-500" />
            <span>Clear</span>
          </button>
        </div>

        {/* Secondary output tools (Copy All, Export) */}
        {hasResults && (
          <div className="flex items-center gap-2 flex-wrap">
            <button
              type="button"
              onClick={handleCopyAllClick}
              className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold border transition-all ${
                copiedAll
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                  : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
              }`}
              title="Copiar texto de origen y las 7 traducciones con sus nombres al portapapeles"
            >
              {copiedAll ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4 text-slate-500" />}
              <span>{copiedAll ? '¡Copiadas las 7!' : 'Copy All Translations'}</span>
            </button>

            {/* Export menu dropdown */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowExportMenu(!showExportMenu)}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold border border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100 transition-colors"
                title="Descargar o imprimir reporte multilingüe"
              >
                <FileDown className="w-4 h-4 text-indigo-600" />
                <span>Descargar / PDF</span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {showExportMenu && (
                <div className="absolute right-0 mt-2 w-64 bg-white border border-slate-200 rounded-xl shadow-xl z-20 py-1.5 text-xs animate-in fade-in slide-in-from-top-1">
                  <div className="px-3 py-1 font-bold text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-100">
                    Opciones de Exportación
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setShowExportMenu(false);
                      onExportPdf();
                    }}
                    className="w-full text-left px-3 py-2 flex items-center gap-2.5 text-slate-800 hover:bg-indigo-50 hover:text-indigo-700 transition-colors font-medium"
                  >
                    <Printer className="w-4 h-4 text-indigo-600" />
                    <div>
                      <div className="font-semibold">Versión Educativa (PDF / Imprimir)</div>
                      <div className="text-[10px] text-slate-500">
                        Incluye origen ({sourceConfig.name}) y los 7 idiomas destino
                      </div>
                    </div>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowExportMenu(false);
                      onExportText();
                    }}
                    className="w-full text-left px-3 py-2 flex items-center gap-2.5 text-slate-800 hover:bg-slate-100 transition-colors font-medium"
                  >
                    <FileDown className="w-4 h-4 text-slate-600" />
                    <div>
                      <div className="font-semibold">Versión Texto Plano (.txt)</div>
                      <div className="text-[10px] text-slate-500">Texto limpio con todas las lenguas</div>
                    </div>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowExportMenu(false);
                      onExportMarkdown();
                    }}
                    className="w-full text-left px-3 py-2 flex items-center gap-2.5 text-slate-800 hover:bg-slate-100 transition-colors font-medium"
                  >
                    <FileDown className="w-4 h-4 text-emerald-600" />
                    <div>
                      <div className="font-semibold">Reporte Lingüístico (.md)</div>
                      <div className="text-[10px] text-slate-500">Formato Markdown con tablas gramaticales</div>
                    </div>
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* 5. CASOS DE PRUEBA LINGÜÍSTICOS PRECONFIGURADOS */}
      <div className="mt-5 pt-3.5 border-t border-slate-100">
        <div className="flex items-center justify-between gap-2 mb-2">
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700">
            <Zap className="w-3.5 h-3.5 text-amber-500" />
            <span>Casos canónicos preconfigurados (adaptados al origen {sourceConfig.name} {sourceConfig.flag}):</span>
          </div>
          <span className="text-[11px] text-slate-400 font-medium hidden sm:inline">
            1 clic para cargar y validar los 7 idiomas
          </span>
        </div>
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-thin">
          {CANONICAL_EXAMPLES.map((ex) => (
            <button
              key={ex.id}
              type="button"
              onClick={() => onSelectExample(ex.id)}
              className="px-2.5 py-1.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-indigo-50 hover:border-indigo-300 hover:text-indigo-700 text-slate-700 text-xs font-medium whitespace-nowrap transition-all flex items-center gap-1 flex-shrink-0"
              title={`${ex.categoryLabel}: ${ex.description}`}
            >
              <span className="font-bold text-indigo-600">{ex.categoryLabel.split('.')[0]}.</span>
              <span>{ex.categoryLabel.split('.')[1]?.trim() || ex.categoryLabel}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
