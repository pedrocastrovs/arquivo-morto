"use server"

import { revalidatePath } from "next/cache"
import { canManageStructure, isAdministrator } from "@/lib/auth/profile"
import { createClient } from "@/lib/supabase/server"
import type { UserRole } from "@/lib/types"

export type ConfigActionResult =
  | { success: true }
  | { success: false; error: string }

function mapDbError(message: string): string {
  if (message.includes("row-level security")) {
    return "Permissão negada pelo banco (RLS)."
  }
  if (message.includes("duplicate key") || message.includes("unique")) {
    return "Já existe um registro com esse nome."
  }
  return message
}

export async function createSector(name: string): Promise<ConfigActionResult> {
  if (!(await canManageStructure())) {
    return { success: false, error: "Sem permissão para cadastrar setores." }
  }
  const trimmed = name.trim()
  if (!trimmed) return { success: false, error: "Informe o nome do setor." }

  const supabase = await createClient()
  const { error } = await supabase.from("sectors").insert({ name: trimmed })
  if (error) return { success: false, error: mapDbError(error.message) }

  revalidatePath("/configuracoes")
  revalidatePath("/caixas")
  return { success: true }
}

export async function updateSector(
  id: string,
  name: string
): Promise<ConfigActionResult> {
  if (!(await canManageStructure())) {
    return { success: false, error: "Sem permissão." }
  }
  const trimmed = name.trim()
  if (!trimmed) return { success: false, error: "Informe o nome do setor." }

  const supabase = await createClient()
  const { error } = await supabase
    .from("sectors")
    .update({ name: trimmed })
    .eq("id", id)
  if (error) return { success: false, error: mapDbError(error.message) }

  revalidatePath("/configuracoes")
  revalidatePath("/caixas")
  return { success: true }
}

export async function deleteSector(id: string): Promise<ConfigActionResult> {
  if (!(await canManageStructure())) {
    return { success: false, error: "Sem permissão." }
  }
  const supabase = await createClient()
  const { error } = await supabase.from("sectors").delete().eq("id", id)
  if (error) return { success: false, error: mapDbError(error.message) }

  revalidatePath("/configuracoes")
  revalidatePath("/caixas")
  return { success: true }
}

export async function createUnit(name: string): Promise<ConfigActionResult> {
  if (!(await canManageStructure())) {
    return { success: false, error: "Sem permissão para cadastrar unidades." }
  }
  const trimmed = name.trim()
  if (!trimmed) return { success: false, error: "Informe o nome da unidade." }

  const supabase = await createClient()
  const { error } = await supabase.from("units").insert({ name: trimmed })
  if (error) return { success: false, error: mapDbError(error.message) }

  revalidatePath("/configuracoes")
  revalidatePath("/caixas")
  return { success: true }
}

export async function updateUnit(
  id: string,
  name: string
): Promise<ConfigActionResult> {
  if (!(await canManageStructure())) {
    return { success: false, error: "Sem permissão." }
  }
  const trimmed = name.trim()
  if (!trimmed) return { success: false, error: "Informe o nome da unidade." }

  const supabase = await createClient()
  const { error } = await supabase
    .from("units")
    .update({ name: trimmed })
    .eq("id", id)
  if (error) return { success: false, error: mapDbError(error.message) }

  revalidatePath("/configuracoes")
  revalidatePath("/caixas")
  return { success: true }
}

export async function deleteUnit(id: string): Promise<ConfigActionResult> {
  if (!(await canManageStructure())) {
    return { success: false, error: "Sem permissão." }
  }
  const supabase = await createClient()
  const { error } = await supabase.from("units").delete().eq("id", id)
  if (error) return { success: false, error: mapDbError(error.message) }

  revalidatePath("/configuracoes")
  revalidatePath("/caixas")
  return { success: true }
}

export async function updateProfileRole(input: {
  profileId: string
  role: UserRole
  sector?: string
}): Promise<ConfigActionResult> {
  if (!(await isAdministrator())) {
    return {
      success: false,
      error: "Somente administradores podem alterar perfis de usuários.",
    }
  }

  const supabase = await createClient()
  const { error } = await supabase
    .from("profiles")
    .update({
      role: input.role,
      sector: input.sector?.trim() || null,
    })
    .eq("id", input.profileId)

  if (error) return { success: false, error: mapDbError(error.message) }

  revalidatePath("/configuracoes")
  return { success: true }
}
