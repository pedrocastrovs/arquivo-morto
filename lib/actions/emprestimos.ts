"use server"

import { revalidatePath } from "next/cache"
import { canManageBoxes } from "@/lib/auth/profile"
import { createClient } from "@/lib/supabase/server"

export type LoanActionResult =
  | { success: true }
  | { success: false; error: string }

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

function migrationHint(fn: string): string {
  return `Função ${fn} não encontrada. Execute a migration 20260531400000_loans_workflow.sql no Supabase.`
}

async function runLoanAction(
  fn: () => Promise<LoanActionResult>
): Promise<LoanActionResult> {
  try {
    return await fn()
  } catch (e) {
    const message = e instanceof Error ? e.message : "Erro inesperado"
    if (message.includes("fetch") || message.includes("ECONNREFUSED")) {
      return {
        success: false,
        error:
          "Falha de conexão com o servidor. Verifique se o `npm run dev` está rodando.",
      }
    }
    return { success: false, error: message }
  }
}

export async function createLoan(input: {
  boxId: string
  requester: string
  sector: string
  returnDeadline: string
}): Promise<LoanActionResult> {
  return runLoanAction(async () => {
    if (!(await canManageBoxes())) {
      return { success: false, error: "Sem permissão para criar empréstimos." }
    }

    const requester = input.requester.trim()
    const sector = input.sector.trim()
    if (!requester) {
      return { success: false, error: "Informe o solicitante." }
    }
    if (!sector) {
      return { success: false, error: "Informe o setor." }
    }
    if (!input.boxId) {
      return { success: false, error: "Selecione a caixa." }
    }

    const deadline = parseISODate(input.returnDeadline)
    if (!deadline) {
      return { success: false, error: "Informe um prazo de devolução válido." }
    }

    const supabase = await createClient()
    const { error } = await supabase.rpc("create_loan", {
      p_box_id: input.boxId,
      p_requester: requester,
      p_sector: sector,
      p_return_deadline: deadline,
    })

    if (error) {
      if (error.message.includes("Could not find the function")) {
        return { success: false, error: migrationHint("create_loan") }
      }
      return { success: false, error: error.message }
    }

    revalidatePath("/emprestimos")
    revalidatePath("/caixas")
    return { success: true }
  })
}

export async function confirmLoanPickup(
  loanId: string
): Promise<LoanActionResult> {
  return runLoanAction(async () => {
    if (!(await canManageBoxes())) {
      return { success: false, error: "Sem permissão." }
    }
    if (!loanId) {
      return { success: false, error: "Empréstimo inválido." }
    }

    const supabase = await createClient()
    const { error } = await supabase.rpc("confirm_loan_pickup", {
      p_loan_id: loanId,
    })

    if (error) {
      if (error.message.includes("Could not find the function")) {
        return { success: false, error: migrationHint("confirm_loan_pickup") }
      }
      return { success: false, error: error.message }
    }

    revalidatePath("/emprestimos")
    revalidatePath("/caixas")
    return { success: true }
  })
}

export async function returnLoan(input: {
  loanId: string
  deliveryResponsible: string
}): Promise<LoanActionResult> {
  return runLoanAction(async () => {
    if (!(await canManageBoxes())) {
      return { success: false, error: "Sem permissão para registrar devolução." }
    }

    const responsible = input.deliveryResponsible.trim()
    if (!responsible) {
      return {
        success: false,
        error: "Informe o responsável pela entrega.",
      }
    }
    if (!input.loanId) {
      return { success: false, error: "Selecione o empréstimo." }
    }

    const supabase = await createClient()
    const { error } = await supabase.rpc("return_loan", {
      p_loan_id: input.loanId,
      p_delivery_responsible: responsible,
    })

    if (error) {
      if (error.message.includes("Could not find the function")) {
        return { success: false, error: migrationHint("return_loan") }
      }
      return { success: false, error: error.message }
    }

    revalidatePath("/emprestimos")
    revalidatePath("/caixas")
    return { success: true }
  })
}
