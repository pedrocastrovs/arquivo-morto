import { AppSidebar } from "@/components/app-sidebar"
import { AppHeader } from "@/components/app-header"
import { EmprestimosContent } from "@/components/emprestimos-content"
import { canManageBoxes } from "@/lib/auth/profile"
import { fetchBoxesForLoan } from "@/lib/db/boxes-select"
import { fetchSectors } from "@/lib/db/boxes"
import { fetchLoans } from "@/lib/db/loans"

export default async function EmprestimosPage() {
  let loadError: string | null = null
  let loans: Awaited<ReturnType<typeof fetchLoans>> = []
  let boxOptions: Awaited<ReturnType<typeof fetchBoxesForLoan>> = []
  let sectors: string[] = []

  try {
    const [loansData, boxesData, sectorsData] = await Promise.all([
      fetchLoans(),
      fetchBoxesForLoan(),
      fetchSectors(),
    ])
    loans = loansData
    boxOptions = boxesData
    sectors = sectorsData
  } catch (e) {
    loadError = e instanceof Error ? e.message : "Erro ao carregar empréstimos."
  }

  const canWrite = await canManageBoxes()

  return (
    <div className="flex h-screen bg-background">
      <AppSidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <AppHeader />
        <main className="flex-1 overflow-auto p-6">
          <EmprestimosContent
            initialLoans={loans}
            boxOptions={boxOptions}
            sectors={sectors}
            canWrite={canWrite}
            loadError={loadError}
          />
        </main>
      </div>
    </div>
  )
}
