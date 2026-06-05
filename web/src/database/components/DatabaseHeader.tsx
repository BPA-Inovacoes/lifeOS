import { Calendar, LayoutGrid, List, Table2 } from "lucide-react";

import { DatabaseNavIcon } from "@/database/components/DatabaseNavIcon";
import { cn } from "@/lib/utils";
import { PageBreadcrumbs } from "@/editor";
import {
  sectionLabelClass,
  tabBarClass,
  tabItemActiveClass,
  tabItemClass,
  tabItemIdleClass,
} from "@/styles/designTokens";
import { UI_DASHBOARD } from "@/constants/uiLabels";
import { paths } from "@/routes/paths";
import { templateLabel } from "@/database/utils/templateLabels";
import type { ViewType } from "@/types/database";

type DatabaseHeaderProps = {
  workspaceName: string;
  workspaceId: string;
  databaseName: string;
  databaseIcon?: string | null;
  template: string;
  rowCount: number;
  views: { id: string; name: string; type: ViewType }[];
  activeView: ViewType;
  onViewChange: (view: ViewType) => void;
};

const viewIcons: Record<ViewType, typeof Table2> = {
  TABLE: Table2,
  BOARD: LayoutGrid,
  CALENDAR: Calendar,
  LIST: List,
};

export function DatabaseHeader({
  workspaceName,
  workspaceId,
  databaseName,
  databaseIcon,
  template,
  rowCount,
  views,
  activeView,
  onViewChange,
}: DatabaseHeaderProps) {
  return (
    <header className="border-b border-border pb-6">
      <PageBreadcrumbs
        items={[
          { label: UI_DASHBOARD, to: paths.focus.dashboard },
          { label: workspaceName, to: paths.focus.workspace(workspaceId) },
          { label: databaseName },
        ]}
      />

      <div className="mt-6 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <div className="space-y-2">
          <p className={sectionLabelClass}>// base de dados</p>
          <h1 className="flex items-center gap-3 text-2xl font-semibold tracking-tight text-foreground md:text-3xl">
            <span className="flex size-11 items-center justify-center border border-border bg-card">
              <DatabaseNavIcon
                template={template}
                name={databaseName}
                icon={databaseIcon}
                size="lg"
                className="text-foreground"
              />
            </span>
            {databaseName}
          </h1>
          <p className="font-mono text-sm text-muted-foreground">
            {templateLabel(template)} · {rowCount}{" "}
            {rowCount === 1 ? "registo" : "registos"}
          </p>
        </div>

        <div className={tabBarClass}>
          {views.map((v) => {
            const Icon = viewIcons[v.type];
            const active = activeView === v.type;
            return (
              <button
                key={v.id}
                type="button"
                className={cn(
                  tabItemClass,
                  "inline-flex items-center gap-2 px-4",
                  active ? tabItemActiveClass : tabItemIdleClass
                )}
                onClick={() => onViewChange(v.type)}
              >
                <Icon className="size-4 shrink-0" />
                {v.name}
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
}
