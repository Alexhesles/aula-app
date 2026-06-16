import { createClient } from "@/lib/supabase/server";

/** Grupos del maestro + su school_id, para formularios del cliente. */
export async function getMyContext() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { schoolId: null, groups: [] as { id: string; name: string }[] };

  const { data: profile } = await supabase
    .from("profiles")
    .select("school_id")
    .eq("id", user.id)
    .single();

  const { data: gt } = await supabase
    .from("group_teachers")
    .select("groups(id, name)")
    .eq("teacher_id", user.id);

  const map = new Map<string, string>();
  for (const row of (gt as any[]) ?? []) {
    if (row.groups) map.set(row.groups.id, row.groups.name);
  }

  return {
    schoolId: profile?.school_id ?? null,
    groups: Array.from(map, ([id, name]) => ({ id, name })),
  };
}
