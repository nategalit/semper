import type { SrdBackground } from "./types";

export const SRD_BACKGROUNDS: SrdBackground[] = [
  {
    id: "ID_BACKGROUND_ACOLYTE",
    name: "Acolyte",
    description:
      "You have spent your life in the service of a temple to a specific god or pantheon of gods. You act as an intermediary between the realm of the holy and the mortal world.",
    skillProficiencies: ["Insight", "Religion"],
    languages: 2,
    featureName: "Shelter of the Faithful",
  },
  {
    id: "ID_BACKGROUND_CHARLATAN",
    name: "Charlatan",
    description:
      "You have always had a way with people. You know what makes them tick, you can tease out their heart's desires after a few minutes of conversation, and with a few leading questions you can read them like they were children's books.",
    skillProficiencies: ["Deception", "Sleight of Hand"],
    toolProficiency: "Disguise kit, Forgery kit",
    featureName: "False Identity",
  },
  {
    id: "ID_BACKGROUND_CRIMINAL",
    name: "Criminal",
    description:
      "You are an experienced criminal with a history of breaking the law. You have spent a lot of time among other criminals and still have contacts within the criminal underworld.",
    skillProficiencies: ["Deception", "Stealth"],
    toolProficiency: "One type of gaming set, Thieves' tools",
    featureName: "Criminal Contact",
  },
  {
    id: "ID_BACKGROUND_ENTERTAINER",
    name: "Entertainer",
    description:
      "You thrive in front of an audience. You know how to entrance them, entertain them, and even inspire them. Your poetics can stir the hearts of those who hear you.",
    skillProficiencies: ["Acrobatics", "Performance"],
    toolProficiency: "Disguise kit, one type of musical instrument",
    featureName: "By Popular Demand",
  },
  {
    id: "ID_BACKGROUND_FOLK_HERO",
    name: "Folk Hero",
    description:
      "You come from a humble social rank, but you are destined for so much more. Already the people of your home village regard you as their champion.",
    skillProficiencies: ["Animal Handling", "Survival"],
    toolProficiency: "One type of artisan's tools, Vehicles (land)",
    featureName: "Rustic Hospitality",
  },
  {
    id: "ID_BACKGROUND_GUILD_ARTISAN",
    name: "Guild Artisan",
    description:
      "You are a member of an artisan's guild, skilled in a particular field and closely associated with other artisans. You are a well-established part of the mercantile world.",
    skillProficiencies: ["Insight", "Persuasion"],
    toolProficiency: "One type of artisan's tools",
    languages: 1,
    featureName: "Guild Membership",
  },
  {
    id: "ID_BACKGROUND_HERMIT",
    name: "Hermit",
    description:
      "You lived in seclusion — either in a sheltered community such as a monastery, or entirely alone — for a formative part of your life. In your time apart from the clamor of society, you found quiet, solitude, and perhaps some of the answers you were looking for.",
    skillProficiencies: ["Medicine", "Religion"],
    toolProficiency: "Herbalism kit",
    languages: 1,
    featureName: "Discovery",
  },
  {
    id: "ID_BACKGROUND_NOBLE",
    name: "Noble",
    description:
      "You understand wealth, power, and privilege. You carry a noble title, and your family owns land, collects taxes, and wields significant political influence.",
    skillProficiencies: ["History", "Persuasion"],
    toolProficiency: "One type of gaming set",
    languages: 1,
    featureName: "Position of Privilege",
  },
  {
    id: "ID_BACKGROUND_OUTLANDER",
    name: "Outlander",
    description:
      "You grew up in the wilds, far from civilization and the comforts of town and technology. You've witnessed the migration of herds larger than forests, survived weather more extreme than any city-dweller could comprehend.",
    skillProficiencies: ["Athletics", "Survival"],
    toolProficiency: "One type of musical instrument",
    languages: 1,
    featureName: "Wanderer",
  },
  {
    id: "ID_BACKGROUND_SAGE",
    name: "Sage",
    description:
      "You spent years learning the lore of the multiverse. You scoured manuscripts, studied scrolls, and listened to the greatest experts on the subjects that interest you. Your efforts have made you a master in your fields of study.",
    skillProficiencies: ["Arcana", "History"],
    languages: 2,
    featureName: "Researcher",
  },
  {
    id: "ID_BACKGROUND_SAILOR",
    name: "Sailor",
    description:
      "You sailed on a seagoing vessel for years. In that time, you faced down mighty storms, monsters of the deep, and those who wanted to sink your craft to the bottomless depths.",
    skillProficiencies: ["Athletics", "Perception"],
    toolProficiency: "Navigator's tools, Vehicles (water)",
    featureName: "Ship's Passage",
  },
  {
    id: "ID_BACKGROUND_SOLDIER",
    name: "Soldier",
    description:
      "War has been your life for as long as you care to remember. You trained as a youth, studied the use of weapons and armor, learned basic survival techniques, including how to stay alive on the battlefield.",
    skillProficiencies: ["Athletics", "Intimidation"],
    toolProficiency: "One type of gaming set, Vehicles (land)",
    featureName: "Military Rank",
  },
  {
    id: "ID_BACKGROUND_URCHIN",
    name: "Urchin",
    description:
      "You grew up on the streets alone, orphaned, and poor. You had no one to watch over you or to provide for you, so you learned to provide for yourself.",
    skillProficiencies: ["Sleight of Hand", "Stealth"],
    toolProficiency: "Disguise kit, Thieves' tools",
    featureName: "City Secrets",
  },
];
