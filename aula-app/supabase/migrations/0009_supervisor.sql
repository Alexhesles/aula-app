-- ============================================================
-- AULA · Migración 0009 — Supervisor de zona
-- Un supervisor observa varias escuelas. Vista agregada vía
-- RPC SECURITY DEFINER (evita complejidad de RLS multi-escuela).
-- ============================================================

alter table public.schools
  add column if not exists supervisor_id uuid references public.profiles(id) on delete set null;

create index if not exists schools_supervisor_idx on public.schools (supervisor_id);

-- Resumen por escuela para el supervisor
create or replace function public.supervisor_overview()
returns table (
  school_id        uuid,
  school_name      text,
  groups_count     bigint,
  students_count   bigint,
  attendance_today bigint,
  incidents_week   bigint
)
language sql stable security definer set search_path = public as $$
  select
    s.id,
    s.name,
    (select count(*) from public.groups g where g.school_id = s.id),
    (select count(*) from public.students st where st.school_id = s.id),
    (select count(*) from public.attendance a
        join public.groups g on g.id = a.group_id
       where g.school_id = s.id and a.date = current_date),
    (select count(*) from public.log_entries le
       where le.school_id = s.id and le.type = 'incidente'
         and le.created_at > now() - interval '7 days')
  from public.schools s
  where s.supervisor_id = auth.uid()
     or ( s.id = (select school_id from public.profiles where id = auth.uid())
          and (select role from public.profiles where id = auth.uid()) = 'supervisor' )
  order by s.name;
$$;
