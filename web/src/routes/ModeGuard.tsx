import type { ReactNode } from "react";
import { Navigate } from "react-router-dom";

import { paths, type AppMode } from "@/routes/paths";
import { useAppModeStore } from "@/store/appModeStore";

type Props = {
  mode: AppMode;
  children: ReactNode;
};

/** Garante que o utilizador escolheu o modo correcto antes de entrar na interface. */
export function ModeGuard({ mode, children }: Props) {
  const activeMode = useAppModeStore((s) => s.activeMode);

  if (activeMode === null) {
    return <Navigate to={paths.modeSelect} replace />;
  }

  if (activeMode !== mode) {
    return <Navigate to={paths.modeSelect} replace />;
  }

  return <>{children}</>;
}
