# Phase 7: Level Up

Design notes only. DO NOT BUILD until Phase 6C is complete and Phase 7 is explicitly started.

---

## Goal

Give players a guided level-up flow for existing characters, surfacing all choices that unlock at a given level: subclass, Ability Score Improvement vs. feat, spell choices, subclass options, etc.

---

## Core design decisions

### Any level, not just +1

The flow should let the user pick **any target level (1–20)**, not just increment by one. This supports:
- First-time setup (starting at level 3 mid-campaign)
- Retroactive corrections (missed a choice at level 4)
- Planning / theory-crafting

If the character's current level is 5 and the user picks level 8, the flow shows all choices for levels 6, 7, and 8 in sequence (one step per level).

### Surface choices per level

For each level in the range, surface:
| Choice type | Condition | Notes |
|---|---|---|
| Subclass selection | `subclassUnlockLevel` matches level | Wizard at 2, Cleric at 1, etc. |
| ASI vs. Feat | Even fighter levels; levels 4, 8, 12, 16, 19 for most classes | Skip if already chosen |
| Spells known / prepared | Spellcasting class, appropriate level | Full casters: prepared list; known casters: add 1 |
| Subclass options | Archetype features at specific levels | e.g. Domain spell at Cleric levels 1/3/5/7/9 |
| Hit Points | Roll or take average | Roll = `1dX`, average = `floor(X/2)+1` |

### Show gains per level

Display a summary panel at each level step showing what changes:
- Hit points gained (formula shown)
- New class features (name + one-line description)
- New spell slots table (if spellcaster)
- Proficiency bonus change (if it increases at that level)

### Atomic transaction

All level-up choices (across potentially multiple levels) commit in a single DB write at the end of the flow. No partial saves. If the user navigates away mid-flow, choices are discarded.

### Level-down support

The "Set level" option should also allow going DOWN (e.g., correcting a mistake). Level-down:
- Resets all choices made at levels above the target
- Recalculates HP, spell slots, features
- Does NOT remove equipment or gold

### Preserve earlier choices

Choices made at level N are not re-shown when leveling from N to M (M > N). The flow only shows NEW choices in the [current+1, target] range. Already-made choices (subclass ID, ASI assignments) are locked and displayed as read-only summaries.

---

## UI sketch

```
Level Up: Wizard level 3 → 7

[Step 1: Level 4]          [Step 2: Level 5]          [Step 3: Level 6]    ...
 ASI or Feat?               New feature: Arcane         Arcane Tradition
 ○ +2 to one ability         Recovery                    Feature: ...
 ○ +1/+1 to two             (automatic, no choice)
 ○ Choose a feat

[Gains at level 4]         [Gains at level 5]
 +6 HP (avg) or roll d6    +7 HP (avg) or roll d6
 +1 spell slot (3rd)        +1 3rd-level slot
 Proficiency bonus: 2→2    Proficiency bonus: 2→3
```

---

## Implementation notes

- Extend wizard-store pattern: create a `levelUpStore` (Zustand) with the same step-navigation idiom.
- Reuse SRD class tables (spell slots, proficiency bonus by level) that need to be defined in `lib/content/srd/classes.ts` as level tables.
- `createCharacter` action → new `levelUpCharacter` server action that takes `{ characterId, targetLevel, choices }`.
- Feature display can reuse `featureMap` from the character page (already loaded for the sheet).
- Feat selection: introduce `SrdFeat` type and populate from Aurora `FeatElement[]` (already fetched).

---

## What Phase 7 is NOT

- Not a full character editor (that's later)
- Not multi-classing (out of scope for now)
- Not spell slot management (that's the existing HP/resource tracker)
