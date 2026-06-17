-- ============================================================
-- AULA · Migración 0008 — Currículo y seguimiento de contenidos
-- Catálogo de contenidos (SEP) por grado/materia + marca de
-- "abordado" por grupo. El catálogo global tiene school_id NULL.
-- ============================================================

create table if not exists public.curriculum_contents (
  id         uuid primary key default gen_random_uuid(),
  school_id  uuid references public.schools(id) on delete cascade,  -- NULL = catálogo SEP global
  grade      text not null,        -- '5', '6'
  subject    text not null,        -- 'Matemáticas'
  axis       text,                 -- eje / ámbito / bloque
  content    text not null,        -- aprendizaje esperado / contenido
  position   int not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists idx_curriculum_grade_subject
  on public.curriculum_contents (grade, subject, position);

create table if not exists public.content_coverage (
  id         uuid primary key default gen_random_uuid(),
  group_id   uuid not null references public.groups(id) on delete cascade,
  content_id uuid not null references public.curriculum_contents(id) on delete cascade,
  status     text not null default 'abordado' check (status in ('abordado','en_curso')),
  teacher_id uuid references public.profiles(id) on delete set null,
  covered_at timestamptz not null default now(),
  unique (group_id, content_id)
);

alter table public.curriculum_contents enable row level security;
alter table public.content_coverage   enable row level security;

-- Lectura del catálogo: global, de tu escuela, o de escuelas que supervisas
create policy curriculum_select on public.curriculum_contents
  for select using (
    school_id is null
    or school_id = public.my_school_id()
    or public.supervises_school(school_id)
  );

-- Escritura: director o maestro de la escuela (para contenidos propios)
create policy curriculum_write_staff on public.curriculum_contents
  for all using (
    school_id = public.my_school_id() and public.my_role() in ('director','maestro')
  ) with check (
    school_id = public.my_school_id() and public.my_role() in ('director','maestro')
  );

-- Coberturas: el maestro del grupo escribe; director/supervisor leen
create policy coverage_select on public.content_coverage
  for select using (
    public.teaches_group(group_id)
    or exists (
      select 1 from public.groups g
      where g.id = content_coverage.group_id
        and (
          (g.school_id = public.my_school_id() and public.my_role() = 'director')
          or public.supervises_school(g.school_id)
        )
    )
  );

create policy coverage_write_teacher on public.content_coverage
  for all using (public.teaches_group(group_id))
  with check (public.teaches_group(group_id));

-- Marca / desmarca un contenido como abordado. Devuelve el nuevo estado.
create or replace function public.toggle_coverage(
  p_group_id   uuid,
  p_content_id uuid
) returns boolean
language plpgsql security definer set search_path = public as $$
declare
  v_exists boolean;
begin
  if not public.teaches_group(p_group_id) then
    raise exception 'Sin acceso a este grupo';
  end if;

  select true into v_exists
  from public.content_coverage
  where group_id = p_group_id and content_id = p_content_id;

  if v_exists then
    delete from public.content_coverage
    where group_id = p_group_id and content_id = p_content_id;
    return false;
  else
    insert into public.content_coverage (group_id, content_id, teacher_id)
    values (p_group_id, p_content_id, auth.uid());
    return true;
  end if;
end $$;
