import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RoundStatusBadge } from "@/components/round-status-badge";
import { formatDateTime } from "@/lib/format";
import type { Round } from "@/lib/types";

export default async function AdminRoundsPage() {
  const supabase = await createClient();
  const { data: rounds } = await supabase
    .from("rounds")
    .select("*")
    .order("start_at", { ascending: false });

  return (
    <Card>
      <CardHeader className="flex items-center justify-between">
        <CardTitle>Fechas</CardTitle>
        <Link href="/admin/rounds/new" className="text-sm font-medium text-primary-600 underline">
          + Nueva fecha
        </Link>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        {(rounds ?? []).length === 0 && <p className="text-muted">Todavía no hay fechas.</p>}
        {(rounds as Round[] | null)?.map((round) => (
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
            <RoundStatusBadge round={round} />
          </Link>
        ))}
      </CardContent>
    </Card>
  );
}
