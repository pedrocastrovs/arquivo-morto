"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Package,
  ArrowRightLeft,
  FileOutput,
  RotateCcw,
  MapPin,
  Trash2,
  TrendingUp,
  Clock,
} from "lucide-react"
import type {
  DashboardMeta,
  DashboardPageData,
  MonthlyActivity,
  SectorStat,
} from "@/lib/db/dashboard"
import type { DashboardStats, Loan, Movement } from "@/lib/types"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
} from "recharts"

const COLORS = ["#3b82f6", "#22c55e", "#f59e0b", "#ef4444", "#8b5cf6"]

const statusColors: Record<string, string> = {
  pendente: "bg-warning text-warning-foreground",
  em_andamento: "bg-primary text-primary-foreground",
  devolvido: "bg-success text-success-foreground",
  atrasado: "bg-destructive text-destructive-foreground",
}

const statusLabels: Record<string, string> = {
  pendente: "Pendente",
  em_andamento: "Em Andamento",
  devolvido: "Devolvido",
  atrasado: "Atrasado",
}

type DashboardContentProps = DashboardPageData

function movementChangeLabel(meta: DashboardMeta): string {
  if (meta.movementsLastMonth === 0) {
    return meta.movementsThisMonth > 0
      ? `${meta.movementsThisMonth} este mês`
      : "Sem movimentações no período"
  }
  const pct = Math.round(
    ((meta.movementsThisMonth - meta.movementsLastMonth) /
      meta.movementsLastMonth) *
      100
  )
  const sign = pct >= 0 ? "+" : ""
  return `${sign}${pct}% vs mês anterior`
}

function returnsSubtitle(meta: DashboardMeta): string {
  if (meta.returnsOnTimePercent === null) return "Sem devoluções registradas"
  return `${meta.returnsOnTimePercent}% no prazo`
}

export function DashboardContent({
  stats,
  meta,
  sectorStats,
  monthlyActivity,
  recentMovements,
  recentLoans,
}: DashboardContentProps) {
  const statCards = buildStatCards(stats, meta)
  const capacityCards = buildCapacityCards(stats)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground">
          Visão geral do Sistema de Gestão de Arquivo Morto
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat) => (
          <Card key={stat.title} className="bg-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{stat.title}</p>
                  <p className="mt-1 text-3xl font-bold text-foreground">
                    {stat.value}
                  </p>
                  <p
                    className={`mt-1 text-xs ${
                      stat.changeType === "positive"
                        ? "text-success"
                        : "text-muted-foreground"
                    }`}
                  >
                    {stat.change}
                  </p>
                </div>
                <div className="rounded-lg bg-primary/10 p-3">
                  <stat.icon className="h-6 w-6 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {capacityCards.map((card) => (
          <Card key={card.title} className="bg-card">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-secondary p-2">
                  <card.icon className="h-5 w-5 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{card.title}</p>
                  <p className="text-xl font-semibold text-foreground">
                    {card.value}
                  </p>
                  <p className="text-xs text-muted-foreground">{card.subtitle}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <MonthlyChart data={monthlyActivity} />
        <SectorChart data={sectorStats} />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <RecentMovements movements={recentMovements} />
        <RecentLoans loans={recentLoans} />
      </div>
    </div>
  )
}

function buildStatCards(stats: DashboardStats, meta: DashboardMeta) {
  return [
    {
      title: "Total de Caixas",
      value: stats.totalBoxes.toLocaleString("pt-BR"),
      icon: Package,
      change:
        meta.boxesCreatedThisMonth > 0
          ? `+${meta.boxesCreatedThisMonth} este mês`
          : "Nenhuma nova este mês",
      changeType: "positive" as const,
    },
    {
      title: "Movimentações",
      value: stats.totalMovements.toLocaleString("pt-BR"),
      icon: ArrowRightLeft,
      change: movementChangeLabel(meta),
      changeType:
        meta.movementsThisMonth >= meta.movementsLastMonth
          ? ("positive" as const)
          : ("neutral" as const),
    },
    {
      title: "Empréstimos Ativos",
      value: stats.totalLoans.toLocaleString("pt-BR"),
      icon: FileOutput,
      change:
        meta.loansPending > 0
          ? `${meta.loansPending} pendentes`
          : "Nenhum pendente",
      changeType: "neutral" as const,
    },
    {
      title: "Devoluções",
      value: stats.totalReturns.toLocaleString("pt-BR"),
      icon: RotateCcw,
      change: returnsSubtitle(meta),
      changeType: "positive" as const,
    },
  ]
}

function buildCapacityCards(stats: DashboardStats) {
  return [
    {
      title: "Espaços Ocupados",
      value: stats.occupiedSpaces.toLocaleString("pt-BR"),
      icon: MapPin,
      subtitle: `${stats.occupancyPercentage}% de ocupação`,
    },
    {
      title: "Espaços Livres",
      value: stats.freeSpaces.toLocaleString("pt-BR"),
      icon: MapPin,
      subtitle: "Disponíveis para uso",
    },
    {
      title: "Aptas para Descarte",
      value: stats.boxesReadyForDiscard.toLocaleString("pt-BR"),
      icon: Trash2,
      subtitle: "Aguardando aprovação",
    },
    {
      title: "Espaço Recuperado",
      value: stats.spaceRecovered.toLocaleString("pt-BR"),
      icon: TrendingUp,
      subtitle: "Caixas descartadas",
    },
  ]
}

function MonthlyChart({ data }: { data: MonthlyActivity[] }) {
  return (
    <Card className="bg-card">
      <CardHeader>
        <CardTitle className="text-foreground">Movimentações por Mês</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-80">
          {data.every((d) => d.movimentacoes === 0 && d.emprestimos === 0) ? (
            <p className="flex h-full items-center justify-center text-sm text-muted-foreground">
              Sem dados nos últimos 6 meses
            </p>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="month" stroke="#9ca3af" />
                <YAxis stroke="#9ca3af" allowDecimals={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#1f2937",
                    border: "1px solid #374151",
                    borderRadius: "8px",
                  }}
                  labelStyle={{ color: "#f3f4f6" }}
                />
                <Legend />
                <Bar
                  dataKey="movimentacoes"
                  name="Movimentações"
                  fill="#3b82f6"
                  radius={[4, 4, 0, 0]}
                />
                <Bar
                  dataKey="emprestimos"
                  name="Empréstimos"
                  fill="#22c55e"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

function SectorChart({ data }: { data: SectorStat[] }) {
  return (
    <Card className="bg-card">
      <CardHeader>
        <CardTitle className="text-foreground">Distribuição por Setor</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-80">
          {data.length === 0 ? (
            <p className="flex h-full items-center justify-center text-sm text-muted-foreground">
              Nenhuma caixa cadastrada
            </p>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={2}
                  dataKey="boxes"
                  nameKey="sector"
                  label={({ sector, percentage }) =>
                    `${sector}: ${percentage}%`
                  }
                  labelLine={false}
                >
                  {data.map((_, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#1f2937",
                    border: "1px solid #374151",
                    borderRadius: "8px",
                  }}
                  formatter={(value: number) => [`${value} caixas`, "Quantidade"]}
                />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

function RecentMovements({ movements }: { movements: Movement[] }) {
  return (
    <Card className="bg-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-foreground">
          <Clock className="h-5 w-5" />
          Últimas Movimentações
        </CardTitle>
      </CardHeader>
      <CardContent>
        {movements.length === 0 ? (
          <p className="py-4 text-center text-sm text-muted-foreground">
            Nenhuma movimentação registrada.
          </p>
        ) : (
          <div className="space-y-4">
            {movements.map((movement) => (
              <div
                key={movement.id}
                className="flex items-start justify-between border-b border-border pb-4 last:border-0 last:pb-0"
              >
                <div className="space-y-1">
                  <p className="font-medium text-foreground">{movement.boxCode}</p>
                  <p className="text-sm text-muted-foreground">{movement.reason}</p>
                  <p className="text-xs text-muted-foreground">
                    Por {movement.user}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-foreground">{movement.date}</p>
                  <p className="text-xs text-muted-foreground">{movement.time}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

function RecentLoans({ loans }: { loans: Loan[] }) {
  return (
    <Card className="bg-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-foreground">
          <FileOutput className="h-5 w-5" />
          Empréstimos Recentes
        </CardTitle>
      </CardHeader>
      <CardContent>
        {loans.length === 0 ? (
          <p className="py-4 text-center text-sm text-muted-foreground">
            Nenhum empréstimo registrado.
          </p>
        ) : (
          <div className="space-y-4">
            {loans.map((loan) => (
              <div
                key={loan.id}
                className="flex items-start justify-between border-b border-border pb-4 last:border-0 last:pb-0"
              >
                <div className="space-y-1">
                  <p className="font-medium text-foreground">{loan.boxCode}</p>
                  <p className="text-sm text-muted-foreground">
                    {loan.requester} — {loan.sector}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Devolução: {loan.returnDeadline}
                  </p>
                </div>
                <Badge className={statusColors[loan.status]}>
                  {statusLabels[loan.status]}
                </Badge>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
