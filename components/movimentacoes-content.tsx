"use client"

import { useState } from "react"
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
} from "lucide-react"
import { mockMovements } from "@/lib/mock-data"
import type { Movement } from "@/lib/types"

export function MovimentacoesContent() {
  const [movements] = useState<Movement[]>(mockMovements)
  const [searchTerm, setSearchTerm] = useState("")
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)

  const filteredMovements = movements.filter((movement) => {
    return (
      movement.boxCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      movement.user.toLowerCase().includes(searchTerm.toLowerCase()) ||
      movement.reason.toLowerCase().includes(searchTerm.toLowerCase())
    )
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Movimentações</h1>
          <p className="text-muted-foreground">
            Registre e acompanhe todas as movimentações de caixas
          </p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
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
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a caixa..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="box-1">CX-000001 - Documentos Financeiros 2020</SelectItem>
                    <SelectItem value="box-2">CX-000002 - Contratos de Fornecedores 2019</SelectItem>
                    <SelectItem value="box-3">CX-000003 - Folhas de Pagamento 2018</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Nova Localização</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a nova posição..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pos-1">Arquivo Central {">"} Rua A {">"} Prédio 01 {">"} Andar 01 {">"} Torre A {">"} Posição 03</SelectItem>
                    <SelectItem value="pos-2">Arquivo Central {">"} Rua A {">"} Prédio 01 {">"} Andar 01 {">"} Torre A {">"} Posição 05</SelectItem>
                    <SelectItem value="pos-3">Arquivo Central {">"} Rua B {">"} Prédio 02 {">"} Andar 01 {">"} Torre A {">"} Posição 01</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Motivo</Label>
                <Textarea placeholder="Descreva o motivo da movimentação..." />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={() => setIsAddDialogOpen(false)}>
                Registrar
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-4">
        <Card className="bg-card">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-primary/10 p-2">
                <ArrowRightLeft className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total de Movimentações</p>
                <p className="text-2xl font-bold text-foreground">{movements.length}</p>
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
                <p className="text-2xl font-bold text-foreground">12</p>
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
                <p className="text-2xl font-bold text-foreground">3</p>
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
                <p className="text-2xl font-bold text-foreground">4</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
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

      {/* Table */}
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
              {filteredMovements.map((movement) => (
                <TableRow key={movement.id} className="border-border">
                  <TableCell className="text-foreground">
                    <div className="flex flex-col">
                      <span className="font-medium">{movement.date}</span>
                      <span className="text-xs text-muted-foreground">{movement.time}</span>
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
                  <TableCell className="text-muted-foreground text-xs max-w-40 truncate">
                    <div className="flex items-center gap-1">
                      <MapPin className="h-3 w-3 shrink-0" />
                      {movement.previousLocation}
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground text-xs max-w-40 truncate">
                    <div className="flex items-center gap-1">
                      <MapPin className="h-3 w-3 shrink-0 text-primary" />
                      {movement.newLocation}
                    </div>
                  </TableCell>
                  <TableCell className="text-foreground max-w-48 truncate">
                    {movement.reason}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
