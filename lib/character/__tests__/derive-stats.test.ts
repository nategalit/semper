// Integration tests for the two-pass deriveStats restructuring (chunk 10a).
// Covers: ac-base, speed, initiative-advantage, scaling-stat, save-prof.
// Regression: Barbarian/Monk Unarmored Defense after deleting hardcoded class-ID checks.

import { describe, it, expect } from "vitest";
import { deriveStats } from "@/lib/character/calc";
import type { Character } from "@/lib/types/character";
import type { SrdClass, SrdRace } from "@/lib/content/srd";

// ── Minimal factories ─────────────────────────────────────────────────────────

function makeChar(
  opts: {
    level?: number;
    classId?: string;
    data?: Partial<Character["data"]>;
  } = {}
): Character {
  return {
    id: "test",
    userId: "u",
    name: "Test",
    level: opts.level ?? 1,
    classId: opts.classId ?? "ID_CLASS_FIGHTER",
    raceId: "ID_RACE_HUMAN",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    data: {
      abilityScores: { str: 10, dex: 10, con: 10, int: 10, wis: 10, cha: 10 },
      currentHp: 10,
      maxHp: 10,
      tempHp: 0,
      hitDiceTotal: opts.level ?? 1,
      hitDiceRemaining: opts.level ?? 1,
      deathSaves: { successes: 0, failures: 0 },
      inspiration: false,
      xp: 0,
      currency: { cp: 0, sp: 0, ep: 0, gp: 0, pp: 0 },
      ...opts.data,
    },
  };
}

function makeSrdClass(id: string, saves: [string, string]): SrdClass {
  return {
    id,
    name: id,
    description: "",
    hitDie: 8,
    primaryAbilities: ["str"],
    savingThrows: saves as SrdClass["savingThrows"],
    armorProficiencies: [],
    weaponProficiencies: [],
    skillChoices: { from: [], count: 0 },
    subclassUnlockLevel: 3,
    spellcasting: null,
  };
}

function makeRace(speed = 30): SrdRace {
  return {
    id: "ID_RACE_HUMAN",
    name: "Human",
    description: "",
    speed,
    abilityBonuses: [],
    size: "Medium",
    traits: [],
    languages: [],
    subraces: [],
  } as unknown as SrdRace;
}

const BARBARIAN_CLASS = makeSrdClass("ID_CLASS_BARBARIAN", ["str", "con"]);
const MONK_CLASS      = makeSrdClass("ID_CLASS_MONK",      ["str", "dex"]);
const ROGUE_CLASS     = makeSrdClass("ID_CLASS_ROGUE",     ["dex", "int"]);
const FIGHTER_CLASS   = makeSrdClass("ID_CLASS_FIGHTER",   ["str", "con"]);
const HUMAN_RACE      = makeRace(30);

// ── Unarmored Defense: Barbarian (ac-base 10+dex+con) ─────────────────────────

describe("Barbarian Unarmored Defense regression (chunk 10a)", () => {
  it("AC = 10 + DEX + CON when not wearing armor", () => {
    const char = makeChar({
      classId: "ID_CLASS_BARBARIAN",
      data: { abilityScores: { str: 10, dex: 14, con: 16, int: 10, wis: 10, cha: 10 } },
    });
    const { armorClass, acBreakdown } = deriveStats(char, BARBARIAN_CLASS, HUMAN_RACE, undefined);
    expect(armorClass).toBe(15); // 10 + 2 (DEX) + 3 (CON)
    expect(acBreakdown.components).toHaveLength(1);
    expect(acBreakdown.components[0].label).toBe("Unarmored Defense (DEX + CON)");
    expect(acBreakdown.components[0].value).toBe(15);
  });

  it("falls back to armor base AC when armor is equipped", () => {
    const char = makeChar({
      classId: "ID_CLASS_BARBARIAN",
      data: {
        abilityScores: { str: 10, dex: 14, con: 16, int: 10, wis: 10, cha: 10 },
        equipment: [
          { id: "1", name: "Chain Mail", quantity: 1, equipped: true, equipSlot: "armor",
            armor: { baseAc: 16, type: "heavy" } },
        ],
      },
    });
    const { armorClass, acBreakdown } = deriveStats(char, BARBARIAN_CLASS, HUMAN_RACE, undefined);
    expect(armorClass).toBe(16);
    expect(acBreakdown.components[0].label).toBe("Chain Mail");
    expect(acBreakdown.components.map(c => c.label)).not.toContain("Unarmored Defense (DEX + CON)");
  });
});

// ── Unarmored Defense: Monk (ac-base 10+dex+wis) ─────────────────────────────

describe("Monk Unarmored Defense regression (chunk 10a)", () => {
  it("AC = 10 + DEX + WIS when not wearing armor", () => {
    const char = makeChar({
      level: 1,
      classId: "ID_CLASS_MONK",
      data: { abilityScores: { str: 10, dex: 14, con: 10, int: 10, wis: 12, cha: 10 } },
    });
    const { armorClass, acBreakdown } = deriveStats(char, MONK_CLASS, HUMAN_RACE, undefined);
    expect(armorClass).toBe(13); // 10 + 2 (DEX) + 1 (WIS)
    expect(acBreakdown.components).toHaveLength(1);
    expect(acBreakdown.components[0].label).toBe("Unarmored Defense (DEX + WIS)");
    expect(acBreakdown.components[0].value).toBe(13);
  });
});

// ── Default unarmored (no Unarmored Defense feature) ─────────────────────────

describe("default unarmored AC (no Unarmored Defense)", () => {
  it("AC = 10 + DEX for a Fighter with no armor", () => {
    const char = makeChar({
      classId: "ID_CLASS_FIGHTER",
      data: { abilityScores: { str: 10, dex: 14, con: 10, int: 10, wis: 10, cha: 10 } },
    });
    const { armorClass } = deriveStats(char, FIGHTER_CLASS, HUMAN_RACE, undefined);
    expect(armorClass).toBe(12); // 10 + 2
  });
});

// ── Defense fighting style: additive AC ───────────────────────────────────────

describe("Defense fighting style ac effect (chunk 10a)", () => {
  it("+1 AC when wearing armor with Defense feat active", () => {
    // Breastplate (medium, AC 14), DEX 10 (mod 0) → AC = 14 + 0 (DEX capped 2) + 1 Defense = 15
    const char = makeChar({
      classId: "ID_CLASS_FIGHTER",
      data: {
        abilityScores: { str: 10, dex: 10, con: 10, int: 10, wis: 10, cha: 10 },
        levelChoices: { 1: { hpGained: 6, featId: "defense" } },
        equipment: [
          { id: "1", name: "Breastplate", quantity: 1, equipped: true, equipSlot: "armor",
            armor: { baseAc: 14, type: "medium" } },
        ],
      },
    });
    const { armorClass, acBreakdown } = deriveStats(char, FIGHTER_CLASS, HUMAN_RACE, undefined);
    expect(armorClass).toBe(15);
    expect(acBreakdown.components.some(c => c.label === "Defense" && c.value === 1)).toBe(true);
  });

  it("no +1 AC when not wearing armor (Defense condition not met)", () => {
    const char = makeChar({
      classId: "ID_CLASS_FIGHTER",
      data: {
        abilityScores: { str: 10, dex: 10, con: 10, int: 10, wis: 10, cha: 10 },
        levelChoices: { 1: { hpGained: 6, featId: "defense" } },
      },
    });
    const { armorClass, acBreakdown } = deriveStats(char, FIGHTER_CLASS, HUMAN_RACE, undefined);
    expect(armorClass).toBe(10);
    expect(acBreakdown.components.map(c => c.label)).not.toContain("Defense");
  });
});

// ── Fast Movement: speed bonus ─────────────────────────────────────────────────

describe("Barbarian Fast Movement speed effect (chunk 10a)", () => {
  it("speed = 40 at L5 without heavy armor", () => {
    const char = makeChar({ level: 5, classId: "ID_CLASS_BARBARIAN" });
    const { speed, speedBreakdown } = deriveStats(char, BARBARIAN_CLASS, HUMAN_RACE, undefined);
    expect(speed).toBe(40);
    expect(speedBreakdown.components.some(c => c.label === "Fast Movement" && c.value === 10)).toBe(true);
  });

  it("speed = 30 at L5 when heavy armor is equipped (condition blocked)", () => {
    const char = makeChar({
      level: 5,
      classId: "ID_CLASS_BARBARIAN",
      data: {
        equipment: [
          { id: "1", name: "Plate", quantity: 1, equipped: true, equipSlot: "armor",
            armor: { baseAc: 18, type: "heavy" } },
        ],
      },
    });
    const { speed, speedBreakdown } = deriveStats(char, BARBARIAN_CLASS, HUMAN_RACE, undefined);
    expect(speed).toBe(30);
    expect(speedBreakdown.components.map(c => c.label)).not.toContain("Fast Movement");
  });

  it("no Fast Movement bonus at L4 (feature unlocks at L5)", () => {
    const char = makeChar({ level: 4, classId: "ID_CLASS_BARBARIAN" });
    const { speed } = deriveStats(char, BARBARIAN_CLASS, HUMAN_RACE, undefined);
    expect(speed).toBe(30);
  });
});

// ── Feral Instinct: initiative-advantage ─────────────────────────────────────

describe("Barbarian Feral Instinct initiative-advantage (chunk 10a)", () => {
  it("initiativeAdvantage = true at L7", () => {
    const char = makeChar({ level: 7, classId: "ID_CLASS_BARBARIAN" });
    const { initiativeAdvantage } = deriveStats(char, BARBARIAN_CLASS, HUMAN_RACE, undefined);
    expect(initiativeAdvantage).toBe(true);
  });

  it("initiativeAdvantage = false at L6 (Feral Instinct not yet unlocked)", () => {
    const char = makeChar({ level: 6, classId: "ID_CLASS_BARBARIAN" });
    const { initiativeAdvantage } = deriveStats(char, BARBARIAN_CLASS, HUMAN_RACE, undefined);
    expect(initiativeAdvantage).toBe(false);
  });
});

// ── Monk martial arts die (scaling-stat) ──────────────────────────────────────

describe("Monk Martial Arts die scaling-stat (chunk 10a)", () => {
  it("martialArtsDie = 'd6' at L1", () => {
    const char = makeChar({ level: 1, classId: "ID_CLASS_MONK" });
    const { martialArtsDie } = deriveStats(char, MONK_CLASS, HUMAN_RACE, undefined);
    expect(martialArtsDie).toBe("d6");
  });

  it("martialArtsDie = 'd8' at L5", () => {
    const char = makeChar({ level: 5, classId: "ID_CLASS_MONK" });
    const { martialArtsDie } = deriveStats(char, MONK_CLASS, HUMAN_RACE, undefined);
    expect(martialArtsDie).toBe("d8");
  });

  it("martialArtsDie = 'd12' at L17", () => {
    const char = makeChar({ level: 17, classId: "ID_CLASS_MONK" });
    const { martialArtsDie } = deriveStats(char, MONK_CLASS, HUMAN_RACE, undefined);
    expect(martialArtsDie).toBe("d12");
  });
});

// ── Rogue sneak attack die (scaling-stat) ─────────────────────────────────────

describe("Rogue Sneak Attack die scaling-stat (chunk 10a)", () => {
  it("sneakAttackDie = '1d6' at L1", () => {
    const char = makeChar({ level: 1, classId: "ID_CLASS_ROGUE" });
    const { sneakAttackDie } = deriveStats(char, ROGUE_CLASS, HUMAN_RACE, undefined);
    expect(sneakAttackDie).toBe("1d6");
  });

  it("sneakAttackDie = '3d6' at L5", () => {
    const char = makeChar({ level: 5, classId: "ID_CLASS_ROGUE" });
    const { sneakAttackDie } = deriveStats(char, ROGUE_CLASS, HUMAN_RACE, undefined);
    expect(sneakAttackDie).toBe("3d6");
  });
});

// ── Monk Disciplined Survivor: save-prof all (chunk 10a Pass 1) ───────────────

describe("Monk Disciplined Survivor save-prof all (chunk 10a)", () => {
  it("WIS save is proficient at L14 (not a class save for Monk)", () => {
    const char = makeChar({ level: 14, classId: "ID_CLASS_MONK" });
    const { savingThrows } = deriveStats(char, MONK_CLASS, HUMAN_RACE, undefined);
    // Monk class saves are STR + DEX. WIS proficiency comes from Disciplined Survivor.
    expect(savingThrows.wis.proficient).toBe(true);
    expect(savingThrows.con.proficient).toBe(true); // also from Disciplined Survivor
    expect(savingThrows.str.proficient).toBe(true); // class save
    expect(savingThrows.dex.proficient).toBe(true); // class save
  });

  it("WIS save is NOT proficient at L13 (Disciplined Survivor unlocks at L14)", () => {
    const char = makeChar({ level: 13, classId: "ID_CLASS_MONK" });
    const { savingThrows } = deriveStats(char, MONK_CLASS, HUMAN_RACE, undefined);
    expect(savingThrows.wis.proficient).toBe(false);
  });
});
