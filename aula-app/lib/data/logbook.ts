import { createClient } from "@/lib/supabase/server";

export interface LogEntry {
  id: string;
  type: "incidente" | "logro" | "academico";
  text: string;
  created_at: string;
  studentName: string | null;
  groupName: string | null;
  media: string[]; // URLs firmadas
}

export async function getLogEntries(): Promise<LogEntry[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("log_entries")
    .select("id, type, text, media_urls, created_at, students(full_name), groups(name)")
    .order("created_at", { ascending: false })
    .limit(50);

  if (error || !data) return [];

  const entries: LogEntry[] = [];
  for (const row of data as any[]) {
    const media: string[] = [];
    for (const path of row.media_urls ?? []) {
      const { data: signed } = await supabase.storage
        .from("bitacora")
        .createSignedUrl(path, 3600);
      if (signed?.signedUrl) media.push(signed.signedUrl);
    }
    entries.push({
      id: row.id,
      type: row.type,
      text: row.text,
      created_at: row.created_at,
      studentName: row.students?.full_name ?? null,
      groupName: row.groups?.name ?? null,
      media,
    });
  }
  return entries;
}
