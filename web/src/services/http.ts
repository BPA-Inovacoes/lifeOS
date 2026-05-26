import { API_PREFIX } from "@/constants/env";
import { messageFromApiBody } from "@/services/apiMessages";
import { useAuthStore } from "@/store/authStore";

export type ApiErrorBody = {
  code?: string;
  message?: string;
  details?: Record<string, string[] | undefined>;
};

export class ApiError extends Error {
  status: number;
  body?: ApiErrorBody;

  constructor(status: number, message: string, body?: ApiErrorBody) {
    super(message);
    this.status = status;
    this.body = body;
  }
}

function buildUrl(path: string): string {
  const p = path.startsWith("/") ? path : `/${path}`;
  const base = API_PREFIX.replace(/\/$/, "");
  return `${base}${p}`;
}

export async function apiJson<T>(path: string, init?: RequestInit): Promise<T> {
  const url = buildUrl(path);
  const headers = new Headers(init?.headers);
  const token = useAuthStore.getState().token;
  if (token && !headers.has("Authorization")) {
    headers.set("Authorization", `Bearer ${token}`);
  }
  if (
    init?.body &&
    !(init.body instanceof FormData) &&
    !headers.has("Content-Type")
  ) {
    headers.set("Content-Type", "application/json");
  }

  const res = await fetch(url, { ...init, headers });
  const text = await res.text();
  let data: unknown = undefined;
  if (text) {
    try {
      data = JSON.parse(text) as unknown;
    } catch {
      data = { message: text };
    }
  }

  if (!res.ok) {
    const body =
      typeof data === "object" && data !== null
        ? (data as ApiErrorBody)
        : undefined;
    const msg = messageFromApiBody(res.status, body);
    throw new ApiError(res.status, msg, body);
  }

  return data as T;
}

export function flattenApiErrors(body?: ApiErrorBody): string {
  const d = body?.details;
  if (d) {
    const lines = Object.values(d)
      .flat()
      .filter((x): x is string => typeof x === "string");
    if (lines.length) return lines.join("\n");
  }
  return body?.message ?? "Pedido inválido.";
}
