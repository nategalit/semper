import type { FeatureDef } from "@/lib/features/types";

export const WARLOCK_PACT_MAGIC: FeatureDef = {
  id: "warlock-pact-magic",
  name: "Pact Magic",
  source: "SRD",
  origin: { kind: "class", classId: "ID_CLASS_WARLOCK", level: 1 },
  prose: {
    fallback: "Your patron grants you a set of spell slots that all share the same level. Both the slot count and slot level scale with your Warlock level (1 slot at L1 scaling to 4 at L17+; slot level 1st at L1-2 scaling to 5th at L9+). All slots recharge on a Short Rest or Long Rest. (Spellcasting system integration deferred.)",
    srd: "Your arcane research and the magic bestowed on you by your patron have given you facility with spells.",
  },
  actionType: "passive",
  actionTypeSource: "tagged",
  resource: {
    id: "pact_magic",
    shape: { kind: "slots", level: "by-table", max: { from: "class-table", classId: "warlock", column: "pactSlots" } },
    recharge: { on: "short-rest" },
    display: "spell-slot-row",
  },
};

export const WARLOCK_ELDRITCH_INVOCATIONS: FeatureDef = {
  id: "warlock-eldritch-invocations",
  name: "Eldritch Invocations",
  source: "SRD",
  origin: { kind: "class", classId: "ID_CLASS_WARLOCK", level: 2 },
  prose: {
    fallback: "You have unearthed eldritch invocations — fragments of forbidden knowledge that imbue you with abiding magical abilities. You learn a number of invocations based on your Warlock level (2 at L2, 3 at L5, 4 at L7, 5 at L9, 6 at L12, 7 at L15, 8 at L18). You can replace one known invocation each time you gain a Warlock level. Some invocations have prerequisites. (Individual invocation FeatureDefs deferred.)",
    srd: "In your study of occult lore, you have unearthed eldritch invocations, fragments of forbidden knowledge that imbue you with an abiding magical ability.",
  },
  actionType: "passive",
  actionTypeSource: "tagged",
  choices: [
    {
      kind: "feat",
      from: { tag: "invocation" },
      count: { from: "class-table", classId: "warlock", column: "invocationsKnown" },
      rePickOn: "level-up",
    },
  ],
};

export const WARLOCK_MAGICAL_CUNNING: FeatureDef = {
  id: "warlock-magical-cunning",
  name: "Magical Cunning",
  source: "SRD",
  origin: { kind: "class", classId: "ID_CLASS_WARLOCK", level: 2 },
  prose: {
    fallback: "Once per Long Rest, as a Magic action, you can regain a number of expended Pact Magic spell slots equal to half your maximum number of Pact Magic spell slots (rounded up). (Partial slot recovery mechanic described in prose — parallel to Sorcerous Restoration ch9g.)",
  },
  actionType: "action",
  actionTypeSource: "tagged",
};

export const WARLOCK_PACT_BOON: FeatureDef = {
  id: "warlock-pact-boon",
  name: "Pact Boon",
  source: "SRD",
  origin: { kind: "class", classId: "ID_CLASS_WARLOCK", level: 3 },
  prose: {
    fallback: "Your otherworldly patron bestows a gift upon you for your loyal service. Choose your pact boon.",
  },
  actionType: "passive",
  actionTypeSource: "tagged",
  choices: [
    {
      kind: "mode",
      affects: "pact-boon",
      options: [
        {
          id: "blade",
          label: "Pact of the Blade",
          prose: "You can use your action to create a pact weapon in your empty hand. You are proficient with it and can use it as your spellcasting focus. It disappears if you dismiss it, if you conjure another, or when you die.",
        },
        {
          id: "chain",
          label: "Pact of the Chain",
          prose: "You learn the Find Familiar spell and can cast it as a ritual. Your familiar can take the form of an imp, pseudodragon, quasit, or sprite. (Familiar spell grant deferred — ch10.)",
        },
        {
          id: "tome",
          label: "Pact of the Tome",
          prose: "Your patron gives you a grimoire called a Book of Shadows. Choose three cantrips from any class's spell list; they count as Warlock spells for you. (Cantrip grants deferred — ch10.)",
        },
        {
          id: "talisman",
          label: "Pact of the Talisman",
          prose: "Your patron gives you an amulet. When the wearer fails an ability check, they can add a d4 to the roll. You can give the talisman to others; if it is lost you can perform a 1-hour ritual to replace it.",
        },
      ],
    },
  ],
};

export const WARLOCK_CONTACT_PATRON: FeatureDef = {
  id: "warlock-contact-patron",
  name: "Contact Patron",
  source: "SRD",
  origin: { kind: "class", classId: "ID_CLASS_WARLOCK", level: 9 },
  prose: {
    fallback: "Once per Long Rest, as a Magic action, you can telepathically commune with your otherworldly patron. Your patron may offer guidance, share information, or grant a boon at the GM's discretion.",
  },
  actionType: "action",
  actionTypeSource: "tagged",
};

export const WARLOCK_MYSTIC_ARCANUM_6: FeatureDef = {
  id: "warlock-mystic-arcanum-6",
  name: "Mystic Arcanum",
  source: "SRD",
  origin: { kind: "class", classId: "ID_CLASS_WARLOCK", level: 11 },
  legacyNames: ["Mystic Arcanum (6th level)"],
  prose: {
    fallback: "Your patron bestows a magical secret upon you. Choose one 6th-level spell from any class's spell list as your Mystic Arcanum. You can cast it once without expending a spell slot, and you regain the ability to do so when you finish a Long Rest.",
    srd: "At 11th level, your patron bestows upon you a magical secret called an arcanum. Choose one 6th-level spell from the warlock spell list as this arcanum.",
  },
  actionType: "passive",
  actionTypeSource: "tagged",
  choices: [{ kind: "spell", from: { levels: [6] }, count: 1 }],
  resource: {
    id: "mystic_arcanum_6",
    shape: { kind: "per-tier-one-shot", tiers: [6] },
    recharge: { on: "long-rest" },
    display: "per-tier-checkboxes",
  },
};

export const WARLOCK_MYSTIC_ARCANUM_7: FeatureDef = {
  id: "warlock-mystic-arcanum-7",
  name: "Mystic Arcanum",
  source: "SRD",
  origin: { kind: "class", classId: "ID_CLASS_WARLOCK", level: 13 },
  legacyNames: ["Mystic Arcanum (7th level)"],
  prose: {
    fallback: "Your patron grants you another arcanum. Choose one 7th-level spell from any class's spell list. You can cast it once without expending a spell slot per Long Rest.",
    srd: "At 13th level, your patron bestows upon you another magical secret. Choose one 7th-level spell from the warlock spell list.",
  },
  actionType: "passive",
  actionTypeSource: "tagged",
  choices: [{ kind: "spell", from: { levels: [7] }, count: 1 }],
  resource: {
    id: "mystic_arcanum_7",
    shape: { kind: "per-tier-one-shot", tiers: [7] },
    recharge: { on: "long-rest" },
    display: "per-tier-checkboxes",
  },
};

export const WARLOCK_MYSTIC_ARCANUM_8: FeatureDef = {
  id: "warlock-mystic-arcanum-8",
  name: "Mystic Arcanum",
  source: "SRD",
  origin: { kind: "class", classId: "ID_CLASS_WARLOCK", level: 15 },
  legacyNames: ["Mystic Arcanum (8th level)"],
  prose: {
    fallback: "Your patron grants you another arcanum. Choose one 8th-level spell from any class's spell list. You can cast it once without expending a spell slot per Long Rest.",
    srd: "At 15th level, your patron bestows upon you another magical secret. Choose one 8th-level spell from the warlock spell list.",
  },
  actionType: "passive",
  actionTypeSource: "tagged",
  choices: [{ kind: "spell", from: { levels: [8] }, count: 1 }],
  resource: {
    id: "mystic_arcanum_8",
    shape: { kind: "per-tier-one-shot", tiers: [8] },
    recharge: { on: "long-rest" },
    display: "per-tier-checkboxes",
  },
};

export const WARLOCK_MYSTIC_ARCANUM_9: FeatureDef = {
  id: "warlock-mystic-arcanum-9",
  name: "Mystic Arcanum",
  source: "SRD",
  origin: { kind: "class", classId: "ID_CLASS_WARLOCK", level: 17 },
  legacyNames: ["Mystic Arcanum (9th level)"],
  prose: {
    fallback: "Your patron grants you another arcanum. Choose one 9th-level spell from any class's spell list. You can cast it once without expending a spell slot per Long Rest.",
    srd: "At 17th level, your patron bestows upon you another magical secret. Choose one 9th-level spell from the warlock spell list.",
  },
  actionType: "passive",
  actionTypeSource: "tagged",
  choices: [{ kind: "spell", from: { levels: [9] }, count: 1 }],
  resource: {
    id: "mystic_arcanum_9",
    shape: { kind: "per-tier-one-shot", tiers: [9] },
    recharge: { on: "long-rest" },
    display: "per-tier-checkboxes",
  },
};

export const WARLOCK_ELDRITCH_MASTER: FeatureDef = {
  id: "warlock-eldritch-master",
  name: "Eldritch Master",
  source: "SRD",
  origin: { kind: "class", classId: "ID_CLASS_WARLOCK", level: 20 },
  prose: {
    fallback: "You can spend 1 minute entreating your patron for aid to regain all your expended Pact Magic spell slots. Once you do so, you must finish a Long Rest before you can use this feature again. (Initiative-roll recharge for the PHB24 variant deferred — same group as Persistent Rage and Perfect Focus.)",
    srd: "At 20th level, you can draw on your inner reserve of mystical power while entreating your patron to regain expended spell slots.",
  },
  actionType: "special",
  actionTypeSource: "tagged",
};
