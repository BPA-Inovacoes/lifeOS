import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { setCaseLlmOptIn, type CaseStatus } from "@/services/caseApi";

type Props = {
  status: CaseStatus;
};

export function CaseLlmConsent({ status }: Props) {
  const [dismissed, setDismissed] = useState(false);
  const qc = useQueryClient();
  const optIn = useMutation({
    mutationFn: () => setCaseLlmOptIn(true),
    onSuccess: (data) => {
      qc.setQueryData(["case", "status"], data);
    },
  });

  if (!status.llmAvailable || status.llmOptIn || dismissed) return null;

  const providerLabel =
    status.provider === "groq" ? "Groq" : status.provider === "openai" ? "OpenAI" : "LLM externo";

  return (
    <div className="border border-amber-500/30 bg-amber-500/5 px-3 py-3 text-xs text-foreground">
      <p className="font-medium">Respostas IA ({providerLabel})</p>
      <p className="mt-1 text-muted-foreground">{status.privacy.contextSent}</p>
      <p className="mt-1 text-muted-foreground">{status.privacy.userMessageWarning}</p>
      <div className="mt-2 flex flex-wrap gap-2">
        <button
          type="button"
          className="border border-amber-500/50 px-2 py-1 hover:bg-amber-500/10 disabled:opacity-50"
          disabled={optIn.isPending}
          onClick={() => optIn.mutate()}
        >
          Activar IA
        </button>
        <button
          type="button"
          className="border border-border px-2 py-1 text-muted-foreground hover:bg-muted/50"
          onClick={() => setDismissed(true)}
        >
          Continuar em local
        </button>
      </div>
    </div>
  );
}
