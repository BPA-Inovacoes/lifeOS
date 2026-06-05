import type { ReactNode } from "react";

import { DataPanel } from "@/components/DataPanel";

type ViewRequirementNoticeProps = {
  children: ReactNode;
};

/** Estado uniforme quando falta uma propriedade obrigatória para a vista. */
export function ViewRequirementNotice({ children }: ViewRequirementNoticeProps) {
  return (
    <DataPanel>
      <div className="px-6 py-12 text-center text-sm text-muted-foreground">
        {children}
      </div>
    </DataPanel>
  );
}
