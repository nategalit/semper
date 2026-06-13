// Rogue FeatureDef fill tests — chunk 9f.
// Covers: registry presence, collectActiveFeatures level gating,
// Sneak Attack scaling-stat die table, Blindsense sense effect,
// Slippery Mind save-prof, Expertise choices (L1 and L6),
// parentFeatureId (Cunning Strike children), Stroke of Luck resource.

import { describe, it, expect } from "vitest";
import { collectActiveFeatures, getFeatureDef } from "..";
import type { Character } from "@/lib/types/character";

function makeRogue(level: number): Character {
  return {
    id: "test",
    userId: "user",
    name: "Test Rogue",
    level,
    classId: "ID_CLASS_ROGUE",
    raceId: "ID_RACE_HUMAN",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    data: {
      abilityScores: { str: 10, dex: 16, con: 12, int: 14, wis: 12, cha: 10 },
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

describe("Rogue registry (chunk 9f)", () => {
  const IDS = [
    "rogue-expertise",
    "rogue-sneak-attack",
    "rogue-thieves-cant",
    "rogue-weapon-mastery",
    "rogue-cunning-action",
    "rogue-steady-aim",
    "rogue-uncanny-dodge",
    "rogue-cunning-strike",
    "rogue-expertise-2",
    "rogue-evasion",
    "rogue-reliable-talent",
    "rogue-improved-cunning-strike",
    "rogue-blindsense",
    "rogue-devious-strikes",
    "rogue-slippery-mind",
    "rogue-elusive",
    "rogue-stroke-of-luck",
  ] as const;

  for (const id of IDS) {
    it(`registers ${id}`, () => {
      expect(getFeatureDef(id)).toBeDefined();
    });
  }
});

// ── legacyNames ───────────────────────────────────────────────────────────────

describe("Rogue legacyNames (chunk 9f)", () => {
  it("expertise-2 has legacyNames: ['Expertise (2)']", () => {
    expect(getFeatureDef("rogue-expertise-2")?.legacyNames).toEqual(["Expertise (2)"]);
  });
});

// ── collectActiveFeatures level gating ───────────────────────────────────────

describe("collectActiveFeatures — Rogue level gating", () => {
  it("L1 includes expertise, sneak-attack, thieves-cant, weapon-mastery but NOT L2+", () => {
    const ids = collectActiveFeatures(makeRogue(1)).map((d) => d.id);
    expect(ids).toContain("rogue-expertise");
    expect(ids).toContain("rogue-sneak-attack");
    expect(ids).toContain("rogue-thieves-cant");
    expect(ids).toContain("rogue-weapon-mastery");
    expect(ids).not.toContain("rogue-cunning-action");
    expect(ids).not.toContain("rogue-steady-aim");
    expect(ids).not.toContain("rogue-uncanny-dodge");
  });

  it("L5 includes uncanny-dodge and cunning-strike but NOT L6+", () => {
    const ids = collectActiveFeatures(makeRogue(5)).map((d) => d.id);
    expect(ids).toContain("rogue-uncanny-dodge");
    expect(ids).toContain("rogue-cunning-strike");
    expect(ids).not.toContain("rogue-expertise-2");
    expect(ids).not.toContain("rogue-evasion");
  });

  it("L7 includes evasion and expertise-2 but NOT L11+", () => {
    const ids = collectActiveFeatures(makeRogue(7)).map((d) => d.id);
    expect(ids).toContain("rogue-evasion");
    expect(ids).toContain("rogue-expertise-2");
    expect(ids).not.toContain("rogue-reliable-talent");
    expect(ids).not.toContain("rogue-improved-cunning-strike");
  });

  it("L14 includes blindsense and devious-strikes but NOT L15+", () => {
    const ids = collectActiveFeatures(makeRogue(14)).map((d) => d.id);
    expect(ids).toContain("rogue-blindsense");
    expect(ids).toContain("rogue-devious-strikes");
    expect(ids).not.toContain("rogue-slippery-mind");
    expect(ids).not.toContain("rogue-elusive");
  });

  it("L20 includes stroke-of-luck and elusive", () => {
    const ids = collectActiveFeatures(makeRogue(20)).map((d) => d.id);
    expect(ids).toContain("rogue-stroke-of-luck");
    expect(ids).toContain("rogue-elusive");
  });
});

// ── Effects ───────────────────────────────────────────────────────────────────

describe("Rogue FeatureDef effects", () => {
  it("sneak-attack has scaling-stat 'sneak-attack-die' with full 1d6-10d6 table", () => {
    const def = getFeatureDef("rogue-sneak-attack");
    expect(def?.effects).toContainEqual({
      kind: "scaling-stat",
      stat: "sneak-attack-die",
      formula: {
        by: "class-level",
        classId: "ID_CLASS_ROGUE",
        table: { 1: "1d6", 3: "2d6", 5: "3d6", 7: "4d6", 9: "5d6", 11: "6d6", 13: "7d6", 15: "8d6", 17: "9d6", 19: "10d6" },
      },
    });
  });

  it("blindsense has sense: 'blindsense', range: 10", () => {
    const def = getFeatureDef("rogue-blindsense");
    expect(def?.effects).toContainEqual({ kind: "sense", sense: "blindsense", range: 10 });
  });

  it("slippery-mind has save-prof: ['wis', 'cha'] (PHB24)", () => {
    const def = getFeatureDef("rogue-slippery-mind");
    expect(def?.effects).toContainEqual({ kind: "save-prof", saves: ["wis", "cha"] });
  });
});

// ── Choices ───────────────────────────────────────────────────────────────────

describe("Rogue choices (chunk 9f)", () => {
  it("expertise L1 has skill choice count=2 grants expertise", () => {
    const def = getFeatureDef("rogue-expertise");
    expect(def?.choices).toContainEqual({
      kind: "skill",
      from: { source: "any-proficient" },
      count: 2,
      grants: "expertise",
    });
  });

  it("expertise-2 L6 has skill choice count=2 grants expertise", () => {
    const def = getFeatureDef("rogue-expertise-2");
    expect(def?.choices).toContainEqual({
      kind: "skill",
      from: { source: "any-proficient" },
      count: 2,
      grants: "expertise",
    });
  });

  it("thieves-cant has language choice count=1", () => {
    const def = getFeatureDef("rogue-thieves-cant");
    expect(def?.choices).toContainEqual({
      kind: "language",
      from: { source: "any-standard" },
      count: 1,
    });
  });

  it("weapon-mastery has count=2, pool='any', rePickOn='long-rest'", () => {
    const def = getFeatureDef("rogue-weapon-mastery");
    expect(def?.choices).toContainEqual({
      kind: "weapon-mastery",
      count: 2,
      pool: "any",
      rePickOn: "long-rest",
    });
  });
});

// ── parentFeatureId (Cunning Strike family) ───────────────────────────────────

describe("Rogue Cunning Strike children (chunk 9f)", () => {
  it("improved-cunning-strike is a child of cunning-strike with augments: extend", () => {
    const def = getFeatureDef("rogue-improved-cunning-strike");
    expect(def?.parentFeatureId).toBe("rogue-cunning-strike");
    expect(def?.augments).toBe("extend");
  });

  it("devious-strikes is a child of cunning-strike with augments: extend", () => {
    const def = getFeatureDef("rogue-devious-strikes");
    expect(def?.parentFeatureId).toBe("rogue-cunning-strike");
    expect(def?.augments).toBe("extend");
  });
});

// ── Stroke of Luck resource ───────────────────────────────────────────────────

describe("Rogue Stroke of Luck resource (chunk 9f)", () => {
  it("stroke-of-luck has charges: 1, short-rest recharge", () => {
    const def = getFeatureDef("rogue-stroke-of-luck");
    expect(def?.resource).toMatchObject({
      id: "stroke_of_luck",
      shape: { kind: "charges", max: 1 },
      recharge: { on: "short-rest" },
    });
  });
});
