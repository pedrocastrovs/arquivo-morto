"use client"

import { useState } from "react"
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
  ChevronRight,
  ChevronDown,
  MapPin,
  Building2,
  Layers,
  Box,
  Plus,
  Edit,
  Trash2,
  FolderTree,
} from "lucide-react"
import { mockLocations } from "@/lib/mock-data"
import type { Location, Street, Building, Floor, Tower, Position } from "@/lib/types"
import { cn } from "@/lib/utils"

type NodeType = "location" | "street" | "building" | "floor" | "tower" | "position"

interface TreeNodeProps {
  type: NodeType
  name: string
  id: string
  children?: React.ReactNode
  isOccupied?: boolean
  boxCode?: string
  level: number
}

const nodeIcons: Record<NodeType, React.ElementType> = {
  location: MapPin,
  street: FolderTree,
  building: Building2,
  floor: Layers,
  tower: Box,
  position: Box,
}

const nodeLabels: Record<NodeType, string> = {
  location: "Local",
  street: "Rua",
  building: "Prédio",
  floor: "Andar",
  tower: "Torre",
  position: "Posição",
}

function TreeNode({ type, name, id, children, isOccupied, boxCode, level }: TreeNodeProps) {
  const [expanded, setExpanded] = useState(level < 3)
  const Icon = nodeIcons[type]
  const hasChildren = !!children

  return (
    <div className="select-none">
      <div
        className={cn(
          "flex items-center gap-2 rounded-lg px-3 py-2 hover:bg-secondary/50 cursor-pointer transition-colors",
          level === 0 && "bg-secondary/30"
        )}
        style={{ paddingLeft: `${level * 16 + 12}px` }}
        onClick={() => hasChildren && setExpanded(!expanded)}
      >
        {hasChildren ? (
          <button className="p-0.5">
            {expanded ? (
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            ) : (
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            )}
          </button>
        ) : (
          <span className="w-5" />
        )}
        <Icon className={cn(
          "h-4 w-4",
          type === "position" && isOccupied ? "text-primary" : "text-muted-foreground"
        )} />
        <span className="flex-1 text-sm font-medium text-foreground">{name}</span>
        {type === "position" && (
          <Badge
            variant={isOccupied ? "default" : "outline"}
            className={cn(
              "text-xs",
              isOccupied ? "bg-primary/20 text-primary hover:bg-primary/30" : "text-muted-foreground"
            )}
          >
            {isOccupied ? boxCode || "Ocupada" : "Livre"}
          </Badge>
        )}
        <span className="text-xs text-muted-foreground">{nodeLabels[type]}</span>
      </div>
      {expanded && hasChildren && (
        <div className="border-l border-border ml-6">
          {children}
        </div>
      )}
    </div>
  )
}

export function EstruturaContent() {
  const [locations] = useState<Location[]>(mockLocations)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [selectedType, setSelectedType] = useState<NodeType>("location")

  const totalPositions = locations.reduce((acc, loc) => {
    return acc + loc.streets.reduce((acc2, street) => {
      return acc2 + street.buildings.reduce((acc3, building) => {
        return acc3 + building.floors.reduce((acc4, floor) => {
          return acc4 + floor.towers.reduce((acc5, tower) => {
            return acc5 + tower.positions.length
          }, 0)
        }, 0)
      }, 0)
    }, 0)
  }, 0)

  const occupiedPositions = locations.reduce((acc, loc) => {
    return acc + loc.streets.reduce((acc2, street) => {
      return acc2 + street.buildings.reduce((acc3, building) => {
        return acc3 + building.floors.reduce((acc4, floor) => {
          return acc4 + floor.towers.reduce((acc5, tower) => {
            return acc5 + tower.positions.filter(p => p.isOccupied).length
          }, 0)
        }, 0)
      }, 0)
    }, 0)
  }, 0)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Estrutura Física</h1>
          <p className="text-muted-foreground">
            Gerencie a hierarquia do arquivo morto
          </p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Adicionar
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Adicionar Item</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Tipo</Label>
                <Select value={selectedType} onValueChange={(v) => setSelectedType(v as NodeType)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="location">Local</SelectItem>
                    <SelectItem value="street">Rua</SelectItem>
                    <SelectItem value="building">Prédio</SelectItem>
                    <SelectItem value="floor">Andar</SelectItem>
                    <SelectItem value="tower">Torre</SelectItem>
                    <SelectItem value="position">Posição</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Nome</Label>
                <Input placeholder={`Nome do ${nodeLabels[selectedType]}`} />
              </div>
              {selectedType !== "location" && (
                <div className="space-y-2">
                  <Label>Pertence a</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="item-1">Item 1</SelectItem>
                      <SelectItem value="item-2">Item 2</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={() => setIsAddDialogOpen(false)}>
                Salvar
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="bg-card">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-primary/10 p-2">
                <MapPin className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total de Posições</p>
                <p className="text-2xl font-bold text-foreground">{totalPositions}</p>
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
                <p className="text-2xl font-bold text-foreground">{occupiedPositions}</p>
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
                <p className="text-2xl font-bold text-foreground">{totalPositions - occupiedPositions}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tree View */}
      <Card className="bg-card">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-foreground">Hierarquia do Arquivo</CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-muted-foreground">
              <span className="mr-1 h-2 w-2 rounded-full bg-primary inline-block" />
              Ocupada
            </Badge>
            <Badge variant="outline" className="text-muted-foreground">
              <span className="mr-1 h-2 w-2 rounded-full bg-muted-foreground inline-block" />
              Livre
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-1">
            {locations.map((location) => (
              <TreeNode key={location.id} type="location" name={location.name} id={location.id} level={0}>
                {location.streets.map((street) => (
                  <TreeNode key={street.id} type="street" name={street.name} id={street.id} level={1}>
                    {street.buildings.map((building) => (
                      <TreeNode key={building.id} type="building" name={building.name} id={building.id} level={2}>
                        {building.floors.map((floor) => (
                          <TreeNode key={floor.id} type="floor" name={floor.name} id={floor.id} level={3}>
                            {floor.towers.map((tower) => (
                              <TreeNode key={tower.id} type="tower" name={tower.name} id={tower.id} level={4}>
                                {tower.positions.map((position) => (
                                  <TreeNode
                                    key={position.id}
                                    type="position"
                                    name={position.name}
                                    id={position.id}
                                    level={5}
                                    isOccupied={position.isOccupied}
                                    boxCode={position.boxId ? `CX-${position.boxId.split("-")[1]?.padStart(6, "0")}` : undefined}
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
        </CardContent>
      </Card>
    </div>
  )
}
