import { useEffect, useState } from "react";

import { AppModal } from "@/components/AppModal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DEFAULT_CUSTOM_DATABASE_ICON } from "@/modules/workspace/databaseIcons";
import { WorkspaceIconPicker } from "@/modules/workspace/components/WorkspaceIconPicker";
import { fieldClass, techCardAccentClass, techCardClass } from "@/styles/designTokens";
import { cn } from "@/lib/utils";
import { Database } from "lucide-react";

export type CreateDatabasePayload = {
  name: string;
  icon?: string;
};

type CreateDatabaseDialogProps = {
  open: boolean;
  onClose: () => void;
  onSubmit: (payload: CreateDatabasePayload) => void;
  isPending?: boolean;
  error?: string | null;
};

export function CreateDatabaseDialog({
  open,
  onClose,
  onSubmit,
  isPending,
  error: externalError,
}: CreateDatabaseDialogProps) {
  const [name, setName] = useState("");
  const [icon, setIcon] = useState<string>(DEFAULT_CUSTOM_DATABASE_ICON);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setName("");
      setIcon(DEFAULT_CUSTOM_DATABASE_ICON);
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
    setError(null);
    onSubmit({
      name: trimmed,
      icon: icon.trim() || undefined,
    });
  };

  return (
    <AppModal
      open={open}
      onClose={onClose}
      disabled={isPending}
      ariaLabelledBy="database-create-title"
      panelClassName="max-w-md"
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
            <Database className="size-4 text-emerald-600/80" />
          </span>
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.2em] text-emerald-600/80">
              // base
            </p>
            <h2
              id="database-create-title"
              className="mt-1 text-lg font-semibold text-foreground"
            >
              Nova base de dados
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Personalizada — Tarefas, Hábitos e restantes default mantêm-se.
            </p>
          </div>
        </div>

        <div className="space-y-5">
          <div>
            <label htmlFor="db-name" className={fieldClass}>
              Nome
            </label>
            <Input
              id="db-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex.: Clientes, Leituras, Inventário"
              maxLength={80}
              autoFocus
              disabled={isPending}
              className="mt-1.5"
            />
          </div>

          <div className="border border-border bg-secondary/50 p-4">
            <p className="font-mono text-xs uppercase tracking-wider text-muted-foreground">
              Ícone
            </p>
            <div className="mt-3">
              <WorkspaceIconPicker
                id="database-create-icon"
                value={icon}
                onChange={setIcon}
                disabled={isPending}
                ariaLabel="Ícone da base"
              />
            </div>
          </div>

          <p className="font-mono text-xs leading-relaxed text-muted-foreground">
            Colunas Título e Estado · vistas Tabela e Quadro. Várias bases
            personalizadas no mesmo espaço.
          </p>

          {displayError ? (
            <p className="text-sm text-red-700 dark:text-red-400" role="alert">
              {displayError}
            </p>
          ) : null}

          <div className="flex justify-end gap-2 border-t border-border pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isPending}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? "A criar…" : "Criar base"}
            </Button>
          </div>
        </div>
      </form>
    </AppModal>
  );
}
