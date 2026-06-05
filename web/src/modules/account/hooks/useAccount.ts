import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  changePasswordRequest,
  meRequest,
  updateMeRequest,
} from "@/services/authApi";
import type { ChangePasswordPayload, UpdateProfilePayload } from "@/types/auth";
import { useAuthStore } from "@/store/authStore";

export function useAccountProfile() {
  const token = useAuthStore((s) => s.token);
  const updateUser = useAuthStore((s) => s.updateUser);

  return useQuery({
    queryKey: ["account", "me"],
    queryFn: async () => {
      const profile = await meRequest();
      updateUser(profile);
      return profile;
    },
    enabled: Boolean(token),
    staleTime: 60_000,
  });
}

export function useAccountMutations() {
  const queryClient = useQueryClient();
  const updateUser = useAuthStore((s) => s.updateUser);

  const updateProfile = useMutation({
    mutationFn: (payload: UpdateProfilePayload) => updateMeRequest(payload),
    onSuccess: (user) => {
      updateUser(user);
      queryClient.setQueryData(["account", "me"], user);
    },
  });

  const changePassword = useMutation({
    mutationFn: (payload: ChangePasswordPayload) => changePasswordRequest(payload),
  });

  return { updateProfile, changePassword };
}
