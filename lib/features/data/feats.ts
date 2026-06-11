import type { FeatureDef } from "../types";

export const FEAT_TOUGH: FeatureDef = {
  id: "feat-tough",
  name: "Tough",
  source: "SRD",
  origin: { kind: "feat", featId: "ID_WOTC_PHB24_FEAT_TOUGH" },
  prose: {
    // prose: written from PHB24 reference, not copied from existing codebase content. Verify in chunk 9.
    fallback: "Your hit point maximum increases by 2 for each level you have.",
  },
  actionType: "passive",
  actionTypeSource: "tagged",
  effects: [{ kind: "hp-per-level", value: 2 }],
};

export const FEAT_ALERT: FeatureDef = {
  id: "feat-alert",
  name: "Alert",
  source: "SRD",
  origin: { kind: "feat", featId: "ID_WOTC_PHB24_FEAT_ALERT" },
  prose: {
    // prose: written from PHB24 reference, not copied from existing codebase content. Verify in chunk 9.
    fallback: "You gain a bonus to initiative rolls equal to your Proficiency Bonus. You can't be surprised while you are conscious.",
  },
  actionType: "passive",
  actionTypeSource: "tagged",
  effects: [{ kind: "initiative-add", value: "prof-bonus" }],
};
