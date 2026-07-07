"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import type { ActionState, Player } from "@/lib/types";

export function PlayerForm({
  action,
  player,
}: {
  action: (state: ActionState, formData: FormData) => Promise<ActionState>;
  player?: Player;
}) {
  const [state, formAction, pending] = useActionState(action, undefined);

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <div>
        <Label htmlFor="name">Nombre</Label>
        <Input id="name" name="name" defaultValue={player?.name} required />
      </div>
      <div>
        <Label htmlFor="email">Email</Label>
        <Input id="email" name="email" type="email" defaultValue={player?.email} required />
      </div>
      {!player && (
        <div>
          <Label htmlFor="password">Contraseña inicial</Label>
          <Input id="password" name="password" type="text" minLength={6} required />
          <p className="mt-1 text-xs text-muted">
            Compartisela al jugador; la puede cambiar después desde su cuenta de Supabase.
          </p>
        </div>
      )}
      {player && (
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" name="active" defaultChecked={player.active} className="h-4 w-4" />
          Jugador activo
        </label>
      )}
      {state?.error && <p className="text-sm text-red-600">{state.error}</p>}
      <Button type="submit" disabled={pending}>
        {pending ? "Guardando..." : player ? "Guardar cambios" : "Crear jugador"}
      </Button>
    </form>
  );
}
