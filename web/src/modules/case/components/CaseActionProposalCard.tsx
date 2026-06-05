import { useEffect, useState } from "react";
import { useMutation } from "@tanstack/react-query";

import { CaseMessageBody } from "@/modules/case/components/CaseMessageBody";
import {
  cancelCaseAction,
  confirmCaseAction,
  updateCaseAction,
  type CaseActionFormField,
  type CaseActionProposal,
} from "@/services/caseApi";
import { cn } from "@/lib/utils";

type Props = {
  proposal: CaseActionProposal;
  onDone: (message: { content: string; id: string }) => void;
  onCancel: () => void;
  onProposalUpdate: (proposal: CaseActionProposal) => void;
};

function formValues(form: CaseActionFormField[]) {
  return Object.fromEntries(form.map((f) => [f.key, f.value]));
}

export function CaseActionProposalCard({ proposal, onDone, onCancel, onProposalUpdate }: Props) {
  const [localForm, setLocalForm] = useState<CaseActionFormField[]>(proposal.form ?? []);
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    setLocalForm(proposal.form ?? []);
    setFormError(null);
  }, [proposal.id, proposal.phase, proposal.form]);

  const confirm = useMutation({
    mutationFn: () => confirmCaseAction(proposal.id),
    onSuccess: (data) => onDone(data.message),
  });

  const cancel = useMutation({
    mutationFn: () => cancelCaseAction(proposal.id),
    onSuccess: () => onCancel(),
  });

  const patch = useMutation({
    mutationFn: (body: Parameters<typeof updateCaseAction>[1]) =>
      updateCaseAction(proposal.id, body),
    onSuccess: (data) => {
      setFormError(null);
      onProposalUpdate(data.proposal);
    },
    onError: (err: Error) => {
      setFormError(err.message || "Não foi possível actualizar.");
    },
  });

  const busy = confirm.isPending || cancel.isPending || patch.isPending;

  const setField = (key: string, value: string) => {
    setLocalForm((prev) => prev.map((f) => (f.key === key ? { ...f, value } : f)));
    setFormError(null);
  };

  const showSummary = proposal.phase === "summary";

  return (
    <div className="mt-2 border border-emerald-500/30 bg-emerald-500/5 p-3 text-sm">
      {!showSummary ? (
        <>
          <p className="font-medium text-foreground">{proposal.preview.title || "Detalhes"}</p>
          <div className="mt-3 space-y-3">
            {localForm.map((field) => (
              <label key={field.key} className="block text-xs">
                <span className="text-foreground/80">
                  {field.label}
                  {field.required ? " *" : ""}
                </span>
                {field.type === "select" ? (
                  <select
                    className="mt-1 w-full border border-border bg-background px-2 py-1.5 text-sm text-foreground"
                    value={field.value}
                    disabled={busy || field.readOnly}
                    onChange={(e) => setField(field.key, e.target.value)}
                  >
                    {field.required && !field.value ? (
                      <option value="">Escolher…</option>
                    ) : null}
                    {field.options?.map((o) => (
                      <option key={o.value} value={o.value}>
                        {o.label}
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    type={field.type === "number" ? "number" : "text"}
                    className="mt-1 w-full border border-border bg-background px-2 py-1.5 text-sm text-foreground"
                    value={field.value}
                    readOnly={field.readOnly}
                    disabled={busy || field.readOnly}
                    onChange={(e) => setField(field.key, e.target.value)}
                  />
                )}
              </label>
            ))}
          </div>
          {formError ? <p className="mt-2 text-xs text-red-600 dark:text-red-400">{formError}</p> : null}
          <div className="mt-3 flex flex-wrap gap-2">
            <button
              type="button"
              className={cn(
                "border border-emerald-600/50 px-2 py-1 text-xs font-medium text-emerald-950 hover:bg-emerald-500/10",
                "dark:text-emerald-200"
              )}
              disabled={busy}
              onClick={() =>
                patch.mutate({
                  fields: formValues(localForm),
                  advanceToSummary: true,
                })
              }
            >
              {patch.isPending ? "A validar…" : "Ver resumo"}
            </button>
            <button
              type="button"
              className="border border-border px-2 py-1 text-xs text-muted-foreground hover:bg-muted/50"
              disabled={busy}
              onClick={() => cancel.mutate()}
            >
              Cancelar
            </button>
          </div>
        </>
      ) : (
        <>
          <p className="font-medium text-foreground">{proposal.preview.title}</p>
          <ul className="mt-2 space-y-1 text-xs text-muted-foreground">
            {proposal.preview.fields.map((f) => (
              <li key={f.label}>
                <span className="text-foreground/80">{f.label}:</span> {f.value}
              </li>
            ))}
          </ul>
          <div className="mt-3 flex flex-wrap gap-2">
            <button
              type="button"
              className={cn(
                "border border-emerald-600/50 px-2 py-1 text-xs font-medium text-emerald-950 hover:bg-emerald-500/10",
                "dark:text-emerald-200"
              )}
              disabled={busy}
              onClick={() => confirm.mutate()}
            >
              {confirm.isPending ? "A criar…" : "Confirmar"}
            </button>
            {proposal.form?.length ? (
              <button
                type="button"
                className="border border-border px-2 py-1 text-xs text-muted-foreground hover:bg-muted/50"
                disabled={busy}
                onClick={() => patch.mutate({ fields: {}, backToForm: true })}
              >
                Editar
              </button>
            ) : null}
            <button
              type="button"
              className="border border-border px-2 py-1 text-xs text-muted-foreground hover:bg-muted/50"
              disabled={busy}
              onClick={() => cancel.mutate()}
            >
              Cancelar
            </button>
          </div>
        </>
      )}
      <p className="mt-2 text-[10px] text-muted-foreground">
        Só executa após confirmares — podes cancelar sem alterar nada.
      </p>
    </div>
  );
}

export function CaseAssistantMessage({
  content,
  proposal,
  proposalResolved,
  onProposalDone,
  onProposalCancel,
  onProposalUpdate,
}: {
  content: string;
  proposal?: CaseActionProposal;
  proposalResolved?: "done" | "cancelled";
  onProposalDone: (message: { content: string; id: string }) => void;
  onProposalCancel: () => void;
  onProposalUpdate: (proposal: CaseActionProposal) => void;
}) {
  return (
    <div>
      <CaseMessageBody content={content} />
      {proposal && !proposalResolved ? (
        <CaseActionProposalCard
          proposal={proposal}
          onDone={onProposalDone}
          onCancel={onProposalCancel}
          onProposalUpdate={onProposalUpdate}
        />
      ) : null}
      {proposalResolved === "cancelled" ? (
        <p className="mt-2 text-xs text-muted-foreground">Acção cancelada.</p>
      ) : null}
    </div>
  );
}
