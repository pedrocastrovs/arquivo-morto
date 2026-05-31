"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import {
  Search,
  Trash2,
  Clock,
  CheckCircle,
  AlertTriangle,
  FileText,
  Calendar,
  Package,
  ShieldCheck,
} from "lucide-react"
import { mockBoxes } from "@/lib/mock-data"
import type { Box } from "@/lib/types"

const documentTypeRetention: Record<string, { years: number; label: string }> = {
  financeiro: { years: 5, label: "Financeiro - 5 anos" },
  rh: { years: 10, label: "RH - 10 anos" },
  contratos: { years: 20, label: "Contratos - 20 anos" },
  assistencial: { years: 20, label: "Assistencial - 20 anos" },
  administrativo: { years: 5, label: "Administrativo - 5 anos" },
  juridico: { years: 20, label: "Jurídico - 20 anos" },
}

export function DescarteContent() {
  const [boxes] = useState<Box[]>(mockBoxes)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedBoxes, setSelectedBoxes] = useState<string[]>([])
  const [isApproveDialogOpen, setIsApproveDialogOpen] = useState(false)

  const boxesReadyForDiscard = boxes.filter((box) => box.status === "aguardando_descarte")
  const boxesDiscarded = boxes.filter((box) => box.status === "descartada")

  const filteredBoxes = boxesReadyForDiscard.filter((box) => {
    return (
      box.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      box.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      box.sector.toLowerCase().includes(searchTerm.toLowerCase())
    )
  })

  const handleSelectBox = (boxId: string) => {
    setSelectedBoxes((prev) =>
      prev.includes(boxId) ? prev.filter((id) => id !== boxId) : [...prev, boxId]
    )
  }

  const handleSelectAll = () => {
    if (selectedBoxes.length === filteredBoxes.length) {
      setSelectedBoxes([])
    } else {
      setSelectedBoxes(filteredBoxes.map((box) => box.id))
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Controle de Descarte</h1>
          <p className="text-muted-foreground">
            Gerencie o descarte de caixas conforme temporalidade documental
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-4">
        <Card className="bg-card">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-warning/10 p-2">
                <Clock className="h-5 w-5 text-warning" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Aguardando Descarte</p>
                <p className="text-2xl font-bold text-foreground">{boxesReadyForDiscard.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-success/10 p-2">
                <CheckCircle className="h-5 w-5 text-success" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Descartadas</p>
                <p className="text-2xl font-bold text-foreground">{boxesDiscarded.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-primary/10 p-2">
                <Package className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Espaço Liberado</p>
                <p className="text-2xl font-bold text-foreground">{boxesDiscarded.length}</p>
                <p className="text-xs text-muted-foreground">posições</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-chart-4/10 p-2">
                <Calendar className="h-5 w-5 text-chart-4" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Próximos 30 dias</p>
                <p className="text-2xl font-bold text-foreground">8</p>
                <p className="text-xs text-muted-foreground">caixas vencendo</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Retention Rules */}
      <Card className="bg-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-foreground">
            <ShieldCheck className="h-5 w-5" />
            Tabela de Temporalidade
          </CardTitle>
          <CardDescription>
            Prazos de retenção configurados por tipo documental
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-6">
            {Object.entries(documentTypeRetention).map(([type, config]) => (
              <div key={type} className="rounded-lg border border-border bg-secondary/30 p-3">
                <p className="text-sm font-medium text-foreground capitalize">{type}</p>
                <p className="text-2xl font-bold text-primary">{config.years}</p>
                <p className="text-xs text-muted-foreground">anos</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Boxes Ready for Discard */}
      <Card className="bg-card">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2 text-foreground">
              <Trash2 className="h-5 w-5" />
              Caixas Aptas para Descarte
              <Badge variant="secondary" className="ml-2">
                {filteredBoxes.length} registros
              </Badge>
            </CardTitle>
            <CardDescription>
              Caixas que atingiram o prazo de retenção e aguardam aprovação para descarte
            </CardDescription>
          </div>
          {selectedBoxes.length > 0 && (
            <AlertDialog open={isApproveDialogOpen} onOpenChange={setIsApproveDialogOpen}>
              <AlertDialogTrigger asChild>
                <Button variant="destructive">
                  <Trash2 className="mr-2 h-4 w-4" />
                  Aprovar Descarte ({selectedBoxes.length})
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle className="flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-destructive" />
                    Confirmar Descarte
                  </AlertDialogTitle>
                  <AlertDialogDescription>
                    Você está prestes a aprovar o descarte de {selectedBoxes.length} caixa(s).
                    Esta ação é irreversível e os documentos serão permanentemente destruídos.
                    <br /><br />
                    Um termo de descarte será gerado automaticamente para fins de auditoria.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label>Justificativa</Label>
                    <Textarea placeholder="Informe a justificativa para o descarte..." />
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox id="confirm" />
                    <label
                      htmlFor="confirm"
                      className="text-sm text-muted-foreground"
                    >
                      Confirmo que verifiquei todos os documentos e que o descarte está em
                      conformidade com a política de temporalidade documental.
                    </label>
                  </div>
                </div>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                  <AlertDialogAction className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                    Confirmar Descarte
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Buscar por código, descrição ou setor..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          <Table>
            <TableHeader>
              <TableRow className="border-border hover:bg-transparent">
                <TableHead className="w-12">
                  <Checkbox
                    checked={
                      filteredBoxes.length > 0 &&
                      selectedBoxes.length === filteredBoxes.length
                    }
                    onCheckedChange={handleSelectAll}
                  />
                </TableHead>
                <TableHead className="text-muted-foreground">Código</TableHead>
                <TableHead className="text-muted-foreground">Descrição</TableHead>
                <TableHead className="text-muted-foreground">Setor</TableHead>
                <TableHead className="text-muted-foreground">Tipo Documental</TableHead>
                <TableHead className="text-muted-foreground">Data Arquivamento</TableHead>
                <TableHead className="text-muted-foreground">Data Descarte Prevista</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredBoxes.map((box) => (
                <TableRow key={box.id} className="border-border">
                  <TableCell>
                    <Checkbox
                      checked={selectedBoxes.includes(box.id)}
                      onCheckedChange={() => handleSelectBox(box.id)}
                    />
                  </TableCell>
                  <TableCell className="font-medium text-primary">
                    <div className="flex items-center gap-2">
                      <Package className="h-4 w-4 text-muted-foreground" />
                      {box.code}
                    </div>
                  </TableCell>
                  <TableCell className="text-foreground max-w-xs truncate">
                    {box.description}
                  </TableCell>
                  <TableCell className="text-foreground">{box.sector}</TableCell>
                  <TableCell className="text-foreground capitalize">
                    {box.documentType}
                  </TableCell>
                  <TableCell className="text-foreground">{box.archiveDate}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="text-destructive border-destructive">
                      {box.expectedDiscardDate}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
              {filteredBoxes.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    Nenhuma caixa apta para descarte encontrada.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Discarded History */}
      <Card className="bg-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-foreground">
            <FileText className="h-5 w-5" />
            Histórico de Descartes
          </CardTitle>
          <CardDescription>
            Registro de todas as caixas descartadas para fins de auditoria
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="border-border hover:bg-transparent">
                <TableHead className="text-muted-foreground">Código</TableHead>
                <TableHead className="text-muted-foreground">Descrição</TableHead>
                <TableHead className="text-muted-foreground">Setor</TableHead>
                <TableHead className="text-muted-foreground">Período Documentos</TableHead>
                <TableHead className="text-muted-foreground">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {boxesDiscarded.map((box) => (
                <TableRow key={box.id} className="border-border">
                  <TableCell className="font-medium text-muted-foreground">
                    {box.code}
                  </TableCell>
                  <TableCell className="text-muted-foreground max-w-xs truncate">
                    {box.description}
                  </TableCell>
                  <TableCell className="text-muted-foreground">{box.sector}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {box.startDate} - {box.endDate}
                  </TableCell>
                  <TableCell>
                    <Badge className="bg-muted text-muted-foreground">
                      Descartada
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
              {boxesDiscarded.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                    Nenhuma caixa descartada ainda.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
