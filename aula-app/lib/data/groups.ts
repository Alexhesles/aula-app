import { createClient } from "@/lib/supabase/server";

export interface TeacherGroup {
  id: string;
  name: string;
  grade: string | null;
  room: string | null;
  isTitular: boolean;
}

/** Grupos que imparte el maestro actual (RLS ya filtra a los suyos). */
export async function getMyGroups(): Promise<TeacherGroup[]> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from("group_teachers")
    .select("is_titular, groups(id, name, grade, room)")
    .eq("teacher_id", user.id);

  if (error || !data) return [];

  // Aplanar y deduplicar por grupo (un maestro puede tener varias materias en un grupo).
  const map = new Map<string, TeacherGroup>();
  for (const row of data as any[]) {
    const g = row.groups;
    if (!g) continue;
    const existing = map.get(g.id);
    map.set(g.id, {
      id: g.id,
      name: g.name,
      grade: g.grade,
      room: g.room,
      isTitular: existing?.isTitular || row.is_titular,
    });
  }
  return Array.from(map.values()).sort((a, b) => a.name.localeCompare(b.name));
}

/** Datos de un grupo individual. */
export async function getGroup(groupId: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("groups")
    .select("id, name, grade, room")
    .eq("id", groupId)
    .single();
  return data;
}
