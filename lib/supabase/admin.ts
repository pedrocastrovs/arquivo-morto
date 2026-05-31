import { createClient } from "@supabase/supabase-js"
import { getSupabaseSecretKey, getSupabaseUrl } from "@/lib/env"

/** Cliente com privilégios elevados — usar só em Server Actions / rotas de API. */
export function createAdminClient() {
  return createClient(getSupabaseUrl(), getSupabaseSecretKey(), {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })
}
