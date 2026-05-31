import type { Movement } from "@/lib/types"

export interface MovementStats {
  total: number
  thisMonth: number
  today: number
  activeUsers: number
}

export function computeMovementStats(movements: Movement[]): MovementStats {
  const now = new Date()
  const todayStr = now.toLocaleDateString("pt-BR")
  const monthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`

  let thisMonth = 0
  let today = 0
  const users = new Set<string>()

  for (const m of movements) {
    users.add(m.user)
    const parts = m.date.split("/")
    if (parts.length === 3) {
      const isoMonth = `${parts[2]}-${parts[1].padStart(2, "0")}`
      if (isoMonth === monthKey) thisMonth++
    }
    if (m.date === todayStr) today++
  }

  return {
    total: movements.length,
    thisMonth,
    today,
    activeUsers: users.size,
  }
}
