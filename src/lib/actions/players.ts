"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import type { ActionState } from "@/lib/types";

/**
 * Alta de jugador: crea el usuario de Supabase Auth (con la contraseña que
 * define el admin) y las filas en `players` + `profiles`. Si algo falla
 * después de crear el usuario de Auth, se lo borra para no dejar cuentas
 * huérfanas sin jugador asociado.
 */
export async function createPlayer(_prevState: ActionState, formData: FormData) {
  await requireAdmin();

  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");

  if (!name || !email || !password) {
    return { error: "Completá nombre, email y contraseña." };
  }
  if (password.length < 6) {
    return { error: "La contraseña debe tener al menos 6 caracteres." };
  }

  const adminClient = createAdminClient();
  const { data: authUser, error: authError } = await adminClient.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });

  if (authError || !authUser.user) {
    return { error: `No se pudo crear el usuario: ${authError?.message ?? "error desconocido"}` };
  }

  const supabase = await createClient();
  const { data: player, error: playerError } = await supabase
    .from("players")
    .insert({ name, email })
    .select()
    .single();

  if (playerError || !player) {
    await adminClient.auth.admin.deleteUser(authUser.user.id);
    return { error: `No se pudo crear el jugador: ${playerError?.message ?? "error desconocido"}` };
  }

  const { error: profileError } = await supabase.from("profiles").insert({
    id: authUser.user.id,
    role: "player",
    player_id: player.id,
  });

  if (profileError) {
    await adminClient.auth.admin.deleteUser(authUser.user.id);
    await supabase.from("players").delete().eq("id", player.id);
    return { error: `No se pudo crear el perfil: ${profileError.message}` };
  }

  revalidatePath("/admin/players");
  redirect("/admin/players");
}

export async function updatePlayer(playerId: string, _prevState: ActionState, formData: FormData) {
  await requireAdmin();

  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const active = formData.get("active") === "on";

  if (!name || !email) {
    return { error: "Completá nombre y email." };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("players")
    .update({ name, email, active })
    .eq("id", playerId);

  if (error) {
    return { error: `No se pudo actualizar el jugador: ${error.message}` };
  }

  revalidatePath("/admin/players");
  redirect("/admin/players");
}
