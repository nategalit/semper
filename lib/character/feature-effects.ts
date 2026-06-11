// Applicator functions for FeatureEffect kinds that target calc.ts stats.
// Each function receives a DeriveContext (mutable views into the breakdown
// arrays being built by deriveStats) and pushes labeled components onto them.
//
// Design: handlers mutate ctx in place; the caller (applyFeatureEffect in
// lib/features/apply.ts) dispatches here. Totals are updated alongside
// components so applyAdj picks them up correctly in the next phase.

import type { AbilityKey } from "@/lib/content/srd/types";

type Component = { label: string; value: number };
type MutableBreakdown = { components: Component[]; total: number };

/**
 * Mutable context passed to each effect handler. Fields are references to the
 * partially-built arrays inside deriveStats — handlers push directly onto them.
 */
export interface DeriveContext {
  level: number;
  pb: number;
  /** FeatureDef.name — used to build the "(data)" label for breakdown components. */
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
}

// ── Handler: hp-per-level (Tough) ─────────────────────────────────────────────

export function applyHpPerLevel(value: number, ctx: DeriveContext): void {
  const bonus = value * ctx.level;
  ctx.maxHpComponents.push({ label: `${ctx.featureName} (data)`, value: bonus });
}

// ── Handler: initiative-add (Alert) ───────────────────────────────────────────

export function applyInitiativeAdd(value: "prof-bonus" | number, ctx: DeriveContext): void {
  const bonus = value === "prof-bonus" ? ctx.pb : value;
  ctx.initiativeBreakdown.components.push({ label: `${ctx.featureName} (data)`, value: bonus });
  ctx.initiativeBreakdown.total += bonus;
}

// ── Handler: half-prof-on-checks (Remarkable Athlete) ─────────────────────────

export function applyHalfProfOnChecks(abilities: AbilityKey[], ctx: DeriveContext): void {
  const halfPb = Math.ceil(ctx.pb / 2);
  for (const [skill, bd] of Object.entries(ctx.skillBreakdowns)) {
    const ability = ctx.skillAbilities[skill];
    if (!ability || !abilities.includes(ability)) continue;
    if (ctx.proficientSkills.has(skill)) continue;
    bd.components.push({ label: `${ctx.featureName} (data)`, value: halfPb });
    bd.total += halfPb;
  }
}
