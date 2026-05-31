import { createClient } from "@/lib/supabase/server"
import type { Movement } from "@/lib/types"

type MovementRow = {
  id: string
  box_id: string
  box_code: string
  moved_at: string
  user_name: string
  previous_location: string
  new_location: string
  reason: string
}

function formatMovedAt(iso: string): { date: string; time: string } {
  const d = new Date(iso)
  return {
    date: d.toLocaleDateString("pt-BR"),
    time: d.toLocaleTimeString("pt-BR", {
      hour: "2-digit",
      minute: "2-digit",
    }),
  }
}

function mapMovement(row: MovementRow): Movement {
  const { date, time } = formatMovedAt(row.moved_at)
  return {
    id: row.id,
    boxId: row.box_id,
    boxCode: row.box_code,
    date,
    time,
    user: row.user_name,
    previousLocation: row.previous_location,
    newLocation: row.new_location,
    reason: row.reason,
  }
}

export async function fetchMovements(): Promise<Movement[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("movements")
    .select(
      "id, box_id, box_code, moved_at, user_name, previous_location, new_location, reason"
    )
    .order("moved_at", { ascending: false })

  if (error) {
    throw new Error(error.message)
  }

  return (data ?? []).map((row) => mapMovement(row as MovementRow))
}
