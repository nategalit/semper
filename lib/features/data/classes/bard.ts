import type { FeatureDef } from "@/lib/features/types";

export const BARDIC_INSPIRATION: FeatureDef = {
  id: "bard-bardic-inspiration",
  name: "Bardic Inspiration",
  source: "SRD",
  origin: { kind: "class", classId: "ID_CLASS_BARD", level: 1 },
  prose: {
    // Copied verbatim from lib/character/features.ts ID_CLASS_BARD bardic_inspiration description.
    // Verify in chunk 9.
    fallback: "As a bonus action, grant an ally a Bardic Inspiration die (d6→d12) they can add to one ability check, attack roll, or saving throw within 10 minutes. Charges = CHA modifier. Recharges on short rest at level 5.",
  },
  actionType: "bonus_action",
  actionTypeSource: "tagged",
  resource: {
    id: "bardic_inspiration",
    shape: { kind: "charges", max: { from: "ability-mod", ability: "cha", min: 1 } },
    // Switches to short-rest recharge at L5 (Font of Inspiration)
    recharge: { on: "long-rest", switchesTo: "short-rest", atLevel: 5 },
    display: "pip",
  },
};
