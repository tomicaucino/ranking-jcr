import type { Tone } from "@/components/ui/badge";
import type { Match, MatchStatus, Round } from "@/lib/types";

export const MATCH_STATUS_LABEL: Record<MatchStatus, string> = {
  pending: "Pendiente",
  played: "Jugado",
  draw: "Empate",
  walkover: "Walkover doble",
};

export const MATCH_STATUS_TONE: Record<MatchStatus, Tone> = {
  pending: "gray",
  played: "green",
  draw: "blue",
  walkover: "red",
};

/** Una fecha está "abierta" mientras `now` esté dentro de su ventana. */
export function isRoundOpen(round: Pick<Round, "start_at" | "end_at">, now = new Date()) {
  const start = new Date(round.start_at);
  const end = new Date(round.end_at);
  return now >= start && now <= end;
}

/**
 * Un jugador (no admin) puede cargar el resultado de un partido si participa
 * en él, la fecha está abierta, y el partido todavía no tiene un resultado
 * cargado. Esta es la misma regla que aplica la policy de RLS en
 * `matches_update`; se repite acá solo para poder habilitar/deshabilitar la
 * UI sin ida y vuelta al servidor.
 */
export function canPlayerLoadResult(
  match: Pick<Match, "player1_id" | "player2_id" | "status">,
  round: Pick<Round, "start_at" | "end_at">,
  playerId: string | null
) {
  if (!playerId) return false;
  const isParticipant =
    match.player1_id === playerId || match.player2_id === playerId;
  return isParticipant && match.status === "pending" && isRoundOpen(round);
}

/** Resultados típicos de match play: "N up" (ganó en el hoyo 18) y "N&M". */
export function matchPlayResultOptions(): string[] {
  const options: string[] = [];
  for (let up = 1; up <= 9; up++) {
    options.push(`${up} up`);
  }
  for (let up = 2; up <= 9; up++) {
    for (let remaining = 1; remaining < up; remaining++) {
      options.push(`${up}&${remaining}`);
    }
  }
  return options;
}
