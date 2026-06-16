# Aula

El sistema operativo de tu escuela. Asistencia, bitácora y plan SEP en un solo lugar.

**Stack:** Next.js 16 · React 19 · Tailwind v4 · Supabase · Vercel · PWA

---

## 🚀 Puesta en marcha (Bulk 1 — Cimiento)

### 1. Subir a GitHub
En tu repo: **Add file → Upload files**, arrastra la carpeta completa. Sube todo
EXCEPTO `node_modules/` y `.next/` (ya están excluidos por `.gitignore`).

### 2. Crear proyecto en Supabase
1. Crea un proyecto nuevo en supabase.com.
2. Ve a **Project Settings → API** y copia:
   - `Project URL`
   - `anon public` key

### 3. Conectar a Vercel
1. Importa el repo en vercel.com.
2. En **Environment Variables**, agrega:
   - `NEXT_PUBLIC_SUPABASE_URL` = tu Project URL
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` = tu anon key
3. Deploy. (Las fuentes de Google se descargan en build — Vercel tiene internet, compila sin problema.)

### 4. Configurar Google OAuth (opcional en este bulk)
En Supabase: **Authentication → Providers → Google**. Pega tu Client ID y Secret.
Agrega como redirect URL: `https://TU-DOMINIO/auth/callback`.

---

## 📁 Qué incluye este bulk

- **Sistema de diseño** (`components/ui/`): Button, Card, Input, Pill, EmptyState, Skeleton/Spinner — con los tokens de marca en `app/globals.css`.
- **Auth completo**: clientes Supabase (browser + server), `proxy.ts` (refresca sesión y protege rutas), login con Google + magic link, callback de OAuth.
- **Pantallas base**: landing, login, 404, stubs de privacidad y términos.
- **PWA**: manifest + íconos placeholder + metadata (instalable).

## ⏭️ Siguiente: Bulk 2 — Base de datos
Migraciones SQL de Supabase (tablas + RLS + consentimiento + auditoría).

---

## Convenciones
- Archivos `kebab-case`, componentes `PascalCase`.
- Colores siempre por token (`bg-indigo`), nunca hex en JSX.
- Server Components por defecto; `"use client"` solo con interacción.
- Acceso a datos vía `lib/` , nunca queries sueltas en componentes.
