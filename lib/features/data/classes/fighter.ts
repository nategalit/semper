import type { FeatureDef } from "@/lib/features/types";

export const ACTION_SURGE: FeatureDef = {
  id: "fighter-action-surge",
  name: "Action Surge",
  source: "SRD",
  origin: { kind: "class", classId: "ID_CLASS_FIGHTER", level: 2 },
  prose: {
    // Copied verbatim from lib/character/features.ts ID_CLASS_FIGHTER action_surge description.
    // Verify in chunk 9.
    fallback: "On your turn, take one additional action on top of your regular action. Two uses per rest at level 17.",
  },
  actionType: "free",
  actionTypeSource: "tagged",
  resource: {
    id: "action_surge",
    shape: { kind: "charges", max: { from: "class-table", classId: "fighter", column: "actionSurgeUses" } },
    recharge: { on: "short-rest" },
    display: "pip",
  },
};

export const SECOND_WIND: FeatureDef = {
  id: "fighter-second-wind",
  name: "Second Wind",
  source: "SRD",
  origin: { kind: "class", classId: "ID_CLASS_FIGHTER", level: 1 },
  prose: {
    // Copied verbatim from lib/character/features.ts ID_CLASS_FIGHTER second_wind description.
    // Verify in chunk 9.
    fallback: "As a bonus action, regain HP equal to 1d10 + your fighter level. Once per short or long rest.",
  },
  actionType: "bonus_action",
  actionTypeSource: "tagged",
  resource: {
    id: "second_wind",
    shape: { kind: "charges", max: 1 },
    recharge: { on: "short-rest" },
    display: "pip",
  },
};
