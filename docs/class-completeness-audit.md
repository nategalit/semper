# Class Feature Completeness Audit
Last updated: 2026-06-05

Companion to `docs/feature-taxonomy-audit.md`. Surveys every SRD class feature
by level and tracks description coverage across three sources:
- **SRD** — entry in `featureDescriptions` in `lib/content/srd/classes.ts`
- **Aurora** — matching name in `featureMap` (resolved via `descByNameLower` fallback)
- **None** — blank on every character sheet regardless of Aurora import status

---

## The "103/185" Correction

The taxonomy audit reported "103/185 SRD features described" and flagged
Barbarian, Bard, Druid, Fighter, Monk, Paladin as having gaps. **This count
was misleading.** The 103 figure is unique description keys; the 185 figure
is total feature entries (counting repetitions of generic names like
"Path Feature" at levels 6, 10, and 14 as three separate entries).

Because the app looks up descriptions by name key (`descByNameLower`), all
three "Path Feature" occurrences get the same description. **Repetitions are
not gaps.**

**Corrected picture:**
- 7 classes (Barbarian, Bard, Cleric, Druid, Fighter, Monk, Paladin) have
  100% coverage — every feature entry resolves to a description via key reuse
- 5 classes (Ranger, Rogue, Sorcerer, Warlock, Wizard) have 0 SRD descriptions
  and partial Aurora fallback — the genuine quality gap

---

## Summary Table

| Class | SRD entries | Unique keys | SRD coverage | Aurora fills | Genuine gaps |
|---|---|---|---|---|---|
| Barbarian | 18 | 16 | ✅ 100% (key reuse) | — | 0 |
| Bard | 18 | 16 | ✅ 100% (key reuse) | — | 0 |
| Cleric | 17 | 14 | ✅ 100% (key reuse) | — | 0 |
| Druid | 12 | 10 | ✅ 100% (key reuse) | — | 0 |
| Fighter | 15 | 12 | ✅ 100% (key reuse) | — | 0 |
| Monk | 23 | 20 | ✅ 100% (key reuse) | — | 0 |
| Paladin | 17 | 15 + 7 orphans | ✅ 100% (key reuse) | — | 0 |
| **Ranger** | 19 | 0 | ❌ none | ~11/19 | **8** |
| **Rogue** | 16 | 0 | ❌ none | ~11/16 | **5** |
| **Sorcerer** | 10 | 0 | ❌ none | ~5/10 | **5** |
| **Warlock** | 12 | 0 | ❌ none | ~5/12 | **7** |
| **Wizard** | 8 | 0 | ❌ none | ~5/8 | **3** |
| **Total** | **185** | **103** | — | — | **28 entries** |

The 28 genuinely blank features require only **17 unique description additions**
(because generic placeholders like "Ranger Archetype Feature" appear 3× but need
1 description entry).

---

## Fully Covered Classes (No Action Needed)

### Barbarian

| Level | Feature | Status |
|---|---|---|
| 1 | Rage | ✅ SRD |
| 1 | Unarmored Defense | ✅ SRD |
| 2 | Reckless Attack | ✅ SRD |
| 2 | Danger Sense | ✅ SRD |
| 3 | Primal Path | ✅ SRD |
| 5 | Extra Attack | ✅ SRD |
| 5 | Fast Movement | ✅ SRD |
| 6 | Path Feature | ✅ SRD (shared key) |
| 7 | Feral Instinct | ✅ SRD |
| 9 | Brutal Critical | ✅ SRD |
| 10 | Path Feature | ✅ SRD (shared key) |
| 11 | Relentless Rage | ✅ SRD |
| 13 | Brutal Critical (2) | ✅ SRD |
| 14 | Path Feature | ✅ SRD (shared key) |
| 15 | Persistent Rage | ✅ SRD |
| 17 | Brutal Critical (3) | ✅ SRD |
| 18 | Indomitable Might | ✅ SRD |
| 20 | Primal Champion | ✅ SRD |

### Bard

| Level | Feature | Status |
|---|---|---|
| 1 | Bardic Inspiration | ✅ SRD |
| 1 | Spellcasting | ✅ SRD |
| 2 | Jack of All Trades | ✅ SRD |
| 2 | Song of Rest | ✅ SRD |
| 3 | Bard College | ✅ SRD |
| 3 | Expertise | ✅ SRD |
| 5 | Font of Inspiration | ✅ SRD |
| 6 | Countercharm | ✅ SRD |
| 6 | College Feature | ✅ SRD (shared key) |
| 9 | Song of Rest (d8) | ✅ SRD |
| 10 | Magical Secrets | ✅ SRD |
| 10 | Expertise (2) | ✅ SRD |
| 13 | Song of Rest (d10) | ✅ SRD |
| 14 | College Feature | ✅ SRD (shared key) |
| 17 | Song of Rest (d12) | ✅ SRD |
| 18 | Magical Secrets (2) | ✅ SRD |
| 18 | College Feature | ✅ SRD (shared key) |
| 20 | Superior Inspiration | ✅ SRD |

### Cleric

| Level | Feature | Status |
|---|---|---|
| 1 | Spellcasting | ✅ SRD |
| 1 | Divine Domain | ✅ SRD |
| 1 | Domain Spells | ✅ SRD |
| 2 | Channel Divinity | ✅ SRD |
| 2 | Domain Feature | ✅ SRD (shared key) |
| 5 | Destroy Undead (CR 1/2) | ✅ SRD |
| 6 | Channel Divinity (2) | ✅ SRD |
| 6 | Domain Feature | ✅ SRD (shared key) |
| 8 | Destroy Undead (CR 1) | ✅ SRD |
| 8 | Domain Feature | ✅ SRD (shared key) |
| 10 | Divine Intervention | ✅ SRD |
| 11 | Destroy Undead (CR 2) | ✅ SRD |
| 14 | Destroy Undead (CR 3) | ✅ SRD |
| 17 | Destroy Undead (CR 4) | ✅ SRD |
| 17 | Domain Feature | ✅ SRD (shared key) |
| 18 | Channel Divinity (3) | ✅ SRD |
| 20 | Divine Intervention Improvement | ✅ SRD |

### Druid

| Level | Feature | Status |
|---|---|---|
| 1 | Druidic | ✅ SRD |
| 1 | Spellcasting | ✅ SRD |
| 2 | Wild Shape | ✅ SRD |
| 2 | Druid Circle | ✅ SRD |
| 4 | Wild Shape Improvement | ✅ SRD |
| 6 | Circle Feature | ✅ SRD (shared key) |
| 8 | Wild Shape Improvement (2) | ✅ SRD |
| 10 | Circle Feature | ✅ SRD (shared key) |
| 14 | Circle Feature | ✅ SRD (shared key) |
| 18 | Timeless Body | ✅ SRD |
| 18 | Beast Spells | ✅ SRD |
| 20 | Archdruid | ✅ SRD |

### Fighter

| Level | Feature | Status |
|---|---|---|
| 1 | Fighting Style | ✅ SRD |
| 1 | Second Wind | ✅ SRD |
| 2 | Action Surge | ✅ SRD |
| 3 | Martial Archetype | ✅ SRD |
| 5 | Extra Attack | ✅ SRD |
| 7 | Martial Archetype Feature | ✅ SRD (shared key) |
| 9 | Indomitable | ✅ SRD |
| 10 | Martial Archetype Feature | ✅ SRD (shared key) |
| 11 | Extra Attack (2) | ✅ SRD |
| 13 | Indomitable (2) | ✅ SRD |
| 15 | Martial Archetype Feature | ✅ SRD (shared key) |
| 17 | Action Surge (2) | ✅ SRD |
| 17 | Indomitable (3) | ✅ SRD |
| 18 | Martial Archetype Feature | ✅ SRD (shared key) |
| 20 | Extra Attack (3) | ✅ SRD |

### Monk

| Level | Feature | Status |
|---|---|---|
| 1 | Unarmored Defense | ✅ SRD |
| 1 | Martial Arts | ✅ SRD |
| 2 | Ki | ✅ SRD |
| 2 | Unarmored Movement | ✅ SRD |
| 3 | Monastic Tradition | ✅ SRD |
| 3 | Deflect Missiles | ✅ SRD |
| 4 | Slow Fall | ✅ SRD |
| 5 | Extra Attack | ✅ SRD |
| 5 | Stunning Strike | ✅ SRD |
| 6 | Ki-Empowered Strikes | ✅ SRD |
| 6 | Tradition Feature | ✅ SRD (shared key) |
| 7 | Evasion | ✅ SRD |
| 7 | Stillness of Mind | ✅ SRD |
| 9 | Unarmored Movement Improvement | ✅ SRD |
| 10 | Purity of Body | ✅ SRD |
| 10 | Tradition Feature | ✅ SRD (shared key) |
| 11 | Tongue of the Sun and Moon | ✅ SRD |
| 13 | Diamond Soul | ✅ SRD |
| 14 | Timeless Body | ✅ SRD |
| 15 | Empty Body | ✅ SRD |
| 15 | Tradition Feature | ✅ SRD (shared key) |
| 18 | Tradition Feature | ✅ SRD (shared key) |
| 20 | Perfect Self | ✅ SRD |

### Paladin

| Level | Feature | Status |
|---|---|---|
| 1 | Divine Sense | ✅ SRD |
| 1 | Lay on Hands | ✅ SRD |
| 2 | Fighting Style | ✅ SRD |
| 2 | Spellcasting | ✅ SRD |
| 2 | Divine Smite | ✅ SRD |
| 3 | Divine Health | ✅ SRD |
| 3 | Sacred Oath | ✅ SRD |
| 3 | Channel Divinity | ✅ SRD |
| 5 | Extra Attack | ✅ SRD |
| 6 | Aura of Protection | ✅ SRD |
| 7 | Sacred Oath Feature | ✅ SRD (shared key) |
| 10 | Aura of Courage | ✅ SRD |
| 11 | Improved Divine Smite | ✅ SRD |
| 14 | Cleansing Touch | ✅ SRD |
| 15 | Sacred Oath Feature | ✅ SRD (shared key) |
| 18 | Aura Improvements | ✅ SRD |
| 20 | Sacred Oath Feature | ✅ SRD (shared key) |

*7 extra featureDescriptions keys (Paladin's Smite, Faithful Steed, Abjure Foes,
Radiant Strikes, Restoring Touch, Aura Expansion, Epic Boon) are PHB24-specific
orphans — not in SRD featuresByLevel but populated as Aurora fallbacks for PHB24
Paladin characters. Harmless.*

---

## Zero-Coverage Classes (Action Required)

Legend: ✅ SRD | 🟡 Aurora fallback | ❌ No description

### Ranger

19 total entries. 0 SRD descriptions. ~11 covered by Aurora fallback.
**8 entries have no description anywhere.**

| Level | Feature | Status | Notes |
|---|---|---|---|
| 1 | Favored Enemy | 🟡 Aurora | — |
| 1 | Natural Explorer | 🟡 Aurora | — |
| 2 | Fighting Style | 🟡 Aurora | — |
| 2 | Spellcasting | 🟡 Aurora | — |
| 3 | Ranger Archetype | 🟡 Aurora | — |
| 3 | Primeval Awareness | 🟡 Aurora | — |
| 5 | Extra Attack | 🟡 Aurora | — |
| 6 | Favored Enemy (2) | ❌ None | Variant suffix; Aurora has base name only |
| 6 | Natural Explorer (2) | ❌ None | Variant suffix |
| 7 | Ranger Archetype Feature | ❌ None | Generic placeholder; appears ×3 |
| 8 | Land's Stride | 🟡 Aurora | — |
| 10 | Hide in Plain Sight | 🟡 Aurora | — |
| 10 | Natural Explorer (3) | ❌ None | Variant suffix |
| 11 | Ranger Archetype Feature | ❌ None | Shared key with L7, L15 |
| 14 | Vanish | 🟡 Aurora | — |
| 14 | Favored Enemy (3) | ❌ None | Variant suffix |
| 15 | Ranger Archetype Feature | ❌ None | Shared key with L7, L11 |
| 18 | Feral Senses | 🟡 Aurora | — |
| 20 | Foe Slayer | ❌ None | Capstone; no Aurora match |

**Descriptions to write (6 unique entries cover 8 blanks):**
1. `"Ranger Archetype Feature"` — covers L7, L11, L15
2. `"Favored Enemy (2)"` — or extend Favored Enemy description
3. `"Favored Enemy (3)"`
4. `"Natural Explorer (2)"` — or extend Natural Explorer description
5. `"Natural Explorer (3)"`
6. `"Foe Slayer"`

---

### Rogue

16 total entries. 0 SRD descriptions. ~11 covered by Aurora fallback.
**5 entries have no description anywhere.**

| Level | Feature | Status | Notes |
|---|---|---|---|
| 1 | Expertise | 🟡 Aurora | — |
| 1 | Sneak Attack | 🟡 Aurora | — |
| 1 | Thieves' Cant | 🟡 Aurora | — |
| 2 | Cunning Action | 🟡 Aurora | — |
| 3 | Roguish Archetype | 🟡 Aurora | — |
| 5 | Uncanny Dodge | 🟡 Aurora | — |
| 6 | Expertise (2) | ❌ None | Variant suffix |
| 7 | Evasion | 🟡 Aurora | — |
| 9 | Roguish Archetype Feature | ❌ None | Generic placeholder; appears ×3 |
| 11 | Reliable Talent | 🟡 Aurora | — |
| 13 | Roguish Archetype Feature | ❌ None | Shared key |
| 14 | Blindsense | 🟡 Aurora | — |
| 15 | Slippery Mind | ❌ None | Probably not in Aurora |
| 17 | Roguish Archetype Feature | ❌ None | Shared key |
| 18 | Elusive | 🟡 Aurora | — |
| 20 | Stroke of Luck | ❌ None | Capstone; uncertain Aurora coverage |

**Descriptions to write (4 unique entries cover 5 blanks):**
1. `"Roguish Archetype Feature"` — covers L9, L13, L17
2. `"Expertise (2)"`
3. `"Slippery Mind"`
4. `"Stroke of Luck"`

---

### Sorcerer

10 total entries. 0 SRD descriptions. ~5 covered by Aurora fallback.
**5 entries have no description anywhere.**

| Level | Feature | Status | Notes |
|---|---|---|---|
| 1 | Spellcasting | 🟡 Aurora | — |
| 1 | Sorcerous Origin | 🟡 Aurora | — |
| 2 | Font of Magic | 🟡 Aurora | — |
| 3 | Metamagic | 🟡 Aurora | — |
| 6 | Sorcerous Origin Feature | ❌ None | Generic placeholder; appears ×3 |
| 10 | Metamagic (2) | ❌ None | Variant suffix |
| 14 | Sorcerous Origin Feature | ❌ None | Shared key |
| 17 | Metamagic (3) | ❌ None | Variant suffix |
| 18 | Sorcerous Origin Feature | ❌ None | Shared key |
| 20 | Sorcerous Restoration | 🟡 Aurora | — |

**Descriptions to write (3 unique entries cover 5 blanks):**
1. `"Sorcerous Origin Feature"` — covers L6, L14, L18
2. `"Metamagic (2)"` — or extend Metamagic description
3. `"Metamagic (3)"`

---

### Warlock

12 total entries. 0 SRD descriptions. ~5 covered by Aurora fallback.
**7 entries have no description anywhere.**

| Level | Feature | Status | Notes |
|---|---|---|---|
| 1 | Otherworldly Patron | 🟡 Aurora | — |
| 1 | Pact Magic | 🟡 Aurora | — |
| 2 | Eldritch Invocations | 🟡 Aurora | — |
| 3 | Pact Boon | 🟡 Aurora | — |
| 6 | Otherworldly Patron Feature | ❌ None | Generic placeholder; appears ×3 |
| 10 | Otherworldly Patron Feature | ❌ None | Shared key |
| 11 | Mystic Arcanum (6th level) | ❌ None | No Aurora name match |
| 13 | Mystic Arcanum (7th level) | ❌ None | — |
| 14 | Otherworldly Patron Feature | ❌ None | Shared key |
| 15 | Mystic Arcanum (8th level) | ❌ None | — |
| 17 | Mystic Arcanum (9th level) | ❌ None | — |
| 20 | Eldritch Master | 🟡 Aurora | — |

**Descriptions to write (5 unique entries cover 7 blanks):**
1. `"Otherworldly Patron Feature"` — covers L6, L10, L14
2. `"Mystic Arcanum (6th level)"`
3. `"Mystic Arcanum (7th level)"`
4. `"Mystic Arcanum (8th level)"`
5. `"Mystic Arcanum (9th level)"`

---

### Wizard

8 total entries. 0 SRD descriptions. ~5 covered by Aurora fallback.
**3 entries have no description anywhere.**

| Level | Feature | Status | Notes |
|---|---|---|---|
| 1 | Spellcasting | 🟡 Aurora | — |
| 1 | Arcane Recovery | 🟡 Aurora | — |
| 2 | Arcane Tradition | 🟡 Aurora | — |
| 6 | Arcane Tradition Feature | ❌ None | Generic placeholder; appears ×3 |
| 10 | Arcane Tradition Feature | ❌ None | Shared key |
| 14 | Arcane Tradition Feature | ❌ None | Shared key |
| 18 | Spell Mastery | 🟡 Aurora | — |
| 20 | Signature Spells | 🟡 Aurora | — |

**Descriptions to write (1 unique entry covers 3 blanks):**
1. `"Arcane Tradition Feature"` — covers L6, L10, L14

---

## Priority Queue for Bug 2

Ordered by SRD-only user impact (characters with no Aurora import see these as blank):

| Priority | Class | Entries needed | Unique descriptions | Effort |
|---|---|---|---|---|
| 1 | Wizard | 3 | 1 | 15 min |
| 2 | Sorcerer | 5 | 3 | 30 min |
| 3 | Rogue | 5 | 4 | 45 min |
| 4 | Ranger | 8 | 6 | 1 hour |
| 5 | Warlock | 7 | 5 | 45 min |

**Total remaining work for Bug 2: 17 unique description additions covering 28 blank feature entries.**

Suggested description content for the 17 entries is derivable from the SRD
Open Game Content — each entry is a short summary (1–3 sentences). The existing
Barbarian/Cleric/etc. descriptions in `lib/content/srd/classes.ts` serve as style
reference.

---

## Notes on Generic Placeholder Names

Entries named "X Archetype Feature", "X Feature", "X Origin Feature" etc. are
intentional placeholder names in SRD `featuresByLevel`. They represent
"your subclass grants a feature here" — the actual subclass feature has its own
name and is surfaced separately. The appropriate description for all of these is:

> "Your [subclass name] grants you an additional feature at this level."

Writing this once per class covers all occurrences of the placeholder name.
