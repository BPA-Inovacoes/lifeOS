import type { AuthUser, LoginResponse } from "@/types/auth";
import { apiJson } from "@/services/http";

export async function loginRequest(
  email: string,
  password: string
): Promise<LoginResponse> {
  return apiJson<LoginResponse>("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
}

export async function registerRequest(payload: {
  email: string;
  password: string;
  name?: string;
}): Promise<LoginResponse> {
  return apiJson<LoginResponse>("/auth/register", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function meRequest(token: string): Promise<AuthUser> {
  return apiJson<AuthUser>("/users/me", {
    headers: { Authorization: `Bearer ${token}` },
  });
}

export type ForgotPasswordResponse = {
  emailed: boolean;
  devToken?: string;
};

export async function forgotPasswordRequest(
  email: string
): Promise<ForgotPasswordResponse> {
  return apiJson<ForgotPasswordResponse>("/auth/forgot-password", {
    method: "POST",
    body: JSON.stringify({ email }),
  });
}

export async function resetPasswordRequest(
  token: string,
  password: string
): Promise<void> {
  await apiJson<void>("/auth/reset-password", {
    method: "POST",
    body: JSON.stringify({ token, password }),
  });
}
