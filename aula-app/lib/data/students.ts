import { createClient } from "@/lib/supabase/server";

export interface Student {
  id: string;
  full_name: string;
  photo_url: string | null;
  access_code: string | null;
}

/** Alumnos de un grupo, ordenados por nombre. */
export async function getGroupStudents(groupId: string): Promise<Student[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("students")
    .select("id, full_name, photo_url, access_code")
    .eq("group_id", groupId)
    .order("full_name", { ascending: true });

  if (error || !data) return [];
  return data as Student[];
}
