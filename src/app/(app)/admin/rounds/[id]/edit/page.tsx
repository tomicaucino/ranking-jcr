import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RoundForm } from "@/components/admin/round-form";
import { updateRound } from "@/lib/actions/rounds";
import type { Round } from "@/lib/types";

export default async function EditRoundPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: round } = await supabase.from("rounds").select("*").eq("id", id).single();

  if (!round) notFound();

  return (
    <Card className="max-w-md">
      <CardHeader>
        <CardTitle>Editar fecha</CardTitle>
      </CardHeader>
      <CardContent>
        <RoundForm action={updateRound.bind(null, id)} round={round as Round} />
      </CardContent>
    </Card>
  );
}
