import type { FeatureDef } from "@/lib/features/types";

export const WILD_SHAPE: FeatureDef = {
  id: "druid-wild-shape",
  name: "Wild Shape",
  source: "SRD",
  origin: { kind: "class", classId: "ID_CLASS_DRUID", level: 2 },
  prose: {
    // Copied verbatim from lib/character/features.ts ID_CLASS_DRUID wild_shape description.
    // Verify in chunk 9.
    fallback: "As an action, transform into a beast you have seen. CR limit and available forms increase with level. Lasts until you run out of HP, dismiss it, or use Wild Shape again.",
  },
  actionType: "action",
  actionTypeSource: "tagged",
  resource: {
    id: "wild_shape",
    shape: { kind: "charges", max: 2 },
    recharge: { on: "short-rest" },
    display: "pip",
  },
};
