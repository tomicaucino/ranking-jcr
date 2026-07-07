// Tipos de dominio, reflejan el esquema de supabase/migrations/*.sql

export type Role = "admin" | "player";

export type MatchStatus = "pending" | "played" | "walkover" | "draw";

export interface Player {
  id: string;
  name: string;
  email: string;
  active: boolean;
  created_at: string;
}

export interface Profile {
  id: string;
  role: Role;
  player_id: string | null;
  created_at: string;
}

export interface Round {
  id: string;
  name: string;
  start_at: string;
  end_at: string;
  created_at: string;
}

export interface Match {
  id: string;
  round_id: string;
  player1_id: string;
  player2_id: string;
  status: MatchStatus;
  winner_id: string | null;
  result_text: string | null;
  loaded_by: string | null;
  loaded_at: string | null;
  created_at: string;
}

export interface Standing {
  player: Player;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  points: number;
}

/** Estado devuelto por los Server Actions de formularios (para useActionState). */
export type ActionState = { error?: string } | undefined;
