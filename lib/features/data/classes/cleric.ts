import type { FeatureDef } from "@/lib/features/types";

export const CLERIC_CHANNEL_DIVINITY: FeatureDef = {
  id: "cleric-channel-divinity",
  name: "Channel Divinity",
  source: "SRD",
  origin: { kind: "class", classId: "ID_CLASS_CLERIC", level: 2 },
  legacyNames: ["Channel Divinity (2)", "Channel Divinity (3)"],
  prose: {
    fallback: "Channel divine energy to fuel a magical effect. You gain uses based on Cleric level: 1 at L2, 2 at L6, 3 at L18 (SRD). Recharges on a Short Rest or Long Rest.",
  },
  actionType: "action",
  actionTypeSource: "tagged",
  resource: {
    id: "channel_divinity",
    shape: { kind: "charges", max: { from: "class-table", classId: "cleric", column: "channelDivinityUses" } },
    recharge: { on: "long-rest", partialOn: "short-rest", amount: 1 },
    display: "pip",
  },
};

export const CLERIC_SPELLCASTING: FeatureDef = {
  id: "cleric-spellcasting",
  name: "Spellcasting",
  source: "SRD",
  origin: { kind: "class", classId: "ID_CLASS_CLERIC", level: 1 },
  prose: {
    fallback: "You cast Cleric spells using Wisdom as your spellcasting ability. You prepare spells from the Cleric list after each Long Rest, choosing from spells whose level is no higher than your highest spell slot. (Spellcasting system integration deferred.)",
  },
  actionType: "passive",
  actionTypeSource: "tagged",
};

export const CLERIC_DIVINE_ORDER: FeatureDef = {
  id: "cleric-divine-order",
  name: "Divine Order",
  source: "SRD",
  origin: { kind: "class", classId: "ID_CLASS_CLERIC", level: 1 },
  prose: {
    fallback: "Choose your divine calling: Protector or Thaumaturge.",
  },
  actionType: "passive",
  actionTypeSource: "tagged",
  choices: [
    {
      kind: "mode",
      affects: "divine-order",
      options: [
        {
          id: "protector",
          label: "Protector",
          prose: "You gain proficiency with Martial weapons and Heavy armor.",
        },
        {
          id: "thaumaturge",
          label: "Thaumaturge",
          prose: "You know one extra cantrip from the Cleric spell list. Additionally, your mystical connection gives you a +1 bonus to your spellcasting ability checks and spell save DC.",
        },
      ],
    },
  ],
};

export const CLERIC_DESTROY_UNDEAD: FeatureDef = {
  id: "cleric-destroy-undead",
  name: "Destroy Undead",
  source: "SRD",
  origin: { kind: "class", classId: "ID_CLASS_CLERIC", level: 5 },
  legacyNames: ["Destroy Undead (CR 1)", "Destroy Undead (CR 2)", "Destroy Undead (CR 3)", "Destroy Undead (CR 4)"],
  prose: {
    fallback: "When you use Turn Undead and an undead fails its saving throw, it is destroyed if its CR is at or below the threshold for your level: CR 1/2 (L5), CR 1 (L8), CR 2 (L11), CR 3 (L14), CR 4 (L17).",
  },
  actionType: "passive",
  actionTypeSource: "tagged",
  effects: [
    {
      kind: "scaling-stat",
      stat: "destroy-undead-cr",
      formula: {
        by: "class-level",
        classId: "ID_CLASS_CLERIC",
        table: { 5: "1/2", 8: "1", 11: "2", 14: "3", 17: "4" },
      },
    },
  ],
};

export const CLERIC_BLESSED_STRIKES: FeatureDef = {
  id: "cleric-blessed-strikes",
  name: "Blessed Strikes",
  source: "SRD",
  origin: { kind: "class", classId: "ID_CLASS_CLERIC", level: 7 },
  prose: {
    fallback: "Choose how divine power manifests in your attacks: Divine Strike (extra radiant damage on weapon hits once per turn) or Potent Spellcasting (add Wisdom modifier to Cleric cantrip damage).",
  },
  actionType: "passive",
  actionTypeSource: "tagged",
  choices: [
    {
      kind: "mode",
      affects: "blessed-strikes",
      options: [
        {
          id: "divine-strike",
          label: "Divine Strike",
          prose: "Once per turn when you hit a creature with a weapon attack, you can cause it to deal an extra 1d8 radiant damage (2d8 at L14).",
          inheritedBy: ["cleric-improved-blessed-strikes"],
        },
        {
          id: "potent-spellcasting",
          label: "Potent Spellcasting",
          prose: "You add your Wisdom modifier to the damage you deal with any Cleric cantrip.",
        },
      ],
    },
  ],
};

export const CLERIC_DIVINE_INTERVENTION: FeatureDef = {
  id: "cleric-divine-intervention",
  name: "Divine Intervention",
  source: "SRD",
  origin: { kind: "class", classId: "ID_CLASS_CLERIC", level: 10 },
  prose: {
    fallback: "As an action, implore your deity to intervene. Roll percentile dice; if you roll at or below your Cleric level, your deity intervenes (DM determines how). Once intervention occurs, you must finish a Long Rest before you can use this feature again. At L20 the intervention always succeeds.",
    srd: "Beginning at 10th level, you can call on your deity to intervene on your behalf when your need is great.",
  },
  actionType: "action",
  actionTypeSource: "tagged",
  resource: {
    id: "divine_intervention",
    shape: { kind: "charges", max: 1 },
    recharge: { on: "long-rest" },
    display: "pip",
  },
};

export const CLERIC_IMPROVED_BLESSED_STRIKES: FeatureDef = {
  id: "cleric-improved-blessed-strikes",
  name: "Improved Blessed Strikes",
  source: "SRD",
  origin: { kind: "class", classId: "ID_CLASS_CLERIC", level: 14 },
  prose: {
    fallback: "Your Blessed Strikes improve. Divine Strike now deals 2d8 extra radiant damage per turn. Potent Spellcasting now lets you add your Wisdom modifier to the damage of one roll of any Cleric spell, not just cantrips.",
  },
  actionType: "passive",
  actionTypeSource: "tagged",
  parentFeatureId: "cleric-blessed-strikes",
  augments: "extend",
};

export const CLERIC_DIVINE_INTERVENTION_IMPROVEMENT: FeatureDef = {
  id: "cleric-divine-intervention-improvement",
  name: "Divine Intervention",
  source: "SRD",
  origin: { kind: "class", classId: "ID_CLASS_CLERIC", level: 20 },
  prose: {
    fallback: "Your call for Divine Intervention now automatically succeeds — no roll required.",
    srd: "At 20th level, your call for intervention succeeds automatically, no roll required.",
  },
  actionType: "passive",
  actionTypeSource: "tagged",
  parentFeatureId: "cleric-divine-intervention",
  augments: "extend",
};
