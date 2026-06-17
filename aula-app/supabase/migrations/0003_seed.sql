-- ============================================================
-- AULA · Migración 0003 — Catálogo SEP + datos iniciales
-- ============================================================

-- Materias base de primaria (catálogo plantilla; se asignan a tu escuela abajo).
-- NOTA: ejecuta primero 0001 y 0002.

-- 1) Documento de privacidad placeholder
insert into public.privacy_documents (type, version, content)
values
  ('integral', 'v0-draft', 'Aviso de privacidad integral — pendiente de validación legal.'),
  ('simplificado', 'v0-draft', 'Aviso de privacidad simplificado — pendiente.'),
  ('terminos', 'v0-draft', 'Términos y condiciones — pendiente.');

-- ============================================================
-- PASOS MANUALES PARA EL PILOTO (ejecutar tras crear tu cuenta)
-- ============================================================
-- Estos pasos NO se automatizan: asignar roles es tarea de admin (vía SQL).
--
-- A) Crea tu escuela:
--    insert into public.schools (name, type, cct, cycle)
--    values ('Mi Escuela Piloto', 'privada', 'XXXXXXXXX', '2025-2026')
--    returning id;
--    -- guarda el id que regresa.
--
-- B) Asigna tu cuenta (ya registrada vía la app) como director:
--    update public.profiles
--    set role = 'director', school_id = 'EL-ID-DE-LA-ESCUELA', full_name = 'Tu Nombre'
--    where id = (select id from auth.users where email = 'tu-correo@ejemplo.com');
--
-- C) Carga las materias especiales de tu escuela:
--    insert into public.subjects (school_id, name, is_special) values
--      ('EL-ID-DE-LA-ESCUELA', 'Inglés', true),
--      ('EL-ID-DE-LA-ESCUELA', 'Computación', true),
--      ('EL-ID-DE-LA-ESCUELA', 'Música', true),
--      ('EL-ID-DE-LA-ESCUELA', 'Educación Física', true);
--
-- D) Crea un grupo:
--    insert into public.groups (school_id, name, grade, cycle)
--    values ('EL-ID-DE-LA-ESCUELA', '3°A', '3', '2025-2026') returning id;
--
-- E) Asigna a la maestra titular (su profile debe existir y tener role='maestro'):
--    insert into public.group_teachers (group_id, teacher_id, is_titular)
--    values ('EL-ID-DEL-GRUPO', 'EL-ID-DE-LA-MAESTRA', true);
-- ============================================================
