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

export interface HomeGroup extends TeacherGroup {
  studentCount: number;
  attendanceTodayDone: boolean;
}

/** Grupos del maestro enriquecidos para el inicio: conteo de alumnos y si ya pasó lista hoy. */
export async function getHomeGroups(): Promise<HomeGroup[]> {
  const supabase = await createClient();
  const base = await getMyGroups();
  const today = new Date().toLocaleDateString("en-CA");

  const enriched = await Promise.all(
    base.map(async (g) => {
      const [{ count: students }, { count: att }] = await Promise.all([
        supabase.from("students").select("id", { count: "exact", head: true }).eq("group_id", g.id),
        supabase.from("attendance").select("id", { count: "exact", head: true }).eq("group_id", g.id).eq("date", today),
      ]);
      return { ...g, studentCount: students ?? 0, attendanceTodayDone: (att ?? 0) > 0 };
    })
  );
  return enriched;
}
