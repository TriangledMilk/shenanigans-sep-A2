export default async function handler(request, response) {
  // Vercel runs this function whenever the browser visits /api/silver-price.
  // Only allow GET requests because this endpoint only reads a price.
  if (request.method !== 'GET') {
    response.setHeader('Allow', 'GET');
    return response.status(405).json({ error: 'Method not allowed.' });
  }

  // This secret is stored in Vercel's environment variables, so it never
  // gets sent to or exposed in the browser.
  const apiKey = process.env.RAPIDAPI_KEY;
  if (!apiKey) {
    return response.status(500).json({ error: 'The RapidAPI key is not configured.' });
  }

  try {
    // The server function makes the RapidAPI request on the browser's behalf.
    // The browser only ever sees the response, not the API key.
    const upstreamResponse = await fetch(
      'https://metal-sentinel.p.rapidapi.com/silver-price?currency=CAD',
      {
        headers: {
          'x-rapidapi-key': apiKey,
          'x-rapidapi-host': 'metal-sentinel.p.rapidapi.com',
        },
      }
    );

    // Pass RapidAPI's JSON response and status code back to the frontend.
    const result = await upstreamResponse.json();
    return response.status(upstreamResponse.status).json(result);
  } catch (error) {
    // This handles network errors or other unexpected failures talking to RapidAPI.
    console.error('Silver price relay failed:', error);
    return response.status(502).json({ error: 'Unable to fetch the silver price.' });
  }
}