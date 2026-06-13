// Feature data layer — declarative schema for every class/subclass/race/background/feat
// feature. Replaces ad-hoc patterns (KNOWN_CHARGED_FEATURES, PROF_BONUS_INITIATIVE_FEAT_IDS,
// Remarkable Athlete hardcode, etc.) with one shape consumed by deriveStats, the level-up
// panel, the creation wizard, the Features tab, and (Phase 9) the Actions tab.
//
// Design doc: docs/feature-data-layer.md
// Chunk 1: types + empty registry, no consumers, no data.

import type { AbilityKey, ContentSource } from "@/lib/content/srd/types";

// ─── Primitives ───────────────────────────────────────────────────────────────

export type Ability = AbilityKey;
export type Skill = string;
export type SpellRef = string;
export type SpellLevel = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;

export type DamageType =
  | "acid" | "bludgeoning" | "cold" | "fire" | "force" | "lightning"
  | "necrotic" | "piercing" | "poison" | "psychic" | "radiant" | "slashing"
  | "thunder";

export type Condition =
  | "blinded" | "charmed" | "deafened" | "frightened" | "grappled"
  | "incapacitated" | "invisible" | "paralyzed" | "petrified" | "poisoned"
  | "prone" | "restrained" | "stunned" | "unconscious" | "exhaustion";

// ─── Identity / origin ────────────────────────────────────────────────────────

export type FeatureOrigin =
  | { kind: "class"; classId: string; level: number }
  | { kind: "subclass"; subclassId: string; level: number }
  | { kind: "race"; raceId: string }
  | { kind: "subrace"; subraceId: string }
  | { kind: "background"; backgroundId: string }
  | { kind: "feat"; featId: string | string[] };

// ─── Display: actionType ──────────────────────────────────────────────────────

export type ActionType =
  | "action"
  | "bonus_action"
  | "reaction"
  | "passive"
  | "situational"
  | "free"
  | "special";

export type ActionTypeSource = "tagged" | "inferred";

// ─── Display: prose ───────────────────────────────────────────────────────────

export interface ProseBySource {
  /** Canonical text; required. */
  fallback: string;
  /** SRD-edition override. */
  srd?: string;
  /** 2024 PHB override. */
  phb24?: string;
  /** Per-Aurora-import override, keyed by import identifier. */
  byAuroraImport?: Record<string, string>;
}

// ─── Choices ──────────────────────────────────────────────────────────────────
//
// Filters are open-ended predicates over content. They are intentionally
// underspecified here — chunk 5 (generic picker) defines the resolver. For now
// they exist as structural placeholders so FeatureChoice variants compile.

export interface SkillFilter {
  /** Pre-defined source list, e.g. "barbarian-class-list". */
  source?: string;
  /** Restrict to skills the character is already proficient in (for expertise picks). */
  alreadyProficient?: boolean;
  /** Explicit allow-list. */
  include?: Skill[];
  /** Explicit deny-list. */
  exclude?: Skill[];
}

export interface LanguageFilter {
  source?: string;
  include?: string[];
  exclude?: string[];
}

export interface WeaponFilter {
  /** Pre-defined source list, e.g. "martial-weapons", "simple-weapons". */
  source?: string;
  include?: string[];
  exclude?: string[];
}

export interface FeatFilter {
  /** Restrict to feats with a tag (e.g. "fighting-style", "epic-boon", "origin"). */
  tag?: string;
  /** Restrict by category. */
  category?: string;
  include?: string[];
  exclude?: string[];
}

export interface SpellFilter {
  /** Restrict to a class spell list. */
  classList?: string;
  /** Restrict to specific spell levels. */
  levels?: SpellLevel[];
  /** Restrict to ritual spells. */
  ritualOnly?: boolean;
  include?: SpellRef[];
  exclude?: SpellRef[];
}

export interface ModeOption {
  /** Stable ID for the picked mode, e.g. "protector", "thaumaturge". */
  id: string;
  label: string;
  prose: string;
  effects?: FeatureEffect[];
  grantedSpells?: GrantedSpells;
  /** Child feature IDs that inherit this mode (e.g. Improved Blessed Strikes). */
  inheritedBy?: string[];
}

export interface SubfeatureOption {
  id: string;
  label: string;
  prose: string;
  effects?: FeatureEffect[];
  grantedSpells?: GrantedSpells;
  resource?: FeatureResource;
}

export type FeatureChoice =
  | { kind: "skill"; from: SkillFilter; count: number; grants: "proficient" | "expertise" }
  | { kind: "language"; from: LanguageFilter; count: number }
  | { kind: "weapon-mastery"; count: number; pool: "any" | WeaponFilter; rePickOn: "long-rest" }
  | { kind: "feat"; from: FeatFilter; count: number }
  | { kind: "spell"; from: SpellFilter; count: number; alwaysPrepared?: boolean }
  | { kind: "mode"; options: ModeOption[]; affects: string }
  | { kind: "subfeature"; options: SubfeatureOption[] }
  | { kind: "asi-or-feat"; canTakeHalfFeat: boolean };

// ─── Effects ──────────────────────────────────────────────────────────────────

export type EffectCondition =
  | { not_wearing: "heavy-armor" | "any-armor" }
  | { wearing: "armor" }
  | { while_raging: true }
  | { custom: string };

export interface TraitFilter {
  /** Free-form trait identifier set; calc layer resolves these. */
  traits: string[];
}

/**
 * A formula for level-scaling stats (Martial Arts die, Sneak Attack die, Rage damage).
 * Resolved by deriveStats at render time against the relevant class level.
 */
export type ScalingFormula = {
  /** Class level used as the input. */
  by: "class-level" | "character-level";
  classId?: string;
  /** Sparse map: keys are thresholds, values are the stat value at that threshold. */
  table: Record<number, string | number>;
};

export type FeatureEffect =
  | { kind: "ability"; ability: Ability; op: "add" | "set-min"; value: number | "level" | "prof-bonus"; cap?: number }
  | { kind: "ac"; op: "add"; value: number; condition?: EffectCondition }
  | { kind: "speed"; op: "add" | "set"; value: number; mode?: "walk" | "climb" | "swim" | "fly"; condition?: EffectCondition }
  | { kind: "save-prof"; saves: Ability[] | "all" }
  | { kind: "save-advantage"; against: "all" | TraitFilter }
  | { kind: "skill-prof"; skill: Skill; level: "proficient" | "expertise" }
  | { kind: "sense"; sense: "darkvision" | "blindsight" | "tremorsense" | "truesight"; range: number }
  | { kind: "resistance"; damageType: DamageType | "by-choice"; choiceId?: string }
  | { kind: "condition-immunity"; condition: Condition; whileAuraActive?: boolean }
  | { kind: "scaling-stat"; stat: string; formula: ScalingFormula }
  // ── Migration targets (chunk 2) ─────────────────────────────────────────────
  // Each maps to exactly one consumer site in calc.ts (HP table, initiative, check rolls).
  | { kind: "hp-per-level"; value: number }
  | { kind: "initiative-add"; value: "prof-bonus" | number }
  | { kind: "half-prof-on-checks"; abilities: AbilityKey[] }
  // ── Chunk 9a additions ───────────────────────────────────────────────────────
  // ac-base: sets base AC via a formula when condition is met (Unarmored Defense pattern).
  // deriveStats consumer is TODO — data is encoded now, calc wiring follows.
  | { kind: "ac-base"; formula: "10+dex+con" | "10+dex+wis"; condition?: EffectCondition }
  // initiative-advantage: grants Advantage on Initiative rolls (Feral Instinct).
  // Display/calc consumer is TODO.
  | { kind: "initiative-advantage" };

// ─── Resources ────────────────────────────────────────────────────────────────

export type DerivedCount =
  | { from: "ability-mod"; ability: Ability; min?: number }
  | { from: "prof-bonus" }
  | { from: "level"; classId: string; multiplier?: number }
  | { from: "class-table"; classId: string; column: string };

export type ResourceShape =
  | { kind: "charges"; max: number | DerivedCount }
  | { kind: "pool"; max: number | DerivedCount }
  | { kind: "points"; max: number | DerivedCount; convertsTo?: "spell-slots" }
  | { kind: "slots"; level: number | "by-table"; max: number | DerivedCount }
  | { kind: "per-tier-one-shot"; tiers: SpellLevel[] }
  | { kind: "binary-token" };

export type Recharge =
  | { on: "short-rest" | "long-rest" }
  | { on: "long-rest"; partialOn?: "short-rest"; amount?: number | "half-max-round-up" }
  | { on: "long-rest"; switchesTo: "short-rest"; atLevel: number }
  | { on: "initiative-roll"; once: "per-long-rest" };

export type ResourceDisplay =
  | "pip"
  | "number"
  | "spell-slot-row"
  | "per-tier-checkboxes"
  | "binary-token"
  | "points";

export interface FeatureResource {
  id: string;
  shape: ResourceShape;
  recharge: Recharge;
  display: ResourceDisplay;
}

// ─── Granted spells ───────────────────────────────────────────────────────────

export interface GrantedSpells {
  spells: SpellRef[];
  source: "class" | "subclass" | "race" | "feat";
  preparation: "always-prepared" | "known" | "cast-without-slot-once-per-LR";
  /** Spells added as the character levels up (e.g. High Elf cantrip at L1, Detect Magic at L3). */
  scaling?: { byCharacterLevel: Record<number, SpellRef[]> };
  countsAgainstPrepared: boolean;
}

// ─── The top-level shape ──────────────────────────────────────────────────────

export interface FeatureDef {
  // Identity
  id: string;
  name: string;
  source: ContentSource;
  origin: FeatureOrigin;

  // Display
  prose: ProseBySource;
  actionType: ActionType;
  /** Whether actionType was hand-tagged or inferred from prose (see §7). */
  actionTypeSource: ActionTypeSource;
  /** Parent feature ID for grouping (e.g. Improved Brutal Strike -> "brutal-strike"). */
  parentFeatureId?: string;
  /** How the child relates to the parent in display. */
  augments?: "extend" | "replace";
  /** SRD/legacy display names this FeatureDef supersedes in the Path B dedup filter.
   *  Set when PHB24 renamed a feature (e.g. "Brutal Critical" → "Brutal Strike"). */
  legacyNames?: string[];

  // Behavior — all optional, all composable.
  choices?: FeatureChoice[];
  effects?: FeatureEffect[];
  /** At most one resource per feature. */
  resource?: FeatureResource;
  grantedSpells?: GrantedSpells;
  /** Cost paid from an existing resource when this feature is activated.
   *  Informs Phase 9 Actions tab display (e.g. "Stunning Strike (1 Ki)"). */
  spendsResource?: { resourceId: string; amount: number | "variable" };
}
