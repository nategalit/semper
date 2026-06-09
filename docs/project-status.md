# Semper — Project Status
Last updated: 2026-06-09

---

## Current State

**Phase:** Phase 8.6 complete — Heavy testing pass is next

**Latest commits (pending):**
- Phase 8.6-A+E: SRD subclass descriptions (39) + Domain/Oath always-prepared spells
- Phase 8.6-B+D: Subclass-granted spellcasting (EK, AT) + Remarkable Athlete half-PB
- Phase 8.6-C: Champion L10 Additional Fighting Style choice

**Phase 8.6 complete:**

*8.6-A: SRD subclass descriptions (39 subclasses):*
- Added `featuresByLevel` + `featureDescriptions` to all 39 remaining SRD subclasses (Champion was the only one with data before)
- All SRD subclass features now render with text in the Features tab instead of unlabeled chips
- Descriptions for choice-based features (Hunter's Prey, Totem Spirit, etc.) summarize all options inline

*8.6-B: Subclass-granted spellcasting (Eldritch Knight, Arcane Trickster):*
- `SUBCLASS_SPELLCASTING` map in `spell-types.ts` + one-third caster slot table in `progression.ts`
- `deriveStats` falls back to subclass spellcasting when base class has none
- Spells tab, spell manager, and spell limits all use `subclassId` as caster key for EK/AT
- `levelUpCharacter` picks up subclass-granted slots on level-up
- One-time `useEffect` in `tab-spells.tsx` initializes slots for existing EK/AT characters

*8.6-C: Champion L10 Additional Fighting Style:*
- `SUBCLASS_FIGHTING_STYLE_GRANT` map in `fighting-styles.ts`
- Level-up panel refactored from single `pickedFightingStyleId` to `fightingStyleByNewLevel` map — handles both class-level and subclass-level grants independently

*8.6-D: Remarkable Athlete half-PB (Champion L7+):*
- `deriveStats` applies `Math.ceil(pb/2)` to non-proficient STR/DEX/CON skill checks
- Shown as "Remarkable Athlete" component in skill stat breakdown popovers

*8.6-E: Domain/Oath always-prepared spells:*
- `grantedSpells` field added to `SrdSubclass` type
- Populated for all 7 SRD Cleric domains and 3 Paladin oaths (SRD spells only — some PHB spells not in SRD data are silently absent)
- Spells tab renders "Domain Spells" / "Oath Spells" section, level-gated by character level

*Deferred (see Known Issues):*
- Battle Master superiority dice, Hunter/Totem option pickers, subclass proficiency grants (Tier 3 — new infrastructure)
- Monster Hunter spellcasting (blocked by empty Aurora IDs)
- Draconic Resilience AC, domain spell Aurora fallback, EK/AT slot init server-side (deferred)

---

**UI Overhaul complete (`d2e3001`):**

*Editing flows:*
- Description tab: alignment picker (9-button grid), personality trait list editor, Ideal/Bond/Flaw textareas — all save on blur with dirty-ref pattern
- Extras tab: XP editor (tap-to-edit, shows XP-to-next-level, warns when XP implies different level), Notes textarea
- Character name: inline edit from header (tap name → underline input, save on blur/Enter)
- Back nav: `‹ Dashboard` link in sticky character header

*Features tab restructure (E3/E4):*
- Merged Class Features + Class Progression + Fighting Style into one "Class" section with sub-headers
- Section order: Class → Subclass → Race → Background → Feats → Items (stub)
- All sections collapsible; state persisted to `localStorage` per character
- Sticky section headers (`top-44 z-20`) scroll under character header without obscuring content
- Full-text search replaces all sections when active

*Stats tab:*
- Proficiencies section added: armor, weapons, tools (from background), languages (from race + background)

*Dice roller:*
- Multi-die count stepper (1–9); Advantage/Disadvantage hidden when count > 1
- Roll label and history use full notation (e.g., `3d8+2`)

*Dashboard:*
- Character cards show real class/race names, HP with amber accent, inspiration badge
- `+ New character` button uses design tokens

*Design token sweep (F3/F4):*
- `btn.primary`/`btn.secondary` tokens applied to all panel confirm buttons
- `rounded-xl` enforced across all primary interactive surfaces; `rounded-md` restricted to marketing/auth pages
- Stat popover Confirm: `orange-600` → `amber-600`, `text-white` → `text-stone-950`
- Alignment picker, condition buttons, XP input, HP dialog Set buttons all updated

*New files:*
- `app/not-found.tsx`, `app/characters/[id]/error.tsx`, `app/characters/[id]/loading.tsx`, `app/dashboard/loading.tsx`
- `app/manifest.ts` (PWA manifest, replaces `public/manifest.json`)
- `lib/content/aurora/clean-html.ts` (HTML sanitizer for Aurora content in browse views)

*Server actions added:* `renameCharacter`, `updateNotes`, `updateXp`, `updateDescription`

**Phase 8.5 complete (prior):**
- Feat picker UI: ASI/Feat toggle, feat browser with search/filter in level-up panel
- Half-feat ASI sub-choice surfaced (ability picker inline in feat card)
- Tough HP augmentation: `2 × level` bonus applied at render time
- Lucky + Inspiring Leader FeatureDefs in `lib/character/features.ts`
- Feat static stat mods wired to derived stats (initiative, speed, AC, ability scores)
- Alert PHB24 initiative: hardcoded proficiency-bonus add via `PROF_BONUS_INITIATIVE_FEAT_IDS`
- All 12 SRD classes have full `featureDescriptions` coverage
- Fallen Aasimar subrace HTML stripped in Features tab
- Dev routes deleted
- Standalone Feats browse page (`/feats`) with source + type filters; sort by Name/Source
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

### Heavy testing pass (next up)

Structured test pass with diverse character archetypes. Priority archetypes:
- Champion Fighter (L7, L10): Remarkable Athlete half-PB, Additional Fighting Style prompt
- Eldritch Knight / Arcane Trickster (L3+): Spells tab, slot counts, cantrips, spell manager
- Life Domain Cleric / Oath of Devotion Paladin: Domain/Oath spells section
- Arbitrary subclasses across all 12 classes: descriptions render, not chips
- SRD vs Aurora subclass dedup paths: same-named subclasses (Battle Master, etc.) show SRD data

### Phase 9 — Action bar (queued, deferred behind 8.6)

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
| UI Overhaul | ✅ Done | Tap-to-expand cards, formatted descriptions, stat breakdown popovers, manual overrides, Features tab restructure, design tokens, editing flows (description/extras/name), dashboard polish, PWA manifest, error/loading pages, multi-die dice roller, proficiencies section |
| 8.6 — Subclass completeness | ✅ Done | SRD subclass descriptions (all 39); EK+AT spellcasting; Champion L10 FS; Remarkable Athlete; domain/oath always-prepared spells. Tier 3 deferred. |
| Heavy testing pass | 🔜 Next | Diverse character archetypes, integration bugs at scale |
| 9 — Action bar | ⏳ Queued | BG3-style unified action/resource bar. Design doc: `docs/phase-8-action-bar.md`. Deferred until 8.6 lands. |
| 10 — Polish pass | ⏳ Queued | Performance (AC recalc lag, content re-fetch), CSS bugs (class description heading overlap), optimistic updates |
| — | ✅ Done | **Feature taxonomy audit** — `docs/feature-taxonomy-audit.md` |
| — | ✅ Done | **Class completeness audit** — `docs/class-completeness-audit.md` |
| — | ⏳ Phase 9 follow-up | **Combat Mode design doc** — `docs/combat-mode-design.md` (concept stage; create when Phase 9 ships and real-session data informs scope) |

---

## Known Issues

### Domain/Oath spells: missing spells not in SRD data
**Status:** Phase 8.6 follow-up
**Symptom:** Several canonical domain/oath spells (Revivify, Flame Strike, Flaming Sphere, Gust of Wind, Sleet Storm, Sanctuary, Bane, Ensnaring Strike, Augury, etc.) are absent from the always-prepared section because they're PHB spells not included in `SRD_SPELLS`.
**Fix:** When an Aurora import is active (PHB), fall back to Aurora spell data for `grantedSpells` IDs that don't resolve in SRD. Requires cross-referencing `grantedSpells` IDs against the Aurora spell list.

---

### EK/AT spell slot initialization: client-side useEffect
**Status:** Phase 10 polish
**Symptom:** Existing Eldritch Knight / Arcane Trickster characters (created before 8.6-B) get their slots initialized via a `useEffect` in `tab-spells.tsx` that fires when they open the Spells tab. If they navigate away before the tab renders, slots stay uninitialized until the next visit.
**Fix:** Move slot initialization to the server side at character load (e.g., a migration in `getCharacter` or a one-time server action triggered at page load).

---

### Battle Master: superiority dice resource pool not implemented
**Status:** Phase 8.6 follow-up (Tier 3) — or Phase 9 if action bar absorbs it
**Symptom:** Battle Master Combat Superiority defines a shared pool of superiority dice spent on maneuvers. The current pip system tracks per-feature charges, not a shared pool. Maneuver selection (pick 3 from 16) at level-up is also not surfaced.
**Scope:** Needs new resource pool data architecture in `CharacterData`, maneuver selection UI in level-up panel, and dice-size scaling (d8→d10→d12). The Phase 9 action bar may absorb this naturally if it introduces a generic shared-pool resource type.

---

### Hunter / Totem Warrior / Way of Four Elements: option pickers not implemented
**Status:** Phase 8.6 follow-up (Tier 3)
**Symptom:** Hunter (L3/7/11/15), Path of the Totem Warrior (L3/6/14), and Way of the Four Elements (L3+) require the player to pick from a list of options at each unlock level. These choices are silently skipped in the level-up panel.
**Fix:** Generic subclass option-choice UI in level-up panel. Overlaps with Battle Master maneuver picker — build together.

---

### Subclass proficiency grants not reflected in Proficiencies section
**Status:** Phase 8.6 follow-up (Tier 3)
**Symptom:** Subclasses that grant weapon/armor/tool proficiencies (Battle Master tool, Tempest/War heavy armor, College of Swords medium armor) are not reflected in the Stats tab Proficiencies section.
**Fix:** Subclass data schema extension to hold proficiency grants; subclass-level proficiency resolution in derived stats. Display gap only — proficiency functions if the player knows they have it.

---

### Monster Hunter: spellcasting blocked by empty Aurora IDs
**Status:** Phase 8.6 follow-up — blocked
**Symptom:** Monster Hunter (UA: Gothic Heroes Aurora subclass) should grant ritual spellcasting. Its Aurora grants array has `"id": ""` (empty strings), so `featureMap` lookups always fail. Spellcasting never activates.
**Fix:** Requires the Aurora import data to be corrected upstream, or a manual override in the SRD data layer (treat Monster Hunter as an SRD-ish subclass and hardcode its spellcasting config).

---

### Draconic Resilience: AC formula not applied
**Status:** Phase 8.6 follow-up
**Symptom:** Draconic Bloodline Sorcerer's Draconic Resilience grants AC = 13 + DEX when unarmored. The current unarmored AC fallback uses `10 + DEX`. The subclass check is missing.
**Fix:** `deriveStats` needs a branch similar to Monk Unarmored Defense — detect `ID_SUBCLASS_SORCERER_DRACONIC`, apply `13 + DEX` base when unarmored.

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
| `docs/subclass-completeness-audit.md` | Complete | Phase 8.6 scope audit: description coverage, 6 mechanic patterns, Tier 1/2/3 classification |
| `docs/project-status.md` | This file | Living tracker |
