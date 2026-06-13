# Feature Data Layer — Design Doc

**Status:** Approved 2026-06-10. Supersedes ad-hoc feature handling described in `feature-taxonomy-audit.md` §17 patterns by giving them an explicit schema and consumer contract.

**Purpose:** A single data shape and a small set of consumers that handles all class, subclass, race, background, and feat features uniformly. Replaces the current pattern of hardcoded special cases (Tough HP, Alert init, Remarkable Athlete half-PB, KNOWN_CHARGED_FEATURES prose) with declarative data. Designed against the requirements list in `known-issues-from-testing.md`.

**Non-goals:** Spell system overhaul (Magical Secrets, spellbook mechanics, Memorize Spell), action bar implementation (Phase 9 build), creation wizard rewrite (Phase 8.7). This doc defines the data and calc layer those phases consume.

---

## 1. The shape

Every feature — class, subclass, race, background, feat — conforms to one `FeatureDef`:

```ts
type FeatureDef = {
  // Identity
  id: string;                    // canonical, source-agnostic (e.g. "rage", "lay-on-hands")
  name: string;
  source: ContentSource;         // SRD | PHB24 | Aurora-imported | etc.
  origin: FeatureOrigin;         // { kind: "class", classId, level } | "subclass" | "race" | "background" | "feat"

  // Display
  prose: ProseBySource;          // { srd?, phb24?, fallback } — character's content selection picks
  actionType: ActionType;        // action | bonus_action | reaction | passive | situational | free | special
  parentFeatureId?: string;      // for grouping: Improved Brutal Strike -> "brutal-strike"
  augments?: "extend" | "replace"; // child either adds to parent's display or replaces a section

  // Behavior — all optional, all declarative
  choices?: FeatureChoice[];     // see §2
  effects?: FeatureEffect[];     // see §3
  resource?: FeatureResource;    // see §4 — at most one per feature
  grantedSpells?: GrantedSpells; // see §5
};
```

The four behavior fields are independent and composable. Rage has `resource`, `effects` (during-rage advantages, resistance), and `actionType: bonus_action`. Lay on Hands has `resource` only (the pool). Fast Movement has `effects` only. Weapon Mastery has `choices` only.

---

## 2. Choices

```ts
type FeatureChoice =
  | { kind: "skill"; from: SkillFilter; count: number; grants: "proficient" | "expertise" }
  | { kind: "language"; from: LanguageFilter; count: number }
  | { kind: "weapon-mastery"; count: number; pool: "any" | WeaponFilter; rePickOn: "long-rest" }
  | { kind: "feat"; from: FeatFilter; count: number }   // reuses existing feat picker
  | { kind: "spell"; from: SpellFilter; count: number; alwaysPrepared?: boolean }
  | { kind: "mode"; options: ModeOption[]; affects: string } // Divine Order, Primal Order, Blessed Strikes
  | { kind: "subfeature"; options: SubfeatureOption[] };     // Giant Ancestry boon, Tiefling legacy, Draconic Ancestry

type ModeOption = {
  id: string;            // "protector" | "thaumaturge"
  label: string;
  prose: string;
  effects?: FeatureEffect[];
  grantedSpells?: GrantedSpells;
  inheritedBy?: string[]; // child feature ids — Improved Blessed Strikes reads parent's chosen mode
};
```

**Surfacing.** Choices appear in two places:
- Level-up panel, on the level granting the choice (existing infrastructure; generalize from current Fighting Style / ASI handling).
- Creation wizard L1, for L1 choices when character is created at L>1 or just at L1.

**Inheritance.** Improved Blessed Strikes / Improved Brutal Strike / Improved Elemental Fury read the mode chosen on their parent — no duplicate picker.

**Re-pick semantics.** Weapon Mastery has `rePickOn: "long-rest"`. The level-up panel ignores this; the sheet exposes a "Change Mastery" affordance on rest. Same pattern for Pact Boon swap rules later.

**Filters** (`SkillFilter`, `LanguageFilter`, etc.) are predicates over content. `from: { source: "barbarian-class-list" }` resolves at choice time, so adding a skill to a class list later doesn't require choice migration.

---

## 3. Effects on derived stats

```ts
type FeatureEffect =
  | { kind: "ability"; ability: Ability; op: "add" | "set-min"; value: number | "level" | "prof-bonus"; cap?: number }
  | { kind: "ac"; op: "add"; value: number; condition?: EffectCondition }
  | { kind: "speed"; op: "add" | "set"; value: number; mode?: "walk" | "climb" | "swim" | "fly"; condition?: EffectCondition }
  | { kind: "save-prof"; saves: Ability[] | "all" }
  | { kind: "save-advantage"; against: "all" | TraitFilter }
  | { kind: "skill-prof"; skill: Skill; level: "proficient" | "expertise" }
  | { kind: "sense"; sense: "darkvision" | "blindsight" | "tremorsense" | "truesight"; range: number }
  | { kind: "resistance"; damageType: DamageType | "by-choice"; choiceId?: string }
  | { kind: "condition-immunity"; condition: Condition; whileAuraActive?: boolean }
  | { kind: "scaling-stat"; stat: string; formula: ScalingFormula }; // martial-arts die, sneak-attack die, rage damage

type EffectCondition =
  | { not_wearing: "heavy-armor" | "any-armor" }
  | { wearing: "armor" }
  | { while_raging: true }
  | { custom: string }; // escape hatch, named conditions resolved in calc
```

**Consumer:** `deriveStats` walks every effect from every feature the character has, in a defined precedence order: base → race → class → subclass → feats → items → manual overrides. The existing `StatBreakdown` machinery (UI overhaul phase) already supports component attribution — each effect contributes one labeled line.

**Resistances and senses get a card.** Top-bar resistance chip cluster (next to conditions, per testing notes); senses card adds investigation, insight, blindsight, darkvision range (per testing notes).

**Scaling-stat** is the home for "Martial Arts die: d8 at L5, d10 at L11" without a hardcode per scaling feature. Renders wherever the stat is referenced (attacks line, Ki block, etc.).

**Migration of existing hardcodes.** Tough → effect on `hp-by-level`. Alert → effect on initiative (the existing `PROF_BONUS_INITIATIVE_FEAT_IDS` set is replaced by data). Remarkable Athlete → effect on `half-prof-on-checks`. The `calc.ts` special cases get deleted as their replacements ship.

---

## 4. Resources

Seven shapes, one type:

```ts
type FeatureResource = {
  id: string;                    // "rage", "lay-on-hands-pool", "sorcery-points"
  shape: ResourceShape;
  recharge: Recharge;
  display: ResourceDisplay;      // pip | number | spell-slot-row | per-tier-checkboxes | binary-token
};

type ResourceShape =
  | { kind: "charges"; max: number | DerivedCount }
  | { kind: "pool"; max: number | DerivedCount }                        // Lay on Hands
  | { kind: "points"; max: number | DerivedCount; convertsTo?: "spell-slots" } // Sorcery Points + Font of Magic table
  | { kind: "slots"; level: number | "by-table"; max: number | DerivedCount } // Pact Magic
  | { kind: "per-tier-one-shot"; tiers: SpellLevel[] }                  // Mystic Arcanum
  | { kind: "binary-token" };                                            // Heroic Inspiration

type DerivedCount =
  | { from: "ability-mod"; ability: Ability; min?: number }              // Bardic Inspiration = CHA mod
  | { from: "prof-bonus" }                                                // Adrenaline Rush, Breath Weapon
  | { from: "level"; classId: string; multiplier?: number };              // Lay on Hands = 5 × Paladin level

type Recharge =
  | { on: "short-rest" | "long-rest" }
  | { on: "long-rest"; partialOn?: "short-rest"; amount?: number | "half-max-round-up" }
  | { on: "initiative-roll"; once: "per-long-rest" };                    // Persistent Rage / Perfect Focus
```

This covers every observed shape:

| Feature | Shape |
|---|---|
| Rage, Channel Divinity, Second Wind | charges + DerivedCount + recharge |
| Lay on Hands | pool + DerivedCount(level × 5) |
| Sorcery Points | points + convertsTo |
| Pact Magic | slots + by-table + short-rest recharge |
| Mystic Arcanum | per-tier-one-shot |
| Heroic Inspiration | binary-token |
| Bardic Inspiration | charges, max = ability-mod(CHA) |
| Sorcerous Restoration | recharge with `partialOn: "short-rest", amount: "half-max-round-up"` on the parent points resource |
| Persistent Rage / Perfect Focus | recharge override: `on: "initiative-roll", once: "per-long-rest"` |
| Tireless temp HP, Adrenaline Rush, Breath Weapon, Nature's Veil | charges + ability-mod or prof-bonus + LR |
| Large Form, Innate Sorcery, Celestial Revelation, Draconic Flight | charges, max 1 or 2, LR |
| Superiority dice (Tier 3) | shape exists; defer per current scope |

**Display.** The display field decouples the data from the rendering. Pips for `≤5 max`, number entry for `>5 max` or pools, spell-slot row for slots, per-tier checkboxes for Mystic Arcanum, single token for Heroic Inspiration.

**KNOWN_CHARGED_FEATURES is deleted** when this lands — every entry becomes a `FeatureResource` with prose from `FeatureDef.prose`.

---

## 5. Always-prepared spells

```ts
type GrantedSpells = {
  spells: SpellRef[];                  // canonical IDs
  source: "class" | "subclass" | "race" | "feat";
  preparation: "always-prepared" | "known" | "cast-without-slot-once-per-LR";
  scaling?: { byCharacterLevel: { [level: number]: SpellRef[] } }; // High Elf lineage L1/L3/L5
  countsAgainstPrepared: boolean;      // PHB24 says no for these
};
```

Subclass-granted (8.6-E) generalizes up one level. Class-level (Divine Smite, Find Steed, Hunter's Mark, Words of Creation) and race-level (Elven/Gnomish lineage cantrips + scaling spells) reuse the same type.

Implementation note: this is a small generalization of `domain/oath spell rendering` already shipped in 8.6.

---

## 6. Grouping (parent / augments)

`parentFeatureId` is the schema field; `augments` is the policy:

- `augments: "extend"` — child appears nested under parent in display, parent's prose continues to render
- `augments: "replace"` — parent's "version" line gets the child's text (Improved Brutal Strike replaces Brutal Strike's options list)

Applies in Features tab and Actions tab equivalently. Restoring Touch nests under Lay on Hands. Aura Expansion under Aura of Protection. Improved versions of Blessed Strikes / Brutal Strike / Elemental Fury under their parents. The Ki block becomes parent-feature container for Flurry of Blows / Patient Defense / Step of the Wind / Heightened Focus.

---

## 7. actionType — hand-tag canonical, infer for Aurora

Hand-tagging covers all SRD class features, subclass features, race traits, backgrounds, and feats. Inference is a fallback for Aurora-imported content where hand-tagging is not feasible.

```ts
// Inference rules — applied in order, first match wins
const INFER_RULES: Array<{ pattern: RegExp; type: ActionType }> = [
  { pattern: /\bas an action\b/i,        type: "action" },
  { pattern: /\bas a bonus action\b/i,   type: "bonus_action" },
  { pattern: /\bas a reaction\b/i,       type: "reaction" },
  { pattern: /\busing your reaction\b/i, type: "reaction" },
  { pattern: /\bas a (magic|utilize|attack) action\b/i, type: "action" },
  { pattern: /\bas a free action\b/i,    type: "free" },
  { pattern: /\bat the end of a long rest\b/i, type: "special" },
  { pattern: /\b(once per turn|when you|whenever you)\b/i, type: "situational" },
  // Default: passive
];
```

Inferred values are stored alongside the FeatureDef with a `actionType_source: "inferred" | "tagged"` flag so we can audit and correct over time. The Actions tab can show a small indicator on inferred entries so the user knows.

---

## 8. Prose sourcing

```ts
type ProseBySource = {
  fallback: string;                      // required; canonical SRD text
  srd?: string;                          // optional override
  phb24?: string;                        // optional override
  byAuroraImport?: { [importId: string]: string }; // per imported source
};
```

Resolution order at render time: character's selected content source → fallback. So a PHB24 Barbarian sees `prose.phb24` if present, else `prose.fallback`. An Aurora-only character (Tabaxi Artificer) reads from the matching import.

For features that exist in multiple PHBs with different mechanics (Rage 2014 vs Rage 2024 — duration rules differ), the two are separate `FeatureDef` entries with different `id`s, dedup'd via the existing source-aware adapter. Prose-only differences (same rules, different writing) use the `ProseBySource` shape on one entry.

---

## 9. Consumers and order of change

Existing systems become declarative consumers of FeatureDefs:

| Consumer | Reads | Today |
|---|---|---|
| `deriveStats` | effects | hardcoded Tough/Alert/Remarkable Athlete; speed mods missing |
| Level-up panel | choices on new-level features | bespoke pickers for Fighting Style + ASI/Feat only |
| Character creation wizard | choices on L1 features + creation-time class/race/background choices | doesn't surface most choices |
| Sheet → Features tab | prose + grouping | flat list, prose from KNOWN_CHARGED_FEATURES hardcodes or featureMap |
| Sheet → Actions tab (Phase 9) | actionType + resource + grantedSpells | does not exist |
| Resource pips/pools UI | resource | KNOWN_CHARGED_FEATURES + hardcoded Ki |

---

## 10. Migration order (chunks for Claude Code)

Each chunk ends with `"Show me the diff. Stop. Await my approval."` Each is one commit.

1. **Types and registry.** Add `FeatureDef`, all sub-types, an empty `FEATURE_REGISTRY` map keyed by `id`. No consumers yet. No data. Tests for type shape only.
2. **Effects consumer in `deriveStats`.** Walk registry, apply effects. Migrate Tough, Alert, Remarkable Athlete from hardcoded to data. Delete the hardcoded paths. Existing characters unchanged.
3. **Resource type + display.** Define resource shape, build the seven display components. Migrate Rage and Channel Divinity off KNOWN_CHARGED_FEATURES. Delete KNOWN_CHARGED_FEATURES for migrated features.
4. **Prose sourcing.** Add `ProseBySource`, wire through Features tab rendering. Migrate Rage prose for SRD + PHB24.
5. **Choices type + generic picker.** One picker component handles all `FeatureChoice` kinds. Migrate Fighting Style picker as the first user. Migrate ASI/Feat second.
6. **Choices in creation wizard.** L1 choices surface during creation. Required for Phase 8.7 to slot in cleanly.
7. **Grouping.** `parentFeatureId` rendering in Features tab. Improved* features nest under parents.
8. **actionType field + inference engine.** Field on FeatureDef, inference rule set, source flag. No UI yet.
9. **Bulk content fill.** Class features populated with `actionType`, `effects`, `resource`, `choices`, `grantedSpells`, `prose.phb24` where applicable. Multiple commits, one class per commit. Each commit lands the data + verifies the relevant sheet display. Chunk 9 prose verification list: `feat-tough`, `feat-alert`, `barbarian-brutal-strike`, `barbarian-improved-brutal-strike`, `paladin-aura-of-protection`, `paladin-aura-expansion`, `barbarian-unarmored-defense`, `barbarian-weapon-mastery`, `barbarian-danger-sense`, `barbarian-reckless-attack`, `barbarian-primal-knowledge`, `barbarian-extra-attack`, `barbarian-fast-movement`, `barbarian-feral-instinct`, `barbarian-instinctive-pounce`, `barbarian-relentless-rage`, `barbarian-improved-brutal-strike-l17`, `barbarian-persistent-rage`, `barbarian-indomitable-might`, `barbarian-primal-champion`, `fighter-action-surge`, `fighter-second-wind`, `fighter-extra-attack`, `fighter-indomitable`, `fighter-tactical-mind`, `fighter-tactical-shift`, `fighter-weapon-mastery`, `fighter-two-extra-attacks`, `fighter-indomitable-2`, `fighter-indomitable-3`, `fighter-three-extra-attacks`, `monk-ki-points`, `monk-martial-arts`, `monk-unarmored-defense`, `monk-unarmored-movement`, `monk-flurry-of-blows`, `monk-patient-defense`, `monk-step-of-the-wind`, `monk-deflect-attacks`, `monk-slow-fall`, `monk-extra-attack`, `monk-stunning-strike`, `monk-evasion`, `monk-stillness-of-mind`, `monk-acrobatic-movement`, `monk-self-restoration`, `monk-deflect-energy`, `monk-disciplined-survivor`, `monk-perfect-focus`, `monk-superior-defense`, `monk-body-and-mind` (and any future `FeatureDef` carrying the "written from reference, not copied" marker).

**barbarian-persistent-rage (PHB24 mechanical divergence):** PHB24 L15 Persistent Rage adds an initiative-roll recharge trigger to Rage itself — on initiative roll, regain all expended Rage uses (once per Long Rest) — which is absent from the SRD version. The `Recharge` type already supports `{ on: "initiative-roll", once: "per-long-rest" }` (chunk 3 design). Wiring this conditionally onto `barbarian-rage`'s resource for L15+ PHB24 characters is future work, not chunk 9a scope.
10. **Generalized always-prepared (chunk 10c).** `FeatureDef.grantedSpells` wired into `tab-spells.tsx` rendering path alongside existing subclass domain/oath spells. `collectActiveFeatures` drives level-gating. Hunter's Mark live for Rangers. `grantedSpells` stubs added to `paladin-divine-smite`, `paladin-find-steed`, `bard-words-of-creation` — rendering deferred pending spell catalog additions (see §11).

**Feature data layer migration complete as of 2026-06-13.** All ten chunks (1–10) are implemented. Remaining deferred items in §11 require spell catalog additions (Divine Smite, Find Steed, Power Word Heal/Kill) or are lower-priority follow-up work (individual invocations, blood curses, edition-specific divergences).

The chunks 1–8 are infrastructure. Chunk 9 is the bulk content work, the long tail. By the time it's done, Phase 9 (Actions tab) has all the data it needs to read from.

---

## Known Limitations

**Aurora content-audit descriptions are truncated (chunk 9m).** `docs/content-audit-class-features.json` stores feature descriptions truncated to 200 characters with no `action` field. For classes sourced from this file, chunk 8's tier 2 (Aurora-tagged action string) never fires and tier 3 (prose inference) is unreliable when the action-indicating phrase falls past the truncation point. Tier 1 (hand-tagged `actionType` on the FeatureDef) is the load-bearing path for any class sourced from this file. Confirmed during chunk 9m (Artificer).

**Blood Hunter has no Aurora content-audit data (chunk 9n).** `docs/content-audit-class-features.json` contains no Blood Hunter entries at all — the class is absent from the file, not merely truncated. All 10 Blood Hunter FeatureDefs were written from design reference. `SRD_CLASS_ID_BY_NAME` in `lib/content/aurora/adapters.ts` was updated to map `"Blood Hunter"` → `"ID_CLASS_BLOOD_HUNTER"` so Aurora-imported characters get a normalized classId that matches FeatureDef origins. Blood Hunter ASI defs (L4/8/12/16/19) were not added in this chunk; deferred to chunk 10 or alongside Blood Hunter ASI table data.

**Edition-gating implemented (chunk 10b).** `editions?: ('srd' | 'phb24')[]` field added to `FeatureDef`; `collectActiveFeatures` now filters by `character.data.edition`. PHB24 characters (`edition: "2024"`) skip `editions: ["srd"]` features; SRD characters (`edition: "2014"`) skip `editions: ["phb24"]` features; `"mix"` and `undefined` include all. Tagged: `monk-ki-empowered-strikes`, `monk-tongue-of-sun-and-moon`, `monk-empty-body`, `sorcerer-sorcerous-renewal`. Note: `ranger-favored-enemy.grantedSpells` (Hunter's Mark) applies to all editions of the FeatureDef — edition-gating at the `GrantedSpells` level is a future `GrantedSpells.editions` field.

---

## 11. Chunk 10 candidates (deferred from chunk 9)

Items flagged during the chunk 9 class-fill pass that are not yet encoded. Each entry names the blocking reason and the earliest chunk that could land it.

| Item | Status | Priority |
|---|---|---|
| Individual Blood Hunter blood curses (Binding, Corrosion, Expulsion, Grave, Hexing, Purgation, Silence, Vulnerability) | Deferred — need a `feat`-like "blood-curse" tag and individual FeatureDefs per curse | Medium |
| Individual Warlock Eldritch Invocations | Deferred — same pattern as blood curses; need `{ tag: "invocation" }` FeatureDefs | Medium |
| Blood Hunter ASI defs (L4/8/12/16/19) | Deferred — no class-table data for Blood Hunter yet | Low |
| ~~Edition-gating~~ | **Done (chunk 10b)** — `editions` field live; Monk SRD-vs-PHB24 conflicts resolved | — |
| Barbarian Persistent Rage PHB24 divergence | Deferred — conditional `Recharge` on initiative roll; edition-gate unblocked | Medium |
| Warlock Eldritch Master initiative-roll recharge | Deferred — Recharge type supports it; wiring only | Low |
| Warlock Pact Boon individual sub-benefits | Deferred — subfeature-level FeatureDefs required | Low |
| Druid Archdruid Nature Magician `convertsTo` | Deferred — needs `convertsTo` exchange-rate mechanism | Low |
| Druid Wild Companion `spendsResource` wiring | Deferred — encoded, needs deriveStats consumer | Low |
| Crimson Rite Primal Blood rites (Flame/Frozen/Storm) | Deferred — unlock via subclass; `inheritedBy` on Crimson Rite mode needed | Low |
| Paladin Divine Smite `grantedSpells` rendering | Deferred — `grantedSpells` stub encoded on `paladin-divine-smite`; blocked on `ID_SPELL_DIVINE_SMITE` in spell catalog | Medium |
| Paladin Faithful Steed `grantedSpells` rendering | Deferred — stub on `paladin-find-steed`; blocked on `ID_SPELL_FIND_STEED` | Low |
| Bard Words of Creation `grantedSpells` rendering | Deferred — stub on `bard-words-of-creation`; blocked on `ID_SPELL_POWER_WORD_HEAL` + `ID_SPELL_POWER_WORD_KILL` | Low |
| Ranger Hunter's Mark free-cast resource | Deferred — always-prepared live; free-cast charge count (scales by level) needs class-table resource shape | Medium |

---

## 12. deriveStats consumers — resolved (chunk 10a)

All effect kinds listed here were wired in chunk 10a via the two-pass `deriveStats` restructure. The table is kept for historical reference.

| Effect kind | Handler | Notes |
|---|---|---|
| `ac-base` | `applyAcBase` | Single compound label "Unarmored Defense (DEX + CON/WIS)"; replaces hardcoded class-ID checks |
| `initiative-advantage` | `applyInitiativeAdvantage` | Sets `derivedStats.initiativeAdvantage` |
| `scaling-stat` | `applyScalingStat` | Populates `martialArtsDie`, `sneakAttackDie`, `attacksPerAction`, etc. |
| `sense` | `applySense` | Populates `derivedStats.senses[]` |
| `resistance` | `applyResistance` | Populates `derivedStats.resistances[]` |
| `condition-immunity` | `applyConditionImmunity` | Populates `derivedStats.conditionImmunities[]` |
| `speed` | `applySpeedBonus` | Checks armor condition flags; populates `speedBreakdown` |
| `save-advantage` | `applySaveAdvantage` | Populates `derivedStats.saveAdvantages[]` |
| `ability` | Pass 1 (inline in `deriveStats`) | Applied before `abilityMods` freeze |
| `ac` | `applyAcAdd` | Additive AC (Defense fighting style +1 when wearing armor) |

---

## 13. Open questions

- **Multiclassing.** Out of scope per current product, but FeatureDef.origin already supports it. Flag for later.
- **Feat-style replacement** (PHB24 Fighting Styles are technically feats granted by class features). Cleanest fix: classes carry a `{ kind: "feat"; from: { tag: "fighting-style" } }` choice. Means the Fighting Style picker becomes a tagged feat picker filter. (b) from the diagnostic is fixed by this — PHB24 styles get tagged and surface in the right picker.
- **Inheritance for mode picks** across version boundaries (a 2014 Cleric switching to 2024 mid-character). Probably not worth supporting; lock content source at creation.
