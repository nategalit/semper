# UI Overhaul Plan

Scope defined 2026-06-07. No code until chunks are approved.
This document is the source of truth for the overhaul build sequence.

---

## Context

Phase 8.5 landed all feat mechanics. Testing surfaced that the visual
language is inconsistent and information density is low — key stats
are opaque (no breakdown), descriptions are truncated or missing
formatting, and the Features tab is an undifferentiated wall. The
overhaul must land before Phase 9 (Action Bar) because the action bar
will be built into the finalized visual language.

Six areas of work, ordered by dependency:

```
F (tokens) → A (cards) → B (formatting) → C (breakdown) → D (overrides) → E (features tab)
```

F should be designed first (locks the vocabulary), but most of its
build can happen in parallel with A and B. C and D share UI surfaces
and should be built together. E is the largest chunk and comes last.

---

## A. Tap-to-Expand Card Pattern

### Current state

| Surface | File | Behavior |
|---|---|---|
| `/spells` browse page | `app/spells/_components/spell-browser.tsx` | Always-expanded — full description visible for every spell |
| `/feats` browse page | `app/feats/_components/feat-browser.tsx` | Always-expanded — same pattern |
| Character sheet spell list | `app/characters/[id]/_components/tabs/tab-spells.tsx` | Static `SpellRow` — no expansion, no description shown |
| Spell manager modal | `app/characters/[id]/_components/panels/spell-manager.tsx` | Has `expandedId` state (partial expansion) but no clean card pattern |
| Level-up feat picker | `app/characters/[id]/_components/panels/level-up-panel.tsx` | Collapsed/expanded tied to selection state (`picked`), not independent tap |

Problems:
- Browse pages render too much at once — scrolling through 300 always-open spell cards is slow to scan
- Character sheet spell list shows nothing about each spell — users must navigate away to look up what a spell does
- Level-up feat picker collapses description on deselect, so users can't read two feats side-by-side before choosing

### Target state

**Browse pages** (`/spells`, `/feats`):
- Collapsed default: name + meta row + source chip (one line or two)
- Tap anywhere on card → expands in place, description slides in
- Multiple cards can be open simultaneously
- Tap again or tap elsewhere (not another card) → collapses

**Level-up pickers** (feat picker inside LevelUpPanel):
- Same collapsed/expanded, but tap-to-expand is independent of selection
- Selecting a feat (tap the outer card area) still works
- Description is readable without being forced to select the feat first

**Character sheet spell list**:
- Same pattern — collapsed shows name + level/school + concentration/ritual badges
- Expand to see casting time, range, components, duration, full description

**Implementation note**: The expand/collapse state should be a simple `Set<string>` of expanded IDs managed by `useState`. No external library needed. The `ExpandableCard` wrapper is a generic `div`-based component — no `<details>` or accordion library.

### Design tokens needed
- Card collapsed height: implicit (content-driven, ~40-48px)
- Card expand transition: `transition-all duration-150` (fast, not animated layout shifts)
- Expanded description container: `max-h-[600px] overflow-hidden transition-all` (CSS max-height animation)

### Estimated chunks
- **Chunk A1**: Create `ExpandableCard` primitive + apply to `/feats` browse page
- **Chunk A2**: Apply to `/spells` browse page (dedup logic already there — don't break it)
- **Chunk A3**: Apply to level-up feat picker (decouple expand from selection)
- **Chunk A4**: Apply to character sheet spell list
- **Chunk A5**: Apply to spell manager modal — the existing `expandedId` state is partial and inconsistent with the new pattern; replace with the `ExpandableCard` primitive. The spell manager has two views (browse vs. my spells) and add/remove actions, so this chunk is more complex and can be done after A4 without blocking it.

### Dependencies
- B (formatting) should be done before A4 — the spell list expansion is only useful if descriptions are well-formatted
- A5 can be done after A4; it does not block any other chunks

---

## B. D&D-Style Description Formatting

### Current state

Aurora ships HTML with `<p>`, `<strong>`, `<em>`, `<ul>`, `<li>`, `<h4>`, `<h5>` tags. The
app handles this inconsistently:

| Surface | Pipeline | Result |
|---|---|---|
| Subclass description (Features tab) | `cleanHtml()` + `dangerouslySetInnerHTML` + `.aurora-content` CSS | Full HTML preserved, best result |
| Feature descriptions | `stripHtml` inline (`.replace(/<[^>]+>/g, " ")`) | Plain text, all formatting lost |
| Feat descriptions (browse + picker) | Same `stripHtml` inline | Plain text |
| Spell descriptions (spell manager) | `dangerouslySetInnerHTML` with HTML string | Full HTML, but no `.aurora-content` wrapper |
| SRD feature descriptions | Plain strings in `featureDescriptions` map | Plain text (no HTML at all) |

`cleanHtml` (defined in `tab-features.tsx:20-31`) resolves Aurora `<div element="ID">` references
and strips reference divs, then returns plain text. It already has the element-resolution logic —
it just throws away the HTML formatting after that.

Problems:
- **Bold trait names lost**: "**Advantage on Dexterity.**" → "Advantage on Dexterity." — critical for readability
- **Italics lost**: spell school/level markers in description text lose emphasis
- **Paragraph spacing**: without `<p>` tags, multi-paragraph features render as one wall of text
- **Inconsistency**: same description renders richly for subclasses, as plain text for features

### Target state

**Updated `cleanHtml` pipeline** (preserve formatting tags, strip Aurora-specific cruft):
```
Input HTML
  → resolve <div element="ID"> refs (current behavior)
  → strip <div class="reference"> (current behavior)  
  → strip remaining <div> wrappers (current behavior, unwrap inner content)
  → KEEP: <p>, <strong>, <em>, <ul>, <ol>, <li>, <h4>, <h5>, <br>
  → strip: everything else (divs, spans, classes, style attrs)
  → return HTML string (not plain text)
```

**`.aurora-content` CSS** (already exists for subclasses) expanded to cover all description contexts:
- `p`: `mb-2 last:mb-0`
- `strong`: `font-semibold text-stone-100` (name bolding)
- `em`: `italic text-stone-300` (metadata italics)
- `ul/ol`: `pl-4 space-y-1`
- `li`: `list-disc` / `list-decimal`
- `h4/h5`: `font-semibold text-stone-200 mt-3 mb-1 text-xs uppercase tracking-wide`

**Application**: replace all inline `stripHtml` calls and plain-text `<p>` description rendering
with `dangerouslySetInnerHTML={{ __html: cleanHtml(desc, featureMap) }}` + `className="aurora-content ..."`.
For surfaces without a `featureMap` (browse pages), a `cleanHtml` variant that skips element
resolution can be used.

**SRD descriptions** (plain strings in `featureDescriptions`): leave as-is for now. They're
short enough that formatting isn't needed. Can be upgraded later if needed.

### Estimated chunks
- **Chunk B1**: Update `cleanHtml` to return HTML string preserving formatting tags. Move to `lib/content/aurora/clean-html.ts` (currently inline in tab-features). Export a `cleanHtmlBrowse(html)` variant that skips element resolution (no featureMap required).
- **Chunk B2**: Apply to feature descriptions in Features tab, feat cards in Features tab
- **Chunk B3**: Apply to feat descriptions on `/feats` browse page and level-up feat picker
- **Chunk B4**: Apply to spell descriptions on `/spells` browse page, spell manager, character sheet spell list

### Dependencies
- B1 must be done before B2-B4 (shared utility)
- A (expandable cards) benefits from B being done first — expanding to a formatted description is worth it; expanding to a plain-text wall is less so

---

## C. Click-Stat-to-Show-Calculation

### Current state

`DerivedStats` (defined in `lib/character/calc.ts:119-135`) carries final computed numbers only.
No intermediate breakdown data. `SavingThrowResult` has `{ modifier, proficient }`. `SkillResult`
has `{ modifier, proficient, ability }`. No "base + components = total" structure.

Stats are displayed as raw numbers in:
- `tab-stats.tsx` — saving throws via `ProficiencyRow`, skills via `ProficiencyRow`
- `header.tsx` — AC, initiative, HP, proficiency bonus, speed
- `tab-stats.tsx` — passive perception as a label+value pair

Nothing is tappable. No tooltip/popover system exists.

### Target state

**Breakdown types** (new, added to `lib/character/calc.ts`):
```typescript
export interface StatBreakdown {
  components: { label: string; value: number }[];
  total: number;
}
```

**`DerivedStats` extended**:
```typescript
acBreakdown: StatBreakdown;
initiativeBreakdown: StatBreakdown;
savingThrowBreakdowns: Record<AbilityKey, StatBreakdown>;
skillBreakdowns: Record<string, StatBreakdown>;
speedBreakdown: StatBreakdown;
passivePerceptionBreakdown: StatBreakdown;
spellSaveDCBreakdown?: StatBreakdown;
spellAttackBonusBreakdown?: StatBreakdown;
```

Example AC breakdown:
```
{ label: "Base", value: 10 }
{ label: "DEX", value: 2 }
{ label: "Shield of Faith (equipped)", value: 2 }
{ label: "Defense (Fighting Style)", value: 1 }
→ total: 15
```

**UI**: Thin `StatPopover` component. Tap any interactive stat → shows popover/tooltip inline
(no modal). Contains a label list with sub-values and a bold total. Dismisses on tap-outside or
tap-same-stat.

**Implementation approach**: Hand-rolled popover using `position: fixed` + `useRef` + click-outside
listener. No Radix dependency — the breakdown data is read-only and simple. On mobile: renders as
a compact bottom-anchored sheet. On desktop: renders as a tooltip card anchored to the tapped
element.

**Scroll behavior**: The popover MUST scroll if content exceeds its height — never clip silently.
A high-level character with multiple feats, magic items, a fighting style, an Other Modifier, and
an active Override can easily produce 8–10 breakdown lines. Use `overflow-y-auto max-h-[60vh]` on
the content area. The test case to build against is NOT a level-1 character — it's a level-12
Fighter with Alert, Dual Wielder, Shield +1, Defense fighting style, and an active override on AC.

**Stats to wire**: AC, Initiative, all 6 Saves, all Skills, Speed, Passive Perception, Spell Save
DC, Spell Attack Bonus.

**Stats to skip**: raw ability scores (already shown with modifier, breakdown would just be the
score itself), HP (separate HP dialog covers this), proficiency bonus (formula is always
`2 + floor((level-1)/4)` — obvious enough to not need a popover).

### Estimated chunks
- **Chunk C1**: Add `StatBreakdown` type, extend `DerivedStats`, populate breakdowns in `deriveStats`
- **Chunk C2**: Build `StatPopover` component; wire to Header stats (AC, initiative, speed, prof bonus)
- **Chunk C3**: Wire to Saves and Skills in `tab-stats.tsx`
- **Chunk C4**: Wire to spell stats (Spell Save DC, Spell Attack Bonus) in `tab-spells.tsx`

### Dependencies
- D (overrides) should be built after C — the popover from C is the natural place to surface the override control from D

---

## D. Manual Stat Overrides

### Current state

No `overrides` field in `CharacterData` (`lib/types/character.ts:41-107`). No override mechanism.
Use case: DM-granted buffs, magic items not in our data, temporary effects the system can't
auto-compute.

### Target state

**Two override modes** (mirrors D&D Beyond "Other Modifier" + "Override Score"):

| Mode | Field | Behavior | Use case |
|---|---|---|---|
| Other Modifier | `otherModifiers[key]` | Additive — sums into total alongside normal calculations | DM-granted "+1 STR this session", temporary bonuses, untyped mods |
| Override Score | `overrides[key]` | Replacement — replaces the final total entirely | Tome of Strength sets STR to 19; magic item not in our data |

When both are set, Override Score wins.

**Data model**:
```typescript
// Two new fields in CharacterData
overrides?:      Partial<Record<OverridableStatKey, number>>;  // replacement
otherModifiers?: Partial<Record<OverridableStatKey, number>>;  // additive

type OverridableStatKey =
  | "ac" | "initiative" | "speed" | "passivePerception"
  | "spellSaveDC" | "spellAttackBonus"
  | `save_${AbilityKey}`       // "save_str", "save_dex", ...
  | `skill_${string}`          // "skill_Acrobatics", ...
  | `ability_${AbilityKey}`;   // "ability_str", ...
```

**Calculation behavior** (final post-processing step in `deriveStats`):
```
calculated    = normal calculation result
withModifier  = calculated + (otherModifiers[key] ?? 0)
final         = overrides[key] ?? withModifier
```
Normal calculation continues unchanged beneath this layer. Skill checks that depend on STR use the
real score unless the skill itself is also overridden.

**Popover layout** (both inputs always visible, not gated behind a reveal button):
```
  STR Score         16
  Modifier          +3
  ─────────────────────
  Base              15
  Half Elf Bonus    +1
  ─────────────────────
  Other Modifier   [ 0 ]   ← always-visible additive input
  Override Score   [ — ]   ← always-visible replacement input (empty = inactive)
```
When Override Score is filled, it displays with an amber border and "Overriding calculated value"
note. When Other Modifier is non-zero, it appears as a line in the breakdown above the total.

Override indicator on main sheet: small amber dot next to the stat value (not a text label — too noisy).
Restore: clearing the Override Score input field to empty removes the override.

**Persistence**: Both fields stored in `character.data`. Single server action
`updateStatAdjustments(characterId, key, { otherModifier?: number | null, override?: number | null })`.
Null removes the respective value.

### Estimated chunks
- **Chunk D1**: Add `OverridableStatKey`, `overrides`, `otherModifiers` fields to `CharacterData` (no DB migration — Supabase JSONB)
- **Chunk D2**: Apply both adjustments in `deriveStats` post-processing; surface Other Modifier as a breakdown line; surface Override as final-total replacement line
- **Chunk D3**: Add both inputs to `StatPopover` from Chunk C2; add amber-dot override indicator to stat displays
- **Chunk D4**: Wire server action, persistence, clear/restore flow

### Dependencies
- C must be complete before D (D extends the C popover)
- D1 (type changes) can be done alongside C1

---

## E. Features Tab Restructure

### Current state

9 sections, conditionally rendered in this order (`tab-features.tsx:132-390`):
1. Level button (tap to open level-up panel)
2. Class Features (charge-tracked features with pip UI)
3. Feats (picked feats with source chip, level badge, prereq warning)
4. Class Progression (non-charge class features by level)
5. Fighting Style (chosen style with source chip)
6. Subclass (choose button or full display with subclass features)
7. Subrace (resolved subrace details)
8. Race (fallback if no race)
9. Class (class description from SRD)

Problems:
- No search — can't find a feature by name
- Sections not collapsible — must scroll through everything
- Order is mechanic-first rather than conceptually grouped ("what source is this from?")
- Class Features and Class Progression are split (charge-tracked vs. static) — users don't think in this distinction
- No sticky headers — section context is lost mid-scroll on long lists

### Target state

**Section order** (per IA doc, reorganized by source):
1. Level button (stays at top — primary action)
2. **Class** — class name, description, then ALL class features:
   - Charge-tracked (auto-expanded, pip UI)
   - Class Progression (by level, collapsed by default)
   - Fighting Style (if any)
3. **Subclass** — subclass features (same pattern as class)
4. **Race / Subrace** — racial traits
5. **Background** — background feature (currently not shown — add it)
6. **Feats** — picked feats (already exists, keep in place)
7. **Items** — item-granted features (future, stub for now)

**Collapsibility**: Each top-level section has a header row with a collapse toggle (chevron). Collapse state stored in `localStorage` keyed by character ID + section name (survives refresh, resets for new characters). Default states:
- Class: expanded
- Subclass: expanded
- Race: collapsed (reference, rarely needed during play)
- Background: collapsed
- Feats: expanded

**Sticky section headers**: `position: sticky; top: {tabBarHeight}px` (tab bar is ~56px on mobile, 0 on desktop). Each header shows section name + count ("Class · 8 features").

**Search bar**: Above all sections. `useState` text input. Filters all features by name across all sections. When active, collapses the section structure and shows flat filtered results. Clears on blur or X button.

**Background feature**: Currently missing from Features tab. `SrdBackground` has a `feature` field — add a Background section that renders it. Low effort, visible gap in current app.

### Estimated chunks
- **Chunk E1**: Add search bar (flat filter across all features when searching)
- **Chunk E2**: Make sections collapsible with `localStorage` persistence
- **Chunk E3**: Reorder sections per new IA; merge Class Features + Class Progression into one Class section; add stub Items section
- **Chunk E4**: Sticky section headers
- **Chunk E5**: Add Background feature section

### Dependencies
- E is largely self-contained
- B (formatting) benefits E if background/class descriptions use rich HTML
- A (expandable cards) could be used for individual features within sections — evaluate after A and E are both done

---

## F. Visual Language Consistency

### Current state

**Chip/badge patterns (6 found, not systematic)**:

| Pattern | Colors | Usage | Consistent? |
|---|---|---|---|
| Source: Aurora/imported | `bg-indigo-900/60 border-indigo-700/50 text-indigo-300` | Feats (tab-features, level-up-panel) | Partial — not used in spell browser |
| Source: SRD | `bg-stone-700 text-stone-300` | Subclass picker | Sometimes `bg-stone-800 text-stone-400` elsewhere |
| Spell level/slot | `bg-sky-900/40 border-sky-800/50 text-sky-400` | Spell manager | Not used elsewhere |
| Status: condition | `bg-orange-900/60 border-orange-700 text-orange-300` | Extras tab | — |
| Status: exhaustion | `bg-red-900/60 border-red-700 text-red-300` | Extras tab, header | — |
| Status: at-limit | `bg-amber-900/30 border-amber-900/40 text-amber-500/70` | Spell manager | — |

**Button patterns (6+ found, none standardized)**:
- Primary CTA: amber fill, several inconsistent sizes (`min-h-[48px]` to `min-h-[52px]`)
- Secondary: stone fill
- Tertiary: outlined stone
- Ghost: text only
- Danger: red tinted
- Subclass choose: amber tinted (different from primary)

**Worst offenders**:
1. Source chips: 3 different styles for the same concept (SRD vs. imported source) depending on location
2. Primary button height: varies 48-52px with no rule
3. Rounded corners: `rounded-lg` vs `rounded-xl` used interchangeably with no rule
4. `text-stone-400` vs `text-stone-500` used interchangeably for secondary/muted text

### Target state

**Design token constants** (`lib/ui-tokens.ts` — a plain-object constants file, not a Tailwind plugin):
```typescript
export const chip = {
  source: {
    srd:    "bg-stone-700 text-stone-300 border-stone-600",
    aurora: "bg-indigo-900/60 text-indigo-300 border-indigo-700/50",
  },
  type: {
    half:   "bg-amber-900/40 text-amber-400 border-amber-800/50",
    spell:  "bg-sky-900/40 text-sky-400 border-sky-800/50",
  },
  status: {
    warning: "bg-amber-900/30 text-amber-500 border-amber-800/40",
    danger:  "bg-red-900/60 text-red-300 border-red-700",
    info:    "bg-orange-900/60 text-orange-300 border-orange-700",
  },
} as const;

export const button = {
  primary:   "min-h-[48px] rounded-xl bg-amber-600 text-stone-950 font-bold hover:bg-amber-500 active:bg-amber-700 transition-colors",
  secondary: "min-h-[48px] rounded-xl bg-stone-700 text-stone-100 font-semibold hover:bg-stone-600 active:bg-stone-800 transition-colors",
  outline:   "min-h-[44px] rounded-lg border border-stone-600 text-stone-300 hover:border-stone-400 hover:text-stone-100 transition-colors",
  ghost:     "min-h-[44px] rounded-lg text-stone-400 hover:text-stone-200 transition-colors",
  danger:    "min-h-[44px] rounded-lg border border-red-800 bg-red-900/30 text-red-400 hover:bg-red-900/50 transition-colors",
} as const;
```

**Typography rules**:
- Primary text: `text-stone-100` (headings, active items)
- Secondary text: `text-stone-400` (labels, descriptions)
- Muted text: `text-stone-600` (metadata, empty states)
- Accent: `text-amber-400` (highlights, level numbers)

**Spacing rules**:
- Cards: `rounded-xl border border-stone-700`
- Sections: `rounded-lg border border-stone-800` (slightly lighter than cards)
- Pills: `rounded-full`

### Estimated chunks
- **Chunk F1**: Audit document → confirm final token set (review with user before building)
- **Chunk F2**: Create `lib/ui-tokens.ts`; apply to source chips across all locations
- **Chunk F3**: Apply button tokens across app (primary, secondary, outline)
- **Chunk F4**: Apply typography/spacing rules, fix `rounded` inconsistencies

### Dependencies
- F1 and F2 should be done early — they inform A (card borders), C (popover styling), E (section headers)
- F3-F4 are safe to do at any point after F1

---

## Build Sequence Summary

| Chunk | Description | Depends on |
|---|---|---|
| F1 | Token audit + confirm | — |
| F2 | `ui-tokens.ts` + source chips | F1 |
| B1 | `cleanHtml` → returns formatted HTML | — |
| A1 | `ExpandableCard` primitive + feats browse | — |
| A2 | Apply to spells browse | A1 |
| B2 | Feat descriptions in Features tab | B1 |
| B3 | Feat descriptions on browse + level-up | B1 |
| E1 | Features tab search bar | — |
| E2 | Collapsible sections + localStorage | — |
| E5 | Background feature section | — |
| A3 | Level-up feat picker expand decoupled from select | A1 |
| C1 | `StatBreakdown` type + populate in `deriveStats` | — |
| C2 | `StatPopover` + Header stats | C1 |
| C3 | Wire Saves + Skills | C2 |
| F3 | Button tokens | F1 |
| D1 | `overrides` type + `CharacterData` field | C1 |
| D2 | Override post-processing in `deriveStats` | D1 |
| D3 | Override UI in `StatPopover` | C2, D2 |
| E3 | Reorder sections + merge Class + add Items stub | E2 |
| B4 | Spell descriptions | B1 |
| A4 | Character sheet spell list expansion | A1, B4 |
| E4 | Sticky section headers | E3 |
| F4 | Typography/spacing pass | F2 |
| D4 | Override persistence + server action | D3 |

Approximate session groupings:
- **Session 1**: F1, F2, B1 (foundation)
- **Session 2**: A1, A2, B3 (feats cards + formatting)
- **Session 3**: E1, E2, E5 (features tab usability)
- **Session 4**: C1, C2, C3 (stat breakdown + popover)
- **Session 5**: A3, A4, B4 (spell cards + level-up)
- **Session 6**: D1-D4 (overrides)
- **Session 7**: F3, F4, E3, E4 (polish pass + reorder)
