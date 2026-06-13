// Warlock FeatureDef fill tests — chunk 9l.
// Covers: registry presence, collectActiveFeatures level gating,
// Pact Magic slots resource, Eldritch Invocations count-by-class-table + rePickOn,
// Pact Boon mode choice (4 options), Mystic Arcanum 4×FeatureDef spell choices + resources,
// legacyNames on Mystic Arcanum entries.

import { describe, it, expect } from "vitest";
import { collectActiveFeatures, getFeatureDef } from "..";
import type { Character } from "@/lib/types/character";

function makeWarlock(level: number): Character {
  return {
    id: "test",
    userId: "user",
    name: "Test Warlock",
    level,
    classId: "ID_CLASS_WARLOCK",
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

describe("Warlock registry (chunk 9l)", () => {
  const IDS = [
    "warlock-pact-magic",
    "warlock-eldritch-invocations",
    "warlock-magical-cunning",
    "warlock-pact-boon",
    "warlock-contact-patron",
    "warlock-mystic-arcanum-6",
    "warlock-mystic-arcanum-7",
    "warlock-mystic-arcanum-8",
    "warlock-mystic-arcanum-9",
    "warlock-eldritch-master",
  ] as const;

  for (const id of IDS) {
    it(`registers ${id}`, () => {
      expect(getFeatureDef(id)).toBeDefined();
    });
  }
});

// ── legacyNames ───────────────────────────────────────────────────────────────

describe("Warlock Mystic Arcanum legacyNames (chunk 9l)", () => {
  it("mystic-arcanum-6 has legacyNames: ['Mystic Arcanum (6th level)']", () => {
    expect(getFeatureDef("warlock-mystic-arcanum-6")?.legacyNames).toEqual(["Mystic Arcanum (6th level)"]);
  });
  it("mystic-arcanum-7 has legacyNames: ['Mystic Arcanum (7th level)']", () => {
    expect(getFeatureDef("warlock-mystic-arcanum-7")?.legacyNames).toEqual(["Mystic Arcanum (7th level)"]);
  });
  it("mystic-arcanum-8 has legacyNames: ['Mystic Arcanum (8th level)']", () => {
    expect(getFeatureDef("warlock-mystic-arcanum-8")?.legacyNames).toEqual(["Mystic Arcanum (8th level)"]);
  });
  it("mystic-arcanum-9 has legacyNames: ['Mystic Arcanum (9th level)']", () => {
    expect(getFeatureDef("warlock-mystic-arcanum-9")?.legacyNames).toEqual(["Mystic Arcanum (9th level)"]);
  });
});

// ── collectActiveFeatures level gating ───────────────────────────────────────

describe("collectActiveFeatures — Warlock level gating", () => {
  it("L1 includes pact-magic but NOT L2+ features", () => {
    const ids = collectActiveFeatures(makeWarlock(1)).map((d) => d.id);
    expect(ids).toContain("warlock-pact-magic");
    expect(ids).not.toContain("warlock-eldritch-invocations");
    expect(ids).not.toContain("warlock-pact-boon");
  });

  it("L2 includes eldritch-invocations and magical-cunning but NOT L3+", () => {
    const ids = collectActiveFeatures(makeWarlock(2)).map((d) => d.id);
    expect(ids).toContain("warlock-eldritch-invocations");
    expect(ids).toContain("warlock-magical-cunning");
    expect(ids).not.toContain("warlock-pact-boon");
    expect(ids).not.toContain("warlock-contact-patron");
  });

  it("L3 includes pact-boon but NOT L9+", () => {
    const ids = collectActiveFeatures(makeWarlock(3)).map((d) => d.id);
    expect(ids).toContain("warlock-pact-boon");
    expect(ids).not.toContain("warlock-contact-patron");
    expect(ids).not.toContain("warlock-mystic-arcanum-6");
  });

  it("L9 includes contact-patron but NOT L11+", () => {
    const ids = collectActiveFeatures(makeWarlock(9)).map((d) => d.id);
    expect(ids).toContain("warlock-contact-patron");
    expect(ids).not.toContain("warlock-mystic-arcanum-6");
  });

  it("L17 includes all four mystic arcanum tiers but NOT L20", () => {
    const ids = collectActiveFeatures(makeWarlock(17)).map((d) => d.id);
    expect(ids).toContain("warlock-mystic-arcanum-6");
    expect(ids).toContain("warlock-mystic-arcanum-7");
    expect(ids).toContain("warlock-mystic-arcanum-8");
    expect(ids).toContain("warlock-mystic-arcanum-9");
    expect(ids).not.toContain("warlock-eldritch-master");
  });

  it("L20 includes eldritch-master", () => {
    const ids = collectActiveFeatures(makeWarlock(20)).map((d) => d.id);
    expect(ids).toContain("warlock-eldritch-master");
  });
});

// ── Pact Magic resource ───────────────────────────────────────────────────────

describe("Warlock Pact Magic resource (chunk 9l)", () => {
  it("is a slots resource with level by-table and count from class-table", () => {
    const def = getFeatureDef("warlock-pact-magic");
    expect(def?.resource?.shape).toEqual({
      kind: "slots",
      level: "by-table",
      max: { from: "class-table", classId: "warlock", column: "pactSlots" },
    });
  });

  it("recharges on short-rest", () => {
    expect(getFeatureDef("warlock-pact-magic")?.resource?.recharge).toEqual({ on: "short-rest" });
  });

  it("display is spell-slot-row", () => {
    expect(getFeatureDef("warlock-pact-magic")?.resource?.display).toBe("spell-slot-row");
  });
});

// ── Eldritch Invocations choice ───────────────────────────────────────────────

describe("Warlock Eldritch Invocations choice (chunk 9l)", () => {
  it("has feat choice from tag:invocation with class-table count and rePickOn: level-up", () => {
    const def = getFeatureDef("warlock-eldritch-invocations");
    expect(def?.choices).toContainEqual({
      kind: "feat",
      from: { tag: "invocation" },
      count: { from: "class-table", classId: "warlock", column: "invocationsKnown" },
      rePickOn: "level-up",
    });
  });
});

// ── Pact Boon mode choice ─────────────────────────────────────────────────────

describe("Warlock Pact Boon mode choice (chunk 9l)", () => {
  it("has mode choice affects 'pact-boon' with all four options", () => {
    const def = getFeatureDef("warlock-pact-boon");
    const choice = def?.choices?.find((c) => c.kind === "mode" && c.affects === "pact-boon");
    expect(choice).toBeDefined();
    if (choice?.kind !== "mode") return;
    const ids = choice.options.map((o) => o.id);
    expect(ids).toContain("blade");
    expect(ids).toContain("chain");
    expect(ids).toContain("tome");
    expect(ids).toContain("talisman");
  });
});

// ── Mystic Arcanum choices + resources ───────────────────────────────────────

describe("Warlock Mystic Arcanum spell choices (chunk 9l)", () => {
  it("mystic-arcanum-6 has spell choice levels: [6] and per-tier-one-shot resource tiers: [6]", () => {
    const def = getFeatureDef("warlock-mystic-arcanum-6");
    expect(def?.choices).toContainEqual({ kind: "spell", from: { levels: [6] }, count: 1 });
    expect(def?.resource?.shape).toEqual({ kind: "per-tier-one-shot", tiers: [6] });
    expect(def?.resource?.recharge).toEqual({ on: "long-rest" });
  });

  it("mystic-arcanum-7 has spell choice levels: [7] and per-tier-one-shot resource tiers: [7]", () => {
    const def = getFeatureDef("warlock-mystic-arcanum-7");
    expect(def?.choices).toContainEqual({ kind: "spell", from: { levels: [7] }, count: 1 });
    expect(def?.resource?.shape).toEqual({ kind: "per-tier-one-shot", tiers: [7] });
  });

  it("mystic-arcanum-8 has spell choice levels: [8] and per-tier-one-shot resource tiers: [8]", () => {
    const def = getFeatureDef("warlock-mystic-arcanum-8");
    expect(def?.choices).toContainEqual({ kind: "spell", from: { levels: [8] }, count: 1 });
    expect(def?.resource?.shape).toEqual({ kind: "per-tier-one-shot", tiers: [8] });
  });

  it("mystic-arcanum-9 has spell choice levels: [9] and per-tier-one-shot resource tiers: [9]", () => {
    const def = getFeatureDef("warlock-mystic-arcanum-9");
    expect(def?.choices).toContainEqual({ kind: "spell", from: { levels: [9] }, count: 1 });
    expect(def?.resource?.shape).toEqual({ kind: "per-tier-one-shot", tiers: [9] });
  });
});
