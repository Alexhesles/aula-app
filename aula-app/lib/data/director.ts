import { createClient } from "@/lib/supabase/server";

export interface SchoolStats {
  groups: number;
  students: number;
  attendanceTakenToday: number;
}

export async function getSchoolStats(): Promise<SchoolStats> {
  const supabase = await createClient();
  const today = new Date().toLocaleDateString("en-CA");

  const [{ count: groups }, { count: students }, { count: att }] = await Promise.all([
    supabase.from("groups").select("id", { count: "exact", head: true }),
    supabase.from("students").select("id", { count: "exact", head: true }),
    supabase.from("attendance").select("id", { count: "exact", head: true }).eq("date", today),
  ]);

  return {
    groups: groups ?? 0,
    students: students ?? 0,
    attendanceTakenToday: att ?? 0,
  };
}

export async function getSchoolGroups() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("groups")
    .select("id, name, grade, room, students(id)")
    .order("name", { ascending: true });
  return (data as any[] ?? []).map((g) => ({
    id: g.id,
    name: g.name,
    grade: g.grade,
    room: g.room,
    studentCount: g.students?.length ?? 0,
  }));
}

export async function getRecentLogs(limit = 10) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("log_entries")
    .select("id, type, text, created_at, students(full_name), groups(name)")
    .eq("visible_to_director", true)
    .order("created_at", { ascending: false })
    .limit(limit);
  return (data as any[] ?? []).map((r) => ({
    id: r.id,
    type: r.type,
    text: r.text,
    created_at: r.created_at,
    studentName: r.students?.full_name ?? null,
    groupName: r.groups?.name ?? null,
  }));
}

/** % de currículo cubierto para un grupo (según su grado). */
async function curriculumPct(supabase: any, groupId: string, grade: string | null): Promise<number | null> {
  if (!grade) return null;
  const [{ count: total }, { count: done }] = await Promise.all([
    supabase.from("curriculum_contents").select("id", { count: "exact", head: true }).eq("grade", grade),
    supabase.from("content_coverage").select("id", { count: "exact", head: true }).eq("group_id", groupId).eq("covered", true),
  ]);
  if (!total) return null;
  return Math.round(((done ?? 0) / total) * 100);
}

/** Grupos de la escuela enriquecidos: alumnos, % currículo, lista de hoy. */
export async function getSchoolGroupsRich() {
  const supabase = await createClient();
  const today = new Date().toLocaleDateString("en-CA");
  const { data } = await supabase
    .from("groups")
    .select("id, name, grade, room, students(id)")
    .order("name", { ascending: true });

  const groups = (data as any[]) ?? [];
  return Promise.all(
    groups.map(async (g) => {
      const [pct, { count: att }] = await Promise.all([
        curriculumPct(supabase, g.id, g.grade),
        supabase.from("attendance").select("id", { count: "exact", head: true }).eq("group_id", g.id).eq("date", today),
      ]);
      return {
        id: g.id,
        name: g.name,
        grade: g.grade,
        room: g.room,
        studentCount: g.students?.length ?? 0,
        curriculumPct: pct,
        attendanceToday: att ?? 0,
      };
    })
  );
}

/** Incidencias de la escuela con estado de reseña. */
export async function getIncidents(limit = 20) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("log_entries")
    .select("id, type, text, created_at, reviewed_at, students(full_name), groups(name)")
    .eq("type", "incidente")
    .order("created_at", { ascending: false })
    .limit(limit);
  return ((data as any[]) ?? []).map((r) => ({
    id: r.id,
    text: r.text,
    created_at: r.created_at,
    reviewed: !!r.reviewed_at,
    studentName: r.students?.full_name ?? null,
    groupName: r.groups?.name ?? null,
  }));
}

/** Detalle de un grupo para el director. */
export async function getGroupDetailForDirector(groupId: string) {
  const supabase = await createClient();
  const { data: group } = await supabase
    .from("groups")
    .select("id, name, grade, room, students(id, full_name)")
    .eq("id", groupId)
    .single();
  if (!group) return null;

  const pct = await curriculumPct(supabase, groupId, (group as any).grade);

  // % por materia
  let subjects: { subject: string; done: number; total: number }[] = [];
  if ((group as any).grade) {
    const { data: contents } = await supabase
      .from("curriculum_contents")
      .select("id, subject")
      .eq("grade", (group as any).grade);
    const { data: cov } = await supabase
      .from("content_coverage")
      .select("content_id, covered")
      .eq("group_id", groupId);
    const coveredSet = new Set(((cov as any[]) ?? []).filter((c) => c.covered).map((c) => c.content_id));
    const map = new Map<string, { subject: string; done: number; total: number }>();
    for (const c of (contents as any[]) ?? []) {
      if (!map.has(c.subject)) map.set(c.subject, { subject: c.subject, done: 0, total: 0 });
      const s = map.get(c.subject)!;
      s.total += 1;
      if (coveredSet.has(c.id)) s.done += 1;
    }
    subjects = Array.from(map.values());
  }

  return {
    group: { id: (group as any).id, name: (group as any).name, grade: (group as any).grade, room: (group as any).room },
    students: ((group as any).students ?? []) as { id: string; full_name: string }[],
    curriculumPct: pct,
    subjects,
  };
}
