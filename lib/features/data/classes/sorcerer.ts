import type { FeatureDef } from "@/lib/features/types";

export const SORCERY_POINTS: FeatureDef = {
  id: "sorcerer-sorcery-points",
  name: "Sorcery Points",
  source: "SRD",
  origin: { kind: "class", classId: "ID_CLASS_SORCERER", level: 2 },
  legacyNames: ["Font of Magic"],
  prose: {
    fallback: "You have a pool of magical energy called Sorcery Points equal to your Sorcerer level. You can spend them to fuel Metamagic options. Recharges on a Long Rest. (Spell slot conversion via Font of Magic deferred — convertsTo not yet wired.)",
    srd: "You tap into a deep wellspring of magic within yourself. This wellspring is represented by sorcery points, which allow you to create a variety of magical effects.",
  },
  actionType: "passive",
  actionTypeSource: "tagged",
  resource: {
    id: "sorcery_points",
    shape: { kind: "points", max: { from: "level", classId: "ID_CLASS_SORCERER" } },
    recharge: { on: "long-rest" },
    display: "number",
  },
};

export const SORCERER_SPELLCASTING: FeatureDef = {
  id: "sorcerer-spellcasting",
  name: "Spellcasting",
  source: "SRD",
  origin: { kind: "class", classId: "ID_CLASS_SORCERER", level: 1 },
  prose: {
    fallback: "You cast Sorcerer spells using Charisma as your spellcasting ability. See the Sorcerer spell list and Spellcasting rules for spell slot progression and preparation. (Spellcasting system integration deferred.)",
  },
  actionType: "passive",
  actionTypeSource: "tagged",
};

export const SORCERER_INNATE_SORCERY: FeatureDef = {
  id: "sorcerer-innate-sorcery",
  name: "Innate Sorcery",
  source: "SRD",
  origin: { kind: "class", classId: "ID_CLASS_SORCERER", level: 1 },
  prose: {
    fallback: "As a Bonus Action, you can tap into the wellspring of magic within yourself. Doing so causes your eyes to shimmer and gives you Advantage on the spell attack rolls of Sorcerer spells you cast on that turn. This activation lasts until the end of the current turn. You can use this feature twice, and you regain all expended uses when you finish a Long Rest.",
  },
  actionType: "bonus_action",
  actionTypeSource: "tagged",
  resource: {
    id: "innate_sorcery",
    shape: { kind: "charges", max: 2 },
    recharge: { on: "long-rest" },
    display: "pip",
  },
};

export const SORCERER_METAMAGIC: FeatureDef = {
  id: "sorcerer-metamagic",
  name: "Metamagic",
  source: "SRD",
  origin: { kind: "class", classId: "ID_CLASS_SORCERER", level: 3 },
  prose: {
    fallback: "You gain the ability to twist your spells to suit your needs. Choose two Metamagic options. You can use only one Metamagic option on a spell when you cast it, unless the option says otherwise. (Individual Metamagic options — Careful/Distant/Empowered Spell etc. — are separate FeatureDefs deferred as a follow-up chunk, same pattern as Fighting Style feat defs in 9b.)",
  },
  actionType: "passive",
  actionTypeSource: "tagged",
  choices: [{ kind: "feat", from: { tag: "metamagic" }, count: 2 }],
};

export const SORCERER_SORCERY_INCARNATE: FeatureDef = {
  id: "sorcerer-sorcery-incarnate",
  name: "Sorcery Incarnate",
  source: "SRD",
  origin: { kind: "class", classId: "ID_CLASS_SORCERER", level: 7 },
  prose: {
    fallback: "While your Innate Sorcery feature is active, you can use up to two of your Metamagic options on each spell you cast, and you can use Metamagic even if you haven't expended a spell slot.",
  },
  actionType: "passive",
  actionTypeSource: "tagged",
};

export const SORCERER_METAMAGIC_2: FeatureDef = {
  id: "sorcerer-metamagic-2",
  name: "Metamagic",
  source: "SRD",
  origin: { kind: "class", classId: "ID_CLASS_SORCERER", level: 10 },
  legacyNames: ["Metamagic (2)"],
  prose: { fallback: "You learn two additional Metamagic options of your choice." },
  actionType: "passive",
  actionTypeSource: "tagged",
  choices: [{ kind: "feat", from: { tag: "metamagic" }, count: 2 }],
};

export const SORCERER_SORCEROUS_RESTORATION: FeatureDef = {
  id: "sorcerer-sorcerous-restoration",
  name: "Sorcerous Restoration",
  source: "SRD",
  origin: { kind: "class", classId: "ID_CLASS_SORCERER", level: 10 },
  prose: {
    fallback: "When you finish a Short Rest, you regain expended Sorcery Points, but only up to a number equal to your Proficiency Bonus. (Partial short-rest recharge encoding deferred — Recharge.amount does not yet support 'prof-bonus'.)",
  },
  actionType: "passive",
  actionTypeSource: "tagged",
};

export const SORCERER_METAMAGIC_3: FeatureDef = {
  id: "sorcerer-metamagic-3",
  name: "Metamagic",
  source: "SRD",
  origin: { kind: "class", classId: "ID_CLASS_SORCERER", level: 17 },
  legacyNames: ["Metamagic (3)"],
  prose: { fallback: "You learn two additional Metamagic options of your choice." },
  actionType: "passive",
  actionTypeSource: "tagged",
  choices: [{ kind: "feat", from: { tag: "metamagic" }, count: 2 }],
};

export const SORCERER_ARCANE_APOTHEOSIS: FeatureDef = {
  id: "sorcerer-arcane-apotheosis",
  name: "Arcane Apotheosis",
  source: "SRD",
  origin: { kind: "class", classId: "ID_CLASS_SORCERER", level: 17 },
  parentFeatureId: "sorcerer-innate-sorcery",
  augments: "extend",
  prose: {
    fallback: "While your Innate Sorcery feature is active, you can use one Metamagic option on each of your turns without expending Sorcery Points.",
  },
  actionType: "passive",
  actionTypeSource: "tagged",
};

export const SORCERER_SORCEROUS_RENEWAL: FeatureDef = {
  id: "sorcerer-sorcerous-renewal",
  name: "Sorcerous Renewal",
  source: "SRD",
  origin: { kind: "class", classId: "ID_CLASS_SORCERER", level: 20 },
  editions: ["srd"],
  prose: {
    fallback: "At 20th level, you regain 4 expended Sorcery Points whenever you finish a Short Rest. (SRD version: Sorcerous Restoration. PHB24 moved partial recovery to L10 as Sorcerous Restoration; it is unclear whether PHB24 has a distinct universal L20 feature or leaves L20 to subclass features only.)",
    srd: "At 20th level, you regain 4 expended sorcery points whenever you finish a short rest.",
  },
  actionType: "passive",
  actionTypeSource: "tagged",
};
