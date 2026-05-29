import { DOMParser } from "@xmldom/xmldom";
import { parseAuroraFile } from "./parser";
import type { AuroraElement } from "../schema";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type El = any;

const FILE_TIMEOUT_MS = 10_000;
const BATCH_SIZE = 15;
const MAX_DEPTH = 5;

// ─── Fetch helper ─────────────────────────────────────────────────────────────

async function fetchText(url: string): Promise<string> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), FILE_TIMEOUT_MS);
  try {
    const res = await fetch(url, { signal: controller.signal, cache: "no-store" });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.text();
  } finally {
    clearTimeout(timer);
  }
}

// ─── Index XML parser ─────────────────────────────────────────────────────────

interface FileEntry {
  name: string;
  url: string;
}

function parseFileEntries(xml: string): FileEntry[] {
  try {
    const doc = new DOMParser().parseFromString(xml, "text/xml");
    const fileEls = Array.from<El>(doc.getElementsByTagName("file"));
    if (fileEls.length > 0) {
      return fileEls
        .map((el: El) => ({
          name: (el.getAttribute("name") as string) ?? "",
          url: (el.getAttribute("url") as string) ?? "",
        }))
        .filter((e) => Boolean(e.url));
    }
  } catch {
    // fall through to line-based parse
  }
  return xml
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l.startsWith("http"))
    .map((url) => ({ name: url.split("/").pop() ?? url, url }));
}

/** An entry points to a child index if its URL path (ignoring query string) ends with .index */
function isIndexEntry(entry: FileEntry): boolean {
  const pathname = entry.url.split("?")[0];
  return pathname.endsWith(".index") || entry.name.endsWith(".index");
}

// ─── Element count helper ─────────────────────────────────────────────────────

function countByType(elements: AuroraElement[]): Record<string, number> {
  const counts: Record<string, number> = {};
  for (const el of elements) {
    counts[el.elementType] = (counts[el.elementType] ?? 0) + 1;
  }
  return counts;
}

function formatCounts(counts: Record<string, number>): string {
  return Object.entries(counts)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([type, n]) => `${n} ${type}`)
    .join(", ");
}

// ─── Recursive index expansion ────────────────────────────────────────────────

/**
 * Recursively fetch an Aurora index URL and collect all content file URLs.
 * Indexes reference other indexes (recurse) or .xml content files (collect).
 */
async function expandIndex(
  indexUrl: string,
  label: string,
  visited: Set<string>,
  depth: number
): Promise<string[]> {
  if (depth > MAX_DEPTH || visited.has(indexUrl)) return [];
  visited.add(indexUrl);

  let xml: string;
  try {
    xml = await fetchText(indexUrl);
  } catch (err) {
    console.warn(`[Aurora] Failed to fetch index ${label}: ${err}`);
    return [];
  }

  const entries = parseFileEntries(xml);
  const childIndexes = entries.filter(isIndexEntry);
  const contentFiles = entries.filter((e) => !isIndexEntry(e));

  if (depth === 0) {
    console.log(
      `[Aurora] Master index: ${childIndexes.length} child indexes, ${contentFiles.length} content files`
    );
  } else {
    console.log(
      `[Aurora] Recursing into ${label}: ${childIndexes.length} child indexes, ${contentFiles.length} content files`
    );
  }

  // Recurse into all child indexes in parallel
  const childResults = await Promise.allSettled(
    childIndexes.map((e) => expandIndex(e.url, e.name, visited, depth + 1))
  );

  const allContentUrls = contentFiles.map((e) => e.url);
  for (const r of childResults) {
    if (r.status === "fulfilled") allContentUrls.push(...r.value);
  }

  return allContentUrls;
}

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Fetch an Aurora index URL, recursively expand child indexes, parse all
 * referenced content files, and return all AuroraElements found.
 */
export async function fetchAndParseIndex(indexUrl: string): Promise<AuroraElement[]> {
  const visited = new Set<string>();

  // Phase 1: expand all indexes to collect the full content URL list
  const contentUrls = await expandIndex(indexUrl, "root", visited, 0);
  console.log(`[Aurora] Total content files to fetch: ${contentUrls.length}`);

  // Phase 2: fetch and parse content files in parallel batches
  const allElements: AuroraElement[] = [];

  for (let i = 0; i < contentUrls.length; i += BATCH_SIZE) {
    const batch = contentUrls.slice(i, i + BATCH_SIZE);
    const results = await Promise.allSettled(
      batch.map(async (url) => {
        const name = url.split("/").pop() ?? url;
        try {
          const xml = await fetchText(url);
          const elements = parseAuroraFile(xml, "imported");
          if (elements.length > 0) {
            const counts = countByType(elements);
            console.log(
              `[Aurora] Parsed ${name}: ${elements.length} elements (${formatCounts(counts)})`
            );
          }
          return elements;
        } catch (err) {
          console.warn(`[Aurora] Failed to parse ${name}: ${err}`);
          return [];
        }
      })
    );
    for (const r of results) {
      if (r.status === "fulfilled") allElements.push(...r.value);
    }
  }

  const totalCounts = countByType(allElements);
  console.log(
    `[Aurora] Sync complete: ${allElements.length} elements total (${formatCounts(totalCounts)})`
  );

  return allElements;
}
