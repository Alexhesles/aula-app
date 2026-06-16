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
