import { createClient } from "@/lib/supabase/server";

export interface CalendarEvent {
  id: string;
  date: string;
  end_date: string | null;
  title: string;
  kind: string;
}

export async function getCalendar(): Promise<CalendarEvent[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("calendar_events")
    .select("id, date, end_date, title, kind")
    .order("date", { ascending: true });
  return (data as CalendarEvent[]) ?? [];
}

export async function getUpcomingEvents(limit = 4): Promise<CalendarEvent[]> {
  const supabase = await createClient();
  const today = new Date().toLocaleDateString("en-CA");
  const { data } = await supabase
    .from("calendar_events")
    .select("id, date, end_date, title, kind")
    .gte("date", today)
    .order("date", { ascending: true })
    .limit(limit);
  return (data as CalendarEvent[]) ?? [];
}
