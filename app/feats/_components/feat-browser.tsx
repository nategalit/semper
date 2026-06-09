"use client";

import { useState, useMemo } from "react";
import type { FeatElement } from "@/lib/content/schema";
import { abbreviateSource } from "@/lib/content/source-abbreviations";
import { FilterPill } from "@/app/_components/filter-pill";
import { ExpandableCard } from "@/app/_components/expandable-card";
import { chip, sourceChipClass } from "@/lib/ui-tokens";
import { cleanHtmlBrowse } from "@/lib/content/aurora/clean-html";

function isHalfFeat(feat: FeatElement): boolean {
  return feat.rules.choices.some(
    (c) => c.kind === "element" && c.type === "Ability Score Improvement"
  );
}

type TypeFilter = "all" | "full" | "half";
type SortBy = "name" | "source";

interface Props {
  feats: FeatElement[];
}

export function FeatBrowser({ feats }: Props) {
  const [search, setSearch] = useState("");
  const [sourceFilters, setSourceFilters] = useState<Set<string>>(() => new Set());
  const [typeFilter, setTypeFilter] = useState<TypeFilter>("all");
  const [sortBy, setSortBy] = useState<SortBy>("name");
  const [expandedIds, setExpandedIds] = useState<Set<string>>(() => new Set());

  const uniqueSources = useMemo(
    () => [...new Set(feats.map((f) => abbreviateSource(f.source)))].sort(),
    [feats]
  );

  const displayFeats = useMemo(() => {
    const q = search.toLowerCase();
    return feats
      .filter((feat) => {
        if (q && !feat.name.toLowerCase().includes(q)) return false;
        if (sourceFilters.size > 0 && !sourceFilters.has(abbreviateSource(feat.source)))
          return false;
        if (typeFilter === "full" && isHalfFeat(feat)) return false;
        if (typeFilter === "half" && !isHalfFeat(feat)) return false;
        return true;
      })
      .sort((a, b) => {
        if (sortBy === "source") {
          const src = abbreviateSource(a.source).localeCompare(abbreviateSource(b.source));
          if (src !== 0) return src;
        }
        return a.name.localeCompare(b.name, undefined, { sensitivity: "base" });
      });
  }, [feats, search, sourceFilters, typeFilter, sortBy]);

  function toggleSource(label: string) {
    setSourceFilters((prev) => {
      const next = new Set(prev);
      if (next.has(label)) next.delete(label);
      else next.add(label);
      return next;
    });
  }

  function toggleExpand(id: string) {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
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
              placeholder="Search feats…"
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
              <option value="source">Source</option>
            </select>
          </div>

          <div className="flex flex-wrap gap-1.5">
            <FilterPill active={typeFilter === "all"} onClick={() => setTypeFilter("all")} label="All feats" />
            <FilterPill active={typeFilter === "full"} onClick={() => setTypeFilter("full")} label="Full feat" />
            <FilterPill active={typeFilter === "half"} onClick={() => setTypeFilter("half")} label="Half feat (+1 ability)" />
          </div>

          {uniqueSources.length > 1 && (
            <div className="space-y-1">
              <span className="text-[10px] uppercase tracking-widest text-stone-600 font-medium">
                Source
              </span>
              <div className="flex flex-wrap gap-1.5">
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

      <main className="max-w-5xl mx-auto px-4 py-4">
        {feats.length === 0 ? (
          <p className="text-sm text-stone-500 text-center py-16">
            No feats found. Import Aurora content in{" "}
            <a href="/settings/content" className="text-amber-400 hover:underline">
              Settings → Content
            </a>{" "}
            to browse feats.
          </p>
        ) : (
          <>
            <p className="text-xs text-stone-600 mb-3 tabular-nums">
              {displayFeats.length} feat{displayFeats.length !== 1 ? "s" : ""}
            </p>

            {displayFeats.length === 0 ? (
              <p className="text-sm text-stone-500 text-center py-16">
                No feats match your filters.
              </p>
            ) : (
              <ul className="space-y-1.5">
                {displayFeats.map((feat) => {
                  const sourceLabel = abbreviateSource(feat.source);
                  const half = isHalfFeat(feat);
                  const rawDesc = feat.description || feat.sheetText || "";
                  const htmlDesc = rawDesc ? cleanHtmlBrowse(rawDesc) : null;

                  return (
                    <li key={feat.id}>
                      <ExpandableCard
                        expanded={expandedIds.has(feat.id)}
                        onToggle={() => toggleExpand(feat.id)}
                        header={
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-sm font-semibold text-stone-200">
                              {feat.name}
                            </span>
                            {half && (
                              <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded border ${chip.type.half}`}>
                                +1 ability
                              </span>
                            )}
                            <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${sourceChipClass(sourceLabel)}`}>
                              {sourceLabel}
                            </span>
                          </div>
                        }
                      >
                        {feat.prerequisite && (
                          <p className="text-xs text-amber-600/80 mb-2">
                            Requires: {feat.prerequisite}
                          </p>
                        )}
                        {htmlDesc ? (
                          <div
                            className="aurora-content text-xs text-stone-300 leading-relaxed"
                            dangerouslySetInnerHTML={{ __html: htmlDesc }}
                          />
                        ) : (
                          <p className="text-xs text-stone-600 italic">
                            No description available.
                          </p>
                        )}
                      </ExpandableCard>
                    </li>
                  );
                })}
              </ul>
            )}
          </>
        )}
      </main>
    </>
  );
}
