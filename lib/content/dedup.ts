import type { SrdRace, SrdClass, SrdBackground, SrdSubclass, ContentSource } from "./srd/types";

// ─── Stats ────────────────────────────────────────────────────────────────────

export interface DedupStats {
  input: number;
  output: number;
  /** Number of entries dropped via Case A collapse (identical mechanics, multiple sources). */
  caseADropped: number;
  /**
   * Names that had mechanically distinct variants (Case B).
   * Each entry: the name, all source labels in the group, and fingerprint count.
   */
  caseBGroups: Array<{ name: string; sources: string[]; variantCount: number }>;
}

// ─── Fingerprint helpers ──────────────────────────────────────────────────────

function raceFPs(r: SrdRace): { base: string; full: string } {
  const base = JSON.stringify({
    speed: r.speed,
    size: r.size,
    asb: Object.entries(r.abilityScoreBonuses).sort(),
    fb: r.flexibleBonuses ?? null,
    sr: r.subraceRequired,
  });
  const full = JSON.stringify({
    speed: r.speed,
    size: r.size,
    asb: Object.entries(r.abilityScoreBonuses).sort(),
    fb: r.flexibleBonuses ?? null,
    sr: r.subraceRequired,
    traits: [...r.traits].sort(),
    langs: [...(r.languages ?? [])].sort(),
  });
  return { base, full };
}

function classFPs(c: SrdClass): { base: string; full: string } {
  const base = JSON.stringify({
    hitDie: c.hitDie,
    saves: [...c.savingThrows].sort(),
    skillCount: c.skillChoices.count,
    subclassLevel: c.subclassUnlockLevel,
    spellAbility: c.spellcasting?.ability ?? null,
    spellStart: c.spellcasting?.startsAtLevel ?? null,
  });
  // Include a description snippet so same-named features with different mechanics
  // (e.g. ERftLW vs TCoE Artificer) produce distinct fingerprints.
  const full = JSON.stringify({
    ...JSON.parse(base),
    features: [...(c.featureKeys ?? [])].sort(),
    descSnip: c.description.slice(0, 200),
  });
  return { base, full };
}

function bgFPs(b: SrdBackground): { base: string; full: string } {
  const base = JSON.stringify({
    skills: [...b.skillProficiencies].sort(),
    langCount: b.languages ?? 0,
  });
  const full = JSON.stringify({
    skills: [...b.skillProficiencies].sort(),
    tool: b.toolProficiency ?? null,
    langCount: b.languages ?? 0,
    featureName: b.featureName ?? null,
  });
  return { base, full };
}

// ─── Core dedup ───────────────────────────────────────────────────────────────

interface Entry<T> {
  item: T & { source?: ContentSource; sourceLabel?: string };
  base: string;
  full: string;
}

function isSrd<T extends { source?: ContentSource }>(item: T): boolean {
  return (item.source ?? "SRD") === "SRD";
}

function sourceLabel<T extends { source?: ContentSource; sourceLabel?: string }>(item: T): string {
  return item.sourceLabel ?? item.source ?? "SRD";
}

/**
 * Deduplicates a mixed SRD + Aurora list by name.
 *
 * Rules:
 * - SRD entry vs Aurora entry with same base fingerprint → Case A (keep SRD).
 * - SRD entry vs Aurora entry with different base fingerprint → Case B (keep both).
 * - Multiple Aurora entries with same full fingerprint → Case A (keep first).
 * - Multiple Aurora entries with different full fingerprints → Case B (keep all).
 */
function dedupEntries<T extends { name: string; source?: ContentSource; sourceLabel?: string }>(
  entries: Entry<T>[]
): { results: T[]; stats: DedupStats } {
  const byName = new Map<string, Entry<T>[]>();
  for (const e of entries) {
    const arr = byName.get(e.item.name) ?? [];
    arr.push(e);
    byName.set(e.item.name, arr);
  }

  const results: T[] = [];
  let caseADropped = 0;
  const caseBGroups: DedupStats["caseBGroups"] = [];

  for (const [, group] of byName) {
    if (group.length === 1) {
      results.push(group[0].item);
      continue;
    }

    const srdEntries = group.filter((e) => isSrd(e.item));
    const auroraEntries = group.filter((e) => !isSrd(e.item));

    if (srdEntries.length === 0) {
      // ── Aurora-only group: compare by full fingerprint ──────────────────────
      const byFull = new Map<string, Entry<T>[]>();
      for (const e of auroraEntries) {
        const arr = byFull.get(e.full) ?? [];
        arr.push(e);
        byFull.set(e.full, arr);
      }

      const fpGroups = [...byFull.values()];
      caseADropped += auroraEntries.length - fpGroups.length;

      if (fpGroups.length > 1) {
        // Case B: mechanically distinct variants
        caseBGroups.push({
          name: group[0].item.name,
          sources: auroraEntries.map((e) => sourceLabel(e.item)),
          variantCount: fpGroups.length,
        });
      }

      for (const fpGroup of fpGroups) {
        results.push(fpGroup[0].item);
      }
    } else {
      // ── SRD + Aurora group: compare Aurora against SRD base FP ─────────────
      const srdItem = srdEntries[0].item;
      const srdBase = srdEntries[0].base;
      results.push(srdItem);
      caseADropped += srdEntries.length - 1; // drop extra SRD if any

      // Aurora entries that differ from SRD base = Case B variants
      const caseBEntries: Entry<T>[] = [];
      for (const aur of auroraEntries) {
        if (aur.base === srdBase) {
          caseADropped++;
        } else {
          caseBEntries.push(aur);
        }
      }

      if (caseBEntries.length === 0) continue;

      // Deduplicate Case B Aurora entries among themselves (full FP)
      const byFull = new Map<string, Entry<T>[]>();
      for (const e of caseBEntries) {
        const arr = byFull.get(e.full) ?? [];
        arr.push(e);
        byFull.set(e.full, arr);
      }

      const fpGroups = [...byFull.values()];
      caseADropped += caseBEntries.length - fpGroups.length;

      caseBGroups.push({
        name: srdItem.name,
        sources: [sourceLabel(srdItem), ...caseBEntries.map((e) => sourceLabel(e.item))],
        variantCount: 1 + fpGroups.length,
      });

      for (const fpGroup of fpGroups) {
        results.push(fpGroup[0].item);
      }
    }
  }

  return {
    results,
    stats: {
      input: entries.length,
      output: results.length,
      caseADropped,
      caseBGroups,
    },
  };
}

// ─── Public API ───────────────────────────────────────────────────────────────

function subclassFPs(s: SrdSubclass): { base: string; full: string } {
  const base = JSON.stringify({
    classId: s.classId,
    features: [...s.features].sort(),
  });
  const full = JSON.stringify({
    classId: s.classId,
    features: [...s.features].sort(),
    descSnip: s.description.slice(0, 100),
  });
  return { base, full };
}

export function dedupSubclasses(subclasses: SrdSubclass[]): { results: SrdSubclass[]; stats: DedupStats } {
  return dedupEntries(subclasses.map((s) => ({ item: s, ...subclassFPs(s) })));
}

export function dedupRaces(races: SrdRace[]): { results: SrdRace[]; stats: DedupStats } {
  return dedupEntries(races.map((r) => ({ item: r, ...raceFPs(r) })));
}

export function dedupClasses(classes: SrdClass[]): { results: SrdClass[]; stats: DedupStats } {
  return dedupEntries(classes.map((c) => ({ item: c, ...classFPs(c) })));
}

export function dedupBackgrounds(bgs: SrdBackground[]): { results: SrdBackground[]; stats: DedupStats } {
  return dedupEntries(bgs.map((b) => ({ item: b, ...bgFPs(b) })));
}

export function logDedupStats(label: string, stats: DedupStats): void {
  const saved = stats.input - stats.output;
  console.log(
    `[dedup] ${label}: ${stats.output} shown from ${stats.input} raw` +
    (saved > 0 ? ` (${saved} collapsed, ${stats.caseADropped} Case A drops)` : "") +
    (stats.caseBGroups.length > 0
      ? `\n        Case B groups (${stats.caseBGroups.length}):`
      : "")
  );
  for (const g of stats.caseBGroups) {
    console.log(`          "${g.name}" — ${g.variantCount} variants [${g.sources.join(", ")}]`);
  }
}
