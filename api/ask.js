// Vercel serverless function: POST /api/ask
export default async function handler(req, res) {
  // Only allow POST
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  // Simple bearer token check
  const authHeader = req.headers.authorization || "";
  const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : "";
  if (!token || token !== process.env.PROXY_AUTH_TOKEN) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  // Forward the incoming JSON body to OpenAI Chat Completions API
  try {
    const payload = req.body || {};

    const resp = await fetch(
      ${process.env.OPENAI_BASE_URL || "https://api.openai.com/v1"}/chat/completions,
      {
        method: "POST",
        headers: {
          "Authorization": Bearer ${process.env.OPENAI_API_KEY},
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      }
    );

    const data = await resp.json();
    res.status(resp.status).json(data);
  } catch (err) {
    res.status(500).json({ error: "Proxy error", details: String(err) });
  }
}
