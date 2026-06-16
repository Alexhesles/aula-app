/** Roles del sistema. La fuente de verdad vive en profiles.role (Supabase). */
export const ROLES = {
  MAESTRO: "maestro",
  DIRECTOR: "director",
  PADRE: "padre",
  SUPERVISOR: "supervisor",
} as const;

export type Role = (typeof ROLES)[keyof typeof ROLES];

/** A dónde mandar a cada rol después de iniciar sesión. */
export const HOME_BY_ROLE: Record<Role, string> = {
  maestro: "/inicio",
  director: "/dashboard",
  padre: "/inicio",
  supervisor: "/zona",
};
