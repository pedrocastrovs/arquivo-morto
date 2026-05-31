import type { Location, StructureNodeType } from "@/lib/types"

export interface ParentOption {
  id: string
  label: string
}

export function getParentOptions(
  locations: Location[],
  type: StructureNodeType
): ParentOption[] {
  switch (type) {
    case "location":
      return []
    case "street":
      return locations.map((l) => ({ id: l.id, label: l.name }))
    case "building":
      return locations.flatMap((l) =>
        l.streets.map((s) => ({
          id: s.id,
          label: `${l.name} › ${s.name}`,
        }))
      )
    case "floor":
      return locations.flatMap((l) =>
        l.streets.flatMap((s) =>
          s.buildings.map((b) => ({
            id: b.id,
            label: `${l.name} › ${s.name} › ${b.name}`,
          }))
        )
      )
    case "tower":
      return locations.flatMap((l) =>
        l.streets.flatMap((s) =>
          s.buildings.flatMap((b) =>
            b.floors.map((f) => ({
              id: f.id,
              label: `${l.name} › ${s.name} › ${b.name} › ${f.name}`,
            }))
          )
        )
      )
    case "position":
      return locations.flatMap((l) =>
        l.streets.flatMap((s) =>
          s.buildings.flatMap((b) =>
            b.floors.flatMap((f) =>
              f.towers.map((t) => ({
                id: t.id,
                label: `${l.name} › ${s.name} › ${b.name} › ${f.name} › ${t.name}`,
              }))
            )
          )
        )
      )
  }
}
