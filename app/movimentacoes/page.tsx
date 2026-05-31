import { AppSidebar } from "@/components/app-sidebar"
import { AppHeader } from "@/components/app-header"
import { MovimentacoesContent } from "@/components/movimentacoes-content"
import { canManageBoxes } from "@/lib/auth/profile"
import { fetchBoxesForMovement } from "@/lib/db/boxes-select"
import { fetchLocationTree } from "@/lib/db/locations"
import { fetchMovements } from "@/lib/db/movements"
import { flattenFreePositions } from "@/lib/estrutura/position-options"

export default async function MovimentacoesPage() {
  let loadError: string | null = null
  let movements: Awaited<ReturnType<typeof fetchMovements>> = []
  let boxOptions: Awaited<ReturnType<typeof fetchBoxesForMovement>> = []
  let positionOptions: ReturnType<typeof flattenFreePositions> = []

  try {
    const [movementsData, boxesData, locations] = await Promise.all([
      fetchMovements(),
      fetchBoxesForMovement(),
      fetchLocationTree(),
    ])
    movements = movementsData
    boxOptions = boxesData
    positionOptions = flattenFreePositions(locations)
  } catch (e) {
    loadError = e instanceof Error ? e.message : "Erro ao carregar movimentações."
  }

  const canWrite = await canManageBoxes()

  return (
    <div className="flex h-screen bg-background">
      <AppSidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <AppHeader />
        <main className="flex-1 overflow-auto p-6">
          <MovimentacoesContent
            initialMovements={movements}
            boxOptions={boxOptions}
            positionOptions={positionOptions}
            canWrite={canWrite}
            loadError={loadError}
          />
        </main>
      </div>
    </div>
  )
}
