import { createClient } from "@/lib/supabase/server";

export async function getMyChildren() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("students")
    .select("id, full_name, photo_url, groups(name, grade)")
    .order("full_name", { ascending: true });
  return ((data as any[]) ?? []).map((s) => ({
    id: s.id,
    fullName: s.full_name,
    photoUrl: s.photo_url,
    groupName: s.groups?.name ?? null,
    grade: s.groups?.grade ?? null,
  }));
}

export async function getChildDetail(studentId: string) {
  const supabase = await createClient();

  const { data: student } = await supabase
    .from("students")
    .select("id, full_name, groups(name, grade)")
    .eq("id", studentId)
    .single();
  if (!student) return null;

  // Asistencia del mes en curso
  const start = new Date();
  start.setDate(1);
  const startStr = start.toLocaleDateString("en-CA");
  const { data: att } = await supabase
    .from("attendance")
    .select("status, date")
    .eq("student_id", studentId)
    .gte("date", startStr);

  const summary = { presente: 0, tardanza: 0, falta: 0 };
  for (const a of (att as any[]) ?? []) {
    if (a.status in summary) (summary as any)[a.status] += 1;
  }

  // Bitácora visible para tutores (RLS ya filtra a visible_to_guardian)
  const { data: logsRaw } = await supabase
    .from("log_entries")
    .select("id, type, text, media_urls, created_at")
    .eq("student_id", studentId)
    .order("created_at", { ascending: false })
    .limit(20);

  const logs: any[] = [];
  for (const l of (logsRaw as any[]) ?? []) {
    const media: string[] = [];
    for (const path of l.media_urls ?? []) {
      const { data: signed } = await supabase.storage.from("bitacora").createSignedUrl(path, 3600);
      if (signed?.signedUrl) media.push(signed.signedUrl);
    }
    logs.push({ id: l.id, type: l.type, text: l.text, created_at: l.created_at, media });
  }

  // Consentimientos del tutor
  const { data: consents } = await supabase
    .from("consents")
    .select("type, granted")
    .eq("student_id", studentId);
  const consentMap: Record<string, boolean> = {};
  for (const c of (consents as any[]) ?? []) consentMap[c.type] = c.granted;

  return {
    student: { id: student.id, fullName: (student as any).full_name, groupName: (student as any).groups?.name ?? null },
    summary,
    logs,
    consentMap,
  };
}
