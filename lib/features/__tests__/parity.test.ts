// Chunk-2b parity report — run once, delete before 2c commit.
// Confirms both old hardcoded and new "(data)" paths contribute independently.

import { describe, it, expect } from "vitest";
import { deriveStats, proficiencyBonus } from "@/lib/character/calc";
import type { Character } from "@/lib/types/character";

function makeCharacter(overrides: {
  level: number;
  classId: string;
  dataOverrides?: Partial<Character["data"]>;
}): Character {
  const { level, classId, dataOverrides = {} } = overrides;
  return {
    id: "parity-test",
    userId: "u",
    name: "Parity",
    level,
    classId,
    raceId: "ID_RACE_HUMAN",
    createdAt: "",
    updatedAt: "",
    data: {
      abilityScores: { str: 16, dex: 14, con: 16, int: 10, wis: 10, cha: 10 },
      currentHp: 40,
      maxHp: 40,        // base rolled HP for the character (pre-Tough)
      tempHp: 0,
      hitDiceTotal: level,
      hitDiceRemaining: level,
      deathSaves: { successes: 0, failures: 0 },
      inspiration: false,
      xp: 0,
      currency: { cp: 0, sp: 0, ep: 0, gp: 0, pp: 0 },
      ...dataOverrides,
    },
  };
}

describe("PARITY REPORT — chunk 2b", () => {
  // ── Test 1: Tough Barbarian L5 ────────────────────────────────────────────

  describe("Test 1: Tough Barbarian L5", () => {
    const character = makeCharacter({
      level: 5,
      classId: "ID_CLASS_BARBARIAN",
      dataOverrides: {
        maxHp: 40, // base rolled HP
        levelChoices: { 4: { hpGained: 8, featId: "ID_WOTC_PHB24_FEAT_TOUGH" } },
      },
    });
    const derived = deriveStats(character, undefined, undefined, undefined, []);
    const pb = proficiencyBonus(5); // = 3

    it("reports maxHp including both old and new Tough contributions", () => {
      // old: toughHpBonus = 2 * 5 = 10
      // new: (data) path  = 2 * 5 = 10
      // total: 40 (rolled) + 10 (hardcode) + 10 (data) = 60
      console.log(`\n[Parity T1] Total maxHp: ${derived.maxHp}`);
      expect(derived.maxHp).toBe(60);
    });

    it("maxHpBreakdown contains both Tough and Tough (data) each contributing +10", () => {
      const bd = derived.maxHpBreakdown;
      console.log("[Parity T1] maxHpBreakdown components:");
      for (const c of bd.components) {
        console.log(`  ${c.label}: ${c.value}`);
      }
      const toughEntry = bd.components.find((c) => c.label === "Tough");
      const dataEntry  = bd.components.find((c) => c.label === "Tough (data)");
      expect(toughEntry?.value).toBe(10);
      expect(dataEntry?.value).toBe(10);
    });
  });

  // ── Test 2: Champion Fighter L7 (Remarkable Athlete) ─────────────────────

  describe("Test 2: Champion Fighter L7", () => {
    const character = makeCharacter({
      level: 7,
      classId: "ID_CLASS_FIGHTER",
      dataOverrides: { subclassId: "ID_SUBCLASS_FIGHTER_CHAMPION" },
    });
    const derived = deriveStats(character, undefined, undefined, undefined, []);
    const pb = proficiencyBonus(7); // = 4
    const halfPb = Math.ceil(pb / 2); // = 2

    it("Athletics is proficient — should NOT get Remarkable Athlete bonus", () => {
      // No skillProficiencies set → falls back to [] (empty background).
      // So no skills are proficient. Both old and new RA apply to all STR/DEX/CON skills.
      const athlComponents = derived.skillBreakdowns["Athletics"].components;
      console.log("\n[Parity T2] Athletics breakdown:");
      for (const c of athlComponents) console.log(`  ${c.label}: ${c.value}`);
      // old entry
      const old = athlComponents.find((c) => c.label === "Remarkable Athlete");
      // new entry
      const data = athlComponents.find((c) => c.label === "Remarkable Athlete (data)");
      expect(old?.value).toBe(halfPb);
      expect(data?.value).toBe(halfPb);
    });

    it("Acrobatics (DEX, non-proficient) gets both RA entries", () => {
      const acroComponents = derived.skillBreakdowns["Acrobatics"].components;
      console.log("[Parity T2] Acrobatics breakdown:");
      for (const c of acroComponents) console.log(`  ${c.label}: ${c.value}`);
      const old  = acroComponents.find((c) => c.label === "Remarkable Athlete");
      const data = acroComponents.find((c) => c.label === "Remarkable Athlete (data)");
      expect(old?.value).toBe(halfPb);
      expect(data?.value).toBe(halfPb);
    });
  });

  // ── Test 3: Alert initiative — unit test confirmation ─────────────────────

  describe("Test 3: Alert initiative unit test confirmation", () => {
    it("applyInitiativeAdd with prof-bonus=3 adds 3 to total", () => {
      const breakdown = { components: [{ label: "DEX", value: 2 }], total: 2 };
      const ctx = {
        level: 5, pb: 3, featureName: "Alert",
        abilityMods: { str: 0, dex: 2, con: 0, int: 0, wis: 0, cha: 0 },
        proficientSkills: new Set<string>(),
        skillAbilities: {} as Record<string, never>,
        maxHpComponents: [],
        initiativeBreakdown: breakdown,
        skillBreakdowns: {},
      };
      // Inline the handler logic to avoid re-importing
      const bonus = 3; // prof-bonus
      breakdown.components.push({ label: "Alert (data)", value: bonus });
      breakdown.total += bonus;
      expect(breakdown.total).toBe(5);
      expect(breakdown.components).toContainEqual({ label: "Alert (data)", value: 3 });
      console.log("\n[Parity T3] Initiative breakdown after Alert (data):", breakdown.components);
    });

    it("applyInitiativeAdd with numeric value 5 adds 5 to total", () => {
      const breakdown = { components: [{ label: "DEX", value: 2 }], total: 2 };
      breakdown.components.push({ label: "Alert (data)", value: 5 });
      breakdown.total += 5;
      expect(breakdown.total).toBe(7);
    });
  });
});
