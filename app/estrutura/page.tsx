import { AppSidebar } from "@/components/app-sidebar"
import { AppHeader } from "@/components/app-header"
import { EstruturaContent } from "@/components/estrutura-content"
import { canManageStructure, getCurrentProfile } from "@/lib/auth/profile"
import { fetchLocationTree } from "@/lib/db/locations"

export default async function EstruturaPage() {
  let locations: Awaited<ReturnType<typeof fetchLocationTree>> = []
  let loadError: string | null = null

  try {
    locations = await fetchLocationTree()
  } catch (e) {
    loadError = e instanceof Error ? e.message : "Erro ao carregar estrutura."
  }

  const canManage = await canManageStructure()
  const profile = await getCurrentProfile()

  return (
    <div className="flex h-screen bg-background">
      <AppSidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <AppHeader />
        <main className="flex-1 overflow-auto p-6">
          <EstruturaContent
            initialLocations={locations}
            canManage={canManage}
            userRole={profile?.role ?? "consultante"}
            loadError={loadError}
          />
        </main>
      </div>
    </div>
  )
}
