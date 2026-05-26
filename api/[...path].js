const HOP_BY_HOP_HEADERS = new Set([
  "host",
  "connection",
  "content-length",
  "transfer-encoding",
  "x-forwarded-host",
]);

function json(res, status, body) {
  res.statusCode = status;
  res.setHeader("content-type", "application/json; charset=utf-8");
  res.end(JSON.stringify(body));
}

async function readBody(req) {
  const chunks = [];
  for await (const chunk of req) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  }
  if (chunks.length === 0) return undefined;
  return Buffer.concat(chunks);
}

function buildTargetUrl(reqUrl, baseUrl) {
  const incoming = new URL(reqUrl || "/", "http://localhost");
  const cleanBase = baseUrl.replace(/\/$/, "");
  const path = incoming.pathname.replace(/^\/api/, "") || "/";
  return `${cleanBase}${path}${incoming.search}`;
}

export default async function handler(req, res) {
  const baseUrl = process.env.API_BASE_URL || process.env.VITE_API_BASE_URL;

  if (!baseUrl) {
    return json(res, 500, {
      code: "API_BASE_URL_MISSING",
      message:
        "Falta configurar API_BASE_URL (ou VITE_API_BASE_URL) na Vercel para o proxy /api.",
    });
  }

  try {
    const targetUrl = buildTargetUrl(req.url, baseUrl);
    const headers = new Headers();

    for (const [key, value] of Object.entries(req.headers)) {
      if (!value || HOP_BY_HOP_HEADERS.has(key.toLowerCase())) continue;
      headers.set(key, Array.isArray(value) ? value.join(", ") : value);
    }

    const method = req.method || "GET";
    const body =
      method === "GET" || method === "HEAD" ? undefined : await readBody(req);

    const upstream = await fetch(targetUrl, {
      method,
      headers,
      body,
      redirect: "manual",
    });

    res.statusCode = upstream.status;
    upstream.headers.forEach((value, key) => {
      if (HOP_BY_HOP_HEADERS.has(key.toLowerCase())) return;
      res.setHeader(key, value);
    });

    const buffer = Buffer.from(await upstream.arrayBuffer());
    res.end(buffer);
  } catch (error) {
    return json(res, 502, {
      code: "API_PROXY_ERROR",
      message: "Não foi possível encaminhar o pedido para a API.",
      details: error instanceof Error ? error.message : "Erro desconhecido",
    });
  }
}
