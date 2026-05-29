import type { SrdRace } from "./types";

export const SRD_RACES: SrdRace[] = [
  {
    id: "ID_RACE_DRAGONBORN",
    name: "Dragonborn",
    description:
      "Born of dragons, dragonborn walk proudly through a world that greets them with fearful incomprehension. Shaped by draconic gods or the dragons themselves, dragonborn originally hatched from dragon eggs as a unique race.",
    speed: 30,
    size: "Medium",
    abilityScoreBonuses: { str: 2, cha: 1 },
    traits: ["Draconic Ancestry", "Breath Weapon", "Damage Resistance"],
    languages: ["Common", "Draconic"],
    subraces: [],
    subraceRequired: false,
  },
  {
    id: "ID_RACE_DWARF",
    name: "Dwarf",
    description:
      "Bold and hardy, dwarves are known as skilled warriors, miners, and workers of stone and metal. Though they stand well under 5 feet tall, dwarves are so broad and compact that they can weigh as much as a human standing nearly two feet taller.",
    speed: 25,
    size: "Medium",
    abilityScoreBonuses: { con: 2 },
    traits: ["Darkvision", "Dwarven Resilience", "Dwarven Combat Training", "Stonecunning"],
    languages: ["Common", "Dwarvish"],
    subraces: [
      {
        id: "ID_SUB_RACE_HILL_DWARF",
        name: "Hill Dwarf",
        description:
          "As a hill dwarf, you have keen senses, deep intuition, and remarkable resilience.",
        abilityScoreBonuses: { wis: 1 },
        traits: ["Dwarven Toughness"],
      },
      {
        id: "ID_SUB_RACE_MOUNTAIN_DWARF",
        name: "Mountain Dwarf",
        description:
          "As a mountain dwarf, you're strong and hardy, acclimated to a difficult life in rugged terrain.",
        abilityScoreBonuses: { str: 2 },
        traits: ["Dwarven Armor Training"],
      },
    ],
    subraceRequired: true,
  },
  {
    id: "ID_RACE_ELF",
    name: "Elf",
    description:
      "Elves are a magical people of otherworldly grace, living in the world but not entirely part of it. They live in places of ethereal beauty, in the midst of ancient forests or in silvery spires glittering with faerie light.",
    speed: 30,
    size: "Medium",
    abilityScoreBonuses: { dex: 2 },
    traits: ["Darkvision", "Keen Senses", "Fey Ancestry", "Trance"],
    languages: ["Common", "Elvish"],
    subraces: [
      {
        id: "ID_SUB_RACE_HIGH_ELF",
        name: "High Elf",
        description:
          "As a high elf, you have a keen mind and a mastery of at least the basics of magic.",
        abilityScoreBonuses: { int: 1 },
        traits: ["Elf Weapon Training", "Cantrip", "Extra Language"],
      },
      {
        id: "ID_SUB_RACE_WOOD_ELF",
        name: "Wood Elf",
        description:
          "As a wood elf, you have keen senses and intuition, and your fleet feet carry you quickly and stealthily through your native forests.",
        abilityScoreBonuses: { wis: 1 },
        traits: ["Elf Weapon Training", "Fleet of Foot", "Mask of the Wild"],
      },
      {
        id: "ID_SUB_RACE_DARK_ELF",
        name: "Dark Elf (Drow)",
        description:
          "Descended from an earlier subrace of dark-skinned elves, the drow were banished from the surface world for following the goddess Lolth.",
        abilityScoreBonuses: { cha: 1 },
        traits: ["Superior Darkvision", "Sunlight Sensitivity", "Drow Magic", "Drow Weapon Training"],
      },
    ],
    subraceRequired: true,
  },
  {
    id: "ID_RACE_GNOME",
    name: "Gnome",
    description:
      "A constant hum of busy activity pervades the warrens and neighborhoods where gnomes form their close-knit communities. Gnomes take delight in life, enjoying every moment of invention, exploration, investigation, creation, and play.",
    speed: 25,
    size: "Small",
    abilityScoreBonuses: { int: 2 },
    traits: ["Darkvision", "Gnome Cunning"],
    languages: ["Common", "Gnomish"],
    subraces: [
      {
        id: "ID_SUB_RACE_FOREST_GNOME",
        name: "Forest Gnome",
        description:
          "As a forest gnome, you have a natural knack for illusion and inherent quickness and stealth.",
        abilityScoreBonuses: { dex: 1 },
        traits: ["Natural Illusionist", "Speak with Small Beasts"],
      },
      {
        id: "ID_SUB_RACE_ROCK_GNOME",
        name: "Rock Gnome",
        description:
          "As a rock gnome, you have a natural inventiveness and hardiness beyond that of other gnomes.",
        abilityScoreBonuses: { con: 1 },
        traits: ["Artificer's Lore", "Tinker"],
      },
    ],
    subraceRequired: true,
  },
  {
    id: "ID_RACE_HALF_ELF",
    name: "Half-Elf",
    description:
      "Walking in two worlds but truly belonging to neither, half-elves combine what some say are the best qualities of their elf and human parents: human curiosity, inventiveness, and ambition tempered by the refined senses, love of nature, and artistic tastes of the elves.",
    speed: 30,
    size: "Medium",
    abilityScoreBonuses: { cha: 2 },
    flexibleBonuses: { count: 2, amount: 1 },
    traits: ["Darkvision", "Fey Ancestry", "Skill Versatility"],
    languages: ["Common", "Elvish"],
    subraces: [],
    subraceRequired: false,
  },
  {
    id: "ID_RACE_HALF_ORC",
    name: "Half-Orc",
    description:
      "Whether united under the leadership of a mighty warlock or having fought to a standstill after years of conflict, orc and human communities share a life together. Half-orcs' grayish pigmentation, sloping foreheads, jutting jaws, prominent teeth, and towering builds make their orcish heritage plain for all to see.",
    speed: 30,
    size: "Medium",
    abilityScoreBonuses: { str: 2, con: 1 },
    traits: ["Darkvision", "Menacing", "Relentless Endurance", "Savage Attacks"],
    languages: ["Common", "Orc"],
    subraces: [],
    subraceRequired: false,
  },
  {
    id: "ID_RACE_HALFLING",
    name: "Halfling",
    description:
      "The comforts of home are the goals of most halflings' lives: a place to settle in peace and quiet, far from marauding monsters and clashing armies. Others form nomadic bands that travel constantly, by choice or by necessity.",
    speed: 25,
    size: "Small",
    abilityScoreBonuses: { dex: 2 },
    traits: ["Lucky", "Brave", "Halfling Nimbleness"],
    languages: ["Common", "Halfling"],
    subraces: [
      {
        id: "ID_SUB_RACE_LIGHTFOOT_HALFLING",
        name: "Lightfoot Halfling",
        description:
          "As a lightfoot halfling, you can easily hide from notice, even using other people as cover.",
        abilityScoreBonuses: { cha: 1 },
        traits: ["Naturally Stealthy"],
      },
      {
        id: "ID_SUB_RACE_STOUT_HALFLING",
        name: "Stout Halfling",
        description:
          "As a stout halfling, you're hardier than average and have some resistance to poison.",
        abilityScoreBonuses: { con: 1 },
        traits: ["Stout Resilience"],
      },
    ],
    subraceRequired: true,
  },
  {
    id: "ID_RACE_HUMAN",
    name: "Human",
    description:
      "In the reckonings of most worlds, humans are the youngest of the common races, late to arrive on the world scene and short-lived in comparison to dwarves, elves, and dragons. Perhaps it is because of their shorter lives that they strive to achieve as much as they can in the years they are given.",
    speed: 30,
    size: "Medium",
    abilityScoreBonuses: { str: 1, dex: 1, con: 1, int: 1, wis: 1, cha: 1 },
    traits: ["Extra Language"],
    languages: ["Common"],
    subraces: [],
    subraceRequired: false,
  },
  {
    id: "ID_RACE_TIEFLING",
    name: "Tiefling",
    description:
      "To be greeted with stares and whispers, to suffer violence and insult on the street, to see mistrust and fear in every eye: this is the lot of the tiefling. Their appearance and their nature are not their fault but the result of an ancient sin.",
    speed: 30,
    size: "Medium",
    abilityScoreBonuses: { int: 1, cha: 2 },
    traits: ["Darkvision", "Hellish Resistance", "Infernal Legacy"],
    languages: ["Common", "Infernal"],
    subraces: [],
    subraceRequired: false,
  },
];
