// Artificer FeatureDef fill tests — chunk 9m.
// Aurora-only, lighter pass. Covers: registry presence, collectActiveFeatures
// level gating, Infuse Item resource (class-table infusedItems, long-rest),
// Flash of Genius resource (INT-mod charges, long-rest, reaction),
// actionType spot-checks for all 11 features (all tier 1 hand-tagged —
// Aurora action field absent, tier 3 unreliable on 200-char-truncated prose).

import { describe, it, expect } from "vitest";
import { collectActiveFeatures, getFeatureDef } from "..";
import type { Character } from "@/lib/types/character";

function makeArtificer(level: number): Character {
  return {
    id: "test",
    userId: "user",
    name: "Test Artificer",
    level,
    classId: "ID_CLASS_ARTIFICER",
    raceId: "ID_RACE_HUMAN",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    data: {
      abilityScores: { str: 10, dex: 14, con: 12, int: 16, wis: 10, cha: 10 },
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

describe("Artificer registry (chunk 9m)", () => {
  const IDS = [
    "artificer-spellcasting",
    "artificer-magical-tinkering",
    "artificer-infuse-item",
    "artificer-right-tool-for-job",
    "artificer-tool-expertise",
    "artificer-flash-of-genius",
    "artificer-magic-item-adept",
    "artificer-spell-storing-item",
    "artificer-magic-item-savant",
    "artificer-magic-item-master",
    "artificer-soul-of-artifice",
  ] as const;

  for (const id of IDS) {
    it(`registers ${id}`, () => {
      expect(getFeatureDef(id)).toBeDefined();
    });
  }
});

// ── collectActiveFeatures level gating ───────────────────────────────────────

describe("collectActiveFeatures — Artificer level gating", () => {
  it("L1 includes spellcasting and magical-tinkering but NOT L2+", () => {
    const ids = collectActiveFeatures(makeArtificer(1)).map((d) => d.id);
    expect(ids).toContain("artificer-spellcasting");
    expect(ids).toContain("artificer-magical-tinkering");
    expect(ids).not.toContain("artificer-infuse-item");
    expect(ids).not.toContain("artificer-right-tool-for-job");
  });

  it("L6 includes infuse-item, right-tool-for-job, tool-expertise but NOT L7+", () => {
    const ids = collectActiveFeatures(makeArtificer(6)).map((d) => d.id);
    expect(ids).toContain("artificer-infuse-item");
    expect(ids).toContain("artificer-right-tool-for-job");
    expect(ids).toContain("artificer-tool-expertise");
    expect(ids).not.toContain("artificer-flash-of-genius");
    expect(ids).not.toContain("artificer-magic-item-adept");
  });

  it("L10 includes flash-of-genius and magic-item-adept but NOT L11+", () => {
    const ids = collectActiveFeatures(makeArtificer(10)).map((d) => d.id);
    expect(ids).toContain("artificer-flash-of-genius");
    expect(ids).toContain("artificer-magic-item-adept");
    expect(ids).not.toContain("artificer-spell-storing-item");
    expect(ids).not.toContain("artificer-magic-item-savant");
  });

  it("L20 includes all features including soul-of-artifice", () => {
    const ids = collectActiveFeatures(makeArtificer(20)).map((d) => d.id);
    expect(ids).toContain("artificer-spell-storing-item");
    expect(ids).toContain("artificer-magic-item-savant");
    expect(ids).toContain("artificer-magic-item-master");
    expect(ids).toContain("artificer-soul-of-artifice");
  });
});

// ── Infuse Item resource ──────────────────────────────────────────────────────

describe("Artificer Infuse Item resource (chunk 9m)", () => {
  it("has charges resource from class-table infusedItems column", () => {
    const def = getFeatureDef("artificer-infuse-item");
    expect(def?.resource?.shape).toEqual({
      kind: "charges",
      max: { from: "class-table", classId: "artificer", column: "infusedItems" },
    });
  });

  it("recharges on long-rest", () => {
    expect(getFeatureDef("artificer-infuse-item")?.resource?.recharge).toEqual({ on: "long-rest" });
  });
});

// ── Flash of Genius resource ──────────────────────────────────────────────────

describe("Artificer Flash of Genius resource (chunk 9m)", () => {
  it("has charges from ability-mod INT min 1, long-rest recharge", () => {
    const def = getFeatureDef("artificer-flash-of-genius");
    expect(def?.resource?.shape).toEqual({
      kind: "charges",
      max: { from: "ability-mod", ability: "int", min: 1 },
    });
    expect(def?.resource?.recharge).toEqual({ on: "long-rest" });
  });
});

// ── actionType spot-checks (tier 1 hand-tagged) ───────────────────────────────
// Aurora action field absent for all Artificer features; tier 3 inference
// unreliable on 200-char-truncated prose. All types are tier 1 tagged.

describe("Artificer actionType hand-tagging (chunk 9m)", () => {
  it("magical-tinkering is action (would mis-infer as passive from truncated prose)", () => {
    const def = getFeatureDef("artificer-magical-tinkering");
    expect(def?.actionType).toBe("action");
    expect(def?.actionTypeSource).toBe("tagged");
  });

  it("flash-of-genius is reaction (would mis-infer as passive from truncated prose)", () => {
    const def = getFeatureDef("artificer-flash-of-genius");
    expect(def?.actionType).toBe("reaction");
    expect(def?.actionTypeSource).toBe("tagged");
  });

  it("spell-storing-item is special (would mis-infer as passive from truncated prose)", () => {
    const def = getFeatureDef("artificer-spell-storing-item");
    expect(def?.actionType).toBe("special");
    expect(def?.actionTypeSource).toBe("tagged");
  });

  it("tool-expertise is passive (tier 3 would also correctly infer passive)", () => {
    const def = getFeatureDef("artificer-tool-expertise");
    expect(def?.actionType).toBe("passive");
    expect(def?.actionTypeSource).toBe("tagged");
  });

  it("soul-of-artifice is passive (tier 3 would also correctly infer passive)", () => {
    const def = getFeatureDef("artificer-soul-of-artifice");
    expect(def?.actionType).toBe("passive");
    expect(def?.actionTypeSource).toBe("tagged");
  });

  it("right-tool-for-job is special (1-hour activity)", () => {
    expect(getFeatureDef("artificer-right-tool-for-job")?.actionType).toBe("special");
  });
});
