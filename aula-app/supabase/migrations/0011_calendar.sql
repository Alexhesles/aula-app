-- ============================================================
-- AULA · Migración 0011 — Calendario escolar SEP 2025-2026
-- Catálogo nacional de fechas. Legible por todos; editable.
-- ============================================================

create table if not exists public.calendar_events (
  id        uuid primary key default gen_random_uuid(),
  cycle     text not null default '2025-2026',
  date      date not null,
  end_date  date,
  title     text not null,
  kind      text not null,   -- inicio, fin, suspension, cte, vacaciones, evaluacion, calificaciones, taller, preinscripcion, conmemoracion, receso
  created_at timestamptz not null default now()
);
create index if not exists calendar_date_idx on public.calendar_events (cycle, date);

alter table public.calendar_events enable row level security;
create policy calendar_select on public.calendar_events
  for select to authenticated using (true);

insert into public.calendar_events (date, end_date, title, kind)
select v.date::date, v.end_date::date, v.title, v.kind
from (values
  ('2025-08-25','2025-08-29','Consejo Técnico — Fase Intensiva','cte'),
  ('2025-09-01', null,        'Inicio del ciclo escolar','inicio'),
  ('2025-09-16', null,        'Suspensión — Independencia de México','suspension'),
  ('2025-09-26', null,        'Consejo Técnico Escolar (1a ordinaria)','cte'),
  ('2025-10-31', null,        'Consejo Técnico Escolar (2a ordinaria)','cte'),
  ('2025-11-14', null,        'Registro de calificaciones (1er periodo)','calificaciones'),
  ('2025-11-17', null,        'Suspensión — Conmemoración Revolución Mexicana','suspension'),
  ('2025-11-24','2025-11-27', 'Comunicación de resultados de evaluación','evaluacion'),
  ('2025-11-28', null,        'Consejo Técnico Escolar (3a ordinaria)','cte'),
  ('2025-12-22','2026-01-06', 'Vacaciones de invierno','vacaciones'),
  ('2026-01-07', null,        'Taller intensivo — personal con función directiva','taller'),
  ('2026-01-08','2026-01-09', 'Taller intensivo — docentes','taller'),
  ('2026-01-30', null,        'Consejo Técnico Escolar (4a ordinaria)','cte'),
  ('2026-02-02', null,        'Suspensión — Conmemoración Promulgación de la Constitución','suspension'),
  ('2026-02-02','2026-02-13', 'Periodo de preinscripciones','preinscripcion'),
  ('2026-02-27', null,        'Consejo Técnico Escolar (5a ordinaria)','cte'),
  ('2026-03-13', null,        'Registro de calificaciones (2o periodo)','calificaciones'),
  ('2026-03-16', null,        'Suspensión — Conmemoración Natalicio de Benito Juárez','suspension'),
  ('2026-03-23','2026-03-26', 'Comunicación de resultados de evaluación','evaluacion'),
  ('2026-03-27', null,        'Consejo Técnico Escolar (6a ordinaria)','cte'),
  ('2026-03-30','2026-04-10', 'Vacaciones de primavera','vacaciones'),
  ('2026-05-01', null,        'Suspensión — Día del Trabajo','suspension'),
  ('2026-05-05', null,        'Suspensión — Batalla de Puebla','suspension'),
  ('2026-05-15', null,        'Suspensión — Día del Maestro','suspension'),
  ('2026-05-29', null,        'Consejo Técnico Escolar (7a ordinaria)','cte'),
  ('2026-06-26', null,        'Consejo Técnico Escolar (8a ordinaria)','cte'),
  ('2026-07-03', null,        'Registro de calificaciones (3er periodo)','calificaciones'),
  ('2026-07-14', null,        'Comunicación de resultados de evaluación','evaluacion'),
  ('2026-07-15', null,        'Fin del ciclo escolar','fin'),
  ('2026-07-16','2026-07-17', 'Taller intensivo — docentes (cierre)','taller'),
  ('2026-07-18','2026-07-31', 'Periodo vacacional de verano','receso')
) as v(date, end_date, title, kind)
where not exists (
  select 1 from public.calendar_events c
  where c.date = v.date::date and c.title = v.title
);
