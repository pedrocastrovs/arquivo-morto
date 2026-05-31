import { AppSidebar } from "@/components/app-sidebar"
import { AppHeader } from "@/components/app-header"
import { CaixasContent } from "@/components/caixas-content"
import { canManageBoxes } from "@/lib/auth/profile"
import { fetchBoxes, fetchSectors, fetchUnits } from "@/lib/db/boxes"
import { fetchLocationTree } from "@/lib/db/locations"
import { flattenFreePositions } from "@/lib/estrutura/position-options"

export default async function CaixasPage() {
  let loadError: string | null = null
  let boxes: Awaited<ReturnType<typeof fetchBoxes>> = []
  let positionOptions: ReturnType<typeof flattenFreePositions> = []
  let sectors: string[] = []
  let units: string[] = []

  try {
    const [boxesData, locations, sectorsData, unitsData] = await Promise.all([
      fetchBoxes(),
      fetchLocationTree(),
      fetchSectors(),
      fetchUnits(),
    ])
    boxes = boxesData
    positionOptions = flattenFreePositions(locations)
    sectors = sectorsData
    units = unitsData
  } catch (e) {
    loadError = e instanceof Error ? e.message : "Erro ao carregar caixas."
  }

  const canWrite = await canManageBoxes()

  return (
    <div className="flex h-screen bg-background">
      <AppSidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <AppHeader />
        <main className="flex-1 overflow-auto p-6">
          <CaixasContent
            initialBoxes={boxes}
            positionOptions={positionOptions}
            sectors={sectors}
            units={units}
            canWrite={canWrite}
            loadError={loadError}
          />
        </main>
      </div>
    </div>
  )
}
