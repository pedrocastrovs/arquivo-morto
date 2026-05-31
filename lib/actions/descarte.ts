"use server"

import { revalidatePath } from "next/cache"
import { isAdministrator } from "@/lib/auth/profile"
import { createClient } from "@/lib/supabase/server"

export type DiscardActionResult =
  | { success: true; count: number }
  | { success: false; error: string }

export async function approveDiscard(input: {
  boxIds: string[]
  justification: string
}): Promise<DiscardActionResult> {
  try {
    if (!(await isAdministrator())) {
      return {
        success: false,
        error: "Somente administradores podem aprovar descarte.",
      }
    }

    const justification = input.justification.trim()
    if (!justification) {
      return { success: false, error: "Informe a justificativa do descarte." }
    }
    if (!input.boxIds.length) {
      return { success: false, error: "Selecione ao menos uma caixa." }
    }

    const supabase = await createClient()
    const { data, error } = await supabase.rpc("approve_discard", {
      p_box_ids: input.boxIds,
      p_justification: justification,
    })

    if (error) {
      if (error.message.includes("Could not find the function")) {
        return {
          success: false,
          error:
            "Função approve_discard não encontrada. Execute a migration 20260531500000_discard_workflow.sql no Supabase.",
        }
      }
      return { success: false, error: error.message }
    }

    revalidatePath("/descarte")
    revalidatePath("/caixas")
    revalidatePath("/estrutura")
    revalidatePath("/movimentacoes")
    return { success: true, count: typeof data === "number" ? data : input.boxIds.length }
  } catch (e) {
    const message = e instanceof Error ? e.message : "Erro inesperado"
    return { success: false, error: message }
  }
}
