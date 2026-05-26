import type { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";

import { useAuthStore } from "@/store/authStore";

type Props = {
  children: ReactNode;
};

export function ProtectedRoute({ children }: Props) {
  const token = useAuthStore((s) => s.token);
  const loc = useLocation();
  if (!token) {
    return <Navigate to="/login" replace state={{ from: loc }} />;
  }
  return <>{children}</>;
}
