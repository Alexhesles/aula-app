-- ============================================================
-- AULA · Migración 0005 — Onboarding y gestión self-serve
-- Permite que un maestro se configure solo, sin SQL.
-- Usa funciones SECURITY DEFINER para operaciones de setup.
-- ============================================================

-- ----------------------------------------------------------------
-- onboard_teacher: crea escuela + grupo y asigna al maestro como titular
-- ----------------------------------------------------------------
create or replace function public.onboard_teacher(
  p_full_name   text,
  p_school_name text,
  p_group_name  text
) returns uuid
language plpgsql security definer set search_path = public as $$
declare
  v_school uuid;
  v_group  uuid;
  v_me     uuid := auth.uid();
begin
  if v_me is null then
    raise exception 'No autenticado';
  end if;

  insert into public.schools (name, type)
  values (coalesce(nullif(trim(p_school_name), ''), 'Mi escuela'), 'privada')
  returning id into v_school;

  update public.profiles
  set role = 'maestro',
      school_id = v_school,
      full_name = coalesce(nullif(trim(p_full_name), ''), full_name)
  where id = v_me;

  insert into public.groups (school_id, name)
  values (coalesce(nullif(trim(p_group_name), ''), 'Mi grupo'), v_school)
  returning id into v_group;

  insert into public.group_teachers (group_id, teacher_id, is_titular)
  values (v_group, v_me, true);

  return v_group;
end $$;

-- ----------------------------------------------------------------
-- create_group: un maestro ya configurado crea un grupo adicional
-- ----------------------------------------------------------------
create or replace function public.create_group(
  p_name  text,
  p_grade text default null,
  p_room  text default null
) returns uuid
language plpgsql security definer set search_path = public as $$
declare
  v_school uuid;
  v_group  uuid;
  v_me     uuid := auth.uid();
begin
  if v_me is null then
    raise exception 'No autenticado';
  end if;

  select school_id into v_school from public.profiles where id = v_me;
  if v_school is null then
    raise exception 'Tu cuenta no tiene escuela. Completa el onboarding primero.';
  end if;

  insert into public.groups (school_id, name, grade, room)
  values (v_school, coalesce(nullif(trim(p_name), ''), 'Nuevo grupo'), p_grade, p_room)
  returning id into v_group;

  insert into public.group_teachers (group_id, teacher_id, is_titular)
  values (v_group, v_me, true);

  return v_group;
end $$;

-- ----------------------------------------------------------------
-- add_students: agrega varios alumnos de golpe (lista de nombres)
-- ----------------------------------------------------------------
create or replace function public.add_students(
  p_group_id uuid,
  p_names    text[]
) returns int
language plpgsql security definer set search_path = public as $$
declare
  v_school uuid;
  v_count  int := 0;
  v_name   text;
begin
  if not public.teaches_group(p_group_id) then
    raise exception 'No tienes acceso a este grupo';
  end if;

  select school_id into v_school from public.groups where id = p_group_id;

  foreach v_name in array p_names loop
    if trim(v_name) <> '' then
      insert into public.students (school_id, group_id, full_name)
      values (v_school, p_group_id, trim(v_name));
      v_count := v_count + 1;
    end if;
  end loop;

  return v_count;
end $$;

-- ----------------------------------------------------------------
-- Políticas para que el maestro edite/elimine a sus alumnos
-- (las altas van por add_students; bajas y cambios por el cliente)
-- ----------------------------------------------------------------
create policy students_update_teacher on public.students
  for update using (public.teaches_student(id))
  with check (school_id = public.my_school_id());

create policy students_delete_teacher on public.students
  for delete using (public.teaches_student(id));

-- Permite que un maestro actualice el nombre/datos de su grupo
create policy groups_update_teacher on public.groups
  for update using (public.teaches_group(id))
  with check (public.teaches_group(id));
