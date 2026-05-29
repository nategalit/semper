export type SpellSchool =
  | "abjuration"
  | "conjuration"
  | "divination"
  | "enchantment"
  | "evocation"
  | "illusion"
  | "necromancy"
  | "transmutation";

export interface SrdSpell {
  id: string;
  name: string;
  /** 0 = cantrip, 1–9 = spell level. */
  level: number;
  school: SpellSchool;
  /** Class IDs that have this on their spell list. */
  classes: string[];
  concentration: boolean;
  ritual: boolean;
  castingTime: string;
  range: string;
  duration: string;
  components: string;
}

/** Caster type determines how spells are managed. */
export type CasterType = "prepared" | "known";

/** Class IDs that prepare spells from their full class list. */
export const PREPARED_CASTER_IDS = new Set([
  "ID_CLASS_CLERIC",
  "ID_CLASS_DRUID",
  "ID_CLASS_PALADIN",
  "ID_CLASS_WIZARD",
  "ID_CLASS_ARTIFICER",
]);

/** Returns "prepared" or "known" for a given class ID. Returns undefined for non-casters. */
export function getCasterType(classId: string | null | undefined): CasterType | undefined {
  if (!classId) return undefined;
  if (PREPARED_CASTER_IDS.has(classId)) return "prepared";
  const KNOWN_CASTER_IDS = new Set([
    "ID_CLASS_BARD",
    "ID_CLASS_RANGER",
    "ID_CLASS_SORCERER",
    "ID_CLASS_WARLOCK",
  ]);
  if (KNOWN_CASTER_IDS.has(classId)) return "known";
  return undefined;
}

/**
 * Maximum spells prepared for prepared-caster classes.
 * Returns 0 for non-prepared casters.
 */
export function preparedSpellLimit(
  classId: string,
  level: number,
  abilityMod: number
): number {
  switch (classId) {
    case "ID_CLASS_CLERIC":
    case "ID_CLASS_DRUID":
      return Math.max(1, abilityMod + level);
    case "ID_CLASS_PALADIN":
      return Math.max(1, abilityMod + Math.floor(level / 2));
    case "ID_CLASS_WIZARD":
      return Math.max(1, abilityMod + level);
    case "ID_CLASS_ARTIFICER":
      return Math.max(1, abilityMod + Math.floor(level / 2));
    default:
      return 0;
  }
}

const CANTRIP_LIMIT: Record<string, number[]> = {
  // index = level - 1
  ID_CLASS_BARD:     [2,2,2,3,3,3,3,3,3,4,4,4,4,4,4,4,4,4,4,4],
  ID_CLASS_CLERIC:   [3,3,3,4,4,4,4,4,4,5,5,5,5,5,5,5,5,5,5,5],
  ID_CLASS_DRUID:    [2,2,2,3,3,3,3,3,3,4,4,4,4,4,4,4,4,4,4,4],
  ID_CLASS_SORCERER: [4,4,4,5,5,5,5,5,5,6,6,6,6,6,6,6,6,6,6,6],
  ID_CLASS_WARLOCK:  [2,2,2,3,3,3,3,3,3,4,4,4,4,4,4,4,4,4,4,4],
  ID_CLASS_WIZARD:   [3,3,3,4,4,4,4,4,4,5,5,5,5,5,5,5,5,5,5,5],
  // Paladin and Ranger have no base cantrips.
  ID_CLASS_ARTIFICER: [2,2,2,2,2,2,2,2,2,3,3,3,3,4,4,4,4,4,4,4],
};

/** Max cantrips known at a given character level. Returns 0 if the class gets no cantrips. */
export function cantripLimit(classId: string, level: number): number {
  const table = CANTRIP_LIMIT[classId];
  if (!table) return 0;
  return table[Math.min(level, 20) - 1] ?? 0;
}

const MAX_SPELL_LEVEL: Record<string, number[]> = {
  // index = level - 1
  ID_CLASS_BARD:     [1,1,2,2,3,3,4,4,5,5,6,6,7,7,8,8,9,9,9,9],
  ID_CLASS_CLERIC:   [1,1,2,2,3,3,4,4,5,5,6,6,7,7,8,8,9,9,9,9],
  ID_CLASS_DRUID:    [1,1,2,2,3,3,4,4,5,5,6,6,7,7,8,8,9,9,9,9],
  ID_CLASS_SORCERER: [1,1,2,2,3,3,4,4,5,5,6,6,7,7,8,8,9,9,9,9],
  ID_CLASS_WIZARD:   [1,1,2,2,3,3,4,4,5,5,6,6,7,7,8,8,9,9,9,9],
  ID_CLASS_PALADIN:  [0,1,1,1,2,2,2,2,3,3,3,3,4,4,4,4,5,5,5,5],
  ID_CLASS_RANGER:   [0,1,1,1,2,2,2,2,3,3,3,3,4,4,4,4,5,5,5,5],
  ID_CLASS_WARLOCK:  [1,1,2,2,3,3,4,4,5,5,5,5,5,5,5,5,5,5,5,5],
  ID_CLASS_ARTIFICER:[1,1,1,1,2,2,2,2,3,3,3,3,4,4,4,4,5,5,5,5],
};

/** Highest spell level a caster can cast at a given character level. Returns 0 for non-casters. */
export function maxCastableSpellLevel(classId: string, level: number): number {
  const table = MAX_SPELL_LEVEL[classId];
  if (!table) return 0;
  return table[Math.min(level, 20) - 1] ?? 0;
}

/**
 * Maximum spells known for known-caster classes at a given level.
 * Returns 0 for non-known casters or levels with no progression.
 */
export function knownSpellLimit(classId: string, level: number): number {
  const tables: Record<string, number[]> = {
    // index = level-1
    ID_CLASS_BARD:     [4,5,6,7,8,9,10,11,12,14,15,15,16,18,19,19,20,22,22,22],
    ID_CLASS_RANGER:   [0,2,3,3,4,4,5,5,6,6,7,7,8,8,9,9,10,10,11,11],
    ID_CLASS_SORCERER: [2,3,4,5,6,7,8,9,10,11,12,12,13,13,14,14,15,15,15,15],
    ID_CLASS_WARLOCK:  [2,3,4,5,6,7,8,9,10,10,11,11,12,12,13,13,14,14,14,15],
  };
  const table = tables[classId];
  if (!table) return 0;
  return table[Math.min(level, 20) - 1] ?? 0;
}
