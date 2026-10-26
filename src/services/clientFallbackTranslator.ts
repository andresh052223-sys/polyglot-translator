import {
  AnalyzedToken,
  GrammarCategory,
  GRAMMAR_CATEGORIES,
  LanguageResult,
  SUPPORTED_LANGUAGES,
  SupportedLanguageKey,
} from '../types/translator';
import { CANONICAL_EXAMPLES, getCanonicalResults } from '../data/canonicalExamples';

interface WordTranslation {
  token: string;
  category: GrammarCategory;
  meaningEs: string;
  syntacticRole: string;
  pinyin?: string;
  romaji?: string;
}

interface LexicalEntry {
  category: GrammarCategory;
  meaningEs: string;
  syntacticRole: string;
  translations: Record<SupportedLanguageKey, WordTranslation>;
}

// Normalize strings for matching
export function normalizeClean(str: string): string {
  return str
    .toLowerCase()
    .trim()
    .replace(/[¿?¡!.,;:«»"'()[\]{}。、！？]/g, '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, ' ');
}

// Multi-language lexical dictionary mapping core concepts across 8 languages
const LEXICON: Record<string, LexicalEntry> = {
  // PRONOUNS
  yo: {
    category: 'pronoun',
    meaningEs: 'yo',
    syntacticRole: 'Sujeto',
    translations: {
      es: { token: 'yo', category: 'pronoun', meaningEs: 'yo', syntacticRole: 'Sujeto' },
      en: { token: 'I', category: 'pronoun', meaningEs: 'yo', syntacticRole: 'Sujeto' },
      pt: { token: 'eu', category: 'pronoun', meaningEs: 'yo', syntacticRole: 'Sujeito' },
      it: { token: 'io', category: 'pronoun', meaningEs: 'yo', syntacticRole: 'Soggetto' },
      fr: { token: 'je', category: 'pronoun', meaningEs: 'yo', syntacticRole: 'Sujet' },
      de: { token: 'ich', category: 'pronoun', meaningEs: 'yo', syntacticRole: 'Subjekt' },
      zh: { token: '我', category: 'pronoun', meaningEs: 'yo', syntacticRole: 'Sujeto', pinyin: 'wǒ' },
      ja: { token: '私', category: 'pronoun', meaningEs: 'yo', syntacticRole: 'Sujeto / Tópico', romaji: 'watashi' },
    },
  },
  tu: {
    category: 'pronoun',
    meaningEs: 'tú',
    syntacticRole: 'Sujeto',
    translations: {
      es: { token: 'tú', category: 'pronoun', meaningEs: 'tú', syntacticRole: 'Sujeto' },
      en: { token: 'you', category: 'pronoun', meaningEs: 'tú', syntacticRole: 'Sujeto' },
      pt: { token: 'você', category: 'pronoun', meaningEs: 'tú', syntacticRole: 'Sujeito' },
      it: { token: 'tu', category: 'pronoun', meaningEs: 'tú', syntacticRole: 'Soggetto' },
      fr: { token: 'tu', category: 'pronoun', meaningEs: 'tú', syntacticRole: 'Sujet' },
      de: { token: 'du', category: 'pronoun', meaningEs: 'tú', syntacticRole: 'Subjekt' },
      zh: { token: '你', category: 'pronoun', meaningEs: 'tú', syntacticRole: 'Sujeto', pinyin: 'nǐ' },
      ja: { token: 'あなた', category: 'pronoun', meaningEs: 'tú', syntacticRole: 'Sujeto / Tópico', romaji: 'anata' },
    },
  },
  el: {
    category: 'pronoun',
    meaningEs: 'él',
    syntacticRole: 'Sujeto',
    translations: {
      es: { token: 'él', category: 'pronoun', meaningEs: 'él', syntacticRole: 'Sujeto' },
      en: { token: 'he', category: 'pronoun', meaningEs: 'él', syntacticRole: 'Sujeto' },
      pt: { token: 'ele', category: 'pronoun', meaningEs: 'él', syntacticRole: 'Sujeito' },
      it: { token: 'lui', category: 'pronoun', meaningEs: 'él', syntacticRole: 'Soggetto' },
      fr: { token: 'il', category: 'pronoun', meaningEs: 'él', syntacticRole: 'Sujet' },
      de: { token: 'er', category: 'pronoun', meaningEs: 'él', syntacticRole: 'Subjekt' },
      zh: { token: '他', category: 'pronoun', meaningEs: 'él', syntacticRole: 'Sujeto', pinyin: 'tā' },
      ja: { token: '彼', category: 'pronoun', meaningEs: 'él', syntacticRole: 'Sujeto / Tópico', romaji: 'kare' },
    },
  },
  ella: {
    category: 'pronoun',
    meaningEs: 'ella',
    syntacticRole: 'Sujeto',
    translations: {
      es: { token: 'ella', category: 'pronoun', meaningEs: 'ella', syntacticRole: 'Sujeto' },
      en: { token: 'she', category: 'pronoun', meaningEs: 'ella', syntacticRole: 'Sujeto' },
      pt: { token: 'ela', category: 'pronoun', meaningEs: 'ella', syntacticRole: 'Sujeito' },
      it: { token: 'lei', category: 'pronoun', meaningEs: 'ella', syntacticRole: 'Soggetto' },
      fr: { token: 'elle', category: 'pronoun', meaningEs: 'ella', syntacticRole: 'Sujet' },
      de: { token: 'sie', category: 'pronoun', meaningEs: 'ella', syntacticRole: 'Subjekt' },
      zh: { token: '她', category: 'pronoun', meaningEs: 'ella', syntacticRole: 'Sujeto', pinyin: 'tā' },
      ja: { token: '彼女', category: 'pronoun', meaningEs: 'ella', syntacticRole: 'Sujeto / Tópico', romaji: 'kanojo' },
    },
  },
  nosotros: {
    category: 'pronoun',
    meaningEs: 'nosotros',
    syntacticRole: 'Sujeto',
    translations: {
      es: { token: 'nosotros', category: 'pronoun', meaningEs: 'nosotros', syntacticRole: 'Sujeto' },
      en: { token: 'we', category: 'pronoun', meaningEs: 'nosotros', syntacticRole: 'Sujeto' },
      pt: { token: 'nós', category: 'pronoun', meaningEs: 'nosotros', syntacticRole: 'Sujeito' },
      it: { token: 'noi', category: 'pronoun', meaningEs: 'nosotros', syntacticRole: 'Soggetto' },
      fr: { token: 'nous', category: 'pronoun', meaningEs: 'nosotros', syntacticRole: 'Sujet' },
      de: { token: 'wir', category: 'pronoun', meaningEs: 'nosotros', syntacticRole: 'Subjekt' },
      zh: { token: '我们', category: 'pronoun', meaningEs: 'nosotros', syntacticRole: 'Sujeto', pinyin: 'wǒmen' },
      ja: { token: '私たち', category: 'pronoun', meaningEs: 'nosotros', syntacticRole: 'Sujeto / Tópico', romaji: 'watashitachi' },
    },
  },
  ellos: {
    category: 'pronoun',
    meaningEs: 'ellos',
    syntacticRole: 'Sujeto',
    translations: {
      es: { token: 'ellos', category: 'pronoun', meaningEs: 'ellos', syntacticRole: 'Sujeto' },
      en: { token: 'they', category: 'pronoun', meaningEs: 'ellos', syntacticRole: 'Sujeto' },
      pt: { token: 'eles', category: 'pronoun', meaningEs: 'ellos', syntacticRole: 'Sujeito' },
      it: { token: 'loro', category: 'pronoun', meaningEs: 'ellos', syntacticRole: 'Soggetto' },
      fr: { token: 'ils', category: 'pronoun', meaningEs: 'ellos', syntacticRole: 'Sujet' },
      de: { token: 'sie', category: 'pronoun', meaningEs: 'ellos', syntacticRole: 'Subjekt' },
      zh: { token: '他们', category: 'pronoun', meaningEs: 'ellos', syntacticRole: 'Sujeto', pinyin: 'tāmen' },
      ja: { token: '彼ら', category: 'pronoun', meaningEs: 'ellos', syntacticRole: 'Sujeto / Tópico', romaji: 'karera' },
    },
  },

  // COPULA VERBS
  soy: {
    category: 'main_verb',
    meaningEs: 'soy',
    syntacticRole: 'Verbo copulativo principal',
    translations: {
      es: { token: 'soy', category: 'main_verb', meaningEs: 'soy', syntacticRole: 'Verbo copulativo principal' },
      en: { token: 'am', category: 'main_verb', meaningEs: 'soy', syntacticRole: 'Verbo copulativo' },
      pt: { token: 'sou', category: 'main_verb', meaningEs: 'soy', syntacticRole: 'Verbo copulativo' },
      it: { token: 'sono', category: 'main_verb', meaningEs: 'soy', syntacticRole: 'Verbo copulativo' },
      fr: { token: 'suis', category: 'main_verb', meaningEs: 'soy', syntacticRole: 'Verbe copule' },
      de: { token: 'bin', category: 'main_verb', meaningEs: 'soy', syntacticRole: 'Kopulaverb' },
      zh: { token: '是', category: 'main_verb', meaningEs: 'ser / soy', syntacticRole: 'Verbo copulativo', pinyin: 'shì' },
      ja: { token: 'です', category: 'auxiliary_verb', meaningEs: 'cópula formal', syntacticRole: 'Cópula verbal', romaji: 'desu' },
    },
  },
  eres: {
    category: 'main_verb',
    meaningEs: 'eres',
    syntacticRole: 'Verbo copulativo principal',
    translations: {
      es: { token: 'eres', category: 'main_verb', meaningEs: 'eres', syntacticRole: 'Verbo copulativo principal' },
      en: { token: 'are', category: 'main_verb', meaningEs: 'eres', syntacticRole: 'Verbo copulativo' },
      pt: { token: 'é', category: 'main_verb', meaningEs: 'eres', syntacticRole: 'Verbo copulativo' },
      it: { token: 'sei', category: 'main_verb', meaningEs: 'eres', syntacticRole: 'Verbo copulativo' },
      fr: { token: 'es', category: 'main_verb', meaningEs: 'eres', syntacticRole: 'Verbe copule' },
      de: { token: 'bist', category: 'main_verb', meaningEs: 'eres', syntacticRole: 'Kopulaverb' },
      zh: { token: '是', category: 'main_verb', meaningEs: 'ser / eres', syntacticRole: 'Verbo copulativo', pinyin: 'shì' },
      ja: { token: 'です', category: 'auxiliary_verb', meaningEs: 'cópula formal', syntacticRole: 'Cópula verbal', romaji: 'desu' },
    },
  },
  es: {
    category: 'main_verb',
    meaningEs: 'es',
    syntacticRole: 'Verbo copulativo principal',
    translations: {
      es: { token: 'es', category: 'main_verb', meaningEs: 'es', syntacticRole: 'Verbo copulativo principal' },
      en: { token: 'is', category: 'main_verb', meaningEs: 'es', syntacticRole: 'Verbo copulativo' },
      pt: { token: 'é', category: 'main_verb', meaningEs: 'es', syntacticRole: 'Verbo copulativo' },
      it: { token: 'è', category: 'main_verb', meaningEs: 'es', syntacticRole: 'Verbo copulativo' },
      fr: { token: 'est', category: 'main_verb', meaningEs: 'es', syntacticRole: 'Verbe copule' },
      de: { token: 'ist', category: 'main_verb', meaningEs: 'es', syntacticRole: 'Kopulaverb' },
      zh: { token: '是', category: 'main_verb', meaningEs: 'ser / es', syntacticRole: 'Verbo copulativo', pinyin: 'shì' },
      ja: { token: 'です', category: 'auxiliary_verb', meaningEs: 'cópula formal', syntacticRole: 'Cópula verbal', romaji: 'desu' },
    },
  },
  somos: {
    category: 'main_verb',
    meaningEs: 'somos',
    syntacticRole: 'Verbo copulativo principal',
    translations: {
      es: { token: 'somos', category: 'main_verb', meaningEs: 'somos', syntacticRole: 'Verbo copulativo principal' },
      en: { token: 'are', category: 'main_verb', meaningEs: 'somos', syntacticRole: 'Verbo copulativo' },
      pt: { token: 'somos', category: 'main_verb', meaningEs: 'somos', syntacticRole: 'Verbo copulativo' },
      it: { token: 'siamo', category: 'main_verb', meaningEs: 'somos', syntacticRole: 'Verbo copulativo' },
      fr: { token: 'sommes', category: 'main_verb', meaningEs: 'somos', syntacticRole: 'Verbe copule' },
      de: { token: 'sind', category: 'main_verb', meaningEs: 'somos', syntacticRole: 'Kopulaverb' },
      zh: { token: '是', category: 'main_verb', meaningEs: 'ser / somos', syntacticRole: 'Verbo copulativo', pinyin: 'shì' },
      ja: { token: 'です', category: 'auxiliary_verb', meaningEs: 'cópula formal', syntacticRole: 'Cópula verbal', romaji: 'desu' },
    },
  },
  son: {
    category: 'main_verb',
    meaningEs: 'son',
    syntacticRole: 'Verbo copulativo principal',
    translations: {
      es: { token: 'son', category: 'main_verb', meaningEs: 'son', syntacticRole: 'Verbo copulativo principal' },
      en: { token: 'are', category: 'main_verb', meaningEs: 'son', syntacticRole: 'Verbo copulativo' },
      pt: { token: 'são', category: 'main_verb', meaningEs: 'son', syntacticRole: 'Verbo copulativo' },
      it: { token: 'sono', category: 'main_verb', meaningEs: 'son', syntacticRole: 'Verbo copulativo' },
      fr: { token: 'sont', category: 'main_verb', meaningEs: 'son', syntacticRole: 'Verbe copule' },
      de: { token: 'sind', category: 'main_verb', meaningEs: 'son', syntacticRole: 'Kopulaverb' },
      zh: { token: '是', category: 'main_verb', meaningEs: 'ser / son', syntacticRole: 'Verbo copulativo', pinyin: 'shì' },
      ja: { token: 'です', category: 'auxiliary_verb', meaningEs: 'cópula formal', syntacticRole: 'Cópula verbal', romaji: 'desu' },
    },
  },

  // NEGATION
  no: {
    category: 'negation',
    meaningEs: 'no',
    syntacticRole: 'Modificador de negación',
    translations: {
      es: { token: 'no', category: 'negation', meaningEs: 'no', syntacticRole: 'Modificador de negación' },
      en: { token: 'not', category: 'negation', meaningEs: 'no', syntacticRole: 'Negación' },
      pt: { token: 'não', category: 'negation', meaningEs: 'no', syntacticRole: 'Negação' },
      it: { token: 'non', category: 'negation', meaningEs: 'no', syntacticRole: 'Negazione' },
      fr: { token: 'pas', category: 'negation', meaningEs: 'no', syntacticRole: 'Négation' },
      de: { token: 'nicht', category: 'negation', meaningEs: 'no', syntacticRole: 'Negationspartikel' },
      zh: { token: '不', category: 'negation', meaningEs: 'no', syntacticRole: 'Negación', pinyin: 'bù' },
      ja: { token: 'ではありません', category: 'negation', meaningEs: 'no es', syntacticRole: 'Cópula negativa', romaji: 'dewa arimasen' },
    },
  },

  // ADJECTIVES
  bueno: {
    category: 'adjective',
    meaningEs: 'bueno',
    syntacticRole: 'Atributo',
    translations: {
      es: { token: 'bueno', category: 'adjective', meaningEs: 'bueno', syntacticRole: 'Atributo del sujeto' },
      en: { token: 'good', category: 'adjective', meaningEs: 'bueno', syntacticRole: 'Atributo' },
      pt: { token: 'bom', category: 'adjective', meaningEs: 'bueno', syntacticRole: 'Atributo' },
      it: { token: 'buono', category: 'adjective', meaningEs: 'bueno', syntacticRole: 'Atributo' },
      fr: { token: 'bon', category: 'adjective', meaningEs: 'bueno', syntacticRole: 'Attribut' },
      de: { token: 'gut', category: 'adjective', meaningEs: 'bueno', syntacticRole: 'Prädikativum' },
      zh: { token: '好人', category: 'noun', meaningEs: 'buena persona', syntacticRole: 'Atributo / Objeto', pinyin: 'hǎorén' },
      ja: { token: '良い人', category: 'noun', meaningEs: 'buena persona', syntacticRole: 'Atributo', romaji: 'yoi hito' },
    },
  },
  malo: {
    category: 'adjective',
    meaningEs: 'malo',
    syntacticRole: 'Atributo',
    translations: {
      es: { token: 'malo', category: 'adjective', meaningEs: 'malo', syntacticRole: 'Atributo del sujeto' },
      en: { token: 'bad', category: 'adjective', meaningEs: 'malo', syntacticRole: 'Atributo' },
      pt: { token: 'mau', category: 'adjective', meaningEs: 'malo', syntacticRole: 'Atributo' },
      it: { token: 'cattivo', category: 'adjective', meaningEs: 'malo', syntacticRole: 'Atributo' },
      fr: { token: 'mauvais', category: 'adjective', meaningEs: 'malo', syntacticRole: 'Attribut' },
      de: { token: 'schlecht', category: 'adjective', meaningEs: 'malo', syntacticRole: 'Prädikativum' },
      zh: { token: '坏人', category: 'noun', meaningEs: 'persona mala', syntacticRole: 'Atributo / Objeto', pinyin: 'huàirén' },
      ja: { token: '悪い人', category: 'noun', meaningEs: 'persona mala', syntacticRole: 'Atributo', romaji: 'warui hito' },
    },
  },
  feliz: {
    category: 'adjective',
    meaningEs: 'feliz',
    syntacticRole: 'Atributo',
    translations: {
      es: { token: 'feliz', category: 'adjective', meaningEs: 'feliz', syntacticRole: 'Atributo del sujeto' },
      en: { token: 'happy', category: 'adjective', meaningEs: 'feliz', syntacticRole: 'Atributo' },
      pt: { token: 'feliz', category: 'adjective', meaningEs: 'feliz', syntacticRole: 'Atributo' },
      it: { token: 'felice', category: 'adjective', meaningEs: 'feliz', syntacticRole: 'Atributo' },
      fr: { token: 'heureux', category: 'adjective', meaningEs: 'feliz', syntacticRole: 'Attribut' },
      de: { token: 'glücklich', category: 'adjective', meaningEs: 'feliz', syntacticRole: 'Prädikativum' },
      zh: { token: '快乐', category: 'adjective', meaningEs: 'feliz', syntacticRole: 'Atributo', pinyin: 'kuàilè' },
      ja: { token: '幸せ', category: 'adjective', meaningEs: 'feliz', syntacticRole: 'Atributo', romaji: 'shiawase' },
    },
  },
  triste: {
    category: 'adjective',
    meaningEs: 'triste',
    syntacticRole: 'Atributo',
    translations: {
      es: { token: 'triste', category: 'adjective', meaningEs: 'triste', syntacticRole: 'Atributo del sujeto' },
      en: { token: 'sad', category: 'adjective', meaningEs: 'triste', syntacticRole: 'Atributo' },
      pt: { token: 'triste', category: 'adjective', meaningEs: 'triste', syntacticRole: 'Atributo' },
      it: { token: 'triste', category: 'adjective', meaningEs: 'triste', syntacticRole: 'Atributo' },
      fr: { token: 'triste', category: 'adjective', meaningEs: 'triste', syntacticRole: 'Attribut' },
      de: { token: 'traurig', category: 'adjective', meaningEs: 'triste', syntacticRole: 'Prädikativum' },
      zh: { token: '难过', category: 'adjective', meaningEs: 'triste', syntacticRole: 'Atributo', pinyin: 'nánguò' },
      ja: { token: '悲しい', category: 'adjective', meaningEs: 'triste', syntacticRole: 'Atributo', romaji: 'kanashii' },
    },
  },
  grande: {
    category: 'adjective',
    meaningEs: 'grande',
    syntacticRole: 'Atributo / Modificador',
    translations: {
      es: { token: 'grande', category: 'adjective', meaningEs: 'grande', syntacticRole: 'Atributo' },
      en: { token: 'big', category: 'adjective', meaningEs: 'grande', syntacticRole: 'Atributo' },
      pt: { token: 'grande', category: 'adjective', meaningEs: 'grande', syntacticRole: 'Atributo' },
      it: { token: 'grande', category: 'adjective', meaningEs: 'grande', syntacticRole: 'Atributo' },
      fr: { token: 'grand', category: 'adjective', meaningEs: 'grande', syntacticRole: 'Attribut' },
      de: { token: 'groß', category: 'adjective', meaningEs: 'grande', syntacticRole: 'Prädikativum' },
      zh: { token: '大', category: 'adjective', meaningEs: 'grande', syntacticRole: 'Atributo', pinyin: 'dà' },
      ja: { token: '大きい', category: 'adjective', meaningEs: 'grande', syntacticRole: 'Atributo', romaji: 'ōkii' },
    },
  },
  inteligente: {
    category: 'adjective',
    meaningEs: 'inteligente',
    syntacticRole: 'Atributo',
    translations: {
      es: { token: 'inteligente', category: 'adjective', meaningEs: 'inteligente', syntacticRole: 'Atributo' },
      en: { token: 'intelligent', category: 'adjective', meaningEs: 'inteligente', syntacticRole: 'Atributo' },
      pt: { token: 'inteligente', category: 'adjective', meaningEs: 'inteligente', syntacticRole: 'Atributo' },
      it: { token: 'intelligente', category: 'adjective', meaningEs: 'inteligente', syntacticRole: 'Atributo' },
      fr: { token: 'intelligent', category: 'adjective', meaningEs: 'inteligente', syntacticRole: 'Attribut' },
      de: { token: 'intelligent', category: 'adjective', meaningEs: 'inteligente', syntacticRole: 'Prädikativum' },
      zh: { token: '聪明', category: 'adjective', meaningEs: 'inteligente', syntacticRole: 'Atributo', pinyin: 'cōngmíng' },
      ja: { token: '賢い', category: 'adjective', meaningEs: 'inteligente', syntacticRole: 'Atributo', romaji: 'kashikoi' },
    },
  },

  // ADVERBS
  muy: {
    category: 'adverb',
    meaningEs: 'muy',
    syntacticRole: 'Modificador de grado',
    translations: {
      es: { token: 'muy', category: 'adverb', meaningEs: 'muy', syntacticRole: 'Modificador del adjetivo' },
      en: { token: 'very', category: 'adverb', meaningEs: 'muy', syntacticRole: 'Modificador del adjetivo' },
      pt: { token: 'muito', category: 'adverb', meaningEs: 'muy', syntacticRole: 'Modificador do adjetivo' },
      it: { token: 'molto', category: 'adverb', meaningEs: 'muy', syntacticRole: 'Modificatore dell\'aggettivo' },
      fr: { token: 'très', category: 'adverb', meaningEs: 'muy', syntacticRole: 'Modificateur de l\'adjectif' },
      de: { token: 'sehr', category: 'adverb', meaningEs: 'muy', syntacticRole: 'Gradadverb' },
      zh: { token: '很', category: 'adverb', meaningEs: 'muy', syntacticRole: 'Modificador de grado', pinyin: 'hěn' },
      ja: { token: 'とても', category: 'adverb', meaningEs: 'muy', syntacticRole: 'Modificador de grado', romaji: 'totemo' },
    },
  },
  siempre: {
    category: 'adverb',
    meaningEs: 'siempre',
    syntacticRole: 'Adverbio de tiempo',
    translations: {
      es: { token: 'siempre', category: 'adverb', meaningEs: 'siempre', syntacticRole: 'Adverbio de tiempo' },
      en: { token: 'always', category: 'adverb', meaningEs: 'siempre', syntacticRole: 'Adverbio de frecuencia' },
      pt: { token: 'sempre', category: 'adverb', meaningEs: 'siempre', syntacticRole: 'Advérbio de tempo' },
      it: { token: 'sempre', category: 'adverb', meaningEs: 'siempre', syntacticRole: 'Avverbio di tempo' },
      fr: { token: 'toujours', category: 'adverb', meaningEs: 'siempre', syntacticRole: 'Adverbe de temps' },
      de: { token: 'immer', category: 'adverb', meaningEs: 'siempre', syntacticRole: 'Temporaladverb' },
      zh: { token: '总是', category: 'adverb', meaningEs: 'siempre', syntacticRole: 'Adverbio de frecuencia', pinyin: 'zǒngshì' },
      ja: { token: 'いつも', category: 'adverb', meaningEs: 'siempre', syntacticRole: 'Adverbio de frecuencia', romaji: 'itsumo' },
    },
  },

  // NOUNS
  amigo: {
    category: 'noun',
    meaningEs: 'amigo',
    syntacticRole: 'Núcleo nominal',
    translations: {
      es: { token: 'amigo', category: 'noun', meaningEs: 'amigo', syntacticRole: 'Sustantivo' },
      en: { token: 'friend', category: 'noun', meaningEs: 'amigo', syntacticRole: 'Sustantivo' },
      pt: { token: 'amigo', category: 'noun', meaningEs: 'amigo', syntacticRole: 'Substantivo' },
      it: { token: 'amico', category: 'noun', meaningEs: 'amigo', syntacticRole: 'Sostantivo' },
      fr: { token: 'ami', category: 'noun', meaningEs: 'amigo', syntacticRole: 'Nom commun' },
      de: { token: 'Freund', category: 'noun', meaningEs: 'amigo', syntacticRole: 'Substantiv' },
      zh: { token: '朋友', category: 'noun', meaningEs: 'amigo', syntacticRole: 'Sustantivo', pinyin: 'péngyou' },
      ja: { token: '友達', category: 'noun', meaningEs: 'amigo', syntacticRole: 'Sustantivo', romaji: 'tomodachi' },
    },
  },
  hermano: {
    category: 'noun',
    meaningEs: 'hermano',
    syntacticRole: 'Núcleo nominal',
    translations: {
      es: { token: 'hermano', category: 'noun', meaningEs: 'hermano', syntacticRole: 'Sustantivo' },
      en: { token: 'brother', category: 'noun', meaningEs: 'hermano', syntacticRole: 'Sustantivo' },
      pt: { token: 'irmão', category: 'noun', meaningEs: 'hermano', syntacticRole: 'Substantivo' },
      it: { token: 'fratello', category: 'noun', meaningEs: 'hermano', syntacticRole: 'Sostantivo' },
      fr: { token: 'frère', category: 'noun', meaningEs: 'hermano', syntacticRole: 'Nom commun' },
      de: { token: 'Bruder', category: 'noun', meaningEs: 'hermano', syntacticRole: 'Substantiv' },
      zh: { token: '兄弟', category: 'noun', meaningEs: 'hermano', syntacticRole: 'Sustantivo', pinyin: 'xiōngdì' },
      ja: { token: '兄弟', category: 'noun', meaningEs: 'hermano', syntacticRole: 'Sustantivo', romaji: 'kyōdai' },
    },
  },
  gato: {
    category: 'noun',
    meaningEs: 'gato',
    syntacticRole: 'Núcleo nominal',
    translations: {
      es: { token: 'gato', category: 'noun', meaningEs: 'gato', syntacticRole: 'Sustantivo' },
      en: { token: 'cat', category: 'noun', meaningEs: 'gato', syntacticRole: 'Sustantivo' },
      pt: { token: 'gato', category: 'noun', meaningEs: 'gato', syntacticRole: 'Substantivo' },
      it: { token: 'gatto', category: 'noun', meaningEs: 'gato', syntacticRole: 'Sostantivo' },
      fr: { token: 'chat', category: 'noun', meaningEs: 'gato', syntacticRole: 'Nom' },
      de: { token: 'Katze', category: 'noun', meaningEs: 'gato', syntacticRole: 'Substantiv' },
      zh: { token: '猫', category: 'noun', meaningEs: 'gato', syntacticRole: 'Sustantivo', pinyin: 'māo' },
      ja: { token: '猫', category: 'noun', meaningEs: 'gato', syntacticRole: 'Sustantivo', romaji: 'neko' },
    },
  },
};

// Build reverse lookup index for all supported languages
const REVERSE_INDEX: Map<string, { conceptKey: string; entry: LexicalEntry }> = new Map();
for (const [conceptKey, entry] of Object.entries(LEXICON)) {
  for (const [langKey, word] of Object.entries(entry.translations)) {
    const norm = normalizeClean(word.token);
    REVERSE_INDEX.set(`${langKey}:${norm}`, { conceptKey, entry });
  }
}

/**
 * Client Fallback Translator:
 * Translates any sentence across 8 languages if server returns 404 or fails.
 */
export function clientFallbackTranslate(
  rawText: string,
  sourceLanguageKey: SupportedLanguageKey
): LanguageResult[] {
  const normInput = normalizeClean(rawText);

  // 1. First check if it matches any canonical example or translation
  for (const ex of CANONICAL_EXAMPLES) {
    if (
      normalizeClean(ex.spanish) === normInput ||
      normalizeClean(ex.englishPrompt) === normInput
    ) {
      return getCanonicalResults(ex, sourceLanguageKey);
    }
    for (const r of ex.results) {
      if (normalizeClean(r.fullTranslation) === normInput) {
        return getCanonicalResults(ex, sourceLanguageKey);
      }
    }
  }

  // 2. Tokenize input
  const words = rawText
    .trim()
    .split(/\s+/)
    .map((w) => normalizeClean(w))
    .filter(Boolean);

  const matchedConcepts: LexicalEntry[] = [];
  for (const w of words) {
    // Check specific language index or direct Spanish lexicon key
    const directLookup = REVERSE_INDEX.get(`${sourceLanguageKey}:${w}`);
    if (directLookup) {
      matchedConcepts.push(directLookup.entry);
    } else if (LEXICON[w]) {
      matchedConcepts.push(LEXICON[w]);
    } else {
      // Guess category and keep word as general token
      matchedConcepts.push({
        category: 'other',
        meaningEs: w,
        syntacticRole: 'Elemento de la cláusula',
        translations: {
          es: { token: w, category: 'other', meaningEs: w, syntacticRole: 'Elemento' },
          en: { token: w, category: 'other', meaningEs: w, syntacticRole: 'Element' },
          pt: { token: w, category: 'other', meaningEs: w, syntacticRole: 'Elemento' },
          it: { token: w, category: 'other', meaningEs: w, syntacticRole: 'Elemento' },
          fr: { token: w, category: 'other', meaningEs: w, syntacticRole: 'Élément' },
          de: { token: w, category: 'other', meaningEs: w, syntacticRole: 'Element' },
          zh: { token: w, category: 'other', meaningEs: w, syntacticRole: '元素', pinyin: w },
          ja: { token: w, category: 'other', meaningEs: w, syntacticRole: '要素', romaji: w },
        },
      });
    }
  }

  // Target languages to produce (all supported except source)
  const targetLanguages = SUPPORTED_LANGUAGES.filter((l) => l.key !== sourceLanguageKey);

  const results: LanguageResult[] = targetLanguages.map((targetLang) => {
    const tokens: AnalyzedToken[] = [];
    const fullTokens: string[] = [];
    let pinyinList: string[] = [];
    let romajiList: string[] = [];

    // Synthesize sentence in target language
    // Special grammar structure for Japanese & Chinese
    if (targetLang.key === 'ja') {
      // Japanese structure: Subject + は (particle) + Adjective/Noun + です (copula)
      const subject = matchedConcepts.find((c) => c.category === 'pronoun' || c.category === 'noun');
      const verb = matchedConcepts.find((c) => c.category === 'main_verb' || c.category === 'auxiliary_verb');
      const adj = matchedConcepts.find((c) => c.category === 'adjective');
      const neg = matchedConcepts.find((c) => c.category === 'negation');

      let idx = 1;
      if (subject) {
        const tr = subject.translations.ja;
        tokens.push({
          id: `ja-${idx++}`,
          text: tr.token,
          category: tr.category,
          categoryLabelEs: GRAMMAR_CATEGORIES[tr.category]?.nameEs || 'Pronombres',
          meaningEs: tr.meaningEs,
          syntacticRole: 'Sujeto / Tópico',
          spanishCorrespondence: tr.meaningEs,
          romaji: tr.romaji,
        });
        // Topic particle "は" (wa)
        tokens.push({
          id: `ja-${idx++}`,
          text: 'は',
          category: 'other',
          categoryLabelEs: 'Otras palabras (partícula)',
          meaningEs: 'marcador de tópico',
          syntacticRole: 'Partícula gramatical',
          spanishCorrespondence: 'marcador de tema',
          romaji: 'wa',
        });
      }

      if (adj) {
        const tr = adj.translations.ja;
        tokens.push({
          id: `ja-${idx++}`,
          text: tr.token,
          category: tr.category,
          categoryLabelEs: GRAMMAR_CATEGORIES[tr.category]?.nameEs || 'Adjetivos',
          meaningEs: tr.meaningEs,
          syntacticRole: 'Atributo',
          spanishCorrespondence: tr.meaningEs,
          romaji: tr.romaji,
        });
      }

      if (neg) {
        tokens.push({
          id: `ja-${idx++}`,
          text: 'ではありません',
          category: 'negation',
          categoryLabelEs: 'Negaciones',
          meaningEs: 'no es',
          syntacticRole: 'Cópula negativa formal',
          spanishCorrespondence: 'no es',
          romaji: 'dewa arimasen',
        });
      } else if (verb || subject || adj) {
        tokens.push({
          id: `ja-${idx++}`,
          text: 'です',
          category: 'auxiliary_verb',
          categoryLabelEs: 'Verbos Auxiliares',
          meaningEs: 'cópula formal',
          syntacticRole: 'Cópula formal',
          spanishCorrespondence: 'ser (cópula)',
          romaji: 'desu',
        });
      }

      const fullTranslation = tokens.map((t) => t.text).join('');
      const romajiFull = tokens.map((t) => t.romaji || t.text).join(' ');

      return {
        languageKey: 'ja',
        languageName: 'Japonés',
        flag: '🇯🇵',
        bcp47: 'ja-JP',
        fullTranslation,
        phoneticTranscription: romajiFull,
        phoneticLabel: 'Hepburn Rōmaji',
        tokens,
        grammarNotes: 'Estructura SOV con marcador de tema は y cópula de cortesía です.',
      };
    }

    if (targetLang.key === 'zh') {
      // Chinese structure: Subject + 是 + (negation 不) + Adjective/Noun + (的)
      const subject = matchedConcepts.find((c) => c.category === 'pronoun' || c.category === 'noun');
      const verb = matchedConcepts.find((c) => c.category === 'main_verb');
      const adj = matchedConcepts.find((c) => c.category === 'adjective');
      const neg = matchedConcepts.find((c) => c.category === 'negation');

      let idx = 1;
      if (subject) {
        const tr = subject.translations.zh;
        tokens.push({
          id: `zh-${idx++}`,
          text: tr.token,
          category: tr.category,
          categoryLabelEs: GRAMMAR_CATEGORIES[tr.category]?.nameEs || 'Pronombres',
          meaningEs: tr.meaningEs,
          syntacticRole: 'Sujeto',
          spanishCorrespondence: tr.meaningEs,
          pinyin: tr.pinyin,
        });
      }

      if (neg) {
        tokens.push({
          id: `zh-${idx++}`,
          text: '不',
          category: 'negation',
          categoryLabelEs: 'Negaciones',
          meaningEs: 'no',
          syntacticRole: 'Negación',
          spanishCorrespondence: 'no',
          pinyin: 'bù',
        });
      }

      if (verb && !neg) {
        tokens.push({
          id: `zh-${idx++}`,
          text: '是',
          category: 'main_verb',
          categoryLabelEs: 'Verbos Principales',
          meaningEs: 'ser',
          syntacticRole: 'Verbo copulativo',
          spanishCorrespondence: 'ser',
          pinyin: 'shì',
        });
      }

      if (adj) {
        const tr = adj.translations.zh;
        tokens.push({
          id: `zh-${idx++}`,
          text: tr.token,
          category: tr.category,
          categoryLabelEs: GRAMMAR_CATEGORIES[tr.category]?.nameEs || 'Adjetivos',
          meaningEs: tr.meaningEs,
          syntacticRole: 'Atributo',
          spanishCorrespondence: tr.meaningEs,
          pinyin: tr.pinyin,
        });
      }

      const fullTranslation = tokens.map((t) => t.text).join('');
      const pinyinFull = tokens.map((t) => t.pinyin || t.text).join(' ');

      return {
        languageKey: 'zh',
        languageName: 'Chino mandarín',
        flag: '🇨🇳',
        bcp47: 'zh-CN',
        fullTranslation,
        phoneticTranscription: pinyinFull,
        phoneticLabel: 'Hanyu Pinyin con tonos',
        tokens,
        grammarNotes: 'Estructura SVO con verbo copulativo 是 y clasificador morfológico tonal.',
      };
    }

    // European languages: iterate ordered concepts
    matchedConcepts.forEach((concept, idx) => {
      const tr = concept.translations[targetLang.key] || concept.translations.en;
      tokens.push({
        id: `${targetLang.key}-${idx + 1}`,
        text: tr.token,
        category: tr.category,
        categoryLabelEs: GRAMMAR_CATEGORIES[tr.category]?.nameEs || 'Otra palabra',
        meaningEs: tr.meaningEs,
        syntacticRole: tr.syntacticRole,
        spanishCorrespondence: tr.meaningEs,
      });
      fullTokens.push(tr.token);
    });

    // Capitalize first token
    if (tokens.length > 0) {
      tokens[0].text = tokens[0].text.charAt(0).toUpperCase() + tokens[0].text.slice(1);
    }

    const fullTranslation = tokens.map((t) => t.text).join(' ');

    return {
      languageKey: targetLang.key,
      languageName: targetLang.name,
      flag: targetLang.flag,
      bcp47: targetLang.bcp47,
      fullTranslation,
      tokens,
    };
  });

  return results;
}
