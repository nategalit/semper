import type { SpellElement } from "../../schema";

export const ACID_SPLASH: SpellElement = {
  elementType: "Spell",
  id: "ID_PHB_SPELL_ACID_SPLASH",
  name: "Acid Splash",
  source: "Player's Handbook",
  sourceType: "imported",
  description: "<p>You hurl a bubble of acid. Choose one creature you can see within range, or choose two creatures you can see within range that are within 5 feet of each other. A target must succeed on a Dexterity saving throw or take 1d6 acid damage.</p><p class=\"indent\">This spell's damage increases by 1d6 when you reach 5th level (2d6), 11th level (3d6), and 17th level (4d6).</p>",
  sheetText: "", // no <sheet> element present; spells display via their structured fields
  level: 0, // cantrip
  school: "Conjuration",
  castingTime: "1 action",
  duration: "Instantaneous",
  range: "60 feet",
  components: {
    verbal: true,
    somatic: true,
    material: false,
    materialDescription: undefined,
  },
  concentration: false,
  ritual: false,
  // "Spell Saving Throw" filtered out; "Artificer" is a class name
  classes: ["Sorcerer", "Wizard", "Artificer"],
  keywords: ["acid"],
};

export const ALARM: SpellElement = {
  elementType: "Spell",
  id: "ID_PHB_SPELL_ALARM",
  name: "Alarm",
  source: "Player's Handbook",
  sourceType: "imported",
  description: "<p>You set an alarm against unwanted intrusion...</p>",
  sheetText: "",
  level: 1,
  school: "Abjuration",
  castingTime: "1 minute",
  duration: "8 hours",
  range: "30 feet",
  components: {
    verbal: true,
    somatic: true,
    material: true,
    materialDescription: "a tiny bell and a piece of fine silver wire",
  },
  concentration: false,
  ritual: true,
  classes: ["Ranger", "Wizard", "Artificer"],
  keywords: [],
};
