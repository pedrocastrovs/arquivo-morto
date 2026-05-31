"use server"

import { revalidatePath } from "next/cache"
import { canManageBoxes } from "@/lib/auth/profile"
import { createClient } from "@/lib/supabase/server"

export type MovementActionResult =
  | { success: true }
  | { success: false; error: string }

export async function registerMovement(input: {
  boxId: string
  newPositionId: string
  newLocationPath: string
  reason: string
}): Promise<MovementActionResult> {
  if (!(await canManageBoxes())) {
    return {
      success: false,
      error: "Sem permissão para registrar movimentações.",
    }
  }

  const reason = input.reason.trim()
  if (!reason) {
    return { success: false, error: "Informe o motivo da movimentação." }
  }
  if (!input.boxId) {
    return { success: false, error: "Selecione a caixa." }
  }
  if (!input.newPositionId) {
    return { success: false, error: "Selecione a nova posição." }
  }

  const supabase = await createClient()

  const { error } = await supabase.rpc("register_movement", {
    p_box_id: input.boxId,
    p_new_position_id: input.newPositionId,
    p_new_location_path: input.newLocationPath,
    p_reason: reason,
  })

  if (error) {
    if (error.message.includes("Could not find the function")) {
      return {
        success: false,
        error:
          "Função register_movement não encontrada. Execute a migration 20260531300000_register_movement.sql no Supabase.",
      }
    }
    return { success: false, error: error.message }
  }

  revalidatePath("/movimentacoes")
  revalidatePath("/caixas")
  revalidatePath("/estrutura")
  return { success: true }
}
