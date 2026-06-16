"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import type { AttendanceStatus } from "@/lib/data/attendance";

export async function saveAttendance(
  groupId: string,
  date: string,
  entries: { studentId: string; status: AttendanceStatus }[]
): Promise<{ ok: boolean; error: string | null }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Sesión expirada." };

  const rows = entries.map((e) => ({
    student_id: e.studentId,
    group_id: groupId,
    date,
    status: e.status,
    recorded_by: user.id,
  }));

  const { error } = await supabase
    .from("attendance")
    .upsert(rows, { onConflict: "student_id,date" });

  if (error) return { ok: false, error: error.message };

  revalidatePath(`/asistencia/${groupId}`);
  return { ok: true, error: null };
}
