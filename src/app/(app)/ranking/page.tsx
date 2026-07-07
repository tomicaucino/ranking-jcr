import { createClient } from "@/lib/supabase/server";
import { calculateStandings } from "@/lib/ranking";
import { RankingTable } from "@/components/ranking-table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Match, Player } from "@/lib/types";

export default async function RankingPage() {
  const supabase = await createClient();

  const [{ data: players }, { data: matches }] = await Promise.all([
    supabase.from("players").select("*").order("name"),
    supabase.from("matches").select("*"),
  ]);

  const standings = calculateStandings(
    (players ?? []) as Player[],
    (matches ?? []) as Match[]
  );

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-serif text-2xl font-semibold text-primary-900">Ranking Match Play</h1>
        <p className="text-muted">Posiciones actualizadas con cada resultado cargado.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Tabla de posiciones</CardTitle>
        </CardHeader>
        <CardContent>
          {standings.length === 0 ? (
            <p className="text-muted">Todavía no hay jugadores cargados.</p>
          ) : (
            <RankingTable standings={standings} />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
