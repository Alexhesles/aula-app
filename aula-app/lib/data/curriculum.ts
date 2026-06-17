import { createClient } from "@/lib/supabase/server";

export async function getCurriculumGroups() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];
  const { data } = await supabase
    .from("group_teachers")
    .select("groups(id, name, grade)")
    .eq("teacher_id", user.id);
  const map = new Map<string, { id: string; name: string; grade: string | null }>();
  for (const row of (data as any[]) ?? []) {
    if (row.groups) map.set(row.groups.id, row.groups);
  }
  return Array.from(map.values());
}

export interface SubjectBlock {
  subject: string;
  contents: { id: string; content: string; block: number | null; covered: boolean }[];
  done: number;
  total: number;
}

export async function getCurriculum(groupId: string) {
  const supabase = await createClient();

  const { data: group } = await supabase
    .from("groups")
    .select("id, name, grade")
    .eq("id", groupId)
    .single();
  if (!group) return null;

  if (!group.grade) {
    return { group, subjects: [] as SubjectBlock[], needsGrade: true };
  }

  const { data: contents } = await supabase
    .from("curriculum_contents")
    .select("id, subject, content, block, position")
    .eq("grade", group.grade)
    .order("subject", { ascending: true })
    .order("position", { ascending: true });

  const { data: coverage } = await supabase
    .from("content_coverage")
    .select("content_id, covered")
    .eq("group_id", groupId);

  const coveredSet = new Set(
    ((coverage as any[]) ?? []).filter((c) => c.covered).map((c) => c.content_id)
  );

  const bySubject = new Map<string, SubjectBlock>();
  for (const c of (contents as any[]) ?? []) {
    if (!bySubject.has(c.subject)) {
      bySubject.set(c.subject, { subject: c.subject, contents: [], done: 0, total: 0 });
    }
    const sb = bySubject.get(c.subject)!;
    const covered = coveredSet.has(c.id);
    sb.contents.push({ id: c.id, content: c.content, block: c.block, covered });
    sb.total += 1;
    if (covered) sb.done += 1;
  }

  return { group, subjects: Array.from(bySubject.values()), needsGrade: false };
}
