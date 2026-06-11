import type { FeatureDef } from "@/lib/features/types";

export const CLERIC_CHANNEL_DIVINITY: FeatureDef = {
  id: "cleric-channel-divinity",
  name: "Channel Divinity",
  source: "SRD",
  origin: { kind: "class", classId: "ID_CLASS_CLERIC", level: 2 },
  prose: {
    // Copied verbatim from lib/character/features.ts ID_CLASS_CLERIC channel_divinity description.
    // Verify in chunk 9.
    fallback: "Channel divine energy to fuel a magical effect. You gain uses at level 2 (1), level 6 (2), and level 18 (3). Recharges on a short or long rest.",
  },
  actionType: "action",
  actionTypeSource: "tagged",
  resource: {
    id: "channel_divinity",
    shape: { kind: "charges", max: { from: "class-table", classId: "cleric", column: "channelDivinityUses" } },
    recharge: { on: "long-rest", partialOn: "short-rest", amount: 1 },
    display: "pip",
  },
};
