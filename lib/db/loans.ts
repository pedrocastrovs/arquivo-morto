import { createClient } from "@/lib/supabase/server"
import type { Loan } from "@/lib/types"

type LoanRow = {
  id: string
  box_id: string
  box_code: string
  requester: string
  sector: string
  request_date: string
  pickup_date: string | null
  return_deadline: string
  return_date: string | null
  delivery_responsible: string | null
  status: Loan["status"]
}

function formatDate(iso: string): string {
  const [y, m, d] = iso.split("-")
  if (!y || !m || !d) return iso
  return `${d.padStart(2, "0")}/${m.padStart(2, "0")}/${y}`
}

function mapLoan(row: LoanRow): Loan {
  return {
    id: row.id,
    boxId: row.box_id,
    boxCode: row.box_code,
    requester: row.requester,
    sector: row.sector,
    requestDate: formatDate(row.request_date),
    pickupDate: row.pickup_date ? formatDate(row.pickup_date) : undefined,
    returnDeadline: formatDate(row.return_deadline),
    returnDate: row.return_date ? formatDate(row.return_date) : undefined,
    deliveryResponsible: row.delivery_responsible ?? undefined,
    status: row.status,
  }
}

export async function fetchLoans(): Promise<Loan[]> {
  const supabase = await createClient()

  const { error: syncError } = await supabase.rpc("sync_loan_overdue")
  if (
    syncError &&
    !syncError.message.includes("Could not find the function")
  ) {
    throw new Error(syncError.message)
  }

  const { data, error } = await supabase
    .from("loans")
    .select(
      "id, box_id, box_code, requester, sector, request_date, pickup_date, return_deadline, return_date, delivery_responsible, status"
    )
    .order("request_date", { ascending: false })
    .order("created_at", { ascending: false })

  if (error) {
    throw new Error(error.message)
  }

  return (data ?? []).map((row) => mapLoan(row as LoanRow))
}
