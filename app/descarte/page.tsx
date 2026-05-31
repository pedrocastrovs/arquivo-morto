import { AppSidebar } from "@/components/app-sidebar"
import { AppHeader } from "@/components/app-header"
import { DescarteContent } from "@/components/descarte-content"
import { isAdministrator } from "@/lib/auth/profile"
import { fetchDiscardPageData } from "@/lib/db/discard"

export default async function DescartePage() {
  let loadError: string | null = null
  let data: Awaited<ReturnType<typeof fetchDiscardPageData>> = {
    readyForDiscard: [],
    discarded: [],
    dueWithin30Days: 0,
  }

  try {
    data = await fetchDiscardPageData()
  } catch (e) {
    loadError = e instanceof Error ? e.message : "Erro ao carregar descarte."
  }

  const canApprove = await isAdministrator()

  return (
    <div className="flex h-screen bg-background">
      <AppSidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <AppHeader />
        <main className="flex-1 overflow-auto p-6">
          <DescarteContent
            readyForDiscard={data.readyForDiscard}
            discarded={data.discarded}
            dueWithin30Days={data.dueWithin30Days}
            canApprove={canApprove}
            loadError={loadError}
          />
        </main>
      </div>
    </div>
  )
}
