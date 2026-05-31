"use server"

import { revalidatePath } from "next/cache"
import { canManageBoxes } from "@/lib/auth/profile"
import { createClient } from "@/lib/supabase/server"
import type { Box, BoxStatus, DocumentType } from "@/lib/types"

export type BoxActionResult =
  | { success: true; box: Box }
  | { success: false; error: string }

export interface CreateBoxInput {
  code?: string
  barcode?: string
  description: string
  sector: string
  unit: string
  documentType: DocumentType
  responsible: string
  startDate: string
  endDate: string
  observations?: string
  positionId?: string
  locationPath?: string
}

/** Aceita apenas YYYY-MM-DD (valor do input type="date"). */
function parseISODate(dateStr: string): string | null {
  const trimmed = dateStr.trim()
  if (!/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) return null
  const [y, m, d] = trimmed.split("-").map(Number)
  if (m < 1 || m > 12 || d < 1 || d > 31) return null
  const test = new Date(Date.UTC(y, m - 1, d))
  if (
    test.getUTCFullYear() !== y ||
    test.getUTCMonth() !== m - 1 ||
    test.getUTCDate() !== d
  ) {
    return null
  }
  return trimmed
}

function addYearsToISODate(isoDate: string, years: number): string {
  const [y, m, d] = isoDate.split("-").map(Number)
  return `${y + years}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}`
}

function todayISODate(): string {
  const now = new Date()
  const y = now.getFullYear()
  const m = String(now.getMonth() + 1).padStart(2, "0")
  const day = String(now.getDate()).padStart(2, "0")
  return `${y}-${m}-${day}`
}

export async function createBox(
  input: CreateBoxInput
): Promise<BoxActionResult> {
  try {
    return await createBoxInternal(input)
  } catch (e) {
    const message = e instanceof Error ? e.message : "Erro inesperado"
    if (message.includes("fetch") || message.includes("ECONNREFUSED")) {
      return {
        success: false,
        error:
          "Falha de conexão com o servidor. Verifique se o `npm run dev` está rodando e o Supabase acessível.",
      }
    }
    return { success: false, error: message }
  }
}

async function createBoxInternal(
  input: CreateBoxInput
): Promise<BoxActionResult> {
  if (!(await canManageBoxes())) {
    return {
      success: false,
      error: "Sem permissão para cadastrar caixas.",
    }
  }

  const description = input.description.trim()
  if (!description) {
    return { success: false, error: "Informe a descrição." }
  }
  if (!input.sector || !input.unit || !input.documentType) {
    return { success: false, error: "Preencha setor, unidade e tipo documental." }
  }
  if (!input.responsible.trim()) {
    return { success: false, error: "Informe o responsável." }
  }
  const startDate = parseISODate(input.startDate)
  const endDate = parseISODate(input.endDate)
  if (!startDate || !endDate) {
    return {
      success: false,
      error: "Informe datas válidas (inicial e final) no formato do calendário.",
    }
  }
  if (endDate < startDate) {
    return {
      success: false,
      error: "A data final deve ser igual ou posterior à data inicial.",
    }
  }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  let code = input.code?.trim()
  if (!code) {
    const { data: generated, error: codeError } = await supabase.rpc(
      "next_box_code"
    )
    if (codeError) {
      return { success: false, error: codeError.message }
    }
    code = generated as string
  }

  const barcode =
    input.barcode?.trim() || `7890${Date.now().toString().slice(-10)}`
  const archiveDate = todayISODate()
  const expectedDiscardDate = addYearsToISODate(endDate, 5)

  const positionId = input.positionId?.trim() || null
  const locationPath = positionId
    ? (input.locationPath?.trim() || "A definir")
    : "A definir"
  const status: BoxStatus = positionId ? "arquivada" : "preparacao"

  if (positionId) {
    const { data: position, error: posError } = await supabase
      .from("positions")
      .select("is_occupied")
      .eq("id", positionId)
      .single()

    if (posError) {
      return { success: false, error: posError.message }
    }
    if (position.is_occupied) {
      return { success: false, error: "Esta posição já está ocupada." }
    }
  }

  const { data: box, error } = await supabase
    .from("boxes")
    .insert({
      code,
      barcode,
      description,
      sector: input.sector,
      unit: input.unit,
      responsible: input.responsible.trim(),
      document_type: input.documentType,
      start_date: startDate,
      end_date: endDate,
      observations: input.observations?.trim() || null,
      archive_date: archiveDate,
      expected_discard_date: expectedDiscardDate,
      status,
      location_path: locationPath,
      position_id: positionId,
      created_by: user?.id ?? null,
    })
    .select(
      "id, code, barcode, description, sector, unit, responsible, document_type, start_date, end_date, observations, archive_date, expected_discard_date, status, location_path, position_id"
    )
    .single()

  if (error) {
    return { success: false, error: error.message }
  }

  revalidatePath("/caixas")
  revalidatePath("/estrutura")

  const row = box as {
    id: string
    code: string
    barcode: string
    description: string
    sector: string
    unit: string
    responsible: string
    document_type: DocumentType
    start_date: string
    end_date: string
    observations: string | null
    archive_date: string
    expected_discard_date: string
    status: BoxStatus
    location_path: string
    position_id: string | null
  }

  return {
    success: true,
    box: {
      id: row.id,
      code: row.code,
      barcode: row.barcode,
      description: row.description,
      sector: row.sector,
      unit: row.unit,
      responsible: row.responsible,
      documentType: row.document_type,
      startDate: row.start_date,
      endDate: row.end_date,
      observations: row.observations ?? undefined,
      archiveDate: row.archive_date,
      expectedDiscardDate: row.expected_discard_date,
      status: row.status,
      locationPath: row.location_path,
      positionId: row.position_id ?? "",
    },
  }
}
