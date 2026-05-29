import type { RaceElement } from "../../schema";

export const ELF: RaceElement = {
  elementType: "Race",
  id: "ID_RACE_ELF",
  name: "Elf",
  source: "Player's Handbook",
  sourceType: "imported",
  // description is the full sanitized HTML — truncated here for readability
  description: `<p class="flavor">Elves are a magical people of otherworldly grace, living in the world but not entirely part of it.</p>...`,
  sheetText: "", // display="false" on the Race element's <sheet>
  subraceRequired: true, // inferred: a granted trait contains <select type="Sub Race">
  nameData: {
    male: ["Adran","Aelar","Aramil","Arannis","Aust","Beiro","Berrian","Carric","Enialis","Erdan","Erevan","Galinndan","Hadarai","Heian","Himo","Immeral","Ivellios","Laucian","Mindartis","Paelias","Peren","Quarion","Riardon","Rolen","Soveliss","Thamior","Tharivol","Theren","Varis"],
    female: ["Adrie","Althaea","Anastrianna","Andraste","Antinua","Bethrynna","Birel","Caelynn","Drusilia","Enna","Felosial","Ielenia","Jelenneth","Keyleth","Leshanna","Lia","Meriele","Mialee","Naivara","Quelenna","Quillathe","Sariel","Shanairra","Shava","Silaqui","Theirastra","Thia","Vadania","Valanthe","Xanaphia"],
    child: ["Ara","Bryn","Del","Eryn","Faen","Innil","Lael","Mella","Naill","Naeris","Phann","Rael","Rinn","Sai","Syllin","Thia","Vall"],
    family: ["Amakiir","Amastacia","Galanodel","Holimion","Ilphelkiir","Liadon","Meliamne","Nai'lo","Siannodel","Xiloscient"],
    format: "{{name}} {{family}}",
  },
  sizeData: {
    heightBase: `4'6"`,
    heightModifier: "2d10",
    weightBase: "90 lb.",
    weightModifier: "1d4",
  },
  rules: {
    statModifiers: [
      {
        stat: "dexterity",
        value: 2,
        requirements: "!(ID_UA_PSK_GRANTS_ELF_SUBRACE||ID_WOTC_TCOE_OPTION_CUSTOMIZED_ASI||ID_INTERNAL_GRANTS_BACKGROUND_ASI)",
      },
      { stat: "innate speed", value: 30, bonus: "base" },
    ],
    grants: [
      { type: "Size",        id: "ID_SIZE_MEDIUM",              name: "Medium" },
      { type: "Vision",      id: "ID_VISION_DARKVISION",         name: "Darkvision" },
      { type: "Language",    id: "ID_LANGUAGE_COMMON",           name: "Common",
        requirements: "!ID_WOTC_UA20171113_SUB_RACE_GRUGACH,!ID_WOTC_TCOE_OPTION_CUSTOMIZED_LANGUAGE" },
      { type: "Language",    id: "ID_LANGUAGE_ELVISH",           name: "Elvish",
        requirements: "!ID_WOTC_TCOE_OPTION_CUSTOMIZED_LANGUAGE" },
      { type: "Grants",      id: "ID_INTERNAL_GRANT_RACE_ELF" },
      { type: "Racial Trait", id: "ID_RACIAL_TRAIT_KEEN_SENSES", name: "Keen Senses" },
      { type: "Racial Trait", id: "ID_RACIAL_TRAIT_FEY_ANCESTRY", name: "Fey Ancestry" },
      { type: "Racial Trait", id: "ID_RACIAL_TRAIT_TRANCE",       name: "Trance" },
      { type: "Racial Trait", id: "ID_RACIAL_TRAIT_ELVEN_SUBRACE", name: "Elven Subrace" },
    ],
    choices: [
      {
        kind: "element",
        type: "Ability Score Improvement",
        name: "Custom Ability Score Improvement +2 (Elf)",
        supports: "Custom Ability Score Increase 2",
        number: 1,
        requirements: "ID_WOTC_TCOE_OPTION_CUSTOMIZED_ASI,!(ID_UA_PSK_GRANTS_ELF_SUBRACE||ID_INTERNAL_GRANTS_BACKGROUND_ASI)",
      },
      {
        kind: "element",
        type: "Language",
        name: "Customized Language",
        supports: "Custom Race Language",
        number: 2,
        requirements: "ID_WOTC_TCOE_OPTION_CUSTOMIZED_LANGUAGE",
      },
    ],
    extraRules: [],
  },
};

// The Elven Subrace racial trait element (sibling in the same file) becomes:
// { elementType: "ClassFeature", id: "ID_RACIAL_TRAIT_ELVEN_SUBRACE", ... rules.choices: [
//   { kind: "element", type: "Sub Race", name: "Elven Subrace", supports: "Elf", number: 1 }
// ]}
// The Race element's subraceRequired=true is derived by walking that grant chain.
