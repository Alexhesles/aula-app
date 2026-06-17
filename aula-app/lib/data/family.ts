import { createClient } from "@/lib/supabase/server";

export async function getMyChildren() {
  const supabase = await createClient();
  const { data } = await supabase.rpc("my_children");
  return ((data as any[]) ?? []).map((c) => ({
    id: c.student_id, fullName: c.full_name, groupName: c.group_name, grade: c.grade, status: c.status,
  }));
}

export async function getChildDetail(studentId: string) {
  const supabase = await createClient();

  const { data: student } = await supabase
    .from("students").select("id, full_name, group_id, groups(name, grade)").eq("id", studentId).single();
  if (!student) return null;
  const groupId = (student as any).group_id;
  const grade = (student as any).groups?.grade ?? null;

  const start = new Date(); start.setDate(1);
  const { data: att } = await supabase
    .from("attendance").select("status").eq("student_id", studentId).gte("date", start.toLocaleDateString("en-CA"));
  const summary = { presente: 0, tardanza: 0, falta: 0 };
  for (const a of (att as any[]) ?? []) if (a.status in summary) (summary as any)[a.status]++;

  // Bitácora visible
  const { data: logsRaw } = await supabase
    .from("log_entries").select("id, type, text, media_urls, created_at")
    .eq("student_id", studentId).order("created_at", { ascending: false }).limit(20);
  const logs: any[] = [];
  for (const l of (logsRaw as any[]) ?? []) {
    const media: string[] = [];
    for (const path of l.media_urls ?? []) {
      const { data: signed } = await supabase.storage.from("bitacora").createSignedUrl(path, 3600);
      if (signed?.signedUrl) media.push(signed.signedUrl);
    }
    logs.push({ id: l.id, type: l.type, text: l.text, created_at: l.created_at, media });
  }

  // Consentimientos
  const { data: consents } = await supabase.from("consents").select("type, granted").eq("student_id", studentId);
  const consentMap: Record<string, boolean> = {};
  for (const c of (consents as any[]) ?? []) consentMap[c.type] = c.granted;

  // Progreso curricular del grupo
  let progress: { subject: string; done: number; total: number }[] = [];
  if (grade) {
    const { data: contents } = await supabase.from("curriculum_contents").select("id, subject").eq("grade", grade);
    const { data: cov } = await supabase.from("content_coverage").select("content_id, covered").eq("group_id", groupId);
    const coveredSet = new Set(((cov as any[]) ?? []).filter((c) => c.covered).map((c) => c.content_id));
    const map = new Map<string, { subject: string; done: number; total: number }>();
    for (const c of (contents as any[]) ?? []) {
      if (!map.has(c.subject)) map.set(c.subject, { subject: c.subject, done: 0, total: 0 });
      const s = map.get(c.subject)!; s.total++; if (coveredSet.has(c.id)) s.done++;
    }
    progress = Array.from(map.values());
  }

  // Anuncios del grupo o escuela
  const { data: ann } = await supabase
    .from("announcements").select("id, title, body, event_date, kind, created_at")
    .order("created_at", { ascending: false }).limit(15);

  // Ficha (perfil) del alumno
  const { data: profile } = await supabase.rpc("child_profile", { p_student_id: studentId });
  const prof = (profile as any[])?.[0] ?? null;

  return {
    student: { id: (student as any).id, fullName: (student as any).full_name, groupName: (student as any).groups?.name ?? null },
    summary, logs, consentMap, progress,
    announcements: ((ann as any[]) ?? []),
    profile: prof,
  };
}
