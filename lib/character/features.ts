import type { AbilityKey } from "@/lib/content/srd";

export interface FeatureDef {
  key: string;
  label: string;
  /** Returns max charges for the given level and ability mods. Return 0 if not yet available. */
  maxCharges: (level: number, abilityMods: Partial<Record<AbilityKey, number>>) => number;
  /**
   * When this feature's charges are restored.
   * Can be a function of level (e.g. Bardic Inspiration changes at level 5).
   */
  rechargesOn: "short" | "long" | ((level: number) => "short" | "long");
}

export function resolveRechargesOn(def: FeatureDef, level: number): "short" | "long" {
  return typeof def.rechargesOn === "function" ? def.rechargesOn(level) : def.rechargesOn;
}

/** Sentinel value for unlimited uses (e.g. Barbarian Rage at level 20). */
export const UNLIMITED = 999;

const CLASS_FEATURES: Record<string, FeatureDef[]> = {
  ID_CLASS_BARBARIAN: [
    {
      key: "rage",
      label: "Rage",
      maxCharges: (level) => {
        if (level >= 20) return UNLIMITED;
        if (level >= 17) return 6;
        if (level >= 12) return 5;
        if (level >= 6)  return 4;
        if (level >= 3)  return 3;
        return 2;
      },
      rechargesOn: "long",
    },
  ],

  ID_CLASS_BARD: [
    {
      key: "bardic_inspiration",
      label: "Bardic Inspiration",
      // Charges = CHA modifier (minimum 1)
      maxCharges: (_level, mods) => Math.max(mods.cha ?? 1, 1),
      // Font of Inspiration (level 5): recharges on short rest
      rechargesOn: (level) => (level >= 5 ? "short" : "long"),
    },
  ],

  ID_CLASS_CLERIC: [
    {
      key: "channel_divinity",
      label: "Channel Divinity",
      maxCharges: (level) => {
        if (level < 2)   return 0;
        if (level >= 18) return 3;
        if (level >= 6)  return 2;
        return 1;
      },
      rechargesOn: "short",
    },
  ],

  ID_CLASS_DRUID: [
    {
      key: "wild_shape",
      label: "Wild Shape",
      maxCharges: (level) => (level >= 2 ? 2 : 0),
      rechargesOn: "short",
    },
  ],

  ID_CLASS_FIGHTER: [
    {
      key: "second_wind",
      label: "Second Wind",
      maxCharges: () => 1,
      rechargesOn: "short",
    },
    {
      key: "action_surge",
      label: "Action Surge",
      maxCharges: (level) => {
        if (level < 2)   return 0;
        return level >= 17 ? 2 : 1;
      },
      rechargesOn: "short",
    },
  ],

  ID_CLASS_MONK: [
    {
      key: "ki_points",
      label: "Ki Points",
      maxCharges: (level) => (level >= 2 ? level : 0),
      rechargesOn: "short",
    },
  ],

  ID_CLASS_PALADIN: [
    {
      key: "lay_on_hands",
      label: "Lay on Hands",
      // Pool of HP, not individual charges — tracked as remaining pool points
      maxCharges: (level) => level * 5,
      rechargesOn: "long",
    },
    {
      key: "channel_divinity",
      label: "Channel Divinity",
      maxCharges: (level) => (level >= 3 ? 1 : 0),
      rechargesOn: "short",
    },
  ],

  // Ranger: no base class resource features; spell slots cover their resources
  ID_CLASS_RANGER: [],

  // Rogue: no limited-use resource features at base class
  ID_CLASS_ROGUE: [],

  ID_CLASS_SORCERER: [
    {
      key: "sorcery_points",
      label: "Sorcery Points",
      maxCharges: (level) => (level >= 2 ? level : 0),
      rechargesOn: "long",
    },
  ],

  // Warlock: Pact Magic spell slots recharge on short rest.
  // Slots are tracked in spellSlots (not featureCharges); the short-rest action
  // handles Warlock slot restoration via classId check.
  ID_CLASS_WARLOCK: [],

  ID_CLASS_WIZARD: [
    {
      key: "arcane_recovery",
      label: "Arcane Recovery",
      maxCharges: () => 1,
      rechargesOn: "long",
    },
  ],
};

/**
 * Returns the feature definitions for a class at the given level,
 * filtered to only those with maxCharges > 0 at that level.
 */
export function getClassFeatures(
  classId: string | null | undefined,
  level: number,
  abilityMods: Partial<Record<AbilityKey, number>> = {}
): FeatureDef[] {
  const defs = CLASS_FEATURES[classId ?? ""] ?? [];
  return defs.filter((def) => def.maxCharges(level, abilityMods) > 0);
}

/**
 * Returns the max charges for a feature, resolving the current level.
 * Returns 0 if the feature isn't available.
 */
export function maxChargesFor(
  def: FeatureDef,
  level: number,
  abilityMods: Partial<Record<AbilityKey, number>> = {}
): number {
  return def.maxCharges(level, abilityMods);
}

/**
 * Returns the current charges for a feature from stored data,
 * defaulting to max if no value has been set yet.
 */
export function currentChargesFor(
  def: FeatureDef,
  level: number,
  abilityMods: Partial<Record<AbilityKey, number>>,
  featureCharges: Record<string, number> = {}
): number {
  const max = maxChargesFor(def, level, abilityMods);
  return def.key in featureCharges ? featureCharges[def.key] : max;
}
