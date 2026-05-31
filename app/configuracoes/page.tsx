import { AppSidebar } from "@/components/app-sidebar"
import { AppHeader } from "@/components/app-header"
import { ConfiguracoesContent } from "@/components/configuracoes-content"
import {
  canManageStructure,
  isAdministrator,
} from "@/lib/auth/profile"
import {
  fetchProfileRecords,
  fetchSectorRecords,
  fetchUnitRecords,
} from "@/lib/db/config"

export default async function ConfiguracoesPage() {
  let loadError: string | null = null
  let sectors: Awaited<ReturnType<typeof fetchSectorRecords>> = []
  let units: Awaited<ReturnType<typeof fetchUnitRecords>> = []
  let profiles: Awaited<ReturnType<typeof fetchProfileRecords>> = []

  try {
    const isAdmin = await isAdministrator()
    ;[sectors, units, profiles] = await Promise.all([
      fetchSectorRecords(),
      fetchUnitRecords(),
      isAdmin ? fetchProfileRecords() : Promise.resolve([]),
    ])
  } catch (e) {
    loadError =
      e instanceof Error ? e.message : "Erro ao carregar configurações."
  }

  const canManageCadastros = await canManageStructure()
  const canManageUsers = await isAdministrator()

  return (
    <div className="flex h-screen bg-background">
      <AppSidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <AppHeader />
        <main className="flex-1 overflow-auto p-6">
          <ConfiguracoesContent
            sectors={sectors}
            units={units}
            profiles={profiles}
            canManageCadastros={canManageCadastros}
            canManageUsers={canManageUsers}
            loadError={loadError}
          />
        </main>
      </div>
    </div>
  )
}
