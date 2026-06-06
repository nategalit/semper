# Information Architecture

Decision made before Phase 9, locking in how the app organizes
information across surfaces.

## Axis of organization: by JOB, not by content

We considered organizing by content category (Combat /
Adventuring / Roleplay) and rejected it. Players switch
between modes too fluidly during play and content
categorization leaks heavily (where does Cunning Action go?
Bardic Inspiration?). Instead, surfaces are organized by the
job they do:

- USE THIS NOW → Action Bar (Phase 9)
- I NEED TO REMEMBER THIS → Pinboard (future feature)
- WHAT DOES THIS DO → Features tab (reference)
- BUILD MY CHARACTER → Stats / Description / Extras

## Surface 1: Action Bar (Phase 9, designed in docs/phase-8-action-bar.md)

Always-visible bar that surfaces actions, bonus actions,
reactions, spell slots, and class/item charges. Tap to spend,
end-turn resets per-turn states. Handles 90% of in-play needs.

## Surface 2: Pinboard (future feature)

User-customizable surface where players pin specific items
from anywhere in the app (features, traits, stats, skills,
notes). Each pinned item shows its current state and is one
tap to use or expand. Models the real-world habit of writing
sticky-note reminders on a character sheet.

Data model: pinnedItems: string[] on CharacterData
UI: pin icon on every pinnable surface; dedicated Pinboard
tab or panel that renders pins as a compact reusable list.

Rationale: different classes care about different things, and
different players develop different habits — a curated
dashboard can't predict this; only the user can.

Build AFTER Phase 9 ships and we've used the app in real
play. The action bar will absorb most of the "needs to be one
tap" use case; what's left determines the right pinning model.

## Surface 3: Features tab (to be restructured later)

The reference document. Currently a wall of paragraphs.
Future restructure (Phase 10 polish):
- Sticky table of contents at top
- Collapsible sections by default
- Sections grouped by source (Class → Subclass → Race →
  Background → Feats → Items)
- Within sections: charge-tracked features first (actionable),
  then static features collapsed

Quick tactical improvement available now (single chunk):
make sections collapsible with sensible defaults. Full
restructure is Phase 10.

## Surface 4: Stats / Description / Extras

Character-building surfaces. Unchanged — these are where the
user goes between sessions to plan, edit, level up, write
backstory. Information density is acceptable since the user
has time.

## Order of operations

1. Finish current bug-fixing chunks (Issue 1, blocks 10-14 testing)
2. Build Phase 9 (action bar)
3. Quick tactical fix: collapsible Features tab sections
4. Build Pinboard after some real-session usage
5. Full Features tab restructure (Phase 10 polish)
