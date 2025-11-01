// CommonJS version (works on Vercel Node runtimes)
module.exports = async (req, res) => {
  // Allow only POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Bearer token
  const auth = req.headers.authorization || '';
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : '';
  if (!token || token !== process.env.PROXY_AUTH_TOKEN) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  // Read JSON body (handles ReqBin/Postman/browser)
  const readBody = async () => {
    if (req.body && typeof req.body === 'object') return req.body;
    if (typeof req.body === 'string') {
      try { return JSON.parse(req.body); } catch {}
    }
    const raw = await new Promise((resolve, reject) => {
      let data = '';
      req.on('data', c => (data += c));
      req.on('end', () => resolve(data));
      req.on('error', reject);
    });
    return raw ? JSON.parse(raw) : {};
  };

  let payload;
  try {
    payload = await readBody();
    if (!payload.model || !payload.messages) {
      return res.status(400).json({ error: 'Missing "model" or "messages"' });
    }
  } catch (e) {
    return res.status(400).json({ error: 'Bad JSON', details: String(e) });
  }

  // Forward to OpenAI
  try {
    const url = (process.env.OPENAI_BASE_URL || 'https://api.openai.com/v1') + '/chat/completions';
    const r = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': Bearer ${process.env.OPENAI_API_KEY},
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });
    const data = await r.json();
    return res.status(r.status).json(data);
  } catch (err) {
    return res.status(500).json({ error: 'Proxy error', details: String(err) });
  }
};
