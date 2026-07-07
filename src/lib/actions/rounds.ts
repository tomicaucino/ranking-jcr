"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import type { ActionState } from "@/lib/types";

export async function createRound(_prevState: ActionState, formData: FormData) {
  await requireAdmin();

  const name = String(formData.get("name") ?? "").trim();
  const startAt = String(formData.get("start_at") ?? "");
  const endAt = String(formData.get("end_at") ?? "");

  if (!name || !startAt || !endAt) {
    return { error: "Completá nombre, inicio y fin de la fecha." };
  }
  if (new Date(endAt) <= new Date(startAt)) {
    return { error: "La fecha de fin debe ser posterior al inicio." };
  }

  const supabase = await createClient();
  const { data: round, error } = await supabase
    .from("rounds")
    .insert({ name, start_at: startAt, end_at: endAt })
    .select()
    .single();

  if (error || !round) {
    return { error: `No se pudo crear la fecha: ${error?.message ?? "error desconocido"}` };
  }

  revalidatePath("/admin/rounds");
  revalidatePath("/rounds");
  redirect(`/admin/rounds/${round.id}`);
}

export async function updateRound(roundId: string, _prevState: ActionState, formData: FormData) {
  await requireAdmin();

  const name = String(formData.get("name") ?? "").trim();
  const startAt = String(formData.get("start_at") ?? "");
  const endAt = String(formData.get("end_at") ?? "");

  if (!name || !startAt || !endAt) {
    return { error: "Completá nombre, inicio y fin de la fecha." };
  }
  if (new Date(endAt) <= new Date(startAt)) {
    return { error: "La fecha de fin debe ser posterior al inicio." };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("rounds")
    .update({ name, start_at: startAt, end_at: endAt })
    .eq("id", roundId);

  if (error) {
    return { error: `No se pudo actualizar la fecha: ${error.message}` };
  }

  revalidatePath("/admin/rounds");
  revalidatePath(`/admin/rounds/${roundId}`);
  revalidatePath("/rounds");
  revalidatePath(`/rounds/${roundId}`);
  redirect(`/admin/rounds/${roundId}`);
}
