"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function signIn(_prevState: { error?: string } | undefined, formData: FormData) {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!email || !password) {
    return { error: "Ingresá tu email y contraseña." };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    console.error("signIn error:", error.status, error.code, error.message);
    if (error.code === "email_not_confirmed") {
      return { error: "El email todavía no está confirmado. Confirmalo desde Supabase Dashboard → Authentication → Users." };
    }
    return { error: `No se pudo iniciar sesión: ${error.message}` };
  }

  redirect("/ranking");
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}
