-- ============================================================
-- AULA · Migración 0002 — Row Level Security (RLS)
-- Activa RLS en TODAS las tablas y define las políticas.
-- Regla base: nadie ve lo que no le toca.
-- ============================================================

alter table public.schools           enable row level security;
alter table public.profiles          enable row level security;
alter table public.subjects          enable row level security;
alter table public.groups            enable row level security;
alter table public.group_teachers    enable row level security;
alter table public.students          enable row level security;
alter table public.guardians         enable row level security;
alter table public.student_guardians enable row level security;
alter table public.health_records    enable row level security;
alter table public.attendance        enable row level security;
alter table public.log_entries       enable row level security;
alter table public.lesson_plans      enable row level security;
alter table public.plan_items        enable row level security;
alter table public.consents          enable row level security;
alter table public.audit_log         enable row level security;
alter table public.privacy_documents enable row level security;

-- ----------------------------------------------------------------
-- SCHOOLS
-- ----------------------------------------------------------------
create policy schools_select on public.schools
  for select using (id = public.my_school_id());
create policy schools_update on public.schools
  for update using (id = public.my_school_id() and public.my_role() = 'director');

-- ----------------------------------------------------------------
-- PROFILES
-- ----------------------------------------------------------------
create policy profiles_select_self on public.profiles
  for select using (id = auth.uid());
create policy profiles_select_school_director on public.profiles
  for select using (school_id = public.my_school_id() and public.my_role() in ('director','supervisor'));
create policy profiles_update_self on public.profiles
  for update using (id = auth.uid());

-- ----------------------------------------------------------------
-- SUBJECTS (catálogo escolar — lectura para la escuela)
-- ----------------------------------------------------------------
create policy subjects_select on public.subjects
  for select using (school_id = public.my_school_id());
create policy subjects_write_director on public.subjects
  for all using (school_id = public.my_school_id() and public.my_role() = 'director')
  with check (school_id = public.my_school_id() and public.my_role() = 'director');

-- ----------------------------------------------------------------
-- GROUPS
-- ----------------------------------------------------------------
create policy groups_select on public.groups
  for select using (
    school_id = public.my_school_id() and (
      public.my_role() in ('director','supervisor')
      or public.teaches_group(id)
    )
  );
create policy groups_write_director on public.groups
  for all using (school_id = public.my_school_id() and public.my_role() = 'director')
  with check (school_id = public.my_school_id() and public.my_role() = 'director');

-- ----------------------------------------------------------------
-- GROUP_TEACHERS
-- ----------------------------------------------------------------
create policy group_teachers_select on public.group_teachers
  for select using (
    teacher_id = auth.uid()
    or public.my_role() in ('director','supervisor')
  );
create policy group_teachers_write_director on public.group_teachers
  for all using (public.my_role() = 'director')
  with check (public.my_role() = 'director');

-- ----------------------------------------------------------------
-- STUDENTS
-- ----------------------------------------------------------------
create policy students_select on public.students
  for select using (
    school_id = public.my_school_id() and (
      public.my_role() in ('director','supervisor')
      or public.teaches_student(id)
      or public.guards_student(id)
    )
  );
create policy students_write_director on public.students
  for all using (school_id = public.my_school_id() and public.my_role() = 'director')
  with check (school_id = public.my_school_id() and public.my_role() = 'director');

-- ----------------------------------------------------------------
-- GUARDIANS
-- ----------------------------------------------------------------
create policy guardians_select on public.guardians
  for select using (
    profile_id = auth.uid()
    or (school_id = public.my_school_id() and public.my_role() = 'director')
  );
create policy guardians_write_director on public.guardians
  for all using (school_id = public.my_school_id() and public.my_role() = 'director')
  with check (school_id = public.my_school_id() and public.my_role() = 'director');

-- ----------------------------------------------------------------
-- STUDENT_GUARDIANS
-- ----------------------------------------------------------------
create policy student_guardians_select on public.student_guardians
  for select using (
    public.guards_student(student_id)
    or public.teaches_student(student_id)
    or public.my_role() = 'director'
  );
create policy student_guardians_write_director on public.student_guardians
  for all using (public.my_role() = 'director')
  with check (public.my_role() = 'director');

-- ----------------------------------------------------------------
-- HEALTH_RECORDS (sensible)
-- ----------------------------------------------------------------
create policy health_select on public.health_records
  for select using (
    public.my_role() = 'director'
    or public.teaches_student(student_id)
    or public.guards_student(student_id)
  );
create policy health_write on public.health_records
  for all using (
    public.my_role() = 'director' or public.guards_student(student_id)
  )
  with check (
    public.my_role() = 'director' or public.guards_student(student_id)
  );

-- ----------------------------------------------------------------
-- ATTENDANCE
-- ----------------------------------------------------------------
create policy attendance_select on public.attendance
  for select using (
    public.teaches_group(group_id)
    or public.guards_student(student_id)
    or public.my_role() in ('director','supervisor')
  );
create policy attendance_write_teacher on public.attendance
  for all using (public.teaches_group(group_id))
  with check (public.teaches_group(group_id));

-- ----------------------------------------------------------------
-- LOG_ENTRIES
-- ----------------------------------------------------------------
create policy log_select on public.log_entries
  for select using (
    author_id = auth.uid()
    or (student_id is not null and public.teaches_student(student_id))
    or (group_id is not null and public.teaches_group(group_id))
    or (visible_to_director and school_id = public.my_school_id() and public.my_role() = 'director')
    or (visible_to_guardian and student_id is not null and public.guards_student(student_id))
  );
create policy log_insert_teacher on public.log_entries
  for insert with check (
    author_id = auth.uid() and public.my_role() in ('maestro','director')
  );
create policy log_update_author on public.log_entries
  for update using (author_id = auth.uid());
create policy log_delete_author on public.log_entries
  for delete using (author_id = auth.uid());

-- ----------------------------------------------------------------
-- LESSON_PLANS / PLAN_ITEMS
-- ----------------------------------------------------------------
create policy plans_select on public.lesson_plans
  for select using (
    public.teaches_group(group_id)
    or (school_id = public.my_school_id() and public.my_role() in ('director','supervisor'))
  );
create policy plans_write_teacher on public.lesson_plans
  for all using (public.teaches_group(group_id))
  with check (public.teaches_group(group_id));

create policy plan_items_select on public.plan_items
  for select using (
    exists (
      select 1 from public.lesson_plans lp
      where lp.id = lesson_plan_id and (
        public.teaches_group(lp.group_id)
        or (lp.school_id = public.my_school_id() and public.my_role() in ('director','supervisor'))
      )
    )
  );
create policy plan_items_write_teacher on public.plan_items
  for all using (
    exists (
      select 1 from public.lesson_plans lp
      where lp.id = lesson_plan_id and public.teaches_group(lp.group_id)
    )
  )
  with check (
    exists (
      select 1 from public.lesson_plans lp
      where lp.id = lesson_plan_id and public.teaches_group(lp.group_id)
    )
  );

-- ----------------------------------------------------------------
-- CONSENTS
-- ----------------------------------------------------------------
create policy consents_select on public.consents
  for select using (
    public.guards_student(student_id)
    or public.my_role() = 'director'
  );
create policy consents_write_guardian on public.consents
  for all using (public.guards_student(student_id))
  with check (public.guards_student(student_id));

-- ----------------------------------------------------------------
-- AUDIT_LOG (insert por usuarios autenticados; lectura solo director)
-- ----------------------------------------------------------------
create policy audit_insert on public.audit_log
  for insert with check (actor_id = auth.uid());
create policy audit_select_director on public.audit_log
  for select using (public.my_role() = 'director');

-- ----------------------------------------------------------------
-- PRIVACY_DOCUMENTS (lectura pública para usuarios autenticados)
-- ----------------------------------------------------------------
create policy privacy_select on public.privacy_documents
  for select using (true);
