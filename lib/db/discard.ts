import { createClient } from "@/lib/supabase/server"
import type { Box, BoxStatus, DocumentType } from "@/lib/types"

type BoxRow = {
  id: string
  code: string
  description: string
  sector: string
  document_type: DocumentType
  start_date: string
  end_date: string
  archive_date: string
  expected_discard_date: string
  status: BoxStatus
  position_id: string | null
}

function formatDate(iso: string): string {
  const [y, m, d] = iso.split("-")
  if (!y || !m || !d) return iso
  return `${d.padStart(2, "0")}/${m.padStart(2, "0")}/${y}`
}

function mapDiscardBox(row: BoxRow): Box {
  return {
    id: row.id,
    code: row.code,
    barcode: "",
    description: row.description,
    sector: row.sector,
    unit: "",
    responsible: "",
    documentType: row.document_type,
    startDate: formatDate(row.start_date),
    endDate: formatDate(row.end_date),
    archiveDate: formatDate(row.archive_date),
    expectedDiscardDate: formatDate(row.expected_discard_date),
    status: row.status,
    locationPath: "",
    positionId: row.position_id ?? "",
  }
}

const DISCARD_SELECT =
  "id, code, description, sector, document_type, start_date, end_date, archive_date, expected_discard_date, status, position_id"

export interface DiscardPageData {
  readyForDiscard: Box[]
  discarded: Box[]
  dueWithin30Days: number
}

export async function fetchDiscardPageData(): Promise<DiscardPageData> {
  const supabase = await createClient()

  const { error: syncError } = await supabase.rpc(
    "sync_boxes_discard_eligibility"
  )
  if (
    syncError &&
    !syncError.message.includes("Could not find the function")
  ) {
    throw new Error(syncError.message)
  }

  const today = new Date()
  const in30 = new Date(today)
  in30.setDate(in30.getDate() + 30)
  const toIso = (d: Date) => d.toISOString().slice(0, 10)
  const todayIso = toIso(today)
  const in30Iso = toIso(in30)

  const [readyRes, discardedRes, upcomingRes] = await Promise.all([
    supabase
      .from("boxes")
      .select(DISCARD_SELECT)
      .eq("status", "aguardando_descarte")
      .order("expected_discard_date"),
    supabase
      .from("boxes")
      .select(DISCARD_SELECT)
      .eq("status", "descartada")
      .order("code", { ascending: false }),
    supabase
      .from("boxes")
      .select("id", { count: "exact", head: true })
      .neq("status", "descartada")
      .gt("expected_discard_date", todayIso)
      .lte("expected_discard_date", in30Iso),
  ])

  if (readyRes.error) throw new Error(readyRes.error.message)
  if (discardedRes.error) throw new Error(discardedRes.error.message)
  if (upcomingRes.error) throw new Error(upcomingRes.error.message)

  return {
    readyForDiscard: (readyRes.data ?? []).map((r) =>
      mapDiscardBox(r as BoxRow)
    ),
    discarded: (discardedRes.data ?? []).map((r) =>
      mapDiscardBox(r as BoxRow)
    ),
    dueWithin30Days: upcomingRes.count ?? 0,
  }
}
