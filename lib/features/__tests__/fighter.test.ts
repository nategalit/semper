// Fighter FeatureDef fill tests — chunk 9b.
// Covers: registry presence, collectActiveFeatures level gating,
// Indomitable resource shape, Extra Attack scaling-stat, Defense effect,
// legacyNames for cross-version renames.

import { describe, it, expect } from "vitest";
import { collectActiveFeatures, getFeatureDef } from "..";
import { CLASS_TABLE_COLUMNS } from "@/lib/content/srd/progression";
import type { Character } from "@/lib/types/character";

function makeFighter(level: number): Character {
  return {
    id: "test",
    userId: "user",
    name: "Test Fighter",
    level,
    classId: "ID_CLASS_FIGHTER",
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

describe("Fighter registry (chunk 9b)", () => {
  const FIGHTER_IDS = [
    "fighter-fighting-style",
    "fighter-action-surge",
    "fighter-second-wind",
    "fighter-weapon-mastery",
    "fighter-tactical-mind",
    "fighter-extra-attack",
    "fighter-indomitable",
    "fighter-tactical-shift",
    "fighter-two-extra-attacks",
    "fighter-indomitable-2",
    "fighter-indomitable-3",
    "fighter-three-extra-attacks",
  ] as const;

  for (const id of FIGHTER_IDS) {
    it(`registers ${id}`, () => {
      expect(getFeatureDef(id)).toBeDefined();
    });
  }

  const FIGHTING_STYLE_IDS = [
    "feat-fighting-style-archery",
    "feat-fighting-style-defense",
    "feat-fighting-style-dueling",
    "feat-fighting-style-great-weapon-fighting",
    "feat-fighting-style-protection",
    "feat-fighting-style-two-weapon-fighting",
  ] as const;

  for (const id of FIGHTING_STYLE_IDS) {
    it(`registers ${id}`, () => {
      expect(getFeatureDef(id)).toBeDefined();
    });
  }
});

// ── legacyNames ───────────────────────────────────────────────────────────────

describe("Fighter legacyNames (chunk 9b)", () => {
  it("action-surge has legacyNames: ['Action Surge (2)']", () => {
    expect(getFeatureDef("fighter-action-surge")?.legacyNames).toEqual(["Action Surge (2)"]);
  });

  it("two-extra-attacks has legacyNames: ['Extra Attack (2)']", () => {
    expect(getFeatureDef("fighter-two-extra-attacks")?.legacyNames).toEqual(["Extra Attack (2)"]);
  });

  it("three-extra-attacks has legacyNames: ['Extra Attack (3)']", () => {
    expect(getFeatureDef("fighter-three-extra-attacks")?.legacyNames).toEqual(["Extra Attack (3)"]);
  });

  it("indomitable-2 has legacyNames: ['Indomitable (2)']", () => {
    expect(getFeatureDef("fighter-indomitable-2")?.legacyNames).toEqual(["Indomitable (2)"]);
  });

  it("indomitable-3 has legacyNames: ['Indomitable (3)']", () => {
    expect(getFeatureDef("fighter-indomitable-3")?.legacyNames).toEqual(["Indomitable (3)"]);
  });
});

// ── collectActiveFeatures level gating ───────────────────────────────────────

describe("collectActiveFeatures — Fighter level gating", () => {
  it("L1 includes fighting-style, second-wind, weapon-mastery", () => {
    const ids = collectActiveFeatures(makeFighter(1)).map((d) => d.id);
    expect(ids).toContain("fighter-fighting-style");
    expect(ids).toContain("fighter-second-wind");
    expect(ids).toContain("fighter-weapon-mastery");
  });

  it("L1 does NOT include L2+ features", () => {
    const ids = collectActiveFeatures(makeFighter(1)).map((d) => d.id);
    expect(ids).not.toContain("fighter-action-surge");
    expect(ids).not.toContain("fighter-tactical-mind");
    expect(ids).not.toContain("fighter-extra-attack");
  });

  it("L5 includes action-surge, tactical-mind, extra-attack", () => {
    const ids = collectActiveFeatures(makeFighter(5)).map((d) => d.id);
    expect(ids).toContain("fighter-action-surge");
    expect(ids).toContain("fighter-tactical-mind");
    expect(ids).toContain("fighter-extra-attack");
  });

  it("L5 does NOT include L9+ features", () => {
    const ids = collectActiveFeatures(makeFighter(5)).map((d) => d.id);
    expect(ids).not.toContain("fighter-indomitable");
    expect(ids).not.toContain("fighter-tactical-shift");
    expect(ids).not.toContain("fighter-two-extra-attacks");
  });

  it("L9 includes indomitable and tactical-shift but not L11+ features", () => {
    const ids = collectActiveFeatures(makeFighter(9)).map((d) => d.id);
    expect(ids).toContain("fighter-indomitable");
    expect(ids).toContain("fighter-tactical-shift");
    expect(ids).not.toContain("fighter-two-extra-attacks");
    expect(ids).not.toContain("fighter-indomitable-2");
  });

  it("L11 includes two-extra-attacks but not L13+ features", () => {
    const ids = collectActiveFeatures(makeFighter(11)).map((d) => d.id);
    expect(ids).toContain("fighter-two-extra-attacks");
    expect(ids).not.toContain("fighter-indomitable-2");
  });

  it("L17 includes indomitable-3 and indomitable-2 but not three-extra-attacks", () => {
    const ids = collectActiveFeatures(makeFighter(17)).map((d) => d.id);
    expect(ids).toContain("fighter-indomitable-2");
    expect(ids).toContain("fighter-indomitable-3");
    expect(ids).not.toContain("fighter-three-extra-attacks");
  });

  it("L20 includes all class features including three-extra-attacks", () => {
    const ids = collectActiveFeatures(makeFighter(20)).map((d) => d.id);
    expect(ids).toContain("fighter-three-extra-attacks");
    expect(ids).toContain("fighter-indomitable-3");
    expect(ids).toContain("fighter-tactical-shift");
  });

  it("fighting style FeatureDefs are NOT included without feat picks (origin: feat)", () => {
    const ids = collectActiveFeatures(makeFighter(5)).map((d) => d.id);
    expect(ids).not.toContain("feat-fighting-style-defense");
    expect(ids).not.toContain("feat-fighting-style-archery");
  });
});

// ── Effects ───────────────────────────────────────────────────────────────────

describe("Fighter FeatureDef effects", () => {
  it("extra-attack has scaling-stat attacksPerAction with full progression table", () => {
    const def = getFeatureDef("fighter-extra-attack");
    expect(def?.effects).toContainEqual({
      kind: "scaling-stat",
      stat: "attacksPerAction",
      formula: {
        by: "class-level",
        classId: "ID_CLASS_FIGHTER",
        table: { 5: 2, 11: 3, 20: 4 },
      },
    });
  });

  it("defense fighting style has ac +1 condition: wearing armor", () => {
    const def = getFeatureDef("feat-fighting-style-defense");
    expect(def?.effects).toContainEqual({
      kind: "ac",
      op: "add",
      value: 1,
      condition: { wearing: "armor" },
    });
  });

  it("protection fighting style has actionType: reaction", () => {
    const def = getFeatureDef("feat-fighting-style-protection");
    expect(def?.actionType).toBe("reaction");
  });

  it("archery/dueling/great-weapon-fighting/two-weapon-fighting have no effects", () => {
    for (const id of [
      "feat-fighting-style-archery",
      "feat-fighting-style-dueling",
      "feat-fighting-style-great-weapon-fighting",
      "feat-fighting-style-two-weapon-fighting",
    ]) {
      const def = getFeatureDef(id);
      expect(def?.effects == null || def.effects.length === 0).toBe(true);
    }
  });
});

// ── Indomitable resource ──────────────────────────────────────────────────────

describe("Fighter Indomitable resource (chunk 9b)", () => {
  it("indomitable has charges resource from class-table indomitableUses, long-rest recharge", () => {
    const def = getFeatureDef("fighter-indomitable");
    expect(def?.resource).toMatchObject({
      id: "indomitable",
      shape: { kind: "charges", max: { from: "class-table", classId: "fighter", column: "indomitableUses" } },
      recharge: { on: "long-rest" },
    });
  });

  it("indomitable-2 parentFeatureId points to fighter-indomitable", () => {
    expect(getFeatureDef("fighter-indomitable-2")?.parentFeatureId).toBe("fighter-indomitable");
  });

  it("indomitable-3 parentFeatureId points to fighter-indomitable", () => {
    expect(getFeatureDef("fighter-indomitable-3")?.parentFeatureId).toBe("fighter-indomitable");
  });
});

// ── Progression table ─────────────────────────────────────────────────────────

describe("Fighter progression table — indomitableUses (chunk 9b)", () => {
  it("indomitableUses is defined on the fighter table", () => {
    expect(CLASS_TABLE_COLUMNS.fighter.indomitableUses).toBeDefined();
  });

  it("indomitableUses is 1 at L9, 2 at L13, 3 at L17", () => {
    const uses = CLASS_TABLE_COLUMNS.fighter.indomitableUses;
    expect(uses[8]).toBe(1);   // index 8 = level 9
    expect(uses[12]).toBe(2);  // index 12 = level 13
    expect(uses[16]).toBe(3);  // index 16 = level 17
  });

  it("indomitableUses is 0 before L9", () => {
    const uses = CLASS_TABLE_COLUMNS.fighter.indomitableUses;
    for (let i = 0; i < 8; i++) {
      expect(uses[i]).toBe(0);
    }
  });
});
