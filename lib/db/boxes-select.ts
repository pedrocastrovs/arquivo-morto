import { createClient } from "@/lib/supabase/server"

export interface BoxOption {
  id: string
  code: string
  description: string
  locationPath: string
}

/** Caixas que podem ser movimentadas (não descartadas). */
export async function fetchBoxesForMovement(): Promise<BoxOption[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("boxes")
    .select("id, code, description, location_path, status")
    .neq("status", "descartada")
    .order("code")

  if (error) {
    throw new Error(error.message)
  }

  return (data ?? []).map((row) => ({
    id: row.id,
    code: row.code,
    description: row.description,
    locationPath: row.location_path,
  }))
}

/** Caixas arquivadas sem empréstimo ativo (para novo empréstimo). */
export async function fetchBoxesForLoan(): Promise<BoxOption[]> {
  const supabase = await createClient()

  const { data: activeLoans, error: loansError } = await supabase
    .from("loans")
    .select("box_id")
    .in("status", ["pendente", "em_andamento", "atrasado"])

  if (loansError) {
    throw new Error(loansError.message)
  }

  const busyBoxIds = new Set((activeLoans ?? []).map((l) => l.box_id))

  const { data, error } = await supabase
    .from("boxes")
    .select("id, code, description, location_path")
    .eq("status", "arquivada")
    .order("code")

  if (error) {
    throw new Error(error.message)
  }

  return (data ?? [])
    .filter((row) => !busyBoxIds.has(row.id))
    .map((row) => ({
      id: row.id,
      code: row.code,
      description: row.description,
      locationPath: row.location_path,
    }))
}
