import { createClient } from "@/lib/supabase/server"
import { fetchLoans } from "@/lib/db/loans"
import { fetchMovements } from "@/lib/db/movements"
import type { DashboardStats, Loan, Movement } from "@/lib/types"

export interface SectorStat {
  sector: string
  boxes: number
  percentage: number
}

export interface MonthlyActivity {
  month: string
  movimentacoes: number
  emprestimos: number
}

export interface DashboardMeta {
  boxesCreatedThisMonth: number
  movementsThisMonth: number
  movementsLastMonth: number
  loansPending: number
  returnsOnTimePercent: number | null
}

export interface DashboardPageData {
  stats: DashboardStats
  meta: DashboardMeta
  sectorStats: SectorStat[]
  monthlyActivity: MonthlyActivity[]
  recentMovements: Movement[]
  recentLoans: Loan[]
}

const MONTH_LABELS = [
  "Jan",
  "Fev",
  "Mar",
  "Abr",
  "Mai",
  "Jun",
  "Jul",
  "Ago",
  "Set",
  "Out",
  "Nov",
  "Dez",
]

function monthKey(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`
}

function buildLast6MonthKeys(): string[] {
  const keys: string[] = []
  const d = new Date()
  d.setDate(1)
  for (let i = 5; i >= 0; i--) {
    const m = new Date(d.getFullYear(), d.getMonth() - i, 1)
    keys.push(monthKey(m))
  }
  return keys
}

function keyToLabel(key: string): string {
  const [, mm] = key.split("-")
  const idx = Number(mm) - 1
  return MONTH_LABELS[idx] ?? mm
}

async function optionalRpc(
  supabase: Awaited<ReturnType<typeof createClient>>,
  name: string
) {
  const { error } = await supabase.rpc(name)
  if (error && !error.message.includes("Could not find the function")) {
    throw new Error(error.message)
  }
}

export async function fetchDashboardData(): Promise<DashboardPageData> {
  const supabase = await createClient()

  await Promise.all([
    optionalRpc(supabase, "sync_loan_overdue"),
    optionalRpc(supabase, "sync_boxes_discard_eligibility"),
  ])

  const now = new Date()
  const startThisMonth = new Date(now.getFullYear(), now.getMonth(), 1)
  const startLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)
  const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1)
  const toIso = (d: Date) => d.toISOString()

  const monthKeys = buildLast6MonthKeys()
  const movementCounts = Object.fromEntries(
    monthKeys.map((k) => [k, 0])
  ) as Record<string, number>
  const loanCounts = Object.fromEntries(
    monthKeys.map((k) => [k, 0])
  ) as Record<string, number>

  const [
    totalBoxesRes,
    boxesMonthRes,
    totalMovementsRes,
    movementsRangeRes,
    activeLoansRes,
    pendingLoansRes,
    returnsRes,
    returnedDatesRes,
    occupiedRes,
    totalPositionsRes,
    readyDiscardRes,
    discardedRes,
    sectorRowsRes,
    loansRangeRes,
    recentMovements,
    recentLoans,
  ] = await Promise.all([
    supabase.from("boxes").select("id", { count: "exact", head: true }),
    supabase
      .from("boxes")
      .select("id", { count: "exact", head: true })
      .gte("created_at", toIso(startThisMonth)),
    supabase.from("movements").select("id", { count: "exact", head: true }),
    supabase
      .from("movements")
      .select("moved_at")
      .gte("moved_at", toIso(sixMonthsAgo)),
    supabase
      .from("loans")
      .select("id", { count: "exact", head: true })
      .in("status", ["pendente", "em_andamento", "atrasado"]),
    supabase
      .from("loans")
      .select("id", { count: "exact", head: true })
      .eq("status", "pendente"),
    supabase
      .from("loans")
      .select("id", { count: "exact", head: true })
      .eq("status", "devolvido"),
    supabase
      .from("loans")
      .select("return_date, return_deadline")
      .eq("status", "devolvido")
      .not("return_date", "is", null),
    supabase
      .from("positions")
      .select("id", { count: "exact", head: true })
      .eq("is_occupied", true),
    supabase.from("positions").select("id", { count: "exact", head: true }),
    supabase
      .from("boxes")
      .select("id", { count: "exact", head: true })
      .eq("status", "aguardando_descarte"),
    supabase
      .from("boxes")
      .select("id", { count: "exact", head: true })
      .eq("status", "descartada"),
    supabase.from("boxes").select("sector").neq("status", "descartada"),
    supabase
      .from("loans")
      .select("created_at")
      .gte("created_at", toIso(sixMonthsAgo)),
    fetchMovements(),
    fetchLoans(),
  ])

  const errors = [
    totalBoxesRes.error,
    boxesMonthRes.error,
    totalMovementsRes.error,
    movementsRangeRes.error,
    activeLoansRes.error,
    pendingLoansRes.error,
    returnsRes.error,
    returnedDatesRes.error,
    occupiedRes.error,
    totalPositionsRes.error,
    readyDiscardRes.error,
    discardedRes.error,
    sectorRowsRes.error,
    loansRangeRes.error,
  ].filter(Boolean)

  if (errors[0]) throw new Error(errors[0]!.message)

  for (const row of movementsRangeRes.data ?? []) {
    const k = monthKey(new Date(row.moved_at))
    if (k in movementCounts) movementCounts[k]++
  }

  for (const row of loansRangeRes.data ?? []) {
    const k = monthKey(new Date(row.created_at))
    if (k in loanCounts) loanCounts[k]++
  }

  let movementsThisMonth = 0
  let movementsLastMonth = 0
  for (const row of movementsRangeRes.data ?? []) {
    const d = new Date(row.moved_at)
    if (d >= startThisMonth) movementsThisMonth++
    else if (d >= startLastMonth && d < startThisMonth) movementsLastMonth++
  }

  const sectorMap = new Map<string, number>()
  for (const row of sectorRowsRes.data ?? []) {
    const s = row.sector as string
    sectorMap.set(s, (sectorMap.get(s) ?? 0) + 1)
  }
  const totalSectorBoxes = [...sectorMap.values()].reduce((a, b) => a + b, 0)
  const sectorStats: SectorStat[] = [...sectorMap.entries()]
    .map(([sector, boxes]) => ({
      sector,
      boxes,
      percentage:
        totalSectorBoxes > 0
          ? Math.round((boxes / totalSectorBoxes) * 1000) / 10
          : 0,
    }))
    .sort((a, b) => b.boxes - a.boxes)

  const occupied = occupiedRes.count ?? 0
  const totalPositions = totalPositionsRes.count ?? 0
  const freeSpaces = Math.max(0, totalPositions - occupied)
  const occupancyPercentage =
    totalPositions > 0
      ? Math.round((occupied / totalPositions) * 1000) / 10
      : 0

  const totalReturns = returnsRes.count ?? 0
  const onTimeReturns = (returnedDatesRes.data ?? []).filter(
    (row) => row.return_date <= row.return_deadline
  ).length
  const returnsOnTimePercent =
    totalReturns > 0
      ? Math.round((onTimeReturns / totalReturns) * 100)
      : null

  const stats: DashboardStats = {
    totalBoxes: totalBoxesRes.count ?? 0,
    totalMovements: totalMovementsRes.count ?? 0,
    totalLoans: activeLoansRes.count ?? 0,
    totalReturns,
    occupiedSpaces: occupied,
    freeSpaces,
    occupancyPercentage,
    boxesReadyForDiscard: readyDiscardRes.count ?? 0,
    boxesDiscarded: discardedRes.count ?? 0,
    spaceRecovered: discardedRes.count ?? 0,
  }

  return {
    stats,
    meta: {
      boxesCreatedThisMonth: boxesMonthRes.count ?? 0,
      movementsThisMonth,
      movementsLastMonth,
      loansPending: pendingLoansRes.count ?? 0,
      returnsOnTimePercent,
    },
    sectorStats,
    monthlyActivity: monthKeys.map((key) => ({
      month: keyToLabel(key),
      movimentacoes: movementCounts[key] ?? 0,
      emprestimos: loanCounts[key] ?? 0,
    })),
    recentMovements: recentMovements.slice(0, 5),
    recentLoans: recentLoans.slice(0, 5),
  }
}
