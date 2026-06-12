import type { FeatureDef } from "@/lib/features/types";

// ─── L1 ───────────────────────────────────────────────────────────────────────

export const BARBARIAN_RAGE: FeatureDef = {
  id: "barbarian-rage",
  name: "Rage",
  source: "SRD",
  origin: { kind: "class", classId: "ID_CLASS_BARBARIAN", level: 1 },
  prose: {
    fallback: "Enter a rage as a bonus action. While raging you gain advantage on STR checks and saves, bonus damage, and resistance to physical damage. Lasts 1 minute.",
    // PHB24 prose — transcribed from 2024 Player's Handbook. Verify in chunk 9.
    phb24: `You can imbue yourself with a primal power called Rage, a force that grants you extraordinary might and resilience. You can enter it as a Bonus Action if you aren't wearing Heavy armor.

You can enter your Rage the number of times shown for your Barbarian level in the Rages column of the Barbarian Features table. You regain one expended use when you finish a Short Rest, and you regain all expended uses when you finish a Long Rest.

While active, your Rage follows the rules below.

Damage Resistance. You have Resistance to Bludgeoning, Piercing, and Slashing damage.

Rage Damage. When you make an attack using Strength—with either a weapon or an Unarmed Strike—and deal damage to the target, you gain a bonus to the damage that increases as you gain levels as a Barbarian, as shown in the Rage Damage column of the Barbarian Features table.

Strength Advantage. You have Advantage on Strength checks and Strength saving throws.

No Concentration or Spells. You can't maintain Concentration, and you can't cast spells.

Duration. The Rage lasts until the end of your next turn, and it ends early if you don Heavy armor or have the Incapacitated condition. If your Rage is still active on your next turn, you can extend the Rage for another round by doing one of the following:

- Make an attack roll against an enemy.
- Force an enemy to make a saving throw.
- Take a Bonus Action to extend your Rage.

Each time the Rage is extended, it lasts until the end of your next turn. You can maintain a Rage for up to 10 minutes.`,
  },
  actionType: "bonus_action",
  actionTypeSource: "tagged",
  resource: {
    id: "rage",
    shape: { kind: "charges", max: { from: "class-table", classId: "barbarian", column: "rages" } },
    // TODO: PHB24 also grants 1 rage on short rest; the legacy path doesn't model this either.
    recharge: { on: "long-rest" },
    display: "pip",
  },
  // TODO chunk 9b: add resistance/save-advantage effects conditional on while_raging once
  // the EffectCondition while_raging path is wired through resistance and save-advantage kinds.
};

export const BARBARIAN_UNARMORED_DEFENSE: FeatureDef = {
  id: "barbarian-unarmored-defense",
  name: "Unarmored Defense",
  source: "SRD",
  origin: { kind: "class", classId: "ID_CLASS_BARBARIAN", level: 1 },
  prose: {
    fallback: "While not wearing armor, your AC equals 10 + your Dexterity modifier + your Constitution modifier. You may still use a shield.",
    // PHB24 prose — transcribed from 2024 Player's Handbook. Verify in chunk 9.
    phb24: "While you aren't wearing any armor, your Armor Class equals 10 plus your Dexterity and Constitution modifiers. You can use a Shield and still gain this benefit.",
  },
  actionType: "passive",
  actionTypeSource: "tagged",
  effects: [
    // deriveStats consumer TODO — type encoded now, calc wiring follows.
    { kind: "ac-base", formula: "10+dex+con", condition: { not_wearing: "any-armor" } },
  ],
};

// PHB24 prose — transcribed from 2024 Player's Handbook. Verify in chunk 9.
export const BARBARIAN_WEAPON_MASTERY: FeatureDef = {
  id: "barbarian-weapon-mastery",
  name: "Weapon Mastery",
  source: "SRD",
  origin: { kind: "class", classId: "ID_CLASS_BARBARIAN", level: 1 },
  prose: {
    fallback: "Your training with weapons allows you to use the mastery properties of two kinds of Simple or Martial weapons of your choice. Whenever you finish a Long Rest, you can change one of the weapon types you chose.",
  },
  actionType: "passive",
  actionTypeSource: "tagged",
  // Weapon-mastery picker UI is a stub (returns null). TODO: implement picker.
  choices: [{ kind: "weapon-mastery", count: 2, pool: "any", rePickOn: "long-rest" }],
};

// ─── L2 ───────────────────────────────────────────────────────────────────────

export const BARBARIAN_DANGER_SENSE: FeatureDef = {
  id: "barbarian-danger-sense",
  name: "Danger Sense",
  source: "SRD",
  origin: { kind: "class", classId: "ID_CLASS_BARBARIAN", level: 2 },
  prose: {
    fallback: "You have advantage on Dexterity saving throws against effects you can see, such as traps and spells, while not blinded, deafened, or incapacitated.",
    // PHB24 prose — transcribed from 2024 Player's Handbook. Verify in chunk 9.
    phb24: "You gain an extraordinary sense of the danger around you, giving you an edge when you dodge peril. You have Advantage on Dexterity saving throws unless you have the Incapacitated condition.",
  },
  actionType: "passive",
  actionTypeSource: "tagged",
  // Conditional DEX save advantage can't be encoded precisely with current save-advantage kind.
  // Prose-only for now; effect encoding deferred to a future chunk.
};

export const BARBARIAN_RECKLESS_ATTACK: FeatureDef = {
  id: "barbarian-reckless-attack",
  name: "Reckless Attack",
  source: "SRD",
  origin: { kind: "class", classId: "ID_CLASS_BARBARIAN", level: 2 },
  prose: {
    fallback: "When making your first attack on your turn, you can choose to attack recklessly: advantage on all Strength-based melee attack rolls this turn, but attack rolls against you also have advantage until your next turn.",
    // PHB24 prose — transcribed from 2024 Player's Handbook. Verify in chunk 9.
    phb24: "If you make an attack roll using Strength, you can attack recklessly. When you do, you gain Advantage on the attack roll and any other Strength-based attack rolls you make until the end of the current turn, but attack rolls against you have Advantage until the start of your next turn.",
  },
  actionType: "special",
  actionTypeSource: "tagged",
};

// ─── L3 ───────────────────────────────────────────────────────────────────────

// PHB24 prose — transcribed from 2024 Player's Handbook. Verify in chunk 9.
export const BARBARIAN_PRIMAL_KNOWLEDGE: FeatureDef = {
  id: "barbarian-primal-knowledge",
  name: "Primal Knowledge",
  source: "SRD",
  origin: { kind: "class", classId: "ID_CLASS_BARBARIAN", level: 3 },
  prose: {
    fallback: "You gain proficiency in one skill of your choice from the following list: Animal Handling, Athletics, Intimidation, Nature, Perception, or Survival.",
  },
  actionType: "passive",
  actionTypeSource: "tagged",
  choices: [{
    kind: "skill",
    from: { source: "barbarian-class-list" },
    count: 1,
    grants: "proficient",
  }],
};

// ─── L5 ───────────────────────────────────────────────────────────────────────

export const BARBARIAN_EXTRA_ATTACK: FeatureDef = {
  id: "barbarian-extra-attack",
  name: "Extra Attack",
  source: "SRD",
  origin: { kind: "class", classId: "ID_CLASS_BARBARIAN", level: 5 },
  prose: {
    fallback: "You can attack twice instead of once whenever you take the Attack action on your turn.",
    // PHB24 prose — transcribed from 2024 Player's Handbook. Verify in chunk 9.
    phb24: "You can attack twice instead of once whenever you take the Attack action on your turn.",
  },
  actionType: "passive",
  actionTypeSource: "tagged",
  // No FeatureEffect kind for "extra attack" — prose conveys the mechanic.
};

export const BARBARIAN_FAST_MOVEMENT: FeatureDef = {
  id: "barbarian-fast-movement",
  name: "Fast Movement",
  source: "SRD",
  origin: { kind: "class", classId: "ID_CLASS_BARBARIAN", level: 5 },
  prose: {
    fallback: "Your speed increases by 10 feet while you aren't wearing heavy armor.",
    // PHB24 prose — transcribed from 2024 Player's Handbook. Verify in chunk 9.
    phb24: "Your Speed increases by 10 feet while you aren't wearing Heavy armor.",
  },
  actionType: "passive",
  actionTypeSource: "tagged",
  effects: [
    { kind: "speed", op: "add", value: 10, condition: { not_wearing: "heavy-armor" } },
  ],
};

// ─── L7 ───────────────────────────────────────────────────────────────────────

export const BARBARIAN_FERAL_INSTINCT: FeatureDef = {
  id: "barbarian-feral-instinct",
  name: "Feral Instinct",
  source: "SRD",
  origin: { kind: "class", classId: "ID_CLASS_BARBARIAN", level: 7 },
  prose: {
    fallback: "You have advantage on Initiative rolls. If surprised at the start of combat and aren't incapacitated, you can act normally on your first turn, but only if you enter your Rage before doing anything else.",
    // PHB24 prose — transcribed from 2024 Player's Handbook. Verify in chunk 9.
    phb24: "Your instincts are so honed that you have Advantage on Initiative rolls.",
  },
  actionType: "passive",
  actionTypeSource: "tagged",
  effects: [
    // deriveStats consumer TODO — initiative-advantage display/calc wiring follows.
    { kind: "initiative-advantage" },
  ],
};

// PHB24 prose — transcribed from 2024 Player's Handbook. Verify in chunk 9.
export const BARBARIAN_INSTINCTIVE_POUNCE: FeatureDef = {
  id: "barbarian-instinctive-pounce",
  name: "Instinctive Pounce",
  source: "SRD",
  origin: { kind: "class", classId: "ID_CLASS_BARBARIAN", level: 7 },
  prose: {
    fallback: "As part of the Bonus Action you take to enter your Rage, you can move up to half your Speed.",
  },
  actionType: "passive",
  actionTypeSource: "tagged",
};

// ─── L9 ───────────────────────────────────────────────────────────────────────

// PHB24 prose — transcribed from 2024 Player's Handbook. Verify in chunk 9.
export const BARBARIAN_BRUTAL_STRIKE: FeatureDef = {
  id: "barbarian-brutal-strike",
  name: "Brutal Strike",
  source: "SRD",
  origin: { kind: "class", classId: "ID_CLASS_BARBARIAN", level: 9 },
  // SRD named this feature "Brutal Critical" — suppress it in Path B dedup.
  legacyNames: ["Brutal Critical"],
  prose: {
    fallback: `If you use Reckless Attack, you can forgo any Advantage on one Strength-based attack roll of your choice on your turn. The chosen attack roll mustn't have Disadvantage. If the chosen attack roll hits, the target takes an extra 1d10 damage of the same type dealt by the weapon or Unarmed Strike, and you can cause one Brutal Strike effect of your choice. You have the following effect options.

Forceful Blow. The target is pushed 15 feet straight away from you. You can then move up to half your Speed straight toward the target without provoking Opportunity Attacks.

Hamstring Blow. The target's Speed is reduced by 15 feet until the start of your next turn. A target can be affected by only one Hamstring Blow at a time—the most recent one.`,
  },
  actionType: "special",
  actionTypeSource: "tagged",
};

// ─── L11 ──────────────────────────────────────────────────────────────────────

export const BARBARIAN_RELENTLESS_RAGE: FeatureDef = {
  id: "barbarian-relentless-rage",
  name: "Relentless Rage",
  source: "SRD",
  origin: { kind: "class", classId: "ID_CLASS_BARBARIAN", level: 11 },
  prose: {
    fallback: "If you drop to 0 Hit Points while raging and don't die outright, make a DC 10 Constitution saving throw. On a success, drop to 1 Hit Point instead. Each time you use this feature after the first, the DC increases by 5; it resets to 10 when you finish a Long Rest.",
    // PHB24 prose — transcribed from 2024 Player's Handbook. Verify in chunk 9.
    phb24: "If you drop to 0 Hit Points while your Rage is active and you don't die outright, you can make a DC 10 Constitution saving throw. If you succeed, your Hit Points instead change to 1. Each time you use this feature after the first, the DC increases by 5. When you finish a Short or Long Rest, the DC resets to 10.",
  },
  actionType: "situational",
  actionTypeSource: "tagged",
};

// ─── L13 ──────────────────────────────────────────────────────────────────────

// PHB24 prose — transcribed from 2024 Player's Handbook. Verify in chunk 9.
export const BARBARIAN_IMPROVED_BRUTAL_STRIKE: FeatureDef = {
  id: "barbarian-improved-brutal-strike",
  name: "Improved Brutal Strike",
  source: "SRD",
  origin: { kind: "class", classId: "ID_CLASS_BARBARIAN", level: 13 },
  parentFeatureId: "barbarian-brutal-strike",
  augments: "extend",
  // SRD named this slot "Brutal Critical (2)".
  legacyNames: ["Brutal Critical (2)"],
  prose: {
    fallback: `You have honed new ways to attack furiously. The following effects are now among your Brutal Strike options.

Staggering Blow. The target has Disadvantage on the next saving throw it makes, and it can't make Opportunity Attacks until the start of your next turn.

Sundering Blow. Before the start of your next turn, the next attack roll made by another creature against the target gains a +5 bonus to the roll. An attack roll can gain only one Sundering Blow bonus.`,
  },
  actionType: "special",
  actionTypeSource: "tagged",
};

// ─── L15 ──────────────────────────────────────────────────────────────────────

export const BARBARIAN_PERSISTENT_RAGE: FeatureDef = {
  id: "barbarian-persistent-rage",
  name: "Persistent Rage",
  source: "SRD",
  origin: { kind: "class", classId: "ID_CLASS_BARBARIAN", level: 15 },
  prose: {
    fallback: "Your rage ends early only if you fall unconscious or choose to end it.",
    // PHB24 prose — transcribed from 2024 Player's Handbook. Verify in chunk 9.
    phb24: "When you roll Initiative, you can regain all expended uses of Rage. After you regain uses of Rage in this way, you can't do so again until you finish a Long Rest.",
  },
  actionType: "passive",
  actionTypeSource: "tagged",
};

// ─── L17 ──────────────────────────────────────────────────────────────────────

// PHB24 names both the L13 and L17 upgrades as "Improved Brutal Strike".
// PHB24 prose — transcribed from 2024 Player's Handbook. Verify in chunk 9.
export const BARBARIAN_IMPROVED_BRUTAL_STRIKE_L17: FeatureDef = {
  id: "barbarian-improved-brutal-strike-l17",
  name: "Improved Brutal Strike",
  source: "SRD",
  origin: { kind: "class", classId: "ID_CLASS_BARBARIAN", level: 17 },
  parentFeatureId: "barbarian-brutal-strike",
  augments: "extend",
  // SRD named this slot "Brutal Critical (3)".
  legacyNames: ["Brutal Critical (3)"],
  prose: {
    fallback: `You have honed yet more ways to attack furiously. The following effects are now among your Brutal Strike options.

Blitz. After you use Brutal Strike, you can use a Bonus Action to move up to half your Speed without provoking Opportunity Attacks.

Overpowering Strike. The target must succeed on a Strength saving throw (DC equal to 8 plus your Proficiency Bonus and Strength modifier) or be pushed 10 feet away from you and have the Prone condition.`,
  },
  actionType: "special",
  actionTypeSource: "tagged",
};

// ─── L18 ──────────────────────────────────────────────────────────────────────

export const BARBARIAN_INDOMITABLE_MIGHT: FeatureDef = {
  id: "barbarian-indomitable-might",
  name: "Indomitable Might",
  source: "SRD",
  origin: { kind: "class", classId: "ID_CLASS_BARBARIAN", level: 18 },
  prose: {
    fallback: "If your total for a Strength check is less than your Strength score, you can use your Strength score in place of the total.",
    // PHB24 prose — transcribed from 2024 Player's Handbook. Verify in chunk 9.
    phb24: "If your total for a Strength check or Strength saving throw is less than your Strength score, you can use that score in place of the total.",
  },
  actionType: "passive",
  actionTypeSource: "tagged",
  // ability-check-floor effect kind deferred — single-feature quirk, prose conveys the mechanic.
};

// ─── L20 ──────────────────────────────────────────────────────────────────────

export const BARBARIAN_PRIMAL_CHAMPION: FeatureDef = {
  id: "barbarian-primal-champion",
  name: "Primal Champion",
  source: "SRD",
  origin: { kind: "class", classId: "ID_CLASS_BARBARIAN", level: 20 },
  prose: {
    fallback: "Your Strength and Constitution scores each increase by 4. Their maximums also increase by 4.",
    // PHB24 prose — transcribed from 2024 Player's Handbook. Verify in chunk 9.
    phb24: "You embody primal power. Your Strength and Constitution scores increase by 4, and their maximum is now 25.",
  },
  actionType: "passive",
  actionTypeSource: "tagged",
  effects: [
    { kind: "ability", ability: "str", op: "add", value: 4, cap: 25 },
    { kind: "ability", ability: "con", op: "add", value: 4, cap: 25 },
  ],
};
