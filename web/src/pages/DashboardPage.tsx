import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { QueryErrorPanel } from "@/components/QueryErrorPanel";
import {
  DashboardHeader,
  DashboardSkeleton,
  FocusCards,
  FocusNow,
  CaseInsightsWidget,
  FinanceFocusWidget,
  HabitStreaks,
  QuickInbox,
  TodayLists,
  XpWeekChart,
  WorkspaceGrid,
} from "@/modules/dashboard";
import {
  WorkspaceCreateDialog,
  workspaceCreateErrorMessage,
  type WorkspaceCreatePayload,
} from "@/modules/workspace";
import { fetchDashboard } from "@/services/dashboardApi";
import { toast } from "@/store/toastStore";
import { createWorkspace } from "@/services/workspaceApi";
import { paths } from "@/routes/paths";
import { useAuthStore } from "@/store/authStore";

export function DashboardPage() {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const userName = useAuthStore((s) => s.user?.name);
  const [createOpen, setCreateOpen] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["dashboard"],
    queryFn: fetchDashboard,
    staleTime: 90_000,
  });

  const create = useMutation({
    mutationFn: (payload: WorkspaceCreatePayload) => createWorkspace(payload),
    onSuccess: (res) => {
      setCreateError(null);
      setCreateOpen(false);
      qc.invalidateQueries({ queryKey: ["workspaces"] });
      qc.invalidateQueries({ queryKey: ["dashboard"] });
      toast.success("Espaço criado");
      navigate(paths.focus.workspace(res.workspace.id));
    },
    onError: (e) => {
      setCreateError(workspaceCreateErrorMessage(e));
    },
  });

  const openCreate = () => {
    setCreateError(null);
    setCreateOpen(true);
  };

  return (
    <div className="mx-auto max-w-6xl space-y-10 p-6 md:p-10">
      <div className="flex justify-end">
        <span className="border border-border bg-background/80 px-3 py-1 font-mono text-xs uppercase tracking-wider text-muted-foreground">
          Focus Mode
        </span>
      </div>
      <DashboardHeader
        userName={userName}
        data={data}
        onNewWorkspace={openCreate}
      />

      {isLoading ? (
        <DashboardSkeleton />
      ) : isError ? (
        <QueryErrorPanel
          title="Dashboard indisponível"
          message="Não foi possível carregar o painel Agora."
          onRetry={() => refetch()}
        />
      ) : data ? (
        <div className="space-y-10">
          {data.links.inbox ? <QuickInbox inbox={data.links.inbox} /> : null}
          <FocusNow data={data} />
          <CaseInsightsWidget />
          {data.finance?.enabled ? <FinanceFocusWidget finance={data.finance} /> : null}
          <FocusCards data={data} />
          <XpWeekChart
            days={data.weeklyXp}
            weekTotal={data.metrics.weekXpTotal}
          />
          <HabitStreaks data={data} />
          <TodayLists data={data} />
          <WorkspaceGrid
            workspaces={data.workspaces}
            onNewWorkspace={openCreate}
          />
        </div>
      ) : null}

      <WorkspaceCreateDialog
        open={createOpen}
        onClose={() => {
          if (!create.isPending) setCreateOpen(false);
        }}
        onSubmit={(payload) => create.mutate(payload)}
        isPending={create.isPending}
        error={createError}
      />
    </div>
  );
}
