import { createClient } from "@/lib/supabase/server";

export type AttendanceStatus = "presente" | "tardanza" | "falta";

export interface AttendanceRecord {
  student_id: string;
  status: AttendanceStatus;
}

/** Asistencia ya registrada para un grupo en una fecha. */
export async function getAttendanceForDate(
  groupId: string,
  date: string
): Promise<Record<string, AttendanceStatus>> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("attendance")
    .select("student_id, status")
    .eq("group_id", groupId)
    .eq("date", date);

  if (error || !data) return {};
  const map: Record<string, AttendanceStatus> = {};
  for (const r of data) map[r.student_id] = r.status as AttendanceStatus;
  return map;
}

export interface DaySummary {
  date: string;
  presente: number;
  tardanza: number;
  falta: number;
  total: number;
}

/** Historial de asistencia de un grupo: resumen por día (más reciente primero). */
export async function getAttendanceHistory(groupId: string, limit = 30): Promise<DaySummary[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("attendance")
    .select("date, status")
    .eq("group_id", groupId)
    .order("date", { ascending: false });

  if (!data) return [];
  const byDate = new Map<string, DaySummary>();
  for (const r of data as any[]) {
    if (!byDate.has(r.date)) {
      byDate.set(r.date, { date: r.date, presente: 0, tardanza: 0, falta: 0, total: 0 });
    }
    const d = byDate.get(r.date)!;
    if (r.status in d) (d as any)[r.status] += 1;
    d.total += 1;
  }
  return Array.from(byDate.values()).slice(0, limit);
}

/** Asistencia de una fecha con nombres, para revisión. */
export async function getAttendanceDetail(groupId: string, date: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("attendance")
    .select("status, students(full_name)")
    .eq("group_id", groupId)
    .eq("date", date);
  return ((data as any[]) ?? []).map((r) => ({
    name: r.students?.full_name ?? "—",
    status: r.status as AttendanceStatus,
  }));
}
