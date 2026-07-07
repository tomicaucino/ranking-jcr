"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin, requireProfile } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import type { ActionState } from "@/lib/types";

export async function createMatch(roundId: string, _prevState: ActionState, formData: FormData) {
  await requireAdmin();

  const player1Id = String(formData.get("player1_id") ?? "");
  const player2Id = String(formData.get("player2_id") ?? "");

  if (!player1Id || !player2Id) {
    return { error: "Elegí los dos jugadores del partido." };
  }
  if (player1Id === player2Id) {
    return { error: "Los dos jugadores deben ser distintos." };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("matches")
    .insert({ round_id: roundId, player1_id: player1Id, player2_id: player2Id });

  if (error) {
    return { error: `No se pudo crear el partido: ${error.message}` };
  }

  revalidatePath(`/admin/rounds/${roundId}`);
  revalidatePath(`/rounds/${roundId}`);
  return undefined;
}

export async function deleteMatch(matchId: string, roundId: string) {
  await requireAdmin();

  const supabase = await createClient();
  await supabase.from("matches").delete().eq("id", matchId);

  revalidatePath(`/admin/rounds/${roundId}`);
  revalidatePath(`/rounds/${roundId}`);
}

/**
 * Carga el resultado de un partido. La autorización real la aplica la
 * policy de RLS `matches_update` (admin siempre, jugador participante solo
 * con la fecha abierta); acá solo repetimos la validación de forma para dar
 * un mensaje de error legible en vez de un error crudo de Postgres.
 */
export async function submitMatchResult(
  matchId: string,
  roundId: string,
  _prevState: ActionState,
  formData: FormData
) {
  const profile = await requireProfile();

  const isDraw = formData.get("is_draw") === "true";
  const winnerId = String(formData.get("winner_id") ?? "");
  const resultText = String(formData.get("result_text") ?? "").trim();

  if ((!isDraw && !winnerId) || !resultText) {
    return { error: "Elegí el ganador, o empate, y el resultado." };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("matches")
    .update({
      status: isDraw ? "draw" : "played",
      winner_id: isDraw ? null : winnerId,
      result_text: resultText,
      loaded_by: profile.id,
      loaded_at: new Date().toISOString(),
    })
    .eq("id", matchId);

  if (error) {
    return {
      error:
        "No se pudo cargar el resultado. Puede que la fecha ya no esté abierta o que el partido ya tenga resultado.",
    };
  }

  revalidatePath(`/matches/${matchId}`);
  revalidatePath(`/rounds/${roundId}`);
  revalidatePath("/ranking");
  redirect(`/matches/${matchId}`);
}

/** Walkover doble: acción exclusiva del admin, resta 1 punto a cada jugador. */
export async function setWalkover(matchId: string, roundId: string) {
  const profile = await requireAdmin();

  const supabase = await createClient();
  await supabase
    .from("matches")
    .update({
      status: "walkover",
      winner_id: null,
      result_text: null,
      loaded_by: profile.id,
      loaded_at: new Date().toISOString(),
    })
    .eq("id", matchId);

  revalidatePath(`/admin/rounds/${roundId}`);
  revalidatePath(`/rounds/${roundId}`);
  revalidatePath("/ranking");
}

/** El admin puede corregir un resultado ya cargado en cualquier momento. */
export async function adminEditMatchResult(
  matchId: string,
  roundId: string,
  _prevState: ActionState,
  formData: FormData
) {
  await requireAdmin();

  const isDraw = formData.get("is_draw") === "true";
  const winnerId = String(formData.get("winner_id") ?? "");
  const resultText = String(formData.get("result_text") ?? "").trim();

  if ((!isDraw && !winnerId) || !resultText) {
    return { error: "Elegí el ganador, o empate, y el resultado." };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("matches")
    .update({
      status: isDraw ? "draw" : "played",
      winner_id: isDraw ? null : winnerId,
      result_text: resultText,
    })
    .eq("id", matchId);

  if (error) {
    return { error: `No se pudo actualizar el resultado: ${error.message}` };
  }

  revalidatePath(`/admin/rounds/${roundId}`);
  revalidatePath(`/rounds/${roundId}`);
  revalidatePath(`/matches/${matchId}`);
  revalidatePath("/ranking");
  return undefined;
}
