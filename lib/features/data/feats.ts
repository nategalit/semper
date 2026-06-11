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

export const FEAT_LUCKY: FeatureDef = {
  id: "feat-lucky",
  name: "Lucky",
  source: "SRD",
  origin: { kind: "feat", featId: ["ID_PHB_FEAT_LUCKY", "ID_WOTC_PHB24_FEAT_LUCKY"] },
  prose: {
    // Copied verbatim from lib/character/features.ts LUCKY_DEF description. Verify in chunk 9.
    fallback: "Spend a luck point to roll an extra d20 for an attack roll, ability check, or saving throw (choose after rolling, before outcome). You can also spend one to impose disadvantage on an attack roll made against you. Recharges on a long rest.",
  },
  actionType: "free",
  actionTypeSource: "tagged",
  resource: {
    id: "lucky",
    shape: { kind: "charges", max: 3 },
    recharge: { on: "long-rest" },
    display: "pip",
  },
};

export const FEAT_INSPIRING_LEADER: FeatureDef = {
  id: "feat-inspiring-leader",
  name: "Inspiring Leader",
  source: "SRD",
  origin: { kind: "feat", featId: ["ID_PHB_FEAT_INSPIRINGLEADER", "ID_WOTC_PHB24_FEAT_INSPIRING_LEADER"] },
  prose: {
    // Copied verbatim from lib/character/features.ts INSPIRING_LEADER_DEF description. Verify in chunk 9.
    fallback: "Over 10 minutes, inspire up to 6 creatures you can see (including yourself). Each gains temporary HP equal to your level + your Charisma modifier. Once per short or long rest.",
  },
  actionType: "special",
  actionTypeSource: "tagged",
  resource: {
    id: "inspiring_leader",
    shape: { kind: "charges", max: 1 },
    recharge: { on: "short-rest" },
    display: "pip",
  },
};
