import type { FeatureDef } from "@/lib/features/types";

export const WILD_SHAPE: FeatureDef = {
  id: "druid-wild-shape",
  name: "Wild Shape",
  source: "SRD",
  origin: { kind: "class", classId: "ID_CLASS_DRUID", level: 2 },
  prose: {
    fallback: "As an action, transform into a beast you have seen. CR limit and available forms increase with level. Lasts until you run out of HP, dismiss it, or use Wild Shape again.",
  },
  actionType: "action",
  actionTypeSource: "tagged",
  resource: {
    id: "wild_shape",
    shape: { kind: "charges", max: 2 },
    recharge: { on: "short-rest" },
    display: "pip",
  },
};

export const DRUID_DRUIDIC: FeatureDef = {
  id: "druid-druidic",
  name: "Druidic",
  source: "SRD",
  origin: { kind: "class", classId: "ID_CLASS_DRUID", level: 1 },
  prose: {
    fallback: "You know Druidic, the secret language of druids. You can speak it and use it to leave hidden messages. Creatures who know Druidic automatically notice such a message; others must succeed on a DC 15 Wisdom (Perception) check to spot it.",
  },
  actionType: "passive",
  actionTypeSource: "tagged",
};

export const DRUID_SPELLCASTING: FeatureDef = {
  id: "druid-spellcasting",
  name: "Spellcasting",
  source: "SRD",
  origin: { kind: "class", classId: "ID_CLASS_DRUID", level: 1 },
  prose: {
    fallback: "You cast Druid spells using Wisdom as your spellcasting ability. You prepare spells from the Druid list after each Long Rest, choosing from spells whose level is no higher than your highest spell slot. (Spellcasting system integration deferred.)",
  },
  actionType: "passive",
  actionTypeSource: "tagged",
};

export const DRUID_PRIMAL_ORDER: FeatureDef = {
  id: "druid-primal-order",
  name: "Primal Order",
  source: "SRD",
  origin: { kind: "class", classId: "ID_CLASS_DRUID", level: 1 },
  prose: {
    fallback: "Choose your initiatory rite as a druid: Magician or Warden.",
  },
  actionType: "passive",
  actionTypeSource: "tagged",
  choices: [
    {
      kind: "mode",
      affects: "primal-order",
      options: [
        {
          id: "magician",
          label: "Magician",
          prose: "You know one extra cantrip from the Druid spell list. Additionally, your mystical connection to nature gives you a +1 bonus to your spell save DC and to your attack rolls with spells.",
        },
        {
          id: "warden",
          label: "Warden",
          prose: "Trained for battle, you gain proficiency with Martial weapons and the ability to wear Medium armor.",
        },
      ],
    },
  ],
};

export const DRUID_WILD_COMPANION: FeatureDef = {
  id: "druid-wild-companion",
  name: "Wild Companion",
  source: "SRD",
  origin: { kind: "class", classId: "ID_CLASS_DRUID", level: 2 },
  prose: {
    // TODO ch10: casting Find Familiar via this feature (summons a Fey spirit familiar, no material components).
    fallback: "As a Magic action, expend a use of Wild Shape to cast Find Familiar without a spell slot or material components. The familiar takes a Fey creature form. (Familiar summon effect deferred — see ch10 grantedSpells.)",
  },
  actionType: "action",
  actionTypeSource: "tagged",
  spendsResource: { resourceId: "wild_shape", amount: 1 },
};

export const DRUID_WILD_SHAPE_IMPROVEMENT: FeatureDef = {
  id: "druid-wild-shape-improvement",
  name: "Wild Shape Improvement",
  source: "SRD",
  origin: { kind: "class", classId: "ID_CLASS_DRUID", level: 4 },
  prose: {
    fallback: "Your Wild Shape improves: the CR cap for beasts you can transform into increases to CR 1, and you can transform into beasts that have a swimming speed.",
  },
  actionType: "passive",
  actionTypeSource: "tagged",
};

export const DRUID_ELEMENTAL_FURY: FeatureDef = {
  id: "druid-elemental-fury",
  name: "Elemental Fury",
  source: "SRD",
  origin: { kind: "class", classId: "ID_CLASS_DRUID", level: 7 },
  prose: {
    fallback: "Choose how nature's raw power surges through you: Potent Spellcasting or Primal Strike.",
  },
  actionType: "passive",
  actionTypeSource: "tagged",
  choices: [
    {
      kind: "mode",
      affects: "elemental-fury",
      options: [
        {
          id: "potent-spellcasting",
          label: "Potent Spellcasting",
          prose: "You add your Wisdom modifier to the damage you deal with any Druid cantrip.",
          inheritedBy: ["druid-improved-elemental-fury"],
        },
        {
          id: "primal-strike",
          label: "Primal Strike",
          prose: "Once per turn when you hit a creature with a weapon attack, you can cause the attack to deal an extra 1d8 cold, fire, or lightning damage (your choice).",
          inheritedBy: ["druid-improved-elemental-fury"],
        },
      ],
    },
  ],
};

export const DRUID_WILD_SHAPE_IMPROVEMENT_2: FeatureDef = {
  id: "druid-wild-shape-improvement-2",
  name: "Wild Shape Improvement",
  source: "SRD",
  origin: { kind: "class", classId: "ID_CLASS_DRUID", level: 8 },
  legacyNames: ["Wild Shape Improvement (2)"],
  prose: {
    fallback: "Your Wild Shape improves further: the CR cap increases to CR 2, and you can transform into beasts that have a flying speed.",
  },
  actionType: "passive",
  actionTypeSource: "tagged",
};

export const DRUID_IMPROVED_ELEMENTAL_FURY: FeatureDef = {
  id: "druid-improved-elemental-fury",
  name: "Improved Elemental Fury",
  source: "SRD",
  origin: { kind: "class", classId: "ID_CLASS_DRUID", level: 15 },
  prose: {
    fallback: "Your Elemental Fury improves. Potent Spellcasting: add your Wisdom modifier to the damage of one roll of any Druid spell, not just cantrips. Primal Strike: the extra elemental damage increases to 2d8.",
  },
  actionType: "passive",
  actionTypeSource: "tagged",
  parentFeatureId: "druid-elemental-fury",
  augments: "extend",
};

export const DRUID_TIMELESS_BODY: FeatureDef = {
  id: "druid-timeless-body",
  name: "Timeless Body",
  source: "SRD",
  origin: { kind: "class", classId: "ID_CLASS_DRUID", level: 18 },
  prose: {
    fallback: "The primal magic you wield causes you to age more slowly. For every 10 years that pass, your body ages only 1 year.",
    srd: "Starting at 18th level, the primal magic that you wield causes you to age more slowly. For every 10 years that pass, your body ages only 1 year.",
  },
  actionType: "passive",
  actionTypeSource: "tagged",
};

export const DRUID_BEAST_SPELLS: FeatureDef = {
  id: "druid-beast-spells",
  name: "Beast Spells",
  source: "SRD",
  origin: { kind: "class", classId: "ID_CLASS_DRUID", level: 18 },
  prose: {
    fallback: "You can cast many of your Druid spells in any shape you assume using Wild Shape. You can perform the somatic and verbal components of a Druid spell while in a beast form, but you cannot provide material components.",
    srd: "Beginning at 18th level, you can cast many of your druid spells in any shape you assume using Wild Shape.",
  },
  actionType: "passive",
  actionTypeSource: "tagged",
};

export const DRUID_ARCHDRUID: FeatureDef = {
  id: "druid-archdruid",
  name: "Archdruid",
  source: "SRD",
  origin: { kind: "class", classId: "ID_CLASS_DRUID", level: 20 },
  prose: {
    fallback: "Evergreen Wild Shape: you can use Wild Shape an unlimited number of times, and you can ignore the verbal and somatic components of your Druid spells, as well as any material components that lack a cost and are not consumed by a spell.",
    srd: "At 20th level, you can use your Wild Shape an unlimited number of times.",
  },
  actionType: "passive",
  actionTypeSource: "tagged",
};

export const DRUID_ARCHDRUID_NATURE_MAGICIAN: FeatureDef = {
  id: "druid-archdruid-nature-magician",
  name: "Nature Magician",
  source: "SRD",
  origin: { kind: "class", classId: "ID_CLASS_DRUID", level: 20 },
  prose: {
    // convertsTo mechanic deferred — same pattern as Sorcery Points (chunk 9g).
    fallback: "You can expend uses of Wild Shape to regain expended spell slots. The conversion follows the same logic as converting Sorcery Points to spell slots. (convertsTo mechanic encoding deferred — parallel to Sorcery Points ch9g.)",
  },
  actionType: "passive",
  actionTypeSource: "tagged",
};

export const DRUID_ARCHDRUID_LONGEVITY: FeatureDef = {
  id: "druid-archdruid-longevity",
  name: "Longevity",
  source: "SRD",
  origin: { kind: "class", classId: "ID_CLASS_DRUID", level: 20 },
  prose: {
    fallback: "The primal magic you channel grants immunity to the frailties of old age. You cannot be aged magically, and you do not suffer the frailty effects of old age.",
  },
  actionType: "passive",
  actionTypeSource: "tagged",
};
