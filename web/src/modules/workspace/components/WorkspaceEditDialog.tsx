import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Pencil } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { AppModal } from "@/components/AppModal";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { WorkspaceDatabasePicker } from "@/modules/workspace/components/WorkspaceDatabasePicker";
import { WorkspaceIconPicker } from "@/modules/workspace/components/WorkspaceIconPicker";
import { normalizeWorkspaceIconKey } from "@/modules/workspace/workspaceIcons";
import {
  inferTemplatesFromDatabases,
  WORKSPACE_DATABASE_OPTIONS,
  type WorkspaceDatabaseTemplate,
} from "@/modules/workspace/workspaceDatabaseTemplates";
import { toast } from "@/store/toastStore";
import { getWorkspace, updateWorkspace } from "@/services/workspaceApi";
import { ApiError, flattenApiErrors } from "@/services/http";
import type { WorkspaceSummary } from "@/types/workspace";
import { fieldClass, techCardAccentClass, techCardClass } from "@/styles/designTokens";
import { cn } from "@/lib/utils";

type WorkspaceEditDialogProps = {
  workspace: WorkspaceSummary | null;
  open: boolean;
  onClose: () => void;
};

function formatTemplateLabels(ids: WorkspaceDatabaseTemplate[]): string {
  return WORKSPACE_DATABASE_OPTIONS.filter((o) => ids.includes(o.id))
    .map((o) => o.label)
    .join(", ");
}

export function WorkspaceEditDialog({
  workspace,
  open,
  onClose,
}: WorkspaceEditDialogProps) {
  const qc = useQueryClient();
  const [name, setName] = useState("");
  const [icon, setIcon] = useState("");
  const [initialDbs, setInitialDbs] = useState<WorkspaceDatabaseTemplate[]>([]);
  const [pickerSelection, setPickerSelection] = useState<
    WorkspaceDatabaseTemplate[]
  >([]);
  const [error, setError] = useState<string | null>(null);
  const [removeConfirmOpen, setRemoveConfirmOpen] = useState(false);

  const { data: wsDetail, isLoading: loadingDetail } = useQuery({
    queryKey: ["workspace", workspace?.id, "edit"],
    queryFn: () => getWorkspace(workspace!.id),
    enabled: open && Boolean(workspace?.id),
  });

  useEffect(() => {
    if (workspace && open) {
      setName(workspace.name);
      setIcon(normalizeWorkspaceIconKey(workspace.icon));
      setError(null);
      setRemoveConfirmOpen(false);
    }
  }, [workspace, open]);

  useEffect(() => {
    if (!open || !wsDetail?.workspace.databases) return;
    const active = inferTemplatesFromDatabases(wsDetail.workspace.databases);
    setInitialDbs(active);
    setPickerSelection(active);
  }, [open, wsDetail?.workspace.databases]);

  const toAdd = useMemo(
    () => pickerSelection.filter((id) => !initialDbs.includes(id)),
    [pickerSelection, initialDbs]
  );

  const toRemove = useMemo(
    () => initialDbs.filter((id) => !pickerSelection.includes(id)),
    [pickerSelection, initialDbs]
  );

  const save = useMutation({
    mutationFn: async () => {
      if (!workspace) throw new Error("sem workspace");
      const trimmed = name.trim();
      if (!trimmed) throw new Error("Nome obrigatório");
      if (pickerSelection.length === 0) {
        throw new Error("Escolhe pelo menos uma base de dados.");
      }

      return updateWorkspace(workspace.id, {
        name: trimmed,
        icon: icon.trim() || null,
        addDatabases: toAdd.length > 0 ? toAdd : undefined,
        removeDatabases: toRemove.length > 0 ? toRemove : undefined,
      });
    },
    onSuccess: () => {
      setRemoveConfirmOpen(false);
      qc.invalidateQueries({ queryKey: ["workspaces"] });
      qc.invalidateQueries({ queryKey: ["dashboard"] });
      if (workspace) {
        qc.invalidateQueries({ queryKey: ["workspace", workspace.id] });
      }
      const parts: string[] = [];
      if (toAdd.length > 0) parts.push(`${toAdd.length} adicionada(s)`);
      if (toRemove.length > 0) parts.push(`${toRemove.length} removida(s)`);
      toast.success(
        parts.length > 0
          ? `Espaço actualizado · ${parts.join(", ")}`
          : "Espaço actualizado"
      );
      onClose();
    },
    onError: (e) => {
      setRemoveConfirmOpen(false);
      if (e instanceof ApiError) {
        setError(flattenApiErrors(e.body) ?? e.message);
      } else if (e instanceof Error && e.message === "Nome obrigatório") {
        setError(e.message);
      } else if (
        e instanceof Error &&
        e.message === "Escolhe pelo menos uma base de dados."
      ) {
        setError(e.message);
      } else {
        setError("Não foi possível guardar.");
      }
    },
  });

  const trySubmit = () => {
    const trimmed = name.trim();
    if (!trimmed) {
      setError("Nome obrigatório");
      return;
    }
    if (pickerSelection.length === 0) {
      setError("Escolhe pelo menos uma base de dados.");
      return;
    }
    setError(null);
    if (toRemove.length > 0) {
      setRemoveConfirmOpen(true);
      return;
    }
    save.mutate();
  };

  if (!workspace) return null;

  const removeLabels = formatTemplateLabels(toRemove);

  return (
    <>
      <AppModal
        open={open}
        onClose={onClose}
        disabled={save.isPending}
        ariaLabelledBy="workspace-edit-title"
        panelClassName="max-w-lg"
      >
        <form
          className={cn(
            techCardClass,
            "relative max-h-[90vh] overflow-y-auto p-6 shadow-2xl"
          )}
          onSubmit={(e) => {
            e.preventDefault();
            trySubmit();
          }}
        >
          <div className={techCardAccentClass} aria-hidden />

          <div className="mb-6 flex items-start gap-3">
            <span className="flex size-10 items-center justify-center border border-border bg-card">
              <Pencil className="size-4 text-emerald-600/80" />
            </span>
            <div>
              <p className="font-mono text-xs uppercase tracking-[0.2em] text-emerald-600/80">
                // espaço
              </p>
              <h2
                id="workspace-edit-title"
                className="mt-1 text-lg font-semibold text-foreground"
              >
                Editar espaço
              </h2>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label
                htmlFor="ws-name"
                className="mb-1.5 block font-mono text-xs uppercase text-muted-foreground"
              >
                Nome
              </label>
              <Input
                id="ws-name"
                value={name}
                className={fieldClass}
                autoFocus
                disabled={save.isPending}
                onChange={(e) => {
                  setName(e.target.value);
                  setError(null);
                }}
              />
            </div>
            <div>
              <label
                htmlFor="ws-icon"
                className="mb-1.5 block font-mono text-xs uppercase text-muted-foreground"
              >
                Ícone
              </label>
              <WorkspaceIconPicker
                id="ws-icon"
                value={icon}
                onChange={setIcon}
              />
            </div>
            <div>
              <label className="mb-1.5 block font-mono text-xs uppercase text-muted-foreground">
                Bases de dados
              </label>
              <p className="mb-2 text-sm text-muted-foreground">
                Marca ou desmarca as bases deste espaço. Tem de ficar pelo menos
                uma activa. Ao remover, os dados dessa base são apagados.
              </p>
              {toRemove.length > 0 ? (
                <p className="mb-2 text-sm text-amber-500/90">
                  A remover: {removeLabels}
                </p>
              ) : null}
              {loadingDetail ? (
                <p className="text-sm text-muted-foreground">A carregar bases…</p>
              ) : (
                <WorkspaceDatabasePicker
                  selected={pickerSelection}
                  disabled={save.isPending}
                  onChange={setPickerSelection}
                />
              )}
            </div>
          </div>

          {error ? (
            <p className="mt-4 text-sm text-red-700 dark:text-red-400">{error}</p>
          ) : null}

          <div className="mt-6 flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              disabled={save.isPending}
              onClick={onClose}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={
                save.isPending || !name.trim() || pickerSelection.length === 0
              }
            >
              {save.isPending ? "A guardar…" : "Guardar"}
            </Button>
          </div>
        </form>
      </AppModal>

      <ConfirmDialog
        open={removeConfirmOpen}
        variant="warning"
        title="Remover bases de dados?"
        description={`Vais remover: ${removeLabels}.\n\nTodos os dados dessas bases serão apagados de forma permanente.`}
        confirmLabel="Remover e guardar"
        loading={save.isPending}
        loadingLabel="A guardar…"
        onCancel={() => setRemoveConfirmOpen(false)}
        onConfirm={() => save.mutate()}
      />
    </>
  );
}
