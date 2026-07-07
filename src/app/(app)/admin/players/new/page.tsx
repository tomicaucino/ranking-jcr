import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PlayerForm } from "@/components/admin/player-form";
import { createPlayer } from "@/lib/actions/players";

export default function NewPlayerPage() {
  return (
    <Card className="max-w-md">
      <CardHeader>
        <CardTitle>Nuevo jugador</CardTitle>
      </CardHeader>
      <CardContent>
        <PlayerForm action={createPlayer} />
      </CardContent>
    </Card>
  );
}
