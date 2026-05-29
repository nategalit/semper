/**
 * Usage:
 *   npx tsx scripts/test-adapters.ts <aurora-index-url>
 *
 * Pass your Aurora Legacy index URL as the first argument.
 * Example: npx tsx scripts/test-adapters.ts https://raw.githubusercontent.com/.../core.index
 */

import { fetchAndParseIndex } from "../lib/content/aurora/index-fetcher";
import {
  adaptAuroraClass,
  adaptAuroraRace,
  adaptAuroraBackground,
} from "../lib/content/aurora/adapters";
import type { ClassElement, RaceElement, SubraceElement, BackgroundElement } from "../lib/content/schema";

async function main() {
  const indexUrl = process.argv[2];
  if (!indexUrl) {
    console.error("Usage: npx tsx scripts/test-adapters.ts <aurora-index-url>");
    process.exit(1);
  }

  console.log(`\nFetching index: ${indexUrl}\n`);
  const elements = await fetchAndParseIndex(indexUrl);
  console.log(`\nLoaded ${elements.length} elements total.\n`);

  const races   = elements.filter((e): e is RaceElement => e.elementType === "Race");
  const subraces = elements.filter((e): e is SubraceElement => e.elementType === "Subrace");
  const classes  = elements.filter((e): e is ClassElement => e.elementType === "Class");
  const backgrounds = elements.filter((e): e is BackgroundElement => e.elementType === "Background");

  // ── Races ──────────────────────────────────────────────────────────────────

  const raceTargets = ["Half-Elf", "Tiefling"];
  for (const raceName of raceTargets) {
    const raceEl = races.find((r) => r.name === raceName);
    if (!raceEl) {
      console.log(`[RACE] "${raceName}" not found — skipping.\n`);
      continue;
    }
    const raceSubraces = subraces.filter((s) => s.parentRace === raceName);
    const adapted = adaptAuroraRace(raceEl, raceSubraces);
    console.log(`\n── Race: ${raceName} ──────────────────────────────────────────────`);
    console.log(JSON.stringify(adapted, null, 2));
  }

  // ── Classes ────────────────────────────────────────────────────────────────

  const classTargets = ["Paladin", "Artificer", "Blood Hunter"];
  for (const className of classTargets) {
    const classEl = classes.find((c) => c.name === className);
    if (!classEl) {
      console.log(`\n[CLASS] "${className}" not found — skipping.`);
      continue;
    }
    const adapted = adaptAuroraClass(classEl);
    console.log(`\n── Class: ${className} ──────────────────────────────────────────────`);
    console.log(JSON.stringify(adapted, null, 2));
  }

  // ── Background ─────────────────────────────────────────────────────────────

  const bgTargets = ["Soldier", "Acolyte"];
  for (const bgName of bgTargets) {
    const bgEl = backgrounds.find((b) => b.name === bgName);
    if (!bgEl) {
      console.log(`\n[BACKGROUND] "${bgName}" not found — skipping.`);
      continue;
    }
    const adapted = adaptAuroraBackground(bgEl);
    console.log(`\n── Background: ${bgName} ──────────────────────────────────────────────`);
    console.log(JSON.stringify(adapted, null, 2));
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
