import type { FeatureDef } from "@/lib/features/types";

export const PALADIN_FIGHTING_STYLE: FeatureDef = {
  id: "paladin-fighting-style",
  name: "Fighting Style",
  source: "SRD",
  origin: { kind: "class", classId: "ID_CLASS_PALADIN", level: 2 },
  prose: { fallback: "Adopt a particular style of fighting as your specialty. You can't take a Fighting Style option more than once, even if you later get to choose again." },
  actionType: "passive",
  actionTypeSource: "tagged",
  choices: [{ kind: "feat", from: { tag: "fighting-style" }, count: 1 }],
};

export const LAY_ON_HANDS: FeatureDef = {
  id: "paladin-lay-on-hands",
  name: "Lay on Hands",
  source: "SRD",
  origin: { kind: "class", classId: "ID_CLASS_PALADIN", level: 1 },
  prose: {
    // Copied verbatim from lib/character/features.ts ID_CLASS_PALADIN lay_on_hands description.
    // Verify in chunk 9.
    fallback: "Touch a creature to restore HP from your healing pool (paladin level × 5). As an action you can also cure one disease or poison for 5 points instead. Recharges on a long rest.",
  },
  actionType: "action",
  actionTypeSource: "tagged",
  resource: {
    id: "lay_on_hands",
    shape: { kind: "pool", max: { from: "level", classId: "ID_CLASS_PALADIN", multiplier: 5 } },
    recharge: { on: "long-rest" },
    display: "number",
  },
};

// PHB24 prose — transcribed from 2024 Player's Handbook. Verify in chunk 9.
export const PALADIN_AURA_OF_PROTECTION: FeatureDef = {
  id: "paladin-aura-of-protection",
  name: "Aura of Protection",
  source: "SRD",
  origin: { kind: "class", classId: "ID_CLASS_PALADIN", level: 6 },
  prose: {
    fallback: `You radiate a protective, unseeable aura in a 10-foot Emanation that originates from you. The aura is inactive while you have the Incapacitated condition.

You and your allies in the aura gain a bonus to saving throws equal to your Charisma modifier (minimum bonus of +1).

If another Paladin is present, a creature can benefit from only one Aura of Protection at a time; the creature chooses which aura while in them.`,
  },
  actionType: "passive",
  actionTypeSource: "tagged",
};

// PHB24 prose — transcribed from 2024 Player's Handbook. Verify in chunk 9.
export const PALADIN_AURA_EXPANSION: FeatureDef = {
  id: "paladin-aura-expansion",
  name: "Aura Expansion",
  source: "SRD",
  origin: { kind: "class", classId: "ID_CLASS_PALADIN", level: 18 },
  parentFeatureId: "paladin-aura-of-protection",
  augments: "extend",
  prose: {
    fallback: "Your Aura of Protection is now a 30-foot Emanation.",
  },
  actionType: "passive",
  actionTypeSource: "tagged",
};

export const PALADIN_CHANNEL_DIVINITY: FeatureDef = {
  id: "paladin-channel-divinity",
  name: "Channel Divinity",
  source: "SRD",
  origin: { kind: "class", classId: "ID_CLASS_PALADIN", level: 3 },
  prose: {
    // Copied verbatim from lib/character/features.ts ID_CLASS_PALADIN channel_divinity description.
    // Verify in chunk 9.
    fallback: "Channel divine energy granted by your Sacred Oath to fuel a magical effect. Available at level 3. Recharges on a short or long rest.",
  },
  actionType: "action",
  actionTypeSource: "tagged",
  resource: {
    id: "channel_divinity",
    shape: { kind: "charges", max: 1 },
    recharge: { on: "short-rest" },
    display: "pip",
  },
};
