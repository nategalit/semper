# Feature Taxonomy Audit
Last updated: 2026-06-06

Foundational analysis for Phase 8.5. Covers every feature source in the
app: feats, class features, subclass features, race traits, subrace traits,
background features, and fighting styles. Organizes by mechanical PATTERN
rather than by source, so each pattern's infrastructure cost is paid once
across all sources.

---

## Data Sources

| Source | SRD bundled | Aurora imported | Total |
|---|---|---|---|
| Class features | 185 (12 classes) | 4,083 elements | — |
| Subclasses | 40 | 272 | 312 |
| Races | 9 | 139 | 148 |
| Subraces | 13 (embedded in SRD races) | 79 | 92 |
| Backgrounds | 13 | 117 | 130 |
| Feats | 0 | 320 (189 unique names) | 320 |
| Fighting Styles | 6 | 16 | 22 |

---

## Issue 1: The 4,083 Aurora Class Features Number

4,083 is not "12 classes × 20 levels." It breaks down as:

| Category | Count |
|---|---|
| Subclass-specific archetype features | ~1,830 |
| Base class features (actual class progression) | ~1,737 |
| Artificer infusion pool (individual options) | 237 |
| Eldritch Invocations (individual options) | 115 |
| Psionic talent options | 66 |
| Battle Master maneuvers | 44 |
| Druid circles (variant) | 72 |
| Rune magic options | 34 |
| Metamagic options | 20 |
| Other option pools (Pact Boons, Fighting Styles, etc.) | ~60 |
| Non-WOTC entries (racial traits in CF, background features) | ~61 |

**Key finding:** Approximately 520 elements are "option pool" members
(individual choices within a larger feature like Invocations, Maneuvers,
Metamagic). The app currently has no mechanism to let players pick from
these pools. This is Pattern 9 below.

The 157 Aurora class features whose names exactly match SRD featuresByLevel
names are the ones that fill in descriptions via the `descByNameLower`
Aurora fallback in `tab-features.tsx`.

**Sources span 80+ Aurora source books** (PHB24: 676, PHB: 434, TCE: 334,
ERLW: 278, XGtE: 232, MoTM: 170, and 74 other sources). Users see all
enabled books' variants merged together, deduplicated by class.

---

## Issue 2: SRD Class Feature Description Gaps

### Current state (SRD static + Aurora fallback)

| Class | SRD featuresByLevel | SRD described (non-orphan) | Aurora fallback covers | Still fully missing |
|---|---|---|---|---|
| Barbarian | 18 | 16 | — | 2: Path Feature×2 |
| Bard | 18 | 16 | — | 2: College Feature×2 |
| Cleric | 17 | 14 | — | 3: Destroy Undead variants, Channel Divinity (3) |
| Druid | 12 | 10 | — | 2: Circle Feature×2 |
| Fighter | 15 | 12 | — | 3: Martial Archetype Feature×3 |
| Monk | 23 | 20 | — | 3: Tradition Feature×3 |
| Paladin | 17 | 15 | *(see anomaly)* | 2: Sacred Oath Feature×2 |
| Ranger | 19 | 0 | 11/19 | **8 features** |
| Rogue | 16 | 0 | 11/16 | **5 features** |
| Sorcerer | 10 | 0 | 5/10 | **5 features** |
| Warlock | 12 | 0 | 5/12 | **7 features** |
| Wizard | 8 | 0 | 5/8 | **3 features** |
| **Total** | **185** | **103** | — | **65 gaps** |

SRD-only users of Ranger, Rogue, Sorcerer, Warlock, Wizard see 28 features
with zero description text — a real quality gap, not polish debt. Aurora
import users are partially covered (36 of 65 missing gaps have an Aurora
feature name match in the featureMap).

### Paladin anomaly: 22 descriptions / 17 features

`featureDescriptions` has 22 keys but `featuresByLevel` only contains 17
features. The 7 orphaned keys are: **Paladin's Smite, Faithful Steed, Abjure
Foes, Radiant Strikes, Restoring Touch, Aura Expansion, Epic Boon** — all
PHB24-specific features that were added to featureDescriptions but do not
appear in the SRD Paladin's featuresByLevel (PHB24 Paladin is an Aurora
class with its own featuresByLevel, not the SRD one).

These descriptions are not wasted — they populate `descByNameLower` and
resolve via the Aurora fallback for PHB24 Paladin characters. But the
discrepancy is misleading in audit counts.

**Diagnosis: not a bug.** PHB24-specific features should go in the Aurora
adapter's featureDescriptions if they need overrides, or can rely on Aurora
featureMap text. The 7 SRD Paladin featureDescriptions entries are harmless
extras used as PHB24 fallbacks.

### "Archetype Feature" variants (generic placeholder names)

Several missing entries are not real blank spots — they're generic
placeholder names like "Ranger Archetype Feature" (used 3×), "Roguish
Archetype Feature" (3×), "Tradition Feature" (3×), "Martial Archetype
Feature" (3×). These repeat the same description at each occurrence, and
a single description entry would cover all instances via the case-insensitive
lookup. Writing "Ranger Archetype Feature: Your ranger archetype grants you
a feature at this level." is the appropriate fix — 1 entry covers 3
appearances.

---

## Issue 3: Text-Only / Hardcoded-Required Features

**35 unique feat names** (39 total entries including duplicates across PHB and
PHB24) have zero structural data — empty `statModifiers`, `grants`,
`choices`. All mechanics live in `sheetText`/`description` text, computed
by Aurora's template engine (e.g., `{{tough:hp}}`).

### The hardcoded-required feat list

| Feat | Type of mechanic | FeatureDef strategy |
|---|---|---|
| Tough | +2 max HP per character level | Custom HP augmentation: `hasTough ? 2 × level : 0` added to maxHp at render time |
| Lucky (PHB) | 3 luck points, recharge long rest | Hardcode FeatureDef: `{ key: "lucky", label: "Lucky", maxCharges: 3, rechargesOn: "long" }` |
| Lucky (PHB24) | Advantage on d20 tests, 2 uses | Hardcode FeatureDef: `{ key: "lucky-phb24", label: "Lucky", maxCharges: 2, rechargesOn: "long" }` |
| Healer | Uses of healer's kit for 1d6+4 healing | Hardcode FeatureDef: `{ key: "healer", label: "Healer", maxCharges: "item-limited", rechargesOn: "never" }` *(deferred — tied to item)* |
| Inspiring Leader | Short rest temp HP for party | Hardcode FeatureDef: `{ key: "inspiring-leader", label: "Inspiring Leader", maxCharges: 1, rechargesOn: "short" }` |
| Charger | Conditional bonus-action attack after Dash | Passive text; no charge tracking needed |
| Crossbow Expert | No-loading, no-disadvantage, bonus-action attack | Passive; affects combat action options (Action Bar, deferred) |
| Defensive Duelist | Reaction +proficiency to AC | Passive / reaction; narrative only |
| Dungeon Delver | Advantage on trap detection | Passive narrative |
| Grappler | Advantage on grappling attacks | Passive narrative |
| Great Weapon Master | −5/+10 option, bonus attack on crit/kill | Passive narrative; attack modification (Action Bar, deferred) |
| Mage Slayer | Reaction attack vs caster | Passive / reaction narrative |
| Mounted Combatant | Mounted attack advantages | Passive narrative |
| Polearm Master | Bonus-action butt attack, AoO on enter | Passive narrative |
| Savage Attacker | Reroll damage 1×/turn | Passive narrative |
| Sentinel | AoO speed = 0, reaction vs leaving | Passive narrative |
| Sharpshooter (PHB) | No long-range disadvantage, −5/+10 | Passive narrative |
| Shield Master | Shove after Attack, bonus to DEX saves | Passive narrative |
| Skulker | Advantage in dim light, miss ≠ reveal | Passive narrative |
| War Caster | Advantage on concentration, somatic with hands full | Passive narrative |
| Bountiful Luck (HA) | Reaction: give halfling racial Lucky to ally | Passive narrative |
| Drow High Magic | 3 free spells 1×/LR | Hardcode FeatureDef OR treat as Spell grant (requires spell infrastructure) |
| Orcish Aggression | Bonus action move + melee attack | Passive narrative |
| Tower of Iron Will (psionic) | Reaction temp HP | Hardcode FeatureDef (charges) |
| Tandem Tactician | Bonus action: Help action | Passive narrative |
| Gift of the Chromatic Dragon | Infusion 1×/LR, reaction resistance | Hardcode FeatureDef for infusion (deferred) |
| Rune Carver Adept | Additional rune | Passive (tied to Rune Knight infrastructure) |
| Vampire Exultation | Recharge mechanic | Hardcode FeatureDef (deferred) |
| **Fighting Style feats** | | |
| Dueling | +2 damage 1H with no off-hand weapon | Passive narrative |
| Great Weapon Fighting | Reroll 1s and 2s on damage dice | Passive narrative |
| Interception | Reaction: reduce damage to ally | Passive narrative |
| Protection | Reaction: impose disadvantage on attacker | Passive narrative |
| Thrown Weapon Fighting | +2 damage, quick draw | Passive narrative |
| Two-Weapon Fighting | Add ability mod to off-hand damage | Passive narrative |
| Unarmed Fighting | 1d6/1d8 unarmed, grapple damage | Passive narrative |

**Hand-curation cost estimate:**
- ~5 feats require active FeatureDef entries (Lucky ×2, Inspiring Leader, and
  optionally Healer/Tower of Iron Will): ~10 lines each = ~50 lines
- ~29 feats are passive narrative: display description as-is in Features tab,
  no game state impact. Zero code per feat.
- ~5 feats require deferred infrastructure (Drow High Magic, Gift of the
  Chromatic Dragon, Rune Carver Adept): skip for now

**The 35 text-only feats do NOT all require hand-curation.** Only those with
trackable charges (Lucky, Inspiring Leader) or HP augmentation (Tough) need
code. The rest render correctly as description text in the Feats section —
passive bonuses the player applies manually during play, same as most
published RPG apps handle it.

**Same problem appears in class/race features.** Dwarven Toughness (+1 HP
per level) is in Aurora class features but has no structural HP data — its
bonus is applied by Aurora's runtime. Halfling racial Lucky is a class
feature entry with description only. Breath Weapon would need FeatureDef
(charges). The pattern of "charges in text, not structure" recurs throughout
the content library. Estimate: ~15–20 class/racial features also need
FeatureDef entries (Breath Weapon, Dwarven Toughness HP, Gnome Cunning,
Hellish Resistance display, etc.). Most are currently handled correctly for
SRD characters already (Lay on Hands, Bardic Inspiration, etc. are
hardcoded in `lib/character/features.ts`).

---

## Pattern Catalog

Seventeen distinct mechanical patterns observed across all sources.
Implementation status is for the **feat context** (class feature status
is often already better since `features.ts` handles many patterns for
class content).

---

### Pattern 1: Fixed Stat Modifier
Direct numeric bonus to a stat. Applies unconditionally.

**Examples across sources:**
- Feat: Alert (+5 initiative), Actor (+1 CHA), Dual Wielder (+1 AC), Mobile (+10 ft all speeds)
- Race: Dragonborn (+2 STR, +1 CHA fixed), most SRD races
- Subrace: Mountain Dwarf (+2 STR, +2 CON)
- Background: None (backgrounds grant proficiencies, not stat mods)

**Stats seen in feat data (107 feats):** ability scores (53 feats), DC
trackers (35), attack bonuses (13), AC (6), speed (9), initiative (1),
passive skills (2), vision ranges, HP-adjacent values

**Infrastructure needed:**
- Apply feat `statModifiers` when feat is active
- Stat derivation pipeline reads from `character.data.activeFeatStats` (derived at render)
- Ability score increases from feats stack with level-up ASI gains
- Speed display reads summed feat speed bonuses
- AC derivation reads `ac:misc` bonuses from feats

**Status:** NOT supported for feats. Class stat mods mostly hardcoded in `features.ts`. Race stat mods applied at creation time (baked into `abilityScores`).

**Slots in:** Character sheet header (ability scores, AC, speed, initiative), Stats tab

---

### Pattern 2: Half-Feat (ASI Sub-choice)
Player picks one or two abilities from a constrained list; feat grants +1 to
each chosen ability plus other effects.

**99 feats total:** 74 two-option (STR or DEX), 25 six-ability (any).

**Key structural fact:** The ability score delta is NOT in `feat.rules.statModifiers`.
It lives on a sub-element (e.g., `ID_PHB_FEAT_ASI_STRENGTH`) that the feat
selects via `choices: [{ kind: "element", type: "Ability Score Improvement" }]`.
We cannot read the delta from the feat's own data — we must apply it
ourselves when the user chooses an ability.

**Implementation approach:**
- Detect half-feat: `feat.choices.some(c => c.type === "Ability Score Improvement")`
- Render ability picker in feat card: show options filtered by `choice.supports` pipe-delimited IDs
  - `supports: "ID_PHB_FEAT_ASI_STRENGTH|ID_PHB_FEAT_ASI_DEXTERITY"` → show STR/DEX buttons
  - `supports: ""` (empty) → show all 6 abilities
- Store chosen ability in `levelChoices[lvl].featChoices.ability`
- Apply +1 delta by writing to `levelChoices[lvl].asi` (existing reversal mechanism handles level-down)

**Status:** NOT supported.

**Slots in:** Level-up panel (sub-choice picker), ability score display

---

### Pattern 3: Direct Proficiency Grant (fixed)
Feature directly grants a specific proficiency — no choice required.

**Examples across sources:**
- Feat: Heavily Armored → heavy armor, Lightly Armored → light armor, Tavern Brawler → improvised weapons
- Background: Folk Hero → Animal Handling + Survival (SRD), Aurora backgrounds grant ~277 proficiency instances via rules.grants
- Race: Dwarf → Dwarven Combat Training (battleaxe, handaxe, light hammer, warhammer), Elf → Elf Weapon Training
- Subrace: Mountain Dwarf → Dwarven Armor Training (light + medium)

**Grant types observed:** Proficiency (armor, weapon, skill, saving throw, tool), Language, Vision

**Infrastructure needed:**
- `character.data.grantedProficiencies: string[]` or derive from levelChoices
- Stats tab skill check reads granted proficiencies
- Armor class derivation reads armor proficiencies
- At character creation: SRD backgrounds already apply skill proficiencies; Aurora backgrounds do via grant resolution

**Status:** Skill proficiencies from SRD backgrounds applied at creation. Feat-granted proficiencies NOT applied. Race weapon training NOT applied (stored in description only).

**Slots in:** Stats tab (skills, saves), combat (armor/weapon use)

---

### Pattern 4: Choice of N Proficiencies
Player picks N items from a filtered pool (skills, tools, weapons, saving throws).

**Examples across sources:**
- Feat: Skilled (3× Skill|Tool), Weapon Master (4× Weapon), Squat Nimbleness (1× Acrobatics or Athletics), Knight of the Sword (1× INT/WIS/CHA save)
- Background: SRD backgrounds give 2 fixed skills (Pattern 3 variant); Aurora backgrounds have 62 proficiency choice nodes
- Race: Half-Elf Skill Versatility (2 any skills — SRD), many Aurora races
- Class: Ranger (3 skills from list at L1), Rogue (4 skills), Bard (3 skills) — handled by creation wizard

**Choice shape:**
```typescript
{ kind: "element", type: "Proficiency", supports: "Skill||Tool", number: 3 }
{ kind: "element", type: "Proficiency", supports: "Skill||Tool", number: 3 }
// OR explicit ID list:
{ supports: "ID_PROFICIENCY_SKILL_ACROBATICS|ID_PROFICIENCY_SKILL_ATHLETICS", number: 1 }
```

The `supports` field filters available proficiency elements. `||` = OR (any from category), `|` = explicit list.

**Infrastructure needed:**
- Proficiency picker UI (multi-select with cap = `number`)
- Map `supports` filter to skill/tool/weapon list (proficiency IDs from `lookupId`)
- Store choices in `levelChoices[lvl].featChoices.skills` or `character.data.proficiencyChoices`
- Stats tab reads chosen proficiencies

**Status:** Background skill choices partially handled at creation wizard. Feat proficiency choices NOT supported.

**Slots in:** Character creation wizard (background, race), level-up panel (class + feat), Stats tab

---

### Pattern 5: Expertise (Double Proficiency)
Player selects a skill they're already proficient in for expertise (×2 bonus).

**Examples across sources:**
- Feat: Skill Expert (1× expertise from proficient skills), Prodigy (1× expertise), Boon of Skill (1× "Skill Expertise")
- Class: Bard (L3: 2×), Rogue (L1: 2×, L6: 2×)

**Infrastructure needed:**
- `character.data.expertiseSkills: string[]` (currently doesn't exist)
- Stats tab skill bonus = proficiency ×2 when skill in expertiseSkills
- Level-up panel expertise picker (filter to already-proficient skills)

**Status:** NOT supported anywhere. Bard and Rogue expertise is not tracked — they show proficient but not expert. This is a pre-existing bug beyond feats.

**Slots in:** Stats tab (skill bonuses), level-up panel

---

### Pattern 6: Language Choice
Player picks N languages.

**Examples across sources:**
- Feat: Linguist (3 any), Prodigy (1 standard/exotic/secret), Divine Communications (2 standard/exotic)
- Background: Most Aurora backgrounds have 66 language choice nodes
- Race: Human (1 extra, SRD), High Elf (1 extra SRD), many Aurora races (226 language choices!)
- Direct grants: Fey Teleportation (Sylvan fixed)

**Infrastructure needed:**
- Language list (Aurora ships language elements; `lookupId` resolves language IDs)
- `character.data.languages: string[]`
- Language picker UI
- Display somewhere (Description tab or Features tab)

**Status:** NOT supported. Languages not tracked at all in `CharacterData`. The SRD `races.ts` has no language field; Aurora language grants are silently dropped.

**Slots in:** Character creation wizard, Description tab display

---

### Pattern 7: Fixed Spell Grant
Feature grants specific always-prepared spells or 1×/LR free casts.

**Examples across sources:**
- Feat: Fey-Touched (Misty Step + 1 divination/enchantment), Shadow-Touched (Invisibility + 1 necromancy/illusion), Telekinetic (Mage Hand), Svirfneblin Magic (4 spells)
- Subclass: All PHB24 subclasses have Subclass Spells — 80 spell grants in Aurora subclass data
- Subrace: Tiefling Infernal Legacy (Thaumaturgy cantrip + leveled spells)
- Background: Some Aurora backgrounds grant spells via rules.grants

**Infrastructure needed:**
- Feat-granted spell pool (separate from class slots; use rules or 1×/LR)
- Spells tab integration (display source label, cast button, slot usage)
- This is a significant infrastructure addition — spells currently come from class spell lists only

**Status:** NOT supported for feats. Subclass spells partially displayed but not integrated into slot tracking.

**Slots in:** Spells tab, potentially Action Bar

---

### Pattern 8: Spell Choice
Player picks spells from a class list or filtered list.

**Examples across sources:**
- Feat: Magic Initiate (2 cantrips + 1 first-level from chosen class), Spell Sniper (1 attack cantrip from any class), Ritual Caster (ritual book from a class), Blessed Warrior (2 cleric cantrips), Druidic Warrior (2 druid cantrips)
- Race: Drow Magic (Darkness, Faerie Fire spells as choices by level)

**Infrastructure needed:**
- Same spell pool infrastructure as Pattern 7
- Spell picker with class filter and level filter
- Store chosen spells in character data

**Status:** NOT supported.

**Slots in:** Character creation wizard (race spell picks), level-up panel, Spells tab

---

### Pattern 9: Sub-element Option Pool
Player selects from a named pool of options that each have their own mechanics.
The feat/feature grants N picks from the pool.

**Examples across sources:**
- Feat: Eldritch Adept (1 Eldritch Invocation), Martial Adept (2 Battle Master maneuvers + 1 superiority die), Metamagic Adept (2 metamagic options), Skill Expert (1 expertise — Pattern 5 variant)
- Class: Eldritch Invocations (Warlock, grows with level), Battle Master maneuvers, Metamagic (Sorcerer), Artificer Infusions (237 option elements)
- Feat: Many UA feats select from Archetype Feature pools

**Choice shape:**
```typescript
{ kind: "element", type: "Archetype Feature", number: 2, supports: "Maneuver,Battle Master" }
{ kind: "element", type: "Class Feature", number: 1, supports: "Eldritch Invocation" }
```

The pool members are Aurora elements that must be fetched from the imported content
(by matching their `supports` field to the choice's `supports` value).

**Infrastructure needed:**
- Option pool fetcher: given `type` and `supports`, return matching Aurora elements
- Option picker UI (searchable list with descriptions)
- Store chosen IDs in `levelChoices[lvl].featChoices.optionIds[]`
- Pool-level effects (maneuvers add superiority dice, invocations modify attacks) — complex
- This is the most infrastructure-intensive pattern

**Status:** NOT supported. Class option pools (invocations, maneuvers) are not surfaced in the level-up panel at all.

**Slots in:** Level-up panel (choice-required class features), Action Bar (superiority dice pool)

---

### Pattern 10: Condition / Resistance Grant
Feature grants damage resistance, immunity, or a special condition.

**Examples across sources:**
- Feat: Infernal Constitution (cold + poison resistance), Ember of the Fire Giant (fire resistance)
- Race: Tiefling (fire resistance), Dwarf (poison resistance — Dwarven Resilience)
- Subrace: Stout Halfling (Stout Resilience = poison resistance + advantage on poison saves)

**Grant type in data:** `{ type: "Condition", id: "ID_INTERNAL_CONDITION_DAMAGE_RESISTANCE_FIRE" }`

**Infrastructure needed:**
- `character.data.damageResistances: string[]`
- Resistances display (combat context, deferred to combat mode or Action Bar)
- Apply at feat grant / character creation

**Status:** NOT supported.

**Slots in:** Action Bar (damage tracking), future Combat Mode

---

### Pattern 11: Charge-Tracked Feature (hardcode required)
Feature grants N uses of an active ability that recharges on rest.
Aurora encodes these as prose only — no structural charge data.

**Examples across sources:**
- Feat: Lucky (3, long rest), Inspiring Leader (1, short rest)
- Race: Breath Weapon (Dragonborn, recharges on short/long rest depending on version)
- Racial trait: Drow Magic (Darkness 1×/LR, Faerie Fire 1×/LR)
- Class: Already hardcoded — Rage, Bardic Inspiration, Channel Divinity, Lay on Hands, Ki, etc.

**Implementation approach:** Add to `lib/character/features.ts` as `FeatureDef` entries.
Detect whether a feat is "active" by scanning `levelChoices`.

**Status:** Supported for class features (hardcoded). NOT supported for feat/racial features.
Lucky, Inspiring Leader, Breath Weapon need manual FeatureDef entries.

**Slots in:** Features tab (pip tracker), Action Bar

---

### Pattern 12: HP Augmentation (scaling or flat)
Feature increases maximum hit points.

**Examples across sources:**
- Feat: Tough (no structural data — `{{tough:hp}}` template; rule = +2 HP × character level), Boon of Fortitude (`statModifiers: [{ stat: "hp", value: 40 }]` — flat)
- Race: Dwarven Toughness (+1 HP per level — no structural data in Aurora; must be hardcoded)
- Race: Dwarven Toughness shows as FeatureEntry with description only

**Key finding:** Tough has zero structural data. Its HP bonus must be derived from the
`sheetText` template variable `{{tough:hp}}` or hardcoded. At render time:
```typescript
const hasTough = activeFeatIds.some(id => id.includes("FEAT_TOUGH"));
const toughBonus = hasTough ? 2 * character.level : 0;
```

**Infrastructure needed:**
- Render-time maxHp augmentation: `displayMaxHp = character.data.maxHp + featHpBonus`
- HP augmentation that scales with level (Tough, Dwarven Toughness) vs flat (Boon of Fortitude)
- Detect HP-granting feats by hardcoded ID OR by `statModifiers.find(m => m.stat === "hp")` for the flat case

**Status:** NOT supported.

**Slots in:** Character sheet header (HP display), level-up panel (HP per level)

---

### Pattern 13: Vision / Sense Grant
Grants darkvision, blindsight, or truesight at a specific range.

**Examples across sources:**
- Feat: Blind Fighting (blindsight 10 ft), Skulker (blindsight range), Boon of Truesight (truesight 60 ft)
- Race: Most non-human races grant darkvision (60 ft), Drow (120 ft Superior Darkvision)
- Subrace: Deep Gnome (120 ft darkvision)

**Data shape:** `grants: [{ type: "Vision", id: "ID_VISION_BLINDSIGHT", name: "Blindsight" }]`
plus `statModifiers: [{ stat: "blindsight:range", value: 10 }]`

**Infrastructure needed:**
- `character.data.senses` (darkvision range, blindsight range, truesight range)
- Display on character sheet (currently not shown anywhere)

**Status:** NOT supported. Vision grants are silently dropped.

**Slots in:** Character sheet header or Stats tab (senses section)

---

### Pattern 14: Speed Modification
Feature changes movement speed.

**Examples across sources:**
- Feat: Mobile (+10 ft all speeds), Speedy (+10 ft), Athlete (climbing/swimming = walking)
- Race: Wood Elf Fleet of Foot (+5 ft, SRD), many Aurora races grant fly/swim/climb speeds
- Subrace: Aurora subraces (90 ASI choices includes some speed variants)

**Stat names in data:** `innate speed:misc`, `innate speed:climb:misc`, `innate speed:fly:misc`, `innate speed:swim:misc`, `innate speed:burrow:misc`, `speed`, `speed:fly`

**Infrastructure needed:**
- Speed derivation pipeline (base 30 ft + feat/racial bonuses)
- Display speed prominently (currently shown in header as static value)
- Separate tracking for non-walking speeds

**Status:** Speed displayed as static 30 ft. Feat/racial speed modifications NOT applied.

**Slots in:** Character sheet header

---

### Pattern 15: Background Feature (narrative)
Named background feature granting narrative benefits (contacts, shelter, etc.).

**Examples across sources:**
- SRD: All 13 backgrounds have a named feature (Shelter of the Faithful, Criminal Contact, etc.) but `featureName` is not populated in the SRD `backgrounds.ts` — 13/13 show `featureName: null`
- Aurora: 109 background feature grants + 93 feature choice nodes across 117 backgrounds

**Status:** SRD background features not displayed anywhere (featureName field empty in SRD data). Aurora background features also not displayed. This is a content gap in `tab-features.tsx` — the Background section shows class/race/skills but never the narrative feature.

**Slots in:** Features tab (Background section)

---

### Pattern 16: List-type Sub-choice (personality, ideals, etc.)
Player picks from an inline list of options — usually flavor text (personality traits, ideals, bonds, flaws, but also non-flavor choices like specialty tables).

**Examples:**
- Backgrounds: 342 list-type choice nodes across 117 Aurora backgrounds (mostly personality/ideals/bonds/flaws)
- Some fighting style selections use list choices

**Infrastructure needed:**
- Display in Description tab or creation wizard flavor step
- Not mechanically impactful for most; skip for Phase 8.5

**Status:** Completely unimplemented. Low priority.

---

### Pattern 17: Feat Feature Sub-grant (complex bundled effects)
Feat grants one or more "Feat Feature" sub-elements, each of which has its
own description and possibly charges or spells.

**Examples:**
- Gift of the Chromatic Dragon (Chromatic Infusion 1×/LR + Reactive Resistance reaction)
- Gift of the Metallic Dragon (Protective Wings + Silver Tongue)
- Adept of the Black/Red/White Robes (multiple Dragonlance-specific features)
- Elemental Adept (element choice + ignores resistance + min-1 on damage dice)

**Status:** The sub-elements ARE in the Aurora class features data (4,083 includes them).
But we have no mechanism to grant them when a feat is picked. They would need to be
fetched by ID from the Aurora content and folded into the active features list.
Complex; deferred.

---

## Cross-Source Pattern Frequency

| Pattern | Feats | Class | Subclass | Race | Subrace | Bg | FS |
|---|---|---|---|---|---|---|---|
| 1. Fixed stat modifier | 107 | many | many | 139 | 79 | 0 | 0 |
| 2. Half-feat / ASI sub-choice | 99 | 0 | 0 | 0 | 90 choices | 0 | 0 |
| 3. Direct proficiency grant | ~15 | many | many | many | many | 277 | 0 |
| 4. Choice of N proficiencies | ~20 | ~8 | 0 | some | some | 62 | 0 |
| 5. Expertise | 3 | 2 (Bard/Rogue) | 0 | 0 | 0 | 0 | 0 |
| 6. Language choice | 3 | 0 | 0 | 226 choices | 5 | 66 | 0 |
| 7. Fixed spell grant | 40 | some | 80 | some | some | some | 0 |
| 8. Spell choice | ~8 | 0 | 0 | some | 0 | 0 | 0 |
| 9. Sub-element option pool | ~6 | many (Invoc, Maneuver, Meta) | some | 0 | 0 | 0 | 0 |
| 10. Condition / resistance | 3 | 0 | some | many | many | 0 | 0 |
| 11. Charge-tracked (hardcode) | 2–5 | many (existing) | some | 3+ | 0 | 0 | 0 |
| 12. HP augmentation | 2 | 0 | 0 | 2 | 0 | 0 | 0 |
| 13. Vision / sense | 3 | 0 | 0 | many | many | 0 | 0 |
| 14. Speed modification | 3 | 0 | 0 | many | some | 0 | 0 |
| 15. Background feature (narrative) | 0 | 0 | 0 | 0 | 0 | 130 | 0 |
| 16. List sub-choice (flavor) | 0 | 0 | 0 | 0 | 0 | 342 | 0 |
| 17. Feat Feature sub-grant | ~10 | 0 | 0 | 0 | 0 | 0 | 0 |

---

## "Hardcoded Forever" Assessment

How much of D&D content will require hand-curation permanently?

**Conclusion: not much.** The ~35 text-only feats split into:

- **~5 feats need FeatureDef entries** (Lucky ×2, Inspiring Leader, optionally Healer).
  Cost: ~50 lines of TypeScript, maintained forever but rarely changes.
- **~30 feats are passive narrative** — render description text, no game state.
  Cost: zero per feat.

The larger hand-curation burden is the **65 missing SRD class feature descriptions**:
- 5 of the 0-described classes × ~3–10 features each = ~28 features with zero description
  even with Aurora fallback
- The 28 genuinely missing features include generic placeholders (Ranger Archetype Feature,
  Roguish Archetype Feature, etc.) — 1 description entry per placeholder covers all occurrences
  → actual unique entries needed is closer to 15–20

**Real hand-curation cost for Phase 8.5:**
| Task | Entries | Effort |
|---|---|---|
| Lucky FeatureDef | 2 (PHB + PHB24) | 1 hour |
| Inspiring Leader FeatureDef | 1 | 30 min |
| Tough HP augmentation (code) | n/a | 1–2 hours |
| Remaining SRD class descriptions (Bug 2) | ~50 entries | 2–3 hours |
| Breath Weapon FeatureDef | 1 | 30 min |
| Dwarven Toughness HP augmentation | code extension | 1 hour |

Beyond this, Aurora's featureMap covers the remaining PHB24/supplement content
through the existing fallback. The app is NOT condemned to hand-curating 320+ feats —
most resolve via Aurora text or are passive.

---

## Phase 8.5 Recommendations

**Recommended build order by patterns-unlocked per infrastructure-dollar:**

### Tier 1: High value, low infrastructure
Patterns that unlock many feats and already have near-complete infrastructure:

1. **Feat picker UI + storage** — the shell that makes any feat selectable.
   Unlocks 320 feats for display (Feats section, level-up toggle).
   All feats show descriptions regardless of mechanical support.

2. **Pattern 2: Half-feat ASI sub-choice** — 99 feats.
   Reuses existing `levelChoices[lvl].asi` mechanism entirely.
   New code: ability sub-choice picker (10–20 lines of UI), detection logic.
   Unlocks Resilient, Athlete, Lightly/Moderately/Heavily Armored, 95 more.

3. **Pattern 12: HP augmentation (Tough + Dwarven Toughness)** — 2 feats.
   Code change: render-time maxHp + toughBonus. Detect by feat ID.
   Small; high visibility (Tough is extremely popular).

4. **Pattern 11: Lucky + Inspiring Leader FeatureDefs** — 2–3 feats.
   Copy existing FeatureDef pattern from features.ts. 15 lines.
   High visibility (Lucky is in top 5 most-picked feats).

5. **Pattern 1: Apply feat static statModifiers** — 107 feats, many partial effects.
   Wire ability score and AC stat mods to character display.
   Exclude weapon-specific attack mods (Action Bar scope), DC mods, vision ranges.
   Unlocks Alert, Actor, Dual Wielder, Mobile, and ~100 more stat changes.

### Tier 2: Medium value, medium infrastructure

6. **Pattern 3: Feat direct proficiency grants** — ~15 feats.
   Add `grantedProficiencies` tracking; Stats tab reads it.
   Required by Heavily Armored, Lightly Armored, Weapon Master.

7. **Pattern 4: Feat proficiency choices** — ~20 feats.
   Proficiency picker in feat card.
   Required by Skilled (most-picked skill feat), Weapon Master.

8. **Pattern 5: Expertise tracking** — 3 feats + Bard/Rogue class features.
   New field `expertiseSkills` in CharacterData.
   Required to fix existing Bard/Rogue bug; feat just adds Skill Expert.

9. **Feat-granted proficiency on Stats tab** — display impact of Patterns 3+4.

### Tier 3: Requires new infrastructure (deferred beyond Phase 8.5)

10. **Pattern 7+8: Spell grants/choices** — 40+ feats.
    Requires feat-granted spell pool in Spells tab. Significant feature.

11. **Pattern 9: Sub-element option pools** — 6 feats, many class features.
    Requires option pool picker, supports-filter logic, pool element fetching.
    Warlock Invocations, Battle Master maneuvers also depend on this.

12. **Pattern 6: Languages** — pervasive (races + backgrounds especially).
    Needs language field in CharacterData; display somewhere.
    Low game-state impact; can defer indefinitely.

13. **Pattern 14: Speed modifications** — 3 feats, many races.
    Needs speed derivation pipeline. Medium effort, low session urgency.

14. **Pattern 10: Conditions/resistances** — 3 feats.
    Relevant mainly in combat; defer to Combat Mode design.

15. **Pattern 13: Vision/senses** — 3 feats, many races.
    Cosmetic outside combat; low priority.

### Feat picker: what to show vs hide

Given partial support, recommend:
- **All feats selectable** — picking a feat always works
- **"Fully applied" badge** on feats where all effects are computed (Tough, Lucky, Resilient, etc.)
- **No badge / grey indicator** on feats where effects are informational only (War Caster, Charger)
- **Never hide feats** — users need to track what they picked even if the app can't compute all effects

---

## Summary Table

| Pattern | Feats affected | Other sources | Status | Phase 8.5 priority |
|---|---|---|---|---|
| 1. Fixed stat modifier | 107 | Races, subraces | ✗ Not supported | High (partial) |
| 2. Half-feat ASI sub-choice | 99 | Subraces (90) | ✗ Not supported | **Critical** |
| 3. Direct proficiency grant | ~15 | Races, backgrounds (277) | Partial (bg skills only) | High |
| 4. Choice of N proficiencies | ~20 | Backgrounds, races | Partial (bg creation only) | High |
| 5. Expertise | 3 | Bard, Rogue class | ✗ Bug in class too | Medium |
| 6. Language choice | 3 | Races (226!), backgrounds | ✗ Not supported | Low |
| 7. Fixed spell grant | 40 | Subclasses (80), races | ✗ Not supported | Deferred |
| 8. Spell choice | ~8 | Races | ✗ Not supported | Deferred |
| 9. Sub-element option pool | 6 | Class (520+ options) | ✗ Not supported | Deferred (complex) |
| 10. Condition/resistance | 3 | Races, subraces | ✗ Not supported | Deferred (combat) |
| 11. Charge-tracked (hardcode) | 2–5 | Races (Breath Weapon) | ✓ For class only | High (Lucky, Tough) |
| 12. HP augmentation | 2 | Races (Dwarven Toughness) | ✗ Not supported | **Critical** (Tough) |
| 13. Vision/sense | 3 | Races (many) | ✗ Not supported | Deferred |
| 14. Speed modification | 3 | Races (many) | ✗ Not supported | Low-Medium |
| 15. Background feature | 0 | All backgrounds | ✗ Not surfaced | Low |
| 16. List sub-choice (flavor) | 0 | Backgrounds (342) | ✗ Not supported | Deferred |
| 17. Feat Feature sub-grant | ~10 | 0 | ✗ Not supported | Deferred |

---

## Open Questions

1. **Resilient saving throw proficiency** — the save proficiency on Resilient
   comes from the sub-element, not the feat's grants. How are saving throw
   proficiencies currently tracked on the Stats tab? That determines whether
   Resilient's save component can ship in Phase 8.5 or needs separate work.

2. **PHB24 Fighting Style feats** — 6 PHB24 feats are fighting styles (Archery,
   Defense, Dueling, etc.). They have the same IDs as the fighting style
   elements but are typed as feats. Should they be treated as feats in the
   picker (and apply via the existing fighting style pipeline), or as a
   separate case?

3. **Aurora fallback for PHB24 class descriptions** — the `descByNameLower`
   pipeline is already live. How many of the 65 missing SRD descriptions are
   effectively covered for PHB24 characters vs SRD characters? Audit shows
   36/65 have Aurora coverage, 28 are still blank for everyone — priority is
   those 28.

---

## Files

| File | Contents |
|---|---|
| `docs/feat-audit.json` | Original 320-feat data (user-provided) |
| `docs/content-audit-feats.json` | Feats with full rules data |
| `docs/content-audit-class-features.json` | 4,083 Aurora ClassFeature elements |
| `docs/content-audit-srd-classes.json` | 12 SRD classes with featuresByLevel + featureDescriptions |
| `docs/content-audit-subclasses.json` | 312 subclasses (SRD + Aurora) |
| `docs/content-audit-races.json` | 148 races (SRD + Aurora) |
| `docs/content-audit-subraces.json` | 79 Aurora subraces |
| `docs/content-audit-backgrounds.json` | 130 backgrounds (SRD + Aurora) |
| `docs/content-audit-fighting-styles.json` | 22 fighting styles (SRD + Aurora) |
| `app/api/dev/content-audit/route.ts` | Dev endpoint that writes the above — delete after audit |
| `app/api/dev/feat-audit/route.ts` | Earlier dev endpoint — also delete |
