export type UserRole = "ADMIN" | "CEO" | "EMPLOYEE" | "MANAGER";

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
