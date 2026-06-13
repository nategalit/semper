// Cleric FeatureDef fill tests — chunk 9j.
// Covers: registry presence, collectActiveFeatures level gating,
// Channel Divinity legacyNames + resource, Destroy Undead scaling-stat,
// Blessed Strikes mode choice with inheritedBy, Divine Intervention resource,
// parent/child relationships for Improved Blessed Strikes and Divine Intervention improvement.

import { describe, it, expect } from "vitest";
import { collectActiveFeatures, getFeatureDef } from "..";
import type { Character } from "@/lib/types/character";

function makeCleric(level: number): Character {
  return {
    id: "test",
    userId: "user",
    name: "Test Cleric",
    level,
    classId: "ID_CLASS_CLERIC",
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

describe("Cleric registry (chunk 9j)", () => {
  const IDS = [
    "cleric-spellcasting",
    "cleric-divine-order",
    "cleric-channel-divinity",
    "cleric-destroy-undead",
    "cleric-blessed-strikes",
    "cleric-divine-intervention",
    "cleric-improved-blessed-strikes",
    "cleric-divine-intervention-improvement",
  ] as const;

  for (const id of IDS) {
    it(`registers ${id}`, () => {
      expect(getFeatureDef(id)).toBeDefined();
    });
  }
});

// ── legacyNames ───────────────────────────────────────────────────────────────

describe("Cleric legacyNames (chunk 9j)", () => {
  it("channel-divinity has legacyNames for L6 and L18 upgrade markers", () => {
    const names = getFeatureDef("cleric-channel-divinity")?.legacyNames ?? [];
    expect(names).toContain("Channel Divinity (2)");
    expect(names).toContain("Channel Divinity (3)");
  });

  it("destroy-undead has legacyNames for all four CR upgrade markers", () => {
    const names = getFeatureDef("cleric-destroy-undead")?.legacyNames ?? [];
    expect(names).toContain("Destroy Undead (CR 1)");
    expect(names).toContain("Destroy Undead (CR 2)");
    expect(names).toContain("Destroy Undead (CR 3)");
    expect(names).toContain("Destroy Undead (CR 4)");
  });
});

// ── collectActiveFeatures level gating ───────────────────────────────────────

describe("collectActiveFeatures — Cleric level gating", () => {
  it("L1 includes spellcasting and divine-order but NOT L2+ features", () => {
    const ids = collectActiveFeatures(makeCleric(1)).map((d) => d.id);
    expect(ids).toContain("cleric-spellcasting");
    expect(ids).toContain("cleric-divine-order");
    expect(ids).not.toContain("cleric-channel-divinity");
    expect(ids).not.toContain("cleric-destroy-undead");
  });

  it("L2 includes channel-divinity but NOT L5+", () => {
    const ids = collectActiveFeatures(makeCleric(2)).map((d) => d.id);
    expect(ids).toContain("cleric-channel-divinity");
    expect(ids).not.toContain("cleric-destroy-undead");
    expect(ids).not.toContain("cleric-blessed-strikes");
  });

  it("L5 includes destroy-undead but NOT L7+", () => {
    const ids = collectActiveFeatures(makeCleric(5)).map((d) => d.id);
    expect(ids).toContain("cleric-destroy-undead");
    expect(ids).not.toContain("cleric-blessed-strikes");
    expect(ids).not.toContain("cleric-divine-intervention");
  });

  it("L10 includes divine-intervention but NOT L14+", () => {
    const ids = collectActiveFeatures(makeCleric(10)).map((d) => d.id);
    expect(ids).toContain("cleric-blessed-strikes");
    expect(ids).toContain("cleric-divine-intervention");
    expect(ids).not.toContain("cleric-improved-blessed-strikes");
    expect(ids).not.toContain("cleric-divine-intervention-improvement");
  });

  it("L20 includes improved-blessed-strikes and divine-intervention-improvement", () => {
    const ids = collectActiveFeatures(makeCleric(20)).map((d) => d.id);
    expect(ids).toContain("cleric-improved-blessed-strikes");
    expect(ids).toContain("cleric-divine-intervention-improvement");
  });
});

// ── Effects ───────────────────────────────────────────────────────────────────

describe("Cleric FeatureDef effects", () => {
  it("destroy-undead has scaling-stat 'destroy-undead-cr' with CR table", () => {
    const def = getFeatureDef("cleric-destroy-undead");
    expect(def?.effects).toContainEqual({
      kind: "scaling-stat",
      stat: "destroy-undead-cr",
      formula: {
        by: "class-level",
        classId: "ID_CLASS_CLERIC",
        table: { 5: "1/2", 8: "1", 11: "2", 14: "3", 17: "4" },
      },
    });
  });
});

// ── Choices ───────────────────────────────────────────────────────────────────

describe("Cleric mode choices (chunk 9j)", () => {
  it("divine-order has mode choice affects 'divine-order' with protector and thaumaturge options", () => {
    const def = getFeatureDef("cleric-divine-order");
    const choice = def?.choices?.find((c) => c.kind === "mode" && c.affects === "divine-order");
    expect(choice).toBeDefined();
    if (choice?.kind !== "mode") return;
    const ids = choice.options.map((o) => o.id);
    expect(ids).toContain("protector");
    expect(ids).toContain("thaumaturge");
  });

  it("blessed-strikes has mode choice affects 'blessed-strikes' with divine-strike and potent-spellcasting", () => {
    const def = getFeatureDef("cleric-blessed-strikes");
    const choice = def?.choices?.find((c) => c.kind === "mode" && c.affects === "blessed-strikes");
    expect(choice).toBeDefined();
    if (choice?.kind !== "mode") return;
    const ids = choice.options.map((o) => o.id);
    expect(ids).toContain("divine-strike");
    expect(ids).toContain("potent-spellcasting");
  });

  it("divine-strike option has inheritedBy: ['cleric-improved-blessed-strikes']", () => {
    const def = getFeatureDef("cleric-blessed-strikes");
    const choice = def?.choices?.find((c) => c.kind === "mode" && c.affects === "blessed-strikes");
    if (choice?.kind !== "mode") return;
    const divineStrike = choice.options.find((o) => o.id === "divine-strike");
    expect(divineStrike?.inheritedBy).toEqual(["cleric-improved-blessed-strikes"]);
  });
});

// ── Resources ─────────────────────────────────────────────────────────────────

describe("Cleric resources (chunk 9j)", () => {
  it("channel-divinity resource uses class-table channelDivinityUses", () => {
    const def = getFeatureDef("cleric-channel-divinity");
    expect(def?.resource?.shape).toEqual({
      kind: "charges",
      max: { from: "class-table", classId: "cleric", column: "channelDivinityUses" },
    });
    expect(def?.resource?.recharge).toEqual({ on: "long-rest", partialOn: "short-rest", amount: 1 });
  });

  it("divine-intervention resource is charges max 1 long-rest", () => {
    const def = getFeatureDef("cleric-divine-intervention");
    expect(def?.resource?.shape).toEqual({ kind: "charges", max: 1 });
    expect(def?.resource?.recharge).toEqual({ on: "long-rest" });
  });
});

// ── Parent/child relationships ────────────────────────────────────────────────

describe("Cleric parent/child feature relationships (chunk 9j)", () => {
  it("improved-blessed-strikes is a child of blessed-strikes with augments: extend", () => {
    const def = getFeatureDef("cleric-improved-blessed-strikes");
    expect(def?.parentFeatureId).toBe("cleric-blessed-strikes");
    expect(def?.augments).toBe("extend");
  });

  it("divine-intervention-improvement is a child of divine-intervention with augments: extend", () => {
    const def = getFeatureDef("cleric-divine-intervention-improvement");
    expect(def?.parentFeatureId).toBe("cleric-divine-intervention");
    expect(def?.augments).toBe("extend");
  });
});
