-- Agrega la posibilidad de que un partido termine empatado ("AS" / halved match).
-- Un empate no tiene ganador (winner_id null, igual que walkover) y, a diferencia
-- del walkover, cualquiera de los dos jugadores participantes lo puede cargar
-- dentro de la ventana de la fecha (la policy/trigger de matches_update ya lo
-- permite: solo bloquea explícitamente el status 'walkover' para no-admins).

alter table public.matches
  drop constraint if exists matches_status_check,
  add constraint matches_status_check
    check (status in ('pending', 'played', 'walkover', 'draw'));
