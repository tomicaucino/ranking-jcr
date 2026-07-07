import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RoundStatusBadge } from "@/components/round-status-badge";
import { Badge } from "@/components/ui/badge";
import { formatDateTime } from "@/lib/format";
import type { Match, Round } from "@/lib/types";

export default async function AdminOverviewPage() {
  const supabase = await createClient();

  const [{ data: rounds }, { data: players }, { data: matches }] = await Promise.all([
    supabase.from("rounds").select("*").order("start_at", { ascending: false }),
    supabase.from("players").select("id, active"),
    supabase.from("matches").select("id, round_id, status"),
  ]);

  const matchesByRound = new Map<string, Pick<Match, "id" | "status">[]>();
  for (const m of (matches ?? []) as Pick<Match, "id" | "round_id" | "status">[]) {
    const list = matchesByRound.get(m.round_id) ?? [];
    list.push(m);
    matchesByRound.set(m.round_id, list);
  }

  const activePlayers = (players ?? []).filter((p) => p.active).length;

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard label="Jugadores activos" value={activePlayers} />
        <StatCard label="Fechas creadas" value={rounds?.length ?? 0} />
        <StatCard label="Partidos cargados" value={matches?.length ?? 0} />
      </div>

      <Card>
        <CardHeader className="flex items-center justify-between">
          <CardTitle>Fechas</CardTitle>
          <Link href="/admin/rounds/new" className="text-sm font-medium text-primary-600 underline">
            + Nueva fecha
          </Link>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          {(rounds ?? []).length === 0 && <p className="text-muted">Todavía no hay fechas.</p>}
          {(rounds as Round[] | null)?.map((round) => {
            const roundMatches = matchesByRound.get(round.id) ?? [];
            const played = roundMatches.filter((m) => m.status !== "pending").length;
            return (
              <Link
                key={round.id}
                href={`/admin/rounds/${round.id}`}
                className="flex items-center justify-between rounded-lg border border-border px-4 py-3 hover:bg-primary-50"
              >
                <div>
                  <p className="font-medium text-primary-900">{round.name}</p>
                  <p className="text-sm text-muted">
                    {formatDateTime(round.start_at)} &rarr; {formatDateTime(round.end_at)}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge tone="gray">
                    {played}/{roundMatches.length} con resultado
                  </Badge>
                  <RoundStatusBadge round={round} />
                </div>
              </Link>
            );
          })}
        </CardContent>
      </Card>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <Card>
      <CardContent>
        <p className="text-sm text-muted">{label}</p>
        <p className="text-3xl font-semibold text-primary-900">{value}</p>
      </CardContent>
    </Card>
  );
}
