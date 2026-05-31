import { createClient } from "@/lib/supabase/server"
import type { UserRole } from "@/lib/types"

export interface SectorRecord {
  id: string
  name: string
}

export interface UnitRecord {
  id: string
  name: string
}

export interface ProfileRecord {
  id: string
  name: string
  email: string
  role: UserRole
  sector: string | null
}

export async function fetchSectorRecords(): Promise<SectorRecord[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("sectors")
    .select("id, name")
    .order("name")
  if (error) throw new Error(error.message)
  return data ?? []
}

export async function fetchUnitRecords(): Promise<UnitRecord[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("units")
    .select("id, name")
    .order("name")
  if (error) throw new Error(error.message)
  return data ?? []
}

export async function fetchProfileRecords(): Promise<ProfileRecord[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("profiles")
    .select("id, name, email, role, sector")
    .order("name")
  if (error) throw new Error(error.message)
  return (data ?? []).map((row) => ({
    id: row.id,
    name: row.name,
    email: row.email,
    role: row.role as UserRole,
    sector: row.sector,
  }))
}
