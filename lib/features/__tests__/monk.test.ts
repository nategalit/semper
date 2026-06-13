// Monk FeatureDef fill tests — chunk 9c.
// Covers: registry presence, collectActiveFeatures level gating,
// Martial Arts die scaling-stat, Unarmored Defense ac-base,
// Body and Mind ability effects, spendsResource, legacyNames.

import { describe, it, expect } from "vitest";
import { collectActiveFeatures, getFeatureDef } from "..";
import type { Character } from "@/lib/types/character";

function makeMonk(level: number): Character {
  return {
    id: "test",
    userId: "user",
    name: "Test Monk",
    level,
    classId: "ID_CLASS_MONK",
    raceId: "ID_RACE_HUMAN",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    data: {
      abilityScores: { str: 10, dex: 16, con: 14, int: 10, wis: 16, cha: 10 },
      currentHp: 10,
      maxHp: 10,
      tempHp: 0,
      hitDiceTotal: level,
      hitDiceRemaining: level,
      deathSaves: { successes: 0, failures: 0 },
      inspiration: false,
      xp: 0,
      currency: { cp: 0, sp: 0, ep: 0, gp: 0, pp: 0 },
    },
  };
}

// ── Registry presence ─────────────────────────────────────────────────────────

describe("Monk registry (chunk 9c)", () => {
  const IDS = [
    "monk-ki-points",
    "monk-martial-arts",
    "monk-unarmored-defense",
    "monk-unarmored-movement",
    "monk-flurry-of-blows",
    "monk-patient-defense",
    "monk-step-of-the-wind",
    "monk-deflect-attacks",
    "monk-slow-fall",
    "monk-extra-attack",
    "monk-stunning-strike",
    "monk-ki-empowered-strikes",
    "monk-evasion",
    "monk-stillness-of-mind",
    "monk-acrobatic-movement",
    "monk-self-restoration",
    "monk-tongue-of-sun-and-moon",
    "monk-deflect-energy",
    "monk-disciplined-survivor",
    "monk-empty-body",
    "monk-perfect-focus",
    "monk-superior-defense",
    "monk-body-and-mind",
  ] as const;

  for (const id of IDS) {
    it(`registers ${id}`, () => {
      expect(getFeatureDef(id)).toBeDefined();
    });
  }
});

// ── legacyNames ───────────────────────────────────────────────────────────────

describe("Monk legacyNames (chunk 9c)", () => {
  it("ki-points has legacyNames including 'Ki'", () => {
    expect(getFeatureDef("monk-ki-points")?.legacyNames).toContain("Ki");
  });

  it("deflect-attacks has legacyNames: ['Deflect Missiles']", () => {
    expect(getFeatureDef("monk-deflect-attacks")?.legacyNames).toEqual(["Deflect Missiles"]);
  });

  it("acrobatic-movement has legacyNames: ['Unarmored Movement Improvement']", () => {
    expect(getFeatureDef("monk-acrobatic-movement")?.legacyNames).toEqual(["Unarmored Movement Improvement"]);
  });

  it("self-restoration has legacyNames: ['Purity of Body']", () => {
    expect(getFeatureDef("monk-self-restoration")?.legacyNames).toEqual(["Purity of Body"]);
  });

  it("disciplined-survivor has legacyNames including 'Diamond Soul' and 'Timeless Body'", () => {
    const names = getFeatureDef("monk-disciplined-survivor")?.legacyNames ?? [];
    expect(names).toContain("Diamond Soul");
    expect(names).toContain("Timeless Body");
  });

  it("body-and-mind has legacyNames: ['Perfect Self']", () => {
    expect(getFeatureDef("monk-body-and-mind")?.legacyNames).toEqual(["Perfect Self"]);
  });
});

// ── collectActiveFeatures level gating ───────────────────────────────────────

describe("collectActiveFeatures — Monk level gating", () => {
  it("L1 includes martial-arts and unarmored-defense but NOT L2+ features", () => {
    const ids = collectActiveFeatures(makeMonk(1)).map((d) => d.id);
    expect(ids).toContain("monk-martial-arts");
    expect(ids).toContain("monk-unarmored-defense");
    expect(ids).not.toContain("monk-ki-points");
    expect(ids).not.toContain("monk-unarmored-movement");
    expect(ids).not.toContain("monk-extra-attack");
  });

  it("L2 includes ki-points, unarmored-movement, and the three ki techniques", () => {
    const ids = collectActiveFeatures(makeMonk(2)).map((d) => d.id);
    expect(ids).toContain("monk-ki-points");
    expect(ids).toContain("monk-unarmored-movement");
    expect(ids).toContain("monk-flurry-of-blows");
    expect(ids).toContain("monk-patient-defense");
    expect(ids).toContain("monk-step-of-the-wind");
  });

  it("L5 includes extra-attack and stunning-strike but not L6+ features", () => {
    const ids = collectActiveFeatures(makeMonk(5)).map((d) => d.id);
    expect(ids).toContain("monk-extra-attack");
    expect(ids).toContain("monk-stunning-strike");
    expect(ids).toContain("monk-deflect-attacks");
    expect(ids).toContain("monk-slow-fall");
    expect(ids).not.toContain("monk-ki-empowered-strikes");
    expect(ids).not.toContain("monk-evasion");
  });

  it("L10 includes self-restoration, ki-empowered-strikes, evasion but not L11+ features", () => {
    const ids = collectActiveFeatures(makeMonk(10)).map((d) => d.id);
    expect(ids).toContain("monk-ki-empowered-strikes");
    expect(ids).toContain("monk-evasion");
    expect(ids).toContain("monk-stillness-of-mind");
    expect(ids).toContain("monk-acrobatic-movement");
    expect(ids).toContain("monk-self-restoration");
    expect(ids).not.toContain("monk-tongue-of-sun-and-moon");
    expect(ids).not.toContain("monk-deflect-energy");
  });

  it("L15 includes empty-body, perfect-focus, deflect-energy but not superior-defense", () => {
    const ids = collectActiveFeatures(makeMonk(15)).map((d) => d.id);
    expect(ids).toContain("monk-tongue-of-sun-and-moon");
    expect(ids).toContain("monk-deflect-energy");
    expect(ids).toContain("monk-disciplined-survivor");
    expect(ids).toContain("monk-empty-body");
    expect(ids).toContain("monk-perfect-focus");
    expect(ids).not.toContain("monk-superior-defense");
    expect(ids).not.toContain("monk-body-and-mind");
  });

  it("L20 includes all class features including superior-defense and body-and-mind", () => {
    const ids = collectActiveFeatures(makeMonk(20)).map((d) => d.id);
    expect(ids).toContain("monk-superior-defense");
    expect(ids).toContain("monk-body-and-mind");
  });
});

// ── Effects ───────────────────────────────────────────────────────────────────

describe("Monk FeatureDef effects", () => {
  it("unarmored-defense has ac-base formula '10+dex+wis' with not_wearing any-armor", () => {
    const def = getFeatureDef("monk-unarmored-defense");
    expect(def?.effects).toContainEqual({
      kind: "ac-base",
      formula: "10+dex+wis",
      condition: { not_wearing: "any-armor" },
    });
  });

  it("martial-arts has scaling-stat 'martial-arts-die' with PHB24 die table", () => {
    const def = getFeatureDef("monk-martial-arts");
    expect(def?.effects).toContainEqual({
      kind: "scaling-stat",
      stat: "martial-arts-die",
      formula: {
        by: "class-level",
        classId: "ID_CLASS_MONK",
        table: { 1: "d6", 5: "d8", 11: "d10", 17: "d12" },
      },
    });
  });

  it("extra-attack has scaling-stat 'attacksPerAction' flat at 5:2", () => {
    const def = getFeatureDef("monk-extra-attack");
    expect(def?.effects).toContainEqual({
      kind: "scaling-stat",
      stat: "attacksPerAction",
      formula: { by: "class-level", classId: "ID_CLASS_MONK", table: { 5: 2 } },
    });
  });

  it("unarmored-movement has speed +10 with not_wearing any-armor", () => {
    const def = getFeatureDef("monk-unarmored-movement");
    expect(def?.effects).toContainEqual({
      kind: "speed",
      op: "add",
      value: 10,
      condition: { not_wearing: "any-armor" },
    });
  });

  it("body-and-mind has DEX +4 cap 25 and WIS +4 cap 25", () => {
    const def = getFeatureDef("monk-body-and-mind");
    expect(def?.effects).toContainEqual({ kind: "ability", ability: "dex", op: "add", value: 4, cap: 25 });
    expect(def?.effects).toContainEqual({ kind: "ability", ability: "wis", op: "add", value: 4, cap: 25 });
  });

  it("disciplined-survivor has save-prof: 'all'", () => {
    const def = getFeatureDef("monk-disciplined-survivor");
    expect(def?.effects).toContainEqual({ kind: "save-prof", saves: "all" });
  });
});

// ── spendsResource ────────────────────────────────────────────────────────────

describe("Monk spendsResource (chunk 9c)", () => {
  it("stunning-strike spends 1 ki_point", () => {
    const def = getFeatureDef("monk-stunning-strike");
    expect(def?.spendsResource).toEqual({ resourceId: "ki_points", amount: 1 });
  });

  it("flurry-of-blows spends 1 ki_point", () => {
    const def = getFeatureDef("monk-flurry-of-blows");
    expect(def?.spendsResource).toEqual({ resourceId: "ki_points", amount: 1 });
  });

  it("patient-defense spends 1 ki_point", () => {
    const def = getFeatureDef("monk-patient-defense");
    expect(def?.spendsResource).toEqual({ resourceId: "ki_points", amount: 1 });
  });

  it("step-of-the-wind spends 1 ki_point", () => {
    const def = getFeatureDef("monk-step-of-the-wind");
    expect(def?.spendsResource).toEqual({ resourceId: "ki_points", amount: 1 });
  });

  it("empty-body spends 4 ki_points", () => {
    const def = getFeatureDef("monk-empty-body");
    expect(def?.spendsResource).toEqual({ resourceId: "ki_points", amount: 4 });
  });

  it("superior-defense spends 3 ki_points", () => {
    const def = getFeatureDef("monk-superior-defense");
    expect(def?.spendsResource).toEqual({ resourceId: "ki_points", amount: 3 });
  });

  it("disciplined-survivor spends 1 ki_point (reroll)", () => {
    const def = getFeatureDef("monk-disciplined-survivor");
    expect(def?.spendsResource).toEqual({ resourceId: "ki_points", amount: 1 });
  });
});

// ── Parent/child grouping ──────────────────────────────────────────────────────

describe("Monk parentFeatureId (chunk 9c)", () => {
  it("deflect-energy is a child of deflect-attacks with augments: extend", () => {
    const def = getFeatureDef("monk-deflect-energy");
    expect(def?.parentFeatureId).toBe("monk-deflect-attacks");
    expect(def?.augments).toBe("extend");
  });
});
