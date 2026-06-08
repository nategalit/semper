"use client";

import { useState, useMemo } from "react";
import { useMutation } from "@/lib/character/mutation-context";
import {
  learnSpell, forgetSpell, prepareSpell, unprepareSpell,
} from "@/app/actions/characters";
import {
  getCasterType, preparedSpellLimit, knownSpellLimit, maxCastableSpellLevel, cantripLimit,
  type SpellSchool,
} from "@/lib/content/srd";
import type { SrdClass } from "@/lib/content/srd";
import type { DerivedStats } from "@/lib/character/calc";
import type { DisplaySpell } from "@/lib/types/spell";
import { FilterPill } from "@/app/_components/filter-pill";

interface Props {
  open: boolean;
  onClose: () => void;
  srdClass: SrdClass | undefined;
  derived: DerivedStats;
  allSpells: DisplaySpell[];
}

const SCHOOLS: SpellSchool[] = [
  "abjuration","conjuration","divination","enchantment",
  "evocation","illusion","necromancy","transmutation",
];

const SCHOOL_LABEL: Record<SpellSchool, string> = {
  abjuration:"Abjuration", conjuration:"Conjuration", divination:"Divination",
  enchantment:"Enchantment", evocation:"Evocation", illusion:"Illusion",
  necromancy:"Necromancy", transmutation:"Transmutation",
};

type SortBy = "name" | "level" | "school" | "source";

// One canonical entry in the picker — one display spell (the resolved/active version)
// plus the full version group so the row can render chips.
interface DedupedSpell {
  key: string;           // canonical name key
  spell: DisplaySpell;   // the resolved (active) version
  group: DisplaySpell[]; // all versions for this name
}

type ListItem =
  | { type: "header"; label: string }
  | { type: "spell"; key: string; spell: DisplaySpell; group: DisplaySpell[] };

// ─── Module-level helpers ─────────────────────────────────────────────────────

const nameCompare = (a: DisplaySpell, b: DisplaySpell) =>
  a.name.localeCompare(b.name, undefined, { sensitivity: "base" });

/**
 * Pick the "best" version to display by default:
 * 1. The version already in spellsKnown (preserve what the character learned)
 * 2. A non-SRD version with a description (Aurora import is richer)
 * 3. Any version with a description
 * 4. First in the group
 */
function getBestVersion(group: DisplaySpell[], spellsKnown: string[]): DisplaySpell {
  const known = group.find((s) => spellsKnown.includes(s.id));
  if (known) return known;
  const nonSrdWithDesc = group.find((s) => s.sourceLabel !== "SRD" && s.description);
  if (nonSrdWithDesc) return nonSrdWithDesc;
  const anyWithDesc = group.find((s) => s.description);
  if (anyWithDesc) return anyWithDesc;
  return group[0];
}

function buildDisplayList(items: DedupedSpell[], sortBy: SortBy): ListItem[] {
  if (sortBy === "source") {
    const groups = new Map<string, DedupedSpell[]>();
    for (const item of items) {
      const src = item.spell.sourceLabel;
      const arr = groups.get(src) ?? [];
      arr.push(item);
      groups.set(src, arr);
    }
    const result: ListItem[] = [];
    for (const [source, srcItems] of groups) {
      result.push({ type: "header", label: source });
      for (const item of srcItems.sort((a, b) => a.spell.level - b.spell.level || nameCompare(a.spell, b.spell))) {
        result.push({ type: "spell", key: item.key, spell: item.spell, group: item.group });
      }
    }
    return result;
  }
  const sorted = [...items];
  switch (sortBy) {
    case "name":
    case "level":  sorted.sort((a, b) => a.spell.level - b.spell.level || nameCompare(a.spell, b.spell)); break;
    case "school": sorted.sort((a, b) => a.spell.school.localeCompare(b.spell.school) || nameCompare(a.spell, b.spell)); break;
  }
  return sorted.map((item) => ({ type: "spell" as const, key: item.key, spell: item.spell, group: item.group }));
}

// ─── Component ────────────────────────────────────────────────────────────────

export function SpellManager({ open, onClose, srdClass, derived, allSpells }: Props) {
  const { character, mutate } = useMutation();
  const [view, setView] = useState<"browse" | "my">("browse");
  const [search, setSearch] = useState("");
  const [levelFilter, setLevelFilter] = useState<number | null>(null);
  const [schoolFilter, setSchoolFilter] = useState<SpellSchool | null>(null);
  const [sourceFilters, setSourceFilters] = useState(() => new Set<string>());
  const [sourceSortOrder, setSourceSortOrder] = useState<"alpha" | "count">(() => {
    if (typeof window === "undefined") return "alpha";
    return (localStorage.getItem("semper-source-sort") as "alpha" | "count") ?? "alpha";
  });
  const [sortBy, setSortBy] = useState<SortBy>("name");
  const [classOnly, setClassOnly] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  // User-selected version per canonical name (overrides the auto-resolved version)
  const [selectedVersions, setSelectedVersions] = useState(() => new Map<string, string>());

  const casterType = getCasterType(character.classId);
  const isPrepared = casterType === "prepared";

  const spellsKnown = character.data.spellsKnown ?? [];
  const spellsPrepared = character.data.spellsPrepared ?? [];

  // ── Limits ──────────────────────────────────────────────────────────────────
  const spellcastingAbilityMod = derived.spellcastingAbility
    ? derived.abilityMods[derived.spellcastingAbility]
    : 0;

  const preparedLimit = isPrepared && character.classId
    ? preparedSpellLimit(character.classId, character.level, spellcastingAbilityMod)
    : null;

  const knownLimit = !isPrepared && character.classId
    ? knownSpellLimit(character.classId, character.level)
    : null;

  const activeKnownCount = spellsKnown.filter((id) => {
    const sp = allSpells.find((s) => s.id === id);
    return sp && sp.level > 0;
  }).length;

  const activePreparedCount = spellsPrepared.length;

  const cantripKnownCount = spellsKnown.filter((id) => {
    const sp = allSpells.find((s) => s.id === id);
    return sp && sp.level === 0;
  }).length;

  const cantripMax = character.classId ? cantripLimit(character.classId, character.level) : 0;
  const cantripAtLimit = cantripMax > 0 && cantripKnownCount >= cantripMax;
  const knownAtLimit = !isPrepared && knownLimit !== null && activeKnownCount >= knownLimit;
  const preparedAtLimit = isPrepared && preparedLimit !== null && activePreparedCount >= preparedLimit;

  // ── Version groups ───────────────────────────────────────────────────────────
  // Keyed by canonical name (lowercase trim). Every spell in allSpells lives in
  // exactly one group. SRD + Aurora duplicates of the same name share a group.
  const spellGroups = useMemo(() => {
    const groups = new Map<string, DisplaySpell[]>();
    for (const spell of allSpells) {
      const key = spell.name.toLowerCase().trim();
      const arr = groups.get(key) ?? [];
      arr.push(spell);
      groups.set(key, arr);
    }
    return groups;
  }, [allSpells]);

  // ── Source pill data ─────────────────────────────────────────────────────────
  const sourceSpellCounts = useMemo(() => {
    const counts = new Map<string, number>();
    for (const spell of allSpells) {
      counts.set(spell.sourceLabel, (counts.get(spell.sourceLabel) ?? 0) + 1);
    }
    return counts;
  }, [allSpells]);

  const uniqueSources = useMemo(() => {
    const labels = [...new Set(allSpells.map((s) => s.sourceLabel))];
    if (sourceSortOrder === "count") {
      return labels.sort((a, b) => (sourceSpellCounts.get(b) ?? 0) - (sourceSpellCounts.get(a) ?? 0));
    }
    return labels.sort();
  }, [allSpells, sourceSortOrder, sourceSpellCounts]);

  // ── Filtered + deduped browse list ──────────────────────────────────────────
  // First filter by all active filters (can still have duplicate names if both
  // SRD + Aurora pass), then collapse to one entry per canonical name.
  const dedupedBrowseSpells = useMemo((): DedupedSpell[] => {
    const filtered = allSpells.filter((spell) => {
      // Level cap always applied — characters can't learn spells above their current slot tier.
      if (character.classId && spell.level > 0) {
        if (spell.level > maxCastableSpellLevel(character.classId, character.level)) return false;
      }
      if (classOnly && character.classId && !spell.classes.includes(character.classId)) return false;
      if (levelFilter !== null && spell.level !== levelFilter) return false;
      if (schoolFilter && spell.school !== schoolFilter) return false;
      if (sourceFilters.size > 0 && !sourceFilters.has(spell.sourceLabel)) return false;
      if (search && !spell.name.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });

    const seen = new Set<string>();
    const result: DedupedSpell[] = [];
    for (const spell of filtered) {
      const key = spell.name.toLowerCase().trim();
      if (seen.has(key)) continue;
      seen.add(key);
      const group = spellGroups.get(key) ?? [spell];
      const selId = selectedVersions.get(key);
      const resolved = (selId && group.some((s) => s.id === selId))
        ? group.find((s) => s.id === selId)!
        : getBestVersion(group, spellsKnown);
      result.push({ key, spell: resolved, group });
    }
    return result;
  }, [allSpells, classOnly, character.classId, levelFilter, schoolFilter, sourceFilters, search, spellGroups, selectedVersions, spellsKnown]);

  // ── "My Spells" deduped list ─────────────────────────────────────────────────
  // One entry per known spell ID. Augments description from the same-name group
  // when the known version (SRD) has no description but an imported version does.
  const dedupedMySpells = useMemo((): DedupedSpell[] => {
    return allSpells
      .filter((spell) => spellsKnown.includes(spell.id))
      .sort((a, b) => a.level - b.level || nameCompare(a, b))
      .map((spell) => {
        const key = spell.name.toLowerCase().trim();
        const group = spellGroups.get(key) ?? [spell];
        const augmented: DisplaySpell = spell.description
          ? spell
          : { ...spell, description: group.find((s) => s.description)?.description };
        return { key, spell: augmented, group };
      });
  }, [allSpells, spellsKnown, spellGroups]);

  // ── Mutation helpers ─────────────────────────────────────────────────────────
  function toggleKnown(spellId: string) {
    const isKnown = spellsKnown.includes(spellId);
    if (isKnown) {
      mutate(
        {
          spellsKnown: spellsKnown.filter((s) => s !== spellId),
          spellsPrepared: spellsPrepared.filter((s) => s !== spellId),
        },
        () => forgetSpell(character.id, spellId)
      );
    } else {
      mutate(
        { spellsKnown: [...spellsKnown, spellId] },
        () => learnSpell(character.id, spellId)
      );
    }
  }

  function togglePrepared(spellId: string) {
    const isPrepped = spellsPrepared.includes(spellId);
    if (isPrepped) {
      mutate(
        { spellsPrepared: spellsPrepared.filter((s) => s !== spellId) },
        () => unprepareSpell(character.id, spellId)
      );
    } else {
      mutate(
        { spellsPrepared: [...spellsPrepared, spellId] },
        () => prepareSpell(character.id, spellId)
      );
    }
  }

  function toggleSourceFilter(label: string) {
    setSourceFilters((prev) => {
      const next = new Set(prev);
      if (next.has(label)) next.delete(label);
      else next.add(label);
      return next;
    });
  }

  if (!open) return null;

  const browseItems = buildDisplayList(dedupedBrowseSpells, sortBy);
  const myItems = buildDisplayList(dedupedMySpells, "level");

  const maxCastableLevel = character.classId
    ? maxCastableSpellLevel(character.classId, character.level)
    : 9;

  const spellsUrl = (() => {
    const p = new URLSearchParams();
    if (search.trim()) p.set("q", search.trim());
    if (levelFilter !== null) p.set("level", String(levelFilter));
    if (schoolFilter) p.set("school", schoolFilter);
    const qs = p.toString();
    return qs ? `/spells?${qs}` : "/spells";
  })();

  const levelTooHigh = levelFilter !== null && levelFilter > 0 && !!character.classId && levelFilter > maxCastableLevel;
  const spellsLink = (
    <a href={spellsUrl} className="text-amber-400 hover:text-amber-300 underline underline-offset-2">
      View full spell reference
    </a>
  );

  let browseEmptyContent;
  if (levelTooHigh) {
    browseEmptyContent = (
      <>
        <p className="text-sm text-stone-400">You can&apos;t cast level {levelFilter} spells yet.</p>
        <p className="text-xs text-stone-500">{spellsLink} to browse without restrictions.</p>
      </>
    );
  } else if (search.trim()) {
    browseEmptyContent = (
      <>
        <p className="text-sm text-stone-400">No spells matching &ldquo;{search}&rdquo;.</p>
        <p className="text-xs text-stone-500">Try {spellsLink} to search outside your class.</p>
      </>
    );
  } else if (classOnly && schoolFilter !== null) {
    browseEmptyContent = (
      <>
        <p className="text-sm text-stone-400">
          No {SCHOOL_LABEL[schoolFilter]} spells for {srdClass?.name ?? "your class"}
          {levelFilter !== null && levelFilter > 0 ? ` at level ${levelFilter}` : ""}.
        </p>
        <p className="text-xs text-stone-500">{spellsLink} to browse without restrictions.</p>
      </>
    );
  } else {
    browseEmptyContent = (
      <>
        <p className="text-sm text-stone-400">No spells match your filters.</p>
        <p className="text-xs text-stone-500">{spellsLink} to browse without restrictions.</p>
      </>
    );
  }

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden
      />

      <div
        role="dialog"
        aria-modal
        aria-label="Manage Spells"
        className="fixed inset-x-0 bottom-0 z-50 bg-stone-900 border-t border-stone-700 rounded-t-2xl
          md:inset-auto md:top-[5vh] md:left-1/2 md:-translate-x-1/2 md:w-[min(760px,92vw)]
          md:max-h-[90vh] md:rounded-2xl md:border md:border-stone-700 flex flex-col"
        style={{ maxHeight: "92dvh" }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-4 pb-3 border-b border-stone-800 shrink-0">
          <div>
            <h2 className="text-base font-bold text-stone-100">Manage Spells</h2>
            <LimitBadges
              isPrepared={isPrepared}
              casterType={casterType}
              knownNonCantripCount={activeKnownCount}
              knownLimit={knownLimit}
              preparedCount={activePreparedCount}
              preparedLimit={preparedLimit}
              cantripCount={cantripKnownCount}
              cantripMax={cantripMax}
            />
          </div>
          <button
            onClick={onClose}
            className="min-w-[44px] min-h-[44px] flex items-center justify-center text-stone-400 hover:text-stone-200 transition-colors text-xl"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        {/* View toggle */}
        <div className="flex gap-1 px-5 py-3 border-b border-stone-800 shrink-0">
          <button
            onClick={() => setView("browse")}
            className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-colors ${
              view === "browse" ? "bg-amber-600 text-stone-950" : "bg-stone-800 text-stone-300 hover:text-stone-100"
            }`}
          >
            Browse Spells
          </button>
          <button
            onClick={() => setView("my")}
            className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-colors ${
              view === "my" ? "bg-amber-600 text-stone-950" : "bg-stone-800 text-stone-300 hover:text-stone-100"
            }`}
          >
            My Spells ({spellsKnown.length})
          </button>
        </div>

        {/* Filters — browse only */}
        {view === "browse" && (
          <div className="px-5 py-3 border-b border-stone-800 space-y-2 shrink-0">
            <div className="flex gap-2">
              <input
                type="search"
                placeholder="Search spells…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="flex-1 min-h-[40px] rounded-lg bg-stone-800 border border-stone-700 px-3 text-stone-100 text-sm focus:outline-none focus:border-amber-500"
              />
              <label className="flex items-center gap-2 min-h-[40px] px-3 rounded-lg bg-stone-800 border border-stone-700 cursor-pointer text-sm text-stone-300 hover:text-stone-100 shrink-0">
                <input
                  type="checkbox"
                  checked={classOnly}
                  onChange={(e) => setClassOnly(e.target.checked)}
                  className="accent-amber-400"
                />
                {srdClass?.name ?? "Class"} only
              </label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortBy)}
                className="min-h-[40px] px-3 rounded-lg bg-stone-800 border border-stone-700 text-stone-300 text-sm focus:outline-none focus:border-amber-500"
                aria-label="Sort spells by"
              >
                <option value="name">Name</option>
                <option value="level">Level</option>
                <option value="school">School</option>
                <option value="source">Source</option>
              </select>
            </div>

            {/* Level pills */}
            <div className="flex flex-wrap gap-1.5">
              <FilterPill active={levelFilter === null} onClick={() => setLevelFilter(null)} label="All" />
              <FilterPill active={levelFilter === 0} onClick={() => setLevelFilter(levelFilter === 0 ? null : 0)} label="Cantrip" />
              {[1,2,3,4,5,6,7,8,9].map((l) => (
                <FilterPill key={l} active={levelFilter === l} onClick={() => setLevelFilter(levelFilter === l ? null : l)} label={`L${l}`} />
              ))}
            </div>

            {/* School pills */}
            <div className="flex flex-wrap gap-1.5">
              {SCHOOLS.map((school) => (
                <FilterPill
                  key={school}
                  active={schoolFilter === school}
                  onClick={() => setSchoolFilter(schoolFilter === school ? null : school)}
                  label={SCHOOL_LABEL[school].slice(0, 4)}
                />
              ))}
            </div>

            {/* Source pills — only shown when multiple sources present */}
            {uniqueSources.length > 1 && (
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] uppercase tracking-widest text-stone-600 font-medium">
                    Sources
                  </span>
                  <select
                    value={sourceSortOrder}
                    onChange={(e) => {
                      const val = e.target.value as "alpha" | "count";
                      setSourceSortOrder(val);
                      localStorage.setItem("semper-source-sort", val);
                    }}
                    className="text-[10px] bg-transparent text-stone-500 hover:text-stone-300 border-none outline-none cursor-pointer"
                    aria-label="Sort sources by"
                  >
                    <option value="alpha">A→Z</option>
                    <option value="count">Most spells</option>
                  </select>
                </div>
                <div className="flex gap-1.5 overflow-x-auto pb-0.5 scrollbar-none">
                  <FilterPill
                    active={sourceFilters.size === 0}
                    onClick={() => setSourceFilters(new Set())}
                    label="All"
                  />
                  {uniqueSources.map((src) => (
                    <FilterPill
                      key={src}
                      active={sourceFilters.has(src)}
                      onClick={() => toggleSourceFilter(src)}
                      label={src}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Spell list */}
        <div className="overflow-y-auto flex-1 px-5 py-2">
          {(view === "browse" ? browseItems : myItems).length === 0 ? (
            <div className="py-8 text-center space-y-2">
              {view === "my" ? (
                <p className="text-stone-500 text-sm">No spells yet.</p>
              ) : (
                browseEmptyContent
              )}
            </div>
          ) : (
            <ul className="divide-y divide-stone-800/60">
              {(view === "browse" ? browseItems : myItems).map((item) => {
                if (item.type === "header") {
                  return (
                    <li key={`h-${item.label}`} className="py-2 sticky top-0 bg-stone-900 z-10">
                      <span className="text-[10px] font-semibold uppercase tracking-widest text-stone-500">
                        {item.label}
                      </span>
                    </li>
                  );
                }

                const { key, spell: resolvedSpell, group } = item;

                // Case A: SRD + one non-SRD → silently resolved, no chips.
                // Case B: multiple non-SRD versions → show version picker chips.
                const nonSrdVersions = group.filter((s) => s.sourceLabel !== "SRD");
                const hasVersionPicker = nonSrdVersions.length > 1;

                // Which version is the character currently using?
                const knownVersionId = group.find((s) => spellsKnown.includes(s.id))?.id;
                const prepVersionId = group.find((s) => spellsPrepared.includes(s.id))?.id;
                const isKnown = knownVersionId !== undefined;
                const isPrepped = prepVersionId !== undefined;

                // Active version: explicit user choice > known > resolved
                const selId = selectedVersions.get(key);
                const activeVersionId = (hasVersionPicker && selId && nonSrdVersions.some((s) => s.id === selId))
                  ? selId
                  : (knownVersionId ?? resolvedSpell.id);
                const activeSpell = group.find((s) => s.id === activeVersionId) ?? resolvedSpell;

                const isExpanded = expandedId === activeSpell.id;
                const isCantrip = activeSpell.level === 0;
                // Add is blocked when at the relevant cap (cantrips, known, or prepared).
                const addDisabled = !isKnown && (
                  (isCantrip && cantripAtLimit) ||
                  (!isCantrip && !isPrepared && knownAtLimit) ||
                  (!isCantrip && isPrepared && preparedAtLimit)
                );
                const addTitle = addDisabled
                  ? isCantrip
                    ? `Cantrip limit reached (${cantripMax})`
                    : isPrepared
                    ? `Max prepared reached (${preparedLimit})`
                    : `Max spells known reached (${knownLimit})`
                  : undefined;

                return (
                  <li key={key} className="py-3">
                    <div className="flex items-start gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-baseline gap-2 flex-wrap">
                          <span className="text-sm font-semibold text-stone-100">{activeSpell.name}</span>
                          <span className="text-[10px] uppercase tracking-widest text-stone-500 font-medium">
                            {activeSpell.level === 0 ? "Cantrip" : `Level ${activeSpell.level}`}
                          </span>
                          <span className="text-[10px] uppercase tracking-widest text-stone-600">
                            {SCHOOL_LABEL[activeSpell.school as SpellSchool] ?? activeSpell.school}
                          </span>
                          {activeSpell.concentration && (
                            <span className="text-[10px] text-violet-400">Conc.</span>
                          )}
                          {activeSpell.ritual && (
                            <span className="text-[10px] text-emerald-500">Ritual</span>
                          )}
                          <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-sky-900/40 text-sky-400 border border-sky-800/50">
                            {activeSpell.sourceLabel}
                          </span>
                        </div>
                        <p className="text-xs text-stone-500 mt-0.5">
                          {activeSpell.castingTime} · {activeSpell.range} · {activeSpell.duration}
                        </p>

                        {/* Version picker chips — Case B only */}
                        {hasVersionPicker && (
                          <div className="flex gap-1 mt-1.5 flex-wrap">
                            {nonSrdVersions.map((v) => (
                              <button
                                key={v.id}
                                onClick={() =>
                                  setSelectedVersions((prev) => new Map(prev).set(key, v.id))
                                }
                                className={`text-[10px] px-1.5 py-0.5 rounded border font-semibold transition-colors ${
                                  v.id === activeVersionId
                                    ? "bg-sky-900/60 text-sky-300 border-sky-700"
                                    : "bg-stone-800 text-stone-500 border-stone-700 hover:text-stone-300"
                                }`}
                              >
                                {v.sourceLabel}
                              </button>
                            ))}
                          </div>
                        )}

                        {activeSpell.description && (
                          <button
                            onClick={() => setExpandedId(isExpanded ? null : activeSpell.id)}
                            className="text-xs text-amber-500 hover:text-amber-400 mt-1 transition-colors"
                          >
                            {isExpanded ? "▲ Hide description" : "▼ Show description"}
                          </button>
                        )}
                        {isExpanded && activeSpell.description && (
                          <div
                            className="mt-2 text-xs text-stone-300 leading-relaxed prose prose-invert prose-sm max-w-none
                              [&_p]:mb-2 [&_ul]:pl-4 [&_ul]:list-disc [&_em]:italic [&_strong]:font-semibold"
                            dangerouslySetInnerHTML={{ __html: activeSpell.description }}
                          />
                        )}
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        {view === "my" ? (
                          /* ── My Spells buttons ─────────────────────────── */
                          <>
                            {isPrepared ? (
                              isCantrip ? (
                                <span className="text-[10px] font-semibold px-2 py-1 rounded bg-amber-900/30 text-amber-500/70 border border-amber-900/40">
                                  Cantrip
                                </span>
                              ) : (
                                <button
                                  onClick={() => togglePrepared(prepVersionId ?? activeVersionId)}
                                  disabled={!isPrepped && preparedAtLimit}
                                  title={!isPrepped && preparedAtLimit ? `Max prepared reached (${preparedLimit})` : undefined}
                                  className={`min-h-[36px] px-3 rounded-lg text-xs font-semibold transition-colors disabled:opacity-40 disabled:cursor-not-allowed ${
                                    isPrepped
                                      ? "bg-amber-600/20 border border-amber-600 text-amber-400 hover:bg-amber-600/30"
                                      : "bg-stone-800 border border-stone-700 text-stone-400 hover:text-stone-200"
                                  }`}
                                >
                                  {isPrepped ? "Prepared" : "Prepare"}
                                </button>
                              )
                            ) : (
                              <span className="text-[10px] font-semibold px-2 py-1 rounded bg-stone-800 text-stone-500 border border-stone-700">
                                Known
                              </span>
                            )}
                            <button
                              onClick={() => toggleKnown(knownVersionId!)}
                              className="min-h-[36px] px-3 rounded-lg text-xs font-semibold transition-colors bg-red-900/30 border border-red-800 text-red-400 hover:bg-red-900/50"
                            >
                              {isPrepared ? "Remove" : "Forget"}
                            </button>
                          </>
                        ) : (
                          /* ── Browse buttons ────────────────────────────── */
                          <>
                            {isPrepared && isKnown && !isCantrip && (
                              <button
                                onClick={() => togglePrepared(prepVersionId ?? activeVersionId)}
                                disabled={!isPrepped && preparedAtLimit}
                                title={!isPrepped && preparedAtLimit ? `Max prepared reached (${preparedLimit})` : undefined}
                                className={`min-h-[36px] px-3 rounded-lg text-xs font-semibold transition-colors disabled:opacity-40 disabled:cursor-not-allowed ${
                                  isPrepped
                                    ? "bg-amber-600/20 border border-amber-600 text-amber-400 hover:bg-amber-600/30"
                                    : "bg-stone-800 border border-stone-700 text-stone-400 hover:text-stone-200"
                                }`}
                              >
                                {isPrepped ? "Prepared" : "Prepare"}
                              </button>
                            )}
                            <button
                              onClick={() => {
                                if (isPrepared && !isKnown && !isCantrip) {
                                  mutate(
                                    {
                                      spellsKnown: [...spellsKnown, activeVersionId],
                                      spellsPrepared: [...spellsPrepared, activeVersionId],
                                    },
                                    async () => {
                                      await learnSpell(character.id, activeVersionId);
                                      await prepareSpell(character.id, activeVersionId);
                                    }
                                  );
                                } else {
                                  toggleKnown(isKnown ? knownVersionId! : activeVersionId);
                                }
                              }}
                              disabled={addDisabled}
                              title={addTitle}
                              className={`min-h-[36px] px-3 rounded-lg text-xs font-semibold transition-colors disabled:opacity-40 disabled:cursor-not-allowed ${
                                isKnown
                                  ? "bg-red-900/30 border border-red-800 text-red-400 hover:bg-red-900/50"
                                  : "bg-amber-600 text-stone-950 hover:bg-amber-500"
                              }`}
                            >
                              {isKnown
                                ? (isPrepared ? "Remove" : "Forget")
                                : (isPrepared && !isCantrip ? "Prepare" : "Add")}
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>
    </>
  );
}

// ── Sub-components ────────────────────────────────────────────────────────────

interface LimitBadgesProps {
  isPrepared: boolean;
  casterType: ReturnType<typeof getCasterType>;
  knownNonCantripCount: number;
  knownLimit: number | null;
  preparedCount: number;
  preparedLimit: number | null;
  cantripCount: number;
  cantripMax: number;
}

function LimitBadges({
  isPrepared, casterType,
  knownNonCantripCount, knownLimit,
  preparedCount, preparedLimit,
  cantripCount, cantripMax,
}: LimitBadgesProps) {
  if (!casterType) return null;

  const cantripNear = cantripMax > 0 && cantripCount >= cantripMax - 1;
  const cantripLine = cantripMax > 0 ? (
    <span className={cantripNear ? "text-amber-400" : ""}>
      {" · "}{cantripCount}/{cantripMax} cantrips
    </span>
  ) : null;

  if (isPrepared) {
    const over = preparedLimit !== null && preparedCount > preparedLimit;
    const near = preparedLimit !== null && preparedLimit > 0 && preparedCount >= preparedLimit - 1;
    return (
      <p className={`text-xs mt-0.5 ${over || near ? "text-amber-400" : "text-stone-500"}`}>
        {preparedCount} prepared
        {preparedLimit !== null && ` · max ${preparedLimit}`}
        {over && " ⚠ over limit"}
        {cantripLine}
      </p>
    );
  }

  if (casterType === "known") {
    const over = knownLimit !== null && knownNonCantripCount > knownLimit;
    const near = knownLimit !== null && knownLimit > 0 && knownNonCantripCount >= knownLimit - 1;
    return (
      <p className={`text-xs mt-0.5 ${over || near ? "text-amber-400" : "text-stone-500"}`}>
        {knownNonCantripCount}/{knownLimit ?? "?"} spells known
        {over && " ⚠ over limit"}
        {cantripLine}
      </p>
    );
  }

  return null;
}
