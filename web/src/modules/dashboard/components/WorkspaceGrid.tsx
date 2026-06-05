import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ArrowRight, FolderOpen, Pencil, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import { ConfirmDialog } from "@/components/ConfirmDialog";
import { WorkspaceEditDialog } from "@/modules/workspace/components/WorkspaceEditDialog";
import { Button } from "@/components/ui/button";
import { deleteWorkspace } from "@/services/workspaceApi";
import { paths } from "@/routes/paths";
import type { WorkspaceSummary } from "@/types/workspace";
import { WorkspaceIcon } from "@/modules/workspace/components/WorkspaceIcon";
import { cn } from "@/lib/utils";
import { listItemClass, sectionLabelMutedClass } from "@/styles/designTokens";
import { formatRelativeDate } from "@/utils/formatRelative";

type WorkspaceGridProps = {
  workspaces: WorkspaceSummary[];
  onNewWorkspace: () => void;
};

export function WorkspaceGrid({
  workspaces,
  onNewWorkspace,
}: WorkspaceGridProps) {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [pendingDelete, setPendingDelete] = useState<WorkspaceSummary | null>(
    null
  );
  const [editing, setEditing] = useState<WorkspaceSummary | null>(null);

  const remove = useMutation({
    mutationFn: (id: string) => deleteWorkspace(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["workspaces"] });
      qc.invalidateQueries({ queryKey: ["dashboard"] });
      setPendingDelete(null);
      navigate(paths.focus.dashboard, { replace: true });
    },
  });

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className={sectionLabelMutedClass}>// espaços</p>
          <h2 className="mt-1 text-lg font-medium text-foreground">
            Os teus espaços
          </h2>
        </div>
        <Button
          type="button"
          size="sm"
          className="gap-2"
          onClick={onNewWorkspace}
        >
          <Plus className="size-4" />
          Novo
        </Button>
      </div>

      {workspaces.length === 0 ? (
        <div className="relative border border-dashed border-border bg-background/50 px-6 py-10 text-center">
          <div className="absolute left-0 top-0 h-0.5 w-full bg-zinc-700" aria-hidden />
          <FolderOpen className="mx-auto size-8 text-muted-foreground" />
          <p className="mt-3 text-sm text-muted-foreground">
            Ainda não tens espaços.
          </p>
          <p className="mt-2 font-mono text-sm text-muted-foreground">
            Corre{" "}
            <code className="border border-border bg-card px-1">
              npm run prisma:seed
            </code>{" "}
            no servidor ou cria um abaixo.
          </p>
          <Button
            type="button"
            size="sm"
            className="mt-4 gap-2"
            onClick={onNewWorkspace}
          >
            <Plus className="size-4" />
            Criar espaço
          </Button>
        </div>
      ) : (
        <ul className="grid gap-3 sm:grid-cols-2">
          {workspaces.map((ws) => (
            <li key={ws.id} className="group relative">
              <Link to={paths.focus.workspace(ws.id)} className={cn(listItemClass, "pr-12")}>
                <span className="flex min-w-0 flex-1 items-center gap-3">
                  <span className="flex size-10 shrink-0 items-center justify-center border border-border bg-card">
                    <WorkspaceIcon icon={ws.icon} size="lg" />
                  </span>
                  <span className="min-w-0">
                    <span className="block truncate font-medium text-foreground">
                      {ws.name}
                    </span>
                    <span className="mt-0.5 block font-mono text-xs uppercase tracking-wider text-muted-foreground">
                      atualizado {formatRelativeDate(ws.updatedAt)}
                    </span>
                  </span>
                </span>
                <ArrowRight className="size-4 shrink-0 text-muted-foreground transition-colors group-hover:text-emerald-500" />
              </Link>
              <button
                type="button"
                className="absolute right-16 top-1/2 -translate-y-1/2 p-1.5 text-zinc-700 opacity-0 transition-opacity hover:text-emerald-700 dark:hover:text-emerald-400 group-hover:opacity-100"
                aria-label={`Editar ${ws.name}`}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setEditing(ws);
                }}
              >
                <Pencil className="size-4" />
              </button>
              <button
                type="button"
                className="absolute right-4 top-1/2 -translate-y-1/2 p-1.5 text-zinc-700 opacity-0 transition-opacity hover:text-red-400 group-hover:opacity-100"
                aria-label={`Apagar ${ws.name}`}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setPendingDelete(ws);
                }}
              >
                <Trash2 className="size-4" />
              </button>
            </li>
          ))}
        </ul>
      )}

      <WorkspaceEditDialog
        workspace={editing}
        open={editing !== null}
        onClose={() => setEditing(null)}
      />

      <ConfirmDialog
        open={pendingDelete !== null}
        title="Apagar espaço?"
        description={
          pendingDelete
            ? `«${pendingDelete.name}» e todo o conteúdo (páginas, bases de dados, tarefas) serão removidos.`
            : ""
        }
        loading={remove.isPending}
        onCancel={() => setPendingDelete(null)}
        onConfirm={() => {
          if (pendingDelete) remove.mutate(pendingDelete.id);
        }}
      />
    </section>
  );
}
