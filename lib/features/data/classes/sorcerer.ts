import type { FeatureDef } from "@/lib/features/types";

export const SORCERY_POINTS: FeatureDef = {
  id: "sorcerer-sorcery-points",
  name: "Sorcery Points",
  source: "SRD",
  origin: { kind: "class", classId: "ID_CLASS_SORCERER", level: 2 },
  prose: {
    // Copied verbatim from lib/character/features.ts ID_CLASS_SORCERER sorcery_points description.
    // Verify in chunk 9.
    fallback: "A pool of magical energy equal to your sorcerer level. Spend to create spell slots or fuel Metamagic options. Recharges on a long rest.",
  },
  actionType: "passive",
  actionTypeSource: "tagged",
  resource: {
    id: "sorcery_points",
    // max = sorcerer level; L1=0 is unreachable — origin.level: 2 gates the feature
    shape: { kind: "points", max: { from: "level", classId: "ID_CLASS_SORCERER" } },
    recharge: { on: "long-rest" },
    display: "number",
  },
};
