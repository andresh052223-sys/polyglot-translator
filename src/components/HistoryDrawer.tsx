import React from 'react';
import { TranslationSession } from '../types/translator';
import { X, Trash2, ArrowRight, Clock, BookOpen } from 'lucide-react';

interface HistoryDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  sessions: TranslationSession[];
  onSelectSession: (session: TranslationSession) => void;
  onClearHistory: () => void;
}

export const HistoryDrawer: React.FC<HistoryDrawerProps> = ({
  isOpen,
  onClose,
  sessions,
  onSelectSession,
  onClearHistory,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/40 backdrop-blur-xs animate-in fade-in">
      <div
        className="bg-white w-full max-w-md h-full shadow-2xl flex flex-col justify-between animate-in slide-in-from-right duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-indigo-600" />
            <h2 className="text-base font-bold text-slate-800">
              Historial de Traducciones ({sessions.length})
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors"
            aria-label="Cerrar historial"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* List of historical items */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {sessions.length === 0 ? (
            <div className="text-center py-12 text-slate-400">
              <BookOpen className="w-10 h-10 mx-auto mb-2 opacity-50" />
              <p className="text-sm font-medium">Aún no hay traducciones en tu historial.</p>
              <p className="text-xs text-slate-400 mt-1">
                Escribe una frase y tradúcela para guardarla automáticamente.
              </p>
            </div>
          ) : (
            sessions.map((session) => (
              <div
                key={session.id}
                onClick={() => {
                  onSelectSession(session);
                  onClose();
                }}
                className="p-3.5 rounded-xl border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/40 transition-all cursor-pointer group"
              >
                <div className="text-xs text-slate-400 flex items-center justify-between mb-1.5 font-medium">
                  <span>
                    {new Date(session.timestamp).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}{' '}
                    •{' '}
                    {new Date(session.timestamp).toLocaleDateString([], {
                      month: 'short',
                      day: 'numeric',
                    })}
                  </span>
                  <span className="text-indigo-600 font-bold opacity-0 group-hover:opacity-100 flex items-center gap-1 transition-opacity text-[11px]">
                    Recuperar <ArrowRight className="w-3 h-3" />
                  </span>
                </div>
                <div className="font-bold text-slate-900 text-sm line-clamp-2">
                  "{session.sourceText || session.spanishInput}"
                </div>
                <div className="mt-2 flex items-center justify-between gap-1.5 text-xs text-slate-500">
                  <div className="flex items-center gap-1 text-[11px] font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md">
                    <span>Origen:</span>
                    <span>{session.sourceLanguageName || 'Español'}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-slate-400 text-[11px]">7 Destinos:</span>
                    {session.results.map((r) => (
                      <span key={r.languageKey} title={r.languageName}>
                        {r.flag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer actions */}
        {sessions.length > 0 && (
          <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
            <button
              onClick={onClearHistory}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg text-rose-700 bg-rose-50 border border-rose-200 hover:bg-rose-100 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Borrar Historial</span>
            </button>
            <button
              onClick={onClose}
              className="px-4 py-1.5 text-xs font-bold rounded-lg bg-slate-800 text-white hover:bg-slate-900 transition-colors"
            >
              Cerrar
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
