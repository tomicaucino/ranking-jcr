"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { Label } from "@/components/ui/input";
import type { ActionState, Player } from "@/lib/types";

export function MatchForm({
  action,
  players,
}: {
  action: (state: ActionState, formData: FormData) => Promise<ActionState>;
  players: Player[];
}) {
  const [state, formAction, pending] = useActionState(action, undefined);

  return (
    <form action={formAction} className="flex flex-col gap-3 sm:flex-row sm:items-end">
      <div className="flex-1">
        <Label htmlFor="player1_id">Jugador 1</Label>
        <Select id="player1_id" name="player1_id" defaultValue="" required>
          <option value="" disabled>
            Elegir jugador
          </option>
          {players.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </Select>
      </div>
      <div className="flex-1">
        <Label htmlFor="player2_id">Jugador 2</Label>
        <Select id="player2_id" name="player2_id" defaultValue="" required>
          <option value="" disabled>
            Elegir jugador
          </option>
          {players.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </Select>
      </div>
      <Button type="submit" disabled={pending}>
        {pending ? "Agregando..." : "Agregar partido"}
      </Button>
      {state?.error && <p className="text-sm text-red-600 sm:basis-full">{state.error}</p>}
    </form>
  );
}
