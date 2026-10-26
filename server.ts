import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';
import { CANONICAL_EXAMPLES, getCanonicalResults } from './src/data/canonicalExamples';
import { LanguageResult, SUPPORTED_LANGUAGES, SupportedLanguageKey } from './src/types/translator';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = parseInt(process.env.PORT || '3000', 10);

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

        const response: any = await ai.models.generateContent({
          model: 'gemini-3.1-flash-lite',
          contents: detectPrompt,
          config: {
            responseMimeType: 'application/json',
            temperature: 0,
          },
        });

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
        .map(
          (t, idx) =>
            `${idx + 1}. ${t.name} (código: "${t.key}", BCP47: "${t.bcp47}", bandera: "${t.flag}"${
              t.key === 'zh'
                ? ', caracteres simplificados naturales, phoneticTranscription con Hanyu Pinyin y marcas tonales'
                : t.key === 'ja'
                ? ', kanji/hiragana/katakana natural, phoneticTranscription con Hepburn Rōmaji'
                : ''
            })`
        )
        .join('\n');

      const prompt = `Actúa como lingüista computacional y traductor multilingüe experto.
Recibirás una frase en ${sourceConfig.name} (${sourceConfig.key}): "${trimmedInput}".
Tradúcela a exactamente estos 7 idiomas de destino:
${targetLanguagesList}

Reglas estrictas de traducción y análisis gramatical:
1. Traduce fielmente y naturalmente a cada uno de los 7 idiomas destino.
2. NUNCA incluyas el idioma de origen (${sourceConfig.name}) entre los resultados de destino. Deben ser exactamente 7 idiomas de destino.
3. Para cada idioma destino, segmenta las palabras u oraciones en tokens e identifica la categoría gramatical ("category") de cada uno en el contexto de su oración, usando estrictamente una de estas 10 categorías:
   - "noun": Sustantivos (personas, cosas, lugares, entidades).
   - "pronoun": Pronombres personales o relativos (I, she, you, they, él, ele). ATENCIÓN: Los determinantes posesivos que acompañan a un sustantivo ("my car", "mi casa", "mon frère", "mein Bruder") deben clasificarse como "other".
   - "main_verb": Verbos principales que expresan la acción, estado o proceso nuclear.
   - "auxiliary_verb": Verbos auxiliares (does, do, have, been, está, ont, haben, です, ます).
   - "negation": Palabras y partículas de negación oracional (not, no, nicht, ne, pas, não, non, 不, ません).
   - "preposition": Preposiciones (on, to, in, de, a, sur, nach, に, へ).
   - "adjective": Adjetivos calificativos o descriptivos.
   - "adverb": Adverbios de modo, grado, intensidad, frecuencia, tiempo.
   - "article": Artículos definidos e indefinidos según cada idioma (the, a, un, o, a, il, le, der).
   - "other": Otras palabras (posesivos que acompañan sustantivos, conjunciones, partículas japonesas は/が/を, partículas chinas 的/得/吗/了, etc.).

4. Para cada token incluye:
   - "id": string identificador único (ej: "${targetLanguages[0].key}-1")
   - "text": la palabra o token
   - "category": una de las 10 categorías exactas
   - "categoryLabelEs": nombre en español de la categoría (ej: "Sustantivo", "Pronombre", "Verbo Principal", "Auxiliar", "Negación", "Preposición", "Adjetivo", "Adverbio", "Artículo", "Otra palabra")
   - "meaningEs": significado o glosa concisa en español (1-3 palabras)
   - "syntacticRole": función sintáctica contextual breve
   - "spanishCorrespondence": correspondencia aproximada
   - "pinyin": obligatorio solo para tokens en chino ("zh") con marcas tonales
   - "romaji": obligatorio solo para tokens en japonés ("ja") en Hepburn

5. En "phoneticTranscription":
   - Solo debe generarse para Chino mandarín ("zh") con Hanyu Pinyin y tonos.
   - Solo debe generarse para Japonés ("ja") con Hepburn Rōmaji.
   - Para los demás idiomas debe ser null.

Responde ÚNICAMENTE un objeto JSON válido con esta estructura:
{
  "results": [
    {
      "languageKey": "${targetLanguages[0].key}",
      "languageName": "${targetLanguages[0].name}",
      "flag": "${targetLanguages[0].flag}",
      "bcp47": "${targetLanguages[0].bcp47}",
      "fullTranslation": "...",
      "phoneticTranscription": null,
      "phoneticLabel": null,
      "tokens": [
        {
          "id": "${targetLanguages[0].key}-1",
          "text": "word",
          "category": "noun",
          "categoryLabelEs": "Sustantivo",
          "meaningEs": "significado",
          "syntacticRole": "Sujeto",
          "spanishCorrespondence": "palabra"
        }
      ],
      "grammarNotes": "Nota gramatical breve opcional"
    }
  ]
}`;

      const candidateModels = ['gemini-3.8-flash', 'gemini-flash-latest', 'gemini-3.1-flash-lite'];
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
              thinkingConfig: {
                thinkingBudget: 0,
              },
            },
          });

          const response: any = await Promise.race([generatePromise, timeoutPromise]);

          const rawJson = response.text || '';
          const parsed = JSON.parse(rawJson);
          if (parsed.results && Array.isArray(parsed.results) && parsed.results.length >= 7) {
            // Ensure proper phonetic labels for zh & ja
            const formattedResults = parsed.results.map((r: LanguageResult) => {
              if (r.languageKey === 'zh') {
                r.phoneticLabel = 'Hanyu Pinyin con tonos';
              } else if (r.languageKey === 'ja') {
                r.phoneticLabel = 'Hepburn Rōmaji';
              } else {
                r.phoneticTranscription = undefined;
                r.phoneticLabel = undefined;
              }
              return r;
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

// In development, hook up Vite middleware; in production, serve static files
if (process.env.NODE_ENV !== 'production') {
  const { createServer } = await import('vite');
  const vite = await createServer({
    server: { middlewareMode: true },
    appType: 'spa',
  });
  app.use(vite.middlewares);
} else {
  app.use(express.static(path.resolve(__dirname, 'dist')));
  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
  });
}

app.listen(port, '0.0.0.0', () => {
  console.log(`Polyglot Color Translator server running at http://0.0.0.0:${port}`);
});
