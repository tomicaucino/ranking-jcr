-- Ranking JCR - Match Play
-- Esquema inicial: jugadores, fechas (rounds), partidos, perfiles/roles y RLS.
-- Correr una sola vez en el SQL editor de un proyecto Supabase nuevo (o vía Supabase CLI).

-- ============================================================================
-- Tablas
-- ============================================================================

create table if not exists public.players (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null unique,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  role text not null check (role in ('admin', 'player')),
  player_id uuid references public.players (id) on delete set null,
  created_at timestamptz not null default now()
);

create table if not exists public.rounds (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  start_at timestamptz not null,
  end_at timestamptz not null,
  created_at timestamptz not null default now(),
  constraint rounds_valid_window check (end_at > start_at)
);

create table if not exists public.matches (
  id uuid primary key default gen_random_uuid(),
  round_id uuid not null references public.rounds (id) on delete cascade,
  player1_id uuid not null references public.players (id) on delete restrict,
  player2_id uuid not null references public.players (id) on delete restrict,
  status text not null default 'pending' check (status in ('pending', 'played', 'walkover')),
  winner_id uuid references public.players (id) on delete restrict,
  result_text text,
  loaded_by uuid references auth.users (id) on delete set null,
  loaded_at timestamptz,
  created_at timestamptz not null default now(),
  constraint matches_distinct_players check (player1_id <> player2_id),
  constraint matches_winner_is_participant check (
    winner_id is null or winner_id in (player1_id, player2_id)
  )
);

create index if not exists matches_round_id_idx on public.matches (round_id);
create index if not exists matches_player1_id_idx on public.matches (player1_id);
create index if not exists matches_player2_id_idx on public.matches (player2_id);

-- ============================================================================
-- Funciones helper (usadas por las policies de RLS)
-- ============================================================================

create or replace function public.is_admin(uid uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles p
    where p.id = uid and p.role = 'admin'
  );
$$;

create or replace function public.current_player_id(uid uuid)
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select p.player_id from public.profiles p where p.id = uid;
$$;

-- ============================================================================
-- Trigger: reglas de negocio que no pueden expresarse solo con RLS por fila.
-- Un jugador (no admin) que edita "su" partido dentro de la ventana de la
-- fecha solo puede completar el resultado; no puede asignar un walkover ni
-- reasignar el partido a otra fecha/jugadores.
-- ============================================================================

create or replace function public.enforce_match_update_rules()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if public.is_admin(auth.uid()) then
    return new;
  end if;

  if new.round_id <> old.round_id
     or new.player1_id <> old.player1_id
     or new.player2_id <> old.player2_id then
    raise exception 'Solo el admin puede reasignar un partido';
  end if;

  if new.status = 'walkover' then
    raise exception 'Solo el admin puede asignar un walkover doble';
  end if;

  return new;
end;
$$;

drop trigger if exists matches_enforce_update_rules on public.matches;
create trigger matches_enforce_update_rules
  before update on public.matches
  for each row
  execute function public.enforce_match_update_rules();

-- ============================================================================
-- RLS
-- ============================================================================

alter table public.players enable row level security;
alter table public.profiles enable row level security;
alter table public.rounds enable row level security;
alter table public.matches enable row level security;

-- players: lectura para cualquier usuario autenticado, escritura solo admin
create policy players_select on public.players
  for select to authenticated
  using (true);

create policy players_insert on public.players
  for insert to authenticated
  with check (public.is_admin(auth.uid()));

create policy players_update on public.players
  for update to authenticated
  using (public.is_admin(auth.uid()))
  with check (public.is_admin(auth.uid()));

create policy players_delete on public.players
  for delete to authenticated
  using (public.is_admin(auth.uid()));

-- profiles: cada usuario ve su propio perfil; el admin ve y gestiona todos
create policy profiles_select_own on public.profiles
  for select to authenticated
  using (id = auth.uid() or public.is_admin(auth.uid()));

create policy profiles_insert_admin on public.profiles
  for insert to authenticated
  with check (public.is_admin(auth.uid()));

create policy profiles_update_admin on public.profiles
  for update to authenticated
  using (public.is_admin(auth.uid()))
  with check (public.is_admin(auth.uid()));

create policy profiles_delete_admin on public.profiles
  for delete to authenticated
  using (public.is_admin(auth.uid()));

-- rounds: lectura para cualquier usuario autenticado, escritura solo admin
create policy rounds_select on public.rounds
  for select to authenticated
  using (true);

create policy rounds_insert on public.rounds
  for insert to authenticated
  with check (public.is_admin(auth.uid()));

create policy rounds_update on public.rounds
  for update to authenticated
  using (public.is_admin(auth.uid()))
  with check (public.is_admin(auth.uid()));

create policy rounds_delete on public.rounds
  for delete to authenticated
  using (public.is_admin(auth.uid()));

-- matches: lectura para cualquier usuario autenticado
create policy matches_select on public.matches
  for select to authenticated
  using (true);

-- matches: alta/baja solo admin
create policy matches_insert on public.matches
  for insert to authenticated
  with check (public.is_admin(auth.uid()));

create policy matches_delete on public.matches
  for delete to authenticated
  using (public.is_admin(auth.uid()));

-- matches: el admin edita siempre; un jugador participante solo dentro de
-- la ventana de la fecha (el trigger de arriba restringe qué puede cambiar)
create policy matches_update on public.matches
  for update to authenticated
  using (
    public.is_admin(auth.uid())
    or (
      public.current_player_id(auth.uid()) in (player1_id, player2_id)
      and exists (
        select 1 from public.rounds r
        where r.id = matches.round_id
          and now() between r.start_at and r.end_at
      )
    )
  )
  with check (
    public.is_admin(auth.uid())
    or (
      public.current_player_id(auth.uid()) in (player1_id, player2_id)
      and exists (
        select 1 from public.rounds r
        where r.id = matches.round_id
          and now() between r.start_at and r.end_at
      )
    )
  );

-- ============================================================================
-- Primer admin (documentado también en el README):
-- 1) Crear el usuario en Supabase Dashboard -> Authentication -> Add user
-- 2) insert into public.profiles (id, role) values ('<uuid-del-usuario>', 'admin');
-- ============================================================================
