import type { Location } from "@/lib/types"

export interface PositionOption {
  positionId: string
  path: string
}

export function flattenFreePositions(locations: Location[]): PositionOption[] {
  const options: PositionOption[] = []

  for (const loc of locations) {
    for (const street of loc.streets) {
      for (const building of street.buildings) {
        for (const floor of building.floors) {
          for (const tower of floor.towers) {
            for (const position of tower.positions) {
              if (!position.isOccupied) {
                options.push({
                  positionId: position.id,
                  path: [
                    loc.name,
                    street.name,
                    building.name,
                    floor.name,
                    tower.name,
                    position.name,
                  ].join(" › "),
                })
              }
            }
          }
        }
      }
    }
  }

  return options
}
