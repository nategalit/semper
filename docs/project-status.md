# Semper — Project Status
Last updated: 2026-06-05

---

## Current State

**Phase:** 8 — Level Up flow (Fighting Style pipeline complete)

**Latest commits (this session):**
- `91eb18a` — Fix: thread importedFightingStyles into LevelUpPanel (Aurora styles missing from Paladin level-up)
- `2bef72a` — Phase 8 3f: Fighting Style on features tab + wizard reset + HTML strip
- Prior: TCE routing fix (`cf.supports?.split(",")[0].trim()`), 3b–3e chunks

**Phase 8 Chunk 3 — Fighting Style choice surface: ALL DONE**
- 3a ✅ SRD 6 styles confirmed; Aurora data shape investigated
- 3b ✅ Schema + parser: `ClassFeatureElement.supports` captured; `fightingStyles[]` stored at sync time; `getEnabledFightingStyles()` getter
- 3c ✅ Storage: `levelChoices[N].fightingStyle` persists correctly through level-up confirm
- 3d ✅ Server action: `levelUpCharacter` writes fightingStyle; `levelDownCharacter` clears it for every unwound level
- 3e ✅ Fighter L1 wizard step: "Class Features" step with merged SRD + Aurora picker, source chips
- 3f ✅ Features tab: chosen Fighting Style rendered in dedicated card with source chip and HTML-stripped description
- Hotfix ✅ Wizard store resets on mount (stale state after character creation fixed)
- Hotfix ✅ Aurora description HTML (`<p>` tags) stripped in wizard picker and Features tab
- Hotfix ✅ Level-up panel: Aurora Fighting Styles now appear for Paladin (and Ranger); source chips + HTML strip applied

**Blocked:** Nothing hard-blocked.

---

## What's Next

1. **Phase 8 / Chunk 2** — Fallen Aasimar subrace HTML rendering  
   Aurora subrace descriptions (e.g. Fallen Aasimar) contain HTML that renders as raw tags in the Features tab subrace section. Same `stripHtml` or `cleanHtml` treatment needed.

2. **Phase 9 — Action bar**  
   BG3-style unified action/resource bar. Design doc: `docs/phase-8-action-bar.md`. Not started.

3. **Phase 10 — Polish pass**  
   - AC recalc lag on equip/unequip (optimistic update audit)
   - H4/H5 heading overlap in PHB24 class descriptions
   - `unstable_cache` for content getters

---

## What I Can Test Independently

| Flow | What to check |
|---|---|
| Character creation | Full wizard: race → class → background → subrace → stats → name. Verify PHB24 martials appear. |
| Character creation — Fighting Style (Fighter L1) | Create a Fighter. Confirm "Class Features" step appears with merged SRD + Aurora styles and source chips. Pick one. Confirm it shows on Features tab after creation. |
| Character creation — re-entry | Hit "Create character", then navigate back to /characters/new. Confirm wizard starts at step 1 with blank state (not pre-filled from prior character). |
| Level Up — basic | Open any character → Features tab → "Tap to level up or down" → change level. Verify HP, spell slots, proficiency bonus update. |
| Level Up — subclass | Level a Wizard to 2. Confirm subclass picker appears. Pick a subclass. Confirm it shows on Features tab. |
| Level Up — Fighting Style (Paladin L2) | Level a Paladin to 2. Confirm Fighting Style picker shows **both** SRD styles and Aurora extras (e.g. TCE: Blind Fighting, Interception, etc.) with source chips. Pick one. Confirm it appears on Features tab. |
| Level Up — Fighting Style (Ranger L2) | Same as Paladin. |
| Level Up — Fighting Style down | Level Paladin to 2, pick style, level back to 1, re-level to 2. Confirm fresh pick is required (prior choice cleared). |
| Features tab | Open any character. Confirm "Class Progression" section shows features with level numbers and descriptions. |
| Features tab — Fighting Style | Open Fighter/Paladin/Ranger with a style set. Confirm "Fighting Style" card shows name + plain-text description + source chip. |

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
| 8 — Level Up flow | ✅ Done | Guided level-up/down panel; subclass picker; Fighting Style picker (SRD + Aurora, wizard + level-up) |
| 9 — Action bar | ⏳ Queued | BG3-style unified action/resource bar (design doc: `docs/phase-8-action-bar.md`) |
| 10 — Polish pass | ⏳ Queued | Performance (AC recalc lag, content re-fetch), CSS bugs (class description heading overlap), optimistic updates |
| 11 | ⏳ TBD | Not yet specified |
| 12 | ⏳ TBD | Not yet specified |
| — | ⏳ Post-Phase 8 | **Class completeness audit** — `docs/class-completeness-audit.md` |
| — | ⏳ Future | **Combat Mode design doc** — `docs/combat-mode-design.md` (concept stage only) |

---

## Known Issues

### Fallen Aasimar subrace HTML
**Status:** Active — deferred to Chunk 2
**Symptom:** Aurora subrace descriptions (e.g. Fallen Aasimar) contain HTML tags that render as literal text in the Features tab subrace section.
**Fix:** Apply `stripHtml` or `cleanHtml` to subrace description rendering in `tab-features.tsx`.

---

### Class description heading overlap
**Status:** Parked — deferred to Phase 10 polish
**Symptom:** H4/H5 headings in PHB24 class descriptions (Cleric, Sorcerer, Fighter, Wizard, others) visually overlap with the text immediately below. Race and background descriptions render correctly with the same `.aurora-content` CSS.
**Hypothesis:** Something in class HTML structure (deeper table nesting, unclosed tags, parent overflow context) interacts with CSS in a way race/background HTML doesn't.
**To fix:** Open DevTools on a broken heading, inspect computed styles + DOM ancestry, identify structural cause, fix at root.

---

### Slow AC recalc on equip/unequip
**Status:** Tech debt — deferred to Phase 10 polish
**Symptom:** After clicking equip/unequip on armor or shield, the AC stat in the header updates 2–3 seconds later. Calculation is correct; propagation is slow.
**Cause (likely):** Content/character re-fetch on every mutation instead of optimistic local update of derived stats.
**To fix (Phase 10):** Audit all derived-stat recomputes; consider `useOptimistic` on `CharacterMutationContext` for stat-affecting actions. Also revisit `unstable_cache` for `getEnabledItems/Features/Spells`.

---

### PHB24 classes missing from class picker (resolved)
**Status:** Fixed in commit `af6b1a3`
Barbarian, Bard, Fighter, Monk, Rogue appeared SRD-only when Aurora (PHB24) was synced. Fixed by adding `DISTINCT_FROM_SRD` set that bypasses Case A dedup for PHB24/DMG24 sources.

---

### Class Progression not rendering for pre-Phase-8 characters (resolved)
**Status:** Fixed in commit `af6b1a3`
`resolvedClass` stored at character-creation time lacked `featuresByLevel`. Fixed by patching specific fields from live `SRD_CLASSES` data in `page.tsx`.

---

## Design Docs Index

| Doc | Status | Notes |
|---|---|---|
| `docs/level-up-phase.md` | Mostly built | Original Phase 8 design reference; level-up/down flow, choices, HP rolling |
| `docs/phase-8-action-bar.md` | Design only | Phase 9 target; BG3-style unified action/resource bar |
| `docs/combat-mode-design.md` | Not created | Future feature concept; create when design work begins |
| `docs/class-completeness-audit.md` | Not created | Post-Phase 8; survey class feature data coverage across all SRD/PHB24 classes |
| `docs/project-status.md` | This file | Living tracker; updated at end of each working session |
