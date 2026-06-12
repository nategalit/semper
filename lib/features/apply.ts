// Active feature resolution and effect dispatch.
//
// collectActiveFeatures: pure function that inspects a character's
// class/subclass/race/feats and returns all matching FeatureDefs from
// FEATURE_REGISTRY.
//
// applyFeatureEffect: dispatches on effect.kind. Only the three chunk-2b
// migration kinds have real handlers; all others are no-ops until later chunks.

import type { Character } from "@/lib/types/character";
import type { FeatureDef, FeatureEffect } from "./types";
import type { DeriveContext } from "@/lib/character/feature-effects";
import { allFeatureDefs } from "./registry";
import {
  applyHpPerLevel,
  applyInitiativeAdd,
  applyHalfProfOnChecks,
} from "@/lib/character/feature-effects";

/**
 * Returns the subset of FEATURE_REGISTRY entries that are active for this
 * character, based on origin matching (feat picked, subclass unlocked, etc.).
 */
export function collectActiveFeatures(character: Character): FeatureDef[] {
  const pickedFeatIds = new Set(
    Object.values(character.data.levelChoices ?? {})
      .map((c) => c.featId)
      .filter((id): id is string => !!id)
  );

  const result: FeatureDef[] = [];
  for (const def of allFeatureDefs()) {
    const o = def.origin;
    switch (o.kind) {
      case "feat": {
        const ids = Array.isArray(o.featId) ? o.featId : [o.featId];
        if (ids.some((id) => pickedFeatIds.has(id))) result.push(def);
        break;
      }
      case "subclass":
        if (
          character.data.subclassId === o.subclassId &&
          character.level >= o.level
        ) {
          result.push(def);
        }
        break;
      case "class":
        if (character.classId === o.classId && character.level >= o.level) {
          result.push(def);
        }
        break;
      case "race":
        if (character.raceId === o.raceId) result.push(def);
        break;
      case "subrace":
        if (character.data.subraceId === o.subraceId) result.push(def);
        break;
      case "background":
        if (character.data.backgroundId === o.backgroundId) result.push(def);
        break;
    }
  }
  return result;
}

/**
 * Returns FeatureDefs that have choices and are granted at exactly `level`
 * for the given class/subclass. Used by the level-up panel to know which
 * ChoicePickers to render for each new level.
 */
export function choiceFeatureDefs(
  classId: string,
  subclassId: string | undefined,
  level: number
): FeatureDef[] {
  return allFeatureDefs().filter((def) => {
    if (!def.choices?.length) return false;
    const o = def.origin;
    if (o.kind === "class") return o.classId === classId && o.level === level;
    if (o.kind === "subclass")
      return o.subclassId === subclassId && o.level === level;
    return false;
  });
}

/**
 * Dispatches one FeatureEffect onto ctx. Real handlers exist for the three
 * chunk-2b migration kinds; all other kinds are silently skipped until their
 * respective chunks land.
 */
export function applyFeatureEffect(effect: FeatureEffect, ctx: DeriveContext): void {
  switch (effect.kind) {
    case "hp-per-level":
      applyHpPerLevel(effect.value, ctx);
      break;
    case "initiative-add":
      applyInitiativeAdd(effect.value, ctx);
      break;
    case "half-prof-on-checks":
      applyHalfProfOnChecks(effect.abilities, ctx);
      break;
    // All other kinds (ability, ac, speed, sense, resistance, scaling-stat, …)
    // are no-ops in this chunk — handled in later chunks.
    default:
      break;
  }
}
