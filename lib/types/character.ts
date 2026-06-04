import type { AbilityKey, SrdBackground, SrdClass, SrdRace, SrdSubrace } from "../content/srd/types";
export type { Edition } from "../content/edition-filter";

/** Per-level record written when the player takes a level-up. */
export interface LevelChoiceRecord {
  hpGained: number;
  asi?: Partial<Record<AbilityKey, number>>;
  featId?: string;
  subclassId?: string;
  fightingStyle?: string;
}

export interface AbilityScores {
  str: number;
  dex: number;
  con: number;
  int: number;
  wis: number;
  cha: number;
}

export interface DeathSaves {
  successes: number;
  failures: number;
}

export interface Currency {
  cp: number;
  sp: number;
  ep: number;
  gp: number;
  pp: number;
}

export interface SpellSlotLevel {
  total: number;
  remaining: number;
}

/** Full character state stored in the `data` JSONB column. */
export interface CharacterData {
  abilityScores: AbilityScores;
  currentHp: number;
  maxHp: number;
  tempHp: number;
  hitDiceTotal: number;
  hitDiceRemaining: number;
  deathSaves: DeathSaves;
  inspiration: boolean;
  xp: number;
  subraceId?: string;
  subclassId?: string;
  backgroundId?: string;
  alignment?: string;
  personalityTraits?: string[];
  ideal?: string;
  bond?: string;
  flaw?: string;
  currency: Currency;
  /** Keyed by spell level ("1"–"9"). Only present for spellcasting classes. */
  spellSlots?: Record<string, SpellSlotLevel>;
  /** Choices made during character creation, keyed by choice name. */
  choices?: Record<string, string | string[]>;
  /** Active conditions (e.g. "Frightened", "Prone"). Empty = no conditions. */
  conditions?: string[];
  /** Exhaustion level 0–6. Omitted or 0 = no exhaustion. */
  exhaustion?: number;
  /** Equipment items carried. */
  equipment?: EquipmentItem[];
  notes?: string;
  /** HP gained at each level, keyed by level number. */
  hpByLevel?: Record<number, number>;
  /** Choices made at each level (ASI, subclass, feat). */
  levelChoices?: Record<number, LevelChoiceRecord>;
  /** Current charges for limited-use class features, keyed by feature key. */
  featureCharges?: Record<string, number>;
  /**
   * All skill proficiencies — union of class picks, background grants, and racial bonuses.
   * Populated at character creation and updatable via ClassSkillPicker.
   * deriveStats falls back to background skills if absent (migration path).
   */
  skillProficiencies?: string[];
  /**
   * Spell IDs in the character's spellbook / repertoire.
   * All caster types use this field. For Wizards this is the spellbook;
   * for known-spell casters this is the full known list.
   */
  spellsKnown?: string[];
  /**
   * Spell IDs currently prepared for the day.
   * Only meaningful for prepared casters (Cleric, Druid, Paladin, Wizard).
   * Not used by known-spell casters (Bard, Ranger, Sorcerer, Warlock).
   */
  spellsPrepared?: string[];
  /** Full adapted race object stored at creation time. Falls back to SRD_RACES lookup. */
  resolvedRace?: SrdRace;
  /** Full adapted subrace object, if a subrace was selected. */
  resolvedSubrace?: SrdSubrace;
  /** Full adapted class object stored at creation time. Falls back to SRD_CLASSES lookup. */
  resolvedClass?: SrdClass;
  /** Full adapted background object stored at creation time. */
  resolvedBackground?: SrdBackground;
  /** Flexible ability score choices (e.g. Half-Elf +1×2), keyed by ability key. */
  abilityChoices?: Partial<Record<AbilityKey, number>>;
  /** Rules edition chosen at character creation. Defaults to "mix" when absent. */
  edition?: "2014" | "2024" | "mix";
}

export interface WeaponStats {
  damageDice: string;
  damageType: string;
  versatileDamageDice?: string;
  /** Explicit attack type — do not derive from category string in deriveStats. */
  attackType: "melee" | "ranged";
  range?: { normal: number; long: number };
  properties: string[];         // lowercase: "finesse", "light", "thrown", etc.
  category: string;             // lowercase: "simple melee", "martial ranged", etc.
  proficiencyId?: string;
}

export interface ArmorStats {
  baseAc: number;
  type: "light" | "medium" | "heavy";
  strReq?: number;
  stealthDisadvantage?: boolean;
}

export interface MagicGrantedFeature {
  key: string;
  label: string;
  maxCharges: number;
  rechargesOn: "short-rest" | "long-rest" | "dawn" | "dusk";
}

export interface MagicItemStats {
  rarity: string;
  requiresAttunement: boolean;
  attunementNote?: string;
  chargesMax?: number;
  chargesRecharge?: "dawn" | "dusk" | "short-rest" | "long-rest" | null;
  statModifiers?: Array<{ stat: string; value: number }>;
  grantedFeatures?: MagicGrantedFeature[];
}

export interface ToolStats {
  proficiencyId?: string;
  associatedAbility?: AbilityKey;
}

export interface EquipmentItem {
  /** Unique instance ID — use crypto.randomUUID() when creating. */
  id: string;
  name: string;
  quantity: number;
  weight?: number;
  /** Aurora element ID or "srd:<slug>" — catalog reference, not instance. */
  sourceId?: string;
  equipped?: boolean;
  equipSlot?: "armor" | "shield" | "mainhand" | "offhand" | "other";
  attuned?: boolean;
  consumable?: boolean;
  /** Runtime remaining charges; initialize from magic.chargesMax when adding item. */
  chargesRemaining?: number;
  notes?: string;
  /**
   * Manual enhancement bonus (+1/+2/+3) applied to a mundane weapon, armor, or shield.
   * Only set when the item has NO built-in combat bonus in magic.statModifiers.
   * Adds to attack + damage for weapons; adds to AC for armor/shields.
   */
  enhancement?: number;
  /** Wield mode for versatile weapons. Absent defaults to "2h" when off-hand is free, "1h" when occupied. */
  wieldMode?: "1h" | "2h";
  weapon?: WeaponStats;
  armor?: ArmorStats;
  magic?: MagicItemStats;
  tool?: ToolStats;
}

export const DEFAULT_CHARACTER_DATA: CharacterData = {
  abilityScores: { str: 10, dex: 10, con: 10, int: 10, wis: 10, cha: 10 },
  currentHp: 0,
  maxHp: 0,
  tempHp: 0,
  hitDiceTotal: 1,
  hitDiceRemaining: 1,
  deathSaves: { successes: 0, failures: 0 },
  inspiration: false,
  xp: 0,
  currency: { cp: 0, sp: 0, ep: 0, gp: 0, pp: 0 },
};

/** A character row as returned to the application layer (camelCase). */
export interface Character {
  id: string;
  userId: string;
  name: string;
  level: number;
  raceId: string | null;
  classId: string | null;
  createdAt: string;
  updatedAt: string;
  data: CharacterData;
}

export interface NewCharacterInput {
  name: string;
  level?: number;
  raceId?: string;
  classId?: string;
  data?: Partial<CharacterData>;
}

export interface UpdateCharacterInput {
  name?: string;
  level?: number;
  raceId?: string | null;
  classId?: string | null;
  /** Full replacement of the data column. Caller merges before calling. */
  data?: CharacterData;
}
