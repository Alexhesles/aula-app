import { createClient } from "@/lib/supabase/server";
import type { Role } from "./roles";

export interface AppUser {
  id: string;
  email: string | null;
  role: Role | null;
  fullName: string | null;
  schoolId: string | null;
  avatarUrl: string | null;
}

/**
 * Devuelve el usuario actual con su perfil (rol, escuela), o null.
 * Úsalo en Server Components y layouts protegidos.
 */
export async function getCurrentUser(): Promise<AppUser | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, full_name, school_id, avatar_url")
    .eq("id", user.id)
    .single();

  return {
    id: user.id,
    email: user.email ?? null,
    role: (profile?.role as Role) ?? null,
    fullName: profile?.full_name ?? null,
    schoolId: profile?.school_id ?? null,
    avatarUrl: profile?.avatar_url ?? null,
  };
}
