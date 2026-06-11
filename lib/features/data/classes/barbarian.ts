import type { FeatureDef } from "@/lib/features/types";

export const BARBARIAN_RAGE: FeatureDef = {
  id: "barbarian-rage",
  name: "Rage",
  source: "SRD",
  origin: { kind: "class", classId: "ID_CLASS_BARBARIAN", level: 1 },
  prose: {
    // prose: copied verbatim from lib/character/features.ts CLASS_FEATURES["ID_CLASS_BARBARIAN"][0].description
    // Verify in chunk 9.
    fallback: "Enter a rage as a bonus action. While raging you gain advantage on STR checks and saves, bonus damage, and resistance to physical damage. Lasts 1 minute.",
  },
  actionType: "bonus_action",
  actionTypeSource: "tagged",
  resource: {
    id: "rage",
    shape: { kind: "charges", max: { from: "class-table", classId: "barbarian", column: "rages" } },
    // TODO: PHB24 also grants 1 rage on short rest; the legacy path doesn't model this either.
    recharge: { on: "long-rest" },
    display: "pip",
  },
};
