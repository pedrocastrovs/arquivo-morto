import { AppSidebar } from "@/components/app-sidebar"
import { AppHeader } from "@/components/app-header"
import { DescarteContent } from "@/components/descarte-content"

export default function DescartePage() {
  return (
    <div className="flex h-screen bg-background">
      <AppSidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <AppHeader />
        <main className="flex-1 overflow-auto p-6">
          <DescarteContent />
        </main>
      </div>
    </div>
  )
}
