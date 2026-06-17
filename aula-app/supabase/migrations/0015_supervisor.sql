-- ============================================================
-- AULA · 0015 — Supervisor: seguimiento, actividad docente,
-- detalle por escuela/grado y anotaciones.
-- ============================================================

-- ---------- ANOTACIONES DE SEGUIMIENTO ----------
create table if not exists public.supervisor_notes (
  id           uuid primary key default gen_random_uuid(),
  supervisor_id uuid not null references public.profiles(id) on delete cascade,
  school_id    uuid references public.schools(id) on delete cascade,
  target_type  text not null,             -- maestro, director, escuela
  target_id    uuid,                       -- profile_id si aplica
  text         text not null,
  created_at   timestamptz not null default now()
);
alter table public.supervisor_notes enable row level security;
create policy supnotes_select on public.supervisor_notes for select using (
  supervisor_id = auth.uid()
  or (school_id = public.my_school_id() and public.my_role() = 'director')
);
create policy supnotes_write on public.supervisor_notes for all using (
  supervisor_id = auth.uid() and public.my_role() = 'supervisor'
) with check (
  supervisor_id = auth.uid() and public.my_role() = 'supervisor'
);

-- ---------- DETALLE POR ESCUELA (currículo, asistencia, docentes) ----------
create or replace function public.supervisor_school_groups(p_school_id uuid)
returns table (
  group_id uuid, group_name text, grade text, students bigint,
  curriculum_done bigint, curriculum_total bigint, attendance_today bigint
)
language sql stable security definer set search_path = public as $$
  select
    g.id, g.name, g.grade,
    (select count(*) from public.students st where st.group_id = g.id),
    (select count(*) from public.content_coverage cc where cc.group_id = g.id and cc.covered),
    (select count(*) from public.curriculum_contents c where c.grade = g.grade),
    (select count(*) from public.attendance a where a.group_id = g.id and a.date = current_date)
  from public.groups g
  where g.school_id = p_school_id
    and ( exists (select 1 from public.schools s where s.id = p_school_id and s.supervisor_id = auth.uid())
          or (p_school_id = (select school_id from public.profiles where id = auth.uid())
              and (select role from public.profiles where id = auth.uid()) = 'supervisor') )
  order by g.grade, g.name;
$$;

-- ---------- ACTIVIDAD DOCENTE ----------
create or replace function public.supervisor_teachers(p_school_id uuid)
returns table (
  teacher_id uuid, full_name text, last_active_at timestamptz, attendance_today bigint
)
language sql stable security definer set search_path = public as $$
  select
    p.id, p.full_name, p.last_active_at,
    (select count(*) from public.attendance a where a.recorded_by = p.id and a.date = current_date)
  from public.profiles p
  where p.school_id = p_school_id and p.role = 'maestro'
    and ( exists (select 1 from public.schools s where s.id = p_school_id and s.supervisor_id = auth.uid())
          or (p_school_id = (select school_id from public.profiles where id = auth.uid())
              and (select role from public.profiles where id = auth.uid()) = 'supervisor') )
  order by p.full_name;
$$;
