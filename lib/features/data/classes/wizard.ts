import type { FeatureDef } from "@/lib/features/types";

export const WIZARD_SPELLCASTING: FeatureDef = {
  id: "wizard-spellcasting",
  name: "Spellcasting",
  source: "SRD",
  origin: { kind: "class", classId: "ID_CLASS_WIZARD", level: 1 },
  prose: {
    fallback: "You cast Wizard spells using Intelligence as your spellcasting ability. You maintain a spellbook of prepared spells. See the Wizard spell list and Spellcasting rules for spell slot progression and preparation. (Spellcasting system integration deferred.)",
  },
  actionType: "passive",
  actionTypeSource: "tagged",
};

export const WIZARD_RITUAL_ADEPT: FeatureDef = {
  id: "wizard-ritual-adept",
  name: "Ritual Adept",
  source: "SRD",
  origin: { kind: "class", classId: "ID_CLASS_WIZARD", level: 1 },
  prose: {
    fallback: "You can cast any spell as a Ritual if that spell has the Ritual tag and the spell is in your spellbook. You needn't have the spell prepared, but you must read from the book to cast it as a Ritual, and doing so takes an extra 10 minutes.",
  },
  actionType: "passive",
  actionTypeSource: "tagged",
};

export const ARCANE_RECOVERY: FeatureDef = {
  id: "wizard-arcane-recovery",
  name: "Arcane Recovery",
  source: "SRD",
  origin: { kind: "class", classId: "ID_CLASS_WIZARD", level: 1 },
  prose: {
    fallback: "When you finish a Short Rest, you can choose expended spell slots to recover. The slots can have a combined level equal to or less than half your Wizard level (rounded up), and none can be 6th level or higher. You can use this feature once per Long Rest.",
    srd: "Once per day when you finish a short rest, you can choose expended spell slots to recover. The spell slots can have a combined level that is equal to or less than half your wizard level (rounded up), and none of the slots can be 6th level or higher.",
  },
  actionType: "special",
  actionTypeSource: "tagged",
  resource: {
    id: "arcane_recovery",
    shape: { kind: "charges", max: 1 },
    recharge: { on: "long-rest" },
    display: "pip",
  },
};

export const WIZARD_SCHOLAR: FeatureDef = {
  id: "wizard-scholar",
  name: "Scholar",
  source: "SRD",
  origin: { kind: "class", classId: "ID_CLASS_WIZARD", level: 2 },
  prose: {
    fallback: "While studying magic, you also specialized in another field of scholarship. Choose one skill in which you have proficiency: Arcana, History, Investigation, Medicine, Nature, or Religion. You have Expertise in the chosen skill.",
  },
  actionType: "passive",
  actionTypeSource: "tagged",
  choices: [{ kind: "skill", from: { source: "wizard-scholar-list" }, count: 1, grants: "expertise" }],
};

export const WIZARD_MEMORIZE_SPELL: FeatureDef = {
  id: "wizard-memorize-spell",
  name: "Memorize Spell",
  source: "SRD",
  origin: { kind: "class", classId: "ID_CLASS_WIZARD", level: 5 },
  prose: {
    fallback: "Whenever you finish a Short Rest, you can study your spellbook and replace one of the level 1+ Wizard spells you have prepared for your Spellcasting feature with another spell from your spellbook. (Spellcasting system integration deferred.)",
  },
  actionType: "passive",
  actionTypeSource: "tagged",
};

export const WIZARD_SPELL_MASTERY: FeatureDef = {
  id: "wizard-spell-mastery",
  name: "Spell Mastery",
  source: "SRD",
  origin: { kind: "class", classId: "ID_CLASS_WIZARD", level: 18 },
  prose: {
    fallback: "You have achieved mastery over two spells, enabling you to cast them at will. Choose a level 1 and a level 2 spell in your spellbook that have a casting time of an action. You always have those spells prepared, and you can cast them at their lowest level without expending a spell slot. (Spellbook integration deferred.)",
    srd: "At 18th level, you have achieved such mastery over certain spells that you can cast them at will. Choose a 1st-level wizard spell and a 2nd-level wizard spell that are in your spellbook. You can cast those spells at their lowest level without expending a spell slot when you have them prepared.",
  },
  actionType: "passive",
  actionTypeSource: "tagged",
};

export const WIZARD_SIGNATURE_SPELLS: FeatureDef = {
  id: "wizard-signature-spells",
  name: "Signature Spells",
  source: "SRD",
  origin: { kind: "class", classId: "ID_CLASS_WIZARD", level: 20 },
  prose: {
    fallback: "You gain mastery over two powerful spells and can cast them with little effort. Choose two level 3 spells in your spellbook as your signature spells. You always have them prepared, they don't count against your prepared spells total, and you can cast each of them once without a spell slot. You regain these uses when you finish a Short Rest. (Spellbook integration deferred.)",
    srd: "When you reach 20th level, you gain mastery over two powerful spells and can cast them with little effort. Choose two 3rd-level wizard spells in your spellbook as your signature spells. You always have these spells prepared, they don't count against the number of spells you have prepared, and you can cast each of them once at 3rd level without expending a spell slot.",
  },
  actionType: "passive",
  actionTypeSource: "tagged",
};
