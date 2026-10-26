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

export const handler = async (event: any) => {
  const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  try {
    const body = typeof event.body === 'string' ? JSON.parse(event.body || '{}') : event.body || {};
    const text = String(body.text || '').trim();

    if (/[\u3040-\u309F\u30A0-\u30FF]/.test(text)) {
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ detectedKey: 'ja', languageName: 'Japonés', flag: '🇯🇵', confidence: 'high' }),
      };
    }
    if (/[\u4E00-\u9FFF]/.test(text)) {
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ detectedKey: 'zh', languageName: 'Chino mandarín', flag: '🇨🇳', confidence: 'high' }),
      };
    }

    if (ai) {
      const detectPrompt = `Identifica el idioma del texto: "${text}".
Opciones: "es", "en", "pt", "it", "fr", "de", "zh", "ja", "ambiguous".
Responde ONLY JSON: {"detectedKey": "...", "confidence": "high"}`;

      const res = await ai.models.generateContent({
        model: 'gemini-3.5-flash',
        contents: detectPrompt,
        config: { responseMimeType: 'application/json', thinkingConfig: { thinkingBudget: 0 } },
      });
      return { statusCode: 200, headers, body: res.text || '{}' };
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ detectedKey: 'es', confidence: 'low', isAmbiguous: true }),
    };
  } catch (err: any) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: err?.message || 'Error' }),
    };
  }
};
