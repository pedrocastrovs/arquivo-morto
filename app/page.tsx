import { AppSidebar } from "@/components/app-sidebar"
import { AppHeader } from "@/components/app-header"
import { DashboardContent } from "@/components/dashboard-content"

export default function Page() {
  return (
    <div className="flex h-screen bg-background">
      <AppSidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <AppHeader />
        <main className="flex-1 overflow-auto p-6">
          <DashboardContent />
        </main>
      </div>
    </div>
  )
}
