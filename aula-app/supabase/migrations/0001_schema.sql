-- ============================================================
-- AULA · Migración 0001 — Esquema base
-- Pegar completo en Supabase → SQL Editor → Run
-- ============================================================

-- gen_random_uuid() ya está disponible en Supabase.

-- ----------------------------------------------------------------
-- IDENTIDAD Y ESTRUCTURA
-- ----------------------------------------------------------------

create table public.schools (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  type        text not null default 'privada' check (type in ('publica','privada')),
  cct         text,                       -- Clave de Centro de Trabajo (SEP)
  cycle       text,                       -- p.ej. '2025-2026'
  address     text,
  settings    jsonb not null default '{}'::jsonb,
  created_at  timestamptz not null default now()
);

create table public.profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  school_id   uuid references public.schools(id) on delete set null,
  role        text check (role in ('maestro','director','padre','supervisor')),
  full_name   text,
  avatar_url  text,
  phone       text,
  locale      text not null default 'es-MX',
  created_at  timestamptz not null default now()
);

create table public.subjects (
  id          uuid primary key default gen_random_uuid(),
  school_id   uuid references public.schools(id) on delete cascade,
  name        text not null,
  grade       text,                       -- nivel/grado opcional
  is_special  boolean not null default false  -- inglés, computación, música...
);

create table public.groups (
  id          uuid primary key default gen_random_uuid(),
  school_id   uuid not null references public.schools(id) on delete cascade,
  name        text not null,              -- '3°A'
  grade       text,                       -- '3'
  cycle       text,
  room        text,
  created_at  timestamptz not null default now()
);

-- Relación maestro ↔ grupo (mixta: titular + especiales)
create table public.group_teachers (
  id          uuid primary key default gen_random_uuid(),
  group_id    uuid not null references public.groups(id) on delete cascade,
  teacher_id  uuid not null references public.profiles(id) on delete cascade,
  subject_id  uuid references public.subjects(id) on delete set null,
  is_titular  boolean not null default false,
  created_at  timestamptz not null default now(),
  unique (group_id, teacher_id, subject_id)
);

-- ----------------------------------------------------------------
-- ALUMNOS Y TUTORES
-- ----------------------------------------------------------------

create table public.students (
  id          uuid primary key default gen_random_uuid(),
  school_id   uuid not null references public.schools(id) on delete cascade,
  group_id    uuid references public.groups(id) on delete set null,
  full_name   text not null,
  curp        text,                       -- opcional, dato sensible
  birthdate   date,
  photo_url   text,
  enrolled_at timestamptz not null default now()
);

-- Tutor (puede o no tener cuenta en la app → profile_id nullable)
create table public.guardians (
  id          uuid primary key default gen_random_uuid(),
  school_id   uuid not null references public.schools(id) on delete cascade,
  profile_id  uuid references public.profiles(id) on delete set null,
  full_name   text not null,
  phone       text,
  email       text,
  relationship text,                      -- 'madre','padre','tutor'
  created_at  timestamptz not null default now()
);

create table public.student_guardians (
  id          uuid primary key default gen_random_uuid(),
  student_id  uuid not null references public.students(id) on delete cascade,
  guardian_id uuid not null references public.guardians(id) on delete cascade,
  is_primary  boolean not null default false,
  unique (student_id, guardian_id)
);

-- Ficha de salud (sensible — acceso auditado)
create table public.health_records (
  id              uuid primary key default gen_random_uuid(),
  student_id      uuid not null unique references public.students(id) on delete cascade,
  blood_type      text,
  allergies       text,
  conditions      text,
  emergency_contact text,
  emergency_phone text,
  notes           text,
  updated_at      timestamptz not null default now()
);

-- ----------------------------------------------------------------
-- OPERACIÓN DIARIA (MVP)
-- ----------------------------------------------------------------

create table public.attendance (
  id           uuid primary key default gen_random_uuid(),
  student_id   uuid not null references public.students(id) on delete cascade,
  group_id     uuid not null references public.groups(id) on delete cascade,
  date         date not null default current_date,
  status       text not null check (status in ('presente','tardanza','falta')),
  justification text,
  recorded_by  uuid references public.profiles(id) on delete set null,
  recorded_at  timestamptz not null default now(),
  unique (student_id, date)
);

create table public.log_entries (
  id           uuid primary key default gen_random_uuid(),
  school_id    uuid not null references public.schools(id) on delete cascade,
  author_id    uuid references public.profiles(id) on delete set null,
  student_id   uuid references public.students(id) on delete cascade,
  group_id     uuid references public.groups(id) on delete cascade,
  type         text not null default 'academico' check (type in ('incidente','logro','academico')),
  text         text not null,
  media_urls   text[] not null default '{}',
  visible_to_director boolean not null default true,
  visible_to_guardian boolean not null default false,
  created_at   timestamptz not null default now()
);

-- ----------------------------------------------------------------
-- PLAN SEP
-- ----------------------------------------------------------------

create table public.lesson_plans (
  id          uuid primary key default gen_random_uuid(),
  school_id   uuid not null references public.schools(id) on delete cascade,
  group_id    uuid not null references public.groups(id) on delete cascade,
  subject_id  uuid references public.subjects(id) on delete set null,
  cycle       text,
  title       text,
  created_by  uuid references public.profiles(id) on delete set null,
  created_at  timestamptz not null default now()
);

create table public.plan_items (
  id              uuid primary key default gen_random_uuid(),
  lesson_plan_id  uuid not null references public.lesson_plans(id) on delete cascade,
  week            int,
  content         text not null,
  expected_learning text,
  status          text not null default 'pendiente' check (status in ('pendiente','en_curso','completado')),
  position        int not null default 0
);

-- ----------------------------------------------------------------
-- PRIVACIDAD Y LEGAL (cimiento desde Fase 1)
-- ----------------------------------------------------------------

create table public.consents (
  id              uuid primary key default gen_random_uuid(),
  student_id      uuid not null references public.students(id) on delete cascade,
  guardian_id     uuid not null references public.guardians(id) on delete cascade,
  type            text not null check (type in ('datos','fotos','salud','comunicacion')),
  granted         boolean not null default false,
  granted_at      timestamptz,
  document_version text,
  created_at      timestamptz not null default now(),
  unique (student_id, guardian_id, type)
);

create table public.audit_log (
  id           uuid primary key default gen_random_uuid(),
  actor_id     uuid references public.profiles(id) on delete set null,
  action       text not null,             -- 'view','export','update'
  entity_type  text not null,             -- 'health_record','student'...
  entity_id    uuid,
  accessed_at  timestamptz not null default now()
);

create table public.privacy_documents (
  id           uuid primary key default gen_random_uuid(),
  type         text not null check (type in ('integral','simplificado','terminos')),
  version      text not null,
  content      text,
  published_at timestamptz not null default now()
);

-- ----------------------------------------------------------------
-- ÍNDICES
-- ----------------------------------------------------------------
create index idx_profiles_school     on public.profiles(school_id);
create index idx_groups_school       on public.groups(school_id);
create index idx_group_teachers_grp  on public.group_teachers(group_id);
create index idx_group_teachers_tch  on public.group_teachers(teacher_id);
create index idx_students_group      on public.students(group_id);
create index idx_students_school     on public.students(school_id);
create index idx_guardians_profile   on public.guardians(profile_id);
create index idx_sg_student          on public.student_guardians(student_id);
create index idx_sg_guardian         on public.student_guardians(guardian_id);
create index idx_attendance_group    on public.attendance(group_id, date);
create index idx_attendance_student  on public.attendance(student_id);
create index idx_log_student         on public.log_entries(student_id);
create index idx_log_school          on public.log_entries(school_id);
create index idx_plan_items_plan     on public.plan_items(lesson_plan_id);

-- ----------------------------------------------------------------
-- FUNCIONES AUXILIARES (SECURITY DEFINER — evitan recursión de RLS)
-- ----------------------------------------------------------------

create or replace function public.my_role()
returns text language sql stable security definer set search_path = public as $$
  select role from public.profiles where id = auth.uid()
$$;

create or replace function public.my_school_id()
returns uuid language sql stable security definer set search_path = public as $$
  select school_id from public.profiles where id = auth.uid()
$$;

create or replace function public.teaches_group(g uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.group_teachers gt
    where gt.group_id = g and gt.teacher_id = auth.uid()
  )
$$;

create or replace function public.teaches_student(s uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.students st
    join public.group_teachers gt on gt.group_id = st.group_id
    where st.id = s and gt.teacher_id = auth.uid()
  )
$$;

create or replace function public.guards_student(s uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1
    from public.student_guardians sg
    join public.guardians gu on gu.id = sg.guardian_id
    where sg.student_id = s and gu.profile_id = auth.uid()
  )
$$;

-- ----------------------------------------------------------------
-- TRIGGER: crear profile al registrarse un usuario
-- ----------------------------------------------------------------

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, full_name, avatar_url)
  values (
    new.id,
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'avatar_url'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
