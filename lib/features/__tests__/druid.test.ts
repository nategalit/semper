// Druid FeatureDef fill tests — chunk 9k.
// Covers: registry presence, collectActiveFeatures level gating,
// Primal Order mode choice, Elemental Fury mode + inheritedBy,
// Wild Companion spendsResource, Wild Shape Improvements,
// Archdruid three-way split, Improved Elemental Fury parent/child.

import { describe, it, expect } from "vitest";
import { collectActiveFeatures, getFeatureDef } from "..";
import type { Character } from "@/lib/types/character";

function makeDruid(level: number): Character {
  return {
    id: "test",
    userId: "user",
    name: "Test Druid",
    level,
    classId: "ID_CLASS_DRUID",
    raceId: "ID_RACE_HUMAN",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    data: {
      abilityScores: { str: 10, dex: 10, con: 12, int: 12, wis: 16, cha: 10 },
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

describe("Druid registry (chunk 9k)", () => {
  const IDS = [
    "druid-druidic",
    "druid-spellcasting",
    "druid-primal-order",
    "druid-wild-shape",
    "druid-wild-companion",
    "druid-wild-shape-improvement",
    "druid-elemental-fury",
    "druid-wild-shape-improvement-2",
    "druid-improved-elemental-fury",
    "druid-timeless-body",
    "druid-beast-spells",
    "druid-archdruid",
    "druid-archdruid-nature-magician",
    "druid-archdruid-longevity",
  ] as const;

  for (const id of IDS) {
    it(`registers ${id}`, () => {
      expect(getFeatureDef(id)).toBeDefined();
    });
  }
});

// ── legacyNames ───────────────────────────────────────────────────────────────

describe("Druid legacyNames (chunk 9k)", () => {
  it("wild-shape-improvement-2 has legacyNames: ['Wild Shape Improvement (2)']", () => {
    expect(getFeatureDef("druid-wild-shape-improvement-2")?.legacyNames).toEqual([
      "Wild Shape Improvement (2)",
    ]);
  });
});

// ── collectActiveFeatures level gating ───────────────────────────────────────

describe("collectActiveFeatures — Druid level gating", () => {
  it("L1 includes druidic, spellcasting, primal-order but NOT L2+ features", () => {
    const ids = collectActiveFeatures(makeDruid(1)).map((d) => d.id);
    expect(ids).toContain("druid-druidic");
    expect(ids).toContain("druid-spellcasting");
    expect(ids).toContain("druid-primal-order");
    expect(ids).not.toContain("druid-wild-shape");
    expect(ids).not.toContain("druid-wild-companion");
  });

  it("L2 includes wild-shape and wild-companion but NOT L4+", () => {
    const ids = collectActiveFeatures(makeDruid(2)).map((d) => d.id);
    expect(ids).toContain("druid-wild-shape");
    expect(ids).toContain("druid-wild-companion");
    expect(ids).not.toContain("druid-wild-shape-improvement");
    expect(ids).not.toContain("druid-elemental-fury");
  });

  it("L7 includes elemental-fury but NOT L8+", () => {
    const ids = collectActiveFeatures(makeDruid(7)).map((d) => d.id);
    expect(ids).toContain("druid-wild-shape-improvement");
    expect(ids).toContain("druid-elemental-fury");
    expect(ids).not.toContain("druid-wild-shape-improvement-2");
    expect(ids).not.toContain("druid-improved-elemental-fury");
  });

  it("L15 includes improved-elemental-fury but NOT L18+", () => {
    const ids = collectActiveFeatures(makeDruid(15)).map((d) => d.id);
    expect(ids).toContain("druid-wild-shape-improvement-2");
    expect(ids).toContain("druid-improved-elemental-fury");
    expect(ids).not.toContain("druid-timeless-body");
    expect(ids).not.toContain("druid-beast-spells");
  });

  it("L20 includes all three archdruid entries and L18 features", () => {
    const ids = collectActiveFeatures(makeDruid(20)).map((d) => d.id);
    expect(ids).toContain("druid-timeless-body");
    expect(ids).toContain("druid-beast-spells");
    expect(ids).toContain("druid-archdruid");
    expect(ids).toContain("druid-archdruid-nature-magician");
    expect(ids).toContain("druid-archdruid-longevity");
  });
});

// ── Primal Order mode choice ──────────────────────────────────────────────────

describe("Druid Primal Order choice (chunk 9k)", () => {
  it("has mode choice affects 'primal-order' with magician and warden options", () => {
    const def = getFeatureDef("druid-primal-order");
    const choice = def?.choices?.find((c) => c.kind === "mode" && c.affects === "primal-order");
    expect(choice).toBeDefined();
    if (choice?.kind !== "mode") return;
    const ids = choice.options.map((o) => o.id);
    expect(ids).toContain("magician");
    expect(ids).toContain("warden");
  });
});

// ── Elemental Fury mode choice + inheritedBy ──────────────────────────────────

describe("Druid Elemental Fury choice (chunk 9k)", () => {
  it("has mode choice affects 'elemental-fury' with both options", () => {
    const def = getFeatureDef("druid-elemental-fury");
    const choice = def?.choices?.find((c) => c.kind === "mode" && c.affects === "elemental-fury");
    expect(choice).toBeDefined();
    if (choice?.kind !== "mode") return;
    const ids = choice.options.map((o) => o.id);
    expect(ids).toContain("potent-spellcasting");
    expect(ids).toContain("primal-strike");
  });

  it("potent-spellcasting option has inheritedBy: ['druid-improved-elemental-fury']", () => {
    const def = getFeatureDef("druid-elemental-fury");
    const choice = def?.choices?.find((c) => c.kind === "mode" && c.affects === "elemental-fury");
    if (choice?.kind !== "mode") return;
    const opt = choice.options.find((o) => o.id === "potent-spellcasting");
    expect(opt?.inheritedBy).toEqual(["druid-improved-elemental-fury"]);
  });

  it("primal-strike option has inheritedBy: ['druid-improved-elemental-fury']", () => {
    const def = getFeatureDef("druid-elemental-fury");
    const choice = def?.choices?.find((c) => c.kind === "mode" && c.affects === "elemental-fury");
    if (choice?.kind !== "mode") return;
    const opt = choice.options.find((o) => o.id === "primal-strike");
    expect(opt?.inheritedBy).toEqual(["druid-improved-elemental-fury"]);
  });
});

// ── Wild Companion resource cost ──────────────────────────────────────────────

describe("Druid Wild Companion spendsResource (chunk 9k)", () => {
  it("spends 1 wild_shape charge", () => {
    const def = getFeatureDef("druid-wild-companion");
    expect(def?.spendsResource).toEqual({ resourceId: "wild_shape", amount: 1 });
  });
});

// ── Improved Elemental Fury parent/child ──────────────────────────────────────

describe("Druid parent/child feature relationships (chunk 9k)", () => {
  it("improved-elemental-fury is a child of elemental-fury with augments: extend", () => {
    const def = getFeatureDef("druid-improved-elemental-fury");
    expect(def?.parentFeatureId).toBe("druid-elemental-fury");
    expect(def?.augments).toBe("extend");
  });
});
