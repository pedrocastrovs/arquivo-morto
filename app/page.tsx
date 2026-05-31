import { AppSidebar } from "@/components/app-sidebar"
import { AppHeader } from "@/components/app-header"
import { DashboardContent } from "@/components/dashboard-content"
import { fetchDashboardData } from "@/lib/db/dashboard"

export default async function Page() {
  let loadError: string | null = null
  let data: Awaited<ReturnType<typeof fetchDashboardData>> | null = null

  try {
    data = await fetchDashboardData()
  } catch (e) {
    loadError = e instanceof Error ? e.message : "Erro ao carregar dashboard."
  }

  return (
    <div className="flex h-screen bg-background">
      <AppSidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <AppHeader />
        <main className="flex-1 overflow-auto p-6">
          {loadError || !data ? (
            <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-destructive">
              {loadError ?? "Erro ao carregar dashboard."}
            </div>
          ) : (
            <DashboardContent {...data} />
          )}
        </main>
      </div>
    </div>
  )
}
