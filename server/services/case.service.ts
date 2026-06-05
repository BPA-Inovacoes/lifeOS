import type { PrismaClient } from "@prisma/client";
import { z } from "zod";

import { buildCaseContext, financeSnapshotFromContext } from "../case/case-context";
import { detectCaseActionIntent, type DetectedCaseAction } from "../case/case-action-intent";
import { createCaseActionProposal, deleteCaseActionProposal, getCaseActionProposal, updateCaseActionProposal } from "../case/case-action-store";
import {
  applyFormValues,
  formTitleForTool,
  refreshMovementFormCategories,
  rebuildProposalFromForm,
} from "../case/case-action-form";
import { executeCaseAction } from "../case/case-action-tools";
import type { CaseActionProposalPublic } from "../case/case-action-types";
import { caseFallbackReply } from "../case/case-fallback";
import { caseLlmProvider } from "../case/case-llm-config";
import { buildCaseInsights } from "../case/case-insights";
import { caseLlmConfigured, caseLlmReply, caseLlmReplyStream, caseLlmReplyWithTools } from "../case/case-llm";
import type { CaseAppMode } from "../case/case-types";
import { AppError } from "../middlewares/error.middleware";
import type { DashboardService } from "./dashboard.service";
import type { DatabaseService } from "./database.service";
import type { FinanceService } from "./finance.service";

const CASE_MODES = ["focus", "game", "finance"] as const;

const createConversationSchema = z.object({
  mode: z.enum(CASE_MODES).optional(),
  title: z.string().max(80).optional(),
});

const sendMessageSchema = z.object({
  content: z.string().min(1).max(4000),
  mode: z.enum(CASE_MODES).optional(),
});

const llmOptInSchema = z.object({
  optIn: z.boolean(),
});

const updateActionSchema = z.object({
  fields: z.record(z.string(), z.string()),
  advanceToSummary: z.boolean().optional(),
  backToForm: z.boolean().optional(),
});

const HOURLY_MESSAGE_LIMIT = 40;

export type CaseStreamEvent =
  | { type: "token"; data: { delta: string } }
  | {
      type: "done";
      data: {
        message: {
          id: string;
          role: "assistant";
          content: string;
          source: string;
          createdAt: string;
        };
        engine: string;
        proposal?: CaseActionProposalPublic;
        conversationId?: string;
      };
    }
  | { type: "error"; data: { message: string } };

export class CaseService {
  constructor(
    private prisma: PrismaClient,
    private finance: FinanceService,
    private dashboard: DashboardService,
    private database: DatabaseService
  ) {}

  parseCreateConversation(body: unknown) {
    return createConversationSchema.parse(body);
  }

  parseSendMessage(body: unknown) {
    return sendMessageSchema.parse(body);
  }

  parseLlmOptIn(body: unknown) {
    return llmOptInSchema.parse(body);
  }

  parseUpdateAction(body: unknown) {
    return updateActionSchema.parse(body);
  }

  private async userLlmOptIn(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { caseLlmOptIn: true },
    });
    return user?.caseLlmOptIn ?? false;
  }

  private async canUseLlm(userId: string) {
    return caseLlmConfigured() && (await this.userLlmOptIn(userId));
  }

  async status(userId: string) {
    const llmAvailable = caseLlmConfigured();
    const llmOptIn = await this.userLlmOptIn(userId);
    const useLlm = llmAvailable && llmOptIn;
    return {
      llmAvailable,
      llmOptIn,
      llmEnabled: useLlm,
      engine: useLlm ? "llm" : "local",
      provider: llmAvailable ? caseLlmProvider() : null,
      modes: CASE_MODES,
      actions: {
        enabled: true,
        tools: [
          "finance.create_account",
          "finance.create_movement",
          "finance.create_goal",
          "focus.create_habit",
          "focus.complete_habit",
        ],
        requiresConfirmation: true,
        llmToolCalling: true,
      },
      streaming: {
        enabled: true,
        sseRoutes: ["/case/chat/stream", "/case/conversations/:id/messages/stream"],
      },
      insights: {
        enabled: true,
        route: "/case/insights",
      },
      privacy: {
        externalLlmRequiresOptIn: true,
        contextSent:
          "Agregados financeiros (sem nomes de contas), contagens de tarefas/hábitos, progresso Game — nunca email nem notas de movimentos.",
        userMessageWarning:
          "O texto que escreveres na conversa também é enviado ao provider — evita dados sensíveis.",
        conversationsStored: false,
        conversationsNotice:
          "As conversas não são guardadas. Ao fechar o Case, o histórico desta sessão desaparece.",
      },
    };
  }

  async deleteConversation(userId: string, conversationId: string) {
    const conv = await this.prisma.caseConversation.findFirst({
      where: { id: conversationId, userId },
      select: { id: true },
    });
    if (!conv) {
      throw new AppError(404, { code: "NOT_FOUND", message: "Conversa não encontrada." });
    }
    await this.prisma.caseConversation.delete({ where: { id: conversationId } });
    return { ok: true };
  }

  async confirmAction(userId: string, proposalId: string) {
    const proposal = getCaseActionProposal(userId, proposalId);
    if (!proposal) {
      throw new AppError(404, {
        code: "NOT_FOUND",
        message: "Proposta expirada ou inválida.",
      });
    }
    if (proposal.phase !== "summary") {
      throw new AppError(400, {
        code: "VALIDATION_ERROR",
        message: "Completa o formulário e revê o resumo antes de confirmar.",
      });
    }

    const content = await executeCaseAction(
      {
        prisma: this.prisma,
        finance: this.finance,
        database: this.database,
      },
      userId,
      proposal.tool,
      proposal.payload
    );
    deleteCaseActionProposal(proposalId);

    return {
      message: {
        id: `action-${Date.now()}`,
        role: "assistant" as const,
        content,
        source: "action",
        createdAt: new Date().toISOString(),
      },
    };
  }

  cancelAction(userId: string, proposalId: string) {
    const proposal = getCaseActionProposal(userId, proposalId);
    if (!proposal) {
      throw new AppError(404, {
        code: "NOT_FOUND",
        message: "Proposta expirada ou inválida.",
      });
    }
    deleteCaseActionProposal(proposalId);
    return { ok: true };
  }

  updateAction(userId: string, proposalId: string, input: z.infer<typeof updateActionSchema>) {
    const proposal = getCaseActionProposal(userId, proposalId);
    if (!proposal) {
      throw new AppError(404, {
        code: "NOT_FOUND",
        message: "Proposta expirada ou inválida.",
      });
    }

    if (input.backToForm && proposal.form) {
      const updated = updateCaseActionProposal(userId, proposalId, {
        phase: "form",
        preview: {
          title: formTitleForTool(proposal.tool),
          fields: [],
        },
      });
      if (!updated) {
        throw new AppError(404, {
          code: "NOT_FOUND",
          message: "Proposta expirada ou inválida.",
        });
      }
      return { proposal: updated };
    }

    if (!proposal.form) {
      throw new AppError(400, {
        code: "VALIDATION_ERROR",
        message: "Esta proposta não tem formulário.",
      });
    }

    let form = applyFormValues(proposal.form, input.fields);
    if (proposal.tool === "finance.create_movement") {
      form = refreshMovementFormCategories(proposal.financeSnapshot, form);
    }

    if (!input.advanceToSummary) {
      const updated = updateCaseActionProposal(userId, proposalId, { form });
      if (!updated) {
        throw new AppError(404, {
          code: "NOT_FOUND",
          message: "Proposta expirada ou inválida.",
        });
      }
      return { proposal: updated };
    }

    try {
      const { payload, preview } = rebuildProposalFromForm(
        proposal.tool,
        proposal.focusSnapshot,
        proposal.financeSnapshot,
        proposal.currency,
        form
      );
      const updated = updateCaseActionProposal(userId, proposalId, {
        phase: "summary",
        form,
        payload,
        preview,
      });
      if (!updated) {
        throw new AppError(404, {
          code: "NOT_FOUND",
          message: "Proposta expirada ou inválida.",
        });
      }
      return { proposal: updated };
    } catch (e) {
      const message = e instanceof Error ? e.message : "Campos inválidos.";
      throw new AppError(400, { code: "VALIDATION_ERROR", message });
    }
  }

  async insights(userId: string, mode: CaseAppMode = "focus") {
    const ctx = await buildCaseContext(
      this.prisma,
      userId,
      mode,
      this.finance,
      this.dashboard
    );
    return {
      generatedAt: ctx.generatedAt,
      mode,
      items: buildCaseInsights(ctx),
    };
  }

  private buildActionProposal(
    userId: string,
    ctx: Awaited<ReturnType<typeof buildCaseContext>>,
    mode: CaseAppMode,
    message: string
  ): { reply: string; proposal: CaseActionProposalPublic } | null {
    const intent = detectCaseActionIntent(message, ctx, mode);
    if (!intent) return null;
    const proposal = createCaseActionProposal({
      userId,
      tool: intent.tool,
      mode,
      phase: intent.phase,
      preview: intent.preview,
      form: intent.form,
      payload: intent.payload,
      currency: ctx.finance.currency,
      focusSnapshot: ctx.focus,
      financeSnapshot: financeSnapshotFromContext(ctx.finance),
    });
    return { reply: intent.assistantHint, proposal };
  }

  private proposalFromDetected(
    userId: string,
    ctx: Awaited<ReturnType<typeof buildCaseContext>>,
    mode: CaseAppMode,
    detected: DetectedCaseAction
  ): { reply: string; proposal: CaseActionProposalPublic } {
    const proposal = createCaseActionProposal({
      userId,
      tool: detected.tool,
      mode,
      phase: detected.phase,
      preview: detected.preview,
      form: detected.form,
      payload: detected.payload,
      currency: ctx.finance.currency,
      focusSnapshot: ctx.focus,
      financeSnapshot: financeSnapshotFromContext(ctx.finance),
    });
    return { reply: detected.assistantHint, proposal };
  }

  private async resolveAssistantReply(
    userId: string,
    ctx: Awaited<ReturnType<typeof buildCaseContext>>,
    mode: CaseAppMode,
    message: string,
    history: { role: string; content: string }[]
  ): Promise<{ reply: string; source: "llm" | "local" | "action"; proposal?: CaseActionProposalPublic }> {
    const local = this.buildActionProposal(userId, ctx, mode, message);
    if (local) {
      return { reply: local.reply, source: "action", proposal: local.proposal };
    }

    if (await this.canUseLlm(userId)) {
      try {
        const llm = await caseLlmReplyWithTools(ctx, history, message, mode);
        if (llm.action) {
          const built = this.proposalFromDetected(userId, ctx, mode, llm.action);
          return {
            reply: llm.content || built.reply,
            source: "action",
            proposal: built.proposal,
          };
        }
        return { reply: llm.content, source: "llm" };
      } catch {
        try {
          const reply = await caseLlmReply(ctx, history, message);
          return { reply, source: "llm" };
        } catch {
          return { reply: caseFallbackReply(message, ctx), source: "local" };
        }
      }
    }

    return { reply: caseFallbackReply(message, ctx), source: "local" };
  }

  async setLlmOptIn(userId: string, optIn: boolean) {
    await this.prisma.user.update({
      where: { id: userId },
      data: { caseLlmOptIn: optIn },
    });
    return this.status(userId);
  }

  private async assertRateLimit(userId: string) {
    const since = new Date(Date.now() - 60 * 60 * 1000);
    const count = await this.prisma.caseMessage.count({
      where: {
        conversation: { userId },
        role: "user",
        createdAt: { gte: since },
      },
    });
    if (count >= HOURLY_MESSAGE_LIMIT) {
      throw new AppError(429, {
        code: "RATE_LIMIT",
        message: "Limite de mensagens Case atingido — tenta daqui a uma hora.",
      });
    }
  }

  async listConversations(userId: string, limit = 20) {
    const rows = await this.prisma.caseConversation.findMany({
      where: { userId },
      orderBy: { updatedAt: "desc" },
      take: Math.min(limit, 50),
      include: {
        messages: {
          orderBy: { createdAt: "desc" },
          take: 1,
        },
      },
    });
    return rows.map((c) => ({
      id: c.id,
      mode: c.mode,
      title: c.title,
      updatedAt: c.updatedAt.toISOString(),
      lastMessage: c.messages[0]
        ? {
            role: c.messages[0].role,
            content: c.messages[0].content.slice(0, 120),
            createdAt: c.messages[0].createdAt.toISOString(),
          }
        : null,
    }));
  }

  async getConversation(userId: string, conversationId: string) {
    const conv = await this.prisma.caseConversation.findFirst({
      where: { id: conversationId, userId },
      include: { messages: { orderBy: { createdAt: "asc" } } },
    });
    if (!conv) {
      throw new AppError(404, { code: "NOT_FOUND", message: "Conversa não encontrada." });
    }
    return {
      id: conv.id,
      mode: conv.mode,
      title: conv.title,
      messages: conv.messages.map((m) => ({
        id: m.id,
        role: m.role,
        content: m.content,
        source: m.source,
        createdAt: m.createdAt.toISOString(),
      })),
    };
  }

  async createConversation(
    userId: string,
    input: z.infer<typeof createConversationSchema>
  ) {
    const conv = await this.prisma.caseConversation.create({
      data: {
        userId,
        mode: input.mode ?? "finance",
        title: input.title,
      },
    });
    return { conversation: { id: conv.id, mode: conv.mode, title: conv.title } };
  }

  async sendMessage(
    userId: string,
    conversationId: string,
    input: z.infer<typeof sendMessageSchema>
  ) {
    await this.assertRateLimit(userId);

    const conv = await this.prisma.caseConversation.findFirst({
      where: { id: conversationId, userId },
      include: { messages: { orderBy: { createdAt: "asc" } } },
    });
    if (!conv) {
      throw new AppError(404, { code: "NOT_FOUND", message: "Conversa não encontrada." });
    }

    const mode = (input.mode ?? conv.mode) as CaseAppMode;
    const ctx = await buildCaseContext(
      this.prisma,
      userId,
      mode,
      this.finance,
      this.dashboard
    );

    await this.prisma.caseMessage.create({
      data: {
        conversationId,
        role: "user",
        content: input.content.trim(),
        source: "user",
      },
    });

    let reply: string;
    let source: "llm" | "local" | "action" = "local";
    let proposal: CaseActionProposalPublic | undefined;

    const resolved = await this.resolveAssistantReply(
      userId,
      ctx,
      mode,
      input.content.trim(),
      conv.messages.map((m) => ({ role: m.role, content: m.content }))
    );
    reply = resolved.reply;
    source = resolved.source;
    proposal = resolved.proposal;

    const assistant = await this.prisma.caseMessage.create({
      data: {
        conversationId,
        role: "assistant",
        content: reply,
        source,
      },
    });

    const title =
      conv.title ??
      (input.content.trim().length > 48
        ? `${input.content.trim().slice(0, 48)}…`
        : input.content.trim());

    await this.prisma.caseConversation.update({
      where: { id: conversationId },
      data: { updatedAt: new Date(), title, mode },
    });

    return {
      message: {
        id: assistant.id,
        role: "assistant" as const,
        content: reply,
        source,
        createdAt: assistant.createdAt.toISOString(),
      },
      engine: source === "llm" ? "llm" : "local",
      proposal,
    };
  }

  async *sendMessageStream(
    userId: string,
    conversationId: string,
    input: z.infer<typeof sendMessageSchema>
  ): AsyncGenerator<CaseStreamEvent> {
    await this.assertRateLimit(userId);

    const conv = await this.prisma.caseConversation.findFirst({
      where: { id: conversationId, userId },
      include: { messages: { orderBy: { createdAt: "asc" } } },
    });
    if (!conv) {
      yield { type: "error", data: { message: "Conversa não encontrada." } };
      return;
    }

    const mode = (input.mode ?? conv.mode) as CaseAppMode;
    const ctx = await buildCaseContext(
      this.prisma,
      userId,
      mode,
      this.finance,
      this.dashboard
    );
    const trimmed = input.content.trim();
    const history = conv.messages.map((m) => ({ role: m.role, content: m.content }));

    await this.prisma.caseMessage.create({
      data: { conversationId, role: "user", content: trimmed, source: "user" },
    });

    const local = this.buildActionProposal(userId, ctx, mode, trimmed);
    if (local) {
      const assistant = await this.persistAssistantMessage(
        conversationId,
        conv,
        trimmed,
        mode,
        local.reply,
        "action"
      );
      yield {
        type: "done",
        data: {
          message: {
            id: assistant.id,
            role: "assistant",
            content: local.reply,
            source: "action",
            createdAt: assistant.createdAt.toISOString(),
          },
          engine: "local",
          proposal: local.proposal,
        },
      };
      return;
    }

    if (await this.canUseLlm(userId)) {
      try {
        const llm = await caseLlmReplyWithTools(ctx, history, trimmed, mode);
        if (llm.action) {
          const built = this.proposalFromDetected(userId, ctx, mode, llm.action);
          const assistant = await this.persistAssistantMessage(
            conversationId,
            conv,
            trimmed,
            mode,
            llm.content || built.reply,
            "action"
          );
          yield {
            type: "done",
            data: {
              message: {
                id: assistant.id,
                role: "assistant",
                content: llm.content || built.reply,
                source: "action",
                createdAt: assistant.createdAt.toISOString(),
              },
              engine: "llm",
              proposal: built.proposal,
            },
          };
          return;
        }
      } catch {
        /* tenta stream abaixo */
      }

      let content = "";
      try {
        for await (const delta of caseLlmReplyStream(ctx, history, trimmed)) {
          content += delta;
          yield { type: "token", data: { delta } };
        }
      } catch {
        content = caseFallbackReply(trimmed, ctx);
        yield { type: "token", data: { delta: content } };
      }

      if (!content.trim()) {
        content = caseFallbackReply(trimmed, ctx);
      }

      const source = content === caseFallbackReply(trimmed, ctx) ? "local" : "llm";
      const assistant = await this.persistAssistantMessage(
        conversationId,
        conv,
        trimmed,
        mode,
        content,
        source
      );
      yield {
        type: "done",
        data: {
          message: {
            id: assistant.id,
            role: "assistant",
            content,
            source: assistant.source,
            createdAt: assistant.createdAt.toISOString(),
          },
          engine: assistant.source === "llm" ? "llm" : "local",
        },
      };
      return;
    }

    const reply = caseFallbackReply(trimmed, ctx);
    const assistant = await this.persistAssistantMessage(
      conversationId,
      conv,
      trimmed,
      mode,
      reply,
      "local"
    );
    yield {
      type: "done",
      data: {
        message: {
          id: assistant.id,
          role: "assistant",
          content: reply,
          source: "local",
          createdAt: assistant.createdAt.toISOString(),
        },
        engine: "local",
      },
    };
  }

  private async persistAssistantMessage(
    conversationId: string,
    conv: { title: string | null; mode: string },
    userContent: string,
    mode: CaseAppMode,
    reply: string,
    source: "llm" | "local" | "action"
  ) {
    const assistant = await this.prisma.caseMessage.create({
      data: { conversationId, role: "assistant", content: reply, source },
    });
    const title =
      conv.title ??
      (userContent.length > 48 ? `${userContent.slice(0, 48)}…` : userContent);
    await this.prisma.caseConversation.update({
      where: { id: conversationId },
      data: { updatedAt: new Date(), title, mode },
    });
    return assistant;
  }

  async *chatStream(
    userId: string,
    input: z.infer<typeof sendMessageSchema>
  ): AsyncGenerator<CaseStreamEvent> {
    const { conversation } = await this.createConversation(userId, { mode: input.mode });
    let done = false;
    for await (const event of this.sendMessageStream(userId, conversation.id, input)) {
      if (event.type === "done") {
        done = true;
        yield {
          type: "done",
          data: { ...event.data, conversationId: conversation.id },
        };
      } else {
        yield event;
      }
    }
    if (!done) {
      yield { type: "error", data: { message: "Stream terminou sem resposta." } };
    }
  }

  /** Primeira mensagem numa conversa nova (atalho UX). */
  async chat(userId: string, input: z.infer<typeof sendMessageSchema>) {
    const { conversation } = await this.createConversation(userId, {
      mode: input.mode,
    });
    const result = await this.sendMessage(userId, conversation.id, input);
    return { ...result, conversationId: conversation.id };
  }
}
