import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { RoundStatusBadge } from "@/components/round-status-badge";
import { formatDateTime } from "@/lib/format";
import type { Round } from "@/lib/types";

export function RoundCard({ round, matchCount }: { round: Round; matchCount: number }) {
  return (
    <Link href={`/rounds/${round.id}`}>
      <Card className="transition-shadow hover:shadow-md">
        <CardContent className="flex items-center justify-between gap-4">
          <div>
            <p className="font-semibold text-primary-900">{round.name}</p>
            <p className="text-sm text-muted">
              {formatDateTime(round.start_at)} &rarr; {formatDateTime(round.end_at)}
            </p>
            <p className="text-sm text-muted">
              {matchCount} {matchCount === 1 ? "partido" : "partidos"}
            </p>
          </div>
          <RoundStatusBadge round={round} />
        </CardContent>
      </Card>
    </Link>
  );
}
