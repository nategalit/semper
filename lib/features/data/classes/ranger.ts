import type { FeatureDef } from "@/lib/features/types";

export const RANGER_FIGHTING_STYLE: FeatureDef = {
  id: "ranger-fighting-style",
  name: "Fighting Style",
  source: "SRD",
  origin: { kind: "class", classId: "ID_CLASS_RANGER", level: 2 },
  prose: { fallback: "Adopt a particular style of fighting as your specialty. You can't take a Fighting Style option more than once, even if you later get to choose again." },
  actionType: "passive",
  actionTypeSource: "tagged",
  choices: [{ kind: "feat", from: { tag: "fighting-style" }, count: 1 }],
};

export const RANGER_FAVORED_ENEMY: FeatureDef = {
  id: "ranger-favored-enemy",
  name: "Favored Enemy",
  source: "SRD",
  origin: { kind: "class", classId: "ID_CLASS_RANGER", level: 1 },
  prose: {
    fallback: "You have significant experience studying, tracking, hunting, and even talking to a certain type of enemy. Choose a type of favored enemy: Aberrations, Beasts, Celestials, Constructs, Dragons, Elementals, Fey, Fiends, Giants, Monstrosities, Oozes, Plants, or Undead. You gain advantage on Wisdom (Survival) checks to track them and Intelligence checks to recall information about them.",
    phb24: "You are an experienced hunter, adept at tracking down your quarry. In PHB24, Favored Enemy grants Hunter's Mark as an always-prepared spell — grantedSpells integration deferred to chunk 10.",
  },
  actionType: "passive",
  actionTypeSource: "tagged",
};

export const RANGER_WEAPON_MASTERY: FeatureDef = {
  id: "ranger-weapon-mastery",
  name: "Weapon Mastery",
  source: "SRD",
  origin: { kind: "class", classId: "ID_CLASS_RANGER", level: 1 },
  prose: { fallback: "Your training with weapons allows you to use the mastery property of two kinds of weapons of your choice. You can change which kinds of weapons you chose when you finish a Long Rest." },
  actionType: "passive",
  actionTypeSource: "tagged",
  choices: [{ kind: "weapon-mastery", count: 2, pool: "any", rePickOn: "long-rest" }],
};

export const RANGER_DEFT_EXPLORER: FeatureDef = {
  id: "ranger-deft-explorer",
  name: "Deft Explorer",
  source: "SRD",
  origin: { kind: "class", classId: "ID_CLASS_RANGER", level: 2 },
  legacyNames: ["Natural Explorer"],
  prose: {
    fallback: "You are an unsurpassed explorer. Choose one skill you are proficient with — your proficiency bonus is doubled for checks with that skill (Expertise). You also learn two additional languages of your choice.",
    srd: "You are particularly familiar with one type of natural environment and are adept at traveling and surviving in such regions. Choose one type of favored terrain: arctic, coast, desert, forest, grassland, mountain, swamp, or the Underdark.",
  },
  actionType: "passive",
  actionTypeSource: "tagged",
  choices: [
    { kind: "skill", from: { source: "any-proficient" }, count: 1, grants: "expertise" },
    { kind: "language", from: { source: "any-standard" }, count: 2 },
  ],
};

export const RANGER_SPELLCASTING: FeatureDef = {
  id: "ranger-spellcasting",
  name: "Spellcasting",
  source: "SRD",
  origin: { kind: "class", classId: "ID_CLASS_RANGER", level: 2 },
  prose: {
    fallback: "You have learned to cast Ranger spells through studying the natural world. See the Ranger spell list and the Spellcasting rules for preparation, spell slots, and spellcasting ability (Wisdom). (Spellcasting system integration deferred.)",
  },
  actionType: "passive",
  actionTypeSource: "tagged",
};

export const RANGER_PRIMEVAL_AWARENESS: FeatureDef = {
  id: "ranger-primeval-awareness",
  name: "Primeval Awareness",
  source: "SRD",
  origin: { kind: "class", classId: "ID_CLASS_RANGER", level: 3 },
  prose: {
    fallback: "As a Magic action, you can sense your connection to the natural world. Until the end of your next turn, you know the location of any Aberration, Celestial, Construct, Elemental, Fey, Fiend, or Undead within 1 mile of you that isn't behind total cover.",
    srd: "You can use your action and expend one Ranger spell slot to focus your awareness on the region around you. For 1 minute per level of the spell slot you expend, you can sense whether certain types of creatures are present within 1 mile of you (or 6 miles if in your favored terrain).",
  },
  actionType: "action",
  actionTypeSource: "tagged",
};

export const RANGER_EXTRA_ATTACK: FeatureDef = {
  id: "ranger-extra-attack",
  name: "Extra Attack",
  source: "SRD",
  origin: { kind: "class", classId: "ID_CLASS_RANGER", level: 5 },
  prose: { fallback: "You can attack twice instead of once when you take the Attack action on your turn." },
  actionType: "passive",
  actionTypeSource: "tagged",
  effects: [
    {
      kind: "scaling-stat",
      stat: "attacksPerAction",
      formula: { by: "class-level", classId: "ID_CLASS_RANGER", table: { 5: 2 } },
    },
  ],
};

export const RANGER_ROVING: FeatureDef = {
  id: "ranger-roving",
  name: "Roving",
  source: "SRD",
  origin: { kind: "class", classId: "ID_CLASS_RANGER", level: 6 },
  prose: {
    fallback: "Your Speed increases by 10 feet while you aren't wearing Heavy armor. You also gain a Climb Speed and Swim Speed equal to your Speed. (Climb/Swim = Speed encoding deferred — speed effect value does not yet support 'walk-speed' sentinel.)",
  },
  actionType: "passive",
  actionTypeSource: "tagged",
  effects: [
    { kind: "speed", op: "add", value: 10, condition: { not_wearing: "heavy-armor" } },
  ],
};

export const RANGER_EXPERTISE: FeatureDef = {
  id: "ranger-expertise",
  name: "Expertise",
  source: "SRD",
  origin: { kind: "class", classId: "ID_CLASS_RANGER", level: 9 },
  prose: {
    fallback: "Choose two more skills you are proficient with. Your proficiency bonus is doubled for checks with those skills (Expertise).",
  },
  actionType: "passive",
  actionTypeSource: "tagged",
  choices: [
    { kind: "skill", from: { source: "any-proficient" }, count: 2, grants: "expertise" },
  ],
};

export const RANGER_TIRELESS: FeatureDef = {
  id: "ranger-tireless",
  name: "Tireless",
  source: "SRD",
  origin: { kind: "class", classId: "ID_CLASS_RANGER", level: 10 },
  prose: {
    fallback: "As a Magic action, you can give yourself Temporary Hit Points equal to 1d8 plus your Wisdom modifier (minimum 1). You can use this feature a number of times equal to your Proficiency Bonus, and you regain all expended uses when you finish a Long Rest. (Resource encoding deferred — max uses = prof bonus not yet expressible in DerivedCount.)",
  },
  actionType: "action",
  actionTypeSource: "tagged",
};

export const RANGER_RELENTLESS_HUNTER: FeatureDef = {
  id: "ranger-relentless-hunter",
  name: "Relentless Hunter",
  source: "SRD",
  origin: { kind: "class", classId: "ID_CLASS_RANGER", level: 13 },
  prose: {
    fallback: "Taking damage can't break your Concentration on Hunter's Mark.",
  },
  actionType: "passive",
  actionTypeSource: "tagged",
};

export const RANGER_NATURES_VEIL: FeatureDef = {
  id: "ranger-natures-veil",
  name: "Nature's Veil",
  source: "SRD",
  origin: { kind: "class", classId: "ID_CLASS_RANGER", level: 14 },
  prose: {
    fallback: "As a Bonus Action, you can expend one use of this feature to magically hide. You have the Invisible condition until the start of your next turn. You regain all expended uses when you finish a Long Rest.",
  },
  actionType: "bonus_action",
  actionTypeSource: "tagged",
  resource: {
    id: "natures_veil",
    shape: { kind: "charges", max: { from: "ability-mod", ability: "wis", min: 1 } },
    recharge: { on: "long-rest" },
    display: "pip",
  },
};

export const RANGER_PRECISE_HUNTER: FeatureDef = {
  id: "ranger-precise-hunter",
  name: "Precise Hunter",
  source: "SRD",
  origin: { kind: "class", classId: "ID_CLASS_RANGER", level: 17 },
  prose: {
    fallback: "You have Advantage on attack rolls against the creature currently marked by your Hunter's Mark.",
  },
  actionType: "passive",
  actionTypeSource: "tagged",
};

export const RANGER_FERAL_SENSES: FeatureDef = {
  id: "ranger-feral-senses",
  name: "Feral Senses",
  source: "SRD",
  origin: { kind: "class", classId: "ID_CLASS_RANGER", level: 18 },
  prose: {
    fallback: "Your connection to the natural world gives you supernatural awareness. You gain Blindsight with a range of 30 feet.",
    srd: "You gain preternatural senses that help you fight creatures you can't see. When you attack a creature you can't see, your inability to see it doesn't impose disadvantage on your attack rolls against it. You are also aware of the location of any invisible creature within 30 feet of you, provided that the creature isn't hidden from you.",
  },
  actionType: "passive",
  actionTypeSource: "tagged",
  effects: [{ kind: "sense", sense: "blindsight", range: 30 }],
};

export const RANGER_FOE_SLAYER: FeatureDef = {
  id: "ranger-foe-slayer",
  name: "Foe Slayer",
  source: "SRD",
  origin: { kind: "class", classId: "ID_CLASS_RANGER", level: 20 },
  prose: {
    fallback: "Your Hunter's Mark now deals 1d10 damage instead of 1d6 (Hunter's Mark die upgrade deferred to chunk 10 grantedSpells integration). Once per turn, you can also add your Wisdom modifier to an attack or damage roll against your Hunter's Mark target.",
    srd: "At 20th level, you become an unparalleled hunter of your enemies. Once on each of your turns, you can add your Wisdom modifier to the attack roll or the damage roll of an attack you make against one of your favored enemies.",
  },
  actionType: "passive",
  actionTypeSource: "tagged",
};
