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
