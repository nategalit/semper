// Active feature resolution and effect dispatch.
//
// collectActiveFeatures: pure function that inspects a character's
// class/subclass/race/feats and returns all matching FeatureDefs from
// FEATURE_REGISTRY.
//
// applyFeatureEffect: dispatches on effect.kind.
// chunk 2b: hp-per-level, initiative-add, half-prof-on-checks
// chunk 10a: speed, ac-base, ac, initiative-advantage, scaling-stat,
//            save-advantage, resistance, condition-immunity, sense
//            (ability + save-prof are handled in Pass 1 of deriveStats, not here)

import type { Character } from "@/lib/types/character";
import type { FeatureDef, FeatureEffect } from "./types";
import type { DeriveContext } from "@/lib/character/feature-effects";
import { allFeatureDefs } from "./registry";
import {
  applyHpPerLevel,
  applyInitiativeAdd,
  applyHalfProfOnChecks,
  applySpeedBonus,
  applyAcBase,
  applyAcAdd,
  applyInitiativeAdvantage,
  applyScalingStat,
  applySaveAdvantage,
  applyResistance,
  applyConditionImmunity,
  applySense,
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

  const charEdition = character.data.edition;

  const result: FeatureDef[] = [];
  for (const def of allFeatureDefs()) {
    // Edition filter: skip features not applicable to this character's edition.
    // mix / undefined → include all; "2024" → skip srd-only; "2014" → skip phb24-only.
    if (def.editions) {
      if (charEdition === "2024" && !def.editions.includes("phb24")) continue;
      if (charEdition === "2014" && !def.editions.includes("srd")) continue;
    }
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
 * Dispatches one FeatureEffect onto ctx.
 * "ability" and "save-prof" are handled in Pass 1 of deriveStats (before
 * abilityMods are frozen) and are intentional no-ops here.
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

    // ── chunk 10a handlers ───────────────────────────────────────────────────
    case "speed":
      applySpeedBonus(effect.op, effect.value, effect.condition, ctx);
      break;
    case "ac-base":
      applyAcBase(effect.formula, ctx);
      break;
    case "ac":
      applyAcAdd(effect.value, effect.condition, ctx);
      break;
    case "initiative-advantage":
      applyInitiativeAdvantage(ctx);
      break;
    case "scaling-stat":
      applyScalingStat(effect.formula, effect.stat, ctx);
      break;
    case "save-advantage":
      applySaveAdvantage(effect.against, ctx);
      break;
    case "resistance":
      applyResistance(effect.damageType, ctx);
      break;
    case "condition-immunity":
      applyConditionImmunity(effect.condition, effect.whileAuraActive, ctx);
      break;
    case "sense":
      applySense(effect.sense, effect.range, ctx);
      break;

    // ── Handled in deriveStats Pass 1 (before abilityMods) ──────────────────
    case "ability":
    case "save-prof":
      break;

    // Remaining kinds (ac-base already handled above).
    default:
      break;
  }
}
