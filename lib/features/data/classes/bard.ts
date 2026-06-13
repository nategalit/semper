import type { FeatureDef } from "@/lib/features/types";

export const BARDIC_INSPIRATION: FeatureDef = {
  id: "bard-bardic-inspiration",
  name: "Bardic Inspiration",
  source: "SRD",
  origin: { kind: "class", classId: "ID_CLASS_BARD", level: 1 },
  prose: {
    fallback: "As a Bonus Action, inspire a creature within 60 feet. They gain a Bardic Inspiration die (d6 scaling to d12) they can add to one ability check, attack roll, or saving throw within 10 minutes. Charges = Charisma modifier (minimum 1). Recharges on Short Rest at level 5 (Long Rest before then).",
    srd: "You can inspire others through stirring words or music. As a bonus action, you can verbally inspire one creature other than yourself within 60 feet of you. That creature gains one Bardic Inspiration die, a d6.",
  },
  actionType: "bonus_action",
  actionTypeSource: "tagged",
  resource: {
    id: "bardic_inspiration",
    shape: { kind: "charges", max: { from: "ability-mod", ability: "cha", min: 1 } },
    // Switches to short-rest recharge at L5 (Font of Inspiration)
    recharge: { on: "long-rest", switchesTo: "short-rest", atLevel: 5 },
    display: "pip",
  },
};

export const BARD_SPELLCASTING: FeatureDef = {
  id: "bard-spellcasting",
  name: "Spellcasting",
  source: "SRD",
  origin: { kind: "class", classId: "ID_CLASS_BARD", level: 1 },
  prose: {
    fallback: "You cast Bard spells using Charisma as your spellcasting ability. You know a fixed number of spells from the Bard list and can replace one each time you gain a Bard level. (Spellcasting system integration deferred.)",
  },
  actionType: "passive",
  actionTypeSource: "tagged",
};

export const BARD_EXPERTISE: FeatureDef = {
  id: "bard-expertise",
  name: "Expertise",
  source: "SRD",
  origin: { kind: "class", classId: "ID_CLASS_BARD", level: 2 },
  prose: {
    fallback: "Choose two skill proficiencies. Your proficiency bonus is doubled for any ability check you make using either of the chosen proficiencies.",
    srd: "At 3rd level, choose two of your skill proficiencies. Your proficiency bonus is doubled for any ability check you make that uses either of the chosen proficiencies.",
  },
  actionType: "passive",
  actionTypeSource: "tagged",
  choices: [{ kind: "skill", from: { source: "any-proficient" }, count: 2, grants: "expertise" }],
};

export const BARD_JACK_OF_ALL_TRADES: FeatureDef = {
  id: "bard-jack-of-all-trades",
  name: "Jack of All Trades",
  source: "SRD",
  origin: { kind: "class", classId: "ID_CLASS_BARD", level: 2 },
  prose: {
    fallback: "You can add half your proficiency bonus, rounded down, to any ability check you make that doesn't already include your proficiency bonus.",
  },
  actionType: "passive",
  actionTypeSource: "tagged",
  effects: [{ kind: "half-prof-on-checks", abilities: "all" }],
};

export const BARD_SONG_OF_REST: FeatureDef = {
  id: "bard-song-of-rest",
  name: "Song of Rest",
  source: "SRD",
  origin: { kind: "class", classId: "ID_CLASS_BARD", level: 2 },
  legacyNames: ["Song of Rest (d8)", "Song of Rest (d10)", "Song of Rest (d12)"],
  prose: {
    fallback: "You can use soothing music or oration during a Short Rest. Creatures who hear you regain extra Hit Points when they spend Hit Dice at the end of that rest. The die scales with Bard level: d6 (L2), d8 (L9), d10 (L13), d12 (L17).",
  },
  actionType: "passive",
  actionTypeSource: "tagged",
  effects: [
    {
      kind: "scaling-stat",
      stat: "song-of-rest-die",
      formula: {
        by: "class-level",
        classId: "ID_CLASS_BARD",
        table: { 2: "d6", 9: "d8", 13: "d10", 17: "d12" },
      },
    },
  ],
};

export const BARD_FONT_OF_INSPIRATION: FeatureDef = {
  id: "bard-font-of-inspiration",
  name: "Font of Inspiration",
  source: "SRD",
  origin: { kind: "class", classId: "ID_CLASS_BARD", level: 5 },
  prose: {
    fallback: "You now regain all your expended Bardic Inspiration uses when you finish a Short Rest or Long Rest. (Already encoded in the Bardic Inspiration resource via switchesTo: 'short-rest' at level 5.)",
  },
  actionType: "passive",
  actionTypeSource: "tagged",
};

export const BARD_COUNTERCHARM: FeatureDef = {
  id: "bard-countercharm",
  name: "Countercharm",
  source: "SRD",
  origin: { kind: "class", classId: "ID_CLASS_BARD", level: 6 },
  prose: {
    fallback: "As a Magic action, you can start a performance that lasts until the start of your next turn. During that time, you and each ally within 30 feet have Advantage on saving throws to avoid or end the Frightened or Charmed condition.",
    srd: "As an action, you can start a performance that lasts until the end of your next turn. Friendly creatures within 30 feet have advantage on saving throws against being frightened or charmed while they can hear you.",
  },
  actionType: "action",
  actionTypeSource: "tagged",
};

export const BARD_EXPERTISE_2: FeatureDef = {
  id: "bard-expertise-2",
  name: "Expertise",
  source: "SRD",
  origin: { kind: "class", classId: "ID_CLASS_BARD", level: 9 },
  legacyNames: ["Expertise (2)"],
  prose: {
    fallback: "Choose two more skill proficiencies. Your proficiency bonus is doubled for any ability check you make using either of the chosen proficiencies.",
  },
  actionType: "passive",
  actionTypeSource: "tagged",
  choices: [{ kind: "skill", from: { source: "any-proficient" }, count: 2, grants: "expertise" }],
};

export const BARD_MAGICAL_SECRETS: FeatureDef = {
  id: "bard-magical-secrets",
  name: "Magical Secrets",
  source: "SRD",
  origin: { kind: "class", classId: "ID_CLASS_BARD", level: 10 },
  prose: {
    fallback: "You have plundered magical knowledge from a wide spectrum of disciplines. Choose two spells from any class's spell list, including this one. A spell you choose must be of a level you can cast. The chosen spells count as Bard spells for you and are added to your spells known. (Spell system integration deferred.)",
  },
  actionType: "passive",
  actionTypeSource: "tagged",
};

export const BARD_MAGICAL_SECRETS_2: FeatureDef = {
  id: "bard-magical-secrets-2",
  name: "Magical Secrets",
  source: "SRD",
  origin: { kind: "class", classId: "ID_CLASS_BARD", level: 14 },
  legacyNames: ["Magical Secrets (2)"],
  prose: {
    fallback: "Choose two more spells from any class's spell list. They count as Bard spells for you and are added to your spells known. (Spell system integration deferred.)",
  },
  actionType: "passive",
  actionTypeSource: "tagged",
};

export const BARD_MAGICAL_SECRETS_3: FeatureDef = {
  id: "bard-magical-secrets-3",
  name: "Magical Secrets",
  source: "SRD",
  origin: { kind: "class", classId: "ID_CLASS_BARD", level: 18 },
  legacyNames: ["Magical Secrets (3)"],
  prose: {
    fallback: "Choose two more spells from any class's spell list. They count as Bard spells for you and are added to your spells known. (Spell system integration deferred.)",
  },
  actionType: "passive",
  actionTypeSource: "tagged",
};

export const BARD_SUPERIOR_INSPIRATION: FeatureDef = {
  id: "bard-superior-inspiration",
  name: "Superior Inspiration",
  source: "SRD",
  origin: { kind: "class", classId: "ID_CLASS_BARD", level: 20 },
  prose: {
    fallback: "When you roll Initiative and have no uses of Bardic Inspiration remaining, you regain one use. (Initiative-roll recharge encoding deferred — same group as Persistent Rage and Perfect Focus.)",
    srd: "At 20th level, when you roll for initiative and have no uses of Bardic Inspiration left, you regain one use.",
  },
  actionType: "passive",
  actionTypeSource: "tagged",
};

export const BARD_WORDS_OF_CREATION: FeatureDef = {
  id: "bard-words-of-creation",
  name: "Words of Creation",
  source: "SRD",
  origin: { kind: "class", classId: "ID_CLASS_BARD", level: 20 },
  prose: {
    fallback: "You have mastered two of the prime words of creation: Power Word Heal and Power Word Kill. You always have these spells prepared, they don't count against your prepared spells total, and you can cast each of them once without expending a spell slot. You regain these uses when you finish a Long Rest. (grantedSpells integration deferred to chunk 10.)",
  },
  actionType: "passive",
  actionTypeSource: "tagged",
};
