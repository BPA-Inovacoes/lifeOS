import { randomUUID } from "node:crypto";

import type {
  CaseActionFormField,
  CaseActionPayload,
  CaseActionPreview,
  CaseActionProposalPhase,
  CaseActionProposalPublic,
  CaseActionProposalRecord,
  CaseActionTool,
} from "./case-action-types";
import type { CaseAppMode, CaseFinanceSnapshot, CaseFocusContext } from "./case-types";

const TTL_MS = 15 * 60 * 1000;

const store = new Map<string, CaseActionProposalRecord>();

function purgeExpired() {
  const now = Date.now();
  for (const [id, row] of store) {
    if (row.expiresAt <= now) store.delete(id);
  }
}

export function createCaseActionProposal(input: {
  userId: string;
  tool: CaseActionTool;
  mode: CaseAppMode;
  phase: CaseActionProposalPhase;
  preview: CaseActionPreview;
  form?: CaseActionFormField[];
  payload: CaseActionPayload;
  currency: string;
  focusSnapshot: CaseFocusContext;
  financeSnapshot: CaseFinanceSnapshot;
}): CaseActionProposalPublic {
  purgeExpired();
  const id = randomUUID();
  const record: CaseActionProposalRecord = {
    id,
    userId: input.userId,
    tool: input.tool,
    mode: input.mode,
    phase: input.phase,
    preview: input.preview,
    form: input.form,
    payload: input.payload,
    currency: input.currency,
    focusSnapshot: input.focusSnapshot,
    financeSnapshot: input.financeSnapshot,
    expiresAt: Date.now() + TTL_MS,
  };
  store.set(id, record);
  return toPublic(record);
}

export function getCaseActionProposal(userId: string, id: string) {
  purgeExpired();
  const row = store.get(id);
  if (!row || row.userId !== userId) return null;
  if (row.expiresAt <= Date.now()) {
    store.delete(id);
    return null;
  }
  return row;
}

export function updateCaseActionProposal(
  userId: string,
  id: string,
  patch: Partial<
    Pick<CaseActionProposalRecord, "phase" | "preview" | "form" | "payload">
  >
): CaseActionProposalPublic | null {
  purgeExpired();
  const row = getCaseActionProposal(userId, id);
  if (!row) return null;
  const next: CaseActionProposalRecord = {
    ...row,
    ...patch,
    expiresAt: Date.now() + TTL_MS,
  };
  store.set(id, next);
  return toPublic(next);
}

export function deleteCaseActionProposal(id: string) {
  store.delete(id);
}

function toPublic(row: CaseActionProposalRecord): CaseActionProposalPublic {
  return {
    id: row.id,
    tool: row.tool,
    phase: row.phase,
    preview: row.preview,
    form: row.form,
    expiresAt: new Date(row.expiresAt).toISOString(),
  };
}
