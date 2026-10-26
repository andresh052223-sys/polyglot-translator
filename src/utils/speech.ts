export interface SpeechOptions {
  text: string;
  lang: string;
  rate?: number;
  pitch?: number;
  onStart?: () => void;
  onEnd?: () => void;
  onError?: (err: Error) => void;
}

class SpeechController {
  private currentUtterance: SpeechSynthesisUtterance | null = null;
  private voices: SpeechSynthesisVoice[] = [];
  private voicesLoaded = false;

  constructor() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      this.initVoices();
      if (window.speechSynthesis.onvoiceschanged !== undefined) {
        window.speechSynthesis.onvoiceschanged = () => {
          this.initVoices();
        };
      }
    }
  }

  private initVoices() {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    this.voices = window.speechSynthesis.getVoices();
    if (this.voices.length > 0) {
      this.voicesLoaded = true;
    }
  }

  public isSupported(): boolean {
    return typeof window !== 'undefined' && 'speechSynthesis' in window;
  }

  public getVoicesForLang(langCode: string): SpeechSynthesisVoice[] {
    this.initVoices();
    const primary = langCode.toLowerCase();
    const prefix = primary.split('-')[0];

    // Exact match first
    const exactMatches = this.voices.filter((v) => v.lang.toLowerCase() === primary);
    if (exactMatches.length > 0) return exactMatches;

    // Prefix match
    const prefixMatches = this.voices.filter((v) => v.lang.toLowerCase().startsWith(prefix));
    return prefixMatches;
  }

  public speak(options: SpeechOptions): boolean {
    if (!this.isSupported()) {
      options.onError?.(new Error('La síntesis de voz no está soportada en este navegador.'));
      return false;
    }

    try {
      this.stop();

      const utterance = new SpeechSynthesisUtterance(options.text);
      utterance.lang = options.lang;
      utterance.rate = options.rate ?? 1.0;
      utterance.pitch = options.pitch ?? 1.0;

      const matchingVoices = this.getVoicesForLang(options.lang);
      if (matchingVoices.length > 0) {
        // Prefer local or high quality voices
        const preferred = matchingVoices.find((v) => !v.localService) || matchingVoices[0];
        utterance.voice = preferred;
      }

      utterance.onstart = () => {
        options.onStart?.();
      };

      utterance.onend = () => {
        this.currentUtterance = null;
        options.onEnd?.();
      };

      utterance.onerror = (event) => {
        this.currentUtterance = null;
        // Interrupted is normal when user clicks stop or new speech
        if (event.error !== 'interrupted' && event.error !== 'canceled') {
          console.warn('Speech synthesis event error:', event);
          options.onError?.(new Error(`Error de pronunciación (${event.error || 'desconocido'})`));
        } else {
          options.onEnd?.();
        }
      };

      this.currentUtterance = utterance;
      window.speechSynthesis.speak(utterance);
      return true;
    } catch (err: any) {
      console.error('Speech synthesis failure:', err);
      options.onError?.(err instanceof Error ? err : new Error(String(err)));
      return false;
    }
  }

  public stop(): void {
    if (this.isSupported()) {
      try {
        window.speechSynthesis.cancel();
      } catch (e) {
        console.error('Error stopping speech:', e);
      }
      this.currentUtterance = null;
    }
  }
}

export const speechService = new SpeechController();
