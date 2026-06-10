# Known Issues from Testing — Consolidated
Generated 2026-06-10. Sources: Barbarian L1-20 pass + class passes (Bard, Cleric, Druid, Fighter, Monk, Paladin, Ranger, Rogue, Sorcerer, Warlock, Wizard).
Coverage: 11 of 13 planned combos. Deferred: Tabaxi Artificer, Changeling Blood Hunter (Aurora-only; spot-check during data-layer implementation). Feats and subclass deep-audit intentionally out of scope per testing plan.

Organizing principle: findings are grouped by MISSING SYSTEM, not by class. Most bugs are instances of three absent systems (choices, effects, resources). Fixing instances one-off is rejected; these tables are the requirements list for the feature data layer design doc (forthcoming).

## 1. Missing system: feature-granted CHOICES
No generic mechanism for "this feature asks the player to pick something." Fighting Style and ASI/Feat have bespoke pickers; everything else fails silently.

| Feature | Source | Shape |
|---|---|---|
| Weapon Mastery | Barb/Fighter/Paladin/Ranger/Rogue L1 | pick N weapon types; N from class table; re-pickable after long rest |
| Primal Knowledge | Barbarian L3 | pick 1 skill from class list |
| Expertise | Rogue L1/L6, Bard L2/L9, Ranger L9 | pick N proficient skills |
| Deft Explorer | Ranger L2 | pick 1 skill (expertise) + 2 languages |
| Scholar | Wizard L2 | pick 1 skill from fixed list, gain expertise |
| Divine Order / Primal Order | Cleric L1 / Druid L1 | pick 1 of 2 modes |
| Blessed Strikes / Elemental Fury | Cleric L7 / Druid L7 | pick 1 of 2; Improved version (L14/L15) inherits the pick |
| Metamagic | Sorcerer L2/10/17 | pick 2 (+2, +2); replace one on level-up |
| Eldritch Invocations | Warlock L1+ | count by table; prerequisites; replace on level-up |
| Mystic Arcanum | Warlock L11/13/15/17 | pick 1 spell of given level, each 1/LR |
| Epic Boon | all classes L19 | feat pick filtered to Epic Boon category (reuse feat picker) |
| Thieves' Cant | Rogue L1 | +1 language choice |
| Draconic Ancestry | Dragonborn | pick 1; drives Breath Weapon damage type + Resistance |
| Giant Ancestry | Goliath | pick 1 of 6 boons |
| Skillful + Versatile | Human | pick 1 skill + 1 Origin feat |
| Elven / Gnomish Lineage | Elf / Gnome | pick lineage; grants cantrips/spells by character level |
| Tiefling Legacy | Tiefling | pick 1 of 3 (content also incomplete — see section 6) |

Creation-wizard implication: L1 choices must surface during character creation, not just level-up (Divine Order, Weapon Mastery, Expertise, race choices all skipped in creation today).

## 2. Missing system: feature EFFECTS on derived stats
Features render as text but never feed deriveStats. Existing hardcodes (Tough, Alert, Remarkable Athlete) don't scale.

| Feature | Should change |
|---|---|
| Defense fighting style | +1 AC while wearing armor (confirmed twice: Fighter breastplate, Paladin) |
| Fast Movement (Barb L5) | +10 speed unless heavy armor |
| Roving (Ranger L6) | +10 speed unless heavy armor; climb + swim speed |
| Primal Champion (Barb L20) | STR/CON +4, max 25 |
| Body and Mind (Monk L20) | DEX/WIS +4, max 25 |
| Gnomish Cunning | advantage on INT/WIS/CHA saves (marker) |
| Powerful Build / Large Form (Goliath) | advantage markers, carry capacity; Large Form is 1/LR resource |
| Dragonborn traits | resistance by ancestry, darkvision 60, Breath Weapon (PB uses/LR, scaling d10), Draconic Flight at L5 (1/LR) |
| Orc traits | Adrenaline Rush (PB uses/SR, temp HP), darkvision 120, Relentless Endurance 1/LR |
| Resourceful (Human) | Heroic Inspiration on long rest (new tracked state) |
| Dexterous Attacks (Monk) | DEX for monk-weapon/unarmed attack + damage |
| Disciplined Survivor (Monk L14) | proficiency in all saving throws |
| Aura of Courage (Paladin L10) | Frightened immunity (display) |
| Feral Senses (Ranger L18) | Blindsight 30 (senses display) |
| Foe Slayer (Ranger L20) | Hunter's Mark die d6 -> d10 |

## 3. Missing system: RESOURCE types beyond simple charges
Current support: flat per-rest charges (Rage, Channel Divinity) and Ki points. Observed shapes that don't fit:

| Shape | Instances |
|---|---|
| Derived-count uses | Bardic Inspiration = CHA mod (currently stuck at 1); Tireless, Nature's Veil = WIS mod; Adrenaline Rush, Breath Weapon = prof bonus |
| Numerical pool, variable spend | Lay on Hands = 5 x paladin level |
| Points with conversion | Sorcery Points <-> spell slots (Font of Magic) — absent entirely |
| Nonstandard slots | Pact Magic: N same-level slots, short-rest recharge — absent entirely |
| Per-tier one-shots | Mystic Arcanum 6/7/8/9, each 1/LR |
| Binary token | Heroic Inspiration |
| Dice pool (anticipate) | Superiority dice (Tier 3 deferred) |

Also: Innate Sorcery (2/LR) not shown anywhere; Celestial Revelation 1/LR.

## 4. Always-prepared spells at CLASS level
Subclass-granted (domain/oath, 8.6-E) WORKS. Class-granted equivalents do not:
- Divine Smite (Paladin L2), Find Steed (Paladin L5)
- Hunter's Mark (Ranger L1) + free casts scaling by table
- Power Word Heal / Power Word Kill (Bard L20, Words of Creation)
Race-granted spells/cantrips also absent: High Elf lineage cantrips and spells (Prestidigitation, Detect Magic at L3, Misty Step at L5), Gnomish lineage equivalents.

## 5. Missing display surfaces
- Resistances/immunities: not shown or tracked anywhere (suggest top bar near conditions)
- Advantage/disadvantage markers: none exist
- Senses card: add passive investigation, passive insight, darkvision/blindsight ranges; remove passive perception from top bar
- Tools in proficiencies (confirmed); Monk martial-light weapons missing from weapons line
- Languages: Druidic, Thieves' Cant never shown; language choices not surfaced
- Scaling values need a visible home: Martial Arts die, Sneak Attack die, Rage damage bonus
- Heroic Inspiration token
- Death saves replace HP counter at 0 HP (Phase 9)
- Short/Long rest to top bar; combat stats top bar only; Conditions out of Extras (Phase 9)

## 6. PHB24 content routing gaps — DIAGNOSTIC NEEDED, NO FIX YET
- No PHB24 cleric domains offered (SRD versions + other sourcebooks appear)
- Fighting Style picker shows SRD/TCoE/UAWA only, no PHB24 styles (PHB24 styles are feats; picker likely reads SRD fighting-styles list only)
- Tiefling legacies: Abyssal present; Chthonic and Infernal absent
- Verify Rage (and PHB24 class features generally) description is sourced from Aurora import, not hardcoded SRD text
- Verify Aurora Battle Master description IDs (pre-existing 8.6 follow-up)

## 7. Feature grouping (design input)
Child features should nest under parents (recurring tester request):
- Restoring Touch -> Lay on Hands; Aura Expansion -> Aura of Protection
- Relentless Rage -> Rage; Brutal Strike -> Reckless Attack; Improved Brutal Strike -> Brutal Strike
- Improved Blessed Strikes -> Blessed Strikes; Improved Elemental Fury -> Elemental Fury
- Ki/Focus features (Flurry of Blows, Patient Defense, Step of the Wind, Heightened Focus) grouped under the Ki block in Actions
Schema implication: parentFeatureId / augments semantics.

## 8. Phase 8.7 (creation) inputs from this round
- PHB24 official order: Class -> Background -> Species -> Abilities. Version selector routes step order. (Updates earlier sketch that had Species before Background.)
- L1 class/race choices surface in creation (see section 1)
- First spells chosen at creation for casters
- Background parts (3 ability scores, Origin feat, 2 skills, tool, equipment-or-50gp) confirmed missing across every background tested

## 9. Strays not covered above
- Magical Secrets (Bard L10): no functionality; spell-system design question
- Ritual Adept (Wizard L1) missing; spellbook mechanics (Memorize Spell, Spell Mastery, Signature Spells) are spell-system scope
- Channel Divinity description thin (SRD text vs PHB24) — content quality, ties to section 6 verification
- Sneak Attack / Cunning Action / Steady Aim / Cunning Strike / Uncanny Dodge / Evasion need Actions-tab representation (Phase 9)
