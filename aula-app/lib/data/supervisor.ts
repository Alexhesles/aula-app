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
