import type { Character } from "@/lib/types/character";
import type { DerivedCount, FeatureResource } from "@/lib/features/types";
import { proficiencyBonus, abilityMod } from "@/lib/character/calc";
import { CLASS_TABLE_COLUMNS } from "@/lib/content/srd/progression";

export function resolveDerivedCount(count: DerivedCount, character: Character): number {
  switch (count.from) {
    case "ability-mod": {
      const score = character.data.abilityScores[count.ability] ?? 10;
      const mod = abilityMod(score);
      return count.min !== undefined ? Math.max(mod, count.min) : mod;
    }
    case "prof-bonus":
      return proficiencyBonus(character.level);
    case "level":
      return character.level * (count.multiplier ?? 1);
    case "class-table": {
      const col = CLASS_TABLE_COLUMNS[count.classId]?.[count.column];
      if (!col) return 0;
      const idx = Math.min(character.level - 1, col.length - 1);
      return col[Math.max(0, idx)] ?? 0;
    }
  }
}

export function getResourceMax(resource: FeatureResource, character: Character): number {
  const { shape } = resource;
  switch (shape.kind) {
    case "charges":
    case "pool":
    case "points":
    case "slots":
      return typeof shape.max === "number"
        ? shape.max
        : resolveDerivedCount(shape.max, character);
    case "per-tier-one-shot":
      return shape.tiers.length;
    case "binary-token":
      return 1;
  }
}

export function getResourceState(
  resource: FeatureResource,
  character: Character,
): { current: number; max: number } {
  const max = getResourceMax(resource, character);
  const stored = character.data.featureCharges?.[resource.id];
  return { current: stored ?? max, max };
}
