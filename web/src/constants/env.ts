const raw = import.meta.env.VITE_API_BASE_URL?.trim();

/** Base da API: em dev vazio → prefixo `/api` (proxy Vite → Express :3333). Em prod, URL absoluta. */
export const API_PREFIX = raw && raw.length > 0 ? raw.replace(/\/$/, "") : "/api";
