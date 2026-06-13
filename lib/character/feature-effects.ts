// Applicator functions for FeatureEffect kinds that target calc.ts stats.
// Each function receives a DeriveContext (mutable views into the breakdown
// arrays being built by deriveStats) and pushes labeled components onto them.
//
// Design: handlers mutate ctx in place; the caller (applyFeatureEffect in
// lib/features/apply.ts) dispatches here. Totals are updated alongside
// components so applyAdj picks them up correctly in the next phase.
//
// chunk 2:   hp-per-level, initiative-add, half-prof-on-checks
// chunk 10a: speed, ac-base, ac, initiative-advantage, scaling-stat,
//            save-advantage, resistance, condition-immunity, sense

import type { AbilityKey } from "@/lib/content/srd/types";
import type { ScalingFormula, EffectCondition } from "@/lib/features/types";

type Component = { label: string; value: number };
type MutableBreakdown = { components: Component[]; total: number };

/**
 * Mutable context passed to each effect handler. Fields are references to the
 * partially-built arrays inside deriveStats — handlers push directly onto them.
 */
export interface DeriveContext {
  level: number;
  pb: number;
  /** FeatureDef.name — used to build the label for breakdown components. */
  featureName: string;
  abilityMods: Record<AbilityKey, number>;
  /** Skills the character is proficient in. Used to skip already-covered checks. */
  proficientSkills: Set<string>;
  /** SKILL_ABILITIES mapping (skill name → ability key). */
  skillAbilities: Record<string, AbilityKey>;
  /** Accumulator for HP bonus components (pushed to before maxHpBreakdown is sealed). */
  maxHpComponents: Component[];
  /** Mutable initiative breakdown; handler pushes component and updates .total. */
  initiativeBreakdown: MutableBreakdown;
  /** Mutable skill breakdowns; handlers update .components and .total per skill. */
  skillBreakdowns: Record<string, MutableBreakdown>;

  // ── chunk 10a additions ───────────────────────────────────────────────────────
  /** Character's active classId (for scaling-stat formula resolution). */
  characterClassId: string;
  /** Whether any armor item is currently equipped. Used for ac-base / ac conditions. */
  armorEquipped: boolean;
  /** Whether the equipped armor is heavy. Used for speed condition (not_wearing heavy). */
  heavyArmorEquipped: boolean;
  /** Accumulator for ac-base compound component (one entry max in practice). */
  acBaseComponents: Component[];
  /** Accumulator for additive AC components (ac op:"add" effects). */
  acAdditiveComponents: Component[];
  /** Accumulator for speed bonus components (speed op:"add" effects). */
  speedBonusComponents: Component[];
  /** Names of features granting initiative advantage (non-empty → advantage is active). */
  initiativeAdvantageSources: string[];
  /** Map of stat-name → resolved value from scaling-stat effects. */
  scalingStats: Record<string, string | number>;
  saveAdvantages: Array<{ against: string; source: string }>;
  resistances: Array<{ damageType: string; source: string }>;
  conditionImmunities: Array<{ condition: string; source: string; whileAuraActive?: boolean }>;
  senses: Array<{ sense: string; range: number; source: string }>;
}

// ── Handler: hp-per-level (Tough) ─────────────────────────────────────────────

export function applyHpPerLevel(value: number, ctx: DeriveContext): void {
  const bonus = value * ctx.level;
  ctx.maxHpComponents.push({ label: ctx.featureName, value: bonus });
}

// ── Handler: initiative-add (Alert) ───────────────────────────────────────────

export function applyInitiativeAdd(value: "prof-bonus" | number, ctx: DeriveContext): void {
  const bonus = value === "prof-bonus" ? ctx.pb : value;
  ctx.initiativeBreakdown.components.push({ label: ctx.featureName, value: bonus });
  ctx.initiativeBreakdown.total += bonus;
}

// ── Handler: half-prof-on-checks (Remarkable Athlete) ─────────────────────────

export function applyHalfProfOnChecks(abilities: AbilityKey[] | "all", ctx: DeriveContext): void {
  const halfPb = Math.ceil(ctx.pb / 2);
  for (const [skill, bd] of Object.entries(ctx.skillBreakdowns)) {
    const ability = ctx.skillAbilities[skill];
    if (!ability) continue;
    if (abilities !== "all" && !abilities.includes(ability)) continue;
    if (ctx.proficientSkills.has(skill)) continue;
    bd.components.push({ label: ctx.featureName, value: halfPb });
    bd.total += halfPb;
  }
}

// ── Handler: speed ────────────────────────────────────────────────────────────

export function applySpeedBonus(
  op: "add" | "set",
  value: number,
  condition: EffectCondition | undefined,
  ctx: DeriveContext
): void {
  if (condition) {
    if ("not_wearing" in condition) {
      if (condition.not_wearing === "heavy-armor" && ctx.heavyArmorEquipped) return;
      if (condition.not_wearing === "any-armor" && ctx.armorEquipped) return;
    }
    // while_raging / custom: can't evaluate statically — skip
    if ("while_raging" in condition || "custom" in condition) return;
  }
  if (op === "add") {
    ctx.speedBonusComponents.push({ label: ctx.featureName, value });
  }
  // op:"set" for a specific mode (climb/swim) has no current FeatureDef; deferred.
}

// ── Handler: ac-base (Unarmored Defense) ──────────────────────────────────────

export function applyAcBase(
  formula: "10+dex+con" | "10+dex+wis",
  ctx: DeriveContext
): void {
  // Condition not_wearing any-armor is inherent to both existing ac-base effects;
  // check armor state directly rather than threading the EffectCondition.
  if (ctx.armorEquipped) return;
  // Only apply the first ac-base effect (single-class characters have at most one).
  if (ctx.acBaseComponents.length > 0) return;
  const { dex, con, wis } = ctx.abilityMods;
  let value: number;
  let label: string;
  if (formula === "10+dex+con") {
    value = 10 + dex + con;
    label = "Unarmored Defense (DEX + CON)";
  } else {
    value = 10 + dex + wis;
    label = "Unarmored Defense (DEX + WIS)";
  }
  ctx.acBaseComponents.push({ label, value });
}

// ── Handler: ac (additive) ────────────────────────────────────────────────────

export function applyAcAdd(
  value: number,
  condition: EffectCondition | undefined,
  ctx: DeriveContext
): void {
  if (condition) {
    if ("wearing" in condition && condition.wearing === "armor" && !ctx.armorEquipped) return;
    if ("not_wearing" in condition) {
      if (condition.not_wearing === "heavy-armor" && ctx.heavyArmorEquipped) return;
      if (condition.not_wearing === "any-armor" && ctx.armorEquipped) return;
    }
    if ("while_raging" in condition || "custom" in condition) return;
  }
  ctx.acAdditiveComponents.push({ label: ctx.featureName, value });
}

// ── Handler: initiative-advantage ─────────────────────────────────────────────

export function applyInitiativeAdvantage(ctx: DeriveContext): void {
  ctx.initiativeAdvantageSources.push(ctx.featureName);
}

// ── Handler: scaling-stat ─────────────────────────────────────────────────────

export function applyScalingStat(
  formula: ScalingFormula,
  statName: string,
  ctx: DeriveContext
): void {
  // For class-level formulas: only resolve if the character is of the matching class.
  if (formula.by === "class-level" && formula.classId && formula.classId !== ctx.characterClassId) {
    return;
  }
  const level = ctx.level;
  const thresholds = Object.keys(formula.table).map(Number).sort((a, b) => a - b);
  let resolved: string | number | undefined;
  for (const t of thresholds) {
    if (level >= t) resolved = formula.table[t];
  }
  if (resolved !== undefined) {
    ctx.scalingStats[statName] = resolved;
  }
}

// ── Handler: save-advantage ───────────────────────────────────────────────────

export function applySaveAdvantage(
  against: "all" | { traits: string[] },
  ctx: DeriveContext
): void {
  const againstStr = against === "all" ? "all" : against.traits.join(",");
  ctx.saveAdvantages.push({ against: againstStr, source: ctx.featureName });
}

// ── Handler: resistance ───────────────────────────────────────────────────────

export function applyResistance(damageType: string, ctx: DeriveContext): void {
  ctx.resistances.push({ damageType, source: ctx.featureName });
}

// ── Handler: condition-immunity ───────────────────────────────────────────────

export function applyConditionImmunity(
  condition: string,
  whileAuraActive: boolean | undefined,
  ctx: DeriveContext
): void {
  ctx.conditionImmunities.push({ condition, source: ctx.featureName, whileAuraActive });
}

// ── Handler: sense ────────────────────────────────────────────────────────────

export function applySense(sense: string, range: number, ctx: DeriveContext): void {
  ctx.senses.push({ sense, range, source: ctx.featureName });
}
