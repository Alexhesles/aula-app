-- ============================================================
-- AULA · Migración 0007 — Todos los perfiles completos
-- Padres (vinculación por código), Director y Supervisor
-- (onboarding sin SQL), y Zonas escolares.
-- ============================================================

-- ----------------------------------------------------------------
-- 1) PADRES — código de vinculación por alumno
-- ----------------------------------------------------------------
alter table public.students add column if not exists join_code text;
update public.students
  set join_code = upper(substr(md5(gen_random_uuid()::text), 1, 6))
  where join_code is null;
alter table public.students
  alter column join_code set default upper(substr(md5(gen_random_uuid()::text), 1, 6));

-- Un padre/madre vincula a su hijo con el código que le da la escuela
create or replace function public.link_child(p_code text)
returns uuid
language plpgsql security definer set search_path = public as $$
declare
  v_me       uuid := auth.uid();
  v_student  uuid;
  v_school   uuid;
  v_guardian uuid;
  v_email    text;
  v_name     text;
begin
  if v_me is null then raise exception 'No autenticado'; end if;

  select id, school_id into v_student, v_school
  from public.students
  where upper(join_code) = upper(trim(p_code))
  limit 1;

  if v_student is null then
    raise exception 'Código no válido. Revisa con la escuela.';
  end if;

  select email into v_email from auth.users where id = v_me;
  select full_name into v_name from public.profiles where id = v_me;

  select id into v_guardian
  from public.guardians
  where profile_id = v_me and school_id = v_school
  limit 1;

  if v_guardian is null then
    insert into public.guardians (school_id, profile_id, full_name, email, relationship)
    values (v_school, v_me, coalesce(v_name, 'Tutor'), v_email, 'tutor')
    returning id into v_guardian;
  end if;

  insert into public.student_guardians (student_id, guardian_id, is_primary)
  values (v_student, v_guardian, true)
  on conflict (student_id, guardian_id) do nothing;

  update public.profiles
  set role = 'padre',
      school_id = coalesce(school_id, v_school)
  where id = v_me;

  return v_student;
end $$;

-- ----------------------------------------------------------------
-- 2) DIRECTOR — onboarding self-serve
-- ----------------------------------------------------------------
create or replace function public.onboard_director(
  p_full_name   text,
  p_school_name text
) returns uuid
language plpgsql security definer set search_path = public as $$
declare
  v_me     uuid := auth.uid();
  v_school uuid;
begin
  if v_me is null then raise exception 'No autenticado'; end if;

  insert into public.schools (name, type)
  values (coalesce(nullif(trim(p_school_name), ''), 'Mi escuela'), 'privada')
  returning id into v_school;

  update public.profiles
  set role = 'director',
      school_id = v_school,
      full_name = coalesce(nullif(trim(p_full_name), ''), full_name)
  where id = v_me;

  return v_school;
end $$;

-- ----------------------------------------------------------------
-- 3) ZONAS ESCOLARES + SUPERVISOR
-- ----------------------------------------------------------------
create table if not exists public.zones (
  id            uuid primary key default gen_random_uuid(),
  name          text not null,
  supervisor_id uuid references public.profiles(id) on delete set null,
  join_code     text not null default upper(substr(md5(gen_random_uuid()::text), 1, 6)),
  created_at    timestamptz not null default now()
);

alter table public.schools add column if not exists zone_id uuid references public.zones(id) on delete set null;

-- ¿El usuario supervisa esta escuela? (vía su zona)
create or replace function public.supervises_school(s uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1
    from public.zones z
    join public.schools sc on sc.zone_id = z.id
    where sc.id = s and z.supervisor_id = auth.uid()
  )
$$;

-- Supervisor crea su zona
create or replace function public.onboard_supervisor(
  p_full_name text,
  p_zone_name text
) returns uuid
language plpgsql security definer set search_path = public as $$
declare
  v_me   uuid := auth.uid();
  v_zone uuid;
begin
  if v_me is null then raise exception 'No autenticado'; end if;

  insert into public.zones (name, supervisor_id)
  values (coalesce(nullif(trim(p_zone_name), ''), 'Mi zona'), v_me)
  returning id into v_zone;

  update public.profiles
  set role = 'supervisor',
      full_name = coalesce(nullif(trim(p_full_name), ''), full_name)
  where id = v_me;

  return v_zone;
end $$;

-- Un director une su escuela a una zona con el código del supervisor
create or replace function public.attach_school_to_zone(p_code text)
returns uuid
language plpgsql security definer set search_path = public as $$
declare
  v_zone   uuid;
  v_school uuid := public.my_school_id();
begin
  if public.my_role() <> 'director' then
    raise exception 'Solo el director puede unir la escuela a una zona';
  end if;
  if v_school is null then raise exception 'No tienes escuela'; end if;

  select id into v_zone from public.zones where upper(join_code) = upper(trim(p_code)) limit 1;
  if v_zone is null then raise exception 'Código de zona no válido'; end if;

  update public.schools set zone_id = v_zone where id = v_school;
  return v_zone;
end $$;

-- RLS para zonas
alter table public.zones enable row level security;

create policy zones_select on public.zones
  for select using (
    supervisor_id = auth.uid()
    or id = (select zone_id from public.schools where id = public.my_school_id())
  );

create policy zones_update_owner on public.zones
  for update using (supervisor_id = auth.uid())
  with check (supervisor_id = auth.uid());

-- Políticas de lectura para el supervisor (a través de su zona)
create policy schools_select_supervisor on public.schools
  for select using (public.supervises_school(id));

create policy groups_select_supervisor on public.groups
  for select using (public.supervises_school(school_id));

create policy students_select_supervisor on public.students
  for select using (public.supervises_school(school_id));

create policy attendance_select_supervisor on public.attendance
  for select using (
    exists (select 1 from public.groups g where g.id = attendance.group_id and public.supervises_school(g.school_id))
  );

create policy log_select_supervisor on public.log_entries
  for select using (public.supervises_school(school_id) and visible_to_director);
