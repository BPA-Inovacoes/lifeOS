import { Router } from "express";

import type { CaseController } from "../controllers/case.controller";
import { requireAuth } from "../middlewares/auth.middleware";

export function createCaseRouter(controller: CaseController): Router {
  const r = Router();
  r.use(requireAuth());
  r.get("/status", controller.status);
  r.patch("/settings/llm-opt-in", controller.setLlmOptIn);
  r.get("/insights", controller.insights);
  r.get("/conversations", controller.conversations);
  r.post("/conversations", controller.createConversation);
  r.get("/conversations/:conversationId", controller.conversation);
  r.delete("/conversations/:conversationId", controller.deleteConversation);
  r.post("/conversations/:conversationId/messages/stream", controller.sendMessageStream);
  r.post("/conversations/:conversationId/messages", controller.sendMessage);
  r.post("/chat/stream", controller.chatStream);
  r.post("/chat", controller.chat);
  r.post("/actions/:proposalId/confirm", controller.confirmAction);
  r.post("/actions/:proposalId/cancel", controller.cancelAction);
  r.patch("/actions/:proposalId", controller.updateAction);
  return r;
}
