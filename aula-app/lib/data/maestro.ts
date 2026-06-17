import { createClient } from "@/lib/supabase/server";

export async function getPendingRequests() {
  const supabase = await createClient();
  const { data } = await supabase.rpc("pending_guardian_requests");
  return ((data as any[]) ?? []).map((r) => ({
    linkId: r.link_id, studentName: r.student_name, guardianName: r.guardian_name, groupName: r.group_name,
  }));
}

export async function getStudentProfile(studentId: string) {
  const supabase = await createClient();
  const { data: student } = await supabase
    .from("students")
    .select("id, full_name, birthdate, groups(name, grade)")
    .eq("id", studentId)
    .single();
  if (!student) return null;

  const { data: health } = await supabase
    .from("health_records")
    .select("blood_type, allergies, conditions, emergency_contact, emergency_phone")
    .eq("student_id", studentId)
    .maybeSingle();

  const { data: notes } = await supabase
    .from("student_notes")
    .select("id, text, category, created_at")
    .eq("student_id", studentId)
    .order("created_at", { ascending: false });

  // Resumen de asistencia (mes)
  const start = new Date(); start.setDate(1);
  const { data: att } = await supabase
    .from("attendance")
    .select("status")
    .eq("student_id", studentId)
    .gte("date", start.toLocaleDateString("en-CA"));
  const summary = { presente: 0, tardanza: 0, falta: 0 };
  for (const a of (att as any[]) ?? []) if (a.status in summary) (summary as any)[a.status]++;

  return {
    student: { id: (student as any).id, fullName: (student as any).full_name, birthdate: (student as any).birthdate, groupName: (student as any).groups?.name ?? null },
    health: health ?? null,
    notes: ((notes as any[]) ?? []),
    summary,
  };
}

export async function getAssignments(groupId: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("assignments")
    .select("id, title, subject, due_date, created_at, assignment_status(status)")
    .eq("group_id", groupId)
    .order("created_at", { ascending: false });
  return ((data as any[]) ?? []).map((a) => {
    const st = a.assignment_status ?? [];
    return {
      id: a.id, title: a.title, subject: a.subject, due_date: a.due_date,
      delivered: st.filter((s: any) => s.status === "entregado").length,
      total: st.length,
    };
  });
}

export async function getAssignmentDetail(assignmentId: string) {
  const supabase = await createClient();
  const { data: a } = await supabase
    .from("assignments")
    .select("id, title, subject, due_date, group_id")
    .eq("id", assignmentId)
    .single();
  if (!a) return null;
  const { data: students } = await supabase
    .from("students").select("id, full_name").eq("group_id", (a as any).group_id).order("full_name");
  const { data: statuses } = await supabase
    .from("assignment_status").select("student_id, status").eq("assignment_id", assignmentId);
  const map: Record<string, string> = {};
  for (const s of (statuses as any[]) ?? []) map[s.student_id] = s.status;
  return {
    assignment: a as any,
    students: ((students as any[]) ?? []).map((s) => ({ id: s.id, name: s.full_name, status: map[s.id] ?? "pendiente" })),
  };
}
