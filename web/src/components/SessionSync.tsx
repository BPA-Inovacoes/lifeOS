import { useEffect } from "react";

import { meRequest } from "@/services/authApi";
import { useAuthStore } from "@/store/authStore";

/** Sincroniza dados da conta com o servidor quando há sessão guardada. */
export function SessionSync() {
  const token = useAuthStore((s) => s.token);
  const updateUser = useAuthStore((s) => s.updateUser);
  const clearSession = useAuthStore((s) => s.clearSession);

  useEffect(() => {
    if (!token) return;
    let cancelled = false;
    meRequest()
      .then((user) => {
        if (!cancelled) updateUser(user);
      })
      .catch(() => {
        if (!cancelled) clearSession();
      });
    return () => {
      cancelled = true;
    };
  }, [token, updateUser, clearSession]);

  return null;
}
