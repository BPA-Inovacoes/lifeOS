import { FolderPlus } from "lucide-react";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { WorkspaceDatabasePicker } from "@/modules/workspace/components/WorkspaceDatabasePicker";
import {
  DEFAULT_WORKSPACE_ICON,
  WorkspaceIconPicker,
} from "@/modules/workspace/components/WorkspaceIconPicker";
import {
  DEFAULT_WORKSPACE_DATABASES,
  formatSelectedDatabases,
  type WorkspaceDatabaseTemplate,
} from "@/modules/workspace/workspaceDatabaseTemplates";
import { AppModal } from "@/components/AppModal";
import { ApiError, flattenApiErrors } from "@/services/http";
import { fieldClass, techCardAccentClass, techCardClass } from "@/styles/designTokens";
import { cn } from "@/lib/utils";

export type WorkspaceCreatePayload = {
  name: string;
  icon?: string;
  description?: string;
  databases: WorkspaceDatabaseTemplate[];
};

type WorkspaceCreateDialogProps = {
  open: boolean;
  onClose: () => void;
  onSubmit: (payload: WorkspaceCreatePayload) => void;
  isPending?: boolean;
  error?: string | null;
};

export function WorkspaceCreateDialog({
  open,
  onClose,
  onSubmit,
  isPending,
  error: externalError,
}: WorkspaceCreateDialogProps) {
  const [name, setName] = useState("");
  const [icon, setIcon] = useState(DEFAULT_WORKSPACE_ICON);
  const [description, setDescription] = useState("");
  const [databases, setDatabases] = useState<WorkspaceDatabaseTemplate[]>(
    DEFAULT_WORKSPACE_DATABASES
  );
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setName("");
      setIcon(DEFAULT_WORKSPACE_ICON);
      setDescription("");
      setDatabases([...DEFAULT_WORKSPACE_DATABASES]);
      setError(null);
    }
  }, [open]);

  const displayError = externalError ?? error;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) {
      setError("Nome obrigatório");
      return;
    }
    if (databases.length === 0) {
      setError("Escolhe pelo menos uma base de dados.");
      return;
    }
    setError(null);
    onSubmit({
      name: trimmed,
      icon: icon.trim() || undefined,
      description: description.trim() || undefined,
      databases,
    });
  };

  return (
    <AppModal
      open={open}
      onClose={onClose}
      disabled={isPending}
      ariaLabelledBy="workspace-create-title"
      panelClassName="max-w-lg"
    >
      <form
        className={cn(
          techCardClass,
          "relative max-h-[90vh] overflow-y-auto p-6 shadow-2xl"
        )}
        onSubmit={handleSubmit}
      >
        <div className={techCardAccentClass} aria-hidden />

        <div className="mb-6 flex items-start gap-3">
          <span className="flex size-10 items-center justify-center border border-border bg-card">
            <FolderPlus className="size-4 text-emerald-600/80" />
          </span>
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.2em] text-emerald-600/80">
              // espaço
            </p>
            <h2
              id="workspace-create-title"
              className="mt-1 text-lg font-semibold text-foreground"
            >
              Novo espaço
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Página Início + {formatSelectedDatabases(databases)}.
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label
              htmlFor="ws-create-name"
              className="mb-1.5 block font-mono text-xs uppercase text-muted-foreground"
            >
              Nome *
            </label>
            <Input
              id="ws-create-name"
              value={name}
              className={fieldClass}
              placeholder="Ex.: Trabalho, Estudos…"
              autoFocus
              maxLength={80}
              disabled={isPending}
              onChange={(e) => {
                setName(e.target.value);
                setError(null);
              }}
            />
          </div>
          <div>
            <label
              htmlFor="ws-create-icon"
              className="mb-1.5 block font-mono text-xs uppercase text-muted-foreground"
            >
              Ícone
            </label>
            <WorkspaceIconPicker
              id="ws-create-icon"
              value={icon}
              disabled={isPending}
              onChange={setIcon}
            />
          </div>
          <div>
            <label
              htmlFor="ws-create-desc"
              className="mb-1.5 block font-mono text-xs uppercase text-muted-foreground"
            >
              Descrição (opcional)
            </label>
            <textarea
              id="ws-create-desc"
              value={description}
              rows={3}
              maxLength={500}
              disabled={isPending}
              placeholder="Para que serve este espaço?"
              className={cn(
                fieldClass,
                "min-h-[4.5rem] resize-y py-2 leading-relaxed"
              )}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
          <div>
            <label className="mb-1.5 block font-mono text-xs uppercase text-muted-foreground">
              Bases de dados *
            </label>
            <p className="mb-2 text-sm text-muted-foreground">
              Escolhe o que este espaço inclui. Tarefas + Projetos activam a
              coluna «Projeto» nas tarefas.
            </p>
            <WorkspaceDatabasePicker
              selected={databases}
              disabled={isPending}
              onChange={(next) => {
                setDatabases(next);
                setError(null);
              }}
            />
          </div>
        </div>

        {displayError ? (
          <p className="mt-4 text-sm text-red-700 dark:text-red-400">{displayError}</p>
        ) : null}

        <div className="mt-6 flex justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            disabled={isPending}
            onClick={onClose}
          >
            Cancelar
          </Button>
          <Button type="submit" disabled={isPending || !name.trim()}>
            {isPending ? "A criar…" : "Criar espaço"}
          </Button>
        </div>
      </form>
    </AppModal>
  );
}

/** Converte erro de mutation para mensagem no diálogo. */
export function workspaceCreateErrorMessage(e: unknown): string {
  if (e instanceof ApiError) {
    return flattenApiErrors(e.body) ?? e.message;
  }
  return "Não foi possível criar o espaço.";
}
