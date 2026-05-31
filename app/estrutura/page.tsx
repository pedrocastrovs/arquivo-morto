import { AppSidebar } from "@/components/app-sidebar"
import { AppHeader } from "@/components/app-header"
import { EstruturaContent } from "@/components/estrutura-content"

export default function EstruturaPage() {
  return (
    <div className="flex h-screen bg-background">
      <AppSidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <AppHeader />
        <main className="flex-1 overflow-auto p-6">
          <EstruturaContent />
        </main>
      </div>
    </div>
  )
}
