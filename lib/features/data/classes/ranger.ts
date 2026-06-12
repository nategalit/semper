import type { FeatureDef } from "@/lib/features/types";

export const RANGER_FIGHTING_STYLE: FeatureDef = {
  id: "ranger-fighting-style",
  name: "Fighting Style",
  source: "SRD",
  origin: { kind: "class", classId: "ID_CLASS_RANGER", level: 2 },
  prose: { fallback: "Adopt a particular style of fighting as your specialty. You can't take a Fighting Style option more than once, even if you later get to choose again." },
  actionType: "passive",
  actionTypeSource: "tagged",
  choices: [{ kind: "feat", from: { tag: "fighting-style" }, count: 1 }],
};
