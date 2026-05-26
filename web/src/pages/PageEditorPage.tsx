import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Trash2 } from "lucide-react";
import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { ConfirmDialog } from "@/components/ConfirmDialog";
import { PageSkeleton } from "@/components/PageSkeleton";
import { QueryErrorPanel } from "@/components/QueryErrorPanel";
import { Button } from "@/components/ui/button";
import { PageBreadcrumbs, PageEditor } from "@/editor";
import { PageIcon } from "@/modules/workspace/components/PageIcon";
import { usePageBreadcrumbs } from "@/hooks/usePageBreadcrumbs";
import {
  deletePage,
  fetchPageById,
  updatePage,
} from "@/services/workspaceApi";
import { toast } from "@/store/toastStore";
import { pageShellClass, sectionLabelClass } from "@/styles/designTokens";
import type { PageDetail } from "@/types/workspace";

export function PageEditorPage() {
  const navigate = useNavigate();
  const { workspaceId, pageId } = useParams<{
    workspaceId: string;
    pageId: string;
  }>();
  const qc = useQueryClient();
  const queryKey = ["page", workspaceId, pageId] as const;
  const [confirmDelete, setConfirmDelete] = useState(false);

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey,
    queryFn: () => fetchPageById(workspaceId!, pageId!),
    enabled: Boolean(workspaceId && pageId),
  });

  const patchTitle = useMutation({
    mutationFn: (title: string) =>
      updatePage(workspaceId!, pageId!, { title }),
    onSuccess: (res) => {
      qc.setQueryData<{ page: PageDetail }>(queryKey, (old) =>
        old ? { page: { ...old.page, title: res.page.title } } : old
      );
      qc.invalidateQueries({ queryKey: ["workspace", workspaceId] });
      qc.invalidateQueries({ queryKey: ["pages", workspaceId] });
    },
  });

  const remove = useMutation({
    mutationFn: () => deletePage(workspaceId!, pageId!),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["pages", workspaceId] });
      qc.invalidateQueries({ queryKey: ["workspace", workspaceId] });
      qc.invalidateQueries({ queryKey: ["dashboard"] });
      setConfirmDelete(false);
      toast.success("Página apagada");
      navigate(`/w/${workspaceId}`, { replace: true });
    },
  });

  const page = data?.page;
  const breadcrumbItems = usePageBreadcrumbs(
    workspaceId,
    pageId,
    page?.workspace.name ?? "Espaço"
  );

  if (isLoading) {
    return <PageSkeleton />;
  }

  if (isError || !page) {
    return (
      <div className={pageShellClass}>
        <QueryErrorPanel
          title="Página indisponível"
          message="Não foi possível carregar esta página."
          onRetry={() => refetch()}
        />
      </div>
    );
  }


  return (
    <div className="min-h-full">
      <header className="border-b border-zinc-800 bg-zinc-950/90">
        <div className={`${pageShellClass} !pb-6 !pt-6`}>
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0 flex-1 space-y-3">
              <PageBreadcrumbs items={breadcrumbItems} />
              <p className={sectionLabelClass}>// página</p>
              <div className="flex items-start gap-3">
                <span className="flex size-12 shrink-0 items-center justify-center border border-zinc-800 bg-zinc-900">
                  <PageIcon
                    icon={page.icon}
                    size="md"
                    className="size-6 text-zinc-300"
                  />
                </span>
                <div
                  contentEditable
                  suppressContentEditableWarning
                  className="min-w-0 flex-1 text-3xl font-semibold tracking-tight text-white outline-none md:text-4xl"
                  onBlur={(e) => {
                    const title =
                      e.currentTarget.textContent?.trim() || "Sem título";
                    if (title !== page.title) patchTitle.mutate(title);
                  }}
                >
                  {page.title}
                </div>
              </div>
              <p className="font-mono text-[10px] text-zinc-600">
                {page.blocks.length}{" "}
                {page.blocks.length === 1 ? "bloco" : "blocos"} · edita abaixo
              </p>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="shrink-0 gap-2 text-zinc-400 hover:border-red-900/50 hover:text-red-400"
              onClick={() => setConfirmDelete(true)}
            >
              <Trash2 className="size-4" />
              Apagar
            </Button>
          </div>
        </div>
      </header>

      <div className="border-l-2 border-transparent hover:border-emerald-900/30">
        <PageEditor
          workspaceId={workspaceId!}
          pageId={pageId!}
          blocks={page.blocks}
          queryKey={queryKey}
        />
      </div>

      <ConfirmDialog
        open={confirmDelete}
        title="Apagar página?"
        description={`«${page.title}» e subpáginas serão removidas permanentemente.`}
        loading={remove.isPending}
        onCancel={() => setConfirmDelete(false)}
        onConfirm={() => remove.mutate()}
      />
    </div>
  );
}
