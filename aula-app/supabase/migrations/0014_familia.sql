-- ============================================================
-- AULA · 0014 — Familia: aprobación de tutor, perfil del alumno,
-- citas y anuncios.
-- ============================================================

-- ---------- APROBACIÓN DE TUTOR ----------
alter table public.student_guardians add column if not exists status text not null default 'approved';

-- Un tutor solo "guarda" a un alumno si su vínculo está aprobado
create or replace function public.guards_student(s uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1
    from public.student_guardians sg
    join public.guardians gu on gu.id = sg.guardian_id
    where sg.student_id = s and gu.profile_id = auth.uid() and sg.status = 'approved'
  )
$$;

-- Al vincular: queda PENDIENTE y se avisa a los maestros del grupo
create or replace function public.link_child(p_code text)
returns uuid language plpgsql security definer set search_path = public as $$
declare v_student uuid; v_school uuid; v_group uuid; v_guardian uuid;
        v_me uuid := auth.uid(); v_name text; v_teacher record;
begin
  if v_me is null then raise exception 'No autenticado'; end if;
  select id, school_id, group_id into v_student, v_school, v_group
    from public.students where access_code = upper(trim(p_code));
  if v_student is null then raise exception 'Código no válido'; end if;

  update public.profiles
    set role = coalesce(role, 'padre'), school_id = coalesce(school_id, v_school)
    where id = v_me;

  select id into v_guardian from public.guardians where profile_id = v_me and school_id = v_school limit 1;
  if v_guardian is null then
    insert into public.guardians (school_id, profile_id, full_name)
    values (v_school, v_me, coalesce((select full_name from public.profiles where id = v_me), 'Tutor'))
    returning id into v_guardian;
  end if;

  insert into public.student_guardians (student_id, guardian_id, is_primary, status)
  values (v_student, v_guardian, false, 'pending')
  on conflict (student_id, guardian_id) do update set status = 'pending';

  select full_name into v_name from public.profiles where id = v_me;
  if v_group is not null then
    for v_teacher in select teacher_id from public.group_teachers where group_id = v_group loop
      perform public._notify(v_teacher.teacher_id, 'solicitud',
        'Solicitud de vinculación',
        coalesce(v_name,'Un tutor') || ' solicita acceso a un alumno.', '/solicitudes');
    end loop;
  end if;
  return v_student;
end $$;

-- El maestro aprueba/rechaza una solicitud
create or replace function public.review_guardian(p_link_id uuid, p_approve boolean)
returns void language plpgsql security definer set search_path = public as $$
declare v_student uuid; v_guardian uuid; v_profile uuid;
begin
  select student_id, guardian_id into v_student, v_guardian
    from public.student_guardians where id = p_link_id;
  if v_student is null then raise exception 'No existe'; end if;
  if not public.teaches_student(v_student) and public.my_role() <> 'director' then
    raise exception 'No autorizado';
  end if;
  update public.student_guardians
    set status = case when p_approve then 'approved' else 'rejected' end
    where id = p_link_id;
  select profile_id into v_profile from public.guardians where id = v_guardian;
  perform public._notify(v_profile, 'sistema',
    case when p_approve then 'Vinculación aprobada' else 'Vinculación rechazada' end,
    case when p_approve then 'Ya puedes ver la información de tu hijo.' else 'Contacta al maestro.' end,
    '/familia');
end $$;

-- Solicitudes pendientes para el maestro
create or replace function public.pending_guardian_requests()
returns table (link_id uuid, student_name text, guardian_name text, group_name text)
language sql stable security definer set search_path = public as $$
  select sg.id, st.full_name, coalesce(gu.full_name, p.full_name, 'Tutor'), g.name
  from public.student_guardians sg
  join public.students st on st.id = sg.student_id
  join public.guardians gu on gu.id = sg.guardian_id
  left join public.profiles p on p.id = gu.profile_id
  left join public.groups g on g.id = st.group_id
  where sg.status = 'pending' and public.teaches_student(sg.student_id)
$$;

-- Vínculos del tutor actual (incluye pendientes)
create or replace function public.my_children()
returns table (student_id uuid, full_name text, group_name text, grade text, status text)
language sql stable security definer set search_path = public as $$
  select st.id, st.full_name, g.name, g.grade, sg.status
  from public.student_guardians sg
  join public.guardians gu on gu.id = sg.guardian_id
  join public.students st on st.id = sg.student_id
  left join public.groups g on g.id = st.group_id
  where gu.profile_id = auth.uid()
$$;

-- ---------- PERFIL DEL ALUMNO (completado por el tutor) ----------
create or replace function public.update_child_profile(
  p_student_id uuid, p_birthdate date,
  p_blood text, p_allergies text, p_conditions text,
  p_emergency_contact text, p_emergency_phone text,
  p_guardian_name text, p_guardian_phone text, p_relationship text
) returns void language plpgsql security definer set search_path = public as $$
declare v_guardian uuid;
begin
  if not public.guards_student(p_student_id) then raise exception 'No autorizado'; end if;

  update public.students set birthdate = coalesce(p_birthdate, birthdate) where id = p_student_id;

  insert into public.health_records (student_id, blood_type, allergies, conditions, emergency_contact, emergency_phone)
  values (p_student_id, p_blood, p_allergies, p_conditions, p_emergency_contact, p_emergency_phone)
  on conflict (student_id) do update set
    blood_type = excluded.blood_type, allergies = excluded.allergies,
    conditions = excluded.conditions, emergency_contact = excluded.emergency_contact,
    emergency_phone = excluded.emergency_phone, updated_at = now();

  select gu.id into v_guardian from public.guardians gu
    join public.student_guardians sg on sg.guardian_id = gu.id
    where sg.student_id = p_student_id and gu.profile_id = auth.uid() limit 1;
  if v_guardian is not null then
    update public.guardians set
      full_name = coalesce(nullif(trim(p_guardian_name),''), full_name),
      phone = coalesce(p_guardian_phone, phone),
      relationship = coalesce(p_relationship, relationship)
    where id = v_guardian;
  end if;
end $$;

-- Datos del perfil del alumno (para el tutor)
create or replace function public.child_profile(p_student_id uuid)
returns table (birthdate date, blood_type text, allergies text, conditions text,
               emergency_contact text, emergency_phone text)
language sql stable security definer set search_path = public as $$
  select s.birthdate, h.blood_type, h.allergies, h.conditions, h.emergency_contact, h.emergency_phone
  from public.students s
  left join public.health_records h on h.student_id = s.id
  where s.id = p_student_id and public.guards_student(p_student_id)
$$;

-- ---------- CITAS ----------
create table if not exists public.appointments (
  id           uuid primary key default gen_random_uuid(),
  school_id    uuid references public.schools(id) on delete cascade,
  requester_id uuid not null references public.profiles(id) on delete cascade,
  target_id    uuid references public.profiles(id) on delete set null,
  student_id   uuid references public.students(id) on delete set null,
  subject      text not null,
  proposed_at  timestamptz,
  status       text not null default 'solicitada'
               check (status in ('solicitada','aceptada','rechazada','realizada')),
  note         text,
  created_at   timestamptz not null default now()
);
alter table public.appointments enable row level security;
create policy appt_select on public.appointments for select using (
  requester_id = auth.uid() or target_id = auth.uid()
  or (school_id = public.my_school_id() and public.my_role() in ('director','supervisor'))
);
create policy appt_insert on public.appointments for insert with check (requester_id = auth.uid());
create policy appt_update on public.appointments for update using (
  requester_id = auth.uid() or target_id = auth.uid()
);

-- Solicitar cita a un rol (maestro/director) por escuela
create or replace function public.request_appointment(
  p_target_role text, p_subject text, p_student_id uuid, p_proposed_at timestamptz
) returns void language plpgsql security definer set search_path = public as $$
declare v_school uuid; v_target uuid; v_me uuid := auth.uid(); v_name text;
begin
  select school_id into v_school from public.profiles where id = v_me;
  if p_student_id is not null then
    select gt.teacher_id into v_target
      from public.students st join public.group_teachers gt on gt.group_id = st.group_id
      where st.id = p_student_id and gt.is_titular = true limit 1;
  end if;
  if v_target is null then
    select id into v_target from public.profiles
      where school_id = v_school and role = p_target_role limit 1;
  end if;
  select full_name into v_name from public.profiles where id = v_me;
  insert into public.appointments (school_id, requester_id, target_id, student_id, subject, proposed_at)
  values (v_school, v_me, v_target, p_student_id, p_subject, p_proposed_at);
  perform public._notify(v_target, 'cita', 'Solicitud de cita',
    coalesce(v_name,'Alguien') || ': ' || p_subject, '/citas');
end $$;

create or replace function public.respond_appointment(p_id uuid, p_status text)
returns void language plpgsql security definer set search_path = public as $$
declare v_req uuid; v_subject text;
begin
  select requester_id, subject into v_req, v_subject from public.appointments where id = p_id;
  if not (target_id_is_me(p_id)) then raise exception 'No autorizado'; end if;
  update public.appointments set status = p_status where id = p_id;
  perform public._notify(v_req, 'cita',
    'Cita ' || p_status, v_subject, '/citas');
end $$;

create or replace function public.target_id_is_me(p_id uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists(select 1 from public.appointments where id = p_id and target_id = auth.uid())
$$;

-- ---------- ANUNCIOS ----------
create table if not exists public.announcements (
  id         uuid primary key default gen_random_uuid(),
  school_id  uuid not null references public.schools(id) on delete cascade,
  group_id   uuid references public.groups(id) on delete cascade,  -- null = toda la escuela
  author_id  uuid references public.profiles(id) on delete set null,
  title      text not null,
  body       text,
  event_date date,
  kind       text not null default 'aviso',  -- aviso, evento, material, suspension
  created_at timestamptz not null default now()
);
alter table public.announcements enable row level security;
create policy announcements_select on public.announcements for select using (
  school_id = public.my_school_id() and (
    public.my_role() in ('maestro','director','supervisor')
    or group_id is null
    or exists (select 1 from public.students st
               where st.group_id = announcements.group_id and public.guards_student(st.id))
  )
);
create policy announcements_write on public.announcements for all using (
  public.my_role() in ('maestro','director')
) with check (
  school_id = public.my_school_id() and public.my_role() in ('maestro','director')
);
