-- ============================================================
-- AULA · Migración 0010 — Plataforma transversal
-- Notificaciones, alertas, reseña de incidencias, mejoras de
-- planeación (sesiones + ligado a currículo) y actividad docente.
-- ============================================================

-- ---------- NOTIFICACIONES ----------
create table if not exists public.notifications (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references public.profiles(id) on delete cascade,
  type       text not null default 'sistema',   -- alerta, cita, anuncio, solicitud, sistema
  title      text not null,
  body       text,
  link       text,
  read       boolean not null default false,
  created_at timestamptz not null default now()
);
create index if not exists notifications_user_idx
  on public.notifications (user_id, read, created_at desc);

alter table public.notifications enable row level security;

create policy notifications_select on public.notifications
  for select using (user_id = auth.uid());
create policy notifications_update on public.notifications
  for update using (user_id = auth.uid()) with check (user_id = auth.uid());

-- Helper interno para crear notificaciones desde otras RPC
create or replace function public._notify(
  p_user uuid, p_type text, p_title text, p_body text, p_link text
) returns void
language plpgsql security definer set search_path = public as $$
begin
  if p_user is null then return; end if;
  insert into public.notifications (user_id, type, title, body, link)
  values (p_user, p_type, p_title, p_body, p_link);
end $$;

-- Marcar todas como leídas
create or replace function public.mark_notifications_read()
returns void language plpgsql security definer set search_path = public as $$
begin
  update public.notifications set read = true
  where user_id = auth.uid() and read = false;
end $$;

-- ---------- ALERTA: MAESTRO -> DIRECTOR ----------
create or replace function public.alert_director(p_group_id uuid, p_message text)
returns void language plpgsql security definer set search_path = public as $$
declare v_school uuid; v_me uuid := auth.uid(); v_name text; v_dir record;
begin
  if not public.teaches_group(p_group_id) then raise exception 'No autorizado'; end if;
  select school_id into v_school from public.groups where id = p_group_id;
  select full_name into v_name from public.profiles where id = v_me;
  for v_dir in
    select id from public.profiles where school_id = v_school and role = 'director'
  loop
    perform public._notify(
      v_dir.id, 'alerta',
      'Alerta de ' || coalesce(v_name, 'un maestro'),
      coalesce(nullif(trim(p_message), ''), 'Solicita tu atención.'),
      '/dashboard'
    );
  end loop;
end $$;

-- ---------- RESEÑA DE INCIDENCIAS (DIRECTOR) ----------
alter table public.log_entries add column if not exists reviewed_by uuid references public.profiles(id) on delete set null;
alter table public.log_entries add column if not exists reviewed_at timestamptz;

create or replace function public.review_log(p_log_id uuid)
returns void language plpgsql security definer set search_path = public as $$
declare v_school uuid;
begin
  select school_id into v_school from public.log_entries where id = p_log_id;
  if v_school is null then raise exception 'No existe'; end if;
  if not (public.my_school_id() = v_school and public.my_role() = 'director') then
    raise exception 'No autorizado';
  end if;
  update public.log_entries
    set reviewed_by = auth.uid(), reviewed_at = now()
    where id = p_log_id;
end $$;

-- ---------- PLANEACIÓN: SESIONES + LIGADO A CURRÍCULO ----------
alter table public.plan_items add column if not exists sessions int not null default 1;
alter table public.plan_items add column if not exists content_id uuid references public.curriculum_contents(id) on delete set null;

-- ---------- ACTIVIDAD DOCENTE ----------
alter table public.profiles add column if not exists last_active_at timestamptz;

create or replace function public.touch_activity()
returns void language plpgsql security definer set search_path = public as $$
begin
  update public.profiles set last_active_at = now() where id = auth.uid();
end $$;
