import { notFound } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PlayerForm } from "@/components/admin/player-form";
import { updatePlayer } from "@/lib/actions/players";
import { createClient } from "@/lib/supabase/server";
import type { Player } from "@/lib/types";

export default async function EditPlayerPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: player } = await supabase.from("players").select("*").eq("id", id).single();

  if (!player) notFound();

  return (
    <Card className="max-w-md">
      <CardHeader>
        <CardTitle>Editar jugador</CardTitle>
      </CardHeader>
      <CardContent>
        <PlayerForm action={updatePlayer.bind(null, id)} player={player as Player} />
      </CardContent>
    </Card>
  );
}
