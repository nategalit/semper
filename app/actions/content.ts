"use server";

import { revalidatePath } from "next/cache";
import { requireAuth } from "@/lib/dal";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { fetchAndParseIndex } from "@/lib/content/aurora/index-fetcher";
import { abbreviateSource, isKnownSource } from "@/lib/content/source-abbreviations";
import type {
  AuroraElement,
  SpellElement,
  RaceElement,
  SubraceElement,
  ClassElement,
  SubclassElement,
  ClassFeatureElement,
  RacialTraitElement,
  BackgroundElement,
  FeatElement,
  ItemElement,
} from "@/lib/content/schema";
import type { DisplaySpell } from "@/lib/types/spell";

// ─── Structured content stored per source ────────────────────────────────────

export interface FeatureEntry {
  id: string;
  name: string;
  description: string;
  /** Aurora-tagged action type string (e.g. "Action", "Bonus Action"). Present when the
   *  source element has an <action> tag. Used by ensureActionType as tier-2 precedence. */
  action?: string;
}

export interface FightingStyleEntry {
  id: string;
  name: string;
  description: string;
  sourceLabel: string;
}

export interface ImportedContent {
  spells: DisplaySpell[];
  races: RaceElement[];
  subraces: SubraceElement[];
  classes: ClassElement[];
  subclasses: SubclassElement[];
  backgrounds: BackgroundElement[];
  feats: FeatElement[];
  items: ItemElement[];
  /** ClassFeature + RacialTrait elements (subclass/racial trait descriptions). Stored at sync time. */
  features: FeatureEntry[];
  /** ClassFeature elements whose <supports> tag equals "Fighting Style". */
  fightingStyles: FightingStyleEntry[];
}

export interface ElementCounts {
  spells: number;
  races: number;
  classes: number;
  subclasses: number;
  backgrounds: number;
  feats: number;
  items: number;
}

export interface SourceMissEntry {
  source: string;
  abbrev: string;
  count: number;
}

// ─── Conversion helpers ───────────────────────────────────────────────────────

function spellElementToDisplay(el: SpellElement): DisplaySpell {
  const parts: string[] = [];
  if (el.components.verbal) parts.push("V");
  if (el.components.somatic) parts.push("S");
  if (el.components.material) {
    parts.push(
      el.components.materialDescription
        ? `M (${el.components.materialDescription})`
        : "M"
    );
  }
  return {
    id: el.id,
    name: el.name,
    level: el.level,
    school: el.school.toLowerCase(),
    classes: el.classes.map((c) =>
      c.startsWith("ID_CLASS_")
        ? c
        : `ID_CLASS_${c.toUpperCase().replace(/[^A-Z]/g, "_")}`
    ),
    concentration: el.concentration,
    ritual: el.ritual,
    castingTime: el.castingTime,
    range: el.range,
    duration: el.duration,
    components: parts.join(", "),
    description: el.description || undefined,
    sourceLabel: abbreviateSource(el.source),
  };
}

function partitionElements(elements: AuroraElement[]): {
  content: ImportedContent;
  sourceMisses: SourceMissEntry[];
} {
  const content: ImportedContent = {
    spells: [],
    races: [],
    subraces: [],
    classes: [],
    subclasses: [],
    backgrounds: [],
    feats: [],
    items: [],
    features: [],
    fightingStyles: [],
  };

  // Track unknown source strings across all element types
  const missCounts = new Map<string, number>();

  for (const el of elements) {
    if (!isKnownSource(el.source)) {
      missCounts.set(el.source, (missCounts.get(el.source) ?? 0) + 1);
    }
    switch (el.elementType) {
      case "Spell":       content.spells.push(spellElementToDisplay(el as SpellElement)); break;
      case "Race":        content.races.push(el as RaceElement); break;
      case "Subrace":     content.subraces.push(el as SubraceElement); break;
      case "Class":       content.classes.push(el as ClassElement); break;
      case "Subclass":    content.subclasses.push(el as SubclassElement); break;
      case "Background":  content.backgrounds.push(el as BackgroundElement); break;
      case "Feat":        content.feats.push(el as FeatElement); break;
      case "Item":        content.items.push(el as ItemElement); break;
      case "ClassFeature": {
        const cf = el as ClassFeatureElement;
        if (cf.supports?.split(",")[0].trim() === "Fighting Style") {
          content.fightingStyles.push({
            id: cf.id,
            name: cf.name,
            description: cf.description,
            sourceLabel: abbreviateSource(cf.source),
          });
        } else {
          content.features.push({ id: cf.id, name: cf.name, description: cf.description, action: cf.action });
        }
        break;
      }
      case "RacialTrait": {
        const rt = el as RacialTraitElement;
        content.features.push({ id: rt.id, name: rt.name, description: rt.description, action: rt.action });
        break;
      }
    }
  }

  const sourceMisses: SourceMissEntry[] = Array.from(missCounts.entries())
    .map(([source, count]) => ({ source, abbrev: abbreviateSource(source), count }))
    .sort((a, b) => b.count - a.count);

  if (sourceMisses.length > 0) {
    console.log(
      "[Aurora] Unrecognized source strings (add to source-abbreviations.ts):\n" +
      sourceMisses.map((m) => `  ${m.count.toString().padStart(4)}x  ${m.source}  →  ${m.abbrev}`).join("\n")
    );
  }

  return { content, sourceMisses };
}

function elementCounts(content: ImportedContent): ElementCounts {
  return {
    spells:      content.spells.length,
    races:       content.races.length,
    classes:     content.classes.length,
    subclasses:  content.subclasses.length,
    backgrounds: content.backgrounds.length,
    feats:       content.feats.length,
    items:       content.items.length,
  };
}

// ─── Row type ─────────────────────────────────────────────────────────────────

interface ContentSourceRow {
  id: string;
  label: string;
  index_url: string;
  enabled: boolean;
  last_synced_at: string | null;
  spell_count: number;
  element_counts: ElementCounts | null;
  source_misses: SourceMissEntry[];
  books: string[];
  disabled_books: string[];
  created_at: string;
}

export interface ContentSource {
  id: string;
  label: string;
  indexUrl: string;
  enabled: boolean;
  lastSyncedAt: string | null;
  spellCount: number;
  elementCounts: ElementCounts | null;
  sourceMisses: SourceMissEntry[];
  books: string[];
  disabledBooks: string[];
  createdAt: string;
}

function mapRow(row: ContentSourceRow): ContentSource {
  return {
    id: row.id,
    label: row.label,
    indexUrl: row.index_url,
    enabled: row.enabled,
    lastSyncedAt: row.last_synced_at,
    spellCount: row.spell_count,
    elementCounts: row.element_counts,
    sourceMisses: row.source_misses ?? [],
    books: row.books ?? [],
    disabledBooks: row.disabled_books ?? [],
    createdAt: row.created_at,
  };
}

const COLUMNS =
  "id, label, index_url, enabled, last_synced_at, spell_count, element_counts, source_misses, books, disabled_books, created_at";

// ─── Sync helper ──────────────────────────────────────────────────────────────

async function doSync(indexUrl: string): Promise<{
  content: ImportedContent;
  counts: ElementCounts;
  sourceMisses: SourceMissEntry[];
  books: string[];
}> {
  const elements = await fetchAndParseIndex(indexUrl);
  const { content, sourceMisses } = partitionElements(elements);
  const counts = elementCounts(content);
  const bookSet = new Set<string>();
  for (const el of elements) bookSet.add(abbreviateSource(el.source));
  const books = [...bookSet].sort();
  return { content, counts, sourceMisses, books };
}

// ─── Public CRUD actions ──────────────────────────────────────────────────────

export async function listContentSources(): Promise<ContentSource[]> {
  const { userId } = await requireAuth();
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("imported_content")
    .select(COLUMNS)
    .eq("user_id", userId)
    .order("created_at", { ascending: true });
  if (error) throw new Error(error.message);
  return (data as ContentSourceRow[]).map(mapRow);
}

export async function addContentSource(
  label: string,
  indexUrl: string
): Promise<ContentSource> {
  const { userId } = await requireAuth();
  const supabase = await createSupabaseServerClient();

  const { content, counts, sourceMisses, books } = await doSync(indexUrl);

  const { data, error } = await supabase
    .from("imported_content")
    .insert({
      user_id: userId,
      label: label.trim(),
      index_url: indexUrl.trim(),
      enabled: true,
      last_synced_at: new Date().toISOString(),
      spell_count: counts.spells,
      element_counts: counts,
      source_misses: sourceMisses,
      books,
      content,
    })
    .select(COLUMNS)
    .single();

  if (error) throw new Error(error.message);
  revalidatePath("/settings/content");
  return mapRow(data as ContentSourceRow);
}

export async function syncContentSource(
  sourceId: string
): Promise<{ lastSyncedAt: string; counts: ElementCounts; sourceMisses: SourceMissEntry[]; books: string[] }> {
  const { userId } = await requireAuth();
  const supabase = await createSupabaseServerClient();

  const { data: row, error: fetchError } = await supabase
    .from("imported_content")
    .select("index_url")
    .eq("id", sourceId)
    .eq("user_id", userId)
    .single();

  if (fetchError || !row) throw new Error(fetchError?.message ?? "Not found");

  const { content, counts, sourceMisses, books } = await doSync(row.index_url);
  const lastSyncedAt = new Date().toISOString();

  const { error } = await supabase
    .from("imported_content")
    .update({
      content,
      spell_count: counts.spells,
      element_counts: counts,
      source_misses: sourceMisses,
      books,
      last_synced_at: lastSyncedAt,
    })
    .eq("id", sourceId)
    .eq("user_id", userId);

  if (error) throw new Error(error.message);
  revalidatePath("/settings/content");
  return { lastSyncedAt, counts, sourceMisses, books };
}

export async function toggleContentSource(
  sourceId: string,
  enabled: boolean
): Promise<void> {
  const { userId } = await requireAuth();
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase
    .from("imported_content")
    .update({ enabled })
    .eq("id", sourceId)
    .eq("user_id", userId);
  if (error) throw new Error(error.message);
  revalidatePath("/settings/content");
}

export async function setDisabledBooks(
  sourceId: string,
  disabledBooks: string[]
): Promise<void> {
  const { userId } = await requireAuth();
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase
    .from("imported_content")
    .update({ disabled_books: disabledBooks })
    .eq("id", sourceId)
    .eq("user_id", userId);
  if (error) throw new Error(error.message);
  revalidatePath("/settings/content");
}

export async function removeContentSource(sourceId: string): Promise<void> {
  const { userId } = await requireAuth();
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase
    .from("imported_content")
    .delete()
    .eq("id", sourceId)
    .eq("user_id", userId);
  if (error) throw new Error(error.message);
  revalidatePath("/settings/content");
}

// ─── Per-type getters (for character sheet and wizard) ────────────────────────
//
// Each getter selects only the relevant JSONB subkey (e.g. content->spells)
// instead of the full content blob.  PostgREST returns the -> result under
// the last path segment as the column name.  We also check the full
// expression key as a fallback in case PostgREST version differs.

async function queryEnabledField<T>(field: string): Promise<T[]> {
  const { userId } = await requireAuth();
  const supabase = await createSupabaseServerClient();
  // Supabase's TS types can't parse a dynamic -> expression, so we
  // bypass type inference here and work with the raw response shape.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase as any)
    .from("imported_content")
    .select(`content->${field}, disabled_books`)
    .eq("user_id", userId)
    .eq("enabled", true) as { data: Record<string, unknown>[] | null; error: { message: string } | null };
  if (error) throw new Error(error.message);
  return (data ?? []).flatMap((row) => {
    const val = row[field] ?? row[`content->${field}`];
    const disabledBooks: string[] = Array.isArray(row.disabled_books)
      ? (row.disabled_books as string[])
      : [];
    const items = Array.isArray(val) ? (val as T[]) : [];
    if (disabledBooks.length === 0) return items;
    return items.filter((item) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const label: string = (item as any).sourceLabel ?? abbreviateSource((item as any).source ?? "");
      return !disabledBooks.includes(label);
    });
  });
}

export async function getEnabledSpells(): Promise<DisplaySpell[]> {
  return queryEnabledField<DisplaySpell>("spells");
}

export async function getEnabledRaces(): Promise<RaceElement[]> {
  return queryEnabledField<RaceElement>("races");
}

export async function getEnabledClasses(): Promise<ClassElement[]> {
  return queryEnabledField<ClassElement>("classes");
}

export async function getEnabledSubclasses(): Promise<SubclassElement[]> {
  return queryEnabledField<SubclassElement>("subclasses");
}

export async function getEnabledBackgrounds(): Promise<BackgroundElement[]> {
  return queryEnabledField<BackgroundElement>("backgrounds");
}

export async function getEnabledFeats(): Promise<FeatElement[]> {
  return queryEnabledField<FeatElement>("feats");
}

export async function getEnabledItems(): Promise<ItemElement[]> {
  return queryEnabledField<ItemElement>("items");
}

export async function getEnabledSubraces(): Promise<SubraceElement[]> {
  return queryEnabledField<SubraceElement>("subraces");
}

export async function getEnabledFeatures(): Promise<FeatureEntry[]> {
  return queryEnabledField<FeatureEntry>("features");
}

export async function getEnabledFightingStyles(): Promise<FightingStyleEntry[]> {
  return queryEnabledField<FightingStyleEntry>("fightingStyles");
}
