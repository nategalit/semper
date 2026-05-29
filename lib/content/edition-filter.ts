export type Edition = "2014" | "2024" | "mix";

/** Source labels that only appear in 2024+ publications. */
const SOURCES_2024_ONLY = new Set(["PHB24", "DMG24"]);
/** Source labels that are exclusively 2014-era PHB (superseded in 2024). */
const SOURCES_2014_ONLY = new Set(["PHB"]);

/**
 * Returns true if an item with the given sourceLabel is appropriate for the
 * selected edition. "mix" always returns true.
 */
export function isEditionMatch(sourceLabel: string | undefined, edition: Edition): boolean {
  if (edition === "mix" || !sourceLabel) return true;
  if (edition === "2014") return !SOURCES_2024_ONLY.has(sourceLabel);
  if (edition === "2024") return !SOURCES_2014_ONLY.has(sourceLabel);
  return true;
}
