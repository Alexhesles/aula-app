-- ============================================================
-- AULA · Migración 0006 — Storage para fotos de bitácora
-- Bucket PRIVADO (privacidad de menores). Acceso por escuela.
-- ============================================================

insert into storage.buckets (id, name, public)
values ('bitacora', 'bitacora', false)
on conflict (id) do nothing;

-- Subir: solo a la carpeta de tu propia escuela
create policy "bitacora_insert"
  on storage.objects for insert to authenticated
  with check (
    bucket_id = 'bitacora'
    and (storage.foldername(name))[1] = public.my_school_id()::text
  );

-- Ver: solo objetos de tu escuela (para generar URLs firmadas)
create policy "bitacora_select"
  on storage.objects for select to authenticated
  using (
    bucket_id = 'bitacora'
    and (storage.foldername(name))[1] = public.my_school_id()::text
  );

-- Borrar: el autor puede borrar dentro de su escuela
create policy "bitacora_delete"
  on storage.objects for delete to authenticated
  using (
    bucket_id = 'bitacora'
    and (storage.foldername(name))[1] = public.my_school_id()::text
  );
