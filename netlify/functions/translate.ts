import { GoogleGenAI } from '@google/genai';

const apiKey = process.env.GEMINI_API_KEY;
const ai = apiKey
  ? new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    })
  : null;

const SUPPORTED_LANGUAGES = [
  { key: 'es', name: 'Español', flag: '🇪🇸', bcp47: 'es-ES' },
  { key: 'en', name: 'Inglés', flag: '🇬🇧', bcp47: 'en-US' },
  { key: 'pt', name: 'Portugués', flag: '🇧🇷', bcp47: 'pt-BR' },
  { key: 'it', name: 'Italiano', flag: '🇮🇹', bcp47: 'it-IT' },
  { key: 'fr', name: 'Francés', flag: '🇫🇷', bcp47: 'fr-FR' },
  { key: 'de', name: 'Alemán', flag: '🇩🇪', bcp47: 'de-DE' },
  { key: 'zh', name: 'Chino mandarín', flag: '🇨🇳', bcp47: 'zh-CN' },
  { key: 'ja', name: 'Japonés', flag: '🇯🇵', bcp47: 'ja-JP' },
];

const GRAMMAR_CATEGORIES: Record<string, { nameEs: string }> = {
  noun: { nameEs: 'Sustantivos' },
  pronoun: { nameEs: 'Pronombres' },
  main_verb: { nameEs: 'Verbos Principales' },
  auxiliary_verb: { nameEs: 'Verbos Auxiliares' },
  negation: { nameEs: 'Negaciones' },
  preposition: { nameEs: 'Preposiciones' },
  adjective: { nameEs: 'Adjetivos' },
  adverb: { nameEs: 'Adverbios' },
  article: { nameEs: 'Artículos' },
  other: { nameEs: 'Otras Palabras' },
};

const VALID_CATEGORIES = [
  'noun',
  'pronoun',
  'main_verb',
  'auxiliary_verb',
  'negation',
  'preposition',
  'adjective',
  'adverb',
  'article',
  'other',
];

export const handler = async (event: any) => {
  const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method Not Allowed' }),
    };
  }

  try {
    const parsedBody =
      typeof event.body === 'string' ? JSON.parse(event.body || '{}') : event.body || {};
    const { text, sourceLanguage = 'es' } = parsedBody;

    if (!text || typeof text !== 'string' || !text.trim()) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Debes proporcionar una frase para traducir.' }),
      };
    }

    const trimmedInput = text.trim();
    const sourceConfig =
      SUPPORTED_LANGUAGES.find((l) => l.key === sourceLanguage) || SUPPORTED_LANGUAGES[0];
    const targetLanguages = SUPPORTED_LANGUAGES.filter((l) => l.key !== sourceConfig.key);

    if (ai) {
      const targetLanguagesList = targetLanguages
        .map((t) => `- ${t.name} (${t.key}, ${t.bcp47})`)
        .join('\n');

      const prompt = `Actúa como lingüista computacional y traductor multilingüe experto.
Frase de origen (${sourceConfig.name} - ${sourceConfig.key}): "${trimmedInput}"
Tradúcela a exactamente estos 7 idiomas de destino:
${targetLanguagesList}

Clasifica cada palabra o token en una de estas 10 categorías gramaticales:
- "noun": sustantivos
- "pronoun": pronombres personales o relativos (determinantes posesivos con nombre como my/mi son "other")
- "main_verb": verbos principales de la acción o cópula
- "auxiliary_verb": verbos auxiliares (does, have, está, desu, etc.)
- "negation": negaciones (not, no, nicht, pas, etc.)
- "preposition": preposiciones (on, in, de, to, etc.)
- "adjective": adjetivos
- "adverb": adverbios
- "article": artículos (the, a, il, der, etc.)
- "other": otras palabras (posesivos que acompañan sustantivos, conjunciones, partículas)

Estructura JSON compacta requerida:
{
  "results": [
    {
      "languageKey": "en",
      "fullTranslation": "translation",
      "phoneticTranscription": null,
      "tokens": [
        ["palabra", "categoria", "significado breve en español", "rol sintáctico", "pinyin_o_romaji_opcional"]
      ]
    }
  ]
}
Nota: "phoneticTranscription" solo para "zh" (Hanyu Pinyin con marcas tonales) y "ja" (Hepburn Rōmaji). Para los demás pon null.`;

      const candidateModels = [
        'gemini-3.5-flash',
        'gemini-3.5-flash-lite',
        'gemini-3.1-flash-lite',
        'gemini-3.8-flash',
        'gemini-flash-latest',
      ];
      let lastModelError: any = null;

      for (const modelName of candidateModels) {
        try {
          const timeoutPromise = new Promise((_, reject) =>
            setTimeout(() => reject(new Error('Timeout de consulta al modelo')), 25000)
          );

          const generatePromise = ai.models.generateContent({
            model: modelName,
            contents: prompt,
            config: {
              responseMimeType: 'application/json',
              temperature: 0.1,
              thinkingConfig: { thinkingBudget: 0 },
            },
          });

          const response: any = await Promise.race([generatePromise, timeoutPromise]);
          const rawJson = response.text || '';
          const parsed = JSON.parse(rawJson);

          if (parsed.results && Array.isArray(parsed.results) && parsed.results.length >= 7) {
            const formattedResults = targetLanguages.map((targetLang) => {
              const item =
                parsed.results.find((p: any) => p.languageKey === targetLang.key) ||
                parsed.results[0];
              const rawTokens = Array.isArray(item.tokens) ? item.tokens : [];

              const tokens = rawTokens.map((t: any, idx: number) => {
                if (Array.isArray(t)) {
                  const tokenText = String(t[0] || '');
                  const rawCat = String(t[1] || 'other').toLowerCase();
                  const cat = VALID_CATEGORIES.includes(rawCat) ? rawCat : 'other';
                  const meaning = String(t[2] || tokenText);
                  const role = String(t[3] || 'Elemento');
                  const phonetic = t[4] ? String(t[4]) : undefined;
                  return {
                    id: `${targetLang.key}-${idx + 1}`,
                    text: tokenText,
                    category: cat,
                    categoryLabelEs: GRAMMAR_CATEGORIES[cat]?.nameEs || 'Otra palabra',
                    meaningEs: meaning,
                    syntacticRole: role,
                    spanishCorrespondence: meaning,
                    pinyin: targetLang.key === 'zh' ? phonetic : undefined,
                    romaji: targetLang.key === 'ja' ? phonetic : undefined,
                  };
                }
                const tokenText = String(t?.text || '');
                const rawCat = String(t?.category || 'other').toLowerCase();
                const cat = VALID_CATEGORIES.includes(rawCat) ? rawCat : 'other';
                return {
                  id: t?.id || `${targetLang.key}-${idx + 1}`,
                  text: tokenText,
                  category: cat,
                  categoryLabelEs: GRAMMAR_CATEGORIES[cat]?.nameEs || 'Otra palabra',
                  meaningEs: t?.meaningEs || tokenText,
                  syntacticRole: t?.syntacticRole || 'Elemento',
                  spanishCorrespondence: t?.spanishCorrespondence || tokenText,
                  pinyin: t?.pinyin,
                  romaji: t?.romaji,
                };
              });

              return {
                languageKey: targetLang.key,
                languageName: targetLang.name,
                flag: targetLang.flag,
                bcp47: targetLang.bcp47,
                fullTranslation: item.fullTranslation || '',
                phoneticTranscription: item.phoneticTranscription || undefined,
                phoneticLabel:
                  targetLang.key === 'zh'
                    ? 'Hanyu Pinyin con tonos'
                    : targetLang.key === 'ja'
                    ? 'Hepburn Rōmaji'
                    : undefined,
                tokens,
              };
            });

            return {
              statusCode: 200,
              headers,
              body: JSON.stringify({
                success: true,
                source: 'ai',
                model: modelName,
                sourceLanguage: sourceConfig.key,
                originalText: trimmedInput,
                results: formattedResults,
              }),
            };
          }
        } catch (err: any) {
          lastModelError = err;
        }
      }
    }

    return {
      statusCode: 503,
      headers,
      body: JSON.stringify({
        error: 'El servicio de IA no estuvo disponible. Se utilizará el motor de traducción cliente.',
      }),
    };
  } catch (error: any) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: error?.message || 'Error interno' }),
    };
  }
};
