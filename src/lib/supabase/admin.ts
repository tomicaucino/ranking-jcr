import "server-only";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";

// Cliente con la secret key: ignora RLS por completo.
// Uso exclusivo: Server Actions de administración que necesitan crear/borrar
// usuarios de Supabase Auth (auth.admin.*). NUNCA importar desde código de cliente.
export function createAdminClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SECRET_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );
}
