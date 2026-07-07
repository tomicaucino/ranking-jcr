import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MATCH_STATUS_LABEL, MATCH_STATUS_TONE } from "@/lib/matches";
import type { Match, Player } from "@/lib/types";

export function MatchCard({
  match,
  player1,
  player2,
}: {
  match: Match;
  player1: Player | undefined;
  player2: Player | undefined;
}) {
  return (
    <Link href={`/matches/${match.id}`}>
      <Card className="transition-shadow hover:shadow-md">
        <CardContent className="flex items-center justify-between gap-4">
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
          <Badge tone={MATCH_STATUS_TONE[match.status]}>{MATCH_STATUS_LABEL[match.status]}</Badge>
        </CardContent>
      </Card>
    </Link>
  );
}
