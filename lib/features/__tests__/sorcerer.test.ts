// Sorcerer FeatureDef fill tests — chunk 9g.
// Covers: registry presence, collectActiveFeatures level gating,
// all three Metamagic choice instances (L3/L10/L17), Innate Sorcery resource,
// Arcane Apotheosis parent/child, legacyNames (Font of Magic, Metamagic 2/3).

import { describe, it, expect } from "vitest";
import { collectActiveFeatures, getFeatureDef } from "..";
import type { Character } from "@/lib/types/character";

function makeSorcerer(level: number): Character {
  return {
    id: "test",
    userId: "user",
    name: "Test Sorcerer",
    level,
    classId: "ID_CLASS_SORCERER",
    raceId: "ID_RACE_HUMAN",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    data: {
      abilityScores: { str: 8, dex: 14, con: 14, int: 10, wis: 12, cha: 16 },
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

describe("Sorcerer registry (chunk 9g)", () => {
  const IDS = [
    "sorcerer-spellcasting",
    "sorcerer-innate-sorcery",
    "sorcerer-sorcery-points",
    "sorcerer-metamagic",
    "sorcerer-sorcery-incarnate",
    "sorcerer-metamagic-2",
    "sorcerer-sorcerous-restoration",
    "sorcerer-metamagic-3",
    "sorcerer-arcane-apotheosis",
    "sorcerer-sorcerous-renewal",
  ] as const;

  for (const id of IDS) {
    it(`registers ${id}`, () => {
      expect(getFeatureDef(id)).toBeDefined();
    });
  }
});

// ── legacyNames ───────────────────────────────────────────────────────────────

describe("Sorcerer legacyNames (chunk 9g)", () => {
  it("sorcery-points has legacyNames including 'Font of Magic'", () => {
    expect(getFeatureDef("sorcerer-sorcery-points")?.legacyNames).toContain("Font of Magic");
  });

  it("metamagic-2 has legacyNames: ['Metamagic (2)']", () => {
    expect(getFeatureDef("sorcerer-metamagic-2")?.legacyNames).toEqual(["Metamagic (2)"]);
  });

  it("metamagic-3 has legacyNames: ['Metamagic (3)']", () => {
    expect(getFeatureDef("sorcerer-metamagic-3")?.legacyNames).toEqual(["Metamagic (3)"]);
  });
});

// ── collectActiveFeatures level gating ───────────────────────────────────────

describe("collectActiveFeatures — Sorcerer level gating", () => {
  it("L1 includes spellcasting and innate-sorcery but NOT L2+ features", () => {
    const ids = collectActiveFeatures(makeSorcerer(1)).map((d) => d.id);
    expect(ids).toContain("sorcerer-spellcasting");
    expect(ids).toContain("sorcerer-innate-sorcery");
    expect(ids).not.toContain("sorcerer-sorcery-points");
    expect(ids).not.toContain("sorcerer-metamagic");
  });

  it("L3 includes metamagic but NOT L7+ features", () => {
    const ids = collectActiveFeatures(makeSorcerer(3)).map((d) => d.id);
    expect(ids).toContain("sorcerer-sorcery-points");
    expect(ids).toContain("sorcerer-metamagic");
    expect(ids).not.toContain("sorcerer-sorcery-incarnate");
    expect(ids).not.toContain("sorcerer-metamagic-2");
  });

  it("L10 includes metamagic-2 and sorcerous-restoration but NOT L17+ features", () => {
    const ids = collectActiveFeatures(makeSorcerer(10)).map((d) => d.id);
    expect(ids).toContain("sorcerer-sorcery-incarnate");
    expect(ids).toContain("sorcerer-metamagic-2");
    expect(ids).toContain("sorcerer-sorcerous-restoration");
    expect(ids).not.toContain("sorcerer-metamagic-3");
    expect(ids).not.toContain("sorcerer-arcane-apotheosis");
  });

  it("L17 includes metamagic-3 and arcane-apotheosis but NOT L20", () => {
    const ids = collectActiveFeatures(makeSorcerer(17)).map((d) => d.id);
    expect(ids).toContain("sorcerer-metamagic-3");
    expect(ids).toContain("sorcerer-arcane-apotheosis");
    expect(ids).not.toContain("sorcerer-sorcerous-renewal");
  });

  it("L20 includes sorcerous-renewal", () => {
    const ids = collectActiveFeatures(makeSorcerer(20)).map((d) => d.id);
    expect(ids).toContain("sorcerer-sorcerous-renewal");
  });
});

// ── Metamagic choices ─────────────────────────────────────────────────────────

describe("Sorcerer Metamagic choices (chunk 9g)", () => {
  it("metamagic L3 has feat choice with tag: 'metamagic', count: 2", () => {
    const def = getFeatureDef("sorcerer-metamagic");
    expect(def?.choices).toContainEqual({
      kind: "feat",
      from: { tag: "metamagic" },
      count: 2,
    });
  });

  it("metamagic-2 L10 has feat choice with tag: 'metamagic', count: 2", () => {
    const def = getFeatureDef("sorcerer-metamagic-2");
    expect(def?.choices).toContainEqual({
      kind: "feat",
      from: { tag: "metamagic" },
      count: 2,
    });
  });

  it("metamagic-3 L17 has feat choice with tag: 'metamagic', count: 2", () => {
    const def = getFeatureDef("sorcerer-metamagic-3");
    expect(def?.choices).toContainEqual({
      kind: "feat",
      from: { tag: "metamagic" },
      count: 2,
    });
  });
});

// ── Innate Sorcery resource ───────────────────────────────────────────────────

describe("Sorcerer Innate Sorcery resource (chunk 9g)", () => {
  it("innate-sorcery has charges: 2, long-rest recharge", () => {
    const def = getFeatureDef("sorcerer-innate-sorcery");
    expect(def?.resource).toMatchObject({
      id: "innate_sorcery",
      shape: { kind: "charges", max: 2 },
      recharge: { on: "long-rest" },
    });
  });
});

// ── parentFeatureId ───────────────────────────────────────────────────────────

describe("Sorcerer parentFeatureId (chunk 9g)", () => {
  it("arcane-apotheosis is a child of innate-sorcery with augments: extend", () => {
    const def = getFeatureDef("sorcerer-arcane-apotheosis");
    expect(def?.parentFeatureId).toBe("sorcerer-innate-sorcery");
    expect(def?.augments).toBe("extend");
  });
});
