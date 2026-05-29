# Phase 8: BG3-Style Unified Action/Resource Bar

**Status:** Design reference — do not build until Phase 7 is complete.

## Reference

Baldur's Gate 3's combat hotbar — horizontal strip of icons surfacing every
limited-use resource the character has, grouped by category.

## Resource categories and icons (observed in BG3)

| Category | Visual |
|---|---|
| Action | Green circle |
| Bonus Action | Orange triangle |
| Reaction | Pink 4-pointed star |
| Spell slots by level (I–IX) | Roman numerals |
| Cantrips | Surfaced even though unlimited |

### Class feature charge icons (BG3 examples)

| Feature | Icon |
|---|---|
| Arcane Recovery | Blue spiral |
| Bladesinging | Blue sword + blue music note |
| Channel Oath | Blue shield |
| Wildshape | Green paw |
| Bardic Inspiration | Yellow music note |
| Channel Divinity | Blue gear |
| Lay on Hands | Blue hand |
| Sorcery Points | Red flame |
| Star Map | Blue scroll |
| Cosmic Omen | Blue shooting star |
| War Priest Charges | Orange fireball |

### Feat-granted charges (BG3 examples)

| Feature | Icon |
|---|---|
| Maneuver Die (Martial Adept) | Red dice |

### Item-granted charges

Equipment can carry `grantedFeatures` (modeled in Phase 7).  These must be
surfaced here alongside class and feat charges — same tap-to-spend interaction.

## Key design principles

- Surfaces ALL limited-use resources in one place (spell slots, class charges,
  feat charges, item charges)
- Spell slots use Roman numerals to differentiate from integer charge counts
- Cantrips surfaced even though they are unlimited
- Each charge type ideally has its own icon; start with category icons
  (action / bonus action / charge / slot / cantrip) and refine to per-feature
  icons later
- Tap to spend — decrements that resource, optimistic UI same as existing
  charge pips
- End-turn button resets per-turn states (action, bonus action, reaction)
- Does NOT replace existing tabs — supplements them as a sticky combat bar
  (always-visible or toggleable)
- Placement: sticky at bottom on desktop above the bottom nav; on mobile
  above the existing tab bar

## Implementation notes

The data model prerequisite is already designed:

- Class features: `lib/character/features.ts` defines `key, label, maxCharges,
  rechargesOn` — same shape as item-granted features
- Item-granted features: `item.grantedFeatures[]` (Phase 7 data model) feeds
  directly into the same `featureCharges` bucket on `CharacterData`
- Spell slots: already in `CharacterData.spellSlots`
- Actions / bonus actions / reactions: per-turn state — need a new
  `turnState: { actionUsed, bonusActionUsed, reactionUsed }` field on
  `CharacterData` (or local component state if not persisted)

## Open questions to resolve when building

1. Always-visible or combat-mode-only toggle?
   - Always-visible keeps it simple but takes vertical space
   - Combat-mode toggle is more faithful to BG3 but adds a feature
2. Multi-target spells: single tap to cast + decrement slot, or a
   two-step (cast → select target)?
3. Reaction tracking: how does the user mark a reaction used vs available?
   Per-round reset is tricky without explicit turn tracking.
4. Per-feature icons: custom SVGs vs emoji vs a Lucide/Heroicons subset?
