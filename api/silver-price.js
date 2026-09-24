export default async function handler(request, response) {
  if (request.method !== 'GET') {
    response.setHeader('Allow', 'GET');
    return response.status(405).json({ error: 'Method not allowed.' });
  }

  const apiKey = process.env.RAPIDAPI_KEY;
  if (!apiKey) {
    return response.status(500).json({ error: 'The RapidAPI key is not configured.' });
  }

  try {
    const upstreamResponse = await fetch(
      'https://metal-sentinel.p.rapidapi.com/silver-price?currency=CAD',
      {
        headers: {
          'x-rapidapi-key': apiKey,
          'x-rapidapi-host': 'metal-sentinel.p.rapidapi.com',
        },
      }
    );

    const result = await upstreamResponse.json();
    return response.status(upstreamResponse.status).json(result);
  } catch (error) {
    console.error('Silver price relay failed:', error);
    return response.status(502).json({ error: 'Unable to fetch the silver price.' });
  }
}