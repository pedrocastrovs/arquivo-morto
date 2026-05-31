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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Plus,
  Search,
  Filter,
  MoreHorizontal,
  Eye,
  Edit,
  ArrowRightLeft,
  FileOutput,
  QrCode,
  Package,
  Printer,
  Tag,
  Check,
} from "lucide-react"
import { mockBoxes } from "@/lib/mock-data"
import { BoxLabel } from "@/components/box-label"
import type { Box, BoxStatus, DocumentType } from "@/lib/types"

const statusConfig: Record<BoxStatus, { label: string; className: string }> = {
  preparacao: { label: "Preparação", className: "bg-warning/20 text-warning hover:bg-warning/30" },
  arquivada: { label: "Arquivada", className: "bg-success/20 text-success hover:bg-success/30" },
  emprestada: { label: "Emprestada", className: "bg-primary/20 text-primary hover:bg-primary/30" },
  em_movimentacao: { label: "Em Movimentação", className: "bg-chart-4/20 text-chart-4 hover:bg-chart-4/30" },
  aguardando_descarte: { label: "Aguardando Descarte", className: "bg-destructive/20 text-destructive hover:bg-destructive/30" },
  descartada: { label: "Descartada", className: "bg-muted text-muted-foreground hover:bg-muted/80" },
}

const documentTypeLabels: Record<DocumentType, string> = {
  financeiro: "Financeiro",
  rh: "RH",
  contratos: "Contratos",
  assistencial: "Assistencial",
  administrativo: "Administrativo",
  juridico: "Jurídico",
}

export function CaixasContent() {
  const [boxes] = useState<Box[]>(mockBoxes)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [selectedBox, setSelectedBox] = useState<Box | null>(null)
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)
  const [isLabelDialogOpen, setIsLabelDialogOpen] = useState(false)
  const [labelBox, setLabelBox] = useState<Box | null>(null)
  const [newBoxData, setNewBoxData] = useState({
    code: "",
    barcode: "",
    description: "",
    sector: "",
    unit: "",
    documentType: "" as DocumentType | "",
    responsible: "",
    startDate: "",
    endDate: "",
    observations: "",
    locationPath: "",
  })
  const [showSuccessDialog, setShowSuccessDialog] = useState(false)
  const [createdBox, setCreatedBox] = useState<Box | null>(null)

  const filteredBoxes = boxes.filter((box) => {
    const matchesSearch =
      box.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      box.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      box.sector.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === "all" || box.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const statusCounts = boxes.reduce((acc, box) => {
    acc[box.status] = (acc[box.status] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  const generateBoxCode = () => {
    const nextNumber = boxes.length + 1
    return `CX-${String(nextNumber).padStart(6, "0")}`
  }

  const generateBarcode = () => {
    const timestamp = Date.now().toString().slice(-10)
    return `7890${timestamp}`
  }

  const handleCreateBox = () => {
    const code = newBoxData.code || generateBoxCode()
    const barcode = newBoxData.barcode || generateBarcode()
    
    const newBox: Box = {
      id: `box-${Date.now()}`,
      code,
      barcode,
      description: newBoxData.description,
      sector: newBoxData.sector,
      unit: newBoxData.unit,
      documentType: newBoxData.documentType as DocumentType,
      responsible: newBoxData.responsible,
      startDate: newBoxData.startDate,
      endDate: newBoxData.endDate,
      archiveDate: new Date().toISOString().split("T")[0],
      expectedDiscardDate: new Date(
        Date.now() + 5 * 365 * 24 * 60 * 60 * 1000
      ).toISOString().split("T")[0],
      status: "preparacao",
      locationPath: newBoxData.locationPath || "A definir",
      locationId: "loc-new",
      observations: newBoxData.observations,
    }

    setCreatedBox(newBox)
    setIsAddDialogOpen(false)
    setShowSuccessDialog(true)
    
    // Reset form
    setNewBoxData({
      code: "",
      barcode: "",
      description: "",
      sector: "",
      unit: "",
      documentType: "",
      responsible: "",
      startDate: "",
      endDate: "",
      observations: "",
      locationPath: "",
    })
  }

  const handlePrintLabel = () => {
    window.print()
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Gestão de Caixas</h1>
          <p className="text-muted-foreground">
            Cadastre, consulte e gerencie as caixas do arquivo
          </p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Nova Caixa
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Cadastrar Nova Caixa</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Codigo</Label>
                  <Input 
                    placeholder="Gerado automaticamente"
                    value={newBoxData.code}
                    onChange={(e) => setNewBoxData({ ...newBoxData, code: e.target.value })}
                  />
                  <p className="text-xs text-muted-foreground">Deixe em branco para gerar automaticamente</p>
                </div>
                <div className="space-y-2">
                  <Label>Codigo de Barras</Label>
                  <Input 
                    placeholder="Gerado automaticamente"
                    value={newBoxData.barcode}
                    onChange={(e) => setNewBoxData({ ...newBoxData, barcode: e.target.value })}
                  />
                  <p className="text-xs text-muted-foreground">Deixe em branco para gerar automaticamente</p>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Descricao</Label>
                <Input 
                  placeholder="Descricao do conteudo da caixa"
                  value={newBoxData.description}
                  onChange={(e) => setNewBoxData({ ...newBoxData, description: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Setor</Label>
                  <Select value={newBoxData.sector} onValueChange={(value) => setNewBoxData({ ...newBoxData, sector: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Financeiro">Financeiro</SelectItem>
                      <SelectItem value="RH">RH</SelectItem>
                      <SelectItem value="Juridico">Juridico</SelectItem>
                      <SelectItem value="Assistencial">Assistencial</SelectItem>
                      <SelectItem value="Administrativo">Administrativo</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Unidade</Label>
                  <Select value={newBoxData.unit} onValueChange={(value) => setNewBoxData({ ...newBoxData, unit: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Matriz">Matriz</SelectItem>
                      <SelectItem value="Filial SP">Filial SP</SelectItem>
                      <SelectItem value="Filial RJ">Filial RJ</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Tipo Documental</Label>
                  <Select value={newBoxData.documentType} onValueChange={(value) => setNewBoxData({ ...newBoxData, documentType: value as DocumentType })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="financeiro">Financeiro</SelectItem>
                      <SelectItem value="rh">RH</SelectItem>
                      <SelectItem value="contratos">Contratos</SelectItem>
                      <SelectItem value="assistencial">Assistencial</SelectItem>
                      <SelectItem value="administrativo">Administrativo</SelectItem>
                      <SelectItem value="juridico">Juridico</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Responsavel</Label>
                  <Input 
                    placeholder="Nome do responsavel"
                    value={newBoxData.responsible}
                    onChange={(e) => setNewBoxData({ ...newBoxData, responsible: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Data Inicial</Label>
                  <Input 
                    type="date"
                    value={newBoxData.startDate}
                    onChange={(e) => setNewBoxData({ ...newBoxData, startDate: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Data Final</Label>
                  <Input 
                    type="date"
                    value={newBoxData.endDate}
                    onChange={(e) => setNewBoxData({ ...newBoxData, endDate: e.target.value })}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Observacoes</Label>
                <Textarea 
                  placeholder="Informacoes adicionais..."
                  value={newBoxData.observations}
                  onChange={(e) => setNewBoxData({ ...newBoxData, observations: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Localizacao</Label>
                <Select value={newBoxData.locationPath} onValueChange={(value) => setNewBoxData({ ...newBoxData, locationPath: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a posicao..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Arquivo Central > Rua A > Predio 01 > Andar 01 > Torre A > Posicao 03">Arquivo Central {">"} Rua A {">"} Predio 01 {">"} Andar 01 {">"} Torre A {">"} Posicao 03</SelectItem>
                    <SelectItem value="Arquivo Central > Rua A > Predio 01 > Andar 01 > Torre A > Posicao 05">Arquivo Central {">"} Rua A {">"} Predio 01 {">"} Andar 01 {">"} Torre A {">"} Posicao 05</SelectItem>
                    <SelectItem value="Arquivo Central > Rua A > Predio 01 > Andar 01 > Torre B > Posicao 02">Arquivo Central {">"} Rua A {">"} Predio 01 {">"} Andar 01 {">"} Torre B {">"} Posicao 02</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleCreateBox}>
                <Tag className="mr-2 h-4 w-4" />
                Cadastrar e Gerar Etiqueta
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Status Cards */}
      <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-6">
        {Object.entries(statusConfig).map(([status, config]) => (
          <Card
            key={status}
            className={`cursor-pointer bg-card transition-all hover:ring-1 hover:ring-primary ${
              statusFilter === status ? "ring-1 ring-primary" : ""
            }`}
            onClick={() => setStatusFilter(statusFilter === status ? "all" : status)}
          >
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground">{config.label}</p>
              <p className="text-2xl font-bold text-foreground">
                {statusCounts[status] || 0}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Search and Filter */}
      <Card className="bg-card">
        <CardContent className="p-4">
          <div className="flex flex-col gap-4 md:flex-row md:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Buscar por código, descrição ou setor..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-48">
                  <Filter className="mr-2 h-4 w-4" />
                  <SelectValue placeholder="Filtrar por status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os status</SelectItem>
                  {Object.entries(statusConfig).map(([value, config]) => (
                    <SelectItem key={value} value={value}>
                      {config.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card className="bg-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-foreground">
            <Package className="h-5 w-5" />
            Lista de Caixas
            <Badge variant="secondary" className="ml-2">
              {filteredBoxes.length} registros
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="border-border hover:bg-transparent">
                <TableHead className="text-muted-foreground">Código</TableHead>
                <TableHead className="text-muted-foreground">Descrição</TableHead>
                <TableHead className="text-muted-foreground">Setor</TableHead>
                <TableHead className="text-muted-foreground">Tipo</TableHead>
                <TableHead className="text-muted-foreground">Status</TableHead>
                <TableHead className="text-muted-foreground">Localização</TableHead>
                <TableHead className="w-12"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredBoxes.map((box) => (
                <TableRow key={box.id} className="border-border">
                  <TableCell className="font-medium text-foreground">
                    <div className="flex items-center gap-2">
                      <QrCode className="h-4 w-4 text-muted-foreground" />
                      {box.code}
                    </div>
                  </TableCell>
                  <TableCell className="text-foreground max-w-xs truncate">
                    {box.description}
                  </TableCell>
                  <TableCell className="text-foreground">{box.sector}</TableCell>
                  <TableCell className="text-foreground">
                    {documentTypeLabels[box.documentType]}
                  </TableCell>
                  <TableCell>
                    <Badge className={statusConfig[box.status].className}>
                      {statusConfig[box.status].label}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground text-xs max-w-xs truncate">
                    {box.locationPath}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() => {
                            setSelectedBox(box)
                            setIsViewDialogOpen(true)
                          }}
                        >
                          <Eye className="mr-2 h-4 w-4" />
                          Visualizar
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Edit className="mr-2 h-4 w-4" />
                          Editar
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <ArrowRightLeft className="mr-2 h-4 w-4" />
                          Movimentar
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <FileOutput className="mr-2 h-4 w-4" />
                          Emprestar
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => {
                            setLabelBox(box)
                            setIsLabelDialogOpen(true)
                          }}
                        >
                          <Printer className="mr-2 h-4 w-4" />
                          Imprimir Etiqueta
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* View Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Detalhes da Caixa</DialogTitle>
          </DialogHeader>
          {selectedBox && (
            <div className="space-y-6 py-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Código</p>
                  <p className="text-2xl font-bold text-foreground">{selectedBox.code}</p>
                </div>
                <Badge className={statusConfig[selectedBox.status].className}>
                  {statusConfig[selectedBox.status].label}
                </Badge>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Descrição</p>
                  <p className="text-foreground">{selectedBox.description}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Código de Barras</p>
                  <p className="text-foreground">{selectedBox.barcode}</p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Setor</p>
                  <p className="text-foreground">{selectedBox.sector}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Unidade</p>
                  <p className="text-foreground">{selectedBox.unit}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Responsável</p>
                  <p className="text-foreground">{selectedBox.responsible}</p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Tipo Documental</p>
                  <p className="text-foreground">{documentTypeLabels[selectedBox.documentType]}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Data Inicial</p>
                  <p className="text-foreground">{selectedBox.startDate}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Data Final</p>
                  <p className="text-foreground">{selectedBox.endDate}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Data de Arquivamento</p>
                  <p className="text-foreground">{selectedBox.archiveDate}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Data Prevista de Descarte</p>
                  <p className="text-foreground">{selectedBox.expectedDiscardDate}</p>
                </div>
              </div>

              <div>
                <p className="text-sm text-muted-foreground">Localização</p>
                <p className="text-foreground">{selectedBox.locationPath}</p>
              </div>

              {selectedBox.observations && (
                <div>
                  <p className="text-sm text-muted-foreground">Observações</p>
                  <p className="text-foreground">{selectedBox.observations}</p>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsViewDialogOpen(false)}>
              Fechar
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                setLabelBox(selectedBox)
                setIsLabelDialogOpen(true)
              }}
            >
              <Printer className="mr-2 h-4 w-4" />
              Imprimir Etiqueta
            </Button>
            <Button>
              <Edit className="mr-2 h-4 w-4" />
              Editar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Success Dialog after creating box */}
      <Dialog open={showSuccessDialog} onOpenChange={setShowSuccessDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-success">
              <Check className="h-5 w-5" />
              Caixa Cadastrada com Sucesso
            </DialogTitle>
          </DialogHeader>
          {createdBox && (
            <div className="space-y-4 py-4">
              <div className="rounded-lg bg-muted p-4 text-center">
                <p className="text-sm text-muted-foreground">Codigo da Caixa</p>
                <p className="text-3xl font-bold text-foreground">{createdBox.code}</p>
              </div>
              <p className="text-center text-sm text-muted-foreground">
                Deseja imprimir a etiqueta para identificar a caixa?
              </p>
            </div>
          )}
          <DialogFooter className="flex-col gap-2 sm:flex-row">
            <Button
              variant="outline"
              className="w-full sm:w-auto"
              onClick={() => setShowSuccessDialog(false)}
            >
              Cadastrar Outra
            </Button>
            <Button
              className="w-full sm:w-auto"
              onClick={() => {
                setLabelBox(createdBox)
                setShowSuccessDialog(false)
                setIsLabelDialogOpen(true)
              }}
            >
              <Printer className="mr-2 h-4 w-4" />
              Imprimir Etiqueta
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Label Print Dialog */}
      <Dialog open={isLabelDialogOpen} onOpenChange={setIsLabelDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Tag className="h-5 w-5" />
              Etiqueta da Caixa
            </DialogTitle>
          </DialogHeader>
          {labelBox && (
            <div className="space-y-4">
              {/* Label Preview */}
              <div className="flex justify-center rounded-lg border border-border bg-white p-4 print-label">
                <BoxLabel box={labelBox} />
              </div>
              
              {/* Print Instructions */}
              <div className="rounded-lg bg-muted/50 p-3">
                <p className="text-xs text-muted-foreground">
                  <strong>Dica:</strong> Para melhor resultado, configure sua impressora para papel A6 ou etiquetas 100x150mm.
                </p>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsLabelDialogOpen(false)}>
              Fechar
            </Button>
            <Button onClick={handlePrintLabel}>
              <Printer className="mr-2 h-4 w-4" />
              Imprimir
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Print Styles */}
      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .print-label,
          .print-label * {
            visibility: visible !important;
          }
          .print-label {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            padding: 0 !important;
            margin: 0 !important;
          }
        }
      `}</style>
    </div>
  )
}
