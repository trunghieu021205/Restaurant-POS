import type { User } from "@/types/user";

export type AppRole = "user" | "staff" | "admin";

export function normalizeRole(role?: string | null): AppRole | null {
  if (!role) return null;
  const normalized = role.toLowerCase();
  return normalized === "user" || normalized === "staff" || normalized === "admin"
    ? normalized
    : null;
}

export function hasRole(user: User | null | undefined, roles: AppRole[]) {
  const role = normalizeRole(user?.role);
  return !!role && roles.includes(role);
}
