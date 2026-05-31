import type { Box } from "@/lib/types"

export interface DiscardStats {
  readyForDiscard: number
  discarded: number
  spaceFreed: number
  dueWithin30Days: number
}

export function computeDiscardStats(
  ready: Box[],
  discarded: Box[],
  dueWithin30Days: number
): DiscardStats {
  return {
    readyForDiscard: ready.length,
    discarded: discarded.length,
    spaceFreed: discarded.length,
    dueWithin30Days,
  }
}
