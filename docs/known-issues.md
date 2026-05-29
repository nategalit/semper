# Known Issues

---

## Class description heading overlap
Status: Known issue, deferred to Phase 10 polish
Symptom: H4/H5 headings in PHB24 class descriptions
(Cleric, Sorcerer, Fighter, Wizard, others) visually
overlap with the bullet/paragraph text immediately below.
Race and background descriptions render correctly with the
same .aurora-content CSS, so the bug is class-HTML-specific.
Attempted fixes:
1. .aurora-content CSS with margin-top/margin-bottom on
   headings — applied but visually insufficient
2. cleanHtml() strips orphaned </div> tags from
   <div element="..."/> placeholders — didn't resolve
3. Doubled spacing values — didn't resolve
Hypothesis: something in class HTML structure (deeper
table nesting, unclosed tags, parent overflow context)
is interacting with the CSS in a way race/background HTML
doesn't. Needs focused DOM inspection in DevTools rather
than speculative CSS adjustments.
Action when revisited: open DevTools on a broken heading,
inspect computed styles + DOM ancestry, identify the actual
structural cause, fix at root.

---

## Slow AC recalc on equip/unequip
Status: Tech debt, address in Phase 10 polish pass
Symptom: After clicking equip/unequip on armor or shield,
the AC stat in the header updates 2-3 seconds later.
Calculation is correct; only the propagation is slow.
Likely the same family of issues as the create-character
lag and equipment manager first-open lag — content/character
re-fetch on every mutation rather than optimistic local
update of derived stats.
Action when revisited (Phase 10 perf pass): audit all
derived-stat recomputes for optimistic-vs-server-roundtrip,
consider unifying via React 19's useOptimistic on
CharacterMutationContext for all stat-affecting actions,
not just HP and spell slots. Also revisit unstable_cache
for getEnabledItems/Features/Spells.

---

## AC calculation reads legacy character.data.armor field
Status: Resolved in Phase 7
AC now reads solely from the live equipment array (equipSlot
=== "armor" / "shield"). The legacy character.data.armor field,
setArmor server action, and ArmorPicker component have been
removed. Equipment array is the single source of truth.
