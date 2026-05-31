import { AppSidebar } from "@/components/app-sidebar"
import { AppHeader } from "@/components/app-header"
import { ConfiguracoesContent } from "@/components/configuracoes-content"

export default function ConfiguracoesPage() {
  return (
    <div className="flex h-screen bg-background">
      <AppSidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <AppHeader />
        <main className="flex-1 overflow-auto p-6">
          <ConfiguracoesContent />
        </main>
      </div>
    </div>
  )
}
