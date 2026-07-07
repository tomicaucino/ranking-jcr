import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RoundForm } from "@/components/admin/round-form";
import { createRound } from "@/lib/actions/rounds";

export default function NewRoundPage() {
  return (
    <Card className="max-w-md">
      <CardHeader>
        <CardTitle>Nueva fecha</CardTitle>
      </CardHeader>
      <CardContent>
        <RoundForm action={createRound} />
      </CardContent>
    </Card>
  );
}
