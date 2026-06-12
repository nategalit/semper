import { describe, it, expect } from "vitest";
import { collectActiveFeatures, applyFeatureEffect } from "../apply";
import type { DeriveContext } from "@/lib/character/feature-effects";
import type { Character } from "@/lib/types/character";
import type { FeatureEffect } from "../types";

// ── Minimal character factory ─────────────────────────────────────────────────

function makeCharacter(overrides: Partial<Character> & { dataOverrides?: Partial<Character["data"]> } = {}): Character {
  const { dataOverrides = {}, ...rest } = overrides;
  return {
    id: "test-id",
    userId: "user-id",
    name: "Test",
    level: 5,
    classId: "ID_CLASS_BARBARIAN",
    raceId: "ID_RACE_HUMAN",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    data: {
      abilityScores: { str: 16, dex: 14, con: 16, int: 10, wis: 10, cha: 10 },
      currentHp: 45,
      maxHp: 45,
      tempHp: 0,
      hitDiceTotal: 5,
      hitDiceRemaining: 5,
      deathSaves: { successes: 0, failures: 0 },
      inspiration: false,
      xp: 0,
      currency: { cp: 0, sp: 0, ep: 0, gp: 0, pp: 0 },
      ...dataOverrides,
    },
    ...rest,
  };
}

// ── Minimal DeriveContext factory ─────────────────────────────────────────────

function makeCtx(overrides: Partial<DeriveContext> = {}): DeriveContext {
  return {
    level: 5,
    pb: 3,
    featureName: "Tough",
    abilityMods: { str: 3, dex: 2, con: 3, int: 0, wis: 0, cha: 0 },
    proficientSkills: new Set(["Athletics"]),
    skillAbilities: {
      Athletics: "str",
      Acrobatics: "dex",
      "Sleight of Hand": "dex",
      Stealth: "dex",
      Arcana: "int",
      History: "int",
      Investigation: "int",
      Nature: "int",
      Religion: "int",
      "Animal Handling": "wis",
      Insight: "wis",
      Medicine: "wis",
      Perception: "wis",
      Survival: "wis",
      Deception: "cha",
      Intimidation: "cha",
      Performance: "cha",
      Persuasion: "cha",
    },
    maxHpComponents: [{ label: "Rolled HP", value: 45 }],
    initiativeBreakdown: { components: [{ label: "DEX", value: 2 }], total: 2 },
    skillBreakdowns: {
      Athletics: { components: [{ label: "STR", value: 3 }, { label: "Proficiency", value: 3 }], total: 6 },
      Acrobatics: { components: [{ label: "DEX", value: 2 }], total: 2 },
      Stealth: { components: [{ label: "DEX", value: 2 }], total: 2 },
      Arcana: { components: [{ label: "INT", value: 0 }], total: 0 },
    },
    ...overrides,
  };
}

// ── collectActiveFeatures ─────────────────────────────────────────────────────

describe("collectActiveFeatures", () => {
  it("returns feat-tough for a character with PHB24 Tough", () => {
    const character = makeCharacter({
      dataOverrides: {
        levelChoices: { 4: { hpGained: 8, featId: "ID_WOTC_PHB24_FEAT_TOUGH" } },
      },
    });
    const active = collectActiveFeatures(character);
    expect(active.map((d) => d.id)).toContain("feat-tough");
  });

  it("returns feat-alert for a character with PHB24 Alert", () => {
    const character = makeCharacter({
      dataOverrides: {
        levelChoices: { 4: { hpGained: 8, featId: "ID_WOTC_PHB24_FEAT_ALERT" } },
      },
    });
    const active = collectActiveFeatures(character);
    expect(active.map((d) => d.id)).toContain("feat-alert");
  });

  it("returns Remarkable Athlete for a Champion Fighter at L7+", () => {
    const character = makeCharacter({
      level: 7,
      classId: "ID_CLASS_FIGHTER",
      dataOverrides: { subclassId: "ID_SUBCLASS_FIGHTER_CHAMPION" },
    });
    const active = collectActiveFeatures(character);
    expect(active.map((d) => d.id)).toContain("subclass-champion-remarkable-athlete");
  });

  it("does NOT return Remarkable Athlete for a Champion Fighter at L6", () => {
    const character = makeCharacter({
      level: 6,
      classId: "ID_CLASS_FIGHTER",
      dataOverrides: { subclassId: "ID_SUBCLASS_FIGHTER_CHAMPION" },
    });
    const active = collectActiveFeatures(character);
    expect(active.map((d) => d.id)).not.toContain("subclass-champion-remarkable-athlete");
  });

  it("returns Rage for a plain Barbarian (Rage registered at L1+)", () => {
    const character = makeCharacter();
    const active = collectActiveFeatures(character);
    // L5 Barbarian: Rage (L1) + ASI (L4). Exact count grows as more FeatureDefs land.
    expect(active.map((d) => d.id)).toContain("barbarian-rage");
    expect(active.filter((d) => d.id === "barbarian-rage")).toHaveLength(1);
  });

  it("returns feat-lucky for a character with PHB14 Lucky (array featId)", () => {
    const character = makeCharacter({
      dataOverrides: {
        levelChoices: { 4: { hpGained: 8, featId: "ID_PHB_FEAT_LUCKY" } },
      },
    });
    const active = collectActiveFeatures(character);
    expect(active.map((d) => d.id)).toContain("feat-lucky");
  });

  // chunk 7 — Brutal Strike level gating
  it("includes Brutal Strike for a Barbarian at L9", () => {
    const character = makeCharacter({ level: 9, classId: "ID_CLASS_BARBARIAN" });
    const ids = collectActiveFeatures(character).map((d) => d.id);
    expect(ids).toContain("barbarian-brutal-strike");
    expect(ids).not.toContain("barbarian-improved-brutal-strike");
  });

  it("includes both Brutal Strike and Improved Brutal Strike for a Barbarian at L13", () => {
    const character = makeCharacter({ level: 13, classId: "ID_CLASS_BARBARIAN" });
    const ids = collectActiveFeatures(character).map((d) => d.id);
    expect(ids).toContain("barbarian-brutal-strike");
    expect(ids).toContain("barbarian-improved-brutal-strike");
  });

  it("does NOT include Brutal Strike for a Barbarian at L8", () => {
    const character = makeCharacter({ level: 8, classId: "ID_CLASS_BARBARIAN" });
    const ids = collectActiveFeatures(character).map((d) => d.id);
    expect(ids).not.toContain("barbarian-brutal-strike");
    expect(ids).not.toContain("barbarian-improved-brutal-strike");
  });

  // chunk 7 — Aura of Protection level gating
  it("includes Aura of Protection for a Paladin at L6", () => {
    const character = makeCharacter({ level: 6, classId: "ID_CLASS_PALADIN" });
    const ids = collectActiveFeatures(character).map((d) => d.id);
    expect(ids).toContain("paladin-aura-of-protection");
    expect(ids).not.toContain("paladin-aura-expansion");
  });

  it("includes both Aura of Protection and Aura Expansion for a Paladin at L18", () => {
    const character = makeCharacter({ level: 18, classId: "ID_CLASS_PALADIN" });
    const ids = collectActiveFeatures(character).map((d) => d.id);
    expect(ids).toContain("paladin-aura-of-protection");
    expect(ids).toContain("paladin-aura-expansion");
  });

  it("does NOT include Aura of Protection for a Paladin at L5", () => {
    const character = makeCharacter({ level: 5, classId: "ID_CLASS_PALADIN" });
    const ids = collectActiveFeatures(character).map((d) => d.id);
    expect(ids).not.toContain("paladin-aura-of-protection");
    expect(ids).not.toContain("paladin-aura-expansion");
  });
});

// ── applyHpPerLevel ───────────────────────────────────────────────────────────

describe("applyHpPerLevel via applyFeatureEffect", () => {
  it("adds value × level to maxHpComponents with feature name as label", () => {
    const ctx = makeCtx({ featureName: "Tough", level: 5 });
    const effect: FeatureEffect = { kind: "hp-per-level", value: 2 };
    applyFeatureEffect(effect, ctx);
    const extra = ctx.maxHpComponents.find((c) => c.label === "Tough");
    expect(extra?.value).toBe(10); // 2 × 5
  });

  it("does not change initiativeBreakdown", () => {
    const ctx = makeCtx();
    const before = ctx.initiativeBreakdown.total;
    applyFeatureEffect({ kind: "hp-per-level", value: 2 }, ctx);
    expect(ctx.initiativeBreakdown.total).toBe(before);
  });
});

// ── applyInitiativeAdd ────────────────────────────────────────────────────────

describe("applyInitiativeAdd via applyFeatureEffect", () => {
  it("adds pb to initiative when value is 'prof-bonus'", () => {
    const ctx = makeCtx({ featureName: "Alert", pb: 3, initiativeBreakdown: { components: [{ label: "DEX", value: 2 }], total: 2 } });
    applyFeatureEffect({ kind: "initiative-add", value: "prof-bonus" }, ctx);
    expect(ctx.initiativeBreakdown.total).toBe(5); // 2 + 3
    expect(ctx.initiativeBreakdown.components).toContainEqual({ label: "Alert", value: 3 });
  });

  it("adds a flat number when value is numeric", () => {
    const ctx = makeCtx({ featureName: "Alert", initiativeBreakdown: { components: [{ label: "DEX", value: 2 }], total: 2 } });
    applyFeatureEffect({ kind: "initiative-add", value: 5 }, ctx);
    expect(ctx.initiativeBreakdown.total).toBe(7);
    expect(ctx.initiativeBreakdown.components).toContainEqual({ label: "Alert", value: 5 });
  });

  it("does not change maxHpComponents", () => {
    const ctx = makeCtx();
    const before = ctx.maxHpComponents.length;
    applyFeatureEffect({ kind: "initiative-add", value: "prof-bonus" }, ctx);
    expect(ctx.maxHpComponents).toHaveLength(before);
  });
});

// ── applyHalfProfOnChecks ─────────────────────────────────────────────────────

describe("applyHalfProfOnChecks via applyFeatureEffect", () => {
  it("adds half-PB to non-proficient STR/DEX/CON skills", () => {
    // proficientSkills has Athletics (STR-based) — it should be SKIPPED
    // Acrobatics + Stealth (DEX-based, not proficient) — should get the bonus
    const ctx = makeCtx({
      featureName: "Remarkable Athlete",
      pb: 3,
      proficientSkills: new Set(["Athletics"]),
    });
    applyFeatureEffect({ kind: "half-prof-on-checks", abilities: ["str", "dex", "con"] }, ctx);

    // half of pb=3, rounded up = 2
    const acro = ctx.skillBreakdowns["Acrobatics"];
    expect(acro.components).toContainEqual({ label: "Remarkable Athlete", value: 2 });
    expect(acro.total).toBe(4); // was 2, now +2

    const stealth = ctx.skillBreakdowns["Stealth"];
    expect(stealth.components).toContainEqual({ label: "Remarkable Athlete", value: 2 });
    expect(stealth.total).toBe(4);
  });

  it("skips proficient skills", () => {
    const ctx = makeCtx({
      pb: 3,
      proficientSkills: new Set(["Athletics"]),
    });
    applyFeatureEffect({ kind: "half-prof-on-checks", abilities: ["str", "dex", "con"] }, ctx);
    const athletics = ctx.skillBreakdowns["Athletics"];
    expect(athletics.components.map((c) => c.label)).not.toContain("Remarkable Athlete");
    expect(athletics.total).toBe(6); // unchanged
  });

  it("skips skills whose ability is not in the list", () => {
    const ctx = makeCtx({ pb: 3, proficientSkills: new Set() });
    applyFeatureEffect({ kind: "half-prof-on-checks", abilities: ["str"] }, ctx);
    // Arcana is INT — not in ["str"]
    const arcana = ctx.skillBreakdowns["Arcana"];
    expect(arcana?.components.map((c) => c.label) ?? []).not.toContain("Remarkable Athlete");
  });

  it("does not change initiativeBreakdown", () => {
    const ctx = makeCtx({ pb: 3 });
    const before = ctx.initiativeBreakdown.total;
    applyFeatureEffect({ kind: "half-prof-on-checks", abilities: ["str", "dex", "con"] }, ctx);
    expect(ctx.initiativeBreakdown.total).toBe(before);
  });
});

// ── unknown effect kinds ──────────────────────────────────────────────────────

describe("applyFeatureEffect — unhandled kinds", () => {
  it("silently ignores unknown kinds without throwing", () => {
    const ctx = makeCtx();
    // Cast via `as never` to simulate a future kind not yet handled.
    expect(() =>
      applyFeatureEffect({ kind: "ac", op: "add", value: 1 } as FeatureEffect, ctx)
    ).not.toThrow();
  });
});
