import { createClient } from "@/lib/supabase/server"
import type { Building, Floor, Location, Position, Street, Tower } from "@/lib/types"

type PositionRow = {
  id: string
  name: string
  tower_id: string
  is_occupied: boolean
  box_id: string | null
  boxes: { code: string } | { code: string }[] | null
}

export async function fetchLocationTree(): Promise<Location[]> {
  const supabase = await createClient()

  const [
    { data: locations, error: locError },
    { data: streets, error: strError },
    { data: buildings, error: bldError },
    { data: floors, error: flrError },
    { data: towers, error: twrError },
    { data: positions, error: posError },
  ] = await Promise.all([
    supabase.from("locations").select("id, name").order("name"),
    supabase.from("streets").select("id, name, location_id").order("name"),
    supabase.from("buildings").select("id, name, street_id").order("name"),
    supabase.from("floors").select("id, name, building_id").order("name"),
    supabase.from("towers").select("id, name, floor_id").order("name"),
    supabase
      .from("positions")
      .select(
        "id, name, tower_id, is_occupied, box_id, boxes!positions_box_id_fkey(code)"
      )
      .order("name"),
  ])

  const error =
    locError ?? strError ?? bldError ?? flrError ?? twrError ?? posError
  if (error) {
    throw new Error(error.message)
  }

  const positionsByTower = new Map<string, Position[]>()
  for (const row of (positions ?? []) as PositionRow[]) {
    const boxRelation = row.boxes
    const boxCode = Array.isArray(boxRelation)
      ? boxRelation[0]?.code
      : boxRelation?.code

    const list = positionsByTower.get(row.tower_id) ?? []
    list.push({
      id: row.id,
      name: row.name,
      towerId: row.tower_id,
      isOccupied: row.is_occupied,
      boxId: row.box_id ?? undefined,
      boxCode: row.is_occupied ? boxCode : undefined,
    })
    positionsByTower.set(row.tower_id, list)
  }

  const towersByFloor = new Map<string, Tower[]>()
  for (const row of towers ?? []) {
    const list = towersByFloor.get(row.floor_id) ?? []
    list.push({
      id: row.id,
      name: row.name,
      floorId: row.floor_id,
      positions: positionsByTower.get(row.id) ?? [],
    })
    towersByFloor.set(row.floor_id, list)
  }

  const floorsByBuilding = new Map<string, Floor[]>()
  for (const row of floors ?? []) {
    const list = floorsByBuilding.get(row.building_id) ?? []
    list.push({
      id: row.id,
      name: row.name,
      buildingId: row.building_id,
      towers: towersByFloor.get(row.id) ?? [],
    })
    floorsByBuilding.set(row.building_id, list)
  }

  const buildingsByStreet = new Map<string, Building[]>()
  for (const row of buildings ?? []) {
    const list = buildingsByStreet.get(row.street_id) ?? []
    list.push({
      id: row.id,
      name: row.name,
      streetId: row.street_id,
      floors: floorsByBuilding.get(row.id) ?? [],
    })
    buildingsByStreet.set(row.street_id, list)
  }

  const streetsByLocation = new Map<string, Street[]>()
  for (const row of streets ?? []) {
    const list = streetsByLocation.get(row.location_id) ?? []
    list.push({
      id: row.id,
      name: row.name,
      locationId: row.location_id,
      buildings: buildingsByStreet.get(row.id) ?? [],
    })
    streetsByLocation.set(row.location_id, list)
  }

  return (locations ?? []).map((loc) => ({
    id: loc.id,
    name: loc.name,
    streets: streetsByLocation.get(loc.id) ?? [],
  }))
}

