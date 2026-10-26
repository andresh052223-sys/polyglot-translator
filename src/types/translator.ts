export type GrammarCategory =
  | 'noun'
  | 'pronoun'
  | 'main_verb'
  | 'auxiliary_verb'
  | 'negation'
  | 'preposition'
  | 'adjective'
  | 'adverb'
  | 'article'
  | 'other';

export interface GrammarCategoryInfo {
  key: GrammarCategory;
  nameEs: string;
  nameEn: string;
  emoji: string;
  colorName: string;
  hexColor: string;
  borderColorHex: string;
  bgClass: string;
  textClass: string;
  borderClass: string;
  badgeBgClass: string;
  ringClass: string;
  description: string;
  example: string;
}

export const GRAMMAR_CATEGORIES: Record<GrammarCategory, GrammarCategoryInfo> = {
  noun: {
    key: 'noun',
    nameEs: 'Sustantivos',
    nameEn: 'Nouns',
    emoji: '🟨',
    colorName: 'Amarillo (#FACC15)',
    hexColor: '#FACC15',
    borderColorHex: '#EAB308',
    bgClass: 'bg-[#FACC15]',
    textClass: 'text-stone-950 font-bold',
    borderClass: 'border border-amber-500',
    badgeBgClass: 'bg-[#FACC15] text-stone-950 border border-amber-600',
    ringClass: 'ring-amber-400',
    description: 'Nombres de personas, lugares, cosas, seres vivos o entidades abstractas.',
    example: 'hermano, chef, meal, documents, brother',
  },
  pronoun: {
    key: 'pronoun',
    nameEs: 'Pronombres',
    nameEn: 'Pronouns',
    emoji: '🟧',
    colorName: 'Naranja (#F97316)',
    hexColor: '#F97316',
    borderColorHex: '#EA580C',
    bgClass: 'bg-[#F97316]',
    textClass: 'text-white font-bold',
    borderClass: 'border border-orange-700',
    badgeBgClass: 'bg-[#F97316] text-white',
    ringClass: 'ring-orange-500',
    description: 'Pronombres personales y relativos que sustituyen al nombre (I, she, you, they, él). Excluye posesivos que acompañan a un sustantivo.',
    example: 'She, they, you, him, ele, lui',
  },
  main_verb: {
    key: 'main_verb',
    nameEs: 'Verbos Principales',
    nameEn: 'Main Verbs',
    emoji: '🟦',
    colorName: 'Azul (#3B82F6)',
    hexColor: '#3B82F6',
    borderColorHex: '#2563EB',
    bgClass: 'bg-[#3B82F6]',
    textClass: 'text-white font-bold',
    borderClass: 'border border-blue-700',
    badgeBgClass: 'bg-[#3B82F6] text-white',
    ringClass: 'ring-blue-500',
    description: 'Expresan la acción, estado o proceso nuclear principal de la cláusula.',
    example: 'work, studying, prepares, dio, arbeiten, 働く',
  },
  auxiliary_verb: {
    key: 'auxiliary_verb',
    nameEs: 'Verbos Auxiliares',
    nameEn: 'Auxiliary Verbs',
    emoji: '🟩',
    colorName: 'Verde (#22C55E)',
    hexColor: '#22C55E',
    borderColorHex: '#16A34A',
    bgClass: 'bg-[#22C55E]',
    textClass: 'text-white font-bold',
    borderClass: 'border border-green-700',
    badgeBgClass: 'bg-[#22C55E] text-white',
    ringClass: 'ring-green-500',
    description: 'Acompañan al verbo principal formando tiempos compuestos, perifrásticos o modales (does, have, been, está, masu).',
    example: 'does, have, been, está, ont, haben, です',
  },
  negation: {
    key: 'negation',
    nameEs: 'Negaciones',
    nameEn: 'Negations',
    emoji: '🟥',
    colorName: 'Rojo (#EF4444)',
    hexColor: '#EF4444',
    borderColorHex: '#DC2626',
    bgClass: 'bg-[#EF4444]',
    textClass: 'text-white font-bold',
    borderClass: 'border border-red-700',
    badgeBgClass: 'bg-[#EF4444] text-white',
    ringClass: 'ring-red-500',
    description: 'Partículas y palabras que expresan polaridad negativa oracional o adverbial directa.',
    example: 'not, no, nicht, ne, pas, não, non, 不, ません',
  },
  preposition: {
    key: 'preposition',
    nameEs: 'Preposiciones',
    nameEn: 'Prepositions',
    emoji: '🟪',
    colorName: 'Morado (#A855F7)',
    hexColor: '#A855F7',
    borderColorHex: '#9333EA',
    bgClass: 'bg-[#A855F7]',
    textClass: 'text-white font-bold',
    borderClass: 'border border-purple-700',
    badgeBgClass: 'bg-[#A855F7] text-white',
    ringClass: 'ring-purple-500',
    description: 'Unen palabras estableciendo relaciones espaciales, temporales, directivas o lógicas.',
    example: 'on, to, in, sobre, a, sur, nach, に, へ',
  },
  adjective: {
    key: 'adjective',
    nameEs: 'Adjetivos',
    nameEn: 'Adjectives',
    emoji: '⬜',
    colorName: 'Gris (#D1D5DB)',
    hexColor: '#D1D5DB',
    borderColorHex: '#9CA3AF',
    bgClass: 'bg-[#D1D5DB]',
    textClass: 'text-slate-900 font-bold',
    borderClass: 'border border-gray-400',
    badgeBgClass: 'bg-[#D1D5DB] text-slate-900 border border-gray-400',
    ringClass: 'ring-gray-400',
    description: 'Modifican y describen cualidades o estados de los sustantivos con alta legibilidad.',
    example: 'intelligent, delicious, financial, köstliche, 賢い',
  },
  adverb: {
    key: 'adverb',
    nameEs: 'Adverbios',
    nameEn: 'Adverbs',
    emoji: '⬛',
    colorName: 'Negro (#111827)',
    hexColor: '#111827',
    borderColorHex: '#030712',
    bgClass: 'bg-[#111827]',
    textClass: 'text-white font-bold',
    borderClass: 'border border-black',
    badgeBgClass: 'bg-[#111827] text-white border border-stone-800',
    ringClass: 'ring-stone-800',
    description: 'Modifican verbos, adjetivos u otros adverbios (modo, grado, intensidad, frecuencia, tiempo).',
    example: 'very, carefully, efficiently, usually, yesterday, 非常',
  },
  article: {
    key: 'article',
    nameEs: 'Artículos',
    nameEn: 'Articles',
    emoji: '🩷',
    colorName: 'Rosado (#EC4899)',
    hexColor: '#EC4899',
    borderColorHex: '#DB2777',
    bgClass: 'bg-[#EC4899]',
    textClass: 'text-white font-bold',
    borderClass: 'border border-pink-700',
    badgeBgClass: 'bg-[#EC4899] text-white',
    ringClass: 'ring-pink-500',
    description: 'Determinan al sustantivo como definido o indefinido según las reglas de cada idioma.',
    example: 'the, a, o, a, il, le, der, die, eine',
  },
  other: {
    key: 'other',
    nameEs: 'Otras Palabras',
    nameEn: 'Other Words',
    emoji: '◽',
    colorName: 'Blanco (#FFFFFF) borde gris (#374151)',
    hexColor: '#FFFFFF',
    borderColorHex: '#374151',
    bgClass: 'bg-[#FFFFFF]',
    textClass: 'text-slate-900 font-bold',
    borderClass: 'border-2 border-[#374151]',
    badgeBgClass: 'bg-white text-slate-900 border-2 border-[#374151]',
    ringClass: 'ring-slate-700',
    description: 'Posesivos que acompañan sustantivos (my, mi, ma), conjunciones, partículas de caso (は, が, を), partículas chinas (的, 吗) y signos.',
    example: 'my, mi, and, de (posesivo), は, を, 的, ¿, ?',
  },
};

export interface AnalyzedToken {
  id: string;
  text: string;
  category: GrammarCategory;
  categoryLabelEs: string;
  meaningEs: string;
  syntacticRole: string;
  spanishCorrespondence?: string;
  pinyin?: string;
  romaji?: string;
}

export type SupportedLanguageKey = 'es' | 'en' | 'pt' | 'it' | 'fr' | 'de' | 'zh' | 'ja';

export interface LanguageConfig {
  key: SupportedLanguageKey;
  name: string;
  nativeName: string;
  flag: string;
  bcp47: string;
  voicePrefixes: string[];
  inputLabel: string;
  placeholder: string;
  translateBtnText: string;
  phoneticType?: 'pinyin' | 'romaji';
  phoneticLabel?: string;
  direction?: 'ltr' | 'rtl';
}

export const SUPPORTED_LANGUAGES: LanguageConfig[] = [
  {
    key: 'es',
    name: 'Español',
    nativeName: 'Español',
    flag: '🇪🇸',
    bcp47: 'es-ES',
    voicePrefixes: ['es-ES', 'es-MX', 'es'],
    inputLabel: 'Escribe o introduce una frase en español',
    placeholder: 'Ejemplo: Mi hermano es muy inteligente, o escribe cualquier oración profesional, cotidiana o compuesta...',
    translateBtnText: 'Traducir desde español',
  },
  {
    key: 'en',
    name: 'Inglés',
    nativeName: 'English',
    flag: '🇬🇧',
    bcp47: 'en-US',
    voicePrefixes: ['en-US', 'en-GB', 'en'],
    inputLabel: 'Enter a sentence in English',
    placeholder: 'Example: My brother is very intelligent, or enter any business, everyday, or question sentence...',
    translateBtnText: 'Translate from English',
  },
  {
    key: 'pt',
    name: 'Portugués',
    nativeName: 'Português',
    flag: '🇧🇷',
    bcp47: 'pt-BR',
    voicePrefixes: ['pt-BR', 'pt-PT', 'pt'],
    inputLabel: 'Digite uma frase em português',
    placeholder: 'Exemplo: O meu irmão é muito inteligente, ou digite qualquer frase profissional ou quotidiana...',
    translateBtnText: 'Traduzir do português',
  },
  {
    key: 'it',
    name: 'Italiano',
    nativeName: 'Italiano',
    flag: '🇮🇹',
    bcp47: 'it-IT',
    voicePrefixes: ['it-IT', 'it'],
    inputLabel: 'Scrivi una frase in italiano',
    placeholder: 'Esempio: Mio fratello è molto intelligente, oppure inserisci una frase complessa...',
    translateBtnText: 'Traduci dall\'italiano',
  },
  {
    key: 'fr',
    name: 'Francés',
    nativeName: 'Français',
    flag: '🇫🇷',
    bcp47: 'fr-FR',
    voicePrefixes: ['fr-FR', 'fr'],
    inputLabel: 'Écrivez une phrase en français',
    placeholder: 'Exemple : Mon frère est très intelligent, ou écrivez une phrase quelconque...',
    translateBtnText: 'Traduire depuis le français',
  },
  {
    key: 'de',
    name: 'Alemán',
    nativeName: 'Deutsch',
    flag: '🇩🇪',
    bcp47: 'de-DE',
    voicePrefixes: ['de-DE', 'de'],
    inputLabel: 'Gib einen Satz auf Deutsch ein',
    placeholder: 'Beispiel: Mein Bruder ist sehr intelligent, oder gib einen beliebigen Satz ein...',
    translateBtnText: 'Aus dem Deutschen übersetzen',
  },
  {
    key: 'zh',
    name: 'Chino mandarín',
    nativeName: '普通话 / 简体中文',
    flag: '🇨🇳',
    bcp47: 'zh-CN',
    voicePrefixes: ['zh-CN', 'zh-TW', 'zh-HK', 'zh'],
    inputLabel: '请输入中文句子',
    placeholder: '例如：我的哥哥非常聪明，或者输入任何商务、日常或疑问句子...',
    translateBtnText: '从中文翻译',
    phoneticType: 'pinyin',
    phoneticLabel: 'Hanyu Pinyin (con marcas tonales)',
  },
  {
    key: 'ja',
    name: 'Japonés',
    nativeName: '日本語',
    flag: '🇯🇵',
    bcp47: 'ja-JP',
    voicePrefixes: ['ja-JP', 'ja'],
    inputLabel: '日本語の文を入力してください',
    placeholder: '例：私の兄はとても賢いです、またはビジネス、日常、質問などの文を入力...',
    translateBtnText: '日本語から翻訳',
    phoneticType: 'romaji',
    phoneticLabel: 'Hepburn Rōmaji',
  },
];

export interface LanguageResult {
  languageKey: SupportedLanguageKey;
  languageName: string;
  flag: string;
  bcp47: string;
  fullTranslation: string;
  phoneticTranscription?: string;
  phoneticLabel?: string;
  tokens: AnalyzedToken[];
  grammarNotes?: string;
}

export interface TranslationSession {
  id: string;
  sourceText: string;
  spanishInput?: string;
  sourceLanguageKey: SupportedLanguageKey;
  sourceLanguageName: string;
  timestamp: number;
  results: LanguageResult[];
}
