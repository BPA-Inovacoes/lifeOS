import { useMutation, useQueryClient } from "@tanstack/react-query";
import { CornerDownLeft, Inbox } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createDatabaseRow } from "@/services/databaseApi";
import type { DashboardSummary } from "@/services/dashboardApi";
import { ApiError, flattenApiErrors } from "@/services/http";
import { cn } from "@/lib/utils";
import { fieldClass } from "@/styles/designTokens";

type QuickInboxProps = {
  inbox: NonNullable<DashboardSummary["links"]["inbox"]>;
};

export function QuickInbox({ inbox }: QuickInboxProps) {
  const qc = useQueryClient();
  const [title, setTitle] = useState("");
  const [error, setError] = useState<string | null>(null);

  const create = useMutation({
    mutationFn: (text: string) =>
      createDatabaseRow(inbox.workspaceId, inbox.databaseId, {
        [inbox.titlePropertyId]: text,
        [inbox.statusPropertyId]: "Por fazer",
      }),
    onSuccess: () => {
      setTitle("");
      setError(null);
      void qc.invalidateQueries({ queryKey: ["dashboard"] });
    },
    onError: (e) => {
      if (e instanceof ApiError) {
        setError(flattenApiErrors(e.body) ?? e.message);
      } else {
        setError("Não foi possível criar a tarefa.");
      }
    },
  });

  const submit = () => {
    const text = title.trim();
    if (!text || create.isPending) return;
    create.mutate(text);
  };

  return (
    <section className="relative border border-border bg-background/85 backdrop-blur-sm">
      <div className="absolute left-0 top-0 h-0.5 w-full bg-emerald-600/80" aria-hidden />
      <div className="flex flex-col gap-4 p-4 md:flex-row md:items-center md:p-5">
        <div className="flex min-w-0 items-start gap-3 md:w-48 md:shrink-0">
          <span className="flex size-9 shrink-0 items-center justify-center border border-border bg-card">
            <Inbox className="size-4 text-emerald-600/80" />
          </span>
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.2em] text-emerald-600/80">
              // entrada
            </p>
            <p className="mt-0.5 text-sm font-medium text-foreground">
              Captura rápida
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              Enter para adicionar às tarefas
            </p>
          </div>
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex gap-2">
            <Input
              value={title}
              placeholder="O que queres fazer?"
              className={cn(fieldClass, "h-11 flex-1")}
              disabled={create.isPending}
              onChange={(e) => {
                setTitle(e.target.value);
                if (error) setError(null);
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  submit();
                }
              }}
            />
            <Button
              type="button"
              className="h-11 shrink-0 gap-2 px-4"
              disabled={!title.trim() || create.isPending}
              onClick={submit}
            >
              <CornerDownLeft className="size-4" />
              <span className="hidden font-mono text-xs uppercase sm:inline">
                {create.isPending ? "A guardar…" : "Adicionar"}
              </span>
            </Button>
          </div>
          {error ? (
            <p className="mt-2 text-sm text-red-700 dark:text-red-400">{error}</p>
          ) : null}
        </div>
      </div>
    </section>
  );
}
