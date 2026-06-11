// Feature registry — the canonical map from FeatureDef.id to FeatureDef.
//
// Chunk 1 lands the empty map. Subsequent chunks add migration consumers
// (deriveStats walks effects, level-up panel walks choices, etc.) and then
// chunk 9 populates the registry one class per commit.
//
// Lookup helpers live here so consumers don't reach into the map directly.

import type { FeatureDef } from "./types";

export const FEATURE_REGISTRY: Record<string, FeatureDef> = {};

/** Resolve a feature by canonical ID. Returns undefined if absent. */
export function getFeatureDef(id: string): FeatureDef | undefined {
  return FEATURE_REGISTRY[id];
}

/** All registered features. Order is insertion order. */
export function allFeatureDefs(): FeatureDef[] {
  return Object.values(FEATURE_REGISTRY);
}
