import { SupportedLanguageKey, SUPPORTED_LANGUAGES } from '../types/translator';

export interface DetectionResult {
  detectedKey: SupportedLanguageKey | null;
  confidence: 'high' | 'medium' | 'low';
  isAmbiguous: boolean;
  message?: string;
}

// Stop words and linguistic markers for fast and reliable heuristic detection
const LANGUAGE_MARKERS: Record<SupportedLanguageKey, { words: string[]; patterns: RegExp[] }> = {
  ja: {
    words: ['です', 'ます', 'でした', 'ません', 'これ', 'それ', 'あれ', '私', '僕', 'あなた', 'はい', 'いいえ'],
    patterns: [
      /[\u3040-\u309F]/, // Hiragana (exclusively Japanese)
      /[\u30A0-\u30FF]/, // Katakana (exclusively Japanese)
    ],
  },
  zh: {
    words: ['的', '了', '是', '在', '我', '有', '和', '就', '不', '人', '都', '一', '一个', '上', '也', '很', '到', '说', '要', '去', '你看', '什么', '吗'],
    patterns: [
      /[\u4E00-\u9FFF]/, // CJK Unified Ideographs (without Japanese kana)
    ],
  },
  de: {
    words: [
      'der', 'die', 'das', 'und', 'in', 'den', 'von', 'zu', 'das', 'mit', 'sich', 'des', 'auf', 'für', 'ist', 'im', 'dem', 'nicht', 'ein', 'eine', 'einer', 'als', 'auch', 'es', 'an', 'werden', 'aus', 'er', 'hat', 'dass', 'sie', 'nach', 'wird', 'bei', 'einer', 'bruder', 'sehr', 'arbeiten', 'haben'
    ],
    patterns: [
      /[äöüßÄÖÜ]/,
      /\b(nicht|sehr|mein|meine|bruder|arbeiten|haben|sind|war|wäre)\b/i,
    ],
  },
  fr: {
    words: [
      'le', 'la', 'les', 'un', 'une', 'des', 'et', 'en', 'avoir', 'que', 'pour', 'dans', 'ce', 'qui', 'ne', 'pas', 'sur', 'se', 'pas', 'plus', 'pouvoir', 'par', 'je', 'avec', 'tout', 'faire', 'son', 'mettre', 'autre', 'on', 'mais', 'nous', 'comme', 'ou', 'si', 'leur', 'est', 'sont', 'mon', 'frère', 'très'
    ],
    patterns: [
      /[éèêëàâùûîïôçœæÉÈÊËÀÂÙÛÎÏÔÇŒÆ]/,
      /\b(c'est|d'un|d'une|l'un|l'une|qu'un|qu'il|mon|très|frère|travaille|dimanches)\b/i,
    ],
  },
  pt: {
    words: [
      'de', 'a', 'o', 'que', 'e', 'do', 'da', 'em', 'um', 'para', 'é', 'com', 'não', 'uma', 'os', 'no', 'se', 'na', 'por', 'mais', 'as', 'dos', 'como', 'mas', 'foi', 'ao', 'ele', 'das', 'tem', 'à', 'seu', 'sua', 'ou', 'ser', 'quando', 'muito', 'há', 'nos', 'já', 'está', 'eu', 'também', 'só', 'pelo', 'pela', 'até', 'isso', 'ela', 'entre', 'era', 'meu', 'irmão'
    ],
    patterns: [
      /[ãõÃÕ]/,
      /\b(não|são|está|irmão|meu|muito|você|trabalha|domingos)\b/i,
    ],
  },
  it: {
    words: [
      'il', 'la', 'che', 'e', 'un', 'in', 'a', 'per', 'di', 'non', 'sono', 'da', 'con', 'le', 'si', 'lo', 'della', 'dei', 'del', 'delle', 'uno', 'una', 'è', 'era', 'mio', 'fratello', 'molto', 'lui', 'lei', 'loro', 'questo', 'questa', 'perché', 'anche', 'lavora', 'domenica'
    ],
    patterns: [
      /\b(mio|fratello|molto|lavora|domenica|intelligente|della|degli|nella|delle)\b/i,
    ],
  },
  es: {
    words: [
      'el', 'la', 'de', 'que', 'y', 'a', 'en', 'un', 'ser', 'se', 'no', 'haber', 'por', 'con', 'su', 'para', 'como', 'estar', 'tener', 'le', 'lo', 'lo', 'todo', 'pero', 'más', 'hacer', 'o', 'poder', 'decir', 'este', 'ir', 'otro', 'ese', 'la', 'si', 'me', 'ya', 'ver', 'porque', 'dar', 'cuando', 'él', 'muy', 'sin', 'vez', 'mucho', 'saber', 'qué', 'sobre', 'mi', 'hermano', 'inteligente', 'trabaja', 'domingos'
    ],
    patterns: [
      /[ñÑ¿¡]/,
      /\b(el|la|los|las|un|una|mi|hermano|inteligente|trabaja|domingos|muy|pero|porque)\b/i,
    ],
  },
  en: {
    words: [
      'the', 'be', 'to', 'of', 'and', 'a', 'in', 'that', 'have', 'i', 'it', 'for', 'not', 'on', 'with', 'he', 'as', 'you', 'do', 'at', 'this', 'but', 'his', 'by', 'from', 'they', 'we', 'say', 'her', 'she', 'or', 'an', 'will', 'my', 'one', 'all', 'would', 'there', 'their', 'what', 'so', 'up', 'out', 'if', 'about', 'who', 'get', 'which', 'go', 'me', 'is', 'are', 'was', 'were', 'brother', 'very', 'intelligent', 'works', 'sundays'
    ],
    patterns: [
      /\b(the|is|are|was|were|brother|intelligent|works|sundays|very|does|not|she|have|been)\b/i,
    ],
  },
};

export function detectLanguageClient(text: string): DetectionResult {
  const clean = text.trim();

  // Too short to reliably detect
  if (clean.length < 3) {
    return {
      detectedKey: null,
      confidence: 'low',
      isAmbiguous: true,
      message: 'La frase es muy corta o ambigua. Por favor selecciona el idioma de origen.',
    };
  }

  // 1. Check for Japanese (Hiragana or Katakana is 100% Japanese)
  if (LANGUAGE_MARKERS.ja.patterns.some((p) => p.test(clean))) {
    return { detectedKey: 'ja', confidence: 'high', isAmbiguous: false };
  }

  // 2. Check for Chinese (CJK characters without Japanese Kana)
  if (LANGUAGE_MARKERS.zh.patterns.some((p) => p.test(clean))) {
    return { detectedKey: 'zh', confidence: 'high', isAmbiguous: false };
  }

  // 3. Score Latin-based languages
  const tokens = clean
    .toLowerCase()
    .replace(/[¿?¡!.,;:"'()[\]{}0-9]/g, ' ')
    .split(/\s+/)
    .filter((w) => w.length > 0);

  if (tokens.length === 0) {
    return {
      detectedKey: null,
      confidence: 'low',
      isAmbiguous: true,
      message: 'No se detectaron palabras válidas.',
    };
  }

  const scores: Record<SupportedLanguageKey, number> = {
    es: 0,
    en: 0,
    pt: 0,
    it: 0,
    fr: 0,
    de: 0,
    zh: 0,
    ja: 0,
  };

  // Specific high-confidence diacritic clues
  if (/[ñÑ¿¡]/.test(clean)) scores.es += 5;
  if (/[ãõÃÕ]/.test(clean)) scores.pt += 5;
  if (/[äöüßÄÖÜ]/.test(clean)) scores.de += 5;
  if (/[œæç]/.test(clean)) scores.fr += 4;

  const latinKeys: SupportedLanguageKey[] = ['es', 'en', 'pt', 'it', 'fr', 'de'];

  latinKeys.forEach((lang) => {
    const info = LANGUAGE_MARKERS[lang];
    tokens.forEach((word) => {
      if (info.words.includes(word)) {
        scores[lang] += 2;
      }
    });

    info.patterns.forEach((pat) => {
      if (pat.test(clean)) {
        scores[lang] += 3;
      }
    });
  });

  // Find max score
  let maxScore = 0;
  let detectedKey: SupportedLanguageKey | null = null;
  let runnerUpScore = 0;

  latinKeys.forEach((lang) => {
    const sc = scores[lang];
    if (sc > maxScore) {
      runnerUpScore = maxScore;
      maxScore = sc;
      detectedKey = lang;
    } else if (sc > runnerUpScore) {
      runnerUpScore = sc;
    }
  });

  // If score is too low or tie, mark as ambiguous
  if (maxScore < 2 || (maxScore === runnerUpScore && maxScore <= 2)) {
    return {
      detectedKey: null,
      confidence: 'low',
      isAmbiguous: true,
      message: 'Frase corta o ambigua. Por favor selecciona el idioma de origen manualmente.',
    };
  }

  const confidence: 'high' | 'medium' = maxScore >= 4 && maxScore > runnerUpScore * 1.3 ? 'high' : 'medium';

  return {
    detectedKey,
    confidence,
    isAmbiguous: false,
  };
}
