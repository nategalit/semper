# Semper — Project Status
Last updated: 2026-06-04

---

## Current State

**Phase:** 8 — Level Up flow (late-stage, Fighting Style pipeline in progress)

**Latest commit:** `6493364` — Phase 8 Chunk 1f: subclass feature progression rendering
- Champion subclass now shows level-keyed feature list with descriptions (matching Class Progression format)
- `SrdSubclass` type gained `featuresByLevel?: Record<number, string[]>`

**Actively in progress:** Phase 8 Chunk 3 — Fighting Style choice surface
- 3a ✅ SRD 6 styles confirmed; Aurora data shape investigated
- 3b ✅ Schema + parser pipeline: `ClassFeatureElement.supports` captured; `ImportedContent.fightingStyles[]` stored at sync time; `getEnabledFightingStyles()` getter added
- 3c ⏳ Storage — ensure `levelChoices[N].fightingStyle` persists correctly through level-up confirm
- 3d ⏳ Server action — `levelUpCharacter` writes fightingStyle on level-up; `levelDownCharacter` clears `levelChoices[N].fightingStyle` for every level being unwound (same pattern as ASI delta reversal)
- 3e ⏳ Fighter L1 wizard step — "Class Features" step surfaces merged SRD + Aurora Fighting Style picker with source chips
- 3f ⏳ Render — chosen Fighting Style visible on Features tab

**Blocked:** Nothing hard-blocked.
- **⚠ Aurora re-sync required before testing 3b.** Existing DB rows were stored before the `fightingStyles` key existed. Re-sync your content source (Settings → Content → Sync) so Aurora Fighting Styles populate into `fightingStyles[]`.

---

## What's Next

1. **Phase 8 / Chunk 3c** — Storage: verify `levelChoices[N].fightingStyle` writes and reads correctly end-to-end (level-up-panel → `levelUpCharacter` → DB → character page).
   - Prereq: none (3b already landed)

2. **Phase 8 / Chunk 3d** — Server action: add level-DOWN clearing of `fightingStyle` for every unwound level. `levelDownCharacter` must wipe `levelChoices[N].fightingStyle` the same way it reverses ASI deltas, so a Paladin who reaches L2, drops to L1, and re-levels doesn't retain a phantom style.
   - Prereq: 3c verified

3. **Phase 8 / Chunk 3e** — Fighter L1 wizard step: add a "Class Features" screen to the level-up flow that shows the Fighting Style picker (merged SRD + Aurora entries, with source chips) for any level where a class grants a style pick.
   - Prereq: 3d done; Aurora re-synced

---

## What I Can Test Independently

| Flow | What to check |
|---|---|
| Character creation | Full wizard: race → class → background → subrace → stats → name. Verify PHB24 martials (Barbarian, Bard, Fighter, Monk, Rogue) appear alongside SRD classes. |
| Level Up — basic | Open any character → Features tab → "Tap to level up or down" → change level. Verify HP, spell slots, proficiency bonus update. |
| Level Up — subclass | Level a Wizard to 2. Confirm subclass picker appears. Pick a subclass. Confirm it shows on Features tab with feature list. |
| Level Up — Champion | Level a Fighter to 3+. After picking Champion subclass, confirm Features tab shows level-keyed list (Improved Critical at 3, Remarkable Athlete at 7, etc.) with descriptions — not pill badges. |
| Level Up — Fighting Style (Paladin) | Level a Paladin to 2. Confirm the Fighting Style picker appears with 6 card-button options. Pick one. Confirm level can be set back to 1 and then re-leveled to 2 with a fresh pick. *(3b landed — re-sync Aurora first to get TCE styles in the picker)* |
| Level Up — Fighting Style (Fighter) | Level a Fighter from 0 to 1. Confirm Fighting Style picker appears at L1 (blocked until 3e lands). |
| Features tab | Open any character with a class. Confirm "Class Progression" section shows features with level numbers and descriptions. |
| Class description | Verify Class section in Features tab shows class description HTML. Known issue: H4/H5 headings may visually overlap (deferred to Phase 10). |

---

## Roadmap

| Phase | Status | Summary |
|---|---|---|
| 1 — Content package | ✅ Done | Schema, SRD loader, Aurora XML parser, 41 vitest tests |
| 2 — Auth + character CRUD | ✅ Done | Supabase setup, magic-link auth, character table + RLS, server actions |
| 3 — Character creation wizard | ✅ Done | Race/subrace, class, background, ability scores, name; multi-step with validation |
| 4 — Character sheet (read) | ✅ Done | Stats, saves, skills, HP, spell slots, equipment, spells, features tabs |
| 5 — Sheet interactivity | ✅ Done | HP tracking, spell slot use, short/long rest, conditions, feature charges, dice roller |
| 6 — Content import UI | ✅ Done | Aurora source management, per-book toggle, sync, dedup (SRD vs PHB24) |
| 7 — PWA polish | ✅ Done | Offline support, install prompt, manifest, service worker |
| 8 — Level Up flow | 🔄 In progress | Guided level-up/down panel; subclass picker; Fighting Style picker (3c-3f remaining) |
| 9 — Action bar | ⏳ Queued | BG3-style unified action/resource bar (design doc: `docs/phase-8-action-bar.md`) |
| 10 — Polish pass | ⏳ Queued | Performance (AC recalc lag, content re-fetch), CSS bugs (class description heading overlap), optimistic updates via `useOptimistic` |
| 11 | ⏳ TBD | Not yet specified |
| 12 | ⏳ TBD | Not yet specified |
| — | ⏳ Post-Phase 8 | **Class completeness audit** — survey which SRD/PHB24 classes have complete feature data vs gaps; produce `docs/class-completeness-audit.md` |
| — | ⏳ Future | **Combat Mode design doc** — `docs/combat-mode-design.md` (concept stage only) |

---

## Known Issues

### Class description heading overlap
**Status:** Parked — deferred to Phase 10 polish
**Symptom:** H4/H5 headings in PHB24 class descriptions (Cleric, Sorcerer, Fighter, Wizard, others) visually overlap with the text immediately below. Race and background descriptions render correctly with the same `.aurora-content` CSS, so the bug is class-HTML-specific.
**Attempted fixes:** margin CSS adjustments, cleaning orphaned `</div>` tags — all insufficient.
**Hypothesis:** Something in class HTML structure (deeper table nesting, unclosed tags, parent overflow context) interacts with CSS in a way race/background HTML doesn't.
**To fix:** Open DevTools on a broken heading, inspect computed styles + DOM ancestry, identify structural cause, fix at root.

---

### Slow AC recalc on equip/unequip
**Status:** Tech debt — deferred to Phase 10 polish
**Symptom:** After clicking equip/unequip on armor or shield, the AC stat in the header updates 2–3 seconds later. Calculation is correct; propagation is slow.
**Cause (likely):** Same family as create-character lag and equipment manager first-open lag — content/character re-fetch on every mutation instead of optimistic local update of derived stats.
**To fix (Phase 10):** Audit all derived-stat recomputes for optimistic-vs-server-roundtrip; consider unifying via React 19's `useOptimistic` on `CharacterMutationContext` for all stat-affecting actions. Also revisit `unstable_cache` for `getEnabledItems/Features/Spells`.

---

### PHB24 classes missing from class picker (resolved)
**Status:** Fixed in commit `af6b1a3`
Barbarian, Bard, Fighter, Monk, Rogue appeared SRD-only when Aurora (PHB24) was synced, because the dedup fingerprint matched same-named classes from different editions. Fixed by adding `DISTINCT_FROM_SRD` set that bypasses Case A dedup for PHB24/DMG24 sources.

---

### Class Progression not rendering for pre-Phase-8 characters (resolved)
**Status:** Fixed in commit `af6b1a3`
`resolvedClass` stored at character-creation time lacked `featuresByLevel`. The `??` operator short-circuits when the object is truthy-but-incomplete. Fixed by patching specific fields from live `SRD_CLASSES` data instead of falling through the whole object.

---

## Design Docs Index

| Doc | Status | Notes |
|---|---|---|
| `docs/level-up-phase.md` | Mostly built | Original Phase 8 design reference; level-up/down flow, choices, HP rolling |
| `docs/phase-8-action-bar.md` | Design only | Phase 9 target; BG3-style unified action/resource bar |
| `docs/combat-mode-design.md` | Not created | Future feature concept; create when design work begins |
| `docs/class-completeness-audit.md` | Not created | Post-Phase 8; survey class feature data coverage across all SRD/PHB24 classes |
| `docs/project-status.md` | This file | Living tracker; updated at end of each working session |
