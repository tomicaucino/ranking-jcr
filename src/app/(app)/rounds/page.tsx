import { createClient } from "@/lib/supabase/server";
import { RoundCard } from "@/components/round-card";
import type { Match, Round } from "@/lib/types";

export default async function RoundsPage() {
  const supabase = await createClient();

  const [{ data: rounds }, { data: matches }] = await Promise.all([
    supabase.from("rounds").select("*").order("start_at", { ascending: false }),
    supabase.from("matches").select("id, round_id"),
  ]);

  const matchCountByRound = new Map<string, number>();
  for (const match of (matches ?? []) as Pick<Match, "id" | "round_id">[]) {
    matchCountByRound.set(match.round_id, (matchCountByRound.get(match.round_id) ?? 0) + 1);
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-serif text-2xl font-semibold text-primary-900">Fechas</h1>
        <p className="text-muted">Cada fecha tiene una ventana de tiempo para cargar resultados.</p>
      </div>

      <div className="flex flex-col gap-3">
        {(rounds ?? []).length === 0 && (
          <p className="text-muted">Todavía no hay fechas creadas.</p>
        )}
        {(rounds as Round[] | null)?.map((round) => (
          <RoundCard key={round.id} round={round} matchCount={matchCountByRound.get(round.id) ?? 0} />
        ))}
      </div>
    </div>
  );
}
