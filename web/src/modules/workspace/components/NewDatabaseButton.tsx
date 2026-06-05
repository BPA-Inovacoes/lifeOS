import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Database } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { Button } from "@/components/ui/button";
import {
  CreateDatabaseDialog,
  type CreateDatabasePayload,
} from "@/modules/workspace/components/CreateDatabaseDialog";
import { createDatabase } from "@/services/databaseApi";
import { paths } from "@/routes/paths";
import { ApiError, flattenApiErrors } from "@/services/http";

type NewDatabaseButtonProps = {
  workspaceId: string;
  /** Sidebar: lista completa; hub: botão compacto ao lado do título */
  layout?: "sidebar" | "inline";
};

export function NewDatabaseButton({
  workspaceId,
  layout = "sidebar",
}: NewDatabaseButtonProps) {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);

  const mutation = useMutation({
    mutationFn: (payload: CreateDatabasePayload) =>
      createDatabase(workspaceId, payload),
    onSuccess: (res) => {
      qc.invalidateQueries({ queryKey: ["workspace", workspaceId] });
      qc.invalidateQueries({ queryKey: ["databases", workspaceId] });
      setOpen(false);
      navigate(paths.focus.database(workspaceId, res.database.id));
    },
  });

  const error =
    mutation.error instanceof ApiError
      ? flattenApiErrors(mutation.error)
      : mutation.error
        ? "Não foi possível criar a base."
        : null;

  return (
    <>
      <Button
        type="button"
        variant={layout === "inline" ? "outline" : "ghost"}
        size="sm"
        className={
          layout === "inline"
            ? "gap-1.5 font-mono text-xs uppercase tracking-wider"
            : "h-8 w-full justify-start gap-2 px-3 font-mono text-xs uppercase tracking-wider"
        }
        onClick={() => setOpen(true)}
      >
        <Database className="size-3.5 text-muted-foreground" />
        Nova base
      </Button>

      <CreateDatabaseDialog
        open={open}
        onClose={() => {
          if (!mutation.isPending) setOpen(false);
        }}
        onSubmit={(payload) => mutation.mutate(payload)}
        isPending={mutation.isPending}
        error={error}
      />
    </>
  );
}
