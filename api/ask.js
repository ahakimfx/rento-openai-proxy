// Vercel serverless function: POST /api/ask
async function readJsonBody(req) {
  // Collect raw body (works with ReqBin/Postman/browsers)
  const raw = await new Promise((resolve, reject) => {
    let data = "";
    req.on("data", chunk => (data += chunk));
    req.on("end", () => resolve(data));
    req.on("error", reject);
  });
  return raw ? JSON.parse(raw) : {};
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  // Bearer token check
  const auth = req.headers.authorization || "";
  const token = auth.startsWith("Bearer ") ? auth.slice(7) : "";
  if (!token || token !== process.env.PROXY_AUTH_TOKEN) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  try {
    const payload = await readJsonBody(req);

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
  } catch (e) {
    res.status(500).json({ error: "Proxy error", details: String(e) });
  }
}
