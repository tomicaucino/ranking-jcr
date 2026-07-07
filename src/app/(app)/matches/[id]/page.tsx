import { notFound } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getCurrentProfile } from "@/lib/auth";
import { canPlayerLoadResult, MATCH_STATUS_LABEL, MATCH_STATUS_TONE } from "@/lib/matches";
import { RoundStatusBadge } from "@/components/round-status-badge";
import { MatchResultForm } from "@/components/match-result-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDateTime } from "@/lib/format";
import { submitMatchResult, adminEditMatchResult } from "@/lib/actions/matches";
import type { Match, Player, Round } from "@/lib/types";

export default async function MatchDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const [{ data: match }, profile] = await Promise.all([
    supabase.from("matches").select("*").eq("id", id).single(),
    getCurrentProfile(),
  ]);

  if (!match || !profile) notFound();

  const typedMatch = match as Match;

  const [{ data: round }, { data: player1 }, { data: player2 }] = await Promise.all([
    supabase.from("rounds").select("*").eq("id", typedMatch.round_id).single(),
    supabase.from("players").select("*").eq("id", typedMatch.player1_id).single(),
    supabase.from("players").select("*").eq("id", typedMatch.player2_id).single(),
  ]);

  if (!round || !player1 || !player2) notFound();

  const typedRound = round as Round;
  const isAdmin = profile.role === "admin";
  const playerCanLoad =
    !isAdmin &&
    canPlayerLoadResult(typedMatch, typedRound, profile.player_id) &&
    typedMatch.status === "pending";

  return (
    <div className="flex flex-col gap-6">
      <div>
        <Link href={`/rounds/${typedRound.id}`} className="text-sm text-primary-600 underline">
          &larr; {typedRound.name}
        </Link>
        <h1 className="mt-1 font-serif text-2xl font-semibold text-primary-900">
          {(player1 as Player).name} vs {(player2 as Player).name}
        </h1>
        <div className="mt-1 flex items-center gap-2">
          <Badge tone={MATCH_STATUS_TONE[typedMatch.status]}>{MATCH_STATUS_LABEL[typedMatch.status]}</Badge>
          <RoundStatusBadge round={typedRound} />
        </div>
      </div>

      {typedMatch.status === "walkover" && (
        <Card>
          <CardContent>
            <p className="text-foreground">
              Walkover doble: ambos jugadores restan 1 punto en el ranking. No hay ganador.
            </p>
          </CardContent>
        </Card>
      )}

      {(typedMatch.status === "played" || typedMatch.status === "draw") && !isAdmin && (
        <Card>
          <CardHeader>
            <CardTitle>Resultado</CardTitle>
          </CardHeader>
          <CardContent>
            {typedMatch.status === "draw" ? (
              <p>
                Empate <span className="font-semibold">(AS)</span>: ambos jugadores suman 1 punto.
              </p>
            ) : (
              <p>
                Ganó{" "}
                <span className="font-semibold">
                  {typedMatch.winner_id === (player1 as Player).id
                    ? (player1 as Player).name
                    : (player2 as Player).name}
                </span>{" "}
                &middot; {typedMatch.result_text}
              </p>
            )}
            {typedMatch.loaded_at && (
              <p className="mt-1 text-sm text-muted">Cargado el {formatDateTime(typedMatch.loaded_at)}</p>
            )}
          </CardContent>
        </Card>
      )}

      {playerCanLoad && (
        <Card>
          <CardHeader>
            <CardTitle>Cargar resultado</CardTitle>
          </CardHeader>
          <CardContent>
            <MatchResultForm
              action={submitMatchResult.bind(null, typedMatch.id, typedRound.id)}
              player1={player1 as Player}
              player2={player2 as Player}
            />
          </CardContent>
        </Card>
      )}

      {!isAdmin && !playerCanLoad && typedMatch.status === "pending" && (
        <Card>
          <CardContent>
            <p className="text-muted">
              Este partido todavía no tiene resultado. Solo los jugadores del partido pueden
              cargarlo, y únicamente mientras la fecha esté abierta.
            </p>
          </CardContent>
        </Card>
      )}

      {isAdmin && (
        <Card>
          <CardHeader>
            <CardTitle>
              {typedMatch.status === "pending" ? "Cargar resultado" : "Editar resultado"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <MatchResultForm
              action={adminEditMatchResult.bind(null, typedMatch.id, typedRound.id)}
              player1={player1 as Player}
              player2={player2 as Player}
              defaultWinnerId={typedMatch.winner_id}
              defaultResultText={typedMatch.result_text}
              defaultIsDraw={typedMatch.status === "draw"}
              submitLabel="Guardar resultado"
            />
          </CardContent>
        </Card>
      )}
    </div>
  );
}
