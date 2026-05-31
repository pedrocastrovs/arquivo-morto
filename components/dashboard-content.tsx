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
import {
  mockDashboardStats,
  mockSectorStats,
  mockMonthlyMovements,
  mockLoans,
  mockMovements,
} from "@/lib/mock-data"
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

export function DashboardContent() {
  const stats = mockDashboardStats

  const statCards = [
    {
      title: "Total de Caixas",
      value: stats.totalBoxes.toLocaleString("pt-BR"),
      icon: Package,
      change: "+12 este mês",
      changeType: "positive" as const,
    },
    {
      title: "Movimentações",
      value: stats.totalMovements.toLocaleString("pt-BR"),
      icon: ArrowRightLeft,
      change: "+8% vs mês anterior",
      changeType: "positive" as const,
    },
    {
      title: "Empréstimos Ativos",
      value: stats.totalLoans.toLocaleString("pt-BR"),
      icon: FileOutput,
      change: "13 pendentes",
      changeType: "neutral" as const,
    },
    {
      title: "Devoluções",
      value: stats.totalReturns.toLocaleString("pt-BR"),
      icon: RotateCcw,
      change: "98% no prazo",
      changeType: "positive" as const,
    },
  ]

  const capacityCards = [
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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground">
          Visão geral do Sistema de Gestão de Arquivo Morto
        </p>
      </div>

      {/* Stats Cards */}
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

      {/* Capacity Cards */}
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

      {/* Charts Section */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="bg-card">
          <CardHeader>
            <CardTitle className="text-foreground">
              Movimentações por Mês
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={mockMonthlyMovements}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="month" stroke="#9ca3af" />
                  <YAxis stroke="#9ca3af" />
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
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card">
          <CardHeader>
            <CardTitle className="text-foreground">
              Distribuição por Setor
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={mockSectorStats}
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
                    {mockSectorStats.map((_, index) => (
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
                    formatter={(value: number) => [
                      `${value} caixas`,
                      "Quantidade",
                    ]}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="bg-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-foreground">
              <Clock className="h-5 w-5" />
              Últimas Movimentações
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {mockMovements.slice(0, 5).map((movement) => (
                <div
                  key={movement.id}
                  className="flex items-start justify-between border-b border-border pb-4 last:border-0 last:pb-0"
                >
                  <div className="space-y-1">
                    <p className="font-medium text-foreground">
                      {movement.boxCode}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {movement.reason}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Por {movement.user}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-foreground">{movement.date}</p>
                    <p className="text-xs text-muted-foreground">
                      {movement.time}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-foreground">
              <FileOutput className="h-5 w-5" />
              Empréstimos Recentes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {mockLoans.slice(0, 5).map((loan) => (
                <div
                  key={loan.id}
                  className="flex items-start justify-between border-b border-border pb-4 last:border-0 last:pb-0"
                >
                  <div className="space-y-1">
                    <p className="font-medium text-foreground">{loan.boxCode}</p>
                    <p className="text-sm text-muted-foreground">
                      {loan.requester} - {loan.sector}
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
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
