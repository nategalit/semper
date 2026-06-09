"use client";

import { useState, useMemo } from "react";
import type { DisplaySpell } from "@/lib/types/spell";
import type { SpellSchool } from "@/lib/content/srd";
import { FilterPill } from "@/app/_components/filter-pill";
import { ExpandableCard } from "@/app/_components/expandable-card";
import { sourceChipClass } from "@/lib/ui-tokens";
import { cleanHtmlBrowse } from "@/lib/content/aurora/clean-html";

const SCHOOLS: SpellSchool[] = [
  "abjuration","conjuration","divination","enchantment",
  "evocation","illusion","necromancy","transmutation",
];

const SCHOOL_LABEL: Record<SpellSchool, string> = {
  abjuration:"Abjuration", conjuration:"Conjuration", divination:"Divination",
  enchantment:"Enchantment", evocation:"Evocation", illusion:"Illusion",
  necromancy:"Necromancy", transmutation:"Transmutation",
};

const CASTER_CLASS_NAMES: Record<string, string> = {
  ID_CLASS_BARD: "Bard",
  ID_CLASS_CLERIC: "Cleric",
  ID_CLASS_DRUID: "Druid",
  ID_CLASS_PALADIN: "Paladin",
  ID_CLASS_RANGER: "Ranger",
  ID_CLASS_SORCERER: "Sorcerer",
  ID_CLASS_WARLOCK: "Warlock",
  ID_CLASS_WIZARD: "Wizard",
};

type SortBy = "name" | "level" | "school" | "source";

interface DedupedSpell {
  key: string;
  spell: DisplaySpell;
}

const nameCompare = (a: DisplaySpell, b: DisplaySpell) =>
  a.name.localeCompare(b.name, undefined, { sensitivity: "base" });

function getBestVersion(group: DisplaySpell[]): DisplaySpell {
  const nonSrdWithDesc = group.find((s) => s.sourceLabel !== "SRD" && s.description);
  if (nonSrdWithDesc) return nonSrdWithDesc;
  const anyWithDesc = group.find((s) => s.description);
  if (anyWithDesc) return anyWithDesc;
  return group[0];
}

interface Props {
  allSpells: DisplaySpell[];
  initialSearch?: string;
  initialLevel?: number | null;
  initialSchool?: SpellSchool | null;
}

export function SpellBrowser({ allSpells, initialSearch = "", initialLevel = null, initialSchool = null }: Props) {
  const [search, setSearch] = useState(initialSearch);
  const [levelFilter, setLevelFilter] = useState<number | null>(initialLevel);
  const [schoolFilter, setSchoolFilter] = useState<SpellSchool | null>(initialSchool);
  const [classFilters, setClassFilters] = useState<Set<string>>(() => new Set());
  const [sourceFilters, setSourceFilters] = useState<Set<string>>(() => new Set());
  const [sortBy, setSortBy] = useState<SortBy>("name");
  const [expandedIds, setExpandedIds] = useState<Set<string>>(() => new Set());

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

  const dedupedAll = useMemo((): DedupedSpell[] => {
    const seen = new Set<string>();
    const result: DedupedSpell[] = [];
    for (const spell of allSpells) {
      const key = spell.name.toLowerCase().trim();
      if (seen.has(key)) continue;
      seen.add(key);
      const group = spellGroups.get(key) ?? [spell];
      result.push({ key, spell: getBestVersion(group) });
    }
    return result;
  }, [allSpells, spellGroups]);

  const uniqueSources = useMemo(
    () => [...new Set(allSpells.map((s) => s.sourceLabel))].sort(),
    [allSpells]
  );

  const uniqueClassIds = useMemo(() => {
    const ids = new Set<string>();
    for (const spell of allSpells) {
      for (const c of spell.classes) {
        if (CASTER_CLASS_NAMES[c]) ids.add(c);
      }
    }
    return [...ids].sort((a, b) =>
      (CASTER_CLASS_NAMES[a] ?? a).localeCompare(CASTER_CLASS_NAMES[b] ?? b)
    );
  }, [allSpells]);

  const displaySpells = useMemo((): DedupedSpell[] => {
    const q = search.toLowerCase();
    const filtered = dedupedAll.filter(({ spell }) => {
      if (q && !spell.name.toLowerCase().includes(q)) return false;
      if (levelFilter !== null && spell.level !== levelFilter) return false;
      if (schoolFilter && spell.school !== schoolFilter) return false;
      if (classFilters.size > 0 && !spell.classes.some((c) => classFilters.has(c))) return false;
      if (sourceFilters.size > 0 && !sourceFilters.has(spell.sourceLabel)) return false;
      return true;
    });

    const sorted = [...filtered];
    switch (sortBy) {
      case "name":   sorted.sort((a, b) => nameCompare(a.spell, b.spell)); break;
      case "level":  sorted.sort((a, b) => a.spell.level - b.spell.level || nameCompare(a.spell, b.spell)); break;
      case "school": sorted.sort((a, b) => a.spell.school.localeCompare(b.spell.school) || nameCompare(a.spell, b.spell)); break;
      case "source": sorted.sort((a, b) => a.spell.sourceLabel.localeCompare(b.spell.sourceLabel) || nameCompare(a.spell, b.spell)); break;
    }
    return sorted;
  }, [dedupedAll, search, levelFilter, schoolFilter, classFilters, sourceFilters, sortBy]);

  function toggleClass(id: string) {
    setClassFilters((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  }

  function toggleSource(label: string) {
    setSourceFilters((prev) => {
      const next = new Set(prev);
      if (next.has(label)) next.delete(label); else next.add(label);
      return next;
    });
  }

  function toggleExpand(key: string) {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key); else next.add(key);
      return next;
    });
  }

  return (
    <>
      {/* Sticky filter bar */}
      <div className="sticky top-0 z-10 bg-stone-950 border-b border-stone-800 px-4 py-4 space-y-3">
        <div className="max-w-5xl mx-auto space-y-3">
          <div className="flex gap-2">
            <input
              type="search"
              placeholder="Search spells…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex-1 min-h-[40px] rounded-lg bg-stone-800 border border-stone-700 px-3
                text-stone-100 text-sm focus:outline-none focus:border-amber-500"
            />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortBy)}
              className="min-h-[40px] px-3 rounded-lg bg-stone-800 border border-stone-700
                text-stone-300 text-sm focus:outline-none focus:border-amber-500"
              aria-label="Sort by"
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
            <FilterPill
              active={levelFilter === 0}
              onClick={() => setLevelFilter(levelFilter === 0 ? null : 0)}
              label="Cantrip"
            />
            {[1,2,3,4,5,6,7,8,9].map((l) => (
              <FilterPill
                key={l}
                active={levelFilter === l}
                onClick={() => setLevelFilter(levelFilter === l ? null : l)}
                label={`L${l}`}
              />
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

          {uniqueClassIds.length > 0 && (
            <div className="space-y-1">
              <span className="text-[10px] uppercase tracking-widest text-stone-600 font-medium">
                Class
              </span>
              <div className="flex flex-wrap gap-1.5">
                {uniqueClassIds.map((id) => (
                  <FilterPill
                    key={id}
                    active={classFilters.has(id)}
                    onClick={() => toggleClass(id)}
                    label={CASTER_CLASS_NAMES[id]}
                  />
                ))}
              </div>
            </div>
          )}

          {uniqueSources.length > 1 && (
            <div className="space-y-1">
              <span className="text-[10px] uppercase tracking-widest text-stone-600 font-medium">
                Source
              </span>
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
                    onClick={() => toggleSource(src)}
                    label={src}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Spell list */}
      <main className="max-w-5xl mx-auto px-4 py-4">
        <p className="text-xs text-stone-600 mb-3 tabular-nums">
          {displaySpells.length} spell{displaySpells.length !== 1 ? "s" : ""}
        </p>

        {displaySpells.length === 0 ? (
          <p className="text-sm text-stone-500 text-center py-16">
            No spells match your filters.
          </p>
        ) : (
          <ul className="space-y-1.5">
            {displaySpells.map(({ key, spell }) => {
              const classNames = spell.classes
                .map((c) => CASTER_CLASS_NAMES[c])
                .filter(Boolean)
                .sort()
                .join(" · ");

              return (
                <li key={key}>
                  <ExpandableCard
                    expanded={expandedIds.has(key)}
                    onToggle={() => toggleExpand(key)}
                    header={
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-semibold text-stone-200">
                          {spell.name}
                        </span>
                        <span className="text-[10px] uppercase tracking-widest text-stone-500 font-medium">
                          {spell.level === 0 ? "Cantrip" : `L${spell.level}`}
                        </span>
                        <span className="text-[10px] uppercase tracking-widest text-stone-600">
                          {SCHOOL_LABEL[spell.school as SpellSchool] ?? spell.school}
                        </span>
                        {spell.concentration && (
                          <span className="text-[10px] text-violet-400">Conc.</span>
                        )}
                        {spell.ritual && (
                          <span className="text-[10px] text-emerald-500">Ritual</span>
                        )}
                        <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${sourceChipClass(spell.sourceLabel)}`}>
                          {spell.sourceLabel}
                        </span>
                      </div>
                    }
                  >
                    <p className="text-xs text-stone-500 mb-3">
                      {spell.castingTime} · {spell.range} · {spell.duration}
                      {spell.components && ` · ${spell.components}`}
                    </p>

                    {spell.description ? (
                      <div
                        className="aurora-content text-xs text-stone-300 leading-relaxed"
                        dangerouslySetInnerHTML={{ __html: cleanHtmlBrowse(spell.description) }}
                      />
                    ) : (
                      <p className="text-xs text-stone-600 italic">
                        No description available. Import Aurora Legacy for full text.
                      </p>
                    )}

                    {classNames && (
                      <p className="mt-3 text-[10px] text-stone-600">{classNames}</p>
                    )}
                  </ExpandableCard>
                </li>
              );
            })}
          </ul>
        )}
      </main>
    </>
  );
}
