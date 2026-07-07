"use client";

import { useActionState, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import type { ActionState, Round } from "@/lib/types";

/** Convierte un ISO string a formato "YYYY-MM-DDTHH:mm" para <input type="datetime-local">. */
function toDatetimeLocal(iso: string) {
  const date = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

/**
 * `<input type="datetime-local">` no lleva zona horaria: el valor "vale" en
 * la hora local del navegador de quien lo carga. Lo convertimos acá mismo
 * (en el cliente) a un ISO string con offset explícito antes de enviarlo,
 * para que el servidor no lo reinterprete en su propia zona horaria.
 */
function localToIso(local: string) {
  return local ? new Date(local).toISOString() : "";
}

export function RoundForm({
  action,
  round,
}: {
  action: (state: ActionState, formData: FormData) => Promise<ActionState>;
  round?: Round;
}) {
  const [state, formAction, pending] = useActionState(action, undefined);
  const [startLocal, setStartLocal] = useState(round ? toDatetimeLocal(round.start_at) : "");
  const [endLocal, setEndLocal] = useState(round ? toDatetimeLocal(round.end_at) : "");

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <div>
        <Label htmlFor="name">Nombre de la fecha</Label>
        <Input id="name" name="name" placeholder="Ej: Fecha 1" defaultValue={round?.name} required />
      </div>
      <div>
        <Label htmlFor="start_at_local">Inicio</Label>
        <Input
          id="start_at_local"
          type="datetime-local"
          value={startLocal}
          onChange={(e) => setStartLocal(e.target.value)}
          required
        />
        <input type="hidden" name="start_at" value={localToIso(startLocal)} />
      </div>
      <div>
        <Label htmlFor="end_at_local">Fin</Label>
        <Input
          id="end_at_local"
          type="datetime-local"
          value={endLocal}
          onChange={(e) => setEndLocal(e.target.value)}
          required
        />
        <input type="hidden" name="end_at" value={localToIso(endLocal)} />
      </div>
      {state?.error && <p className="text-sm text-red-600">{state.error}</p>}
      <Button type="submit" disabled={pending}>
        {pending ? "Guardando..." : round ? "Guardar cambios" : "Crear fecha"}
      </Button>
    </form>
  );
}
