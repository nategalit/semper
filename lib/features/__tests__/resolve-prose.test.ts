import { describe, it, expect } from "vitest";
import { resolveProse } from "../resolve-prose";
import type { Character } from "@/lib/types/character";
import type { ProseBySource } from "@/lib/features/types";

function makeCharacter(edition?: "2014" | "2024" | "mix"): Character {
  return {
    id: "test", userId: "u", name: "Test",
    level: 5, classId: "ID_CLASS_BARBARIAN", raceId: "ID_RACE_HUMAN",
    createdAt: "", updatedAt: "",
    data: {
      abilityScores: { str: 16, dex: 14, con: 16, int: 10, wis: 10, cha: 10 },
      currentHp: 40, maxHp: 40, tempHp: 0,
      hitDiceTotal: 5, hitDiceRemaining: 5,
      deathSaves: { successes: 0, failures: 0 },
      inspiration: false, xp: 0,
      currency: { cp: 0, sp: 0, ep: 0, gp: 0, pp: 0 },
      ...(edition !== undefined ? { edition } : {}),
    },
  };
}

const FULL_PROSE: ProseBySource = {
  fallback: "Fallback text.",
  srd: "SRD text.",
  phb24: "PHB24 text.",
  byAuroraImport: { "import-uuid-1": "Aurora text." },
};

describe("resolveProse — PHB24 edition", () => {
  it("returns phb24 when edition is 2024 and phb24 is present", () => {
    expect(resolveProse(FULL_PROSE, makeCharacter("2024"))).toBe("PHB24 text.");
  });

  it("returns fallback when edition is 2024 but phb24 is absent", () => {
    const prose: ProseBySource = { fallback: "Fallback text." };
    expect(resolveProse(prose, makeCharacter("2024"))).toBe("Fallback text.");
  });
});

describe("resolveProse — 2014 / SRD edition", () => {
  it("returns srd when edition is 2014 and srd is present", () => {
    expect(resolveProse(FULL_PROSE, makeCharacter("2014"))).toBe("SRD text.");
  });

  it("returns fallback when edition is 2014 but srd is absent", () => {
    const prose: ProseBySource = { fallback: "Fallback text.", phb24: "PHB24 text." };
    expect(resolveProse(prose, makeCharacter("2014"))).toBe("Fallback text.");
  });
});

describe("resolveProse — mix / undefined edition", () => {
  it("returns fallback when edition is mix", () => {
    expect(resolveProse(FULL_PROSE, makeCharacter("mix"))).toBe("Fallback text.");
  });

  it("returns fallback when edition is absent (undefined)", () => {
    expect(resolveProse(FULL_PROSE, makeCharacter())).toBe("Fallback text.");
  });
});

describe("resolveProse — byAuroraImport (dead code until Phase 8.7)", () => {
  it("returns fallback when byAuroraImport is populated but no character field keys it", () => {
    // Character has no auroraImportId field yet — byAuroraImport branch is unreachable.
    // This test documents expected fallback behaviour until that mechanism is added.
    expect(resolveProse(FULL_PROSE, makeCharacter("mix"))).toBe("Fallback text.");
  });
});
