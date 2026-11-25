import type { Session } from "next-auth";

import type { UserRole } from "@/lib/constants";

export function isAdmin(session: Session | null): boolean {
  return session?.user?.role === "admin";
}

export function requireAdminRole(role: UserRole | undefined): boolean {
  return role === "admin";
}
