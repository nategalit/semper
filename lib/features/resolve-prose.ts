import type { Character } from "@/lib/types/character";
import type { ProseBySource } from "./types";

/**
 * Resolves prose for a FeatureDef given the character's rules edition.
 * Resolution order: phb24 → srd → byAuroraImport → fallback.
 */
export function resolveProse(prose: ProseBySource, character: Character): string {
  const edition = character.data.edition;

  if (edition === "2024" && prose.phb24) return prose.phb24;
  if (edition === "2014" && prose.srd) return prose.srd;

  // byAuroraImport branch — populated for future use. Character.data has no field
  // to key off yet (planned for Phase 8.7 creation wizard rework). Returns fallback
  // until then.

  return prose.fallback;
}
