# Ranking JCR — Match Play

Aplicación para gestionar el ranking de **Match Play** del Jockey Club de Rosario. La sección de **Medal Play** existe como placeholder ("Próximamente").

## Stack

- **Next.js 16 (App Router) + TypeScript + Tailwind CSS v4**
- **Supabase**: Postgres + Auth + Row Level Security (sin ORM, `@supabase/supabase-js` vía `@supabase/ssr`)
- Mutaciones vía **Server Actions** (sin API routes separadas)
- Despliegue pensado para **Vercel** (frontend) + **Supabase** (backend), corre igual en local

> Nota sobre Next.js 16: el archivo `middleware.ts` fue renombrado a `proxy.ts` (ver [`src/proxy.ts`](src/proxy.ts)). Si en algún momento actualizás a una versión de Next donde esto vuelva a cambiar, ajustá ese archivo.

## Estructura del proyecto

```
src/
  app/
    login/                     Login (email + contraseña)
    (app)/                     Rutas autenticadas (layout con nav + guard de sesión)
      ranking/                 Tabla de posiciones
      rounds/                  Listado y detalle de fechas
      matches/[id]/            Detalle de partido + carga de resultado
      medal-play/              Placeholder "Próximamente"
      admin/                   Solo rol admin (layout con guard adicional)
        players/                 Alta/edición de jugadores
        rounds/                  Alta/edición de fechas y sus partidos
  components/
    ui/                        Primitivas propias (Button, Card, Input, Select, Badge, Table)
    admin/                     Formularios y filas de la sección admin
  lib/
    supabase/                  Clientes: client.ts (browser), server.ts (server), admin.ts (secret key)
    actions/                   Server Actions: auth, players, rounds, matches
    ranking.ts                 Cálculo de la tabla de posiciones (función pura y aislada)
    matches.ts                 Reglas de ventana de carga (isRoundOpen, canPlayerLoadResult)
    auth.ts                    Helpers de sesión/rol (getCurrentProfile, requireAdmin, ...)
supabase/
  migrations/                  0001_init.sql (esquema, RLS, funciones y triggers) + migraciones incrementales posteriores
```

## Decisiones tomadas (y por qué)

- **RLS + trigger, no solo chequeos en el frontend.** Las reglas de negocio (un jugador solo edita sus propios partidos, solo dentro de la ventana de la fecha; el walkover doble es exclusivo del admin) están implementadas en Postgres (`supabase/migrations/0001_init.sql`), no solo en la UI. Esto es intencional: cada Server Action de Next.js es su propio endpoint, así que confiar solo en la navegación de la app para "proteger" una acción es frágil. La UI repite las mismas validaciones (en `lib/matches.ts`) únicamente para dar buen feedback antes de tocar el servidor.
- **Alta de jugadores con contraseña definida por el admin.** Al crear un jugador, el admin le pone una contraseña inicial (no hay invitación por email), así no depende de configurar un proveedor SMTP en Supabase. El jugador puede cambiarla después desde Supabase (o se puede agregar un flujo de "cambiar contraseña" más adelante).
- **Baja de jugador = soft delete.** "Quitar" un jugador marca `active = false` en vez de borrar la fila, para no romper el historial de partidos ya jugados ni la integridad del ranking. Los jugadores inactivos siguen apareciendo en el ranking (con una etiqueta "Inactivo") pero no aparecen como opción al crear partidos nuevos.
- **El estado de una fecha (abierta/cerrada) no se guarda.** Se calcula en el momento comparando la hora actual contra `start_at`/`end_at`. Así nunca queda desincronizado.
- **El puntaje no se guarda en la base.** Se calcula siempre a partir de `status`/`winner_id` de cada partido, en `lib/ranking.ts`. Si el club cambia el sistema de puntos o el criterio de desempate, ese es el único archivo a tocar (ver constante `POINTS` y la función `calculateStandings`).
- **Sin librería de componentes externa.** Se usaron primitivas Tailwind propias en `components/ui` para no depender de un instalador interactivo (shadcn CLI); son fáciles de reemplazar más adelante si hace falta algo más completo.
- **Sin tipos generados de Supabase.** Las consultas devuelven tipos inferidos y se castean a los tipos de dominio en `lib/types.ts`. Cuando el proyecto Supabase esté creado, se puede correr `npx supabase gen types typescript` y reemplazar los `as Player[]` por tipos generados reales.

## Puesta en marcha

### 1. Crear el proyecto en Supabase

1. Creá un proyecto en [supabase.com](https://supabase.com).
2. Andá a **SQL Editor** y ejecutá, en orden, el contenido de cada archivo de [`supabase/migrations/`](supabase/migrations/) (`0001_init.sql`, después `0002_add_draw_status.sql`, etc.).
3. En **Project Settings → API** copiá la Project URL, la Publishable/anon key y la Secret/service_role key.

### 2. Variables de entorno

```bash
cp .env.example .env.local
```

Completá `.env.local` con los tres valores del paso anterior.

### 3. Crear el primer admin

No hay self-signup: el primer usuario admin se crea a mano.

1. En Supabase Dashboard → **Authentication → Users → Add user**, creá un usuario con email + contraseña.
2. Copiá su UUID.
3. En el SQL Editor:
   ```sql
   insert into public.profiles (id, role) values ('<uuid-del-usuario>', 'admin');
   ```
4. Ya podés loguearte con ese usuario en `/login` y vas a ver la sección **Admin** en la navegación.

Desde ahí, el admin carga los 12 jugadores desde `/admin/players` (cada uno con su email y una contraseña inicial), crea las fechas desde `/admin/rounds`, y agrega los partidos de cada fecha desde el detalle de la fecha.

### 4. Correr en local

```bash
npm install
npm run dev
```

Abrí [http://localhost:3000](http://localhost:3000).

### 5. Desplegar

- **Frontend:** importar el repo en Vercel, configurar las mismas 3 variables de entorno.
- **Backend:** ya está corriendo en Supabase, no requiere despliegue adicional.

## Ajustar la lógica de puntaje

Toda la lógica de ranking vive en [`src/lib/ranking.ts`](src/lib/ranking.ts):

- `POINTS`: victoria = 3, empate = 1 (para cada jugador), derrota = 0, walkover doble = -1 (para cada jugador).
- `calculateStandings`: orden de la tabla (hoy: puntos desc, luego diferencia ganados/jugados desc).

Un partido de match play puede terminar empatado ("AS", all square, cuando ninguno de los dos jugadores queda arriba al terminar el recorrido). A diferencia del walkover, el empate lo puede cargar cualquiera de los dos jugadores del partido (no es exclusivo del admin): en el formulario de carga de resultado, "Empate" es una tercera opción junto a los dos jugadores.

## Medal Play

`src/app/(app)/medal-play/page.tsx` es un placeholder sin lógica. Cuando se decida construir esa sección, probablemente convenga replicar la misma estructura que Match Play (tablas propias, o reutilizar `rounds`/`players` si aplica un formato similar).
