import type { FeatureDef } from "../types";

export const SUBCLASS_CHAMPION_REMARKABLE_ATHLETE: FeatureDef = {
  id: "subclass-champion-remarkable-athlete",
  name: "Remarkable Athlete",
  source: "SRD",
  origin: { kind: "subclass", subclassId: "ID_SUBCLASS_FIGHTER_CHAMPION", level: 7 },
  prose: {
    fallback: "Add half your proficiency bonus (rounded up) to any STR, DEX, or CON check that doesn't already use your proficiency bonus. Your running long jump distance increases by your STR modifier in feet.",
  },
  actionType: "passive",
  actionTypeSource: "tagged",
  effects: [{ kind: "half-prof-on-checks", abilities: ["str", "dex", "con"] }],
};
