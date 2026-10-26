/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import {
  LanguageResult,
  AnalyzedToken,
  GrammarCategory,
  TranslationSession,
  SupportedLanguageKey,
  SUPPORTED_LANGUAGES,
} from './types/translator';
import { CANONICAL_EXAMPLES, getCanonicalResults } from './data/canonicalExamples';
import { Header } from './components/Header';
import { GrammarLegend } from './components/GrammarLegend';
import { InputPanel } from './components/InputPanel';
import { LanguageCard } from './components/LanguageCard';
import { WordDetailModal } from './components/WordDetailModal';
import { HistoryDrawer } from './components/HistoryDrawer';
import { ComparisonModal } from './components/ComparisonModal';
import { exportCleanText, exportMarkdownReport, printOrSavePdf } from './utils/exportPdf';
import { detectLanguageClient } from './utils/languageDetector';
import { Globe, CheckCircle2 } from 'lucide-react';

const STORAGE_KEY_HISTORY = 'polyglot_color_translator_history_v2';

export default function App() {
  // Canonical example A (Afirmación)
  const initialExample = CANONICAL_EXAMPLES[0];

  // Source language state (Default: Spanish 'es')
  const [sourceLanguageKey, setSourceLanguageKey] = useState<SupportedLanguageKey>('es');
  const [autoDetect, setAutoDetect] = useState<boolean>(false);
  const [detectedLanguageKey, setDetectedLanguageKey] = useState<SupportedLanguageKey | null>(null);
  const [detectionMessage, setDetectionMessage] = useState<string | null>(null);

  const [inputText, setInputText] = useState<string>(initialExample.spanish);
  const [results, setResults] = useState<LanguageResult[]>(() =>
    getCanonicalResults(initialExample, 'es')
  );
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const [speechSpeed, setSpeechSpeed] = useState<number>(1.0);
  const [highlightCategory, setHighlightCategory] = useState<GrammarCategory | null>(null);
  const [isLegendOpen, setIsLegendOpen] = useState<boolean>(true);

  // Modals & Drawers
  const [selectedToken, setSelectedToken] = useState<AnalyzedToken | null>(null);
  const [selectedTokenResult, setSelectedTokenResult] = useState<LanguageResult | null>(null);
  const [isHistoryOpen, setIsHistoryOpen] = useState<boolean>(false);
  const [isComparisonOpen, setIsComparisonOpen] = useState<boolean>(false);

  const currentSourceConfig = useMemo(() => {
    return (
      SUPPORTED_LANGUAGES.find((l) => l.key === sourceLanguageKey) || SUPPORTED_LANGUAGES[0]
    );
  }, [sourceLanguageKey]);

  // Translation history
  const [sessions, setSessions] = useState<TranslationSession[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_HISTORY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.warn('Could not read history from localStorage', e);
    }
    return [
      {
        id: 'initial-session',
        sourceText: initialExample.spanish,
        sourceLanguageKey: 'es',
        sourceLanguageName: 'Español',
        timestamp: Date.now(),
        results: getCanonicalResults(initialExample, 'es'),
      },
    ];
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_HISTORY, JSON.stringify(sessions));
    } catch (e) {
      console.warn('Could not save history to localStorage', e);
    }
  }, [sessions]);

  // Handle user typing or updating text
  const handleInputChange = (newText: string) => {
    setInputText(newText);

    if (autoDetect) {
      const trimmed = newText.trim();
      if (trimmed.length < 3) {
        setDetectedLanguageKey(null);
        setDetectionMessage(
          trimmed.length > 0
            ? 'La frase es demasiado corta para identificar su idioma con certeza.'
            : null
        );
        return;
      }

      const res = detectLanguageClient(trimmed);
      if (res.detectedKey) {
        setDetectedLanguageKey(res.detectedKey);
        setSourceLanguageKey(res.detectedKey);
        setDetectionMessage(null);
      } else {
        setDetectedLanguageKey(null);
        setDetectionMessage(
          'La frase es demasiado corta o ambigua para identificar su idioma con suficiente confianza. Por favor selecciona el idioma de origen.'
        );
      }
    }
  };

  // Toggle Auto-detect
  const handleToggleAutoDetect = (enabled: boolean) => {
    setAutoDetect(enabled);
    if (enabled && inputText.trim().length >= 3) {
      const res = detectLanguageClient(inputText.trim());
      if (res.detectedKey) {
        setDetectedLanguageKey(res.detectedKey);
        setSourceLanguageKey(res.detectedKey);
        setDetectionMessage(null);
      } else {
        setDetectedLanguageKey(null);
        setDetectionMessage(
          'La frase es demasiado corta o ambigua para identificar su idioma con suficiente confianza. Por favor selecciona el idioma de origen.'
        );
      }
    } else {
      setDetectedLanguageKey(null);
      setDetectionMessage(null);
    }
  };

  // Manual source language change
  const handleChangeSourceLanguage = (newKey: SupportedLanguageKey) => {
    setSourceLanguageKey(newKey);
    // Allow manual selection even when auto-detect is on
    if (autoDetect) {
      setDetectedLanguageKey(newKey);
    }
  };

  // Translate handler
  const handleTranslate = async () => {
    const textToTranslate = inputText.trim();
    if (!textToTranslate) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/translate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: textToTranslate,
          sourceLanguage: sourceLanguageKey,
        }),
      });

      const contentType = response.headers.get('content-type') || '';
      let data: any = null;

      if (contentType.includes('application/json')) {
        data = await response.json();
      } else {
        const textBody = await response.text();
        console.warn('Non-JSON response received from /api/translate:', response.status, textBody.slice(0, 100));
        throw new Error(
          response.status === 504 || response.status === 503
            ? 'El servicio de IA está experimentando alta demanda o tardó en responder. Por favor reintenta en unos instantes o selecciona uno de los casos de prueba lingüísticos.'
            : `El servidor no pudo procesar la traducción (código ${response.status}).`
        );
      }

      if (!response.ok) {
        throw new Error(data?.error || `Error al traducir la frase (${response.status}).`);
      }

      if (data.results && Array.isArray(data.results)) {
        // Ensure that exactly 7 destination languages are present (no source language)
        const finalResults = data.results.filter(
          (r: LanguageResult) => r.languageKey !== sourceLanguageKey
        );
        setResults(finalResults);

        // Save session in history
        const newSession: TranslationSession = {
          id: `session-${Date.now()}`,
          sourceText: textToTranslate,
          sourceLanguageKey,
          sourceLanguageName: currentSourceConfig.name,
          timestamp: Date.now(),
          results: finalResults,
        };

        setSessions((prev) => [newSession, ...prev.filter((s) => s.sourceText !== textToTranslate)].slice(0, 30));
      } else {
        throw new Error('La respuesta del servidor no contiene resultados válidos.');
      }
    } catch (err: any) {
      console.error('Translation execution error:', err);

      // Resilient local match for canonical examples with full normalization
      const cleanNorm = (str: string) =>
        str
          .toLowerCase()
          .trim()
          .replace(/[¿?¡!.,;:«»"'()[\]{}。、！？]/g, '')
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '')
          .replace(/\s+/g, ' ');

      const normText = cleanNorm(textToTranslate);

      const localMatch = CANONICAL_EXAMPLES.find((ex) => {
        if (cleanNorm(ex.spanish) === normText || cleanNorm(ex.englishPrompt) === normText) {
          return true;
        }
        return ex.results.some((r) => cleanNorm(r.fullTranslation) === normText);
      });

      if (localMatch) {
        setResults(getCanonicalResults(localMatch, sourceLanguageKey));
        setError(null);
      } else {
        setError(
          err.message ||
            'No se pudo conectar con el servicio de traducción. Verifica tu conexión o intenta con uno de los ejemplos preconfigurados.'
        );
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Clear handler
  const handleClear = () => {
    setInputText('');
    setResults([]);
    setError(null);
    setHighlightCategory(null);
  };

  // Copy all translations: includes source text, source language name, and the 7 translations
  const handleCopyAll = () => {
    if (!results || results.length === 0) return;

    let text = `Frase de origen (${currentSourceConfig.name} ${currentSourceConfig.flag}):\n"${inputText}"\n\n`;
    text += `Traducciones a los 7 idiomas destino:\n\n`;

    results.forEach((r, idx) => {
      text += `${idx + 1}. ${r.flag} ${r.languageName} (${r.bcp47}):\n${r.fullTranslation}\n`;
      if (r.phoneticTranscription) {
        text += `Fonética (${r.phoneticLabel || 'Pronunciación'}): ${r.phoneticTranscription}\n`;
      }
      text += `\n`;
    });

    navigator.clipboard.writeText(text);
  };

  // Export actions: includes source text, source language, and 7 target languages
  const handleExportPdf = () => {
    if (!results || results.length === 0) return;
    printOrSavePdf({
      sourceText: inputText,
      sourceLangName: currentSourceConfig.name,
      sourceLangFlag: currentSourceConfig.flag,
      results,
    });
  };

  const handleExportText = () => {
    if (!results || results.length === 0) return;
    exportCleanText({
      sourceText: inputText,
      sourceLangName: currentSourceConfig.name,
      sourceLangFlag: currentSourceConfig.flag,
      results,
    });
  };

  const handleExportMarkdown = () => {
    if (!results || results.length === 0) return;
    exportMarkdownReport({
      sourceText: inputText,
      sourceLangName: currentSourceConfig.name,
      sourceLangFlag: currentSourceConfig.flag,
      results,
    });
  };

  // Select canonical example: adapts input text to the current source language and shows other 7
  const handleSelectExample = (exampleId: string) => {
    const example = CANONICAL_EXAMPLES.find((ex) => ex.id === exampleId);
    if (!example) return;

    // Pick text corresponding to the currently selected source language
    let sentenceText = example.spanish;
    const matchingResult = example.results.find((r) => r.languageKey === sourceLanguageKey);
    if (matchingResult) {
      sentenceText = matchingResult.fullTranslation;
    } else if (sourceLanguageKey === 'en') {
      sentenceText = example.englishPrompt;
    }

    const targetResults = getCanonicalResults(example, sourceLanguageKey);

    setInputText(sentenceText);
    setResults(targetResults);
    setError(null);
    setHighlightCategory(null);

    // Save in history
    const newSession: TranslationSession = {
      id: `session-${Date.now()}`,
      sourceText: sentenceText,
      sourceLanguageKey,
      sourceLanguageName: currentSourceConfig.name,
      timestamp: Date.now(),
      results: targetResults,
    };
    setSessions((prev) => [newSession, ...prev.filter((s) => s.sourceText !== sentenceText)].slice(0, 30));
  };

  // Select historical session
  const handleSelectSession = (session: TranslationSession) => {
    const text = session.sourceText || session.spanishInput || '';
    setInputText(text);
    if (session.sourceLanguageKey) {
      setSourceLanguageKey(session.sourceLanguageKey);
    }
    setResults(session.results);
    setError(null);
    setHighlightCategory(null);
  };

  // Clear history
  const handleClearHistory = () => {
    setSessions([]);
    try {
      localStorage.removeItem(STORAGE_KEY_HISTORY);
    } catch (e) {
      console.warn(e);
    }
  };

  // Token click handler
  const handleSelectToken = (token: AnalyzedToken, result: LanguageResult) => {
    setSelectedToken(token);
    setSelectedTokenResult(result);
  };

  return (
    <div className="min-h-screen bg-slate-50/70 text-slate-900 flex flex-col font-sans selection:bg-indigo-500 selection:text-white">
      {/* Top Header */}
      <Header
        onToggleHistory={() => setIsHistoryOpen(true)}
        onToggleComparison={() => setIsComparisonOpen(true)}
        onToggleLegend={() => setIsLegendOpen(!isLegendOpen)}
        historyCount={sessions.length}
        hasResults={results.length > 0}
      />

      {/* Grammar Color Legend Panel with the 10 Categories */}
      <GrammarLegend
        isOpen={isLegendOpen}
        onClose={() => setIsLegendOpen(false)}
        activeFilter={highlightCategory}
        onSelectFilter={setHighlightCategory}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Input Panel with Source Language Selector, Auto-detect, and Actions */}
        <InputPanel
          inputText={inputText}
          onChangeInput={handleInputChange}
          sourceLanguageKey={sourceLanguageKey}
          onChangeSourceLanguage={handleChangeSourceLanguage}
          autoDetect={autoDetect}
          onToggleAutoDetect={handleToggleAutoDetect}
          detectedLanguageKey={detectedLanguageKey}
          detectionMessage={detectionMessage}
          onTranslate={handleTranslate}
          onClear={handleClear}
          onCopyAll={handleCopyAll}
          onExportPdf={handleExportPdf}
          onExportText={handleExportText}
          onExportMarkdown={handleExportMarkdown}
          onSelectExample={handleSelectExample}
          isLoading={isLoading}
          hasResults={results.length > 0}
          speechSpeed={speechSpeed}
          onChangeSpeechSpeed={setSpeechSpeed}
          error={error}
        />

        {/* Results Section */}
        {results.length > 0 && (
          <section className="mt-8 animate-in fade-in duration-300">
            {/* Section Header */}
            <div className="flex flex-wrap items-center justify-between gap-3 mb-6 pb-3 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <Globe className="w-5 h-5 text-indigo-600" />
                <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
                  Traducciones a los 7 Idiomas con Análisis Gramatical
                </h2>
              </div>

              <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Origen: {currentSourceConfig.name} {currentSourceConfig.flag} → 7 destinos
                </span>
                {highlightCategory && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
                    Filtro activo: {highlightCategory}
                  </span>
                )}
              </div>
            </div>

            {/* Grid of the 7 Destination Language Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 lg:gap-6">
              {results.map((res) => (
                <LanguageCard
                  key={res.languageKey}
                  result={res}
                  globalSpeed={speechSpeed}
                  highlightCategory={highlightCategory}
                  onSelectToken={handleSelectToken}
                />
              ))}
            </div>
          </section>
        )}

        {/* Empty state when cleared */}
        {!isLoading && results.length === 0 && (
          <div className="text-center py-16 px-4 bg-white rounded-2xl border border-dashed border-slate-300 max-w-xl mx-auto my-8">
            <Globe className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-slate-800">Comienza a traducir y analizar</h3>
            <p className="text-sm text-slate-500 mt-1 max-w-md mx-auto">
              Escribe una frase en {currentSourceConfig.name} o activa la detección automática para
              obtener su desglose gramatical por colores y pronunciación en los 7 idiomas de destino.
            </p>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-200 bg-white py-6 text-xs text-slate-500 text-center">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-extrabold text-slate-800">Polyglot Color Translator</span>
            <span>•</span>
            <span>8 Idiomas: 🇪🇸 🇬🇧 🇧🇷 🇮🇹 🇫🇷 🇩🇪 🇨🇳 🇯🇵</span>
          </div>
          <div className="flex items-center gap-3">
            <span>Síntesis de voz multilingüe (Web Speech API)</span>
            <span>•</span>
            <span>Clasificación gramatical contextual de 10 colores</span>
          </div>
        </div>
      </footer>

      {/* Word Detail Popover/Modal */}
      <WordDetailModal
        token={selectedToken}
        languageKey={selectedTokenResult?.languageKey || null}
        bcp47={selectedTokenResult?.bcp47 || null}
        languageName={selectedTokenResult?.languageName || null}
        onClose={() => {
          setSelectedToken(null);
          setSelectedTokenResult(null);
        }}
      />

      {/* History Drawer */}
      <HistoryDrawer
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        sessions={sessions}
        onSelectSession={handleSelectSession}
        onClearHistory={handleClearHistory}
      />

      {/* Comparison Modal */}
      <ComparisonModal
        isOpen={isComparisonOpen}
        onClose={() => setIsComparisonOpen(false)}
        sourceText={inputText}
        sourceLangName={currentSourceConfig.name}
        sourceLangFlag={currentSourceConfig.flag}
        results={results}
      />
    </div>
  );
}
