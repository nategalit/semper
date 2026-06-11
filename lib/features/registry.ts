// Feature registry — the canonical map from FeatureDef.id to FeatureDef.
//
// Chunk 1 lands the empty map. Subsequent chunks add migration consumers
// (deriveStats walks effects, level-up panel walks choices, etc.) and then
// chunk 9 populates the registry one class per commit.
//
// Lookup helpers live here so consumers don't reach into the map directly.

import type { FeatureDef } from "./types";
import { FEAT_ALERT, FEAT_INSPIRING_LEADER, FEAT_LUCKY, FEAT_TOUGH } from "./data/feats";
import { SUBCLASS_CHAMPION_REMARKABLE_ATHLETE } from "./data/subclasses";
import { BARBARIAN_RAGE } from "./data/classes/barbarian";
import { BARDIC_INSPIRATION } from "./data/classes/bard";
import { CLERIC_CHANNEL_DIVINITY } from "./data/classes/cleric";
import { WILD_SHAPE } from "./data/classes/druid";
import { ACTION_SURGE, SECOND_WIND } from "./data/classes/fighter";
import { KI_POINTS } from "./data/classes/monk";
import { LAY_ON_HANDS, PALADIN_CHANNEL_DIVINITY } from "./data/classes/paladin";
import { SORCERY_POINTS } from "./data/classes/sorcerer";
import { ARCANE_RECOVERY } from "./data/classes/wizard";

export const FEATURE_REGISTRY: Record<string, FeatureDef> = {
  [FEAT_TOUGH.id]:                            FEAT_TOUGH,
  [FEAT_ALERT.id]:                            FEAT_ALERT,
  [FEAT_LUCKY.id]:                            FEAT_LUCKY,
  [FEAT_INSPIRING_LEADER.id]:                 FEAT_INSPIRING_LEADER,
  [SUBCLASS_CHAMPION_REMARKABLE_ATHLETE.id]:  SUBCLASS_CHAMPION_REMARKABLE_ATHLETE,
  [BARBARIAN_RAGE.id]:                        BARBARIAN_RAGE,
  [BARDIC_INSPIRATION.id]:                    BARDIC_INSPIRATION,
  [CLERIC_CHANNEL_DIVINITY.id]:               CLERIC_CHANNEL_DIVINITY,
  [WILD_SHAPE.id]:                            WILD_SHAPE,
  [ACTION_SURGE.id]:                          ACTION_SURGE,
  [SECOND_WIND.id]:                           SECOND_WIND,
  [KI_POINTS.id]:                             KI_POINTS,
  [LAY_ON_HANDS.id]:                          LAY_ON_HANDS,
  [PALADIN_CHANNEL_DIVINITY.id]:              PALADIN_CHANNEL_DIVINITY,
  [SORCERY_POINTS.id]:                        SORCERY_POINTS,
  [ARCANE_RECOVERY.id]:                       ARCANE_RECOVERY,
};

/** Resolve a feature by canonical ID. Returns undefined if absent. */
export function getFeatureDef(id: string): FeatureDef | undefined {
  return FEATURE_REGISTRY[id];
}

/** All registered features. Order is insertion order. */
export function allFeatureDefs(): FeatureDef[] {
  return Object.values(FEATURE_REGISTRY);
}
