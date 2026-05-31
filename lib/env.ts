function required(name: string, value: string | undefined): string {
  if (!value || value.includes("SEU_PROJECT") || value.includes("sua_")) {
    throw new Error(
      `Variável de ambiente ausente ou inválida: ${name}. Configure em .env.local`
    )
  }
  return value
}

export function getSupabaseUrl(): string {
  return required(
    "NEXT_PUBLIC_SUPABASE_URL",
    process.env.NEXT_PUBLIC_SUPABASE_URL
  )
}

/** Chave pública (publishable ou anon legada). */
export function getSupabasePublishableKey(): string {
  const key =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  return required("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY", key)
}

/** Chave secreta (secret ou service_role legada). Apenas no servidor. */
export function getSupabaseSecretKey(): string {
  const key =
    process.env.SUPABASE_SECRET_KEY ?? process.env.SUPABASE_SERVICE_ROLE_KEY

  return required("SUPABASE_SECRET_KEY", key)
}

export function isSupabaseConfigured(): boolean {
  try {
    getSupabaseUrl()
    getSupabasePublishableKey()
    return true
  } catch {
    return false
  }
}
