export type UserRole = "ADMIN" | "USER";

export type AuthUser = {
  id: string;
  email: string;
  name: string | null;
  role: UserRole;
  createdAt: string;
};

export type LoginResponse = {
  token: string;
  user: AuthUser;
};

export type UpdateProfilePayload = {
  name?: string;
  email?: string;
};

export type ChangePasswordPayload = {
  currentPassword: string;
  newPassword: string;
};
