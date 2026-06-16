import { createClient } from "@/lib/supabase/server";

export interface LessonPlan {
  id: string;
  title: string | null;
  groupName: string | null;
  subjectName: string | null;
  total: number;
  done: number;
}

export interface PlanItem {
  id: string;
  week: number | null;
  content: string;
  expected_learning: string | null;
  status: "pendiente" | "en_curso" | "completado";
  position: number;
}

export async function getMyPlans(): Promise<LessonPlan[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("lesson_plans")
    .select("id, title, groups(name), subjects(name), plan_items(status)")
    .order("created_at", { ascending: false });

  if (!data) return [];
  return (data as any[]).map((p) => {
    const items = p.plan_items ?? [];
    return {
      id: p.id,
      title: p.title,
      groupName: p.groups?.name ?? null,
      subjectName: p.subjects?.name ?? null,
      total: items.length,
      done: items.filter((i: any) => i.status === "completado").length,
    };
  });
}

export async function getPlan(planId: string) {
  const supabase = await createClient();
  const { data: plan } = await supabase
    .from("lesson_plans")
    .select("id, title, groups(name), subjects(name)")
    .eq("id", planId)
    .single();
  if (!plan) return null;

  const { data: items } = await supabase
    .from("plan_items")
    .select("id, week, content, expected_learning, status, position")
    .eq("lesson_plan_id", planId)
    .order("position", { ascending: true });

  return { plan: plan as any, items: (items ?? []) as PlanItem[] };
}
