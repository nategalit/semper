// Ranger FeatureDef fill tests — chunk 9e.
// Covers: registry presence, collectActiveFeatures level gating,
// Extra Attack scaling-stat, Feral Senses sense effect, Roving speed effect,
// Deft Explorer / Expertise choices, Nature's Veil resource, legacyNames.

import { describe, it, expect } from "vitest";
import { collectActiveFeatures, getFeatureDef } from "..";
import type { Character } from "@/lib/types/character";

function makeRanger(level: number): Character {
  return {
    id: "test",
    userId: "user",
    name: "Test Ranger",
    level,
    classId: "ID_CLASS_RANGER",
    raceId: "ID_RACE_HUMAN",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    data: {
      abilityScores: { str: 12, dex: 16, con: 14, int: 10, wis: 14, cha: 10 },
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

describe("Ranger registry (chunk 9e)", () => {
  const IDS = [
    "ranger-favored-enemy",
    "ranger-weapon-mastery",
    "ranger-fighting-style",
    "ranger-spellcasting",
    "ranger-deft-explorer",
    "ranger-primeval-awareness",
    "ranger-extra-attack",
    "ranger-roving",
    "ranger-expertise",
    "ranger-tireless",
    "ranger-relentless-hunter",
    "ranger-natures-veil",
    "ranger-precise-hunter",
    "ranger-feral-senses",
    "ranger-foe-slayer",
  ] as const;

  for (const id of IDS) {
    it(`registers ${id}`, () => {
      expect(getFeatureDef(id)).toBeDefined();
    });
  }
});

// ── legacyNames ───────────────────────────────────────────────────────────────

describe("Ranger legacyNames (chunk 9e)", () => {
  it("deft-explorer has legacyNames: ['Natural Explorer']", () => {
    expect(getFeatureDef("ranger-deft-explorer")?.legacyNames).toEqual(["Natural Explorer"]);
  });
});

// ── collectActiveFeatures level gating ───────────────────────────────────────

describe("collectActiveFeatures — Ranger level gating", () => {
  it("L1 includes favored-enemy and weapon-mastery but NOT L2+ features", () => {
    const ids = collectActiveFeatures(makeRanger(1)).map((d) => d.id);
    expect(ids).toContain("ranger-favored-enemy");
    expect(ids).toContain("ranger-weapon-mastery");
    expect(ids).not.toContain("ranger-fighting-style");
    expect(ids).not.toContain("ranger-deft-explorer");
    expect(ids).not.toContain("ranger-extra-attack");
  });

  it("L2 includes fighting-style, spellcasting, deft-explorer but NOT L3+ features", () => {
    const ids = collectActiveFeatures(makeRanger(2)).map((d) => d.id);
    expect(ids).toContain("ranger-fighting-style");
    expect(ids).toContain("ranger-spellcasting");
    expect(ids).toContain("ranger-deft-explorer");
    expect(ids).not.toContain("ranger-primeval-awareness");
    expect(ids).not.toContain("ranger-extra-attack");
  });

  it("L5 includes extra-attack but NOT L6+ features", () => {
    const ids = collectActiveFeatures(makeRanger(5)).map((d) => d.id);
    expect(ids).toContain("ranger-primeval-awareness");
    expect(ids).toContain("ranger-extra-attack");
    expect(ids).not.toContain("ranger-roving");
    expect(ids).not.toContain("ranger-expertise");
  });

  it("L6 includes roving but NOT L9+ features", () => {
    const ids = collectActiveFeatures(makeRanger(6)).map((d) => d.id);
    expect(ids).toContain("ranger-roving");
    expect(ids).not.toContain("ranger-expertise");
    expect(ids).not.toContain("ranger-tireless");
  });

  it("L9 includes expertise but NOT L10+ features", () => {
    const ids = collectActiveFeatures(makeRanger(9)).map((d) => d.id);
    expect(ids).toContain("ranger-expertise");
    expect(ids).not.toContain("ranger-tireless");
    expect(ids).not.toContain("ranger-relentless-hunter");
  });

  it("L18 includes feral-senses but NOT L20", () => {
    const ids = collectActiveFeatures(makeRanger(18)).map((d) => d.id);
    expect(ids).toContain("ranger-feral-senses");
    expect(ids).toContain("ranger-natures-veil");
    expect(ids).toContain("ranger-precise-hunter");
    expect(ids).not.toContain("ranger-foe-slayer");
  });

  it("L20 includes foe-slayer", () => {
    const ids = collectActiveFeatures(makeRanger(20)).map((d) => d.id);
    expect(ids).toContain("ranger-foe-slayer");
  });
});

// ── Effects ───────────────────────────────────────────────────────────────────

describe("Ranger FeatureDef effects", () => {
  it("extra-attack has scaling-stat 'attacksPerAction' flat at 5:2", () => {
    const def = getFeatureDef("ranger-extra-attack");
    expect(def?.effects).toContainEqual({
      kind: "scaling-stat",
      stat: "attacksPerAction",
      formula: { by: "class-level", classId: "ID_CLASS_RANGER", table: { 5: 2 } },
    });
  });

  it("feral-senses has sense: blindsight, range: 30", () => {
    const def = getFeatureDef("ranger-feral-senses");
    expect(def?.effects).toContainEqual({ kind: "sense", sense: "blindsight", range: 30 });
  });

  it("roving has speed +10 with not_wearing heavy-armor condition", () => {
    const def = getFeatureDef("ranger-roving");
    expect(def?.effects).toContainEqual({
      kind: "speed",
      op: "add",
      value: 10,
      condition: { not_wearing: "heavy-armor" },
    });
  });
});

// ── Choices ───────────────────────────────────────────────────────────────────

describe("Ranger choices (chunk 9e)", () => {
  it("weapon-mastery has count=2, pool='any', rePickOn='long-rest'", () => {
    const def = getFeatureDef("ranger-weapon-mastery");
    expect(def?.choices).toContainEqual({
      kind: "weapon-mastery",
      count: 2,
      pool: "any",
      rePickOn: "long-rest",
    });
  });

  it("deft-explorer has skill expertise choice (count=1) and language choice (count=2)", () => {
    const def = getFeatureDef("ranger-deft-explorer");
    expect(def?.choices).toContainEqual({
      kind: "skill",
      from: { source: "any-proficient" },
      count: 1,
      grants: "expertise",
    });
    expect(def?.choices).toContainEqual({
      kind: "language",
      from: { source: "any-standard" },
      count: 2,
    });
  });

  it("expertise at L9 has skill choice count=2 grants expertise", () => {
    const def = getFeatureDef("ranger-expertise");
    expect(def?.choices).toContainEqual({
      kind: "skill",
      from: { source: "any-proficient" },
      count: 2,
      grants: "expertise",
    });
  });
});

// ── Nature's Veil resource ────────────────────────────────────────────────────

describe("Ranger Nature's Veil resource (chunk 9e)", () => {
  it("natures-veil has charges resource derived from wis ability-mod", () => {
    const def = getFeatureDef("ranger-natures-veil");
    expect(def?.resource).toMatchObject({
      id: "natures_veil",
      shape: { kind: "charges", max: { from: "ability-mod", ability: "wis", min: 1 } },
      recharge: { on: "long-rest" },
    });
  });
});
