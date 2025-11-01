// File: api/ask.js  (Vercel serverless function)
export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  const auth = req.headers.authorization || "";
  const token = auth.startsWith("Bearer ") ? auth.slice(7) : "";
  if (!token || token !== process.env.PROXY_AUTH_TOKEN) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  try {
    const body = req.body || {};
    const resp = await fetch(${process.env.OPENAI_BASE_URL || "https://api.openai.com/v1"}/chat/completions, {
      method: "POST",
      headers: {
        "Authorization": Bearer ${process.env.OPENAI_API_KEY},
        "Content-Type": "application/json"
      },
      body: JSON.stringify(body)
    });

    const data = await resp.json();
    res.status(resp.status).json(data);
  } catch (e) {
    res.status(500).json({ error: "Proxy error", details: String(e) });
  }
}