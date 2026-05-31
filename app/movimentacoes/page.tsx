import { AppSidebar } from "@/components/app-sidebar"
import { AppHeader } from "@/components/app-header"
import { MovimentacoesContent } from "@/components/movimentacoes-content"

export default function MovimentacoesPage() {
  return (
    <div className="flex h-screen bg-background">
      <AppSidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <AppHeader />
        <main className="flex-1 overflow-auto p-6">
          <MovimentacoesContent />
        </main>
      </div>
    </div>
  )
}
