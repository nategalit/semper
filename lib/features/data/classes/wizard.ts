import type { FeatureDef } from "@/lib/features/types";

export const ARCANE_RECOVERY: FeatureDef = {
  id: "wizard-arcane-recovery",
  name: "Arcane Recovery",
  source: "SRD",
  origin: { kind: "class", classId: "ID_CLASS_WIZARD", level: 1 },
  prose: {
    // Copied verbatim from lib/character/features.ts ID_CLASS_WIZARD arcane_recovery description.
    // Verify in chunk 9.
    fallback: "Once per day during a short rest, recover expended spell slots with a combined level up to half your wizard level (rounded up). Cannot recover 6th level or higher slots.",
  },
  actionType: "special",
  actionTypeSource: "tagged",
  resource: {
    id: "arcane_recovery",
    shape: { kind: "charges", max: 1 },
    recharge: { on: "long-rest" },
    display: "pip",
  },
};
