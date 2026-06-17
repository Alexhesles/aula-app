-- ============================================================
-- AULA · Migración 0008 — Familias (padres/tutores)
-- Vinculación hijo↔tutor por código + consentimientos (firmas).
-- El RLS de students/attendance/log_entries/consents ya permite
-- al tutor (guards_student); aquí agregamos el enlace self-serve.
-- ============================================================

-- Código de acceso por alumno (para que el tutor se vincule)
alter table public.students add column if not exists access_code text;
create unique index if not exists students_access_code_key
  on public.students (access_code);

-- Generar código automáticamente al crear alumno
create or replace function public.gen_student_code()
returns trigger language plpgsql as $$
declare v_code text; v_try int := 0;
begin
  if new.access_code is null then
    loop
      v_code := upper(substr(md5(random()::text || clock_timestamp()::text), 1, 6));
      exit when not exists (select 1 from public.students where access_code = v_code);
      v_try := v_try + 1;
      if v_try > 10 then exit; end if;
    end loop;
    new.access_code := v_code;
  end if;
  return new;
end $$;

drop trigger if exists students_code on public.students;
create trigger students_code
  before insert on public.students
  for each row execute function public.gen_student_code();

-- Backfill de códigos para alumnos existentes
update public.students
set access_code = upper(substr(md5(random()::text || id::text), 1, 6))
where access_code is null;

-- RPC: el tutor se vincula a un alumno con el código
create or replace function public.link_child(p_code text)
returns uuid
language plpgsql security definer set search_path = public as $$
declare v_student uuid; v_school uuid; v_guardian uuid; v_me uuid := auth.uid();
begin
  if v_me is null then raise exception 'No autenticado'; end if;

  select id, school_id into v_student, v_school
    from public.students where access_code = upper(trim(p_code));
  if v_student is null then raise exception 'Código no válido'; end if;

  update public.profiles
    set role = coalesce(role, 'padre'),
        school_id = coalesce(school_id, v_school)
    where id = v_me;

  select id into v_guardian
    from public.guardians where profile_id = v_me and school_id = v_school limit 1;
  if v_guardian is null then
    insert into public.guardians (school_id, profile_id, full_name)
    values (v_school, v_me, coalesce((select full_name from public.profiles where id = v_me), 'Tutor'))
    returning id into v_guardian;
  end if;

  insert into public.student_guardians (student_id, guardian_id, is_primary)
  values (v_student, v_guardian, false)
  on conflict (student_id, guardian_id) do nothing;

  return v_student;
end $$;

-- RPC: registrar/actualizar un consentimiento (firma) del tutor
create or replace function public.set_consent(
  p_student_id uuid,
  p_type       text,
  p_granted    boolean
) returns void
language plpgsql security definer set search_path = public as $$
declare v_guardian uuid; v_me uuid := auth.uid();
begin
  if not public.guards_student(p_student_id) then
    raise exception 'No autorizado';
  end if;
  select gu.id into v_guardian
    from public.guardians gu
    join public.student_guardians sg on sg.guardian_id = gu.id
   where sg.student_id = p_student_id and gu.profile_id = v_me
   limit 1;

  insert into public.consents (student_id, guardian_id, type, granted, granted_at)
  values (p_student_id, v_guardian, p_type, p_granted, case when p_granted then now() else null end)
  on conflict (student_id, guardian_id, type)
  do update set granted = excluded.granted, granted_at = excluded.granted_at;
end $$;
