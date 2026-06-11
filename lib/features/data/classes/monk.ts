import type { FeatureDef } from "@/lib/features/types";

export const KI_POINTS: FeatureDef = {
  id: "monk-ki-points",
  name: "Ki Points",
  source: "SRD",
  origin: { kind: "class", classId: "ID_CLASS_MONK", level: 2 },
  prose: {
    // Copied verbatim from lib/character/features.ts ID_CLASS_MONK ki_points description.
    // Verify in chunk 9.
    fallback: "Fuel special monk abilities: Flurry of Blows, Patient Defense, Step of the Wind, and more. Ki points = monk level. Recharge on a short or long rest.",
  },
  actionType: "passive",
  actionTypeSource: "tagged",
  resource: {
    id: "ki_points",
    // max = monk level; L1=0 is unreachable — origin.level: 2 gates the feature
    shape: { kind: "points", max: { from: "level", classId: "ID_CLASS_MONK" } },
    recharge: { on: "short-rest" },
    // "number" display: Ki pools reach up to 20; pip layout would be impractical
    display: "number",
  },
};
