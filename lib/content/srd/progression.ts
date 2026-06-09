import type { AbilityKey } from "./types";
import type { SpellSlotLevel } from "@/lib/types/character";

// ─── Spell slot tables ────────────────────────────────────────────────────────

/** Full-caster spell slots (Bard, Cleric, Druid, Sorcerer, Wizard) */
const FULL_CASTER_SLOTS: Record<number, number[]> = {
  //          1  2  3  4  5  6  7  8  9
  1:  [2, 0, 0, 0, 0, 0, 0, 0, 0],
  2:  [3, 0, 0, 0, 0, 0, 0, 0, 0],
  3:  [4, 2, 0, 0, 0, 0, 0, 0, 0],
  4:  [4, 3, 0, 0, 0, 0, 0, 0, 0],
  5:  [4, 3, 2, 0, 0, 0, 0, 0, 0],
  6:  [4, 3, 3, 0, 0, 0, 0, 0, 0],
  7:  [4, 3, 3, 1, 0, 0, 0, 0, 0],
  8:  [4, 3, 3, 2, 0, 0, 0, 0, 0],
  9:  [4, 3, 3, 3, 1, 0, 0, 0, 0],
  10: [4, 3, 3, 3, 2, 0, 0, 0, 0],
  11: [4, 3, 3, 3, 2, 1, 0, 0, 0],
  12: [4, 3, 3, 3, 2, 1, 0, 0, 0],
  13: [4, 3, 3, 3, 2, 1, 1, 0, 0],
  14: [4, 3, 3, 3, 2, 1, 1, 0, 0],
  15: [4, 3, 3, 3, 2, 1, 1, 1, 0],
  16: [4, 3, 3, 3, 2, 1, 1, 1, 0],
  17: [4, 3, 3, 3, 2, 1, 1, 1, 1],
  18: [4, 3, 3, 3, 3, 1, 1, 1, 1],
  19: [4, 3, 3, 3, 3, 2, 1, 1, 1],
  20: [4, 3, 3, 3, 3, 2, 2, 1, 1],
};

/** One-third caster spell slots (Eldritch Knight, Arcane Trickster) — slots start at level 3 */
const ONE_THIRD_CASTER_SLOTS: Record<number, number[]> = {
  //          1  2  3  4
  1:  [0, 0, 0, 0],
  2:  [0, 0, 0, 0],
  3:  [2, 0, 0, 0],
  4:  [3, 0, 0, 0],
  5:  [3, 0, 0, 0],
  6:  [3, 0, 0, 0],
  7:  [4, 2, 0, 0],
  8:  [4, 2, 0, 0],
  9:  [4, 2, 0, 0],
  10: [4, 3, 0, 0],
  11: [4, 3, 0, 0],
  12: [4, 3, 0, 0],
  13: [4, 3, 2, 0],
  14: [4, 3, 2, 0],
  15: [4, 3, 2, 0],
  16: [4, 3, 3, 0],
  17: [4, 3, 3, 0],
  18: [4, 3, 3, 0],
  19: [4, 3, 3, 1],
  20: [4, 3, 3, 1],
};

/** Half-caster spell slots (Paladin, Ranger) — slots start at level 2 */
const HALF_CASTER_SLOTS: Record<number, number[]> = {
  //          1  2  3  4  5  6  7  8  9
  1:  [0, 0, 0, 0, 0, 0, 0, 0, 0],
  2:  [2, 0, 0, 0, 0, 0, 0, 0, 0],
  3:  [3, 0, 0, 0, 0, 0, 0, 0, 0],
  4:  [3, 0, 0, 0, 0, 0, 0, 0, 0],
  5:  [4, 2, 0, 0, 0, 0, 0, 0, 0],
  6:  [4, 2, 0, 0, 0, 0, 0, 0, 0],
  7:  [4, 3, 0, 0, 0, 0, 0, 0, 0],
  8:  [4, 3, 0, 0, 0, 0, 0, 0, 0],
  9:  [4, 3, 2, 0, 0, 0, 0, 0, 0],
  10: [4, 3, 2, 0, 0, 0, 0, 0, 0],
  11: [4, 3, 3, 0, 0, 0, 0, 0, 0],
  12: [4, 3, 3, 0, 0, 0, 0, 0, 0],
  13: [4, 3, 3, 1, 0, 0, 0, 0, 0],
  14: [4, 3, 3, 1, 0, 0, 0, 0, 0],
  15: [4, 3, 3, 2, 0, 0, 0, 0, 0],
  16: [4, 3, 3, 2, 0, 0, 0, 0, 0],
  17: [4, 3, 3, 3, 1, 0, 0, 0, 0],
  18: [4, 3, 3, 3, 1, 0, 0, 0, 0],
  19: [4, 3, 3, 3, 2, 0, 0, 0, 0],
  20: [4, 3, 3, 3, 2, 0, 0, 0, 0],
};

/**
 * Warlock pact magic: [slotsPerRest, slotLevel]
 * Index 0 = slot count, index 1 = slot level (all slots same level for Warlock)
 */
const WARLOCK_SLOTS: Record<number, [count: number, slotLevel: number]> = {
  1:  [1, 1],
  2:  [2, 1],
  3:  [2, 2],
  4:  [2, 2],
  5:  [2, 3],
  6:  [2, 3],
  7:  [2, 4],
  8:  [2, 4],
  9:  [2, 5],
  10: [2, 5],
  11: [3, 5],
  12: [3, 5],
  13: [3, 5],
  14: [3, 5],
  15: [3, 5],
  16: [3, 5],
  17: [4, 5],
  18: [4, 5],
  19: [4, 5],
  20: [4, 5],
};

// ─── ASI level tables ─────────────────────────────────────────────────────────

export const DEFAULT_ASI_LEVELS = [4, 8, 12, 16, 19];

export const ASI_LEVELS_BY_CLASS: Record<string, number[]> = {
  ID_CLASS_FIGHTER: [4, 6, 8, 12, 14, 16, 19],
  ID_CLASS_ROGUE:   [4, 8, 10, 12, 16, 19],
};

export function getAsiLevels(classId: string): number[] {
  return ASI_LEVELS_BY_CLASS[classId] ?? DEFAULT_ASI_LEVELS;
}

// ─── Spell slot helpers ───────────────────────────────────────────────────────

/**
 * Returns the spell slot Record for the given class/level, merging existing
 * remaining counts so slots already spent at lower levels aren't reset.
 */
export function getSpellSlotsForClass(
  classId: string,
  spellcasting: { ability: AbilityKey; startsAtLevel: number } | null,
  targetLevel: number,
  currentSlots: Record<string, SpellSlotLevel> | undefined
): Record<string, SpellSlotLevel> | undefined {
  if (!spellcasting) return undefined;

  if (classId === "ID_CLASS_WARLOCK") {
    const [count, slotLevel] = WARLOCK_SLOTS[targetLevel] ?? [0, 1];
    if (count === 0) return undefined;
    const key = String(slotLevel);
    const prev = currentSlots?.[key];
    const total = count;
    const remaining = prev ? Math.min(prev.remaining, total) : total;
    return { [key]: { total, remaining } };
  }

  const table =
    spellcasting.startsAtLevel === 1 ? FULL_CASTER_SLOTS
    : spellcasting.startsAtLevel === 3 ? ONE_THIRD_CASTER_SLOTS
    : HALF_CASTER_SLOTS;
  const row = table[targetLevel];
  if (!row) return undefined;

  const result: Record<string, SpellSlotLevel> = {};
  row.forEach((total, idx) => {
    if (total === 0) return;
    const key = String(idx + 1);
    const prev = currentSlots?.[key];
    const remaining = prev ? Math.min(prev.remaining, total) : total;
    result[key] = { total, remaining };
  });
  return Object.keys(result).length > 0 ? result : undefined;
}

// ─── HP helpers ──────────────────────────────────────────────────────────────

export function averageHpPerLevel(hitDie: number, conMod: number): number {
  return Math.floor(hitDie / 2) + 1 + conMod;
}
