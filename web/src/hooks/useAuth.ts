import { useAuthStore } from "@/store/authStore";

export function useAuth() {
  const token = useAuthStore((s) => s.token);
  const user = useAuthStore((s) => s.user);
  const setSession = useAuthStore((s) => s.setSession);
  const clearSession = useAuthStore((s) => s.clearSession);
  const isAuthenticated = Boolean(token);

  return {
    token,
    user,
    isAuthenticated,
    setSession,
    clearSession,
  };
}
