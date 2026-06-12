// Barbarian FeatureDef fill tests — chunk 9a.
// Covers: registry presence, collectActiveFeatures level gating,
// effects on Fast Movement and Primal Champion, choices on Weapon Mastery
// and Primal Knowledge.

import { describe, it, expect } from "vitest";
import { collectActiveFeatures, getFeatureDef } from "..";
import type { Character } from "@/lib/types/character";

function makeBarb(level: number): Character {
  return {
    id: "test",
    userId: "user",
    name: "Test Barbarian",
    level,
    classId: "ID_CLASS_BARBARIAN",
    raceId: "ID_RACE_HUMAN",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    data: {
      abilityScores: { str: 16, dex: 14, con: 16, int: 10, wis: 10, cha: 10 },
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

describe("Barbarian registry (chunk 9a)", () => {
  const IDS = [
    "barbarian-rage",
    "barbarian-unarmored-defense",
    "barbarian-weapon-mastery",
    "barbarian-danger-sense",
    "barbarian-reckless-attack",
    "barbarian-primal-knowledge",
    "barbarian-extra-attack",
    "barbarian-fast-movement",
    "barbarian-feral-instinct",
    "barbarian-instinctive-pounce",
    "barbarian-brutal-strike",
    "barbarian-relentless-rage",
    "barbarian-improved-brutal-strike",
    "barbarian-persistent-rage",
    "barbarian-improved-brutal-strike-l17",
    "barbarian-indomitable-might",
    "barbarian-primal-champion",
  ] as const;

  for (const id of IDS) {
    it(`registers ${id}`, () => {
      expect(getFeatureDef(id)).toBeDefined();
    });
  }

  it("brutal-strike has legacyNames: ['Brutal Critical']", () => {
    expect(getFeatureDef("barbarian-brutal-strike")?.legacyNames).toEqual(["Brutal Critical"]);
  });

  it("improved-brutal-strike has legacyNames: ['Brutal Critical (2)']", () => {
    expect(getFeatureDef("barbarian-improved-brutal-strike")?.legacyNames).toEqual(["Brutal Critical (2)"]);
  });

  it("improved-brutal-strike-l17 has legacyNames: ['Brutal Critical (3)']", () => {
    expect(getFeatureDef("barbarian-improved-brutal-strike-l17")?.legacyNames).toEqual(["Brutal Critical (3)"]);
  });
});

// ── collectActiveFeatures level gating ───────────────────────────────────────

describe("collectActiveFeatures — Barbarian level gating", () => {
  it("L1 includes rage, unarmored-defense, weapon-mastery", () => {
    const ids = collectActiveFeatures(makeBarb(1)).map((d) => d.id);
    expect(ids).toContain("barbarian-rage");
    expect(ids).toContain("barbarian-unarmored-defense");
    expect(ids).toContain("barbarian-weapon-mastery");
  });

  it("L1 does NOT include L2+ features", () => {
    const ids = collectActiveFeatures(makeBarb(1)).map((d) => d.id);
    expect(ids).not.toContain("barbarian-danger-sense");
    expect(ids).not.toContain("barbarian-extra-attack");
    expect(ids).not.toContain("barbarian-brutal-strike");
  });

  it("L5 includes all L1-L5 class features", () => {
    const ids = collectActiveFeatures(makeBarb(5)).map((d) => d.id);
    expect(ids).toContain("barbarian-rage");
    expect(ids).toContain("barbarian-unarmored-defense");
    expect(ids).toContain("barbarian-danger-sense");
    expect(ids).toContain("barbarian-reckless-attack");
    expect(ids).toContain("barbarian-extra-attack");
    expect(ids).toContain("barbarian-fast-movement");
  });

  it("L5 does NOT include L7+ features", () => {
    const ids = collectActiveFeatures(makeBarb(5)).map((d) => d.id);
    expect(ids).not.toContain("barbarian-feral-instinct");
    expect(ids).not.toContain("barbarian-brutal-strike");
  });

  it("L11 includes relentless-rage and brutal-strike but not L13+ features", () => {
    const ids = collectActiveFeatures(makeBarb(11)).map((d) => d.id);
    expect(ids).toContain("barbarian-relentless-rage");
    expect(ids).toContain("barbarian-brutal-strike");
    expect(ids).not.toContain("barbarian-improved-brutal-strike");
    expect(ids).not.toContain("barbarian-persistent-rage");
  });

  it("L20 includes all class features including primal-champion", () => {
    const ids = collectActiveFeatures(makeBarb(20)).map((d) => d.id);
    expect(ids).toContain("barbarian-primal-champion");
    expect(ids).toContain("barbarian-persistent-rage");
    expect(ids).toContain("barbarian-improved-brutal-strike-l17");
    expect(ids).toContain("barbarian-indomitable-might");
  });
});

// ── Effects ───────────────────────────────────────────────────────────────────

describe("Barbarian FeatureDef effects", () => {
  it("fast-movement has speed +10 with not_wearing heavy-armor condition", () => {
    const def = getFeatureDef("barbarian-fast-movement");
    expect(def?.effects).toContainEqual({
      kind: "speed",
      op: "add",
      value: 10,
      condition: { not_wearing: "heavy-armor" },
    });
  });

  it("unarmored-defense has ac-base formula 10+dex+con", () => {
    const def = getFeatureDef("barbarian-unarmored-defense");
    expect(def?.effects).toContainEqual({
      kind: "ac-base",
      formula: "10+dex+con",
      condition: { not_wearing: "any-armor" },
    });
  });

  it("feral-instinct has initiative-advantage effect", () => {
    const def = getFeatureDef("barbarian-feral-instinct");
    expect(def?.effects).toContainEqual({ kind: "initiative-advantage" });
  });

  it("primal-champion has +4 STR and +4 CON with cap 25", () => {
    const def = getFeatureDef("barbarian-primal-champion");
    expect(def?.effects).toContainEqual({ kind: "ability", ability: "str", op: "add", value: 4, cap: 25 });
    expect(def?.effects).toContainEqual({ kind: "ability", ability: "con", op: "add", value: 4, cap: 25 });
  });
});

// ── Choices ───────────────────────────────────────────────────────────────────

describe("Barbarian FeatureDef choices", () => {
  it("weapon-mastery has weapon-mastery choice (count 2, any, long-rest re-pick)", () => {
    const def = getFeatureDef("barbarian-weapon-mastery");
    expect(def?.choices).toContainEqual({
      kind: "weapon-mastery",
      count: 2,
      pool: "any",
      rePickOn: "long-rest",
    });
  });

  it("primal-knowledge has skill choice (count 1, barbarian-class-list, proficient)", () => {
    const def = getFeatureDef("barbarian-primal-knowledge");
    expect(def?.choices).toContainEqual({
      kind: "skill",
      from: { source: "barbarian-class-list" },
      count: 1,
      grants: "proficient",
    });
  });
});
