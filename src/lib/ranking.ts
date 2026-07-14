import type { Match, Player, Standing } from "@/lib/types";

// Puntaje de Match Play. Ajustar acá si el club cambia el sistema de puntos.
export const POINTS = {
  WIN: 3,
  DRAW: 1,
  LOSS: 0,
  WALKOVER: -1,
} as const;

/**
 * Extrae los hoyos de margen de un resultado tipo "3 up" o "4&3" (siempre el
 * primer número). Devuelve 0 si el texto no matchea ese formato (por ejemplo
 * un resultado personalizado que no empieza con un número).
 */
function parseHolesMargin(resultText: string | null): number {
  if (!resultText) return 0;
  const match = resultText.trim().match(/^(\d+)/);
  return match ? Number(match[1]) : 0;
}

/**
 * Calcula la tabla de posiciones a partir de los jugadores y los partidos
 * ya jugados (status "played", "draw" o "walkover"). Los partidos "pending"
 * no suman.
 *
 * Orden: puntos descendente, desempate por diferencia ganados/jugados
 * descendente, y por nombre para que el orden sea estable.
 */
export function calculateStandings(
  players: Player[],
  matches: Match[]
): Standing[] {
  const standings = new Map<string, Standing>(
    players.map((player) => [
      player.id,
      { player, played: 0, won: 0, drawn: 0, lost: 0, points: 0, holesFor: 0 },
    ])
  );

  for (const match of matches) {
    if (match.status === "walkover") {
      applyWalkover(standings, match.player1_id);
      applyWalkover(standings, match.player2_id);
      continue;
    }

    if (match.status === "draw") {
      applyDraw(standings, match.player1_id);
      applyDraw(standings, match.player2_id);
      continue;
    }

    if (match.status === "played" && match.winner_id) {
      const loserId =
        match.winner_id === match.player1_id
          ? match.player2_id
          : match.player1_id;
      applyResult(standings, match.winner_id, "won", parseHolesMargin(match.result_text));
      applyResult(standings, loserId, "lost", 0);
    }
  }

  return Array.from(standings.values()).sort(
    (a, b) =>
      b.points - a.points ||
      (b.won - b.played) - (a.won - a.played) ||
      a.player.name.localeCompare(b.player.name)
  );
}

function applyResult(
  standings: Map<string, Standing>,
  playerId: string,
  outcome: "won" | "lost",
  holesMargin: number
) {
  const standing = standings.get(playerId);
  if (!standing) return;
  standing.played += 1;
  standing.points += outcome === "won" ? POINTS.WIN : POINTS.LOSS;
  if (outcome === "won") {
    standing.won += 1;
    standing.holesFor += holesMargin;
  } else {
    standing.lost += 1;
  }
}

function applyDraw(standings: Map<string, Standing>, playerId: string) {
  const standing = standings.get(playerId);
  if (!standing) return;
  standing.played += 1;
  standing.drawn += 1;
  standing.points += POINTS.DRAW;
}

function applyWalkover(standings: Map<string, Standing>, playerId: string) {
  const standing = standings.get(playerId);
  if (!standing) return;
  standing.played += 1;
  standing.points += POINTS.WALKOVER;
}
