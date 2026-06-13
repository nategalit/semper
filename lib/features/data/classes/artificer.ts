import type { FeatureDef } from "@/lib/features/types";

export const ARTIFICER_SPELLCASTING: FeatureDef = {
  id: "artificer-spellcasting",
  name: "Spellcasting",
  source: "Aurora",
  origin: { kind: "class", classId: "ID_CLASS_ARTIFICER", level: 1 },
  prose: {
    fallback: "You cast Artificer spells using Intelligence as your spellcasting ability. You prepare spells from the Artificer list after each Long Rest, choosing from spells whose level does not exceed your highest available spell slot. (Spellcasting system integration deferred.)",
  },
  actionType: "passive",
  actionTypeSource: "tagged",
};

export const ARTIFICER_MAGICAL_TINKERING: FeatureDef = {
  id: "artificer-magical-tinkering",
  name: "Magical Tinkering",
  source: "Aurora",
  origin: { kind: "class", classId: "ID_CLASS_ARTIFICER", level: 1 },
  prose: {
    fallback: "With thieves' tools or artisan's tools in hand, you can touch a Tiny nonmagical object as an action and imbue it with a minor magical property: emit a light, play a recorded sound, emit an odor, or display a static visual effect. You can maintain a number of such objects equal to your Intelligence modifier (minimum 1). Removing the property requires touching the object as an action.",
  },
  actionType: "action",
  actionTypeSource: "tagged",
};

export const ARTIFICER_INFUSE_ITEM: FeatureDef = {
  id: "artificer-infuse-item",
  name: "Infuse Item",
  source: "Aurora",
  origin: { kind: "class", classId: "ID_CLASS_ARTIFICER", level: 2 },
  prose: {
    fallback: "You can imbue mundane items with magical infusions. At the end of a Long Rest, you touch non-magical objects and apply your known infusions to them, creating temporary magic items. You know a number of infusions (starting at 4, rising to 12 at L18) and can swap known infusions when you gain an Artificer level. The number of items you can have simultaneously infused scales with your level (see resource). (Individual infusion FeatureDefs deferred.)",
  },
  actionType: "passive",
  actionTypeSource: "tagged",
  resource: {
    id: "infused_items",
    shape: { kind: "charges", max: { from: "class-table", classId: "artificer", column: "infusedItems" } },
    recharge: { on: "long-rest" },
    display: "pip",
  },
};

export const ARTIFICER_RIGHT_TOOL_FOR_JOB: FeatureDef = {
  id: "artificer-right-tool-for-job",
  name: "The Right Tool for the Job",
  source: "Aurora",
  origin: { kind: "class", classId: "ID_CLASS_ARTIFICER", level: 3 },
  prose: {
    fallback: "Over the course of 1 hour (which can coincide with a Short or Long Rest), you can magically create one set of artisan's tools in an unoccupied space within 5 feet. The tools vanish when you use this feature again or when you die.",
  },
  actionType: "special",
  actionTypeSource: "tagged",
};

export const ARTIFICER_TOOL_EXPERTISE: FeatureDef = {
  id: "artificer-tool-expertise",
  name: "Tool Expertise",
  source: "Aurora",
  origin: { kind: "class", classId: "ID_CLASS_ARTIFICER", level: 6 },
  prose: {
    fallback: "Your proficiency bonus is doubled for any ability check you make that uses your proficiency with a tool.",
  },
  actionType: "passive",
  actionTypeSource: "tagged",
};

export const ARTIFICER_FLASH_OF_GENIUS: FeatureDef = {
  id: "artificer-flash-of-genius",
  name: "Flash of Genius",
  source: "Aurora",
  origin: { kind: "class", classId: "ID_CLASS_ARTIFICER", level: 7 },
  prose: {
    fallback: "When you or another creature you can see within 30 feet of you makes an ability check or a saving throw, you can use your reaction to add your Intelligence modifier to the roll. You can use this feature a number of times equal to your Intelligence modifier (minimum 1), and you regain all expended uses when you finish a Long Rest.",
  },
  actionType: "reaction",
  actionTypeSource: "tagged",
  resource: {
    id: "flash_of_genius",
    shape: { kind: "charges", max: { from: "ability-mod", ability: "int", min: 1 } },
    recharge: { on: "long-rest" },
    display: "pip",
  },
};

export const ARTIFICER_MAGIC_ITEM_ADEPT: FeatureDef = {
  id: "artificer-magic-item-adept",
  name: "Magic Item Adept",
  source: "Aurora",
  origin: { kind: "class", classId: "ID_CLASS_ARTIFICER", level: 10 },
  prose: {
    fallback: "You can attune to up to four magic items at once (one more than the usual three). When you craft a common or uncommon magic item, it takes one-quarter of the normal time and costs half as much gp.",
  },
  actionType: "passive",
  actionTypeSource: "tagged",
};

export const ARTIFICER_SPELL_STORING_ITEM: FeatureDef = {
  id: "artificer-spell-storing-item",
  name: "Spell-Storing Item",
  source: "Aurora",
  origin: { kind: "class", classId: "ID_CLASS_ARTIFICER", level: 11 },
  prose: {
    fallback: "At the end of a Long Rest, you can touch a simple or martial weapon or a spellcasting focus and store a 1st- or 2nd-level Artificer spell in it (expending a spell slot). A creature holding the object can use an action to cast the stored spell, using your spell attack bonus and save DC. The spell can be produced a number of times equal to twice your Intelligence modifier (minimum 2) before the magic is spent.",
  },
  actionType: "special",
  actionTypeSource: "tagged",
};

export const ARTIFICER_MAGIC_ITEM_SAVANT: FeatureDef = {
  id: "artificer-magic-item-savant",
  name: "Magic Item Savant",
  source: "Aurora",
  origin: { kind: "class", classId: "ID_CLASS_ARTIFICER", level: 14 },
  prose: {
    fallback: "You can attune to up to five magic items at once. You ignore all class, race, spell, and level requirements on attuning to or using a magic item.",
  },
  actionType: "passive",
  actionTypeSource: "tagged",
};

export const ARTIFICER_MAGIC_ITEM_MASTER: FeatureDef = {
  id: "artificer-magic-item-master",
  name: "Magic Item Master",
  source: "Aurora",
  origin: { kind: "class", classId: "ID_CLASS_ARTIFICER", level: 18 },
  prose: {
    fallback: "You can attune to up to six magic items at once.",
  },
  actionType: "passive",
  actionTypeSource: "tagged",
};

export const ARTIFICER_SOUL_OF_ARTIFICE: FeatureDef = {
  id: "artificer-soul-of-artifice",
  name: "Soul of Artifice",
  source: "Aurora",
  origin: { kind: "class", classId: "ID_CLASS_ARTIFICER", level: 20 },
  prose: {
    fallback: "You gain a +1 bonus to all saving throws per magic item you are currently attuned to. Additionally, if you are reduced to 0 hit points but not killed outright, you can use your reaction to end one of your artificer infusions, causing you to drop to 1 hit point instead.",
  },
  actionType: "passive",
  actionTypeSource: "tagged",
};
