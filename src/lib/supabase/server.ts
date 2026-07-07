import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

// Cliente para usar en Server Components, Server Actions y Route Handlers.
// Respeta la sesión del usuario logueado (y por lo tanto las policies de RLS).
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Se llama desde un Server Component sin permiso de escritura;
            // el proxy.ts se encarga de refrescar la sesión en ese caso.
          }
        },
      },
    }
  );
}
