# Semper — Project Status
Last updated: 2026-06-05

---

## Current State

**Phase:** Pre-Phase 9 cleanup (bugs from block 1–9 testing)

**Latest commits (this session):**
- `3339ada` — Fix: case-insensitive feature description fallback chain (PHB24 features now get Aurora descriptions)
- `f3411c8` — Bug 2 (3–6/11): featureDescriptions for Barbarian, Bard, Druid, Monk
- `c624080` — Bug 2 (2/11): featureDescriptions for Cleric
- `63d44be` — Bug 2 (1/11): featureDescriptions for Paladin
- `0dcd304` — Bug 1: cantrips now always read from spellsKnown

**Class Progression description architecture (resolved):**
- PHB24 characters read `featuresByLevel` from Aurora-adapted resolvedClass (PHB24 feature names)
- SRD `featureDescriptions` is patched in at render time via `page.tsx` — but only covers SRD feature names, not PHB24-unique ones (Weapon Mastery, Paladin's Smite, etc.)
- **Fix**: `tab-features.tsx` now builds a case-insensitive `descByNameLower` map from two sources:
  1. Aurora `featureMap` (ClassFeature descriptions, HTML-stripped) — covers PHB24-unique features
  2. SRD `featureDescriptions` (plain text, curated) — overwrites Aurora where names match, so curated text always wins
- "Lay on Hands" / "Channel Divinity" correctly absent from Class Progression — they are tracked charge features shown with pip UI, intentionally filtered by `chargeLabels`

**Bug 2 — Class featureDescriptions (SRD): 6/11 done**
- ✅ Paladin, Cleric, Barbarian, Bard, Druid, Monk
- ⏳ Ranger, Rogue, Sorcerer, Warlock, Wizard
- Note: PHB24 variants now get Aurora fallback descriptions for features not in SRD. SRD descriptions are still worth writing — they take priority and are more concise.

**Blocked:** Nothing hard-blocked.

---

## What's Next

1. **Bug 2 remaining (5 classes)** — Ranger, Rogue, Sorcerer, Warlock, Wizard `featureDescriptions` in `lib/content/srd/classes.ts`. One class per response.

2. **Redesign 1 — Spells tab** — Design proposal first, then build chunked. Current tab shows spell names only; target state: cantrips always visible, spell info density matching Manage Spells modal, expandable cards, upcast control, Cast button consuming slots.

3. **Fallen Aasimar subrace HTML** — Aurora subrace descriptions contain raw HTML tags in Features tab.

4. **Phase 9 — Action bar** — BG3-style unified action/resource bar. Design doc: `docs/phase-8-action-bar.md`. Not started.

5. **Phase 10 — Polish pass**
   - AC recalc lag on equip/unequip
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
