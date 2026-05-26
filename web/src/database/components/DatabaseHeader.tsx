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
import { templateLabel } from "@/database/utils/templateLabels";
import type { ViewType } from "@/types/database";

type DatabaseHeaderProps = {
  workspaceName: string;
  workspaceId: string;
  databaseName: string;
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
  template,
  rowCount,
  views,
  activeView,
  onViewChange,
}: DatabaseHeaderProps) {
  return (
    <header className="border-b border-zinc-800 pb-6">
      <PageBreadcrumbs
        items={[
          { label: UI_DASHBOARD, to: "/dashboard" },
          { label: workspaceName, to: `/w/${workspaceId}` },
          { label: databaseName },
        ]}
      />

      <div className="mt-6 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <div className="space-y-2">
          <p className={sectionLabelClass}>// base de dados</p>
          <h1 className="flex items-center gap-3 text-2xl font-semibold tracking-tight text-white md:text-3xl">
            <span className="flex size-11 items-center justify-center border border-zinc-800 bg-zinc-900">
              <DatabaseNavIcon
                template={template}
                name={databaseName}
                size="lg"
                className="text-zinc-300"
              />
            </span>
            {databaseName}
          </h1>
          <p className="font-mono text-xs text-zinc-500">
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
