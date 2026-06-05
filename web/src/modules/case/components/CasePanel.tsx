import { useEffect, useRef, useState } from "react";
import { Send, X } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { CASE_PROMPTS } from "@/modules/case/casePrompts";
import { CaseAssistantMessage } from "@/modules/case/components/CaseActionProposalCard";
import { CaseEphemeralNotice } from "@/modules/case/components/CaseEphemeralNotice";
import { CaseIcon } from "@/modules/case/components/CaseIcon";
import { CaseLlmConsent } from "@/modules/case/components/CaseLlmConsent";
import { CaseThinkingIndicator } from "@/modules/case/components/CaseThinkingIndicator";
import {
  caseChat,
  deleteCaseConversation,
  fetchCaseStatus,
  sendCaseMessage,
  setCaseLlmOptIn,
  streamCaseMessage,
  type CaseMessage,
  type CaseActionProposal,
} from "@/services/caseApi";
import { useCaseStore } from "@/store/caseStore";

import { useAppModeStore } from "@/store/appModeStore";
import { cn } from "@/lib/utils";

type CaseSendResult =
  | { message: CaseMessage; engine: string; conversationId: string; proposal?: CaseActionProposal }
  | { message: CaseMessage; engine: string; proposal?: CaseActionProposal };

type ProposalState = "pending" | "done" | "cancelled";

export function CasePanel() {
  const open = useCaseStore((s) => s.open);
  const setOpen = useCaseStore((s) => s.setOpen);
  const conversationId = useCaseStore((s) => s.conversationId);
  const setConversationId = useCaseStore((s) => s.setConversationId);
  const pendingPrompt = useCaseStore((s) => s.pendingPrompt);
  const pendingMode = useCaseStore((s) => s.pendingMode);
  const clearPendingPrompt = useCaseStore((s) => s.clearPendingPrompt);
  const activeMode = useAppModeStore((s) => s.activeMode) ?? "finance";

  const [messages, setMessages] = useState<CaseMessage[]>([]);
  const [proposalStates, setProposalStates] = useState<Record<string, ProposalState>>({});
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState(false);
  const [streamDraftId, setStreamDraftId] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const pendingHandledRef = useRef(false);
  const qc = useQueryClient();

  const { data: status } = useQuery({
    queryKey: ["case", "status"],
    queryFn: fetchCaseStatus,
    enabled: open,
  });

  const activateLlm = useMutation({
    mutationFn: () => setCaseLlmOptIn(true),
    onSuccess: (data) => {
      qc.setQueryData(["case", "status"], data);
    },
  });

  const send = useMutation<CaseSendResult, Error, string>({
    mutationFn: async (content: string) => {
      const userMsg: CaseMessage = {
        id: `local-${Date.now()}`,
        role: "user",
        content,
        createdAt: new Date().toISOString(),
      };
      setMessages((m) => [...m, userMsg]);

      const statusNow = qc.getQueryData<Awaited<ReturnType<typeof fetchCaseStatus>>>(["case", "status"]);
      const useStream = Boolean(statusNow?.llmEnabled && statusNow?.streaming?.enabled !== false);

      if (useStream) {
        const draftId = `stream-${Date.now()}`;
        setStreamDraftId(draftId);
        setStreaming(true);
        setMessages((m) => [
          ...m,
          {
            id: draftId,
            role: "assistant",
            content: "",
            createdAt: new Date().toISOString(),
          },
        ]);

        return new Promise<CaseSendResult>((resolve, reject) => {
          void streamCaseMessage(
            { content, mode: activeMode, conversationId },
            {
              onToken: (delta) => {
                setMessages((prev) =>
                  prev.map((msg) =>
                    msg.id === draftId ? { ...msg, content: msg.content + delta } : msg
                  )
                );
              },
              onDone: (data) => {
                setStreaming(false);
                setStreamDraftId(null);
                const msg: CaseMessage = { ...data.message, proposal: data.proposal };
                setMessages((prev) => prev.map((m) => (m.id === draftId ? msg : m)));
                resolve({
                  message: msg,
                  engine: data.engine,
                  proposal: data.proposal,
                  ...(data.conversationId ? { conversationId: data.conversationId } : {}),
                });
              },
              onError: (message) => {
                setStreaming(false);
                setStreamDraftId(null);
                reject(new Error(message));
              },
            }
          );
        });
      }

      if (conversationId) {
        return sendCaseMessage(conversationId, { content, mode: activeMode });
      }
      const res = await caseChat({ content, mode: activeMode });
      return res;
    },
    onSuccess: (data) => {
      const msg: CaseMessage = {
        ...data.message,
        proposal: data.proposal,
      };
      setMessages((m) => {
        const exists = m.some((x) => x.id === msg.id);
        if (exists) {
          return m.map((x) => (x.id === msg.id ? msg : x));
        }
        return [...m, msg];
      });
      if (data.proposal) {
        setProposalStates((s) => ({ ...s, [data.proposal!.id]: "pending" }));
      }
      if (!conversationId && "conversationId" in data) {
        setConversationId(data.conversationId);
      }
    },
  });

  useEffect(() => {
    if (open) bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, open, send.isPending, streaming]);

  useEffect(() => {
    if (!open) {
      pendingHandledRef.current = false;
      return;
    }
    if (!pendingPrompt || pendingHandledRef.current || send.isPending || streaming) return;
    pendingHandledRef.current = true;
    clearPendingPrompt();
    send.mutate(pendingPrompt);
  }, [
    open,
    pendingPrompt,
    pendingMode,
    send,
    streaming,
    clearPendingPrompt,
  ]);

  useEffect(() => {
    if (open) return;
    const id = conversationId;
    setMessages([]);
    setProposalStates({});
    setStreaming(false);
    setStreamDraftId(null);
    setConversationId(null);
    if (id) {
      deleteCaseConversation(id).catch(() => {});
    }
  }, [open, conversationId, setConversationId]);

  if (!open) return null;

  const prompts = CASE_PROMPTS[activeMode] ?? CASE_PROMPTS.finance;
  const showActivateIa = Boolean(status?.llmAvailable && !status.llmOptIn);

  const submit = () => {
    const text = input.trim();
    if (!text || send.isPending) return;
    setInput("");
    send.mutate(text);
  };

  return (
    <div
      className="fixed bottom-20 right-5 z-50 flex h-[min(32rem,70vh)] w-[min(24rem,calc(100vw-2.5rem))] flex-col border border-border bg-background/95 shadow-2xl backdrop-blur-md"
      role="dialog"
      aria-label="Case assistente"
    >
      <header className="flex items-center justify-between gap-2 border-b border-border px-4 py-3">
        <div className="flex items-center gap-2.5">
          <CaseIcon size="chat" motion={send.isPending ? "thinking" : "active"} />
          <div>
            <p className="font-mono text-xs uppercase tracking-wider text-muted-foreground">Case</p>
            <p className="text-sm font-medium text-foreground">Coach LifeOS</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {showActivateIa ? (
            <button
              type="button"
              className="flex items-center gap-1.5 border border-lime-500/40 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-lime-950 hover:bg-lime-500/10 dark:text-lime-200"
              disabled={activateLlm.isPending}
              onClick={() => activateLlm.mutate()}
            >
              <CaseIcon size="sm" motion="thinking" />
              Activar IA
            </button>
          ) : null}
          <span className="font-mono text-[10px] uppercase text-muted-foreground">
            {send.isPending
              ? status?.llmEnabled
                ? "a pensar"
                : "a processar"
              : status?.engine === "llm"
                ? status.provider === "groq"
                  ? "Groq"
                  : "IA"
                : "local"}
          </span>
          <button
            type="button"
            className="p-1 text-muted-foreground hover:text-foreground"
            aria-label="Fechar"
            onClick={() => setOpen(false)}
          >
            <X className="size-4" />
          </button>
        </div>
      </header>

      <CaseEphemeralNotice message={status?.privacy.conversationsNotice} />

      <div className="flex-1 space-y-3 overflow-y-auto px-4 py-3">
        {status?.legacyServer ? (
          <LegacyServerNotice />
        ) : status ? (
          <CaseLlmConsent status={status} />
        ) : null}
        {messages.length === 0 ? (
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Pergunta com os teus dados reais — finanças, foco ou Game. Sem inventar números.
            </p>
            <div className="flex flex-wrap gap-2">
              {prompts.map((p) => (
                <button
                  key={p.label}
                  type="button"
                  className="border border-border px-2 py-1 text-xs text-foreground hover:bg-muted/50"
                  onClick={() => send.mutate(p.content)}
                  disabled={send.isPending}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>
        ) : null}

        {send.isPending && !streaming ? <CaseThinkingIndicator status={status} /> : null}

        {messages.map((m) => (
          <div
            key={m.id}
            className={cn(
              "max-w-[90%] rounded px-3 py-2 text-sm",
              m.role === "user"
                ? "ml-auto bg-muted text-foreground"
                : "bg-amber-500/10 text-foreground dark:bg-amber-950/40",
              m.id === streamDraftId && "animate-pulse"
            )}
          >
            {m.role === "assistant" ? (
              m.content ? (
                <CaseAssistantMessage
                content={m.content}
                proposal={m.proposal}
                proposalResolved={(() => {
                  if (!m.proposal) return undefined;
                  const state = proposalStates[m.proposal.id];
                  return state === "done" || state === "cancelled" ? state : undefined;
                })()}
                onProposalDone={(result) => {
                  if (m.proposal) {
                    setProposalStates((s) => ({ ...s, [m.proposal!.id]: "done" }));
                  }
                  setMessages((prev) => [
                    ...prev,
                    {
                      id: result.id,
                      role: "assistant",
                      content: result.content,
                      source: "action",
                      createdAt: new Date().toISOString(),
                    },
                  ]);
                }}
                onProposalCancel={() => {
                  if (m.proposal) {
                    setProposalStates((s) => ({ ...s, [m.proposal!.id]: "cancelled" }));
                  }
                }}
                onProposalUpdate={(updated) => {
                  setMessages((prev) =>
                    prev.map((msg) =>
                      msg.id === m.id && msg.proposal?.id === updated.id
                        ? { ...msg, proposal: updated }
                        : msg
                    )
                  );
                }}
              />
              ) : (
                <CaseThinkingIndicator status={status} className="max-w-none bg-transparent p-0 dark:bg-transparent" />
              )
            ) : (
              <p className="whitespace-pre-wrap">{m.content}</p>
            )}
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      <footer className="border-t border-border p-3">
        <div className="flex gap-2">
          <input
            className="min-w-0 flex-1 border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-amber-500/50"
            placeholder="Pergunta ao Case…"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                submit();
              }
            }}
            disabled={send.isPending || streaming}
          />
          <button
            type="button"
            className="flex size-10 shrink-0 items-center justify-center border border-border text-foreground hover:bg-muted/50 disabled:opacity-50"
            aria-label="Enviar"
            disabled={send.isPending || streaming || !input.trim()}
            onClick={submit}
          >
            {send.isPending || streaming ? (
              <span className="size-4 animate-pulse rounded-full border-2 border-current border-t-transparent" />
            ) : (
              <Send className="size-4" />
            )}
          </button>
        </div>
      </footer>
    </div>
  );
}

function LegacyServerNotice() {
  return (
    <div className="border border-amber-500/40 bg-amber-500/10 px-3 py-3 text-xs text-foreground">
      <p className="font-medium">Servidor desactualizado</p>
      <p className="mt-1 text-muted-foreground">
        O API ainda não expõe a opção Groq. No terminal do servidor:
      </p>
      <p className="mt-2 font-mono text-[11px] text-muted-foreground">npm run build</p>
      <p className="font-mono text-[11px] text-muted-foreground">npm start</p>
    </div>
  );
}
