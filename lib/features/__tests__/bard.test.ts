// Bard FeatureDef fill tests — chunk 9i.
// Covers: registry presence, collectActiveFeatures level gating,
// both Expertise choice instances (L2/L9), Jack of All Trades effect ("all"),
// Song of Rest scaling-stat, Bardic Inspiration recharge regression check.

import { describe, it, expect } from "vitest";
import { collectActiveFeatures, getFeatureDef } from "..";
import type { Character } from "@/lib/types/character";

function makeBard(level: number): Character {
  return {
    id: "test",
    userId: "user",
    name: "Test Bard",
    level,
    classId: "ID_CLASS_BARD",
    raceId: "ID_RACE_HUMAN",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    data: {
      abilityScores: { str: 10, dex: 14, con: 12, int: 12, wis: 10, cha: 16 },
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

describe("Bard registry (chunk 9i)", () => {
  const IDS = [
    "bard-spellcasting",
    "bard-bardic-inspiration",
    "bard-expertise",
    "bard-jack-of-all-trades",
    "bard-song-of-rest",
    "bard-font-of-inspiration",
    "bard-countercharm",
    "bard-expertise-2",
    "bard-magical-secrets",
    "bard-magical-secrets-2",
    "bard-magical-secrets-3",
    "bard-superior-inspiration",
    "bard-words-of-creation",
  ] as const;

  for (const id of IDS) {
    it(`registers ${id}`, () => {
      expect(getFeatureDef(id)).toBeDefined();
    });
  }
});

// ── legacyNames ───────────────────────────────────────────────────────────────

describe("Bard legacyNames (chunk 9i)", () => {
  it("expertise-2 has legacyNames: ['Expertise (2)']", () => {
    expect(getFeatureDef("bard-expertise-2")?.legacyNames).toEqual(["Expertise (2)"]);
  });

  it("song-of-rest covers d8/d10/d12 upgrade markers in legacyNames", () => {
    const names = getFeatureDef("bard-song-of-rest")?.legacyNames ?? [];
    expect(names).toContain("Song of Rest (d8)");
    expect(names).toContain("Song of Rest (d10)");
    expect(names).toContain("Song of Rest (d12)");
  });

  it("magical-secrets-2 has legacyNames: ['Magical Secrets (2)']", () => {
    expect(getFeatureDef("bard-magical-secrets-2")?.legacyNames).toEqual(["Magical Secrets (2)"]);
  });
});

// ── collectActiveFeatures level gating ───────────────────────────────────────

describe("collectActiveFeatures — Bard level gating", () => {
  it("L1 includes spellcasting and bardic-inspiration but NOT L2+ features", () => {
    const ids = collectActiveFeatures(makeBard(1)).map((d) => d.id);
    expect(ids).toContain("bard-spellcasting");
    expect(ids).toContain("bard-bardic-inspiration");
    expect(ids).not.toContain("bard-expertise");
    expect(ids).not.toContain("bard-jack-of-all-trades");
  });

  it("L2 includes expertise, jack-of-all-trades, song-of-rest but NOT L5+", () => {
    const ids = collectActiveFeatures(makeBard(2)).map((d) => d.id);
    expect(ids).toContain("bard-expertise");
    expect(ids).toContain("bard-jack-of-all-trades");
    expect(ids).toContain("bard-song-of-rest");
    expect(ids).not.toContain("bard-font-of-inspiration");
    expect(ids).not.toContain("bard-countercharm");
  });

  it("L5 includes font-of-inspiration but NOT L6+", () => {
    const ids = collectActiveFeatures(makeBard(5)).map((d) => d.id);
    expect(ids).toContain("bard-font-of-inspiration");
    expect(ids).not.toContain("bard-countercharm");
    expect(ids).not.toContain("bard-expertise-2");
  });

  it("L10 includes magical-secrets but NOT L9 expertise-2", () => {
    const ids = collectActiveFeatures(makeBard(10)).map((d) => d.id);
    expect(ids).toContain("bard-countercharm");
    expect(ids).toContain("bard-expertise-2");
    expect(ids).toContain("bard-magical-secrets");
    expect(ids).not.toContain("bard-magical-secrets-2");
  });

  it("L20 includes superior-inspiration and words-of-creation", () => {
    const ids = collectActiveFeatures(makeBard(20)).map((d) => d.id);
    expect(ids).toContain("bard-magical-secrets-2");
    expect(ids).toContain("bard-magical-secrets-3");
    expect(ids).toContain("bard-superior-inspiration");
    expect(ids).toContain("bard-words-of-creation");
  });
});

// ── Effects ───────────────────────────────────────────────────────────────────

describe("Bard FeatureDef effects", () => {
  it("jack-of-all-trades has half-prof-on-checks: abilities: 'all'", () => {
    const def = getFeatureDef("bard-jack-of-all-trades");
    expect(def?.effects).toContainEqual({ kind: "half-prof-on-checks", abilities: "all" });
  });

  it("song-of-rest has scaling-stat 'song-of-rest-die' with d6→d12 table", () => {
    const def = getFeatureDef("bard-song-of-rest");
    expect(def?.effects).toContainEqual({
      kind: "scaling-stat",
      stat: "song-of-rest-die",
      formula: {
        by: "class-level",
        classId: "ID_CLASS_BARD",
        table: { 2: "d6", 9: "d8", 13: "d10", 17: "d12" },
      },
    });
  });
});

// ── Expertise choices ─────────────────────────────────────────────────────────

describe("Bard Expertise choices (chunk 9i)", () => {
  it("expertise L2 has skill choice count=2 grants expertise", () => {
    const def = getFeatureDef("bard-expertise");
    expect(def?.choices).toContainEqual({
      kind: "skill",
      from: { source: "any-proficient" },
      count: 2,
      grants: "expertise",
    });
  });

  it("expertise-2 L9 has skill choice count=2 grants expertise", () => {
    const def = getFeatureDef("bard-expertise-2");
    expect(def?.choices).toContainEqual({
      kind: "skill",
      from: { source: "any-proficient" },
      count: 2,
      grants: "expertise",
    });
  });
});

// ── Bardic Inspiration regression check ──────────────────────────────────────

describe("Bardic Inspiration resource regression (chunk 9i)", () => {
  it("recharge is still switchesTo short-rest at level 5", () => {
    const def = getFeatureDef("bard-bardic-inspiration");
    expect(def?.resource?.recharge).toEqual({
      on: "long-rest",
      switchesTo: "short-rest",
      atLevel: 5,
    });
  });

  it("shape is still ability-mod CHA min 1", () => {
    const def = getFeatureDef("bard-bardic-inspiration");
    expect(def?.resource?.shape).toEqual({
      kind: "charges",
      max: { from: "ability-mod", ability: "cha", min: 1 },
    });
  });
});
