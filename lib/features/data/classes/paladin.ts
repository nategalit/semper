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
