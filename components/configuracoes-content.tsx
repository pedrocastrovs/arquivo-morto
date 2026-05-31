"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
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
  Settings,
  Users,
  FileText,
  Building,
  Plus,
  Edit,
  Trash2,
  Shield,
  Clock,
  Loader2,
  Info,
} from "lucide-react"
import {
  createSector,
  createUnit,
  deleteSector,
  deleteUnit,
  updateProfileRole,
  updateSector,
  updateUnit,
} from "@/lib/actions/configuracoes"
import type { ProfileRecord, SectorRecord, UnitRecord } from "@/lib/db/config"
import type { UserRole } from "@/lib/types"

const roleLabels: Record<UserRole, { label: string; className: string }> = {
  administrador: { label: "Administrador", className: "bg-primary/20 text-primary" },
  operador: { label: "Operador", className: "bg-success/20 text-success" },
  consultante: { label: "Consultante", className: "bg-warning/20 text-warning" },
}

interface ConfiguracoesContentProps {
  sectors: SectorRecord[]
  units: UnitRecord[]
  profiles: ProfileRecord[]
  canManageCadastros: boolean
  canManageUsers: boolean
  loadError: string | null
}

export function ConfiguracoesContent({
  sectors,
  units,
  profiles,
  canManageCadastros,
  canManageUsers,
  loadError,
}: ConfiguracoesContentProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [formError, setFormError] = useState<string | null>(null)

  const [sectorDialogOpen, setSectorDialogOpen] = useState(false)
  const [editingSector, setEditingSector] = useState<SectorRecord | null>(null)
  const [sectorName, setSectorName] = useState("")

  const [unitDialogOpen, setUnitDialogOpen] = useState(false)
  const [editingUnit, setEditingUnit] = useState<UnitRecord | null>(null)
  const [unitName, setUnitName] = useState("")

  const [userDialogOpen, setUserDialogOpen] = useState(false)
  const [editingProfile, setEditingProfile] = useState<ProfileRecord | null>(null)
  const [profileRole, setProfileRole] = useState<UserRole>("operador")
  const [profileSector, setProfileSector] = useState("")

  const openNewSector = () => {
    setEditingSector(null)
    setSectorName("")
    setFormError(null)
    setSectorDialogOpen(true)
  }

  const openEditSector = (s: SectorRecord) => {
    setEditingSector(s)
    setSectorName(s.name)
    setFormError(null)
    setSectorDialogOpen(true)
  }

  const saveSector = () => {
    setFormError(null)
    startTransition(async () => {
      const result = editingSector
        ? await updateSector(editingSector.id, sectorName)
        : await createSector(sectorName)
      if (!result.success) {
        setFormError(result.error)
        return
      }
      setSectorDialogOpen(false)
      router.refresh()
    })
  }

  const handleDeleteSector = (id: string) => {
    startTransition(async () => {
      const result = await deleteSector(id)
      if (!result.success) setFormError(result.error)
      else router.refresh()
    })
  }

  const openNewUnit = () => {
    setEditingUnit(null)
    setUnitName("")
    setFormError(null)
    setUnitDialogOpen(true)
  }

  const openEditUnit = (u: UnitRecord) => {
    setEditingUnit(u)
    setUnitName(u.name)
    setFormError(null)
    setUnitDialogOpen(true)
  }

  const saveUnit = () => {
    setFormError(null)
    startTransition(async () => {
      const result = editingUnit
        ? await updateUnit(editingUnit.id, unitName)
        : await createUnit(unitName)
      if (!result.success) {
        setFormError(result.error)
        return
      }
      setUnitDialogOpen(false)
      router.refresh()
    })
  }

  const handleDeleteUnit = (id: string) => {
    startTransition(async () => {
      const result = await deleteUnit(id)
      if (!result.success) setFormError(result.error)
      else router.refresh()
    })
  }

  const openEditProfile = (p: ProfileRecord) => {
    setEditingProfile(p)
    setProfileRole(p.role)
    setProfileSector(p.sector ?? "")
    setFormError(null)
    setUserDialogOpen(true)
  }

  const saveProfile = () => {
    if (!editingProfile) return
    setFormError(null)
    startTransition(async () => {
      const result = await updateProfileRole({
        profileId: editingProfile.id,
        role: profileRole,
        sector: profileSector,
      })
      if (!result.success) {
        setFormError(result.error)
        return
      }
      setUserDialogOpen(false)
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
      <div>
        <h1 className="text-2xl font-bold text-foreground">Configurações</h1>
        <p className="text-muted-foreground">
          Gerencie usuários, setores e unidades do sistema
        </p>
      </div>

      {formError && !sectorDialogOpen && !unitDialogOpen && !userDialogOpen && (
        <p className="text-sm text-destructive">{formError}</p>
      )}

      <Tabs defaultValue={canManageUsers ? "users" : "sectors"} className="space-y-6">
        <TabsList className="bg-secondary">
          {canManageUsers && (
            <TabsTrigger value="users" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Usuários
            </TabsTrigger>
          )}
          <TabsTrigger value="sectors" className="flex items-center gap-2">
            <Building className="h-4 w-4" />
            Setores
          </TabsTrigger>
          <TabsTrigger value="units" className="flex items-center gap-2">
            <Building className="h-4 w-4" />
            Unidades
          </TabsTrigger>
          <TabsTrigger value="retention" className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Temporalidade
          </TabsTrigger>
          <TabsTrigger value="general" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Geral
          </TabsTrigger>
        </TabsList>

        {canManageUsers && (
          <TabsContent value="users">
            <Card className="bg-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-foreground">
                  <Users className="h-5 w-5" />
                  Gestão de Usuários
                </CardTitle>
                <CardDescription>
                  Perfis sincronizados com o Supabase Auth. Novos usuários são
                  criados no painel Supabase (Authentication → Users).
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start gap-2 rounded-lg border border-border bg-secondary/30 p-3 text-sm text-muted-foreground">
                  <Info className="mt-0.5 h-4 w-4 shrink-0" />
                  Após criar o usuário no Supabase, o perfil aparece aqui na primeira
                  login. Promova administradores com o SQL em{" "}
                  <code className="text-xs">supabase/SETUP.md</code>.
                </div>
                <Table>
                  <TableHeader>
                    <TableRow className="border-border hover:bg-transparent">
                      <TableHead className="text-muted-foreground">Nome</TableHead>
                      <TableHead className="text-muted-foreground">E-mail</TableHead>
                      <TableHead className="text-muted-foreground">Perfil</TableHead>
                      <TableHead className="text-muted-foreground">Setor</TableHead>
                      <TableHead className="w-16"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {profiles.map((user) => (
                      <TableRow key={user.id} className="border-border">
                        <TableCell className="font-medium text-foreground">
                          {user.name}
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {user.email}
                        </TableCell>
                        <TableCell>
                          <Badge className={roleLabels[user.role].className}>
                            <Shield className="mr-1 h-3 w-3" />
                            {roleLabels[user.role].label}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-foreground">
                          {user.sector ?? "—"}
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => openEditProfile(user)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                    {profiles.length === 0 && (
                      <TableRow>
                        <TableCell
                          colSpan={5}
                          className="py-8 text-center text-muted-foreground"
                        >
                          Nenhum perfil encontrado.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            <Dialog open={userDialogOpen} onOpenChange={setUserDialogOpen}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Editar usuário</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  {formError && (
                    <p className="text-sm text-destructive">{formError}</p>
                  )}
                  <div className="space-y-2">
                    <Label>Perfil</Label>
                    <Select
                      value={profileRole}
                      onValueChange={(v) => setProfileRole(v as UserRole)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="administrador">Administrador</SelectItem>
                        <SelectItem value="operador">Operador</SelectItem>
                        <SelectItem value="consultante">Consultante</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Setor (opcional)</Label>
                    <Input
                      value={profileSector}
                      onChange={(e) => setProfileSector(e.target.value)}
                      placeholder="Ex: Arquivo"
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => setUserDialogOpen(false)}
                    disabled={isPending}
                  >
                    Cancelar
                  </Button>
                  <Button onClick={saveProfile} disabled={isPending}>
                    {isPending && (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    Salvar
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </TabsContent>
        )}

        <TabsContent value="sectors">
          <Card className="bg-card">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2 text-foreground">
                  <Building className="h-5 w-5" />
                  Gestão de Setores
                </CardTitle>
                <CardDescription>
                  Setores usados no cadastro de caixas e empréstimos
                </CardDescription>
              </div>
              {canManageCadastros && (
                <Button onClick={openNewSector}>
                  <Plus className="mr-2 h-4 w-4" />
                  Novo Setor
                </Button>
              )}
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow className="border-border hover:bg-transparent">
                    <TableHead className="text-muted-foreground">Nome</TableHead>
                    {canManageCadastros && (
                      <TableHead className="w-24"></TableHead>
                    )}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sectors.map((sector) => (
                    <TableRow key={sector.id} className="border-border">
                      <TableCell className="font-medium text-foreground">
                        {sector.name}
                      </TableCell>
                      {canManageCadastros && (
                        <TableCell>
                          <div className="flex gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => openEditSector(sector)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="text-destructive"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Excluir setor?</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    O setor &quot;{sector.name}&quot; será removido.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => handleDeleteSector(sector.id)}
                                  >
                                    Excluir
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </TableCell>
                      )}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <Dialog open={sectorDialogOpen} onOpenChange={setSectorDialogOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {editingSector ? "Editar Setor" : "Adicionar Setor"}
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                {formError && (
                  <p className="text-sm text-destructive">{formError}</p>
                )}
                <div className="space-y-2">
                  <Label>Nome</Label>
                  <Input
                    value={sectorName}
                    onChange={(e) => setSectorName(e.target.value)}
                    placeholder="Nome do setor"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setSectorDialogOpen(false)}
                  disabled={isPending}
                >
                  Cancelar
                </Button>
                <Button onClick={saveSector} disabled={isPending}>
                  {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Salvar
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </TabsContent>

        <TabsContent value="units">
          <Card className="bg-card">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2 text-foreground">
                  <Building className="h-5 w-5" />
                  Gestão de Unidades
                </CardTitle>
                <CardDescription>
                  Unidades organizacionais (Matriz, filiais)
                </CardDescription>
              </div>
              {canManageCadastros && (
                <Button onClick={openNewUnit}>
                  <Plus className="mr-2 h-4 w-4" />
                  Nova Unidade
                </Button>
              )}
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow className="border-border hover:bg-transparent">
                    <TableHead className="text-muted-foreground">Nome</TableHead>
                    {canManageCadastros && (
                      <TableHead className="w-24"></TableHead>
                    )}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {units.map((unit) => (
                    <TableRow key={unit.id} className="border-border">
                      <TableCell className="font-medium text-foreground">
                        {unit.name}
                      </TableCell>
                      {canManageCadastros && (
                        <TableCell>
                          <div className="flex gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => openEditUnit(unit)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="text-destructive"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Excluir unidade?</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    A unidade &quot;{unit.name}&quot; será removida.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => handleDeleteUnit(unit.id)}
                                  >
                                    Excluir
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </TableCell>
                      )}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <Dialog open={unitDialogOpen} onOpenChange={setUnitDialogOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {editingUnit ? "Editar Unidade" : "Adicionar Unidade"}
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                {formError && (
                  <p className="text-sm text-destructive">{formError}</p>
                )}
                <div className="space-y-2">
                  <Label>Nome</Label>
                  <Input
                    value={unitName}
                    onChange={(e) => setUnitName(e.target.value)}
                    placeholder="Nome da unidade"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setUnitDialogOpen(false)}
                  disabled={isPending}
                >
                  Cancelar
                </Button>
                <Button onClick={saveUnit} disabled={isPending}>
                  {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Salvar
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </TabsContent>

        <TabsContent value="retention">
          <Card className="bg-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-foreground">
                <Clock className="h-5 w-5" />
                Tabela de Temporalidade
              </CardTitle>
              <CardDescription>
                Referência fixa por tipo documental (aplicada ao cadastrar caixas)
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {[
                  { type: "Financeiro", retention: 5, description: "Notas fiscais, recibos, balanços" },
                  { type: "RH", retention: 10, description: "Folhas de pagamento, contratos de trabalho" },
                  { type: "Contratos", retention: 20, description: "Contratos comerciais" },
                  { type: "Assistencial", retention: 20, description: "Prontuários médicos, laudos" },
                  { type: "Administrativo", retention: 5, description: "Memorandos, comunicados" },
                  { type: "Jurídico", retention: 20, description: "Processos, pareceres" },
                ].map((item) => (
                  <Card key={item.type} className="bg-secondary/30">
                    <CardContent className="p-4">
                      <h4 className="mb-2 font-medium text-foreground">{item.type}</h4>
                      <div className="mb-2 flex items-baseline gap-1">
                        <span className="text-3xl font-bold text-primary">
                          {item.retention}
                        </span>
                        <span className="text-muted-foreground">anos</span>
                      </div>
                      <p className="text-xs text-muted-foreground">{item.description}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="general">
          <div className="grid gap-6">
            <Card className="bg-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-foreground">
                  <Settings className="h-5 w-5" />
                  Configurações Gerais
                </CardTitle>
                <CardDescription>Preferências da interface (em breve)</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Notificações por E-mail</Label>
                    <p className="text-sm text-muted-foreground">
                      Receber notificações sobre empréstimos e descartes
                    </p>
                  </div>
                  <Switch disabled />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Alerta de Empréstimos Atrasados</Label>
                    <p className="text-sm text-muted-foreground">
                      Sincronizado ao abrir a tela de empréstimos
                    </p>
                  </div>
                  <Switch defaultChecked disabled />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Alerta de Descarte</Label>
                    <p className="text-sm text-muted-foreground">
                      Sincronizado ao abrir a tela de descarte
                    </p>
                  </div>
                  <Switch defaultChecked disabled />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-foreground">
                  <FileText className="h-5 w-5" />
                  Informações do Sistema
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Versão</p>
                    <p className="font-medium text-foreground">1.0.0</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Cliente</p>
                    <p className="font-medium text-foreground">Grupo DNA Center</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
