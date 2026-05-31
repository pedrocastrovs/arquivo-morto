// Tipos do Sistema de Gestão de Arquivo Morto

export type BoxStatus = 
  | "preparacao"
  | "arquivada"
  | "emprestada"
  | "em_movimentacao"
  | "aguardando_descarte"
  | "descartada"

export type UserRole = "administrador" | "operador" | "consultante"

export type DocumentType = 
  | "financeiro"
  | "rh"
  | "contratos"
  | "assistencial"
  | "administrativo"
  | "juridico"

export interface Location {
  id: string
  name: string
  streets: Street[]
}

export interface Street {
  id: string
  name: string
  locationId: string
  buildings: Building[]
}

export interface Building {
  id: string
  name: string
  streetId: string
  floors: Floor[]
}

export interface Floor {
  id: string
  name: string
  buildingId: string
  towers: Tower[]
}

export interface Tower {
  id: string
  name: string
  floorId: string
  positions: Position[]
}

export interface Position {
  id: string
  name: string
  towerId: string
  isOccupied: boolean
  boxId?: string
  /** Código da caixa (ex.: CX-000001), quando ocupada */
  boxCode?: string
}

export type StructureNodeType =
  | "location"
  | "street"
  | "building"
  | "floor"
  | "tower"
  | "position"

export interface Box {
  id: string
  code: string
  barcode: string
  description: string
  sector: string
  unit: string
  responsible: string
  documentType: DocumentType
  startDate: string
  endDate: string
  observations?: string
  archiveDate: string
  expectedDiscardDate: string
  status: BoxStatus
  locationPath: string
  positionId: string
}

export interface Movement {
  id: string
  boxId: string
  boxCode: string
  date: string
  time: string
  user: string
  previousLocation: string
  newLocation: string
  reason: string
}

export interface Loan {
  id: string
  boxId: string
  boxCode: string
  requester: string
  sector: string
  requestDate: string
  pickupDate?: string
  returnDeadline: string
  returnDate?: string
  deliveryResponsible?: string
  status: "pendente" | "em_andamento" | "devolvido" | "atrasado"
}

export interface User {
  id: string
  name: string
  email: string
  role: UserRole
  sector: string
  avatar?: string
}

export interface DashboardStats {
  totalBoxes: number
  totalMovements: number
  totalLoans: number
  totalReturns: number
  occupiedSpaces: number
  freeSpaces: number
  occupancyPercentage: number
  boxesReadyForDiscard: number
  boxesDiscarded: number
  spaceRecovered: number
}
