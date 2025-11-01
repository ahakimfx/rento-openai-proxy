// ✅ Works in all Vercel Node runtimes
const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));

module.exports = async function (req, res) {
  try {
    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Method not allowed' });
    }

    // Authorization check
    const auth = req.headers.authorization || '';
    const token = auth.startsWith('Bearer ') ? auth.slice(7) : '';
    if (!token || token !== process.env.PROXY_AUTH_TOKEN) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Parse JSON body
    const body = typeof req.body === 'object' ? req.body : JSON.parse(req.body || '{}');
    if (!body.model || !body.messages) {
      return res.status(400).json({ error: 'Missing "model" or "messages"' });
    }

    // Forward request to OpenAI
    const url = (process.env.OPENAI_BASE_URL || 'https://api.openai.com/v1') + '/chat/completions';
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': Bearer ${process.env.OPENAI_API_KEY},
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    });

    const data = await response.json();
    res.status(response.status).json(data);
  } catch (error) {
    res.status(500).json({ error: 'Internal error', details: error.message });
  }
};
