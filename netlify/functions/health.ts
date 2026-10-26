export const handler = async (event: any) => {
  const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
  };

  return {
    statusCode: 200,
    headers,
    body: JSON.stringify({
      status: 'ok',
      hasApiKey: Boolean(process.env.GEMINI_API_KEY),
      timestamp: Date.now(),
      platform: 'netlify-functions',
    }),
  };
};
