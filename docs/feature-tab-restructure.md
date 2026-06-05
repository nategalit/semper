# Feature Spec: Features Tab Reorganization

**Status:** Deferred — Phase 10 or later  
**Origin:** Block 1–9 test session, 2026-06-05

---

## Problem

The current Features tab renders everything in a single flat list:

1. Level button (tap to level up/down)
2. Class Features (charge-tracked features with pip/stepper UI)
3. Class Progression (static features, level-keyed)
4. Fighting Style (if applicable)
5. Subclass (subclass picker or feature list)
6. Race section
7. Class description
8. Background description

This works but mixes different categories (charge features, static traits, race traits, background feature) without clear visual separation. As characters gain levels, the tab becomes dense and hard to scan.

---

## Options

### Option A — Section per source

Group into four named sections:

- **Class** — Class Features (charge UI) + Class Progression (static) + Fighting Style
- **Subclass** — Subclass picker or subclass feature list
- **Race / Subrace** — Race traits + subrace traits
- **Background** — Background feature

Each section is visually distinct (e.g. colored header line or icon). Subclass folds into Class if preferred.

*Pros:* Maps directly to how D&D players think about their character. Easy to explain.  
*Cons:* "Class" section gets very long at high levels.

---

### Option B — Section per type

Group by mechanical function:

- **Active Features** — charge-tracked features (Rage, Wild Shape, Ki, etc.)
- **Passive Features** — static class progression, fighting style, racial traits
- **Background & Origin** — background feature + racial flavor text

*Pros:* Puts the interactive elements first; passive lore at bottom.  
*Cons:* Less intuitive mapping for players who think in source terms.

---

### Option C — Collapsible accordion

Keep the current source-based ordering but make each section collapsible. Default state: all open. After one session, remember collapse state in localStorage.

- Each `SectionCard` gets a collapse toggle (▾ / ▸ header tap)
- State stored per character in localStorage or `character.data.uiPrefs`
- Default: all expanded

*Pros:* Low disruption, user-controlled density.  
*Cons:* Doesn't fix the ordering; just lets users hide parts they don't care about.

---

### Option D — Hybrid (recommended baseline)

- Use **Option A** grouping (Class / Subclass / Race / Background)
- Make each group **collapsible** (Option C)
- Move charge-tracked features to the top of the Class section so they're always visible

---

## Implementation Notes (for when this is built)

- `SectionCard` in `shared/section-card.tsx` would need a `collapsible` prop
- Collapse state: start with no persistence (always expanded), add localStorage later if needed
- The Fighting Style card currently sits between Class Progression and Subclass — under Option A it moves inside the Class section
- Background description currently renders full HTML via `cleanHtml` — keep that, just relocate

---

## Open Questions

- Should charge features (Rage, Ki, etc.) always be visible even when their section is collapsed?
- Should the Level button move to the header or stay at top of Features tab?
- Do we want a "compact mode" toggle anywhere (show only active/charge features, hide all lore)?
