import type { AbilityKey } from "@/lib/content/srd";
import type { LevelChoiceRecord } from "@/lib/types/character";

export interface FeatureDef {
  key: string;
  label: string;
  description?: string;
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
      description: "Enter a rage as a bonus action. While raging you gain advantage on STR checks and saves, bonus damage, and resistance to physical damage. Lasts 1 minute.",
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
      description: "As a bonus action, grant an ally a Bardic Inspiration die (d6→d12) they can add to one ability check, attack roll, or saving throw within 10 minutes. Charges = CHA modifier. Recharges on short rest at level 5.",
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
      description: "Channel divine energy to fuel a magical effect. You gain uses at level 2 (1), level 6 (2), and level 18 (3). Recharges on a short or long rest.",
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
      description: "As an action, transform into a beast you have seen. CR limit and available forms increase with level. Lasts until you run out of HP, dismiss it, or use Wild Shape again.",
      maxCharges: (level) => (level >= 2 ? 2 : 0),
      rechargesOn: "short",
    },
  ],

  ID_CLASS_FIGHTER: [
    {
      key: "second_wind",
      label: "Second Wind",
      description: "As a bonus action, regain HP equal to 1d10 + your fighter level. Once per short or long rest.",
      maxCharges: () => 1,
      rechargesOn: "short",
    },
    {
      key: "action_surge",
      label: "Action Surge",
      description: "On your turn, take one additional action on top of your regular action. Two uses per rest at level 17.",
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
      description: "Fuel special monk abilities: Flurry of Blows, Patient Defense, Step of the Wind, and more. Ki points = monk level. Recharge on a short or long rest.",
      maxCharges: (level) => (level >= 2 ? level : 0),
      rechargesOn: "short",
    },
  ],

  ID_CLASS_PALADIN: [
    {
      key: "lay_on_hands",
      label: "Lay on Hands",
      description: "Touch a creature to restore HP from your healing pool (paladin level × 5). As an action you can also cure one disease or poison for 5 points instead. Recharges on a long rest.",
      // Pool of HP, not individual charges — tracked as remaining pool points
      maxCharges: (level) => level * 5,
      rechargesOn: "long",
    },
    {
      key: "channel_divinity",
      label: "Channel Divinity",
      description: "Channel divine energy granted by your Sacred Oath to fuel a magical effect. Available at level 3. Recharges on a short or long rest.",
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
      description: "A pool of magical energy equal to your sorcerer level. Spend to create spell slots or fuel Metamagic options. Recharges on a long rest.",
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
      description: "Once per day during a short rest, recover expended spell slots with a combined level up to half your wizard level (rounded up). Cannot recover 6th level or higher slots.",
      maxCharges: () => 1,
      rechargesOn: "long",
    },
  ],
};

// ─── Feat features ────────────────────────────────────────────────────────────

const LUCKY_DEF: FeatureDef = {
  key: "lucky",
  label: "Lucky",
  description: "Spend a luck point to roll an extra d20 for an attack roll, ability check, or saving throw (choose after rolling, before outcome). You can also spend one to impose disadvantage on an attack roll made against you. Recharges on a long rest.",
  maxCharges: () => 3,
  rechargesOn: "long",
};

const INSPIRING_LEADER_DEF: FeatureDef = {
  key: "inspiring_leader",
  label: "Inspiring Leader",
  description: "Over 10 minutes, inspire up to 6 creatures you can see (including yourself). Each gains temporary HP equal to your level + your Charisma modifier. Once per short or long rest.",
  maxCharges: () => 1,
  rechargesOn: "short",
};

const FEAT_FEATURES: Record<string, FeatureDef> = {
  ID_PHB_FEAT_LUCKY:                      LUCKY_DEF,
  ID_WOTC_PHB24_FEAT_LUCKY:              LUCKY_DEF,
  ID_PHB_FEAT_INSPIRINGLEADER:            INSPIRING_LEADER_DEF,
  ID_WOTC_PHB24_FEAT_INSPIRING_LEADER:   INSPIRING_LEADER_DEF,
};

/**
 * Returns FeatureDefs for any feats the character has taken that have tracked charges.
 * Deduplicates by key (e.g. both PHB and PHB24 Lucky resolve to the same def).
 */
export function getFeatFeatures(
  levelChoices: Record<number, LevelChoiceRecord> | undefined,
  level: number,
  abilityMods: Partial<Record<AbilityKey, number>> = {}
): FeatureDef[] {
  if (!levelChoices) return [];
  const seen = new Set<string>();
  const result: FeatureDef[] = [];
  for (const choice of Object.values(levelChoices)) {
    if (!choice.featId) continue;
    const def = FEAT_FEATURES[choice.featId];
    if (!def || seen.has(def.key)) continue;
    if (def.maxCharges(level, abilityMods) === 0) continue;
    seen.add(def.key);
    result.push(def);
  }
  return result;
}

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
