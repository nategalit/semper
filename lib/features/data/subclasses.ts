import type { FeatureDef } from "../types";

export const CHAMPION_EXTRA_FIGHTING_STYLE: FeatureDef = {
  id: "champion-extra-fighting-style",
  name: "Additional Fighting Style",
  source: "SRD",
  origin: { kind: "subclass", subclassId: "ID_SUBCLASS_FIGHTER_CHAMPION", level: 10 },
  prose: { fallback: "At 10th level you can choose a second option from the Fighting Style class feature." },
  actionType: "passive",
  actionTypeSource: "tagged",
  choices: [{ kind: "feat", from: { tag: "fighting-style" }, count: 1 }],
};

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
