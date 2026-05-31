import type { Box, Movement, Loan, DashboardStats, Location } from "./types"

export const mockLocations: Location[] = [
  {
    id: "loc-1",
    name: "Arquivo Central",
    streets: [
      {
        id: "str-1",
        name: "Rua A",
        locationId: "loc-1",
        buildings: [
          {
            id: "bld-1",
            name: "Prédio 01",
            streetId: "str-1",
            floors: [
              {
                id: "flr-1",
                name: "Andar 01",
                buildingId: "bld-1",
                towers: [
                  {
                    id: "twr-1",
                    name: "Torre A",
                    floorId: "flr-1",
                    positions: [
                      { id: "pos-1", name: "Posição 01", towerId: "twr-1", isOccupied: true, boxId: "box-1" },
                      { id: "pos-2", name: "Posição 02", towerId: "twr-1", isOccupied: true, boxId: "box-2" },
                      { id: "pos-3", name: "Posição 03", towerId: "twr-1", isOccupied: false },
                      { id: "pos-4", name: "Posição 04", towerId: "twr-1", isOccupied: true, boxId: "box-3" },
                      { id: "pos-5", name: "Posição 05", towerId: "twr-1", isOccupied: false },
                    ]
                  },
                  {
                    id: "twr-2",
                    name: "Torre B",
                    floorId: "flr-1",
                    positions: [
                      { id: "pos-6", name: "Posição 01", towerId: "twr-2", isOccupied: true, boxId: "box-4" },
                      { id: "pos-7", name: "Posição 02", towerId: "twr-2", isOccupied: false },
                      { id: "pos-8", name: "Posição 03", towerId: "twr-2", isOccupied: true, boxId: "box-5" },
                    ]
                  }
                ]
              },
              {
                id: "flr-2",
                name: "Andar 02",
                buildingId: "bld-1",
                towers: [
                  {
                    id: "twr-3",
                    name: "Torre A",
                    floorId: "flr-2",
                    positions: [
                      { id: "pos-9", name: "Posição 01", towerId: "twr-3", isOccupied: true, boxId: "box-6" },
                      { id: "pos-10", name: "Posição 02", towerId: "twr-3", isOccupied: false },
                    ]
                  }
                ]
              }
            ]
          }
        ]
      },
      {
        id: "str-2",
        name: "Rua B",
        locationId: "loc-1",
        buildings: [
          {
            id: "bld-2",
            name: "Prédio 02",
            streetId: "str-2",
            floors: [
              {
                id: "flr-3",
                name: "Andar 01",
                buildingId: "bld-2",
                towers: [
                  {
                    id: "twr-4",
                    name: "Torre A",
                    floorId: "flr-3",
                    positions: [
                      { id: "pos-11", name: "Posição 01", towerId: "twr-4", isOccupied: false },
                      { id: "pos-12", name: "Posição 02", towerId: "twr-4", isOccupied: false },
                    ]
                  }
                ]
              }
            ]
          }
        ]
      }
    ]
  }
]

export const mockBoxes: Box[] = [
  {
    id: "box-1",
    code: "CX-000001",
    barcode: "7891234567890",
    description: "Documentos Financeiros 2020",
    sector: "Financeiro",
    unit: "Matriz",
    responsible: "Maria Silva",
    documentType: "financeiro",
    startDate: "2020-01-01",
    endDate: "2020-12-31",
    observations: "Notas fiscais e recibos",
    archiveDate: "2021-02-15",
    expectedDiscardDate: "2026-02-15",
    status: "arquivada",
    locationPath: "Arquivo Central > Rua A > Prédio 01 > Andar 01 > Torre A > Posição 01",
    positionId: "pos-1"
  },
  {
    id: "box-2",
    code: "CX-000002",
    barcode: "7891234567891",
    description: "Contratos de Fornecedores 2019",
    sector: "Jurídico",
    unit: "Matriz",
    responsible: "João Santos",
    documentType: "contratos",
    startDate: "2019-01-01",
    endDate: "2019-12-31",
    archiveDate: "2020-03-10",
    expectedDiscardDate: "2039-03-10",
    status: "arquivada",
    locationPath: "Arquivo Central > Rua A > Prédio 01 > Andar 01 > Torre A > Posição 02",
    positionId: "pos-2"
  },
  {
    id: "box-3",
    code: "CX-000003",
    barcode: "7891234567892",
    description: "Folhas de Pagamento 2018",
    sector: "RH",
    unit: "Filial SP",
    responsible: "Ana Costa",
    documentType: "rh",
    startDate: "2018-01-01",
    endDate: "2018-12-31",
    archiveDate: "2019-02-28",
    expectedDiscardDate: "2029-02-28",
    status: "emprestada",
    locationPath: "Arquivo Central > Rua A > Prédio 01 > Andar 01 > Torre A > Posição 04",
    positionId: "pos-4"
  },
  {
    id: "box-4",
    code: "CX-000004",
    barcode: "7891234567893",
    description: "Prontuários Médicos 2021",
    sector: "Assistencial",
    unit: "Matriz",
    responsible: "Dr. Carlos Lima",
    documentType: "assistencial",
    startDate: "2021-01-01",
    endDate: "2021-12-31",
    archiveDate: "2022-01-20",
    expectedDiscardDate: "2042-01-20",
    status: "arquivada",
    locationPath: "Arquivo Central > Rua A > Prédio 01 > Andar 01 > Torre B > Posição 01",
    positionId: "pos-6"
  },
  {
    id: "box-5",
    code: "CX-000005",
    barcode: "7891234567894",
    description: "Documentos Administrativos 2017",
    sector: "Administrativo",
    unit: "Matriz",
    responsible: "Paula Ferreira",
    documentType: "administrativo",
    startDate: "2017-01-01",
    endDate: "2017-12-31",
    archiveDate: "2018-03-15",
    expectedDiscardDate: "2023-03-15",
    status: "aguardando_descarte",
    locationPath: "Arquivo Central > Rua A > Prédio 01 > Andar 01 > Torre B > Posição 03",
    positionId: "pos-8"
  },
  {
    id: "box-6",
    code: "CX-000006",
    barcode: "7891234567895",
    description: "Notas Fiscais 2022",
    sector: "Financeiro",
    unit: "Filial RJ",
    responsible: "Roberto Alves",
    documentType: "financeiro",
    startDate: "2022-01-01",
    endDate: "2022-12-31",
    archiveDate: "2023-02-01",
    expectedDiscardDate: "2028-02-01",
    status: "preparacao",
    locationPath: "Arquivo Central > Rua A > Prédio 01 > Andar 02 > Torre A > Posição 01",
    positionId: "pos-9"
  },
  {
    id: "box-7",
    code: "CX-000007",
    barcode: "7891234567896",
    description: "Contratos Encerrados 2010",
    sector: "Jurídico",
    unit: "Matriz",
    responsible: "Marcos Oliveira",
    documentType: "contratos",
    startDate: "2010-01-01",
    endDate: "2010-12-31",
    archiveDate: "2011-04-10",
    expectedDiscardDate: "2031-04-10",
    status: "descartada",
    locationPath: "N/A",
    positionId: ""
  }
]

export const mockMovements: Movement[] = [
  {
    id: "mov-1",
    boxId: "box-1",
    boxCode: "CX-000001",
    date: "2024-01-15",
    time: "09:30",
    user: "Maria Silva",
    previousLocation: "Recepção",
    newLocation: "Arquivo Central > Rua A > Prédio 01 > Andar 01 > Torre A > Posição 01",
    reason: "Arquivamento inicial"
  },
  {
    id: "mov-2",
    boxId: "box-3",
    boxCode: "CX-000003",
    date: "2024-03-20",
    time: "14:15",
    user: "João Santos",
    previousLocation: "Arquivo Central > Rua A > Prédio 01 > Andar 01 > Torre A > Posição 04",
    newLocation: "Setor RH",
    reason: "Empréstimo para auditoria"
  },
  {
    id: "mov-3",
    boxId: "box-2",
    boxCode: "CX-000002",
    date: "2024-03-22",
    time: "10:45",
    user: "Ana Costa",
    previousLocation: "Arquivo Central > Rua A > Prédio 01 > Andar 02 > Torre A > Posição 03",
    newLocation: "Arquivo Central > Rua A > Prédio 01 > Andar 01 > Torre A > Posição 02",
    reason: "Reorganização do arquivo"
  },
  {
    id: "mov-4",
    boxId: "box-5",
    boxCode: "CX-000005",
    date: "2024-04-01",
    time: "11:00",
    user: "Carlos Lima",
    previousLocation: "Arquivo Central > Rua A > Prédio 01 > Andar 01 > Torre B > Posição 03",
    newLocation: "Área de Descarte",
    reason: "Preparação para descarte"
  },
  {
    id: "mov-5",
    boxId: "box-4",
    boxCode: "CX-000004",
    date: "2024-04-05",
    time: "16:30",
    user: "Paula Ferreira",
    previousLocation: "Recepção",
    newLocation: "Arquivo Central > Rua A > Prédio 01 > Andar 01 > Torre B > Posição 01",
    reason: "Arquivamento inicial"
  }
]

export const mockLoans: Loan[] = [
  {
    id: "loan-1",
    boxId: "box-3",
    boxCode: "CX-000003",
    requester: "Ana Costa",
    sector: "RH",
    requestDate: "2024-03-18",
    pickupDate: "2024-03-20",
    returnDeadline: "2024-04-20",
    status: "em_andamento"
  },
  {
    id: "loan-2",
    boxId: "box-1",
    boxCode: "CX-000001",
    requester: "Roberto Alves",
    sector: "Financeiro",
    requestDate: "2024-02-10",
    pickupDate: "2024-02-12",
    returnDeadline: "2024-03-12",
    returnDate: "2024-03-10",
    deliveryResponsible: "Maria Silva",
    status: "devolvido"
  },
  {
    id: "loan-3",
    boxId: "box-2",
    boxCode: "CX-000002",
    requester: "Marcos Oliveira",
    sector: "Jurídico",
    requestDate: "2024-01-05",
    pickupDate: "2024-01-08",
    returnDeadline: "2024-02-08",
    returnDate: "2024-02-20",
    deliveryResponsible: "João Santos",
    status: "devolvido"
  },
  {
    id: "loan-4",
    boxId: "box-4",
    boxCode: "CX-000004",
    requester: "Dr. Paulo Mendes",
    sector: "Assistencial",
    requestDate: "2024-04-01",
    returnDeadline: "2024-05-01",
    status: "pendente"
  },
  {
    id: "loan-5",
    boxId: "box-6",
    boxCode: "CX-000006",
    requester: "Fernanda Lima",
    sector: "Financeiro",
    requestDate: "2024-02-20",
    pickupDate: "2024-02-22",
    returnDeadline: "2024-03-22",
    status: "atrasado"
  }
]

export const mockDashboardStats: DashboardStats = {
  totalBoxes: 1247,
  totalMovements: 342,
  totalLoans: 89,
  totalReturns: 76,
  occupiedSpaces: 1180,
  freeSpaces: 320,
  occupancyPercentage: 78.7,
  boxesReadyForDiscard: 45,
  boxesDiscarded: 128,
  spaceRecovered: 128
}

export const mockSectorStats = [
  { sector: "Financeiro", boxes: 420, percentage: 33.7 },
  { sector: "RH", boxes: 312, percentage: 25.0 },
  { sector: "Jurídico", boxes: 245, percentage: 19.6 },
  { sector: "Assistencial", boxes: 180, percentage: 14.4 },
  { sector: "Administrativo", boxes: 90, percentage: 7.2 }
]

export const mockMonthlyMovements = [
  { month: "Jan", movimentacoes: 45, emprestimos: 12 },
  { month: "Fev", movimentacoes: 52, emprestimos: 18 },
  { month: "Mar", movimentacoes: 38, emprestimos: 15 },
  { month: "Abr", movimentacoes: 65, emprestimos: 22 },
  { month: "Mai", movimentacoes: 48, emprestimos: 14 },
  { month: "Jun", movimentacoes: 55, emprestimos: 19 }
]
