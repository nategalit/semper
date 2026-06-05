# Feature Spec: "Use Recommended" Button in Abilities Step

**Status:** Deferred — Phase 10 or later  
**Origin:** Block 1–9 test session, 2026-06-05

---

## Summary

Add a "Use Recommended" button to the Abilities step in the character creation wizard. The button auto-fills the Standard Array (or Point Buy distribution) using a class-specific stat priority order, so new players don't have to figure out optimal stat allocation from scratch.

---

## Behavior

- Button label: **"Use Recommended"** (or "Auto-fill")
- Appears below the method selector (Standard Array / Point Buy), before the ability grid
- When tapped:
  - Standard Array mode: assigns the 6 values (15, 14, 13, 12, 10, 8) to abilities in the class priority order
  - Point Buy mode: allocates 27 points following the same priority order (e.g. pump primary to 15, secondary to 14, dump CHA/INT last)
- After auto-fill, the user can still manually adjust individual scores
- Provide a **"Reset"** option (button or link) that clears all assignments back to blank so the user can start manual allocation

---

## Stat Priority by Class

*(Fill in the user's full per-class priority list here when implementing)*

| Class | Primary | Secondary | Tertiary | Dump stats |
|-------|---------|-----------|----------|------------|
| Barbarian | STR | CON | DEX | INT, CHA, WIS |
| Bard | CHA | DEX | CON | STR, INT |
| Cleric | WIS | CON | STR | DEX, INT, CHA |
| Druid | WIS | CON | DEX | STR, CHA, INT |
| Fighter | STR or DEX | CON | … | … |
| Monk | DEX | WIS | CON | STR, CHA, INT |
| Paladin | STR | CHA | CON | DEX, INT |
| Ranger | DEX | WIS | CON | STR, CHA, INT |
| Rogue | DEX | CHA | CON | STR, WIS, INT |
| Sorcerer | CHA | CON | DEX | STR, WIS, INT |
| Warlock | CHA | CON | DEX | STR, WIS, INT |
| Wizard | INT | CON | DEX | STR, CHA, WIS |

*Populate from user's full priority list before implementing.*

---

## Implementation Notes

- Read `classId` from wizard store to look up the priority
- Standard Array assignment: map sorted priority positions to STANDARD_ARRAY values `[15, 14, 13, 12, 10, 8]`
- Point Buy assignment: greedy fill — pump abilities in priority order up to 15, spending budget optimally
- Reset: call `setAbilityMethod(currentMethod)` which already resets scores + assignments to blank defaults (see `wizard-store.ts`)
- PHB24 variant classes share the same priority as their SRD counterpart

---

## Open Questions

- Do we show recommended for *all* classes or only the 12 SRD classes?
- Fighter: STR vs DEX build — show both options, or pick one?
- Should the button be hidden when using Point Buy (harder to meaningfully auto-fill) or support both?
