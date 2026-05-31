import { createClient } from "@/lib/supabase/server"
import type { Box, BoxStatus, DocumentType } from "@/lib/types"

type BoxRow = {
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

function mapBox(row: BoxRow): Box {
  return {
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
  }
}

export async function fetchBoxes(): Promise<Box[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("boxes")
    .select(
      "id, code, barcode, description, sector, unit, responsible, document_type, start_date, end_date, observations, archive_date, expected_discard_date, status, location_path, position_id"
    )
    .order("code", { ascending: true })

  if (error) {
    throw new Error(error.message)
  }

  return (data ?? []).map((row) => mapBox(row as BoxRow))
}

export async function fetchSectors(): Promise<string[]> {
  const supabase = await createClient()
  const { data, error } = await supabase.from("sectors").select("name").order("name")
  if (error) throw new Error(error.message)
  return (data ?? []).map((r) => r.name)
}

export async function fetchUnits(): Promise<string[]> {
  const supabase = await createClient()
  const { data, error } = await supabase.from("units").select("name").order("name")
  if (error) throw new Error(error.message)
  return (data ?? []).map((r) => r.name)
}
