// Paladin FeatureDef fill tests — chunk 9d.
// Covers: registry presence, collectActiveFeatures level gating,
// Extra Attack scaling-stat, Aura of Courage condition-immunity,
// spendsResource (Abjure Foes), parentFeatureId, legacyNames.

import { describe, it, expect } from "vitest";
import { collectActiveFeatures, getFeatureDef } from "..";
import type { Character } from "@/lib/types/character";

function makePaladin(level: number): Character {
  return {
    id: "test",
    userId: "user",
    name: "Test Paladin",
    level,
    classId: "ID_CLASS_PALADIN",
    raceId: "ID_RACE_HUMAN",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    data: {
      abilityScores: { str: 16, dex: 10, con: 14, int: 10, wis: 12, cha: 16 },
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

describe("Paladin registry (chunk 9d)", () => {
  const IDS = [
    "paladin-weapon-mastery",
    "paladin-divine-sense",
    "paladin-lay-on-hands",
    "paladin-fighting-style",
    "paladin-spellcasting",
    "paladin-channel-divinity",
    "paladin-divine-health",
    "paladin-extra-attack",
    "paladin-aura-of-protection",
    "paladin-abjure-foes",
    "paladin-aura-of-courage",
    "paladin-radiant-strikes",
    "paladin-cleansing-touch",
    "paladin-restoring-touch",
    "paladin-aura-expansion",
  ] as const;

  for (const id of IDS) {
    it(`registers ${id}`, () => {
      expect(getFeatureDef(id)).toBeDefined();
    });
  }
});

// ── legacyNames ───────────────────────────────────────────────────────────────

describe("Paladin legacyNames (chunk 9d)", () => {
  it("radiant-strikes has legacyNames: ['Improved Divine Smite']", () => {
    expect(getFeatureDef("paladin-radiant-strikes")?.legacyNames).toEqual(["Improved Divine Smite"]);
  });
});

// ── collectActiveFeatures level gating ───────────────────────────────────────

describe("collectActiveFeatures — Paladin level gating", () => {
  it("L1 includes weapon-mastery, divine-sense, lay-on-hands but NOT L2+ features", () => {
    const ids = collectActiveFeatures(makePaladin(1)).map((d) => d.id);
    expect(ids).toContain("paladin-weapon-mastery");
    expect(ids).toContain("paladin-divine-sense");
    expect(ids).toContain("paladin-lay-on-hands");
    expect(ids).not.toContain("paladin-fighting-style");
    expect(ids).not.toContain("paladin-spellcasting");
    expect(ids).not.toContain("paladin-channel-divinity");
  });

  it("L3 includes channel-divinity and divine-health but NOT L5+ features", () => {
    const ids = collectActiveFeatures(makePaladin(3)).map((d) => d.id);
    expect(ids).toContain("paladin-channel-divinity");
    expect(ids).toContain("paladin-divine-health");
    expect(ids).not.toContain("paladin-extra-attack");
    expect(ids).not.toContain("paladin-aura-of-protection");
  });

  it("L5 includes extra-attack but NOT L6+ features", () => {
    const ids = collectActiveFeatures(makePaladin(5)).map((d) => d.id);
    expect(ids).toContain("paladin-extra-attack");
    expect(ids).not.toContain("paladin-aura-of-protection");
    expect(ids).not.toContain("paladin-abjure-foes");
  });

  it("L9 includes abjure-foes but NOT L10+ features", () => {
    const ids = collectActiveFeatures(makePaladin(9)).map((d) => d.id);
    expect(ids).toContain("paladin-aura-of-protection");
    expect(ids).toContain("paladin-abjure-foes");
    expect(ids).not.toContain("paladin-aura-of-courage");
    expect(ids).not.toContain("paladin-radiant-strikes");
  });

  it("L11 includes aura-of-courage and radiant-strikes but NOT L14+ features", () => {
    const ids = collectActiveFeatures(makePaladin(11)).map((d) => d.id);
    expect(ids).toContain("paladin-aura-of-courage");
    expect(ids).toContain("paladin-radiant-strikes");
    expect(ids).not.toContain("paladin-cleansing-touch");
    expect(ids).not.toContain("paladin-restoring-touch");
  });

  it("L14 includes cleansing-touch and restoring-touch but NOT L18+ features", () => {
    const ids = collectActiveFeatures(makePaladin(14)).map((d) => d.id);
    expect(ids).toContain("paladin-cleansing-touch");
    expect(ids).toContain("paladin-restoring-touch");
    expect(ids).not.toContain("paladin-aura-expansion");
  });

  it("L18 includes aura-expansion", () => {
    const ids = collectActiveFeatures(makePaladin(18)).map((d) => d.id);
    expect(ids).toContain("paladin-aura-expansion");
  });
});

// ── Effects ───────────────────────────────────────────────────────────────────

describe("Paladin FeatureDef effects", () => {
  it("extra-attack has scaling-stat 'attacksPerAction' flat at 5:2", () => {
    const def = getFeatureDef("paladin-extra-attack");
    expect(def?.effects).toContainEqual({
      kind: "scaling-stat",
      stat: "attacksPerAction",
      formula: { by: "class-level", classId: "ID_CLASS_PALADIN", table: { 5: 2 } },
    });
  });

  it("aura-of-courage has condition-immunity: frightened whileAuraActive", () => {
    const def = getFeatureDef("paladin-aura-of-courage");
    expect(def?.effects).toContainEqual({
      kind: "condition-immunity",
      condition: "frightened",
      whileAuraActive: true,
    });
  });
});

// ── spendsResource ────────────────────────────────────────────────────────────

describe("Paladin spendsResource (chunk 9d)", () => {
  it("abjure-foes spends 1 channel_divinity", () => {
    expect(getFeatureDef("paladin-abjure-foes")?.spendsResource).toEqual({
      resourceId: "channel_divinity",
      amount: 1,
    });
  });
});

// ── parentFeatureId ───────────────────────────────────────────────────────────

describe("Paladin parentFeatureId (chunk 9d)", () => {
  it("aura-expansion is a child of aura-of-protection with augments: extend", () => {
    const def = getFeatureDef("paladin-aura-expansion");
    expect(def?.parentFeatureId).toBe("paladin-aura-of-protection");
    expect(def?.augments).toBe("extend");
  });

  it("restoring-touch is a child of lay-on-hands with augments: extend", () => {
    const def = getFeatureDef("paladin-restoring-touch");
    expect(def?.parentFeatureId).toBe("paladin-lay-on-hands");
    expect(def?.augments).toBe("extend");
  });
});

// ── Weapon Mastery choice ─────────────────────────────────────────────────────

describe("Paladin weapon-mastery choice (chunk 9d)", () => {
  it("weapon-mastery choice has count=2, pool='any', rePickOn='long-rest'", () => {
    const def = getFeatureDef("paladin-weapon-mastery");
    expect(def?.choices).toContainEqual({
      kind: "weapon-mastery",
      count: 2,
      pool: "any",
      rePickOn: "long-rest",
    });
  });
});
