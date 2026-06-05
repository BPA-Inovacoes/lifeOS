import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ChevronRight, FileText, Trash2 } from "lucide-react";

import { PageIcon } from "@/modules/workspace/components/PageIcon";
import { SubPageButton } from "@/modules/workspace/components/SubPageButton";
import { useState } from "react";
import { NavLink, useNavigate, useParams } from "react-router-dom";

import { ConfirmDialog } from "@/components/ConfirmDialog";
import { cn } from "@/lib/utils";
import { deletePage } from "@/services/workspaceApi";
import { paths } from "@/routes/paths";
import {
  navItemActiveClass,
  navItemClass,
  navItemIdleClass,
} from "@/styles/designTokens";
import type { PageTreeNode } from "@/utils/buildPageTree";

function PageTreeItem({
  node,
  workspaceId,
  depth,
  activePageId,
  onRequestDelete,
}: {
  node: PageTreeNode;
  workspaceId: string;
  depth: number;
  activePageId?: string;
  onRequestDelete: (page: { id: string; title: string }) => void;
}) {
  const [open, setOpen] = useState(true);
  const hasChildren = node.children.length > 0;

  return (
    <div>
      <div
        className="group/item flex items-center"
        style={{ paddingLeft: `${depth * 12 + 4}px` }}
      >
        {hasChildren ? (
          <button
            type="button"
            className="mr-0.5 rounded-none p-0.5 text-muted-foreground hover:bg-card hover:text-muted-foreground"
            onClick={() => setOpen((o) => !o)}
            aria-label={open ? "Recolher" : "Expandir"}
          >
            <ChevronRight
              className={cn("size-3.5 transition-transform", open && "rotate-90")}
            />
          </button>
        ) : (
          <span className="w-4 shrink-0" />
        )}
        <NavLink
          to={paths.focus.page(workspaceId, node.id)}
          className={({ isActive }) =>
            cn(
              navItemClass,
              "min-w-0 flex-1 px-2 py-1.5",
              isActive ? navItemActiveClass : navItemIdleClass
            )
          }
        >
          {({ isActive }) => (
            <>
              <PageIcon icon={node.icon} active={isActive} />
              <span className="truncate">{node.title}</span>
            </>
          )}
        </NavLink>
        <SubPageButton workspaceId={workspaceId} parentId={node.id} />
        <button
          type="button"
          className="mr-1 shrink-0 p-1 text-zinc-700 opacity-0 transition-opacity hover:text-red-400 group-hover/item:opacity-100"
          aria-label={`Apagar ${node.title}`}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onRequestDelete({ id: node.id, title: node.title });
          }}
        >
          <Trash2 className="size-3.5" />
        </button>
      </div>
      {hasChildren && open
        ? node.children.map((child) => (
            <PageTreeItem
              key={child.id}
              node={child}
              workspaceId={workspaceId}
              depth={depth + 1}
              activePageId={activePageId}
              onRequestDelete={onRequestDelete}
            />
          ))
        : null}
    </div>
  );
}

export function PageTree({
  nodes,
  workspaceId,
}: {
  nodes: PageTreeNode[];
  workspaceId: string;
}) {
  const navigate = useNavigate();
  const { pageId: activePageId } = useParams<{ pageId?: string }>();
  const qc = useQueryClient();
  const [pendingDelete, setPendingDelete] = useState<{
    id: string;
    title: string;
  } | null>(null);

  const remove = useMutation({
    mutationFn: (id: string) => deletePage(workspaceId, id),
    onSuccess: (_, deletedId) => {
      qc.invalidateQueries({ queryKey: ["pages", workspaceId] });
      qc.invalidateQueries({ queryKey: ["workspace", workspaceId] });
      qc.invalidateQueries({ queryKey: ["dashboard"] });
      setPendingDelete(null);

      if (activePageId === deletedId) {
        navigate(paths.focus.workspace(workspaceId), { replace: true });
      }
    },
  });

  if (nodes.length === 0) {
    return (
      <p className="flex items-center gap-2 px-3 py-2 font-mono text-sm text-muted-foreground">
        <FileText className="size-3.5 text-muted-foreground" />
        Sem páginas
      </p>
    );
  }

  return (
    <>
      <div className="space-y-0.5">
        {nodes.map((node) => (
          <PageTreeItem
            key={node.id}
            node={node}
            workspaceId={workspaceId}
            depth={0}
            activePageId={activePageId}
            onRequestDelete={setPendingDelete}
          />
        ))}
      </div>

      <ConfirmDialog
        open={pendingDelete !== null}
        title="Apagar página?"
        description={
          pendingDelete
            ? `«${pendingDelete.title}» e subpáginas serão removidas permanentemente.`
            : ""
        }
        loading={remove.isPending}
        onCancel={() => setPendingDelete(null)}
        onConfirm={() => {
          if (pendingDelete) remove.mutate(pendingDelete.id);
        }}
      />
    </>
  );
}
