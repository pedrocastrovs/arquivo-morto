"use client"

import { useState } from "react"
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
  Settings,
  Users,
  FileText,
  Building,
  Plus,
  Edit,
  Trash2,
  Shield,
  Clock,
} from "lucide-react"
import type { UserRole } from "@/lib/types"

const mockUsers = [
  { id: "1", name: "Admin Sistema", email: "admin@dnacenter.com", role: "administrador" as UserRole, sector: "TI", active: true },
  { id: "2", name: "Maria Silva", email: "maria.silva@dnacenter.com", role: "operador" as UserRole, sector: "Arquivo", active: true },
  { id: "3", name: "João Santos", email: "joao.santos@dnacenter.com", role: "operador" as UserRole, sector: "Arquivo", active: true },
  { id: "4", name: "Ana Costa", email: "ana.costa@dnacenter.com", role: "consultante" as UserRole, sector: "RH", active: true },
  { id: "5", name: "Carlos Lima", email: "carlos.lima@dnacenter.com", role: "consultante" as UserRole, sector: "Financeiro", active: false },
]

const mockSectors = [
  { id: "1", name: "Financeiro", code: "FIN", retention: 5 },
  { id: "2", name: "RH", code: "RH", retention: 10 },
  { id: "3", name: "Jurídico", code: "JUR", retention: 20 },
  { id: "4", name: "Assistencial", code: "ASS", retention: 20 },
  { id: "5", name: "Administrativo", code: "ADM", retention: 5 },
  { id: "6", name: "TI", code: "TI", retention: 5 },
]

const mockUnits = [
  { id: "1", name: "Matriz", code: "MTZ", address: "Av. Principal, 1000 - Centro" },
  { id: "2", name: "Filial SP", code: "FSP", address: "Rua Augusta, 500 - São Paulo" },
  { id: "3", name: "Filial RJ", code: "FRJ", address: "Av. Rio Branco, 200 - Rio de Janeiro" },
]

const roleLabels: Record<UserRole, { label: string; className: string }> = {
  administrador: { label: "Administrador", className: "bg-primary/20 text-primary" },
  operador: { label: "Operador", className: "bg-success/20 text-success" },
  consultante: { label: "Consultante", className: "bg-warning/20 text-warning" },
}

export function ConfiguracoesContent() {
  const [isUserDialogOpen, setIsUserDialogOpen] = useState(false)
  const [isSectorDialogOpen, setIsSectorDialogOpen] = useState(false)
  const [isUnitDialogOpen, setIsUnitDialogOpen] = useState(false)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Configurações</h1>
        <p className="text-muted-foreground">
          Gerencie usuários, setores e configurações do sistema
        </p>
      </div>

      <Tabs defaultValue="users" className="space-y-6">
        <TabsList className="bg-secondary">
          <TabsTrigger value="users" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Usuários
          </TabsTrigger>
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

        {/* Users Tab */}
        <TabsContent value="users">
          <Card className="bg-card">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2 text-foreground">
                  <Users className="h-5 w-5" />
                  Gestão de Usuários
                </CardTitle>
                <CardDescription>
                  Gerencie os usuários e suas permissões no sistema
                </CardDescription>
              </div>
              <Dialog open={isUserDialogOpen} onOpenChange={setIsUserDialogOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Novo Usuário
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Adicionar Usuário</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label>Nome</Label>
                      <Input placeholder="Nome completo" />
                    </div>
                    <div className="space-y-2">
                      <Label>E-mail</Label>
                      <Input type="email" placeholder="email@exemplo.com" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Perfil</Label>
                        <Select>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione..." />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="administrador">Administrador</SelectItem>
                            <SelectItem value="operador">Operador</SelectItem>
                            <SelectItem value="consultante">Consultante</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>Setor</Label>
                        <Select>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione..." />
                          </SelectTrigger>
                          <SelectContent>
                            {mockSectors.map((sector) => (
                              <SelectItem key={sector.id} value={sector.id}>
                                {sector.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setIsUserDialogOpen(false)}>
                      Cancelar
                    </Button>
                    <Button onClick={() => setIsUserDialogOpen(false)}>Salvar</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow className="border-border hover:bg-transparent">
                    <TableHead className="text-muted-foreground">Nome</TableHead>
                    <TableHead className="text-muted-foreground">E-mail</TableHead>
                    <TableHead className="text-muted-foreground">Perfil</TableHead>
                    <TableHead className="text-muted-foreground">Setor</TableHead>
                    <TableHead className="text-muted-foreground">Status</TableHead>
                    <TableHead className="w-24"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockUsers.map((user) => (
                    <TableRow key={user.id} className="border-border">
                      <TableCell className="font-medium text-foreground">{user.name}</TableCell>
                      <TableCell className="text-muted-foreground">{user.email}</TableCell>
                      <TableCell>
                        <Badge className={roleLabels[user.role].className}>
                          <Shield className="mr-1 h-3 w-3" />
                          {roleLabels[user.role].label}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-foreground">{user.sector}</TableCell>
                      <TableCell>
                        <Badge variant={user.active ? "default" : "outline"} className={user.active ? "bg-success/20 text-success" : ""}>
                          {user.active ? "Ativo" : "Inativo"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button variant="ghost" size="icon">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="text-destructive">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Sectors Tab */}
        <TabsContent value="sectors">
          <Card className="bg-card">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2 text-foreground">
                  <Building className="h-5 w-5" />
                  Gestão de Setores
                </CardTitle>
                <CardDescription>
                  Configure os setores e prazos de retenção
                </CardDescription>
              </div>
              <Dialog open={isSectorDialogOpen} onOpenChange={setIsSectorDialogOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Novo Setor
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Adicionar Setor</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label>Nome</Label>
                      <Input placeholder="Nome do setor" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Código</Label>
                        <Input placeholder="Ex: FIN" />
                      </div>
                      <div className="space-y-2">
                        <Label>Retenção (anos)</Label>
                        <Input type="number" placeholder="5" />
                      </div>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setIsSectorDialogOpen(false)}>
                      Cancelar
                    </Button>
                    <Button onClick={() => setIsSectorDialogOpen(false)}>Salvar</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow className="border-border hover:bg-transparent">
                    <TableHead className="text-muted-foreground">Nome</TableHead>
                    <TableHead className="text-muted-foreground">Código</TableHead>
                    <TableHead className="text-muted-foreground">Retenção</TableHead>
                    <TableHead className="w-24"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockSectors.map((sector) => (
                    <TableRow key={sector.id} className="border-border">
                      <TableCell className="font-medium text-foreground">{sector.name}</TableCell>
                      <TableCell className="text-muted-foreground">{sector.code}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-primary border-primary">
                          {sector.retention} anos
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button variant="ghost" size="icon">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="text-destructive">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Units Tab */}
        <TabsContent value="units">
          <Card className="bg-card">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2 text-foreground">
                  <Building className="h-5 w-5" />
                  Gestão de Unidades
                </CardTitle>
                <CardDescription>
                  Configure as unidades da organização
                </CardDescription>
              </div>
              <Dialog open={isUnitDialogOpen} onOpenChange={setIsUnitDialogOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Nova Unidade
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Adicionar Unidade</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label>Nome</Label>
                      <Input placeholder="Nome da unidade" />
                    </div>
                    <div className="space-y-2">
                      <Label>Código</Label>
                      <Input placeholder="Ex: MTZ" />
                    </div>
                    <div className="space-y-2">
                      <Label>Endereço</Label>
                      <Input placeholder="Endereço completo" />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setIsUnitDialogOpen(false)}>
                      Cancelar
                    </Button>
                    <Button onClick={() => setIsUnitDialogOpen(false)}>Salvar</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow className="border-border hover:bg-transparent">
                    <TableHead className="text-muted-foreground">Nome</TableHead>
                    <TableHead className="text-muted-foreground">Código</TableHead>
                    <TableHead className="text-muted-foreground">Endereço</TableHead>
                    <TableHead className="w-24"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockUnits.map((unit) => (
                    <TableRow key={unit.id} className="border-border">
                      <TableCell className="font-medium text-foreground">{unit.name}</TableCell>
                      <TableCell className="text-muted-foreground">{unit.code}</TableCell>
                      <TableCell className="text-muted-foreground">{unit.address}</TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button variant="ghost" size="icon">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="text-destructive">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Retention Tab */}
        <TabsContent value="retention">
          <Card className="bg-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-foreground">
                <Clock className="h-5 w-5" />
                Tabela de Temporalidade
              </CardTitle>
              <CardDescription>
                Configure os prazos de retenção por tipo documental
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {[
                  { type: "Financeiro", retention: 5, description: "Notas fiscais, recibos, balanços" },
                  { type: "RH", retention: 10, description: "Folhas de pagamento, contratos de trabalho" },
                  { type: "Contratos", retention: 20, description: "Contratos comerciais e de prestação de serviços" },
                  { type: "Assistencial", retention: 20, description: "Prontuários médicos, laudos" },
                  { type: "Administrativo", retention: 5, description: "Memorandos, comunicados internos" },
                  { type: "Jurídico", retention: 20, description: "Processos, pareceres jurídicos" },
                ].map((item) => (
                  <Card key={item.type} className="bg-secondary/30">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium text-foreground">{item.type}</h4>
                        <Button variant="ghost" size="icon">
                          <Edit className="h-4 w-4" />
                        </Button>
                      </div>
                      <div className="flex items-baseline gap-1 mb-2">
                        <span className="text-3xl font-bold text-primary">{item.retention}</span>
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

        {/* General Tab */}
        <TabsContent value="general">
          <div className="grid gap-6">
            <Card className="bg-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-foreground">
                  <Settings className="h-5 w-5" />
                  Configurações Gerais
                </CardTitle>
                <CardDescription>
                  Configurações básicas do sistema
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Notificações por E-mail</Label>
                    <p className="text-sm text-muted-foreground">
                      Receber notificações sobre empréstimos e descartes
                    </p>
                  </div>
                  <Switch />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Alerta de Empréstimos Atrasados</Label>
                    <p className="text-sm text-muted-foreground">
                      Notificar quando empréstimos estiverem atrasados
                    </p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Alerta de Descarte</Label>
                    <p className="text-sm text-muted-foreground">
                      Notificar quando caixas atingirem prazo de retenção
                    </p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Modo Escuro</Label>
                    <p className="text-sm text-muted-foreground">
                      Usar tema escuro na interface
                    </p>
                  </div>
                  <Switch defaultChecked />
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
                    <p className="text-sm text-muted-foreground">Empresa</p>
                    <p className="font-medium text-foreground">Kodacoda Soluções Tecnológicas</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Cliente</p>
                    <p className="font-medium text-foreground">Grupo DNA Center</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Última Atualização</p>
                    <p className="font-medium text-foreground">30/05/2026</p>
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
