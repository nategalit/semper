# Semper — Project Status
Last updated: 2026-06-07

---

## Current State

**Phase:** UI Overhaul (Phase 8.5 complete, Phase 8.6 queued)

**Latest commits:**
- `1fe46a0` — Phase 8 fix: feature rendering pipeline (bugs 1 & 2)
- `624d817` — Phase 8: Level Up flow complete
- `0ec4043` — Initial commit: Phases 1-7 complete, Phase 8 in progress

**Phase 8.5 complete:**
- Feat picker UI: ASI/Feat toggle, feat browser with search/filter in level-up panel
- Half-feat ASI sub-choice surfaced (ability picker inline in feat card)
- Tough HP augmentation: `2 × level` bonus applied at render time
- Lucky + Inspiring Leader FeatureDefs in `lib/character/features.ts`
- Feat static stat mods wired to derived stats (initiative, speed, AC, ability scores)
- Alert PHB24 initiative: hardcoded proficiency-bonus add via `PROF_BONUS_INITIATIVE_FEAT_IDS`
- All 12 SRD classes have full `featureDescriptions` coverage
- Fallen Aasimar subrace HTML stripped in Features tab
- Dev routes deleted
- Standalone Feats browse page (`/feats`) with source + type filters
- Feat filter + source filter added to level-up feat picker (shared `FilterPill` component)
- Level-up modal viewport expanded (96dvh, feat list max-h min(52vh,480px))
- Foundational audits: `docs/feature-taxonomy-audit.md`, `docs/class-completeness-audit.md`

**Class Progression description architecture (resolved):**
- PHB24 characters read `featuresByLevel` from Aurora-adapted resolvedClass
- `tab-features.tsx` builds a case-insensitive `descByNameLower` map from Aurora `featureMap` + SRD `featureDescriptions`
- "Lay on Hands" / "Channel Divinity" correctly absent from Class Progression — they are tracked charge features shown with pip UI

**Aurora subclass surfaces (resolved):**
- `page.tsx` fetches Aurora subclasses via `getEnabledSubclasses()`, deduplicates against SRD baseline
- Subclass descriptions use `cleanHtml()` + `.aurora-content` + `dangerouslySetInnerHTML`
- Element references in subclass descriptions resolved via `featureMap`
- Source chips on all subclass picker cards (stone = SRD, indigo = Aurora)

---

## What's Next

### UI Overhaul (active)

Design doc: `docs/ui-overhaul-plan.md`. Six areas:
- A: Tap-to-expand card pattern (spells, feats, features)
- B: D&D-style description formatting (preserve bold/italic/paragraphs from Aurora HTML)
- C: Click-stat-to-show-calculation (AC, initiative, saves, skills — breakdown popover)
- D: Manual stat overrides (DM buffs, magic items not in data)
- E: Features tab restructure (collapsible, reordered, searchable)
- F: Visual language consistency (design tokens, chip/button standardization)

Build sequence in `docs/ui-overhaul-plan.md`.

### Phase 8.6 — Subclass completeness (queued)

Mirrors Phase 8.5 but for subclasses. Key gaps found in testing:
- Battle Master: features show as chips without descriptions
- Monster Hunter: proficiency choice, superiority dice, ritual spellcasting not implemented
- Eldritch Knight / Arcane Trickster / Monster Hunter: subclass-granted spellcasting not detected by Spells tab
- Champion L10: Additional Fighting Style choice not surfaced
- Remarkable Athlete: half-proficiency to STR/DEX/CON checks not applied

Will require a dedicated audit before building. Plan when UI overhaul is done.

### Heavy feat + subclass testing pass (queued)

After 8.6. Structured test pass with diverse character archetypes.

### Phase 9 — Action bar (queued, deferred behind UI overhaul and 8.6)

BG3-style unified action/resource bar. Design doc: `docs/phase-8-action-bar.md`.
Must be built into the finalized visual language — cannot start before UI overhaul lands.

### Phase 10 — Polish pass (queued)

Performance, CSS edge cases, `unstable_cache` for content getters, optimistic update coverage.

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
| 8 — Level Up flow | ✅ Done | Guided level-up/down panel; subclass picker; Fighting Style picker (SRD + Aurora) |
| 8.5 — Feat picker + class completeness | ✅ Done | Feat picker; half-feat ASI; Tough HP; Lucky/Inspiring Leader; feat stat mods; class featureDescriptions (all 12); Feats browse page; level-up filters; modal viewport |
| UI Overhaul | 🔨 Active | Tap-to-expand cards, formatted descriptions, stat breakdown popovers, manual overrides, Features tab restructure, design tokens. Plan: `docs/ui-overhaul-plan.md` |
| 8.6 — Subclass completeness | ⏳ Queued | Battle Master descriptions, Monster Hunter mechanics, subclass-granted spellcasting, Champion L10 choice, Remarkable Athlete. Mirrors Phase 8.5 scope for subclasses. |
| Heavy testing pass | ⏳ Queued | Diverse character archetypes, integration bugs at scale |
| 9 — Action bar | ⏳ Queued | BG3-style unified action/resource bar. Design doc: `docs/phase-8-action-bar.md`. Deferred until UI overhaul and 8.6 land. |
| 10 — Polish pass | ⏳ Queued | Performance (AC recalc lag, content re-fetch), CSS bugs (class description heading overlap), optimistic updates |
| — | ✅ Done | **Feature taxonomy audit** — `docs/feature-taxonomy-audit.md` |
| — | ✅ Done | **Class completeness audit** — `docs/class-completeness-audit.md` |
| — | ⏳ Phase 9 follow-up | **Combat Mode design doc** — `docs/combat-mode-design.md` (concept stage; create when Phase 9 ships and real-session data informs scope) |

---

## Known Issues

### Battle Master: subclass features show as chips without descriptions
**Status:** Phase 8.6
**Symptom:** Battle Master features appear as unlabeled chips in Class Progression with no description text. Champion and other subclasses show descriptions correctly.
**Cause:** Battle Master features in Aurora use a naming/ID pattern the current `descByNameLower` map doesn't match.

---

### Monster Hunter: mechanics not implemented
**Status:** Phase 8.6
**Symptom:** Monster Hunter (Aurora subclass) doesn't surface its L3 proficiency choice, doesn't grant superiority dice as a resource pool, doesn't enable its ritual spellcasting.
**Cause:** These are subclass-mechanic patterns (custom resource pools, subclass-granted spellcasting, level-gated choices) that Phase 8.5 covered for classes but not subclasses.

---

### Subclass-granted spellcasting not detected
**Status:** Phase 8.6
**Symptom:** Eldritch Knight, Arcane Trickster, Monster Hunter — Spells tab says "this character can't cast spells" even though the subclass grants spellcasting. Base class (Fighter, Rogue) has no spellcasting; the subclass adds it.
**Fix:** Spells tab and `deriveStats` need to check subclass for spellcasting grants, not only the base class.

---

### Champion L10: Additional Fighting Style choice not surfaced
**Status:** Phase 8.6
**Symptom:** Champion subclass grants a second Fighting Style at L10. No prompt appears in the level-up panel; the choice is silently skipped.
**Fix:** Subclass-level fighting style grants need the same treatment as class-level grants in the level-up panel.

---

### Remarkable Athlete: half-proficiency not applied
**Status:** Phase 8.6
**Symptom:** Champion's Remarkable Athlete feature grants half-proficiency (rounded up) to STR, DEX, CON ability checks not already covered by proficiency. Not applied to derived stats.
**Fix:** Detect Remarkable Athlete via subclass ID, apply conditional half-PB to relevant skills in `deriveStats`.

---

### Observant: expertise sub-choice not surfaced
**Status:** Phase 8.6 or dedicated expertise chunk
**Symptom:** Observant offers proficiency or expertise in Insight/Investigation/Perception (if already proficient). Only the ability sub-choice (+1 INT/WIS) is surfaced. Expertise grant is silently dropped.
**Scope:** Skill Expert and Rogue's Expertise need the same infrastructure. Build together when expertise tracking lands.

---

### Class description heading overlap
**Status:** Parked — Phase 10 polish
**Symptom:** H4/H5 headings in PHB24 class descriptions visually overlap with text below.
**Hypothesis:** Class HTML structure (deeper nesting, unclosed tags) interacts with `.aurora-content` CSS differently than race/background HTML.

---

### Slow AC recalc on equip/unequip
**Status:** Tech debt — Phase 10 polish
**Symptom:** After equip/unequip, AC in header updates 2–3 seconds later.
**Cause (likely):** Content/character re-fetch on every mutation instead of optimistic update.

---

## Design Docs Index

| Doc | Status | Notes |
|---|---|---|
| `docs/ui-overhaul-plan.md` | Active | Six-area UI overhaul plan; chunk sequence for build |
| `docs/level-up-phase.md` | Mostly built | Original Phase 8 design reference |
| `docs/phase-8-action-bar.md` | Design only | Phase 9 target; BG3-style unified action/resource bar |
| `docs/information-architecture.md` | Decided | IA locked pre-Phase 9; job-based surface organization |
| `docs/combat-mode-design.md` | Not created | Phase 9 follow-up; create when Phase 9 ships |
| `docs/feature-taxonomy-audit.md` | Complete | 17 mechanical patterns across all sources |
| `docs/class-completeness-audit.md` | Complete | Per-level coverage; Phase 8.5 scope |
| `docs/project-status.md` | This file | Living tracker |
