import { useMutation, useQueryClient } from "@tanstack/react-query";
import { FilePlus } from "lucide-react";
import { useNavigate } from "react-router-dom";

import { cn } from "@/lib/utils";
import { createPage } from "@/services/workspaceApi";
import { paths } from "@/routes/paths";
import { toast } from "@/store/toastStore";

type SubPageButtonProps = {
  workspaceId: string;
  parentId: string;
  className?: string;
};

export function SubPageButton({
  workspaceId,
  parentId,
  className,
}: SubPageButtonProps) {
  const navigate = useNavigate();
  const qc = useQueryClient();

  const mutation = useMutation({
    mutationFn: () =>
      createPage(workspaceId, {
        title: "Subpágina",
        icon: "file-text",
        parentId,
      }),
    onSuccess: (res) => {
      qc.invalidateQueries({ queryKey: ["pages", workspaceId] });
      qc.invalidateQueries({ queryKey: ["workspace", workspaceId] });
      toast.success("Subpágina criada");
      navigate(paths.focus.page(workspaceId, res.page.id));
    },
    onError: () => toast.error("Não foi possível criar a subpágina."),
  });

  return (
    <button
      type="button"
      className={cn(
        "shrink-0 p-1 text-zinc-700 opacity-0 transition-opacity hover:text-emerald-700 dark:hover:text-emerald-400 group-hover/item:opacity-100",
        className
      )}
      aria-label="Nova subpágina"
      disabled={mutation.isPending}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        mutation.mutate();
      }}
    >
      <FilePlus className="size-3.5" />
    </button>
  );
}
