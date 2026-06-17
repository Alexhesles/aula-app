-- ============================================================
-- AULA · Migración 0007 — Seguimiento curricular (SEP)
-- Catálogo de contenidos por grado/materia + el maestro marca
-- qué ya abordó, por grupo. Incluye set inicial de MUESTRA
-- (editable / reemplazable por los contenidos reales).
-- ============================================================

create table if not exists public.curriculum_contents (
  id        uuid primary key default gen_random_uuid(),
  grade     text not null,            -- '5','6'
  subject   text not null,            -- 'Matemáticas', 'Español', ...
  block     smallint,                 -- trimestre 1..3 (opcional)
  content   text not null,            -- el contenido / aprendizaje esperado
  position  int not null default 0,
  created_at timestamptz not null default now()
);
create index if not exists curriculum_grade_subject_idx
  on public.curriculum_contents (grade, subject);

create table if not exists public.content_coverage (
  id         uuid primary key default gen_random_uuid(),
  group_id   uuid not null references public.groups(id) on delete cascade,
  content_id uuid not null references public.curriculum_contents(id) on delete cascade,
  covered    boolean not null default true,
  covered_at date not null default current_date,
  teacher_id uuid references public.profiles(id) on delete set null,
  unique (group_id, content_id)
);

alter table public.curriculum_contents enable row level security;
alter table public.content_coverage  enable row level security;

-- El catálogo es público para cualquier usuario autenticado
create policy curriculum_select on public.curriculum_contents
  for select to authenticated using (true);

-- Maestros/directores pueden agregar contenidos (pegar su currículo)
create policy curriculum_insert on public.curriculum_contents
  for insert to authenticated
  with check (public.my_role() in ('maestro','director'));

-- Cobertura: el maestro del grupo escribe; director/supervisor leen
create policy coverage_select on public.content_coverage
  for select to authenticated
  using (public.teaches_group(group_id) or public.my_role() in ('director','supervisor'));

create policy coverage_write on public.content_coverage
  for all to authenticated
  using (public.teaches_group(group_id))
  with check (public.teaches_group(group_id));

-- RPC: agregar varios contenidos de golpe (pega tu currículo, uno por línea)
create or replace function public.add_curriculum_contents(
  p_grade   text,
  p_subject text,
  p_block   smallint,
  p_lines   text[]
) returns int
language plpgsql security definer set search_path = public as $$
declare v_count int := 0; v_line text; v_pos int;
begin
  if public.my_role() not in ('maestro','director') then
    raise exception 'No autorizado';
  end if;
  select coalesce(max(position),0) into v_pos
    from public.curriculum_contents where grade = p_grade and subject = p_subject;
  foreach v_line in array p_lines loop
    if trim(v_line) <> '' then
      v_pos := v_pos + 1;
      insert into public.curriculum_contents (grade, subject, block, content, position)
      values (p_grade, p_subject, p_block, trim(v_line), v_pos);
      v_count := v_count + 1;
    end if;
  end loop;
  return v_count;
end $$;
