import { describe, it, expect } from "vitest";
import {
  resolveDerivedCount,
  getResourceMax,
  getResourceState,
} from "@/lib/features/resources/derive";
import type { Character } from "@/lib/types/character";
import type { DerivedCount, FeatureResource } from "@/lib/features/types";

function makeCharacter(
  level: number,
  overrides: { cha?: number; str?: number; featureCharges?: Record<string, number> } = {}
): Character {
  return {
    id: "test",
    userId: "u",
    name: "Test",
    level,
    classId: "ID_CLASS_BARBARIAN",
    raceId: "ID_RACE_HUMAN",
    createdAt: "",
    updatedAt: "",
    data: {
      abilityScores: {
        str: overrides.str ?? 16,
        dex: 14, con: 16, int: 10, wis: 10,
        cha: overrides.cha ?? 10,
      },
      currentHp: 40, maxHp: 40, tempHp: 0,
      hitDiceTotal: level, hitDiceRemaining: level,
      deathSaves: { successes: 0, failures: 0 },
      inspiration: false, xp: 0,
      currency: { cp: 0, sp: 0, ep: 0, gp: 0, pp: 0 },
      ...(overrides.featureCharges ? { featureCharges: overrides.featureCharges } : {}),
    },
  };
}

const RAGE_RESOURCE: FeatureResource = {
  id: "rage",
  shape: { kind: "charges", max: { from: "class-table", classId: "barbarian", column: "rages" } },
  recharge: { on: "long-rest" },
  display: "pip",
};

// ── resolveDerivedCount ───────────────────────────────────────────────────────

describe("resolveDerivedCount — ability-mod", () => {
  it("returns STR mod for STR 16 (+3)", () => {
    const count: DerivedCount = { from: "ability-mod", ability: "str" };
    expect(resolveDerivedCount(count, makeCharacter(5))).toBe(3);
  });

  it("clamps to min when mod is below it", () => {
    // CHA 10 → mod 0; min: 1
    const count: DerivedCount = { from: "ability-mod", ability: "cha", min: 1 };
    expect(resolveDerivedCount(count, makeCharacter(5, { cha: 10 }))).toBe(1);
  });

  it("does not clamp when mod already meets min", () => {
    const count: DerivedCount = { from: "ability-mod", ability: "cha", min: 1 };
    expect(resolveDerivedCount(count, makeCharacter(5, { cha: 16 }))).toBe(3);
  });
});

describe("resolveDerivedCount — prof-bonus", () => {
  it("returns 3 at level 5", () => {
    const count: DerivedCount = { from: "prof-bonus" };
    expect(resolveDerivedCount(count, makeCharacter(5))).toBe(3);
  });

  it("returns 2 at level 1", () => {
    const count: DerivedCount = { from: "prof-bonus" };
    expect(resolveDerivedCount(count, makeCharacter(1))).toBe(2);
  });
});

describe("resolveDerivedCount — level", () => {
  it("returns level when no multiplier", () => {
    const count: DerivedCount = { from: "level", classId: "ID_CLASS_MONK" };
    expect(resolveDerivedCount(count, makeCharacter(5))).toBe(5);
  });

  it("multiplies by multiplier", () => {
    const count: DerivedCount = { from: "level", classId: "ID_CLASS_PALADIN", multiplier: 5 };
    expect(resolveDerivedCount(count, makeCharacter(4))).toBe(20);
  });
});

describe("resolveDerivedCount — level (Ki Points shape)", () => {
  // Ki Points: max = monk level. L1 is never reached via a live feature because
  // origin.level: 2 gates collectActiveFeatures before resolveDerivedCount is called.
  const count: DerivedCount = { from: "level", classId: "ID_CLASS_MONK" };

  it("L2 → 2", () => {
    expect(resolveDerivedCount(count, makeCharacter(2))).toBe(2);
  });

  it("L10 → 10", () => {
    expect(resolveDerivedCount(count, makeCharacter(10))).toBe(10);
  });

  it("L20 → 20", () => {
    expect(resolveDerivedCount(count, makeCharacter(20))).toBe(20);
  });
});

describe("resolveDerivedCount — class-table (Rage)", () => {
  const count: DerivedCount = { from: "class-table", classId: "barbarian", column: "rages" };

  it("L1 → 2 rages", () => {
    expect(resolveDerivedCount(count, makeCharacter(1))).toBe(2);
  });

  it("L3 → 3 rages", () => {
    expect(resolveDerivedCount(count, makeCharacter(3))).toBe(3);
  });

  it("L6 → 4 rages", () => {
    expect(resolveDerivedCount(count, makeCharacter(6))).toBe(4);
  });

  it("L12 → 5 rages", () => {
    expect(resolveDerivedCount(count, makeCharacter(12))).toBe(5);
  });

  it("L17 → 6 rages", () => {
    expect(resolveDerivedCount(count, makeCharacter(17))).toBe(6);
  });

  it("L20 → 6 rages (PHB24: no unlimited mechanic; Primal Champion gives STR/CON, not rages)", () => {
    expect(resolveDerivedCount(count, makeCharacter(20))).toBe(6);
  });

  it("returns 0 for unknown classId", () => {
    const bad: DerivedCount = { from: "class-table", classId: "paladin", column: "rages" };
    expect(resolveDerivedCount(bad, makeCharacter(5))).toBe(0);
  });

  it("returns 0 for unknown column", () => {
    const bad: DerivedCount = { from: "class-table", classId: "barbarian", column: "nonexistent" };
    expect(resolveDerivedCount(bad, makeCharacter(5))).toBe(0);
  });
});

describe("resolveDerivedCount — class-table (Action Surge, SRD/PHB 2014)", () => {
  const count: DerivedCount = { from: "class-table", classId: "fighter", column: "actionSurgeUses" };

  it("L2 → 1", () => {
    expect(resolveDerivedCount(count, makeCharacter(2))).toBe(1);
  });

  it("L16 → 1 (breakpoint is L17)", () => {
    expect(resolveDerivedCount(count, makeCharacter(16))).toBe(1);
  });

  it("L17 → 2", () => {
    expect(resolveDerivedCount(count, makeCharacter(17))).toBe(2);
  });
});

describe("resolveDerivedCount — class-table (Channel Divinity, SRD/PHB 2014)", () => {
  const count: DerivedCount = { from: "class-table", classId: "cleric", column: "channelDivinityUses" };

  it("L1 → 0 (feature not yet available)", () => {
    expect(resolveDerivedCount(count, makeCharacter(1))).toBe(0);
  });

  it("L2 → 1", () => {
    expect(resolveDerivedCount(count, makeCharacter(2))).toBe(1);
  });

  it("L5 → 1 (breakpoint is L6)", () => {
    expect(resolveDerivedCount(count, makeCharacter(5))).toBe(1);
  });

  it("L11 → 2", () => {
    expect(resolveDerivedCount(count, makeCharacter(11))).toBe(2);
  });

  it("L18 → 3", () => {
    expect(resolveDerivedCount(count, makeCharacter(18))).toBe(3);
  });
});

// ── getResourceMax ────────────────────────────────────────────────────────────

describe("getResourceMax", () => {
  it("charges — numeric max", () => {
    const r: FeatureResource = {
      id: "test", shape: { kind: "charges", max: 3 },
      recharge: { on: "long-rest" }, display: "pip",
    };
    expect(getResourceMax(r, makeCharacter(5))).toBe(3);
  });

  it("charges — class-table DerivedCount (Rage at L5 = 3)", () => {
    expect(getResourceMax(RAGE_RESOURCE, makeCharacter(5))).toBe(3);
  });

  it("pool — DerivedCount", () => {
    const r: FeatureResource = {
      id: "lay-on-hands",
      shape: { kind: "pool", max: { from: "level", classId: "ID_CLASS_PALADIN", multiplier: 5 } },
      recharge: { on: "long-rest" }, display: "number",
    };
    expect(getResourceMax(r, makeCharacter(4))).toBe(20);
  });

  it("points — numeric max", () => {
    const r: FeatureResource = {
      id: "ki", shape: { kind: "points", max: 5 },
      recharge: { on: "short-rest" }, display: "points",
    };
    expect(getResourceMax(r, makeCharacter(5))).toBe(5);
  });

  it("per-tier-one-shot — max = tiers.length", () => {
    const r: FeatureResource = {
      id: "arcanum",
      shape: { kind: "per-tier-one-shot", tiers: [6, 7, 8, 9] },
      recharge: { on: "long-rest" }, display: "per-tier-checkboxes",
    };
    expect(getResourceMax(r, makeCharacter(13))).toBe(4);
  });

  it("binary-token — max is always 1", () => {
    const r: FeatureResource = {
      id: "action-surge",
      shape: { kind: "binary-token" },
      recharge: { on: "short-rest" }, display: "binary-token",
    };
    expect(getResourceMax(r, makeCharacter(5))).toBe(1);
  });
});

// ── getResourceState ──────────────────────────────────────────────────────────

describe("getResourceState", () => {
  it("defaults current to max when featureCharges is absent", () => {
    const state = getResourceState(RAGE_RESOURCE, makeCharacter(3));
    expect(state).toEqual({ current: 3, max: 3 });
  });

  it("defaults current to max when key not in featureCharges", () => {
    const character = makeCharacter(6, { featureCharges: { bardic_inspiration: 2 } });
    const state = getResourceState(RAGE_RESOURCE, character);
    expect(state).toEqual({ current: 4, max: 4 });
  });

  it("uses stored value when present", () => {
    const character = makeCharacter(6, { featureCharges: { rage: 1 } });
    const state = getResourceState(RAGE_RESOURCE, character);
    expect(state).toEqual({ current: 1, max: 4 });
  });

  it("stored value of 0 is respected (not treated as falsy)", () => {
    const character = makeCharacter(3, { featureCharges: { rage: 0 } });
    const state = getResourceState(RAGE_RESOURCE, character);
    expect(state).toEqual({ current: 0, max: 3 });
  });
});
