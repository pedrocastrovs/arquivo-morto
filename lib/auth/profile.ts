import { createClient } from "@/lib/supabase/server"
import type { UserRole } from "@/lib/types"

export interface CurrentProfile {
  id: string
  name: string
  email: string
  role: UserRole
}

export async function getCurrentProfile(): Promise<CurrentProfile | null> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return null

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, name, email, role")
    .eq("id", user.id)
    .single()

  if (profile) {
    return {
      id: profile.id,
      name: profile.name,
      email: profile.email,
      role: profile.role as UserRole,
    }
  }

  return {
    id: user.id,
    name: user.email?.split("@")[0] ?? "Usuário",
    email: user.email ?? "",
    role: "operador",
  }
}

export async function isAdministrator(): Promise<boolean> {
  const profile = await getCurrentProfile()
  return profile?.role === "administrador"
}

export async function canManageBoxes(): Promise<boolean> {
  const profile = await getCurrentProfile()
  return (
    profile?.role === "administrador" || profile?.role === "operador"
  )
}

/** Estrutura física, setores e unidades (cadastro no depósito). */
export async function canManageStructure(): Promise<boolean> {
  return canManageBoxes()
}
