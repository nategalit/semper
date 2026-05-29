/**
 * Sourcebook name → standard abbreviation lookup.
 * Add entries here as new books appear in imported content.
 */
export const SOURCE_ABBREV_MAP: Record<string, string> = {
  "Player's Handbook":                                  "PHB",
  "Player's Handbook (2024)":                           "PHB24",
  "Dungeon Master's Guide":                             "DMG",
  "Monster Manual":                                     "MM",
  "Xanathar's Guide to Everything":                     "XGtE",
  "Tasha's Cauldron of Everything":                     "TCoE",
  "Sword Coast Adventurer's Guide":                     "SCAG",
  "Elemental Evil Player's Companion":                  "EEPC",
  "Volo's Guide to Monsters":                           "VGtM",
  "Mordenkainen's Tome of Foes":                        "MToF",
  "Mordenkainen Presents: Monsters of the Multiverse":  "MPMM",
  "Fizban's Treasury of Dragons":                       "FToD",
  "Strixhaven: A Curriculum of Chaos":                  "SACoC",
  "Van Richten's Guide to Ravenloft":                   "VRGtR",
  "Acquisitions Incorporated":                          "AI",
  "Eberron: Rising from the Last War":                  "ERftLW",
  "Explorer's Guide to Wildemount":                     "EGtW",
  "Guildmasters' Guide to Ravnica":                     "GGtR",
  "Mythic Odysseys of Theros":                          "MOoT",
  "Wayfinder's Guide to Eberron":                       "WGtE",
  "Unearthed Arcana":                                   "UA",
  "Aurora Legacy Elements":                             "ALE",
  "System Reference Document":                          "SRD",
};

function normalize(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9]/g, "");
}

const NORMALIZED_MAP: Record<string, string> = Object.fromEntries(
  Object.entries(SOURCE_ABBREV_MAP).map(([k, v]) => [normalize(k), v])
);

function capitalLetterAbbrev(name: string): string {
  const caps = name.match(/[A-Z]/g) ?? [];
  if (caps.length >= 2) return caps.join("");
  return name.replace(/[^a-zA-Z]/g, "").slice(0, 4).toUpperCase();
}

export function abbreviateSource(name: string): string {
  if (!name) return "";
  return SOURCE_ABBREV_MAP[name] ?? NORMALIZED_MAP[normalize(name)] ?? capitalLetterAbbrev(name);
}

/** True when the name has an entry in the lookup (exact or normalized). */
export function isKnownSource(name: string): boolean {
  return !!(SOURCE_ABBREV_MAP[name] ?? NORMALIZED_MAP[normalize(name)]);
}

/** Reverse map: abbreviation → full book name. */
export const ABBREV_SOURCE_MAP: Record<string, string> = Object.fromEntries(
  Object.entries(SOURCE_ABBREV_MAP).map(([full, abbrev]) => [abbrev, full])
);

/**
 * Given an abbreviation (e.g. "XGtE"), returns the full book name.
 * Returns the abbreviation unchanged if it has no known expansion.
 */
export function expandAbbrev(abbrev: string): string {
  return ABBREV_SOURCE_MAP[abbrev] ?? abbrev;
}
