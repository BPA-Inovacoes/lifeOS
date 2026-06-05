import type { NextFunction, Request, Response } from "express";

import type { CaseService } from "../services/case.service";

export class CaseController {
  constructor(private caseService: CaseService) {}

  status = async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user) return void res.status(401).json({ code: "UNAUTHORIZED", message: "Não autenticado." });
      res.json(await this.caseService.status(req.user.id));
    } catch (e) {
      next(e);
    }
  };

  setLlmOptIn = async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user) return void res.status(401).json({ code: "UNAUTHORIZED", message: "Não autenticado." });
      const input = this.caseService.parseLlmOptIn(req.body);
      res.json(await this.caseService.setLlmOptIn(req.user.id, input.optIn));
    } catch (e) {
      next(e);
    }
  };

  conversations = async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user) return void res.status(401).json({ code: "UNAUTHORIZED", message: "Não autenticado." });
      const limitRaw = typeof req.query.limit === "string" ? parseInt(req.query.limit, 10) : 20;
      const data = await this.caseService.listConversations(req.user.id, limitRaw);
      res.json({ conversations: data });
    } catch (e) {
      next(e);
    }
  };

  conversation = async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user) return void res.status(401).json({ code: "UNAUTHORIZED", message: "Não autenticado." });
      const data = await this.caseService.getConversation(req.user.id, req.params.conversationId);
      res.json({ conversation: data });
    } catch (e) {
      next(e);
    }
  };

  createConversation = async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user) return void res.status(401).json({ code: "UNAUTHORIZED", message: "Não autenticado." });
      const input = this.caseService.parseCreateConversation(req.body);
      const data = await this.caseService.createConversation(req.user.id, input);
      res.status(201).json(data);
    } catch (e) {
      next(e);
    }
  };

  sendMessage = async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user) return void res.status(401).json({ code: "UNAUTHORIZED", message: "Não autenticado." });
      const input = this.caseService.parseSendMessage(req.body);
      const data = await this.caseService.sendMessage(
        req.user.id,
        req.params.conversationId,
        input
      );
      res.json(data);
    } catch (e) {
      next(e);
    }
  };

  deleteConversation = async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user) return void res.status(401).json({ code: "UNAUTHORIZED", message: "Não autenticado." });
      const data = await this.caseService.deleteConversation(req.user.id, req.params.conversationId);
      res.json(data);
    } catch (e) {
      next(e);
    }
  };

  chat = async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user) return void res.status(401).json({ code: "UNAUTHORIZED", message: "Não autenticado." });
      const input = this.caseService.parseSendMessage(req.body);
      const data = await this.caseService.chat(req.user.id, input);
      res.json(data);
    } catch (e) {
      next(e);
    }
  };

  confirmAction = async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user) return void res.status(401).json({ code: "UNAUTHORIZED", message: "Não autenticado." });
      const data = await this.caseService.confirmAction(req.user.id, req.params.proposalId);
      res.json(data);
    } catch (e) {
      next(e);
    }
  };

  cancelAction = async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user) return void res.status(401).json({ code: "UNAUTHORIZED", message: "Não autenticado." });
      const data = this.caseService.cancelAction(req.user.id, req.params.proposalId);
      res.json(data);
    } catch (e) {
      next(e);
    }
  };

  updateAction = async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user) return void res.status(401).json({ code: "UNAUTHORIZED", message: "Não autenticado." });
      const input = this.caseService.parseUpdateAction(req.body);
      const data = this.caseService.updateAction(req.user.id, req.params.proposalId, input);
      res.json(data);
    } catch (e) {
      next(e);
    }
  };

  insights = async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user) return void res.status(401).json({ code: "UNAUTHORIZED", message: "Não autenticado." });
      const modeRaw = typeof req.query.mode === "string" ? req.query.mode : "focus";
      const mode = (["focus", "game", "finance"].includes(modeRaw) ? modeRaw : "focus") as
        | "focus"
        | "game"
        | "finance";
      res.json(await this.caseService.insights(req.user.id, mode));
    } catch (e) {
      next(e);
    }
  };

  chatStream = async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user) return void res.status(401).json({ code: "UNAUTHORIZED", message: "Não autenticado." });
      const input = this.caseService.parseSendMessage(req.body);
      res.setHeader("Content-Type", "text/event-stream; charset=utf-8");
      res.setHeader("Cache-Control", "no-cache, no-transform");
      res.setHeader("Connection", "keep-alive");
      res.flushHeaders?.();

      for await (const event of this.caseService.chatStream(req.user.id, input)) {
        res.write(`event: ${event.type}\ndata: ${JSON.stringify(event.data)}\n\n`);
      }
      res.end();
    } catch (e) {
      next(e);
    }
  };

  sendMessageStream = async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user) return void res.status(401).json({ code: "UNAUTHORIZED", message: "Não autenticado." });
      const input = this.caseService.parseSendMessage(req.body);
      res.setHeader("Content-Type", "text/event-stream; charset=utf-8");
      res.setHeader("Cache-Control", "no-cache, no-transform");
      res.setHeader("Connection", "keep-alive");
      res.flushHeaders?.();

      for await (const event of this.caseService.sendMessageStream(
        req.user.id,
        req.params.conversationId,
        input
      )) {
        res.write(`event: ${event.type}\ndata: ${JSON.stringify(event.data)}\n\n`);
      }
      res.end();
    } catch (e) {
      next(e);
    }
  };
}
