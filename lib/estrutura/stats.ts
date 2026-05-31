import type { Location } from "@/lib/types"

export function countStructureStats(locations: Location[]) {
  let totalPositions = 0
  let occupiedPositions = 0

  for (const loc of locations) {
    for (const street of loc.streets) {
      for (const building of street.buildings) {
        for (const floor of building.floors) {
          for (const tower of floor.towers) {
            totalPositions += tower.positions.length
            occupiedPositions += tower.positions.filter((p) => p.isOccupied).length
          }
        }
      }
    }
  }

  return { totalPositions, occupiedPositions }
}
