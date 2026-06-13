import type { FeatureDef } from "@/lib/features/types";

export const PALADIN_WEAPON_MASTERY: FeatureDef = {
  id: "paladin-weapon-mastery",
  name: "Weapon Mastery",
  source: "SRD",
  origin: { kind: "class", classId: "ID_CLASS_PALADIN", level: 1 },
  prose: { fallback: "Your training with weapons allows you to use the mastery property of two kinds of weapons of your choice. You can change which kinds of weapons you chose when you finish a Long Rest." },
  actionType: "passive",
  actionTypeSource: "tagged",
  choices: [{ kind: "weapon-mastery", count: 2, pool: "any", rePickOn: "long-rest" }],
};

export const PALADIN_DIVINE_SENSE: FeatureDef = {
  id: "paladin-divine-sense",
  name: "Divine Sense",
  source: "SRD",
  origin: { kind: "class", classId: "ID_CLASS_PALADIN", level: 1 },
  prose: {
    fallback: "As a Bonus Action, you can open your awareness to sense Celestials, Fiends, and Undead within 60 feet that aren't behind total cover. You also sense whether any place or object within 60 feet has been consecrated or desecrated. Uses = Charisma modifier + 1 per Long Rest. (Resource encoding deferred — max uses cannot yet express ability-mod+N.)",
    srd: "As an action, you can sense the presence of evil within 60 feet of you. You sense whether a place or object has been desecrated or consecrated. Uses = 1 + your Charisma modifier per long rest.",
  },
  actionType: "bonus_action",
  actionTypeSource: "tagged",
};

export const PALADIN_SPELLCASTING: FeatureDef = {
  id: "paladin-spellcasting",
  name: "Spellcasting",
  source: "SRD",
  origin: { kind: "class", classId: "ID_CLASS_PALADIN", level: 2 },
  prose: {
    fallback: "You have learned to cast Paladin spells through prayer and devout meditation. See the Paladin spell list and the Spellcasting rules for preparation, spell slots, and spellcasting ability (Charisma). (Spellcasting system integration deferred.)",
  },
  actionType: "passive",
  actionTypeSource: "tagged",
};

// PHB24 L2: Divine Smite became a spell (no longer a passive class feature).
// TODO: spell data missing from SRD_SPELLS — rendering deferred until ID_SPELL_DIVINE_SMITE is added.
export const PALADIN_DIVINE_SMITE: FeatureDef = {
  id: "paladin-divine-smite",
  name: "Divine Smite",
  source: "SRD",
  origin: { kind: "class", classId: "ID_CLASS_PALADIN", level: 2 },
  editions: ["phb24"],
  prose: {
    fallback: "When you hit a creature with a melee weapon, you can expend a Paladin spell slot to deal bonus Radiant damage: 2d8 for a 1st-level slot, +1d8 per slot level above 1st (max 5d8). Critical hits double the bonus dice.",
    phb24: "You always have the Divine Smite spell prepared. When you hit a creature with a melee weapon or an Unarmed Strike, you can expend one Paladin spell slot to smite that target, dealing 2d8 Radiant damage for a 1st-level slot, plus 1d8 per slot level above 1st (max 5d8). You can smite once per hit; criticals double the dice.",
  },
  actionType: "situational",
  actionTypeSource: "tagged",
  // TODO: spell data missing from SRD_SPELLS — rendering deferred until ID_SPELL_DIVINE_SMITE is added.
  grantedSpells: {
    spells: ["ID_SPELL_DIVINE_SMITE"],
    source: "class",
    preparation: "always-prepared",
    countsAgainstPrepared: false,
  },
};

// PHB24 L5: Faithful Steed grants Find Steed as an always-prepared spell.
// TODO: spell data missing from SRD_SPELLS — rendering deferred until ID_SPELL_FIND_STEED is added.
export const PALADIN_FIND_STEED: FeatureDef = {
  id: "paladin-find-steed",
  name: "Faithful Steed",
  source: "SRD",
  origin: { kind: "class", classId: "ID_CLASS_PALADIN", level: 5 },
  editions: ["phb24"],
  prose: {
    fallback: "You summon a spirit that assumes the form of an unusually intelligent, strong, and loyal steed, creating a long-lasting bond with it.",
    phb24: "You can call on the magic of the Outer Planes to summon a noble steed. You always have the Find Steed spell prepared. You can also cast it once without expending a spell slot, and you regain the ability to do so when you finish a Long Rest.",
  },
  actionType: "action",
  actionTypeSource: "tagged",
  // TODO: spell data missing from SRD_SPELLS — rendering deferred until ID_SPELL_FIND_STEED is added.
  grantedSpells: {
    spells: ["ID_SPELL_FIND_STEED"],
    source: "class",
    preparation: "always-prepared",
    countsAgainstPrepared: false,
  },
};

export const PALADIN_DIVINE_HEALTH: FeatureDef = {
  id: "paladin-divine-health",
  name: "Divine Health",
  source: "SRD",
  origin: { kind: "class", classId: "ID_CLASS_PALADIN", level: 3 },
  prose: { fallback: "The divine magic flowing through you makes you immune to disease." },
  actionType: "passive",
  actionTypeSource: "tagged",
};

export const PALADIN_FIGHTING_STYLE: FeatureDef = {
  id: "paladin-fighting-style",
  name: "Fighting Style",
  source: "SRD",
  origin: { kind: "class", classId: "ID_CLASS_PALADIN", level: 2 },
  prose: { fallback: "Adopt a particular style of fighting as your specialty. You can't take a Fighting Style option more than once, even if you later get to choose again." },
  actionType: "passive",
  actionTypeSource: "tagged",
  choices: [{ kind: "feat", from: { tag: "fighting-style" }, count: 1 }],
};

export const LAY_ON_HANDS: FeatureDef = {
  id: "paladin-lay-on-hands",
  name: "Lay on Hands",
  source: "SRD",
  origin: { kind: "class", classId: "ID_CLASS_PALADIN", level: 1 },
  prose: {
    fallback: "Touch a creature to restore HP from your healing pool (paladin level × 5). As an action you can also cure one disease or poison for 5 points instead. Recharges on a long rest.",
  },
  actionType: "action",
  actionTypeSource: "tagged",
  resource: {
    id: "lay_on_hands",
    shape: { kind: "pool", max: { from: "level", classId: "ID_CLASS_PALADIN", multiplier: 5 } },
    recharge: { on: "long-rest" },
    display: "number",
  },
};

export const PALADIN_CHANNEL_DIVINITY: FeatureDef = {
  id: "paladin-channel-divinity",
  name: "Channel Divinity",
  source: "SRD",
  origin: { kind: "class", classId: "ID_CLASS_PALADIN", level: 3 },
  prose: {
    fallback: "Channel divine energy granted by your Sacred Oath to fuel a magical effect. Available at level 3. Recharges on a short or long rest.",
  },
  actionType: "action",
  actionTypeSource: "tagged",
  resource: {
    id: "channel_divinity",
    shape: { kind: "charges", max: 1 },
    recharge: { on: "short-rest" },
    display: "pip",
  },
};

export const PALADIN_EXTRA_ATTACK: FeatureDef = {
  id: "paladin-extra-attack",
  name: "Extra Attack",
  source: "SRD",
  origin: { kind: "class", classId: "ID_CLASS_PALADIN", level: 5 },
  prose: { fallback: "You can attack twice instead of once when you take the Attack action on your turn." },
  actionType: "passive",
  actionTypeSource: "tagged",
  effects: [
    {
      kind: "scaling-stat",
      stat: "attacksPerAction",
      formula: { by: "class-level", classId: "ID_CLASS_PALADIN", table: { 5: 2 } },
    },
  ],
};

export const PALADIN_AURA_OF_PROTECTION: FeatureDef = {
  id: "paladin-aura-of-protection",
  name: "Aura of Protection",
  source: "SRD",
  origin: { kind: "class", classId: "ID_CLASS_PALADIN", level: 6 },
  prose: {
    fallback: `You radiate a protective, unseeable aura in a 10-foot Emanation that originates from you. The aura is inactive while you have the Incapacitated condition.

You and your allies in the aura gain a bonus to saving throws equal to your Charisma modifier (minimum bonus of +1).

If another Paladin is present, a creature can benefit from only one Aura of Protection at a time; the creature chooses which aura while in them.`,
  },
  actionType: "passive",
  actionTypeSource: "tagged",
};

export const PALADIN_ABJURE_FOES: FeatureDef = {
  id: "paladin-abjure-foes",
  name: "Abjure Foes",
  source: "SRD",
  origin: { kind: "class", classId: "ID_CLASS_PALADIN", level: 9 },
  prose: {
    fallback: "As a Magic action, you can expend one use of your Channel Divinity to overwhelm foes with awe. Each enemy of your choice that you can see within 60 feet must succeed on a Wisdom saving throw or be Frightened of you for 1 minute or until they take any damage.",
  },
  actionType: "action",
  actionTypeSource: "tagged",
  spendsResource: { resourceId: "channel_divinity", amount: 1 },
};

export const PALADIN_AURA_OF_COURAGE: FeatureDef = {
  id: "paladin-aura-of-courage",
  name: "Aura of Courage",
  source: "SRD",
  origin: { kind: "class", classId: "ID_CLASS_PALADIN", level: 10 },
  prose: {
    fallback: "You and your allies are immune to the Frightened condition while within your Aura of Protection.",
  },
  actionType: "passive",
  actionTypeSource: "tagged",
  effects: [{ kind: "condition-immunity", condition: "frightened", whileAuraActive: true }],
};

export const PALADIN_RADIANT_STRIKES: FeatureDef = {
  id: "paladin-radiant-strikes",
  name: "Radiant Strikes",
  source: "SRD",
  origin: { kind: "class", classId: "ID_CLASS_PALADIN", level: 11 },
  legacyNames: ["Improved Divine Smite"],
  prose: {
    fallback: "You are so suffused with holy power that your weapon strikes carry it with them. When you hit a target with a weapon, the target takes an extra 1d8 Radiant damage.",
    srd: "Starting at 11th level, you are so suffused with righteous might that all your melee weapon strikes carry divine power with them. Whenever you hit a creature with a melee weapon, the creature takes an extra 1d8 radiant damage.",
  },
  actionType: "passive",
  actionTypeSource: "tagged",
};

export const PALADIN_CLEANSING_TOUCH: FeatureDef = {
  id: "paladin-cleansing-touch",
  name: "Cleansing Touch",
  source: "SRD",
  origin: { kind: "class", classId: "ID_CLASS_PALADIN", level: 14 },
  prose: {
    fallback: "You can use your action to end one spell on yourself or on one willing creature that you touch. Uses per Long Rest = your Charisma modifier (minimum 1). (Resource encoding deferred — max uses cannot yet express ability-mod+N.)",
    srd: "Beginning at 14th level, you can use your action to end one spell on yourself or on one willing creature that you touch. You can use this feature a number of times equal to your Charisma modifier (minimum of once). You regain expended uses when you finish a long rest.",
  },
  actionType: "action",
  actionTypeSource: "tagged",
};

export const PALADIN_RESTORING_TOUCH: FeatureDef = {
  id: "paladin-restoring-touch",
  name: "Restoring Touch",
  source: "SRD",
  origin: { kind: "class", classId: "ID_CLASS_PALADIN", level: 14 },
  parentFeatureId: "paladin-lay-on-hands",
  augments: "extend",
  prose: {
    fallback: "When you use Lay on Hands on a creature, you can also remove one or more of the following conditions: Blinded, Charmed, Deafened, Frightened, Paralyzed, or Stunned. For each condition removed, you spend 5 hit points from your Lay on Hands healing pool.",
  },
  actionType: "action",
  actionTypeSource: "tagged",
};

export const PALADIN_AURA_EXPANSION: FeatureDef = {
  id: "paladin-aura-expansion",
  name: "Aura Expansion",
  source: "SRD",
  origin: { kind: "class", classId: "ID_CLASS_PALADIN", level: 18 },
  parentFeatureId: "paladin-aura-of-protection",
  augments: "extend",
  prose: {
    fallback: "Your Aura of Protection is now a 30-foot Emanation.",
  },
  actionType: "passive",
  actionTypeSource: "tagged",
};
