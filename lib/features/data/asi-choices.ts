import type { FeatureDef } from "@/lib/features/types";

const ASI_PROSE = {
  fallback:
    "Increase one ability score by 2, or two ability scores by 1 each. You can't increase an ability score above 20 this way. As an alternative, you can forgo the improvement and pick a feat.",
};

function makeAsiDef(classId: string, level: number): FeatureDef {
  const slug = classId.replace("ID_CLASS_", "").toLowerCase();
  return {
    id: `${slug}-asi-l${level}`,
    name: "Ability Score Improvement",
    source: "SRD",
    origin: { kind: "class", classId, level },
    prose: ASI_PROSE,
    actionType: "passive",
    actionTypeSource: "tagged",
    choices: [{ kind: "asi-or-feat", canTakeHalfFeat: true }],
  };
}

// ── Standard schedule (L4/8/12/16/19) ────────────────────────────────────────
const STD_LEVELS = [4, 8, 12, 16, 19] as const;
const STD_CLASSES = [
  "ID_CLASS_BARBARIAN",
  "ID_CLASS_BARD",
  "ID_CLASS_CLERIC",
  "ID_CLASS_DRUID",
  "ID_CLASS_MONK",
  "ID_CLASS_PALADIN",
  "ID_CLASS_RANGER",
  "ID_CLASS_SORCERER",
  "ID_CLASS_WARLOCK",
  "ID_CLASS_WIZARD",
] as const;

export const STD_ASI_DEFS: FeatureDef[] = STD_CLASSES.flatMap((classId) =>
  STD_LEVELS.map((level) => makeAsiDef(classId, level))
);

// ── Fighter schedule (L4/6/8/12/14/16/19) ────────────────────────────────────
const FIGHTER_LEVELS = [4, 6, 8, 12, 14, 16, 19] as const;
export const FIGHTER_ASI_DEFS: FeatureDef[] = FIGHTER_LEVELS.map((level) =>
  makeAsiDef("ID_CLASS_FIGHTER", level)
);

// ── Rogue schedule (L4/8/10/12/16/19) ────────────────────────────────────────
const ROGUE_LEVELS = [4, 8, 10, 12, 16, 19] as const;
export const ROGUE_ASI_DEFS: FeatureDef[] = ROGUE_LEVELS.map((level) =>
  makeAsiDef("ID_CLASS_ROGUE", level)
);

export const ALL_ASI_DEFS: FeatureDef[] = [
  ...STD_ASI_DEFS,
  ...FIGHTER_ASI_DEFS,
  ...ROGUE_ASI_DEFS,
];
