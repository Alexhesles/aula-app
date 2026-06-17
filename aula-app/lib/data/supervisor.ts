import { createClient } from "@/lib/supabase/server";

export async function getZoneOverview() {
  const supabase = await createClient();
  const { data } = await supabase.rpc("supervisor_overview");
  return ((data as any[]) ?? []).map((r) => ({
    schoolId: r.school_id,
    schoolName: r.school_name,
    groups: Number(r.groups_count),
    students: Number(r.students_count),
    attendanceToday: Number(r.attendance_today),
    incidentsWeek: Number(r.incidents_week),
  }));
}

export async function getSchoolGroupsZone(schoolId: string) {
  const supabase = await createClient();
  const { data } = await supabase.rpc("supervisor_school_groups", { p_school_id: schoolId });
  return ((data as any[]) ?? []).map((r) => ({
    groupId: r.group_id, name: r.group_name, grade: r.grade,
    students: Number(r.students),
    curriculumPct: r.curriculum_total ? Math.round((Number(r.curriculum_done) / Number(r.curriculum_total)) * 100) : null,
    attendanceToday: Number(r.attendance_today),
  }));
}

export async function getSchoolTeachers(schoolId: string) {
  const supabase = await createClient();
  const { data } = await supabase.rpc("supervisor_teachers", { p_school_id: schoolId });
  return ((data as any[]) ?? []).map((r) => ({
    id: r.teacher_id, name: r.full_name, lastActive: r.last_active_at, attendanceToday: Number(r.attendance_today),
  }));
}

export async function getSupervisorNotes(schoolId: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("supervisor_notes").select("id, target_type, text, created_at")
    .eq("school_id", schoolId).order("created_at", { ascending: false });
  return (data as any[]) ?? [];
}

export async function getSchoolName(schoolId: string) {
  const supabase = await createClient();
  const overview = await getZoneOverview();
  return overview.find((s) => s.schoolId === schoolId)?.schoolName ?? "Escuela";
}
