"use client";

import { create } from "zustand";
import type { AbilityKey } from "@/lib/content/srd";
import type { AbilityScores } from "@/lib/types/character";
import type { Edition } from "@/lib/content/edition-filter";

export type AbilityMethod = "standard-array" | "point-buy";

// Standard array values to assign (descending).
export const STANDARD_ARRAY = [15, 14, 13, 12, 10, 8] as const;

// Point-buy cost table: ability score → cost in points.
export const POINT_BUY_COST: Record<number, number> = {
  8: 0, 9: 1, 10: 2, 11: 3, 12: 4, 13: 5, 14: 7, 15: 9,
};
export const POINT_BUY_BUDGET = 27;

export type { Edition };

export type WizardStep =
  | "name"
  | "edition"
  | "race"
  | "subrace"
  | "class"
  | "abilities"
  | "background"
  | "skills"
  | "subclass"
  | "class-features"
  | "review";

/** Canonical ordered steps. "subrace" and "class-features" are conditionally inserted by the wizard component. */
export const WIZARD_STEPS: WizardStep[] = [
  "name",
  "edition",
  "race",
  "subrace",
  "class",
  "abilities",
  "background",
  "skills",
  "subclass",
  "class-features",
  "review",
];

export const STEP_LABELS: Record<WizardStep, string> = {
  name: "Name",
  edition: "Edition",
  race: "Race",
  subrace: "Subrace",
  class: "Class",
  abilities: "Abilities",
  background: "Background",
  skills: "Skills",
  subclass: "Subclass",
  "class-features": "Class Features",
  review: "Review",
};

interface WizardState {
  step: WizardStep;
  name: string;
  edition: Edition;
  raceId: string;
  subraceId: string;
  classId: string;
  backgroundId: string;
  abilityMethod: AbilityMethod;
  abilityScores: AbilityScores;
  // Standard-array assignment: maps array index (0-5) to ability key or "".
  arrayAssignments: Record<number, AbilityKey | "">;

  classSkills: string[];
  wizardSubclassId: string;
  wizardFightingStyleId: string;
  /** Flexible ability picks (e.g. Half-Elf's two +1s), stored as an array of chosen keys. */
  flexibleAbilityPicks: AbilityKey[];

  setStep: (step: WizardStep) => void;
  nextStep: () => void;
  prevStep: () => void;
  setName: (name: string) => void;
  setEdition: (edition: Edition) => void;
  setRaceId: (id: string) => void;
  setSubraceId: (id: string) => void;
  setClassId: (id: string) => void;
  setBackgroundId: (id: string) => void;
  toggleClassSkill: (skill: string) => void;
  setWizardSubclassId: (id: string) => void;
  setWizardFightingStyleId: (id: string) => void;
  toggleFlexiblePick: (key: AbilityKey, maxCount: number) => void;
  setAbilityMethod: (method: AbilityMethod) => void;
  setAbilityScore: (key: AbilityKey, value: number) => void;
  setArrayAssignment: (index: number, key: AbilityKey | "") => void;
  computedAbilityScores: () => AbilityScores;
  pointBuySpent: () => number;
}

const DEFAULT_SCORES: AbilityScores = {
  str: 8, dex: 8, con: 8, int: 8, wis: 8, cha: 8,
};

export const useWizardStore = create<WizardState>((set, get) => ({
  step: "name",
  name: "",
  edition: "mix",
  raceId: "",
  subraceId: "",
  classId: "",
  backgroundId: "",
  classSkills: [],
  wizardSubclassId: "",
  wizardFightingStyleId: "",
  flexibleAbilityPicks: [],
  abilityMethod: "standard-array",
  abilityScores: { ...DEFAULT_SCORES },
  arrayAssignments: { 0: "", 1: "", 2: "", 3: "", 4: "", 5: "" },

  setStep: (step) => set({ step }),

  nextStep: () => {
    const idx = WIZARD_STEPS.indexOf(get().step);
    if (idx < WIZARD_STEPS.length - 1) set({ step: WIZARD_STEPS[idx + 1] });
  },

  prevStep: () => {
    const idx = WIZARD_STEPS.indexOf(get().step);
    if (idx > 0) set({ step: WIZARD_STEPS[idx - 1] });
  },

  setName: (name) => set({ name }),
  setEdition: (edition) =>
    set({ edition, raceId: "", subraceId: "", classId: "", backgroundId: "",
          classSkills: [], wizardSubclassId: "", flexibleAbilityPicks: [] }),
  setRaceId: (raceId) => set({ raceId, subraceId: "", flexibleAbilityPicks: [] }),
  setSubraceId: (subraceId) => set({ subraceId }),
  setClassId: (classId) => set({ classId, classSkills: [], wizardSubclassId: "", wizardFightingStyleId: "" }),
  setWizardSubclassId: (wizardSubclassId) => set({ wizardSubclassId }),
  setWizardFightingStyleId: (wizardFightingStyleId) => set({ wizardFightingStyleId }),
  setBackgroundId: (backgroundId) => set({ backgroundId }),
  toggleFlexiblePick: (key, maxCount) =>
    set((s) => {
      const picks = s.flexibleAbilityPicks;
      if (picks.includes(key)) return { flexibleAbilityPicks: picks.filter((k) => k !== key) };
      if (picks.length >= maxCount) return {};
      return { flexibleAbilityPicks: [...picks, key] };
    }),
  toggleClassSkill: (skill) =>
    set((s) => ({
      classSkills: s.classSkills.includes(skill)
        ? s.classSkills.filter((sk) => sk !== skill)
        : [...s.classSkills, skill],
    })),

  setAbilityMethod: (abilityMethod) =>
    set({
      abilityMethod,
      abilityScores: { ...DEFAULT_SCORES },
      arrayAssignments: { 0: "", 1: "", 2: "", 3: "", 4: "", 5: "" },
    }),

  setAbilityScore: (key, value) =>
    set((s) => ({ abilityScores: { ...s.abilityScores, [key]: value } })),

  setArrayAssignment: (index, key) => {
    const { arrayAssignments } = get();
    // Clear any existing assignment to the same key.
    const cleared = Object.fromEntries(
      Object.entries(arrayAssignments).map(([i, k]) =>
        k === key && Number(i) !== index ? [i, ""] : [i, k]
      )
    );
    set({ arrayAssignments: { ...cleared, [index]: key } });
  },

  computedAbilityScores: () => {
    const { abilityMethod, abilityScores, arrayAssignments } = get();
    if (abilityMethod === "point-buy") return { ...abilityScores };
    // Standard array: derive scores from assignments.
    const scores = { ...DEFAULT_SCORES };
    Object.entries(arrayAssignments).forEach(([i, key]) => {
      if (key) scores[key] = STANDARD_ARRAY[Number(i)];
    });
    return scores;
  },

  pointBuySpent: () => {
    const { abilityScores } = get();
    return Object.values(abilityScores).reduce(
      (sum, v) => sum + (POINT_BUY_COST[v] ?? 0),
      0
    );
  },
}));
