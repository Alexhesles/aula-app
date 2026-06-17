"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

/**
 * Correos con permiso de "modo fundador" (cambiar de rol para probar).
 * SOLO para desarrollo/QA. No expone botones a usuarios normales.
 */
const FOUNDER_EMAILS = ["heslesalex@gmail.com"];

export async function isFounder(email: string | null | undefined): Promise<boolean> {
  return !!email && FOUNDER_EMAILS.includes(email.toLowerCase());
}

const VALID_ROLES = ["maestro", "director", "padre", "supervisor"] as const;

/** Cambia el rol del usuario actual. Gateado por correo de fundador. */
export async function switchRole(role: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  if (!FOUNDER_EMAILS.includes((user.email ?? "").toLowerCase())) {
    throw new Error("No autorizado");
  }
  if (!VALID_ROLES.includes(role as any)) {
    throw new Error("Rol no válido");
  }

  await supabase.from("profiles").update({ role }).eq("id", user.id);
  revalidatePath("/", "layout");
  redirect("/inicio");
}
