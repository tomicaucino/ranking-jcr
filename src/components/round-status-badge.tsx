import { Badge } from "@/components/ui/badge";
import { isRoundOpen } from "@/lib/matches";
import type { Round } from "@/lib/types";

export function RoundStatusBadge({ round }: { round: Pick<Round, "start_at" | "end_at"> }) {
  const open = isRoundOpen(round);
  return (
    <Badge tone={open ? "green" : "gray"}>{open ? "Abierta" : "Cerrada"}</Badge>
  );
}
