export type AbilityKey = "str" | "dex" | "con" | "int" | "wis" | "cha";
export type ContentSource = "SRD" | "Aurora";

export interface SrdSubrace {
  id: string;
  name: string;
  description: string;
  abilityScoreBonuses: Partial<Record<AbilityKey, number>>;
  traits?: string[];
}

export interface SrdRace {
  id: string;
  name: string;
  description: string;
  speed: number;
  size: "Small" | "Medium";
  abilityScoreBonuses: Partial<Record<AbilityKey, number>>;
  /** Flexible ability bonuses the player picks (e.g. Half-Elf: +1 to any two abilities). */
  flexibleBonuses?: { count: number; amount: number };
  traits: string[];
  /** Fixed languages granted by this race (not language choices/picks). */
  languages?: string[];
  subraces: SrdSubrace[];
  subraceRequired: boolean;
  source?: ContentSource;
  /** Abbreviated book label (e.g. "PHB", "ERLW", "SRD") for per-book filtering. */
  sourceLabel?: string;
}

export interface SrdClass {
  id: string;
  name: string;
  description: string;
  hitDie: number;
  primaryAbilities: AbilityKey[];
  savingThrows: [AbilityKey, AbilityKey];
  armorProficiencies: string[];
  weaponProficiencies: string[];
  skillChoices: { from: string[]; count: number };
  /** Level at which this class picks a subclass (1, 2, or 3). */
  subclassUnlockLevel: 1 | 2 | 3;
  /** null for non-spellcasters. startsAtLevel: 1 for full casters, 2 for half-casters. */
  spellcasting: { ability: AbilityKey; startsAtLevel: number } | null;
  /** Normalized class feature names derived from grant IDs. Populated for Aurora classes; used by dedup. */
  featureKeys?: string[];
  /** Override ASI levels. Falls back to DEFAULT_ASI_LEVELS [4,8,12,16,19] when absent. */
  asiLevels?: number[];
  /** Feature names granted per level (populated for Aurora classes via adaptAuroraClass). */
  featuresByLevel?: Record<number, string[]>;
  /** Human-readable descriptions for non-charge class features, keyed by feature name. */
  featureDescriptions?: Record<string, string>;
  source?: ContentSource;
  sourceLabel?: string;
}

export interface SrdSubclass {
  id: string;
  classId: string;
  name: string;
  description: string;
  features: string[];
  /** Feature names granted per level. When present, the sheet renders a level-keyed list. */
  featuresByLevel?: Record<number, string[]>;
  /** Human-readable descriptions for subclass features, keyed by feature name. */
  featureDescriptions?: Record<string, string>;
  /** Spells always prepared by this subclass, unlocked at the given character level. */
  grantedSpells?: Array<{ id: string; level: number }>;
  source?: ContentSource;
  sourceLabel?: string;
}

export interface SrdBackground {
  id: string;
  name: string;
  description: string;
  skillProficiencies: [string, string];
  toolProficiency?: string;
  languages?: number;
  /** Named background feature (e.g. "Shelter of the Faithful"). Used by dedup. */
  featureName?: string;
  source?: ContentSource;
  sourceLabel?: string;
}
