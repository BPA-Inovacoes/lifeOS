import { env } from "../utils/env";
import { resolveCaseLlmEndpoint } from "./case-llm-config";
import { sanitizeCaseContextForLlm } from "./case-llm-sanitize";
import { buildCaseSystemPrompt } from "./case-prompt";
import { buildActionFromLlmTool, caseToolAllowedInMode } from "./case-llm-tool-bridge";
import type { DetectedCaseAction } from "./case-action-intent";
import { CASE_LLM_TOOL_DEFINITIONS } from "./case-llm-tools";
import type { CaseAppMode, CaseContextSnapshot } from "./case-types";

export function caseLlmConfigured(): boolean {
  return Boolean(env.CASE_LLM_API_KEY?.trim());
}

type ChatMessage = { role: "system" | "user" | "assistant"; content: string };

export type CaseLlmToolResult = {
  content: string;
  action: DetectedCaseAction | null;
};

function buildMessages(
  ctx: CaseContextSnapshot,
  history: { role: string; content: string }[],
  userMessage: string,
  withTools: boolean
): ChatMessage[] {
  const llmCtx = sanitizeCaseContextForLlm(ctx);
  const system = withTools
    ? `${buildCaseSystemPrompt(llmCtx, ctx.generatedAt)}\n\nQuando o utilizador pedir para criar conta, movimento, meta ou hábito, usa as tools disponíveis em vez de inventar que já foi feito. Responde em texto curto E chama a tool adequada. Nunca executes acções sem tool + confirmação do utilizador.`
    : buildCaseSystemPrompt(llmCtx, ctx.generatedAt);

  return [
    { role: "system", content: system },
    ...history
      .filter((m) => m.role === "user" || m.role === "assistant")
      .slice(-12)
      .map((m) => ({
        role: m.role as "user" | "assistant",
        content: m.content,
      })),
    { role: "user", content: userMessage },
  ];
}

async function llmFetch(body: Record<string, unknown>) {
  const key = env.CASE_LLM_API_KEY?.trim();
  if (!key) throw new Error("CASE_LLM_NOT_CONFIGURED");

  const { baseUrl, model } = resolveCaseLlmEndpoint();
  const res = await fetch(`${baseUrl}/chat/completions`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ model, ...body }),
  });

  if (!res.ok) {
    const errText = await res.text().catch(() => "");
    throw new Error(`CASE_LLM_ERROR:${res.status}:${errText.slice(0, 200)}`);
  }
  return res;
}

export async function caseLlmReply(
  ctx: CaseContextSnapshot,
  history: { role: string; content: string }[],
  userMessage: string
): Promise<string> {
  const res = await llmFetch({
    messages: buildMessages(ctx, history, userMessage, false),
    temperature: 0.4,
    max_tokens: 600,
  });

  const json = (await res.json()) as {
    choices?: { message?: { content?: string } }[];
  };
  const content = json.choices?.[0]?.message?.content?.trim();
  if (!content) throw new Error("CASE_LLM_EMPTY");
  return content;
}

export async function caseLlmReplyWithTools(
  ctx: CaseContextSnapshot,
  history: { role: string; content: string }[],
  userMessage: string,
  mode: CaseAppMode
): Promise<CaseLlmToolResult> {
  const res = await llmFetch({
    messages: buildMessages(ctx, history, userMessage, true),
    tools: CASE_LLM_TOOL_DEFINITIONS,
    tool_choice: "auto",
    temperature: 0.3,
    max_tokens: 600,
  });

  const json = (await res.json()) as {
    choices?: {
      message?: {
        content?: string | null;
        tool_calls?: { id: string; function: { name: string; arguments: string } }[];
      };
    }[];
  };

  const message = json.choices?.[0]?.message;
  const text = message?.content?.trim() ?? "";
  const toolCall = message?.tool_calls?.[0];

  if (toolCall?.function?.name) {
    const action = buildActionFromLlmTool(
      toolCall.function.name,
      toolCall.function.arguments ?? "{}",
      ctx,
      mode
    );
    if (action && caseToolAllowedInMode(action.tool, mode)) {
      return {
        content: text || action.assistantHint,
        action,
      };
    }
  }

  if (!text) throw new Error("CASE_LLM_EMPTY");
  return { content: text, action: null };
}

/** Stream de tokens OpenAI-compatible (sem tools). */
export async function* caseLlmReplyStream(
  ctx: CaseContextSnapshot,
  history: { role: string; content: string }[],
  userMessage: string
): AsyncGenerator<string> {
  const res = await llmFetch({
    messages: buildMessages(ctx, history, userMessage, false),
    temperature: 0.4,
    max_tokens: 600,
    stream: true,
  });

  const reader = res.body?.getReader();
  if (!reader) throw new Error("CASE_LLM_STREAM_NO_BODY");

  const decoder = new TextDecoder();
  let buffer = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split("\n");
    buffer = lines.pop() ?? "";

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed.startsWith("data:")) continue;
      const payload = trimmed.slice(5).trim();
      if (payload === "[DONE]") return;
      try {
        const json = JSON.parse(payload) as {
          choices?: { delta?: { content?: string } }[];
        };
        const delta = json.choices?.[0]?.delta?.content;
        if (delta) yield delta;
      } catch {
        /* chunk parcial */
      }
    }
  }
}
