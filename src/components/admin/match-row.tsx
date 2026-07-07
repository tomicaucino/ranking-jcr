"use client";

import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { deleteMatch, setWalkover } from "@/lib/actions/matches";
import { MATCH_STATUS_LABEL, MATCH_STATUS_TONE } from "@/lib/matches";
import type { Match, Player } from "@/lib/types";

export function MatchRow({
  match,
  player1,
  player2,
}: {
  match: Match;
  player1: Player | undefined;
  player2: Player | undefined;
}) {
  return (
    <div className="flex flex-col gap-3 rounded-lg border border-border px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <p className="font-medium text-primary-900">
          {player1?.name ?? "?"} <span className="text-muted">vs</span> {player2?.name ?? "?"}
        </p>
        {match.status === "played" && (
          <p className="text-sm text-muted">
            Ganó {match.winner_id === player1?.id ? player1?.name : player2?.name} &middot;{" "}
            {match.result_text}
          </p>
        )}
        {match.status === "draw" && <p className="text-sm text-muted">Empate (AS)</p>}
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <Badge tone={MATCH_STATUS_TONE[match.status]}>{MATCH_STATUS_LABEL[match.status]}</Badge>
        <Link href={`/matches/${match.id}`}>
          <Button type="button" variant="outline" size="sm">
            {match.status === "pending" ? "Cargar" : "Editar"}
          </Button>
        </Link>
        {match.status !== "walkover" && (
          <form
            action={setWalkover.bind(null, match.id, match.round_id)}
            onSubmit={(e) => {
              if (!confirm("¿Asignar walkover doble? Resta 1 punto a cada jugador.")) {
                e.preventDefault();
              }
            }}
          >
            <Button type="submit" variant="danger" size="sm">
              Walkover doble
            </Button>
          </form>
        )}
        {match.status === "pending" && (
          <form
            action={deleteMatch.bind(null, match.id, match.round_id)}
            onSubmit={(e) => {
              if (!confirm("¿Eliminar este partido?")) e.preventDefault();
            }}
          >
            <Button type="submit" variant="ghost" size="sm">
              Eliminar
            </Button>
          </form>
        )}
      </div>
    </div>
  );
}
