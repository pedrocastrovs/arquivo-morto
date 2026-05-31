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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {
  ChevronRight,
  ChevronDown,
  MapPin,
  Building2,
  Layers,
  Box,
  Plus,
  Trash2,
  FolderTree,
  Loader2,
} from "lucide-react"
import {
  createStructureNode,
  deleteStructureNode,
} from "@/lib/actions/estrutura"
import { countStructureStats } from "@/lib/estrutura/stats"
import { getParentOptions } from "@/lib/estrutura/parent-options"
import type { Location, StructureNodeType, UserRole } from "@/lib/types"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { cn } from "@/lib/utils"

const nodeIcons: Record<StructureNodeType, React.ElementType> = {
  location: MapPin,
  street: FolderTree,
  building: Building2,
  floor: Layers,
  tower: Box,
  position: Box,
}

const nodeLabels: Record<StructureNodeType, string> = {
  location: "Local",
  street: "Rua",
  building: "Prédio",
  floor: "Andar",
  tower: "Torre",
  position: "Posição",
}

interface TreeNodeProps {
  type: StructureNodeType
  name: string
  id: string
  children?: React.ReactNode
  isOccupied?: boolean
  boxCode?: string
  level: number
  canManage: boolean
  onDelete?: (type: StructureNodeType, id: string, name: string) => void
}

function TreeNode({
  type,
  name,
  id,
  children,
  isOccupied,
  boxCode,
  level,
  canManage,
  onDelete,
}: TreeNodeProps) {
  const [expanded, setExpanded] = useState(level < 3)
  const Icon = nodeIcons[type]
  const hasChildren = !!children

  return (
    <div className="select-none">
      <div
        className={cn(
          "group flex items-center gap-2 rounded-lg px-3 py-2 hover:bg-secondary/50 transition-colors",
          level === 0 && "bg-secondary/30",
          hasChildren && "cursor-pointer"
        )}
        style={{ paddingLeft: `${level * 16 + 12}px` }}
        onClick={() => hasChildren && setExpanded(!expanded)}
      >
        {hasChildren ? (
          <button
            type="button"
            className="p-0.5"
            onClick={(e) => {
              e.stopPropagation()
              setExpanded(!expanded)
            }}
          >
            {expanded ? (
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            ) : (
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            )}
          </button>
        ) : (
          <span className="w-5" />
        )}
        <Icon
          className={cn(
            "h-4 w-4",
            type === "position" && isOccupied
              ? "text-primary"
              : "text-muted-foreground"
          )}
        />
        <span className="flex-1 text-sm font-medium text-foreground">{name}</span>
        {type === "position" && (
          <Badge
            variant={isOccupied ? "default" : "outline"}
            className={cn(
              "text-xs",
              isOccupied
                ? "bg-primary/20 text-primary hover:bg-primary/30"
                : "text-muted-foreground"
            )}
          >
            {isOccupied ? boxCode || "Ocupada" : "Livre"}
          </Badge>
        )}
        <span className="text-xs text-muted-foreground">{nodeLabels[type]}</span>
        {canManage && onDelete && (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-7 w-7 opacity-0 group-hover:opacity-100"
            onClick={(e) => {
              e.stopPropagation()
              onDelete(type, id, name)
            }}
          >
            <Trash2 className="h-3.5 w-3.5 text-destructive" />
            <span className="sr-only">Excluir {name}</span>
          </Button>
        )}
      </div>
      {expanded && hasChildren && (
        <div className="border-l border-border ml-6">{children}</div>
      )}
    </div>
  )
}

const roleLabels: Record<UserRole, string> = {
  administrador: "Administrador",
  operador: "Operador",
  consultante: "Consultante",
}

interface EstruturaContentProps {
  initialLocations: Location[]
  canManage: boolean
  userRole: UserRole
  loadError: string | null
}

export function EstruturaContent({
  initialLocations,
  canManage,
  userRole,
  loadError,
}: EstruturaContentProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [selectedType, setSelectedType] = useState<StructureNodeType>("location")
  const [newName, setNewName] = useState("")
  const [parentId, setParentId] = useState("")
  const [formError, setFormError] = useState<string | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<{
    type: StructureNodeType
    id: string
    name: string
  } | null>(null)

  const locations = initialLocations
  const { totalPositions, occupiedPositions } = useMemo(
    () => countStructureStats(locations),
    [locations]
  )

  const parentOptions = useMemo(
    () => getParentOptions(locations, selectedType),
    [locations, selectedType]
  )

  const resetForm = () => {
    setNewName("")
    setParentId("")
    setFormError(null)
    setSelectedType("location")
  }

  const handleSave = () => {
    setFormError(null)
    startTransition(async () => {
      const result = await createStructureNode(
        selectedType,
        newName,
        selectedType === "location" ? undefined : parentId
      )
      if (!result.success) {
        setFormError(result.error)
        return
      }
      setIsAddDialogOpen(false)
      resetForm()
      router.refresh()
    })
  }

  const handleDelete = () => {
    if (!deleteTarget) return
    startTransition(async () => {
      const result = await deleteStructureNode(
        deleteTarget.type,
        deleteTarget.id
      )
      if (!result.success) {
        setFormError(result.error)
        setDeleteTarget(null)
        return
      }
      setDeleteTarget(null)
      router.refresh()
    })
  }

  if (loadError) {
    return (
      <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-6 text-destructive">
        <p className="font-medium">Não foi possível carregar a estrutura</p>
        <p className="mt-1 text-sm">{loadError}</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Estrutura Física</h1>
          <p className="text-muted-foreground">
            Local → Rua → Prédio → Andar → Torre → Posição
            {!canManage && " · somente leitura"}
          </p>
        </div>
        {canManage && (
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
                Adicionar
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Adicionar {nodeLabels[selectedType]}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>Tipo</Label>
                  <Select
                    value={selectedType}
                    onValueChange={(v) => {
                      setSelectedType(v as StructureNodeType)
                      setParentId("")
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {(Object.keys(nodeLabels) as StructureNodeType[]).map(
                        (key) => (
                          <SelectItem key={key} value={key}>
                            {nodeLabels[key]}
                          </SelectItem>
                        )
                      )}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Nome</Label>
                  <Input
                    placeholder={`Nome do ${nodeLabels[selectedType]}`}
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                  />
                </div>
                {selectedType !== "location" && (
                  <div className="space-y-2">
                    <Label>Pertence a</Label>
                    <Select value={parentId} onValueChange={setParentId}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione..." />
                      </SelectTrigger>
                      <SelectContent>
                        {parentOptions.length === 0 ? (
                          <SelectItem value="_none" disabled>
                            Cadastre o nível pai primeiro
                          </SelectItem>
                        ) : (
                          parentOptions.map((opt) => (
                            <SelectItem key={opt.id} value={opt.id}>
                              {opt.label}
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                )}
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
                <Button onClick={handleSave} disabled={isPending}>
                  {isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Salvando…
                    </>
                  ) : (
                    "Salvar"
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {!canManage && (
        <Alert>
          <AlertTitle>Modo somente leitura</AlertTitle>
          <AlertDescription>
            Seu perfil é <strong>{roleLabels[userRole]}</strong>. Para adicionar
            locais, ruas, prédios e posições, é preciso ser{" "}
            <strong>Operador</strong> ou <strong>Administrador</strong>. No
            Supabase SQL Editor:{" "}
            <code className="text-xs">
              update profiles set role = &apos;administrador&apos; where email =
              &apos;seu@email.com&apos;;
            </code>
            <br />
            <span className="mt-2 block text-muted-foreground">
              <strong>Unidades</strong> (Matriz, Filial…) não ficam nesta tela —
              são cadastros em Configurações (ainda em desenvolvimento). Aqui você
              monta o depósito físico onde as caixas ficam guardadas.
            </span>
          </AlertDescription>
        </Alert>
      )}

      {formError && !isAddDialogOpen && (
        <div
          className="rounded-lg border border-destructive/50 bg-destructive/10 px-4 py-3 text-sm text-destructive"
          role="alert"
        >
          {formError}
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="bg-card">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-primary/10 p-2">
                <MapPin className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total de Posições</p>
                <p className="text-2xl font-bold text-foreground">
                  {totalPositions}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-success/10 p-2">
                <Box className="h-5 w-5 text-success" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Posições Ocupadas</p>
                <p className="text-2xl font-bold text-foreground">
                  {occupiedPositions}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-warning/10 p-2">
                <Box className="h-5 w-5 text-warning" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Posições Livres</p>
                <p className="text-2xl font-bold text-foreground">
                  {totalPositions - occupiedPositions}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-card">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-foreground">Hierarquia do Arquivo</CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-muted-foreground">
              <span className="mr-1 inline-block h-2 w-2 rounded-full bg-primary" />
              Ocupada
            </Badge>
            <Badge variant="outline" className="text-muted-foreground">
              <span className="mr-1 inline-block h-2 w-2 rounded-full bg-muted-foreground" />
              Livre
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          {locations.length === 0 ? (
            <p className="py-8 text-center text-muted-foreground">
              Nenhum local cadastrado.
              {canManage
                ? " Use Adicionar para criar o primeiro local."
                : " Peça a um administrador para configurar a estrutura."}
            </p>
          ) : (
            <div className="space-y-1">
              {locations.map((location) => (
                <TreeNode
                  key={location.id}
                  type="location"
                  name={location.name}
                  id={location.id}
                  level={0}
                  canManage={canManage}
                  onDelete={(t, id, name) => setDeleteTarget({ type: t, id, name })}
                >
                  {location.streets.map((street) => (
                    <TreeNode
                      key={street.id}
                      type="street"
                      name={street.name}
                      id={street.id}
                      level={1}
                      canManage={canManage}
                      onDelete={(t, id, name) =>
                        setDeleteTarget({ type: t, id, name })
                      }
                    >
                      {street.buildings.map((building) => (
                        <TreeNode
                          key={building.id}
                          type="building"
                          name={building.name}
                          id={building.id}
                          level={2}
                          canManage={canManage}
                          onDelete={(t, id, name) =>
                            setDeleteTarget({ type: t, id, name })
                          }
                        >
                          {building.floors.map((floor) => (
                            <TreeNode
                              key={floor.id}
                              type="floor"
                              name={floor.name}
                              id={floor.id}
                              level={3}
                              canManage={canManage}
                              onDelete={(t, id, name) =>
                                setDeleteTarget({ type: t, id, name })
                              }
                            >
                              {floor.towers.map((tower) => (
                                <TreeNode
                                  key={tower.id}
                                  type="tower"
                                  name={tower.name}
                                  id={tower.id}
                                  level={4}
                                  canManage={canManage}
                                  onDelete={(t, id, name) =>
                                    setDeleteTarget({ type: t, id, name })
                                  }
                                >
                                  {tower.positions.map((position) => (
                                    <TreeNode
                                      key={position.id}
                                      type="position"
                                      name={position.name}
                                      id={position.id}
                                      level={5}
                                      isOccupied={position.isOccupied}
                                      boxCode={position.boxCode}
                                      canManage={canManage}
                                      onDelete={(t, id, name) =>
                                        setDeleteTarget({ type: t, id, name })
                                      }
                                    />
                                  ))}
                                </TreeNode>
                              ))}
                            </TreeNode>
                          ))}
                        </TreeNode>
                      ))}
                    </TreeNode>
                  ))}
                </TreeNode>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <AlertDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir item?</AlertDialogTitle>
            <AlertDialogDescription>
              {deleteTarget &&
                `Confirma a exclusão de "${deleteTarget.name}" (${nodeLabels[deleteTarget.type]})? Itens filhos também serão removidos.`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isPending}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault()
                handleDelete()
              }}
              disabled={isPending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isPending ? "Excluindo…" : "Excluir"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
