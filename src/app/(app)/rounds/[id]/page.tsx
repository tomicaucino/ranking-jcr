import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { RoundStatusBadge } from "@/components/round-status-badge";
import { MatchCard } from "@/components/match-card";
import { formatDateTime } from "@/lib/format";
import type { Match, Player, Round } from "@/lib/types";

export default async function RoundDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const [{ data: round }, { data: matches }, { data: players }] = await Promise.all([
    supabase.from("rounds").select("*").eq("id", id).single(),
    supabase.from("matches").select("*").eq("round_id", id).order("created_at"),
    supabase.from("players").select("*"),
  ]);

  if (!round) notFound();

  const playersById = new Map((players as Player[] | null)?.map((p) => [p.id, p]));

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-serif text-2xl font-semibold text-primary-900">{(round as Round).name}</h1>
          <p className="text-muted">
            {formatDateTime((round as Round).start_at)} &rarr; {formatDateTime((round as Round).end_at)}
          </p>
        </div>
        <RoundStatusBadge round={round as Round} />
      </div>

      <div className="flex flex-col gap-3">
        {(matches ?? []).length === 0 && (
          <p className="text-muted">Todavía no hay partidos cargados para esta fecha.</p>
        )}
        {(matches as Match[] | null)?.map((match) => (
          <MatchCard
            key={match.id}
            match={match}
            player1={playersById.get(match.player1_id)}
            player2={playersById.get(match.player2_id)}
          />
        ))}
      </div>
    </div>
  );
}
