import { createClient } from "@supabase/supabase-js";

const supabaseUrl =
  import.meta.env.VITE_SUPABASE_URL || "https://placeholder.supabase.co";
const supabaseAnonKey =
  import.meta.env.VITE_SUPABASE_ANON_KEY || "placeholder-anon-key";

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: false,
    storageKey: "sb-crokets-pos-auth-token",
    flowType: "pkce",
  },
});

// Calienta la conexión con Supabase al arrancar la app (TLS + conexión HTTP) para
// que el primer login no pague ese cold start dentro del submit.
export const warmupSupabaseConnection = () => {
  if (!supabaseUrl) return;

  fetch(`${supabaseUrl}/auth/v1/health`, {
    headers: { apikey: supabaseAnonKey },
  }).catch(() => {});
};
