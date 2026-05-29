import type { ClassElement, ClassFeatureElement } from "../../schema";

export const FIGHTER: ClassElement = {
  elementType: "Class",
  id: "ID_WOTC_PHB_CLASS_FIGHTER",
  name: "Fighter",
  source: "Player's Handbook",
  sourceType: "imported",
  description: `<p>A human in clanging plate armor holds her shield...</p>...`,
  sheetText: "A master of martial combat, skilled with a variety of weapons and armor.",
  hitDie: "d10",
  shortDescription: "A master of martial combat, skilled with a variety of weapons and armor.",
  multiclass: {
    prerequisiteText: "Strength 13 or Dexterity 13",
    requirements: "(([str:13]||[dex:13]),!(ID_WOTC_PHB24_CLASS_FIGHTER||ID_WOTC_PHB24_MULTICLASS_FIGHTER))||ID_INTERNAL_GRANTS_MULTICLASS_UNLOCKER",
    proficienciesText: "Light armor, medium armor, shields, simple weapons, martial weapons",
    rules: {
      statModifiers: [],
      grants: [
        { type: "Grants",      id: "ID_INTERNAL_GRANT_MULTICLASS" },
        { type: "Proficiency", id: "ID_PROFICIENCY_ARMOR_PROFICIENCY_LIGHT_ARMOR",    name: "light armor" },
        { type: "Proficiency", id: "ID_PROFICIENCY_ARMOR_PROFICIENCY_MEDIUM_ARMOR",   name: "medium armor" },
        { type: "Proficiency", id: "ID_PROFICIENCY_ARMOR_PROFICIENCY_SHIELDS",        name: "shields" },
        { type: "Proficiency", id: "ID_PROFICIENCY_WEAPON_PROFICIENCY_SIMPLE_WEAPONS", name: "simple weapons" },
        { type: "Proficiency", id: "ID_PROFICIENCY_WEAPON_PROFICIENCY_MARTIAL_WEAPONS", name: "martial weapons" },
      ],
      choices: [],
      extraRules: [],
    },
  },
  rules: {
    statModifiers: [],
    grants: [
      { type: "Proficiency", id: "ID_PROFICIENCY_ARMOR_PROFICIENCY_LIGHT_ARMOR",     name: "light armor",     requirements: "!ID_WOTC_PHB_MULTICLASS_FIGHTER" },
      { type: "Proficiency", id: "ID_PROFICIENCY_ARMOR_PROFICIENCY_MEDIUM_ARMOR",    name: "medium armor",    requirements: "!ID_WOTC_PHB_MULTICLASS_FIGHTER" },
      { type: "Proficiency", id: "ID_PROFICIENCY_ARMOR_PROFICIENCY_HEAVY_ARMOR",     name: "heavy armor",     requirements: "!ID_WOTC_PHB_MULTICLASS_FIGHTER" },
      { type: "Proficiency", id: "ID_PROFICIENCY_ARMOR_PROFICIENCY_SHIELDS",         name: "shields",         requirements: "!ID_WOTC_PHB_MULTICLASS_FIGHTER" },
      { type: "Proficiency", id: "ID_PROFICIENCY_WEAPON_PROFICIENCY_SIMPLE_WEAPONS", name: "simple weapons",  requirements: "!ID_WOTC_PHB_MULTICLASS_FIGHTER" },
      { type: "Proficiency", id: "ID_PROFICIENCY_WEAPON_PROFICIENCY_MARTIAL_WEAPONS","name": "martial weapons", requirements: "!ID_WOTC_PHB_MULTICLASS_FIGHTER" },
      { type: "Proficiency", id: "ID_PROFICIENCY_SAVINGTHROW_STRENGTH",              name: "Strength saving throw",     requirements: "!ID_WOTC_PHB_MULTICLASS_FIGHTER" },
      { type: "Proficiency", id: "ID_PROFICIENCY_SAVINGTHROW_CONSTITUTION",          name: "Constitution saving throw", requirements: "!ID_WOTC_PHB_MULTICLASS_FIGHTER" },
      { type: "Class Feature", id: "ID_WOTC_PHB_CLASS_FEATURE_FIGHTINGSTYLE",               name: "Fighting Style",          level: 1 },
      { type: "Class Feature", id: "ID_WOTC_PHB_CLASS_FEATURE_SECONDWIND",                  name: "Second Wind",             level: 1 },
      { type: "Class Feature", id: "ID_WOTC_PHB_CLASS_FEATURE_ACTIONSURGE",                 name: "Action Surge",            level: 2 },
      { type: "Class Feature", id: "ID_WOTC_PHB_CLASS_FEATURE_MARTIALARCHETYPE",            name: "Martial Archetype",       level: 3 },
      { type: "Class Feature", id: "ID_WOTC_PHB_CLASS_FEATURE_ABILITYSCOREIMPROVEMENT_FIGHTER", name: "Ability Score Improvement", level: 4 },
      { type: "Class Feature", id: "ID_WOTC_PHB_CLASS_FEATURE_EXTRAATTACK",                 name: "Extra Attack",            level: 5 },
      { type: "Class Feature", id: "ID_WOTC_PHB_CLASS_FEATURE_INDOMITABLE",                 name: "Indomitable",             level: 9 },
    ],
    choices: [
      {
        kind: "element",
        type: "Proficiency",
        name: "Skill Proficiency (Fighter)",
        supports: "Skill,Fighter",
        number: 2,
        requirements: "!ID_WOTC_PHB_MULTICLASS_FIGHTER",
      },
    ],
    extraRules: [],
  },
};

// Second Wind as a ClassFeature sibling element:
export const SECOND_WIND: ClassFeatureElement = {
  elementType: "ClassFeature",
  id: "ID_WOTC_PHB_CLASS_FEATURE_SECONDWIND",
  name: "Second Wind",
  source: "Player's Handbook",
  sourceType: "imported",
  description: `<p>You have a limited well of stamina that you can draw on to protect yourself from harm...</p>`,
  sheetText: "You regain 1d10+{{level:fighter}} hp.",
  action: "Bonus Action",
  usage: "1/Short Rest",
  variants: [
    { level: 0, text: "You regain 1d10+{{level:fighter}} hp.", action: "Bonus Action", usage: "1/Short Rest" },
  ],
  replacedBy: "!ID_INTERNAL_FEATURE_REPLACEMENT_FIGHTER_SECOND_WIND",
  rules: { statModifiers: [], grants: [], choices: [], extraRules: [] },
};

// Action Surge — has level-scaled usage in sheet:
export const ACTION_SURGE: ClassFeatureElement = {
  elementType: "ClassFeature",
  id: "ID_WOTC_PHB_CLASS_FEATURE_ACTIONSURGE",
  name: "Action Surge",
  source: "Player's Handbook",
  sourceType: "imported",
  description: `<p>Starting at 2nd level, you can push yourself beyond your normal limits...</p>`,
  sheetText: "On your turn, you can take one additional action on top of your regular action.",
  action: undefined,
  usage: "1/Short Rest",
  variants: [
    { level: 0,  text: "On your turn, you can take one additional action on top of your regular action.", usage: "1/Short Rest" },
    { level: 17, text: "On your turn, you can take one additional action on top of your regular action.", usage: "2/Short Rest" },
  ],
  replacedBy: "!ID_INTERNAL_FEATURE_REPLACEMENT_FIGHTER_ACTION_SURGE",
  rules: { statModifiers: [], grants: [], choices: [], extraRules: [] },
};
