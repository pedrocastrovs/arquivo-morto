"use client"

import { useMemo, useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Plus,
  Search,
  ArrowRightLeft,
  MapPin,
  Clock,
  User,
  Calendar,
  Loader2,
} from "lucide-react"
import { registerMovement } from "@/lib/actions/movimentacoes"
import { computeMovementStats } from "@/lib/movimentacoes/stats"
import type { BoxOption } from "@/lib/db/boxes-select"
import type { PositionOption } from "@/lib/estrutura/position-options"
import type { Movement } from "@/lib/types"

interface MovimentacoesContentProps {
  initialMovements: Movement[]
  boxOptions: BoxOption[]
  positionOptions: PositionOption[]
  canWrite: boolean
  loadError: string | null
}

export function MovimentacoesContent({
  initialMovements,
  boxOptions,
  positionOptions,
  canWrite,
  loadError,
}: MovimentacoesContentProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const movements = initialMovements
  const [searchTerm, setSearchTerm] = useState("")
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)
  const [boxId, setBoxId] = useState("")
  const [positionId, setPositionId] = useState("")
  const [reason, setReason] = useState("")

  const stats = useMemo(
    () => computeMovementStats(movements),
    [movements]
  )

  const selectedPositionPath = useMemo(
    () =>
      positionOptions.find((p) => p.positionId === positionId)?.path ?? "",
    [positionOptions, positionId]
  )

  const filteredMovements = movements.filter((movement) => {
    const q = searchTerm.toLowerCase()
    return (
      movement.boxCode.toLowerCase().includes(q) ||
      movement.user.toLowerCase().includes(q) ||
      movement.reason.toLowerCase().includes(q)
    )
  })

  const resetForm = () => {
    setBoxId("")
    setPositionId("")
    setReason("")
    setFormError(null)
  }

  const handleRegister = () => {
    setFormError(null)
    startTransition(async () => {
      const result = await registerMovement({
        boxId,
        newPositionId: positionId,
        newLocationPath: selectedPositionPath,
        reason,
      })
      if (!result.success) {
        setFormError(result.error)
        return
      }
      setIsAddDialogOpen(false)
      resetForm()
      router.refresh()
    })
  }

  if (loadError) {
    return (
      <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-6 text-destructive">
        <p className="font-medium">Não foi possível carregar movimentações</p>
        <p className="mt-1 text-sm">{loadError}</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Movimentações</h1>
          <p className="text-muted-foreground">
            Registre e acompanhe todas as movimentações de caixas
            {!canWrite && " · somente leitura"}
          </p>
        </div>
        {canWrite && (
          <Dialog
            open={isAddDialogOpen}
            onOpenChange={(open) => {
              setIsAddDialogOpen(open)
              if (!open) resetForm()
            }}
          >
            <DialogTrigger asChild>
              <Button disabled={isPending}>
                <Plus className="mr-2 h-4 w-4" />
                Nova Movimentação
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>Registrar Movimentação</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>Caixa</Label>
                  <Select value={boxId} onValueChange={setBoxId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione a caixa..." />
                    </SelectTrigger>
                    <SelectContent>
                      {boxOptions.length === 0 ? (
                        <SelectItem value="_none" disabled>
                          Nenhuma caixa cadastrada
                        </SelectItem>
                      ) : (
                        boxOptions.map((box) => (
                          <SelectItem key={box.id} value={box.id}>
                            {box.code} — {box.description}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                  {boxId && (
                    <p className="text-xs text-muted-foreground">
                      Origem:{" "}
                      {boxOptions.find((b) => b.id === boxId)?.locationPath ||
                        "—"}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label>Nova localização (posição livre)</Label>
                  <Select value={positionId} onValueChange={setPositionId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione a nova posição..." />
                    </SelectTrigger>
                    <SelectContent>
                      {positionOptions.length === 0 ? (
                        <SelectItem value="_none" disabled>
                          Nenhuma posição livre
                        </SelectItem>
                      ) : (
                        positionOptions.map((opt) => (
                          <SelectItem
                            key={opt.positionId}
                            value={opt.positionId}
                          >
                            {opt.path}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Motivo</Label>
                  <Textarea
                    placeholder="Descreva o motivo da movimentação..."
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                  />
                </div>
                {formError && (
                  <p className="text-sm text-destructive" role="alert">
                    {formError}
                  </p>
                )}
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setIsAddDialogOpen(false)}
                  disabled={isPending}
                >
                  Cancelar
                </Button>
                <Button onClick={handleRegister} disabled={isPending}>
                  {isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Registrando…
                    </>
                  ) : (
                    "Registrar"
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-4">
        <Card className="bg-card">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-primary/10 p-2">
                <ArrowRightLeft className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">
                  Total de Movimentações
                </p>
                <p className="text-2xl font-bold text-foreground">
                  {stats.total}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-success/10 p-2">
                <Calendar className="h-5 w-5 text-success" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Este Mês</p>
                <p className="text-2xl font-bold text-foreground">
                  {stats.thisMonth}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-warning/10 p-2">
                <Clock className="h-5 w-5 text-warning" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Hoje</p>
                <p className="text-2xl font-bold text-foreground">
                  {stats.today}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-chart-4/10 p-2">
                <User className="h-5 w-5 text-chart-4" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Usuários Ativos</p>
                <p className="text-2xl font-bold text-foreground">
                  {stats.activeUsers}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-card">
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Buscar por código da caixa, usuário ou motivo..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      <Card className="bg-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-foreground">
            <ArrowRightLeft className="h-5 w-5" />
            Histórico de Movimentações
            <Badge variant="secondary" className="ml-2">
              {filteredMovements.length} registros
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="border-border hover:bg-transparent">
                <TableHead className="text-muted-foreground">Data/Hora</TableHead>
                <TableHead className="text-muted-foreground">Caixa</TableHead>
                <TableHead className="text-muted-foreground">Usuário</TableHead>
                <TableHead className="text-muted-foreground">Origem</TableHead>
                <TableHead className="text-muted-foreground">Destino</TableHead>
                <TableHead className="text-muted-foreground">Motivo</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredMovements.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="py-8 text-center text-muted-foreground"
                  >
                    Nenhuma movimentação registrada.
                  </TableCell>
                </TableRow>
              ) : (
                filteredMovements.map((movement) => (
                  <TableRow key={movement.id} className="border-border">
                    <TableCell className="text-foreground">
                      <div className="flex flex-col">
                        <span className="font-medium">{movement.date}</span>
                        <span className="text-xs text-muted-foreground">
                          {movement.time}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="font-medium text-primary">
                      {movement.boxCode}
                    </TableCell>
                    <TableCell className="text-foreground">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-muted-foreground" />
                        {movement.user}
                      </div>
                    </TableCell>
                    <TableCell className="max-w-40 truncate text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <MapPin className="h-3 w-3 shrink-0" />
                        {movement.previousLocation}
                      </div>
                    </TableCell>
                    <TableCell className="max-w-40 truncate text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <MapPin className="h-3 w-3 shrink-0 text-primary" />
                        {movement.newLocation}
                      </div>
                    </TableCell>
                    <TableCell className="max-w-48 truncate text-foreground">
                      {movement.reason}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
