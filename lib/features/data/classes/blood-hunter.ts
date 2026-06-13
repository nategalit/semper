import type { FeatureDef } from "@/lib/features/types";

export const BLOODHUNTER_HUNTERS_BANE: FeatureDef = {
  id: "bloodhunter-hunters-bane",
  name: "Hunter's Bane",
  source: "Aurora",
  origin: { kind: "class", classId: "ID_CLASS_BLOOD_HUNTER", level: 1 },
  prose: {
    fallback:
      "You have survived the Hunter's Bane ritual, permanently binding yourself to the darkness. You have advantage on Wisdom (Survival) checks to track fey, fiends, or undead, as well as on Intelligence checks to recall information about them. Your hit point maximum decreases by 1 permanently; this decrease cannot be removed by any means.",
  },
  actionType: "passive",
  actionTypeSource: "tagged",
};

export const BLOODHUNTER_BLOOD_MALEDICT: FeatureDef = {
  id: "bloodhunter-blood-maledict",
  name: "Blood Maledict",
  source: "Aurora",
  origin: { kind: "class", classId: "ID_CLASS_BLOOD_HUNTER", level: 1 },
  prose: {
    fallback:
      "As a bonus action, you invoke one of your known blood curses on a creature you can see within 30 feet, expending one use. You can amplify a blood curse by expending one additional use and losing hit points equal to one roll of your Hemocraft die (this cannot reduce you below 1 hp). Uses scale by level: 1 (L1), 2 (L5), 3 (L13), 4 (L17). Individual blood curses (Binding, Corrosion, Expulsion, Grave, Hexing, Purgation, Silence, Vulnerability) are deferred to a future chunk.",
  },
  actionType: "bonus_action",
  actionTypeSource: "tagged",
  resource: {
    id: "blood_maledict",
    shape: {
      kind: "charges",
      max: { from: "class-table", classId: "blood-hunter", column: "maledictUses" },
    },
    recharge: { on: "long-rest" },
    display: "pip",
  },
};

export const BLOODHUNTER_CRIMSON_RITE: FeatureDef = {
  id: "bloodhunter-crimson-rite",
  name: "Crimson Rite",
  source: "Aurora",
  origin: { kind: "class", classId: "ID_CLASS_BLOOD_HUNTER", level: 2 },
  prose: {
    fallback:
      "As a bonus action, you imbue one weapon you're holding with a chosen Crimson Rite, rolling your Hemocraft die and losing that many hit points (you cannot be reduced below 1 hp this way). The rite adds damage of the rite's type on each hit; only one rite can be active at a time; it ends on a Short or Long Rest or death. Hemocraft die scales: d4 (L1–4), d6 (L5–8), d8 (L9–12), d10 (L13–16), d12 (L17–20). Additional rites (Rite of the Flame/fire, Rite of the Frozen/cold, Rite of the Storm/lightning+thunder) unlock through Blood Hunter Orders.",
  },
  actionType: "bonus_action",
  actionTypeSource: "tagged",
  choices: [
    {
      kind: "mode",
      affects: "crimson-rite-type",
      options: [
        {
          id: "rite-of-the-dawn",
          label: "Rite of the Dawn",
          prose:
            "Your rite deals radiant damage. While active, you shed dim light in a 10-foot radius and have advantage on saving throws against being frightened.",
        },
        {
          id: "rite-of-the-dusk",
          label: "Rite of the Dusk",
          prose:
            "Your rite deals necrotic damage. While active, you gain darkvision to 60 feet (or extend existing darkvision by 30 feet).",
        },
        {
          id: "rite-of-the-oracle",
          label: "Rite of the Oracle",
          prose:
            "Your rite deals psychic damage. While active, you can see invisible creatures and objects within 60 feet.",
        },
      ],
    },
  ],
};

export const BLOODHUNTER_FIGHTING_STYLE: FeatureDef = {
  id: "bloodhunter-fighting-style",
  name: "Fighting Style",
  source: "Aurora",
  origin: { kind: "class", classId: "ID_CLASS_BLOOD_HUNTER", level: 2 },
  prose: {
    fallback: "You adopt a particular style of fighting as your specialty. Choose one Fighting Style feat.",
  },
  actionType: "passive",
  actionTypeSource: "tagged",
  choices: [{ kind: "feat", from: { tag: "fighting-style" }, count: 1 }],
};

export const BLOODHUNTER_EXTRA_ATTACK: FeatureDef = {
  id: "bloodhunter-extra-attack",
  name: "Extra Attack",
  source: "Aurora",
  origin: { kind: "class", classId: "ID_CLASS_BLOOD_HUNTER", level: 5 },
  prose: {
    fallback: "You can attack twice, instead of once, whenever you take the Attack action on your turn.",
  },
  actionType: "passive",
  actionTypeSource: "tagged",
};

export const BLOODHUNTER_BRAND_OF_CASTIGATION: FeatureDef = {
  id: "bloodhunter-brand-of-castigation",
  name: "Brand of Castigation",
  source: "Aurora",
  origin: { kind: "class", classId: "ID_CLASS_BLOOD_HUNTER", level: 6 },
  prose: {
    fallback:
      "When a creature you can see within 60 feet damages you, you can use your reaction to magically brand it until you finish a long rest. While branded: you always know the creature's location if within 60 feet; the branded creature has disadvantage on attack rolls against creatures other than you; if the branded creature dies, you can transfer the brand to another creature within 60 feet as a bonus action.",
  },
  actionType: "reaction",
  actionTypeSource: "tagged",
};

export const BLOODHUNTER_GRIM_PSYCHOMETRY: FeatureDef = {
  id: "bloodhunter-grim-psychometry",
  name: "Grim Psychometry",
  source: "Aurora",
  origin: { kind: "class", classId: "ID_CLASS_BLOOD_HUNTER", level: 9 },
  prose: {
    fallback:
      "As an action, you touch an object that has been involved in the suffering of a sapient creature. The DM shares a brief psychic impression of the object's history — who created it, who last used it, or a significant event it was part of. If used in a crime or act of violence, you see a brief vision of that event. Each object can be read once this way; the object is not damaged.",
  },
  actionType: "special",
  actionTypeSource: "tagged",
};

export const BLOODHUNTER_BRAND_OF_TETHERING: FeatureDef = {
  id: "bloodhunter-brand-of-tethering",
  name: "Brand of Tethering",
  source: "Aurora",
  origin: { kind: "class", classId: "ID_CLASS_BLOOD_HUNTER", level: 13 },
  prose: {
    fallback:
      "Creatures marked by your Brand of Castigation can no longer take the Dash action, and if they attempt to teleport they must succeed on a Wisdom saving throw (DC = 8 + your proficiency bonus + your Intelligence modifier) or the teleportation fails.",
  },
  actionType: "passive",
  actionTypeSource: "tagged",
};

export const BLOODHUNTER_HARDENED_SOUL: FeatureDef = {
  id: "bloodhunter-hardened-soul",
  name: "Hardened Soul",
  source: "Aurora",
  origin: { kind: "class", classId: "ID_CLASS_BLOOD_HUNTER", level: 14 },
  prose: {
    fallback: "You have advantage on saving throws against being charmed or frightened.",
  },
  actionType: "passive",
  actionTypeSource: "tagged",
};

export const BLOODHUNTER_SANGUINE_MASTERY: FeatureDef = {
  id: "bloodhunter-sanguine-mastery",
  name: "Sanguine Mastery",
  source: "Aurora",
  origin: { kind: "class", classId: "ID_CLASS_BLOOD_HUNTER", level: 20 },
  prose: {
    fallback:
      "You can amplify blood curses without expending additional uses and without losing hit points. Additionally, when you are reduced to 0 hit points but not killed outright, you can expend one use of Blood Maledict to instead drop to 1 hit point.",
  },
  actionType: "special",
  actionTypeSource: "tagged",
};
