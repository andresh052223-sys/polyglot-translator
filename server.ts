import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';
import { CANONICAL_EXAMPLES, getCanonicalResults } from './src/data/canonicalExamples';
import {
  LanguageResult,
  SUPPORTED_LANGUAGES,
  SupportedLanguageKey,
  GRAMMAR_CATEGORIES,
  GrammarCategory,
  AnalyzedToken,
} from './src/types/translator';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

function getPort(): number {
  const portArgIdx = process.argv.indexOf('--port');
  if (portArgIdx !== -1 && process.argv[portArgIdx + 1]) {
    return parseInt(process.argv[portArgIdx + 1], 10);
  }
  return 3000;
}
const port = getPort();

app.use(express.json());

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

function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[¿?¡!.,;:«»"'()[\]{}。、！？]/g, '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, ' ');
}

// API: Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    hasApiKey: Boolean(apiKey),
    timestamp: Date.now(),
  });
});

// API: Detect Language
app.post('/api/detect-language', async (req, res) => {
  try {
    const { text } = req.body;
    if (!text || typeof text !== 'string' || !text.trim()) {
      return res.status(400).json({ error: 'Debes proporcionar un texto para detectar su idioma.' });
    }

    const trimmed = text.trim();
    if (trimmed.length < 3) {
      return res.json({
        detectedKey: null,
        confidence: 'low',
        isAmbiguous: true,
        message: 'La frase es demasiado corta o ambigua para identificar su idioma con suficiente confianza. Por favor selecciona el idioma de origen.',
      });
    }

    // Fast heuristic detection
    if (/[\u3040-\u309F\u30A0-\u30FF]/.test(trimmed)) {
      const langConfig = SUPPORTED_LANGUAGES.find((l) => l.key === 'ja');
      return res.json({
        detectedKey: 'ja',
        languageName: langConfig?.name || 'Japonés',
        flag: '🇯🇵',
        confidence: 'high',
        isAmbiguous: false,
      });
    }

    if (/[\u4E00-\u9FFF]/.test(trimmed)) {
      const langConfig = SUPPORTED_LANGUAGES.find((l) => l.key === 'zh');
      return res.json({
        detectedKey: 'zh',
        languageName: langConfig?.name || 'Chino mandarín',
        flag: '🇨🇳',
        confidence: 'high',
        isAmbiguous: false,
      });
    }

    // Check canonical examples
    const norm = normalizeText(trimmed);
    for (const ex of CANONICAL_EXAMPLES) {
      for (const resItem of ex.results) {
        if (normalizeText(resItem.fullTranslation) === norm) {
          const cfg = SUPPORTED_LANGUAGES.find((l) => l.key === resItem.languageKey);
          return res.json({
            detectedKey: resItem.languageKey,
            languageName: cfg?.name,
            flag: cfg?.flag,
            confidence: 'high',
            isAmbiguous: false,
          });
        }
      }
    }

    // If Gemini is available, use it for accurate identification
    if (ai) {
      try {
        const detectPrompt = `Identifica el idioma del siguiente texto: "${trimmed}".
Opciones estrictas permitidas:
- "es" (Español)
- "en" (Inglés)
- "pt" (Portugués)
- "it" (Italiano)
- "fr" (Francés)
- "de" (Alemán)
- "zh" (Chino)
- "ja" (Japonés)
- "ambiguous" (si es demasiado corto, ambiguo o no corresponde con suficiente certeza a ninguno de estos)

Responde ÚNICAMENTE un JSON con este formato exacto:
{
  "detectedKey": "es" | "en" | "pt" | "it" | "fr" | "de" | "zh" | "ja" | "ambiguous",
  "confidence": "high" | "medium" | "low"
}`;

        const candidateDetectModels = ['gemini-3.5-flash', 'gemini-3.5-flash-lite', 'gemini-3.1-flash-lite'];
        for (const modelName of candidateDetectModels) {
          try {
            const timeoutPromise = new Promise((_, reject) =>
              setTimeout(() => reject(new Error('Detect timeout')), 8000)
            );

            const generatePromise = ai.models.generateContent({
              model: modelName,
              contents: detectPrompt,
              config: {
                responseMimeType: 'application/json',
                temperature: 0,
                thinkingConfig: { thinkingBudget: 0 },
              },
            });

            const response: any = await Promise.race([generatePromise, timeoutPromise]);

            const parsed = JSON.parse(response.text || '{}');
            if (parsed.detectedKey && parsed.detectedKey !== 'ambiguous') {
              const langConfig = SUPPORTED_LANGUAGES.find((l) => l.key === parsed.detectedKey);
              if (langConfig) {
                return res.json({
                  detectedKey: langConfig.key,
                  languageName: langConfig.name,
                  flag: langConfig.flag,
                  confidence: parsed.confidence || 'high',
                  isAmbiguous: false,
                });
              }
            }
          } catch (geminiErr) {
            console.warn(`Detection with ${modelName} failed, trying next:`, geminiErr);
          }
        }
      } catch (geminiErr) {
        console.warn('Gemini detect error, proceeding with heuristic:', geminiErr);
      }
    }

    // Fallback: If still ambiguous
    return res.json({
      detectedKey: null,
      confidence: 'low',
      isAmbiguous: true,
      message: 'La frase es demasiado corta o ambigua para identificar su idioma con suficiente confianza. Por favor selecciona el idioma de origen.',
    });
  } catch (err: any) {
    console.error('Detection error:', err);
    res.status(500).json({ error: 'Error durante la detección de idioma.' });
  }
});

// API: Translate & Analyze
app.post('/api/translate', async (req, res) => {
  try {
    const { text, sourceLanguage = 'es' } = req.body;
    if (!text || typeof text !== 'string' || !text.trim()) {
      return res.status(400).json({ error: 'Debes proporcionar una frase para traducir.' });
    }

    const sourceLangKey = (sourceLanguage as SupportedLanguageKey) || 'es';
    const sourceConfig =
      SUPPORTED_LANGUAGES.find((l) => l.key === sourceLangKey) || SUPPORTED_LANGUAGES[0];

    const targetLanguages = SUPPORTED_LANGUAGES.filter((l) => l.key !== sourceConfig.key);

    const trimmedInput = text.trim();
    const normalizedInput = normalizeText(trimmedInput);

    // 1. Check if the user entered any of the canonical benchmark sentences in ANY language
    let matchedCanonical: (typeof CANONICAL_EXAMPLES)[0] | null = null;

    for (const ex of CANONICAL_EXAMPLES) {
      if (
        normalizeText(ex.spanish) === normalizedInput ||
        normalizeText(ex.englishPrompt) === normalizedInput
      ) {
        matchedCanonical = ex;
        break;
      }
      for (const resItem of ex.results) {
        if (normalizeText(resItem.fullTranslation) === normalizedInput) {
          matchedCanonical = ex;
          break;
        }
      }
      if (matchedCanonical) break;
    }

    if (matchedCanonical) {
      const filteredResults = getCanonicalResults(matchedCanonical, sourceConfig.key);
      return res.json({
        success: true,
        source: 'canonical',
        sourceLanguage: sourceConfig.key,
        originalText: trimmedInput,
        results: filteredResults,
        notes: matchedCanonical.description,
      });
    }

    // 2. If Gemini API is available, generate translations to the exactly 7 other languages
    if (ai) {
      const targetLanguagesList = targetLanguages
        .map((t) => `- ${t.name} (${t.key}, ${t.bcp47})`)
        .join('\n');

      const VALID_CATEGORIES: GrammarCategory[] = [
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
            setTimeout(() => reject(new Error('Timeout de consulta al modelo')), 45000)
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
            const formattedResults: LanguageResult[] = targetLanguages.map((targetLang) => {
              const item =
                parsed.results.find((p: any) => p.languageKey === targetLang.key) ||
                parsed.results[0];
              const rawTokens = Array.isArray(item.tokens) ? item.tokens : [];

              const tokens: AnalyzedToken[] = rawTokens.map((t: any, idx: number) => {
                if (Array.isArray(t)) {
                  const text = String(t[0] || '');
                  const rawCat = String(t[1] || 'other').toLowerCase();
                  const cat: GrammarCategory = (VALID_CATEGORIES.includes(rawCat as any)
                    ? rawCat
                    : 'other') as GrammarCategory;
                  const meaning = String(t[2] || text);
                  const role = String(t[3] || 'Elemento');
                  const phonetic = t[4] ? String(t[4]) : undefined;
                  return {
                    id: `${targetLang.key}-${idx + 1}`,
                    text,
                    category: cat,
                    categoryLabelEs: GRAMMAR_CATEGORIES[cat]?.nameEs || 'Otra palabra',
                    meaningEs: meaning,
                    syntacticRole: role,
                    spanishCorrespondence: meaning,
                    pinyin: targetLang.key === 'zh' ? phonetic : undefined,
                    romaji: targetLang.key === 'ja' ? phonetic : undefined,
                  };
                } else if (typeof t === 'object' && t !== null) {
                  const text = String(t.text || '');
                  const rawCat = String(t.category || 'other').toLowerCase();
                  const cat: GrammarCategory = (VALID_CATEGORIES.includes(rawCat as any)
                    ? rawCat
                    : 'other') as GrammarCategory;
                  return {
                    id: t.id || `${targetLang.key}-${idx + 1}`,
                    text,
                    category: cat,
                    categoryLabelEs:
                      t.categoryLabelEs || GRAMMAR_CATEGORIES[cat]?.nameEs || 'Otra palabra',
                    meaningEs: t.meaningEs || text,
                    syntacticRole: t.syntacticRole || 'Elemento',
                    spanishCorrespondence: t.spanishCorrespondence || t.meaningEs || text,
                    pinyin: targetLang.key === 'zh' ? t.pinyin || t.phonetic : undefined,
                    romaji: targetLang.key === 'ja' ? t.romaji || t.phonetic : undefined,
                  };
                }
                return {
                  id: `${targetLang.key}-${idx + 1}`,
                  text: String(t),
                  category: 'other' as GrammarCategory,
                  categoryLabelEs: 'Otra palabra',
                  meaningEs: String(t),
                  syntacticRole: 'Elemento',
                  spanishCorrespondence: String(t),
                };
              });

              return {
                languageKey: targetLang.key,
                languageName: targetLang.name,
                flag: targetLang.flag,
                bcp47: targetLang.bcp47,
                fullTranslation: item.fullTranslation || '',
                phoneticTranscription:
                  targetLang.key === 'zh' || targetLang.key === 'ja'
                    ? item.phoneticTranscription || undefined
                    : undefined,
                phoneticLabel:
                  targetLang.key === 'zh'
                    ? 'Hanyu Pinyin con tonos'
                    : targetLang.key === 'ja'
                    ? 'Hepburn Rōmaji'
                    : undefined,
                tokens,
                grammarNotes: item.grammarNotes,
              };
            });

            return res.json({
              success: true,
              source: 'ai',
              model: modelName,
              sourceLanguage: sourceConfig.key,
              originalText: trimmedInput,
              results: formattedResults,
            });
          }
        } catch (err: any) {
          lastModelError = err;
          console.warn(`Model ${modelName} failed or unavailable:`, err?.message || err);
        }
      }

      console.error('All Gemini model candidates failed:', lastModelError);
      return res.status(503).json({
        error: 'El servicio de IA tardó demasiado o no estuvo disponible temporalmente. Puedes reintentar o usar uno de los ejemplos preconfigurados.',
        detail: lastModelError?.message || 'High demand spike',
      });
    }

    return res.status(503).json({
      error: 'No se pudo conectar con el servicio de IA o la clave GEMINI_API_KEY no está configurada.',
      suggestion: 'Puedes probar cualquiera de los 8 ejemplos de prueba canónicos preinstalados o verificar tus credenciales.',
    });
  } catch (error: any) {
    console.error('Translation error:', error);
    res.status(500).json({
      error: error?.message || 'Error interno del servidor durante la traducción.',
    });
  }
});

// In development (or if dist is not yet built), hook up Vite middleware; otherwise serve static files
const distPath = path.resolve(__dirname, 'dist');
if (process.env.NODE_ENV === 'production' && fs.existsSync(distPath)) {
  app.use(express.static(distPath));
  app.get('*', (req, res) => {
    res.sendFile(path.resolve(distPath, 'index.html'));
  });
} else {
  const { createServer } = await import('vite');
  const vite = await createServer({
    server: { middlewareMode: true },
    appType: 'spa',
  });
  app.use(vite.middlewares);
}

app.listen(port, '0.0.0.0', () => {
  console.log(`Polyglot Color Translator server running at http://0.0.0.0:${port}`);
});
