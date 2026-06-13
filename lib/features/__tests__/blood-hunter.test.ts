// Blood Hunter FeatureDef fill tests — chunk 9n.
// Homebrew class (Matt Mercer 2020 v2.3); no Aurora content-audit data available.
// All 10 FeatureDefs use tier 1 hand-tagged actionType.
// Covers: registry presence, collectActiveFeatures level gating,
// Blood Maledict resource (class-table maledictUses, long-rest),
// Crimson Rite mode choice (3 always-available rite options),
// Fighting Style feat choice, actionType spot-checks.

import { describe, it, expect } from "vitest";
import { collectActiveFeatures, getFeatureDef } from "..";
import type { Character } from "@/lib/types/character";

function makeBloodHunter(level: number): Character {
  return {
    id: "test",
    userId: "user",
    name: "Test Blood Hunter",
    level,
    classId: "ID_CLASS_BLOOD_HUNTER",
    raceId: "ID_RACE_HUMAN",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    data: {
      abilityScores: { str: 14, dex: 16, con: 12, int: 16, wis: 10, cha: 10 },
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

describe("Blood Hunter registry (chunk 9n)", () => {
  const IDS = [
    "bloodhunter-hunters-bane",
    "bloodhunter-blood-maledict",
    "bloodhunter-crimson-rite",
    "bloodhunter-fighting-style",
    "bloodhunter-extra-attack",
    "bloodhunter-brand-of-castigation",
    "bloodhunter-grim-psychometry",
    "bloodhunter-brand-of-tethering",
    "bloodhunter-hardened-soul",
    "bloodhunter-sanguine-mastery",
  ] as const;

  for (const id of IDS) {
    it(`registers ${id}`, () => {
      expect(getFeatureDef(id)).toBeDefined();
    });
  }
});

// ── collectActiveFeatures level gating ───────────────────────────────────────

describe("collectActiveFeatures — Blood Hunter level gating", () => {
  it("L1 includes hunters-bane and blood-maledict but NOT L2+", () => {
    const ids = collectActiveFeatures(makeBloodHunter(1)).map((d) => d.id);
    expect(ids).toContain("bloodhunter-hunters-bane");
    expect(ids).toContain("bloodhunter-blood-maledict");
    expect(ids).not.toContain("bloodhunter-crimson-rite");
    expect(ids).not.toContain("bloodhunter-fighting-style");
  });

  it("L2 includes crimson-rite and fighting-style but NOT L5+", () => {
    const ids = collectActiveFeatures(makeBloodHunter(2)).map((d) => d.id);
    expect(ids).toContain("bloodhunter-crimson-rite");
    expect(ids).toContain("bloodhunter-fighting-style");
    expect(ids).not.toContain("bloodhunter-extra-attack");
    expect(ids).not.toContain("bloodhunter-brand-of-castigation");
  });

  it("L6 includes extra-attack and brand-of-castigation but NOT L9+", () => {
    const ids = collectActiveFeatures(makeBloodHunter(6)).map((d) => d.id);
    expect(ids).toContain("bloodhunter-extra-attack");
    expect(ids).toContain("bloodhunter-brand-of-castigation");
    expect(ids).not.toContain("bloodhunter-grim-psychometry");
  });

  it("L14 includes brand-of-tethering and hardened-soul but NOT L20", () => {
    const ids = collectActiveFeatures(makeBloodHunter(14)).map((d) => d.id);
    expect(ids).toContain("bloodhunter-brand-of-tethering");
    expect(ids).toContain("bloodhunter-hardened-soul");
    expect(ids).not.toContain("bloodhunter-sanguine-mastery");
  });

  it("L20 includes all features including sanguine-mastery", () => {
    const ids = collectActiveFeatures(makeBloodHunter(20)).map((d) => d.id);
    expect(ids).toContain("bloodhunter-grim-psychometry");
    expect(ids).toContain("bloodhunter-brand-of-tethering");
    expect(ids).toContain("bloodhunter-hardened-soul");
    expect(ids).toContain("bloodhunter-sanguine-mastery");
  });
});

// ── Blood Maledict resource ───────────────────────────────────────────────────

describe("Blood Hunter Blood Maledict resource (chunk 9n)", () => {
  it("has charges from class-table maledictUses column", () => {
    const def = getFeatureDef("bloodhunter-blood-maledict");
    expect(def?.resource?.shape).toEqual({
      kind: "charges",
      max: { from: "class-table", classId: "blood-hunter", column: "maledictUses" },
    });
  });

  it("recharges on long-rest", () => {
    expect(getFeatureDef("bloodhunter-blood-maledict")?.resource?.recharge).toEqual({
      on: "long-rest",
    });
  });
});

// ── Crimson Rite mode choice ──────────────────────────────────────────────────

describe("Blood Hunter Crimson Rite mode (chunk 9n)", () => {
  it("has a mode choice affecting crimson-rite-type", () => {
    const def = getFeatureDef("bloodhunter-crimson-rite");
    const modeChoice = def?.choices?.find((c) => c.kind === "mode");
    expect(modeChoice).toBeDefined();
    if (modeChoice?.kind !== "mode") return;
    expect(modeChoice.affects).toBe("crimson-rite-type");
  });

  it("mode has exactly 3 always-available rite options", () => {
    const def = getFeatureDef("bloodhunter-crimson-rite");
    const modeChoice = def?.choices?.find((c) => c.kind === "mode");
    if (modeChoice?.kind !== "mode") return;
    expect(modeChoice.options).toHaveLength(3);
    const ids = modeChoice.options.map((o) => o.id);
    expect(ids).toContain("rite-of-the-dawn");
    expect(ids).toContain("rite-of-the-dusk");
    expect(ids).toContain("rite-of-the-oracle");
  });
});

// ── Fighting Style feat choice ────────────────────────────────────────────────

describe("Blood Hunter Fighting Style choice (chunk 9n)", () => {
  it("has a feat choice tagged fighting-style", () => {
    const def = getFeatureDef("bloodhunter-fighting-style");
    const featChoice = def?.choices?.find((c) => c.kind === "feat");
    expect(featChoice).toBeDefined();
    if (featChoice?.kind !== "feat") return;
    expect(featChoice.from).toEqual({ tag: "fighting-style" });
    expect(featChoice.count).toBe(1);
  });
});

// ── actionType spot-checks ────────────────────────────────────────────────────

describe("Blood Hunter actionType hand-tagging (chunk 9n)", () => {
  it("hunters-bane is passive", () => {
    expect(getFeatureDef("bloodhunter-hunters-bane")?.actionType).toBe("passive");
    expect(getFeatureDef("bloodhunter-hunters-bane")?.actionTypeSource).toBe("tagged");
  });

  it("blood-maledict is bonus_action", () => {
    expect(getFeatureDef("bloodhunter-blood-maledict")?.actionType).toBe("bonus_action");
    expect(getFeatureDef("bloodhunter-blood-maledict")?.actionTypeSource).toBe("tagged");
  });

  it("crimson-rite is bonus_action (HP cost in prose, not spendsResource)", () => {
    expect(getFeatureDef("bloodhunter-crimson-rite")?.actionType).toBe("bonus_action");
    expect(getFeatureDef("bloodhunter-crimson-rite")?.spendsResource).toBeUndefined();
  });

  it("brand-of-castigation is reaction", () => {
    expect(getFeatureDef("bloodhunter-brand-of-castigation")?.actionType).toBe("reaction");
    expect(getFeatureDef("bloodhunter-brand-of-castigation")?.actionTypeSource).toBe("tagged");
  });

  it("grim-psychometry is special", () => {
    expect(getFeatureDef("bloodhunter-grim-psychometry")?.actionType).toBe("special");
  });

  it("sanguine-mastery is special", () => {
    expect(getFeatureDef("bloodhunter-sanguine-mastery")?.actionType).toBe("special");
  });

  it("hardened-soul is passive", () => {
    expect(getFeatureDef("bloodhunter-hardened-soul")?.actionType).toBe("passive");
  });
});
