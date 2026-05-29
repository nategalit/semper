export type RollType = "attack" | "check" | "save" | "damage" | "other";
export type RollMode = "advantage" | "disadvantage" | null;

export interface RollEntry {
  id: string;
  characterId: string;
  rolledAt: string;
  label: string;
  /** Notation string, e.g. "1d20+5" or "2d6". */
  dice: string;
  /** Individual die results. For adv/dis, both dice are stored; index 0 is the kept result. */
  results: number[];
  modifier: number;
  total: number;
  mode: RollMode;
  rollType: RollType;
}

/** Client-only extension: tracks whether this roll has persisted to the server. */
export interface LocalRollEntry extends RollEntry {
  synced: boolean;
  syncError: boolean;
}
