"use server"

import { revalidatePath } from "next/cache"
import { canManageStructure } from "@/lib/auth/profile"
import { createClient } from "@/lib/supabase/server"
import type { StructureNodeType } from "@/lib/types"

export type StructureActionResult =
  | { success: true }
  | { success: false; error: string }

function mapDbError(message: string): string {
  if (message.includes("row-level security")) {
    return (
      "Permissão negada pelo banco (RLS). Execute supabase/fix-rls-estrutura.sql no SQL Editor e confira se seu perfil é operador ou administrador."
    )
  }
  return message
}

async function requireStructureAccess(): Promise<StructureActionResult | null> {
  if (!(await canManageStructure())) {
    return {
      success: false,
      error:
        "Sem permissão. Apenas operadores e administradores podem alterar a estrutura física.",
    }
  }
  return null
}

export async function createStructureNode(
  type: StructureNodeType,
  name: string,
  parentId?: string
): Promise<StructureActionResult> {
  const denied = await requireStructureAccess()
  if (denied) return denied

  const trimmed = name.trim()
  if (!trimmed) {
    return { success: false, error: "Informe um nome." }
  }

  const supabase = await createClient()
  let error: { message: string } | null = null

  switch (type) {
    case "location": {
      const res = await supabase.from("locations").insert({ name: trimmed })
      error = res.error
      break
    }
    case "street": {
      if (!parentId) {
        return { success: false, error: "Selecione o local pai." }
      }
      const res = await supabase
        .from("streets")
        .insert({ name: trimmed, location_id: parentId })
      error = res.error
      break
    }
    case "building": {
      if (!parentId) {
        return { success: false, error: "Selecione a rua pai." }
      }
      const res = await supabase
        .from("buildings")
        .insert({ name: trimmed, street_id: parentId })
      error = res.error
      break
    }
    case "floor": {
      if (!parentId) {
        return { success: false, error: "Selecione o prédio pai." }
      }
      const res = await supabase
        .from("floors")
        .insert({ name: trimmed, building_id: parentId })
      error = res.error
      break
    }
    case "tower": {
      if (!parentId) {
        return { success: false, error: "Selecione o andar pai." }
      }
      const res = await supabase
        .from("towers")
        .insert({ name: trimmed, floor_id: parentId })
      error = res.error
      break
    }
    case "position": {
      if (!parentId) {
        return { success: false, error: "Selecione a torre pai." }
      }
      const res = await supabase.from("positions").insert({
        name: trimmed,
        tower_id: parentId,
        is_occupied: false,
      })
      error = res.error
      break
    }
  }

  if (error) {
    return { success: false, error: mapDbError(error.message) }
  }

  revalidatePath("/estrutura")
  return { success: true }
}

export async function deleteStructureNode(
  type: StructureNodeType,
  id: string
): Promise<StructureActionResult> {
  const denied = await requireStructureAccess()
  if (denied) return denied

  const supabase = await createClient()

  if (type === "position") {
    const { data: position, error: fetchError } = await supabase
      .from("positions")
      .select("is_occupied")
      .eq("id", id)
      .single()

    if (fetchError) {
      return { success: false, error: fetchError.message }
    }
    if (position.is_occupied) {
      return {
        success: false,
        error: "Não é possível excluir uma posição ocupada.",
      }
    }

    const { error } = await supabase.from("positions").delete().eq("id", id)
    if (error) return { success: false, error: mapDbError(error.message) }
    revalidatePath("/estrutura")
    return { success: true }
  }

  const tableMap: Record<
    Exclude<StructureNodeType, "position">,
    string
  > = {
    location: "locations",
    street: "streets",
    building: "buildings",
    floor: "floors",
    tower: "towers",
  }

  const table = tableMap[type as Exclude<StructureNodeType, "position">]
  const { error } = await supabase.from(table).delete().eq("id", id)

  if (error) {
    if (error.code === "23503") {
      return {
        success: false,
        error:
          "Não é possível excluir: existem itens vinculados ou posições ocupadas.",
      }
    }
    return { success: false, error: mapDbError(error.message) }
  }

  revalidatePath("/estrutura")
  return { success: true }
}
