"use client";

import { useActionState, useState } from "react";
import type { ActionState, Player } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { Input, Label } from "@/components/ui/input";
import { cn } from "@/lib/cn";
import { matchPlayResultOptions } from "@/lib/matches";

const OPTIONS = matchPlayResultOptions();
const DRAW_RESULT_TEXT = "AS";

type Outcome = "player1" | "player2" | "draw";

export function MatchResultForm({
  action,
  player1,
  player2,
  defaultWinnerId,
  defaultResultText,
  defaultIsDraw = false,
  submitLabel = "Confirmar resultado",
}: {
  action: (state: ActionState, formData: FormData) => Promise<ActionState>;
  player1: Player;
  player2: Player;
  defaultWinnerId?: string | null;
  defaultResultText?: string | null;
  defaultIsDraw?: boolean;
  submitLabel?: string;
}) {
  const [state, formAction, pending] = useActionState(action, undefined);
  const [outcome, setOutcome] = useState<Outcome | null>(
    defaultIsDraw
      ? "draw"
      : defaultWinnerId === player1.id
        ? "player1"
        : defaultWinnerId === player2.id
          ? "player2"
          : null
  );
  const isPresetOption = !defaultResultText || OPTIONS.includes(defaultResultText);
  const [useCustom, setUseCustom] = useState(!defaultIsDraw && !isPresetOption);
  const [resultChoice, setResultChoice] = useState(
    isPresetOption && defaultResultText ? defaultResultText : OPTIONS[0]
  );
  const [customText, setCustomText] = useState(
    !defaultIsDraw && !isPresetOption ? (defaultResultText ?? "") : ""
  );

  const winnerId =
    outcome === "player1" ? player1.id : outcome === "player2" ? player2.id : "";
  const resultText = outcome === "draw" ? DRAW_RESULT_TEXT : useCustom ? customText : resultChoice;
  const canSubmit =
    outcome !== null && (outcome === "draw" || !useCustom || customText.trim().length > 0);

  return (
    <form action={formAction} className="flex flex-col gap-5">
      <div>
        <Label>¿Quién ganó? (paso 1 de 2)</Label>
        <div className="grid grid-cols-3 gap-3">
          <OutcomeButton
            label={player1.name}
            active={outcome === "player1"}
            onClick={() => setOutcome("player1")}
          />
          <OutcomeButton
            label="Empate"
            active={outcome === "draw"}
            onClick={() => setOutcome("draw")}
          />
          <OutcomeButton
            label={player2.name}
            active={outcome === "player2"}
            onClick={() => setOutcome("player2")}
          />
        </div>
        <input type="hidden" name="winner_id" value={winnerId} />
        <input type="hidden" name="is_draw" value={outcome === "draw" ? "true" : "false"} />
      </div>

      {outcome !== "draw" && (
        <div>
          <Label htmlFor="result_select">Resultado (paso 2 de 2)</Label>
          {!useCustom ? (
            <Select
              id="result_select"
              value={resultChoice}
              onChange={(e) => setResultChoice(e.target.value)}
            >
              {OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </Select>
          ) : (
            <Input
              placeholder="Ej: 3&2"
              value={customText}
              onChange={(e) => setCustomText(e.target.value)}
            />
          )}
          <button
            type="button"
            className="mt-1.5 text-sm font-medium text-primary-600 underline"
            onClick={() => setUseCustom((v) => !v)}
          >
            {useCustom ? "Elegir de la lista" : "Cargar otro resultado"}
          </button>
        </div>
      )}
      <input type="hidden" name="result_text" value={resultText} />

      {state?.error && <p className="text-sm text-red-600">{state.error}</p>}

      <Button type="submit" size="lg" disabled={!canSubmit || pending}>
        {pending ? "Guardando..." : submitLabel}
      </Button>
    </form>
  );
}

function OutcomeButton({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-lg border-2 px-3 py-4 text-center text-sm font-medium transition-colors sm:text-base",
        active
          ? "border-primary-600 bg-primary-50 text-primary-800"
          : "border-border hover:border-primary-300"
      )}
    >
      {label}
    </button>
  );
}
