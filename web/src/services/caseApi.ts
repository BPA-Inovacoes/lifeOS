import { API_PREFIX } from "@/constants/env";
import { apiJson } from "@/services/http";
import { useAuthStore } from "@/store/authStore";

export type CaseAppMode = "focus" | "game" | "finance";
export type CaseActionFormField = {
  key: string;
  label: string;
  type: "text" | "select" | "number";
  value: string;
  required: boolean;
  readOnly?: boolean;
  options?: { value: string; label: string }[];
};

export type CaseActionProposal = {
  id: string;
  tool: string;
  phase: "form" | "summary";
  preview: {
    title: string;
    fields: { label: string; value: string }[];
  };
  form?: CaseActionFormField[];
  expiresAt: string;
};

export type CaseMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
  source?: string;
  createdAt: string;
  proposal?: CaseActionProposal;
};

export type CaseConversationSummary = {
  id: string;
  mode: string;
  title: string | null;
  updatedAt: string;
  lastMessage: { role: string; content: string; createdAt: string } | null;
};

const CASE_PRIVACY_DEFAULT = {
  externalLlmRequiresOptIn: true,
  contextSent:
    "Agregados financeiros (sem nomes de contas), contagens de tarefas/hábitos, progresso Game — nunca email nem notas de movimentos.",
  userMessageWarning:
    "O texto que escreveres na conversa também é enviado ao provider — evita dados sensíveis.",
  conversationsStored: false,
  conversationsNotice:
    "As conversas não são guardadas. Ao fechar o Case, o histórico desta sessão desaparece.",
} as const;

export type CaseStatus = {
  llmAvailable: boolean;
  llmOptIn: boolean;
  llmEnabled: boolean;
  engine: "llm" | "local";
  provider: "openai" | "groq" | "custom" | null;
  modes: CaseAppMode[];
  actions?: {
    enabled: boolean;
    llmToolCalling?: boolean;
  };
  streaming?: { enabled: boolean };
  insights?: { enabled: boolean };
  privacy: {
    externalLlmRequiresOptIn: boolean;
    contextSent: string;
    userMessageWarning: string;
    conversationsStored: boolean;
    conversationsNotice: string;
  };
  /** API antiga em execução — falta rebuild/restart do servidor. */
  legacyServer?: boolean;
};

function normalizeCaseStatus(raw: Record<string, unknown>): CaseStatus {
  if ("llmAvailable" in raw) {
    return raw as CaseStatus;
  }
  return {
    llmAvailable: false,
    llmOptIn: false,
    llmEnabled: raw.llmEnabled === true,
    engine: raw.engine === "llm" ? "llm" : "local",
    provider: null,
    modes: (Array.isArray(raw.modes) ? raw.modes : ["focus", "game", "finance"]) as CaseAppMode[],
    privacy: CASE_PRIVACY_DEFAULT,
    legacyServer: true,
  };
}

export type CaseInsightItem = {
  id: string;
  priority: "high" | "medium" | "low";
  text: string;
  prompt: string;
  mode: CaseAppMode;
};

export type CaseInsightsResponse = {
  generatedAt: string;
  mode: CaseAppMode;
  items: CaseInsightItem[];
};

function buildUrl(path: string): string {
  const p = path.startsWith("/") ? path : `/${path}`;
  const base = API_PREFIX.replace(/\/$/, "");
  return `${base}${p}`;
}

function authHeaders(extra?: HeadersInit): Headers {
  const headers = new Headers(extra);
  const token = useAuthStore.getState().token;
  if (token && !headers.has("Authorization")) {
    headers.set("Authorization", `Bearer ${token}`);
  }
  return headers;
}

export function fetchCaseInsights(mode: CaseAppMode = "focus") {
  return apiJson<CaseInsightsResponse>(`/case/insights?mode=${encodeURIComponent(mode)}`);
}

export type CaseStreamDone = {
  message: CaseMessage;
  engine: string;
  proposal?: CaseActionProposal;
  conversationId?: string;
};

export async function streamCaseMessage(
  opts: {
    content: string;
    mode?: CaseAppMode;
    conversationId?: string | null;
  },
  handlers: {
    onToken: (delta: string) => void;
    onDone: (data: CaseStreamDone) => void;
    onError: (message: string) => void;
  }
): Promise<void> {
  const path = opts.conversationId
    ? `/case/conversations/${encodeURIComponent(opts.conversationId)}/messages/stream`
    : "/case/chat/stream";

  const headers = authHeaders({ "Content-Type": "application/json" });
  const res = await fetch(buildUrl(path), {
    method: "POST",
    headers,
    body: JSON.stringify({ content: opts.content, mode: opts.mode }),
  });

  if (!res.ok) {
    const text = await res.text();
    let body: { message?: string } = {};
    try {
      body = JSON.parse(text) as { message?: string };
    } catch {
      body = { message: text };
    }
    handlers.onError(body.message ?? "Erro ao contactar o Case.");
    return;
  }

  const reader = res.body?.getReader();
  if (!reader) {
    handlers.onError("Stream indisponível.");
    return;
  }

  const decoder = new TextDecoder();
  let buffer = "";
  let eventName = "message";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const chunks = buffer.split("\n\n");
    buffer = chunks.pop() ?? "";

    for (const chunk of chunks) {
      const lines = chunk.split("\n");
      eventName = "message";
      let dataLine = "";
      for (const line of lines) {
        if (line.startsWith("event:")) eventName = line.slice(6).trim();
        if (line.startsWith("data:")) dataLine = line.slice(5).trim();
      }
      if (!dataLine) continue;
      try {
        const data = JSON.parse(dataLine) as Record<string, unknown>;
        if (eventName === "token" && typeof data.delta === "string") {
          handlers.onToken(data.delta);
        } else if (eventName === "done") {
          handlers.onDone(data as unknown as CaseStreamDone);
        } else if (eventName === "error") {
          handlers.onError(String(data.message ?? "Erro no stream."));
        }
      } catch {
        /* ignore */
      }
    }
  }
}

export function fetchCaseStatus() {
  return apiJson<Record<string, unknown>>("/case/status").then(normalizeCaseStatus);
}

export function setCaseLlmOptIn(optIn: boolean) {
  return apiJson<CaseStatus>("/case/settings/llm-opt-in", {
    method: "PATCH",
    body: JSON.stringify({ optIn }),
  });
}

export function caseChat(body: { content: string; mode?: CaseAppMode }) {
  return apiJson<{
    message: CaseMessage;
    engine: string;
    conversationId: string;
    proposal?: CaseActionProposal;
  }>("/case/chat", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export function sendCaseMessage(
  conversationId: string,
  body: { content: string; mode?: CaseAppMode }
) {
  return apiJson<{ message: CaseMessage; engine: string; proposal?: CaseActionProposal }>(
    `/case/conversations/${encodeURIComponent(conversationId)}/messages`,
    {
      method: "POST",
      body: JSON.stringify(body),
    }
  );
}

export function confirmCaseAction(proposalId: string) {
  return apiJson<{ message: CaseMessage }>(
    `/case/actions/${encodeURIComponent(proposalId)}/confirm`,
    { method: "POST" }
  );
}

export function cancelCaseAction(proposalId: string) {
  return apiJson<{ ok: boolean }>(
    `/case/actions/${encodeURIComponent(proposalId)}/cancel`,
    { method: "POST" }
  );
}

export function updateCaseAction(
  proposalId: string,
  body: {
    fields: Record<string, string>;
    advanceToSummary?: boolean;
    backToForm?: boolean;
  }
) {
  return apiJson<{ proposal: CaseActionProposal }>(
    `/case/actions/${encodeURIComponent(proposalId)}`,
    {
      method: "PATCH",
      body: JSON.stringify(body),
    }
  );
}

export function deleteCaseConversation(conversationId: string) {
  return apiJson<{ ok: boolean }>(
    `/case/conversations/${encodeURIComponent(conversationId)}`,
    { method: "DELETE" }
  );
}

export function fetchCaseConversation(conversationId: string) {
  return apiJson<{
    conversation: {
      id: string;
      mode: string;
      title: string | null;
      messages: CaseMessage[];
    };
  }>(`/case/conversations/${encodeURIComponent(conversationId)}`);
}
