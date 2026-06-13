// Wizard FeatureDef fill tests — chunk 9h.
// Covers: registry presence, collectActiveFeatures level gating,
// Scholar choice (skill expertise from wizard-scholar-list),
// Arcane Recovery resource, level gating for all prose-only defs.

import { describe, it, expect } from "vitest";
import { collectActiveFeatures, getFeatureDef } from "..";
import type { Character } from "@/lib/types/character";

function makeWizard(level: number): Character {
  return {
    id: "test",
    userId: "user",
    name: "Test Wizard",
    level,
    classId: "ID_CLASS_WIZARD",
    raceId: "ID_RACE_HUMAN",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    data: {
      abilityScores: { str: 8, dex: 14, con: 12, int: 16, wis: 12, cha: 10 },
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

describe("Wizard registry (chunk 9h)", () => {
  const IDS = [
    "wizard-spellcasting",
    "wizard-ritual-adept",
    "wizard-arcane-recovery",
    "wizard-scholar",
    "wizard-memorize-spell",
    "wizard-spell-mastery",
    "wizard-signature-spells",
  ] as const;

  for (const id of IDS) {
    it(`registers ${id}`, () => {
      expect(getFeatureDef(id)).toBeDefined();
    });
  }
});

// ── collectActiveFeatures level gating ───────────────────────────────────────

describe("collectActiveFeatures — Wizard level gating", () => {
  it("L1 includes spellcasting, ritual-adept, arcane-recovery but NOT L2+ features", () => {
    const ids = collectActiveFeatures(makeWizard(1)).map((d) => d.id);
    expect(ids).toContain("wizard-spellcasting");
    expect(ids).toContain("wizard-ritual-adept");
    expect(ids).toContain("wizard-arcane-recovery");
    expect(ids).not.toContain("wizard-scholar");
    expect(ids).not.toContain("wizard-memorize-spell");
  });

  it("L2 includes scholar but NOT L5+ features", () => {
    const ids = collectActiveFeatures(makeWizard(2)).map((d) => d.id);
    expect(ids).toContain("wizard-scholar");
    expect(ids).not.toContain("wizard-memorize-spell");
    expect(ids).not.toContain("wizard-spell-mastery");
  });

  it("L5 includes memorize-spell but NOT L18+ features", () => {
    const ids = collectActiveFeatures(makeWizard(5)).map((d) => d.id);
    expect(ids).toContain("wizard-memorize-spell");
    expect(ids).not.toContain("wizard-spell-mastery");
    expect(ids).not.toContain("wizard-signature-spells");
  });

  it("L20 includes spell-mastery and signature-spells", () => {
    const ids = collectActiveFeatures(makeWizard(20)).map((d) => d.id);
    expect(ids).toContain("wizard-spell-mastery");
    expect(ids).toContain("wizard-signature-spells");
  });
});

// ── Scholar choice ─────────────────────────────────────────────────────────────

describe("Wizard Scholar choice (chunk 9h)", () => {
  it("scholar has skill choice count=1 from wizard-scholar-list with expertise", () => {
    const def = getFeatureDef("wizard-scholar");
    expect(def?.choices).toContainEqual({
      kind: "skill",
      from: { source: "wizard-scholar-list" },
      count: 1,
      grants: "expertise",
    });
  });
});

// ── Arcane Recovery resource ───────────────────────────────────────────────────

describe("Wizard Arcane Recovery resource (chunk 9h)", () => {
  it("arcane-recovery has charges: 1, long-rest recharge", () => {
    const def = getFeatureDef("wizard-arcane-recovery");
    expect(def?.resource).toMatchObject({
      id: "arcane_recovery",
      shape: { kind: "charges", max: 1 },
      recharge: { on: "long-rest" },
    });
  });
});
