// Feature registry — the canonical map from FeatureDef.id to FeatureDef.
//
// Chunk 1 lands the empty map. Subsequent chunks add migration consumers
// (deriveStats walks effects, level-up panel walks choices, etc.) and then
// chunk 9 populates the registry one class per commit.
//
// Lookup helpers live here so consumers don't reach into the map directly.

import type { FeatureDef } from "./types";
import { FEAT_ALERT, FEAT_INSPIRING_LEADER, FEAT_LUCKY, FEAT_TOUGH } from "./data/feats";
import { CHAMPION_EXTRA_FIGHTING_STYLE, SUBCLASS_CHAMPION_REMARKABLE_ATHLETE } from "./data/subclasses";
import {
  BARBARIAN_RAGE,
  BARBARIAN_UNARMORED_DEFENSE,
  BARBARIAN_WEAPON_MASTERY,
  BARBARIAN_DANGER_SENSE,
  BARBARIAN_RECKLESS_ATTACK,
  BARBARIAN_PRIMAL_KNOWLEDGE,
  BARBARIAN_EXTRA_ATTACK,
  BARBARIAN_FAST_MOVEMENT,
  BARBARIAN_FERAL_INSTINCT,
  BARBARIAN_INSTINCTIVE_POUNCE,
  BARBARIAN_BRUTAL_STRIKE,
  BARBARIAN_RELENTLESS_RAGE,
  BARBARIAN_IMPROVED_BRUTAL_STRIKE,
  BARBARIAN_PERSISTENT_RAGE,
  BARBARIAN_IMPROVED_BRUTAL_STRIKE_L17,
  BARBARIAN_INDOMITABLE_MIGHT,
  BARBARIAN_PRIMAL_CHAMPION,
} from "./data/classes/barbarian";
import { BARDIC_INSPIRATION } from "./data/classes/bard";
import { CLERIC_CHANNEL_DIVINITY } from "./data/classes/cleric";
import { WILD_SHAPE } from "./data/classes/druid";
import { ACTION_SURGE, FIGHTER_FIGHTING_STYLE, SECOND_WIND } from "./data/classes/fighter";
import { KI_POINTS } from "./data/classes/monk";
import { LAY_ON_HANDS, PALADIN_CHANNEL_DIVINITY, PALADIN_FIGHTING_STYLE, PALADIN_AURA_OF_PROTECTION, PALADIN_AURA_EXPANSION } from "./data/classes/paladin";
import { RANGER_FIGHTING_STYLE } from "./data/classes/ranger";
import { SORCERY_POINTS } from "./data/classes/sorcerer";
import { ARCANE_RECOVERY } from "./data/classes/wizard";
import { ALL_ASI_DEFS } from "./data/asi-choices";

const BASE_DEFS: FeatureDef[] = [
  FEAT_TOUGH,
  FEAT_ALERT,
  FEAT_LUCKY,
  FEAT_INSPIRING_LEADER,
  CHAMPION_EXTRA_FIGHTING_STYLE,
  SUBCLASS_CHAMPION_REMARKABLE_ATHLETE,
  BARBARIAN_RAGE,
  BARBARIAN_UNARMORED_DEFENSE,
  BARBARIAN_WEAPON_MASTERY,
  BARBARIAN_DANGER_SENSE,
  BARBARIAN_RECKLESS_ATTACK,
  BARBARIAN_PRIMAL_KNOWLEDGE,
  BARBARIAN_EXTRA_ATTACK,
  BARBARIAN_FAST_MOVEMENT,
  BARBARIAN_FERAL_INSTINCT,
  BARBARIAN_INSTINCTIVE_POUNCE,
  BARBARIAN_BRUTAL_STRIKE,
  BARBARIAN_RELENTLESS_RAGE,
  BARBARIAN_IMPROVED_BRUTAL_STRIKE,
  BARBARIAN_PERSISTENT_RAGE,
  BARBARIAN_IMPROVED_BRUTAL_STRIKE_L17,
  BARBARIAN_INDOMITABLE_MIGHT,
  BARBARIAN_PRIMAL_CHAMPION,
  BARDIC_INSPIRATION,
  CLERIC_CHANNEL_DIVINITY,
  WILD_SHAPE,
  FIGHTER_FIGHTING_STYLE,
  ACTION_SURGE,
  SECOND_WIND,
  KI_POINTS,
  LAY_ON_HANDS,
  PALADIN_CHANNEL_DIVINITY,
  PALADIN_FIGHTING_STYLE,
  PALADIN_AURA_OF_PROTECTION,
  PALADIN_AURA_EXPANSION,
  RANGER_FIGHTING_STYLE,
  SORCERY_POINTS,
  ARCANE_RECOVERY,
  ...ALL_ASI_DEFS,
];

export const FEATURE_REGISTRY: Record<string, FeatureDef> = Object.fromEntries(
  BASE_DEFS.map((d) => [d.id, d])
);

/** Resolve a feature by canonical ID. Returns undefined if absent. */
export function getFeatureDef(id: string): FeatureDef | undefined {
  return FEATURE_REGISTRY[id];
}

/** All registered features. Order is insertion order. */
export function allFeatureDefs(): FeatureDef[] {
  return Object.values(FEATURE_REGISTRY);
}
