# Subclass Completeness Audit — Phase 8.6

**Date:** 2026-06-08  
**Scope:** 40 SRD subclasses + 272 Aurora subclasses (312 total in `content-audit-subclasses.json`)  
**Method:** Cross-reference data shape against current rendering pipeline; inventory mechanic gaps by pattern.

---

## 1. Description Coverage

### How descriptions are rendered today

`tab-features.tsx` builds a `descByNameLower` map from two sources:

1. **SRD subclasses** — `subclass.featureDescriptions` (keyed by feature name, e.g. `"Improved Critical"`)
2. **Aurora featureMap** — `featureMap.get(featureId)?.description` (keyed by Aurora feature ID)

A subclass feature gets a description in the Features tab only when it appears in `descByNameLower`. Otherwise it renders as a chip label with no text.

### SRD Subclasses (40 total)

| Subclass | Class | `featuresByLevel` populated? | `featureDescriptions` populated? | Status |
|---|---|---|---|---|
| Champion | Fighter | ✅ (5 entries) | ✅ (5 descriptions) | **Working** |
| Battle Master | Fighter | ❌ empty | ❌ empty | Chips only |
| Eldritch Knight | Fighter | ❌ empty | ❌ empty | Chips only |
| Path of the Berserker | Barbarian | ❌ empty | ❌ empty | Chips only |
| Path of the Totem Warrior | Barbarian | ❌ empty | ❌ empty | Chips only |
| College of Lore | Bard | ❌ empty | ❌ empty | Chips only |
| College of Valor | Bard | ❌ empty | ❌ empty | Chips only |
| Life Domain | Cleric | ❌ empty | ❌ empty | Chips only |
| Light Domain | Cleric | ❌ empty | ❌ empty | Chips only |
| Knowledge Domain | Cleric | ❌ empty | ❌ empty | Chips only |
| Nature Domain | Cleric | ❌ empty | ❌ empty | Chips only |
| Tempest Domain | Cleric | ❌ empty | ❌ empty | Chips only |
| Trickery Domain | Cleric | ❌ empty | ❌ empty | Chips only |
| War Domain | Cleric | ❌ empty | ❌ empty | Chips only |
| Circle of the Land | Druid | ❌ empty | ❌ empty | Chips only |
| Circle of the Moon | Druid | ❌ empty | ❌ empty | Chips only |
| Way of the Open Hand | Monk | ❌ empty | ❌ empty | Chips only |
| Way of Shadow | Monk | ❌ empty | ❌ empty | Chips only |
| Way of the Four Elements | Monk | ❌ empty | ❌ empty | Chips only |
| Oath of Devotion | Paladin | ❌ empty | ❌ empty | Chips only |
| Oath of the Ancients | Paladin | ❌ empty | ❌ empty | Chips only |
| Oath of Vengeance | Paladin | ❌ empty | ❌ empty | Chips only |
| Hunter | Ranger | ❌ empty | ❌ empty | Chips only |
| Beast Master | Ranger | ❌ empty | ❌ empty | Chips only |
| Thief | Rogue | ❌ empty | ❌ empty | Chips only |
| Assassin | Rogue | ❌ empty | ❌ empty | Chips only |
| Arcane Trickster | Rogue | ❌ empty | ❌ empty | Chips only |
| Draconic Bloodline | Sorcerer | ❌ empty | ❌ empty | Chips only |
| Wild Magic | Sorcerer | ❌ empty | ❌ empty | Chips only |
| The Archfey | Warlock | ❌ empty | ❌ empty | Chips only |
| The Fiend | Warlock | ❌ empty | ❌ empty | Chips only |
| The Great Old One | Warlock | ❌ empty | ❌ empty | Chips only |
| School of Abjuration | Wizard | ❌ empty | ❌ empty | Chips only |
| School of Conjuration | Wizard | ❌ empty | ❌ empty | Chips only |
| School of Divination | Wizard | ❌ empty | ❌ empty | Chips only |
| School of Enchantment | Wizard | ❌ empty | ❌ empty | Chips only |
| School of Evocation | Wizard | ❌ empty | ❌ empty | Chips only |
| School of Illusion | Wizard | ❌ empty | ❌ empty | Chips only |
| School of Necromancy | Wizard | ❌ empty | ❌ empty | Chips only |
| School of Transmutation | Wizard | ❌ empty | ❌ empty | Chips only |

**Summary: 1/40 SRD subclasses have description coverage. Populating the remaining 39 is pure data work — no rendering changes needed.**

### Aurora Subclasses (272 total)

Aurora subclasses use the `featureMap` for descriptions. Their feature IDs (e.g. `ID_WOTC_PHB_ARCHETYPE_FEATURE_BATTLE_MASTER_COMBAT_SUPERIORITY`) must resolve in the `featureMap` fetched at page load.

**Coverage quality by source (representative sample):**

| Source | Count | Description mechanism | Notes |
|---|---|---|---|
| Player's Handbook (PHB) | 40 | Aurora featureMap | IDs populated; descriptions available if featureMap has them |
| Player's Handbook (2024) | 48 | Aurora featureMap | IDs populated; no domain spell grants in data |
| Tasha's Cauldron of Everything | 30 | Aurora featureMap | IDs populated |
| Xanathar's Guide to Everything | 28 | Aurora featureMap | IDs populated |
| Sword Coast Adventurer's Guide | 11 | Aurora featureMap | IDs populated |
| Unearthed Arcana: Gothic Heroes | 1 (Monster Hunter) | Aurora featureMap | **Feature IDs are empty strings** — descriptions will silently fail |
| Other UA | ~114 | Aurora featureMap | Variable; some may have empty IDs like Monster Hunter |

**Monster Hunter exception:** Its `grants` array has entries with `"id": ""` (empty string). The featureMap cannot resolve empty-string IDs. Its features will always show as unlabeled chips regardless of featureMap contents.

---

## 2. Subclass Mechanic Patterns Not Yet Supported

### Pattern A: Subclass-Granted Spellcasting

**What it is:** Some subclasses grant spellcasting ability to classes that don't otherwise have it. The spellcasting ability score, slot progression, and spell list are defined at the subclass level.

**Affected SRD subclasses:**
- **Eldritch Knight** (Fighter): Intelligence-based 1/3 caster. Grants spells from the Wizard list. Features include `"Spellcasting"`.
- **Arcane Trickster** (Rogue): Intelligence-based 1/3 caster. Grants spells from the Wizard list. Features include `"Spellcasting"`.

**Slot progression (1/3 caster, shared with Ranger/Paladin table):**

| Level | Slots L1 | Slots L2 | Slots L3 | Slots L4 |
|---|---|---|---|---|
| 3 | 2 | — | — | — |
| 7 | 3 | — | — | — |
| 8 | 3 | — | — | — |
| 11 | 3 | — | — | — |
| 13 | 4 | 2 | — | — |
| 14 | 4 | 2 | — | — |
| 19 | 4 | 3 | 2 | — |
| 20 | 4 | 3 | 2 | — |

**Current symptom:** Spells tab reads `character.data.classId` → looks up `srdClass.spellcasting`. Fighter and Rogue have no spellcasting on the base class, so the Spells tab shows "this character can't cast spells" even at L7 Eldritch Knight.

**Fix surface:** `deriveStats` needs to check subclass for a `"Spellcasting"` feature and apply the 1/3 caster slot table. Alternatively, Spells tab checks `character.data.subclassId` directly.

**Aurora equivalents:** PHB versions of Eldritch Knight and Arcane Trickster exist in the Aurora data with the same feature IDs. Monster Hunter (UA: Gothic Heroes) also has spellcasting.

---

### Pattern B: Custom Subclass Resource Pools (Battle Master Superiority Dice)

**What it is:** Some subclasses define their own pool of limited-use resources distinct from spell slots or the generic "charge" pip system. Battle Master is the canonical example: superiority dice (d8→d10→d12 by tier) spent on maneuvers chosen from a menu.

**Battle Master mechanics:**
- `Combat Superiority` (L3): 4 superiority dice (d8); pick 3 maneuvers from 16
- `Improved Combat Superiority` (L10): dice become d10; maneuver count increases
- `Relentless` (L15): regain 1 die if you have none at initiative
- `Know Your Enemy` (L7): passive scouting feature, no resource
- `Student of War` (L3): tool proficiency, no resource

**Why the current pip system doesn't fit:** The generic feature charge system tracks a single named resource per feature. Superiority dice are a *shared pool* across all maneuver uses, and the maneuver selection (which 3 of 16 to pick) happens at level-up — not at use time.

**Other subclasses with custom pools:**
- Way of the Four Elements Monk: ki points (shared with class but disciplines need selection)
- Arcane Trickster / Eldritch Knight: spell slots (handled under Pattern A above)
- Battlemaster variants in XGtE/PHB24: same superiority dice pattern

---

### Pattern C: Subclass-Level Choice Surfaces (Fighting Style, Maneuvers, Hunter Options)

**What it is:** Some subclass features require the player to select from a list of options, either at the level when the feature is granted or at level-up. The level-up panel currently only surfaces class-level choices (subclass selection, Fighting Style, feats/ASI). Subclass-level choices are silently skipped.

**Examples by subclass:**

| Subclass | Level | Feature | Choice |
|---|---|---|---|
| Champion | 10 | Additional Fighting Style | Pick 1 from Fighting Style list |
| Hunter | 3 | Hunter's Prey | Pick 1 (Colossus Slayer / Giant Killer / Horde Breaker) |
| Hunter | 7 | Defensive Tactics | Pick 1 (Escape the Horde / Multiattack Defense / Steel Will) |
| Hunter | 11 | Multiattack | Pick 1 (Volley / Whirlwind Attack) |
| Hunter | 15 | Superior Hunter's Defense | Pick 1 (Evasion / Stand Against the Tide / Uncanny Dodge) |
| Path of the Totem Warrior | 3 | Totem Spirit | Pick 1 animal totem |
| Path of the Totem Warrior | 6 | Aspect of the Beast | Pick 1 animal |
| Path of the Totem Warrior | 14 | Totemic Attunement | Pick 1 animal |
| Battle Master | 3 | Combat Superiority | Pick 3 maneuvers from 16 |
| Way of the Four Elements | 3+ | Elemental Disciplines | Pick disciplines from list on level-up |

**Champion L10 is the highest-priority fix** because it uses an existing system (Fighting Style) and only needs the level-up panel to check `subclass.featuresByLevel` in addition to class features.

---

### Pattern D: Subclass-Derived Stat Modifications

**What it is:** Some subclass features modify derived stats (initiative, ability checks, saving throws, AC, speed) in ways that `deriveStats` must detect by subclass ID.

**Known gaps:**

| Subclass | Feature | Effect | Current State |
|---|---|---|---|
| Champion | Remarkable Athlete (L7) | +⌈PB/2⌉ to STR, DEX, CON checks not already proficient | Not applied |
| Draconic Bloodline | Draconic Resilience (L1) | AC = 13 + DEX when unarmored (like Monk but 13 base) | Not applied |
| War Domain | War Priest (L1) | Extra attack using BA (tracking only, no stat mod) | N/A |
| Forge Domain | Blessing of the Forge (L1) | +1 AC to one item (not a character-level stat) | N/A |

**Remarkable Athlete** is the only one that directly affects skill check derived stats. It applies half-PB (rounded up) to STR/DEX/CON ability checks not covered by full proficiency — equivalent to "jack of all trades" for those specific stats.

**Draconic Resilience** affects the AC formula. The current unarmored AC fallback (`10 + DEX`) would need a subclass-check branch, similar to how Monk Unarmored Defense works (`10 + DEX + WIS`).

---

### Pattern E: Always-Prepared Domain / Oath / Patron Spells

**What it is:** Cleric domains, Paladin oaths, and Warlock patrons grant a fixed list of spells that are always prepared (Cleric/Paladin) or always known (Warlock). These come from Aurora's spell grants.

**Aurora spell grant data:**

| Subclass | Source | Spell grants | Notes |
|---|---|---|---|
| Knowledge Domain | PHB | 10 | 2 per spell level tier (L1–5) |
| Life Domain | PHB | 10 | 2 per tier |
| Light Domain | PHB | 10 | 2 per tier |
| Nature Domain | PHB | 10 | 2 per tier |
| Tempest Domain | PHB | 10 | 2 per tier |
| Trickery Domain | PHB | 10 | 2 per tier |
| War Domain | PHB | 10 | 2 per tier |
| Arcana Domain | SCAG | 10 | 2 per tier |
| **Total** | | **80** | |

**PHB24 Cleric domains: no spell grants in Aurora data.** The PHB24 Life Domain entry has only Archetype Feature grants, no Spell grants. Either PHB24 moved domain spells into the feature descriptions, or the import didn't capture them. No action needed for PHB24 in Phase 8.6 until verified.

**Paladin oath spells:** Oath of Devotion, Oath of the Ancients, Oath of Vengeance all have always-prepared spells in the PHB rules — but in the Aurora data, the SRD versions have empty `featuresByLevel`/`featureDescriptions` and the PHB aurora versions have no Spell grants (checking SRD data confirms features like "Sacred Weapon" listed but no spell grants in `grants` array). Paladin oath spells are a gap not yet covered by the Aurora data for SRD subclasses.

**Current state:** The Spells tab has no mechanism to detect or display subclass spell grants. Domain spells don't appear in the Spells tab even if the character has the subclass.

---

### Pattern F: Subclass Proficiency Grants

**What it is:** Some subclasses grant weapon, armor, skill, or tool proficiencies at L3.

**Examples:**

| Subclass | Proficiency granted |
|---|---|
| Battle Master | One artisan's tool of your choice |
| Tempest Domain | Heavy armor, martial weapons |
| Nature Domain | Heavy armor |
| War Domain | Heavy armor, martial weapons |
| Forge Domain | Heavy armor, smith's tools |
| Monster Hunter | Thieves' tools, alchemist's supplies, one monster lore tool |
| College of Swords | Medium armor, scimitars |

**Current state:** The Stats tab Proficiencies section reads from class and background only. Subclass proficiency grants are not reflected. This is a display gap (the proficiency still functions if the player knows they have it) but the proficiencies section will show incomplete data.

---

## 3. Infrastructure Tier Classification

### Tier 1 — Pure data, no rendering changes

**T1-A: SRD subclass descriptions**
- Add `featuresByLevel` + `featureDescriptions` to `lib/content/srd/subclasses.ts` for 39 subclasses
- Work volume: ~1,000 lines of data (level mappings + PHB prose for ~5 features per subclass)
- Existing pipeline (`descByNameLower`) works correctly once data is populated
- Champion is the proven template
- **Fixes:** All 39 SRD subclasses showing features as chips only

**T1-B: Monster Hunter empty-ID mitigation**
- Monster Hunter's Aurora grants have `"id": ""` — featureMap lookup will always fail
- Short-term: populate SRD `featureDescriptions` for Monster Hunter if it's treated as an SRD-ish subclass; or document as "Aurora data gap"
- Longer-term: the content import pipeline should validate empty IDs

---

### Tier 2 — New logic, existing UI patterns

**T2-A: Subclass-granted spellcasting detection**
- `deriveStats` checks `character.data.subclassId` against a hardcoded map of subclass → spellcasting config
- Config shape: `{ ability: "INT", casterType: "one-third", spellList: "wizard" }`
- One-third slot table needs to be added (different from Ranger/Paladin half-caster)
- Spells tab reads from `derived.spellcasting` same as today
- **Fixes:** Eldritch Knight, Arcane Trickster show Spells tab correctly

**T2-B: Champion L10 Additional Fighting Style**
- Level-up panel detects `"Additional Fighting Style"` in `subclass.featuresByLevel[10]` (or equivalent)
- Renders existing Fighting Style picker UI (already built for class-level grant)
- Saves choice to `character.data.fightingStyles` array (already plural)
- **Fixes:** Champion L10 silently skipping the choice

**T2-C: Remarkable Athlete half-PB**
- `deriveStats` checks `character.data.subclassId === ID_SUBCLASS_FIGHTER_CHAMPION` and `character.level >= 7`
- Identifies STR/DEX/CON-based skills that are NOT already fully proficient
- Applies `Math.ceil(proficiencyBonus / 2)` to those skill modifiers
- Same approach as existing feat stat mod wiring (feat IDs hardcoded in `PROF_BONUS_INITIATIVE_FEAT_IDS`)
- **Fixes:** Remarkable Athlete not applied to skill checks

**T2-D: Domain spells (always-prepared display)**
- Parse `subclass.grants` (Aurora format) for `type === "Spell"` entries
- Cross-reference against known spell IDs in `allSpells`
- Surface as a special "always prepared" section in the Spells tab
- Level-gated: domain spells at tier X are available when character meets the level requirement
- **Fixes:** 80 PHB domain spells not visible in Spells tab

---

### Tier 3 — New infrastructure required

**T3-A: Custom subclass resource pools (Battle Master)**
- Superiority dice are a shared pool, not a per-feature charge
- Needs: new resource pool data type in `CharacterData` (e.g. `superiorityDice: { count: number, size: number }`)
- Needs: maneuver selection UI in level-up panel (pick N from list)
- Needs: dice-size scaling by tier (d8 → d10 → d12)
- Significant scope; deferred to Phase 9 or dedicated chunk

**T3-B: Generic option pool choices (Hunter, Totem Warrior, Four Elements)**
- Hunter's Prey/Defensive Tactics/Multiattack/Superior Hunter's Defense: pick 1 from 3–4 options per unlock
- Totem Warrior: pick 1 animal per tier (Totem Spirit, Aspect, Attunement)
- Four Elements: pick disciplines from a growing list
- Needs: a general-purpose "subclass option choice" UI in level-up panel
- Overlaps with Battle Master maneuver picker — build together if building at all
- Deferred; very few players will immediately notice missing Hunter choices

**T3-C: Subclass proficiency grants**
- Needs: subclass-level proficiency resolution in the derived stats pipeline
- Needs: subclass data schema extension to hold proficiency grants
- Current SRD format has no proficiency field on subclasses
- Display gap only (not a functional bug for most subclasses)
- Deferred

---

## 4. Recommended Phase 8.6 Scope

### In scope

| Chunk | Description | Tier | Priority |
|---|---|---|---|
| **8.6-A** | SRD subclass descriptions — populate `featuresByLevel` + `featureDescriptions` for all 39 remaining subclasses | T1 | High — affects every character |
| **8.6-B** | Subclass-granted spellcasting — Eldritch Knight + Arcane Trickster detection in `deriveStats` and Spells tab | T2 | High — currently broken |
| **8.6-C** | Champion L10 Additional Fighting Style — surface choice in level-up panel | T2 | Medium — silently skipped |
| **8.6-D** | Remarkable Athlete half-PB — detect Champion subclass, apply to skill checks in `deriveStats` | T2 | Medium — stat accuracy |
| **8.6-E** | Domain spells always-prepared — parse Aurora spell grants, display in Spells tab | T2 | Medium — Cleric domain players see nothing |

### Out of scope for 8.6

| Item | Reason |
|---|---|
| Battle Master resource pool (T3-A) | Needs new resource pool data architecture; significant scope |
| Hunter/Totem/Four Elements choices (T3-B) | Generic option picker UI; deferred with Battle Master |
| Subclass proficiency grants (T3-C) | Display gap only; schema extension needed |
| Monster Hunter spellcasting | Blocked by empty Aurora IDs; document as data gap |
| PHB24 domain spells | No spell grants in Aurora data; verify before building |
| Draconic Resilience AC | Edge case; deprioritized behind broken Spells tab |

### Build order

```
8.6-A (SRD data) → 8.6-D (Remarkable Athlete) → 8.6-C (Champion Fighting Style)
                → 8.6-B (Subclass spellcasting)  → 8.6-E (Domain spells)
```

8.6-A unblocks description visibility for all subclasses — do it first since it validates the data pipeline. 8.6-B and 8.6-E can be parallelized (both touch Spells tab but different concerns). 8.6-C and 8.6-D are independent Fighter-Champion fixes that can land in any order.

---

## 5. Data Reference

### SRD featuresByLevel template (Champion as model)

```ts
featuresByLevel: {
  3: ["Improved Critical"],
  7: ["Remarkable Athlete"],
  10: ["Additional Fighting Style"],
  15: ["Superior Critical"],
  18: ["Survivor"],
},
featureDescriptions: {
  "Improved Critical": "Your weapon attacks score a critical hit on a roll of 19 or 20.",
  "Remarkable Athlete": "Add half your proficiency bonus (rounded up) to any STR, DEX, or CON check that doesn't already use your proficiency bonus...",
  ...
}
```

Each of the 39 remaining SRD subclasses needs this populated from PHB/SRD text. The feature names must match the strings in the `features: string[]` array exactly (case-insensitive match in `descByNameLower`).

### Aurora subclass with spell grants (PHB Knowledge Domain)

```json
{
  "id": "ID_WOTC_PHB_ARCHETYPE_CLERIC_KNOWLEDGE_DOMAIN",
  "grants": [
    { "id": "ID_PHB_SPELL_COMMAND",    "type": "Spell", "level": 1 },
    { "id": "ID_PHB_SPELL_IDENTIFY",   "type": "Spell", "level": 1 },
    { "id": "ID_PHB_SPELL_AUGURY",     "type": "Spell", "level": 3 },
    { "id": "ID_PHB_SPELL_SUGGESTION", "type": "Spell", "level": 3 },
    ...
  ]
}
```

The `"level"` field is the character level at which the spell becomes available (domain spell tiers: 1, 3, 5, 7, 9).

### Subclass-granted spellcasting hardcoded map (for T2-A)

```ts
const SUBCLASS_SPELLCASTING: Record<string, { ability: Ability; casterType: "one-third" }> = {
  ID_SUBCLASS_FIGHTER_ELDRITCH:   { ability: "INT", casterType: "one-third" },
  ID_SUBCLASS_ROGUE_ARCANE:       { ability: "INT", casterType: "one-third" },
  // Monster Hunter: blocked by empty Aurora IDs, add later
};
```

One-third caster slot table (by Fighter/Rogue level, not character level if multiclassing):

| L3 | L4 | L7 | L8 | L10 | L11 | L13 | L14 | L16 | L19 | L20 |
|---|---|---|---|---|---|---|---|---|---|---|
| 2 | 2 | 3 | 3 | 3 | 3 | 4 | 4 | 4 | 4 | 4 |

(Level 2 slots unlock at L13; Level 3 slots at L19. Simplified for single-class characters in Phase 8.6.)

---

*Methodology mirrors `docs/class-completeness-audit.md` (Phase 8.5). Foundational audit: `docs/feature-taxonomy-audit.md`.*
