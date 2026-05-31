"use client"

import { useMemo, useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
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
  FileOutput,
  RotateCcw,
  Clock,
  AlertTriangle,
  CheckCircle,
  MoreHorizontal,
  Package,
  Loader2,
} from "lucide-react"
import {
  confirmLoanPickup,
  createLoan,
  returnLoan,
} from "@/lib/actions/emprestimos"
import type { BoxOption } from "@/lib/db/boxes-select"
import { computeLoanStatusCounts } from "@/lib/emprestimos/stats"
import type { Loan } from "@/lib/types"

const statusConfig: Record<
  Loan["status"],
  { label: string; className: string; icon: React.ElementType }
> = {
  pendente: { label: "Pendente", className: "bg-warning/20 text-warning", icon: Clock },
  em_andamento: {
    label: "Em Andamento",
    className: "bg-primary/20 text-primary",
    icon: FileOutput,
  },
  devolvido: {
    label: "Devolvido",
    className: "bg-success/20 text-success",
    icon: CheckCircle,
  },
  atrasado: {
    label: "Atrasado",
    className: "bg-destructive/20 text-destructive",
    icon: AlertTriangle,
  },
}

interface EmprestimosContentProps {
  initialLoans: Loan[]
  boxOptions: BoxOption[]
  sectors: string[]
  canWrite: boolean
  loadError: string | null
}

export function EmprestimosContent({
  initialLoans,
  boxOptions,
  sectors,
  canWrite,
  loadError,
}: EmprestimosContentProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const loans = initialLoans
  const [searchTerm, setSearchTerm] = useState("")
  const [activeTab, setActiveTab] = useState("all")
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isReturnDialogOpen, setIsReturnDialogOpen] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)

  const [boxId, setBoxId] = useState("")
  const [requester, setRequester] = useState("")
  const [sector, setSector] = useState("")
  const [returnDeadline, setReturnDeadline] = useState("")

  const [returnLoanId, setReturnLoanId] = useState("")
  const [deliveryResponsible, setDeliveryResponsible] = useState("")

  const statusCounts = useMemo(
    () => computeLoanStatusCounts(loans),
    [loans]
  )

  const returnableLoans = useMemo(
    () =>
      loans.filter(
        (l) => l.status === "em_andamento" || l.status === "atrasado"
      ),
    [loans]
  )

  const filteredLoans = loans.filter((loan) => {
    const matchesSearch =
      loan.boxCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      loan.requester.toLowerCase().includes(searchTerm.toLowerCase()) ||
      loan.sector.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesTab = activeTab === "all" || loan.status === activeTab
    return matchesSearch && matchesTab
  })

  const resetAddForm = () => {
    setBoxId("")
    setRequester("")
    setSector("")
    setReturnDeadline("")
    setFormError(null)
  }

  const resetReturnForm = () => {
    setReturnLoanId("")
    setDeliveryResponsible("")
    setFormError(null)
  }

  const openReturnDialog = (loan?: Loan) => {
    setReturnLoanId(loan?.id ?? "")
    setDeliveryResponsible("")
    setFormError(null)
    setIsReturnDialogOpen(true)
  }

  const handleCreateLoan = () => {
    setFormError(null)
    startTransition(async () => {
      const result = await createLoan({
        boxId,
        requester,
        sector,
        returnDeadline,
      })
      if (!result.success) {
        setFormError(result.error)
        return
      }
      setIsAddDialogOpen(false)
      resetAddForm()
      router.refresh()
    })
  }

  const handleConfirmPickup = (loanId: string) => {
    setFormError(null)
    startTransition(async () => {
      const result = await confirmLoanPickup(loanId)
      if (!result.success) {
        setFormError(result.error)
        return
      }
      router.refresh()
    })
  }

  const handleReturn = () => {
    setFormError(null)
    startTransition(async () => {
      const result = await returnLoan({
        loanId: returnLoanId,
        deliveryResponsible,
      })
      if (!result.success) {
        setFormError(result.error)
        return
      }
      setIsReturnDialogOpen(false)
      resetReturnForm()
      router.refresh()
    })
  }

  if (loadError) {
    return (
      <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-destructive">
        {loadError}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Empréstimos</h1>
          <p className="text-muted-foreground">
            Gerencie os empréstimos e devoluções de caixas
          </p>
        </div>
        {canWrite && (
          <div className="flex gap-2">
            <Dialog
              open={isReturnDialogOpen}
              onOpenChange={(open) => {
                setIsReturnDialogOpen(open)
                if (!open) resetReturnForm()
              }}
            >
              <DialogTrigger asChild>
                <Button variant="outline" onClick={() => openReturnDialog()}>
                  <RotateCcw className="mr-2 h-4 w-4" />
                  Registrar Devolução
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Registrar Devolução</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  {formError && isReturnDialogOpen && (
                    <p className="text-sm text-destructive">{formError}</p>
                  )}
                  <div className="space-y-2">
                    <Label>Empréstimo</Label>
                    <Select value={returnLoanId} onValueChange={setReturnLoanId}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o empréstimo..." />
                      </SelectTrigger>
                      <SelectContent>
                        {returnableLoans.length === 0 ? (
                          <SelectItem value="_none" disabled>
                            Nenhum empréstimo em andamento
                          </SelectItem>
                        ) : (
                          returnableLoans.map((loan) => (
                            <SelectItem key={loan.id} value={loan.id}>
                              {loan.boxCode} — {loan.requester}
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Responsável pela Entrega</Label>
                    <Input
                      placeholder="Nome de quem está devolvendo"
                      value={deliveryResponsible}
                      onChange={(e) => setDeliveryResponsible(e.target.value)}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => setIsReturnDialogOpen(false)}
                    disabled={isPending}
                  >
                    Cancelar
                  </Button>
                  <Button
                    onClick={handleReturn}
                    disabled={isPending || !returnLoanId}
                  >
                    {isPending && (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    Confirmar Devolução
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            <Dialog
              open={isAddDialogOpen}
              onOpenChange={(open) => {
                setIsAddDialogOpen(open)
                if (!open) resetAddForm()
              }}
            >
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Novo Empréstimo
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Solicitar Empréstimo</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  {formError && isAddDialogOpen && (
                    <p className="text-sm text-destructive">{formError}</p>
                  )}
                  <div className="space-y-2">
                    <Label>Caixa</Label>
                    <Select value={boxId} onValueChange={setBoxId}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione a caixa..." />
                      </SelectTrigger>
                      <SelectContent>
                        {boxOptions.length === 0 ? (
                          <SelectItem value="_none" disabled>
                            Nenhuma caixa arquivada disponível
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
                  </div>
                  <div className="space-y-2">
                    <Label>Solicitante</Label>
                    <Input
                      placeholder="Nome do solicitante"
                      value={requester}
                      onChange={(e) => setRequester(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Setor</Label>
                    <Select value={sector} onValueChange={setSector}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o setor..." />
                      </SelectTrigger>
                      <SelectContent>
                        {sectors.map((s) => (
                          <SelectItem key={s} value={s}>
                            {s}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Prazo para Devolução</Label>
                    <Input
                      type="date"
                      value={returnDeadline}
                      onChange={(e) => setReturnDeadline(e.target.value)}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => setIsAddDialogOpen(false)}
                    disabled={isPending}
                  >
                    Cancelar
                  </Button>
                  <Button
                    onClick={handleCreateLoan}
                    disabled={isPending || !boxId || !sector}
                  >
                    {isPending && (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    Solicitar
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        )}
      </div>

      {formError && !isAddDialogOpen && !isReturnDialogOpen && (
        <p className="text-sm text-destructive">{formError}</p>
      )}

      <div className="grid gap-4 sm:grid-cols-4">
        <Card className="bg-card">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-warning/10 p-2">
                <Clock className="h-5 w-5 text-warning" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Pendentes</p>
                <p className="text-2xl font-bold text-foreground">
                  {statusCounts.pendente}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-primary/10 p-2">
                <FileOutput className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Em Andamento</p>
                <p className="text-2xl font-bold text-foreground">
                  {statusCounts.em_andamento}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-destructive/10 p-2">
                <AlertTriangle className="h-5 w-5 text-destructive" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Atrasados</p>
                <p className="text-2xl font-bold text-foreground">
                  {statusCounts.atrasado}
                </p>
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
                <p className="text-sm text-muted-foreground">Devolvidos</p>
                <p className="text-2xl font-bold text-foreground">
                  {statusCounts.devolvido}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <TabsList className="bg-secondary">
            <TabsTrigger value="all">Todos ({statusCounts.all})</TabsTrigger>
            <TabsTrigger value="pendente">Pendentes</TabsTrigger>
            <TabsTrigger value="em_andamento">Em Andamento</TabsTrigger>
            <TabsTrigger value="atrasado">Atrasados</TabsTrigger>
            <TabsTrigger value="devolvido">Devolvidos</TabsTrigger>
          </TabsList>
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Buscar por código, solicitante..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <TabsContent value={activeTab} className="mt-6">
          <Card className="bg-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-foreground">
                <FileOutput className="h-5 w-5" />
                Lista de Empréstimos
                <Badge variant="secondary" className="ml-2">
                  {filteredLoans.length} registros
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {filteredLoans.length === 0 ? (
                <p className="py-8 text-center text-muted-foreground">
                  Nenhum empréstimo encontrado.
                </p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow className="border-border hover:bg-transparent">
                      <TableHead className="text-muted-foreground">Caixa</TableHead>
                      <TableHead className="text-muted-foreground">
                        Solicitante
                      </TableHead>
                      <TableHead className="text-muted-foreground">Setor</TableHead>
                      <TableHead className="text-muted-foreground">
                        Data Solicitação
                      </TableHead>
                      <TableHead className="text-muted-foreground">
                        Prazo Devolução
                      </TableHead>
                      <TableHead className="text-muted-foreground">Status</TableHead>
                      {canWrite && <TableHead className="w-12"></TableHead>}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredLoans.map((loan) => {
                      const StatusIcon = statusConfig[loan.status].icon
                      return (
                        <TableRow key={loan.id} className="border-border">
                          <TableCell className="font-medium text-primary">
                            <div className="flex items-center gap-2">
                              <Package className="h-4 w-4 text-muted-foreground" />
                              {loan.boxCode}
                            </div>
                          </TableCell>
                          <TableCell className="text-foreground">
                            {loan.requester}
                          </TableCell>
                          <TableCell className="text-foreground">
                            {loan.sector}
                          </TableCell>
                          <TableCell className="text-foreground">
                            {loan.requestDate}
                          </TableCell>
                          <TableCell className="text-foreground">
                            {loan.returnDeadline}
                          </TableCell>
                          <TableCell>
                            <Badge className={statusConfig[loan.status].className}>
                              <StatusIcon className="mr-1 h-3 w-3" />
                              {statusConfig[loan.status].label}
                            </Badge>
                          </TableCell>
                          {canWrite && (
                            <TableCell>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="icon">
                                    <MoreHorizontal className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  {(loan.status === "em_andamento" ||
                                    loan.status === "atrasado") && (
                                    <DropdownMenuItem
                                      onClick={() => openReturnDialog(loan)}
                                    >
                                      <RotateCcw className="mr-2 h-4 w-4" />
                                      Registrar Devolução
                                    </DropdownMenuItem>
                                  )}
                                  {loan.status === "pendente" && (
                                    <DropdownMenuItem
                                      onClick={() =>
                                        handleConfirmPickup(loan.id)
                                      }
                                      disabled={isPending}
                                    >
                                      <FileOutput className="mr-2 h-4 w-4" />
                                      Confirmar Retirada
                                    </DropdownMenuItem>
                                  )}
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </TableCell>
                          )}
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
