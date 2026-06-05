import type { AppMode } from "@/routes/paths";

import { CaseFab } from "@/modules/case/components/CaseFab";
import { CasePanel } from "@/modules/case/components/CasePanel";

type Props = {
  mode: AppMode;
};

export function CaseAssistant({ mode }: Props) {
  return (
    <>
      <CaseFab variant={mode} />
      <CasePanel />
    </>
  );
}
