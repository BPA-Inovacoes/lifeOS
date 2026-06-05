import { useMutation, useQueryClient } from "@tanstack/react-query";
import { FilePlus } from "lucide-react";
import { useNavigate } from "react-router-dom";

import { Button } from "@/components/ui/button";
import { createPage } from "@/services/workspaceApi";
import { paths } from "@/routes/paths";

export function NewPageButton({
  workspaceId,
  parentId,
}: {
  workspaceId: string;
  parentId?: string;
}) {
  const navigate = useNavigate();
  const qc = useQueryClient();

  const mutation = useMutation({
    mutationFn: () =>
      createPage(workspaceId, {
        title: "Nova página",
        icon: "file-text",
        parentId,
      }),
    onSuccess: (res) => {
      qc.invalidateQueries({ queryKey: ["pages", workspaceId] });
      qc.invalidateQueries({ queryKey: ["workspace", workspaceId] });
      navigate(paths.focus.page(workspaceId, res.page.id));
    },
  });

  return (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      className="h-8 w-full justify-start gap-2 px-3 font-mono text-xs uppercase tracking-wider"
      disabled={mutation.isPending}
      onClick={() => mutation.mutate()}
    >
      <FilePlus className="size-3.5 text-muted-foreground" />
      Nova página
    </Button>
  );
}
