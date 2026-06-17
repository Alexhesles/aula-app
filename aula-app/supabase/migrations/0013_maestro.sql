-- ============================================================
-- AULA · 0013 — Maestro: tareas/cumplimiento + anotaciones de alumno
-- ============================================================

-- ---------- TAREAS / TRABAJOS ----------
create table if not exists public.assignments (
  id         uuid primary key default gen_random_uuid(),
  school_id  uuid not null references public.schools(id) on delete cascade,
  group_id   uuid not null references public.groups(id) on delete cascade,
  title      text not null,
  subject    text,
  due_date   date,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now()
);
create table if not exists public.assignment_status (
  id            uuid primary key default gen_random_uuid(),
  assignment_id uuid not null references public.assignments(id) on delete cascade,
  student_id    uuid not null references public.students(id) on delete cascade,
  status        text not null default 'pendiente'
                check (status in ('entregado','no_entregado','parcial','pendiente')),
  unique (assignment_id, student_id)
);

alter table public.assignments enable row level security;
alter table public.assignment_status enable row level security;

create policy assignments_select on public.assignments for select using (
  public.teaches_group(group_id)
  or public.my_role() in ('director','supervisor')
  or exists (select 1 from public.students st
             where st.group_id = assignments.group_id and public.guards_student(st.id))
);
create policy assignments_write on public.assignments for all using (
  public.teaches_group(group_id) or public.my_role() = 'director'
) with check (
  school_id = public.my_school_id() and (public.teaches_group(group_id) or public.my_role() = 'director')
);

create policy astatus_select on public.assignment_status for select using (
  exists (select 1 from public.assignments a where a.id = assignment_id
          and (public.teaches_group(a.group_id) or public.my_role() in ('director','supervisor')))
  or public.guards_student(student_id)
);
create policy astatus_write on public.assignment_status for all using (
  exists (select 1 from public.assignments a where a.id = assignment_id
          and (public.teaches_group(a.group_id) or public.my_role() = 'director'))
) with check (
  exists (select 1 from public.assignments a where a.id = assignment_id
          and (public.teaches_group(a.group_id) or public.my_role() = 'director'))
);

-- ---------- ANOTACIONES DE DESEMPEÑO ----------
create table if not exists public.student_notes (
  id         uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.students(id) on delete cascade,
  author_id  uuid references public.profiles(id) on delete set null,
  text       text not null,
  category   text default 'general',  -- academico, conducta, general
  visible_to_guardian boolean not null default false,
  created_at timestamptz not null default now()
);
alter table public.student_notes enable row level security;

create policy student_notes_select on public.student_notes for select using (
  public.teaches_student(student_id)
  or public.my_role() in ('director','supervisor')
  or (visible_to_guardian and public.guards_student(student_id))
);
create policy student_notes_write on public.student_notes for all using (
  public.teaches_student(student_id) or public.my_role() = 'director'
) with check (
  public.teaches_student(student_id) or public.my_role() = 'director'
);
