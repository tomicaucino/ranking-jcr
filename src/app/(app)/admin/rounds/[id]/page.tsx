import { notFound } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { createMatch } from "@/lib/actions/matches";
import { RoundStatusBadge } from "@/components/round-status-badge";
import { MatchForm } from "@/components/admin/match-form";
import { MatchRow } from "@/components/admin/match-row";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDateTime } from "@/lib/format";
import type { Match, Player, Round } from "@/lib/types";

export default async function AdminRoundDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const [{ data: round }, { data: matches }, { data: players }] = await Promise.all([
    supabase.from("rounds").select("*").eq("id", id).single(),
    supabase.from("matches").select("*").eq("round_id", id).order("created_at"),
    supabase.from("players").select("*").order("name"),
  ]);

  if (!round) notFound();

  const typedRound = round as Round;
  const playersById = new Map((players as Player[] | null)?.map((p) => [p.id, p]));
  const activePlayers = ((players as Player[] | null) ?? []).filter((p) => p.active);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold text-primary-900">{typedRound.name}</h2>
          <p className="text-muted">
            {formatDateTime(typedRound.start_at)} &rarr; {formatDateTime(typedRound.end_at)}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <RoundStatusBadge round={typedRound} />
          <Link href={`/admin/rounds/${typedRound.id}/edit`} className="text-sm font-medium text-primary-600 underline">
            Editar fecha
          </Link>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Agregar partido</CardTitle>
        </CardHeader>
        <CardContent>
          <MatchForm action={createMatch.bind(null, typedRound.id)} players={activePlayers} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Partidos de la fecha</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          {(matches ?? []).length === 0 && (
            <p className="text-muted">Todavía no hay partidos en esta fecha.</p>
          )}
          {(matches as Match[] | null)?.map((match) => (
            <MatchRow
              key={match.id}
              match={match}
              player1={playersById.get(match.player1_id)}
              player2={playersById.get(match.player2_id)}
            />
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
