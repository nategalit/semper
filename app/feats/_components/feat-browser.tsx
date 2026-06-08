"use client";

import { useState, useMemo } from "react";
import type { FeatElement } from "@/lib/content/schema";
import { abbreviateSource } from "@/lib/content/source-abbreviations";
import { FilterPill } from "@/app/_components/filter-pill";
import { sourceChipClass } from "@/lib/ui-tokens";

function isHalfFeat(feat: FeatElement): boolean {
  return feat.rules.choices.some(
    (c) => c.kind === "element" && c.type === "Ability Score Improvement"
  );
}

function stripHtml(html: string): string {
  return html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}

type TypeFilter = "all" | "full" | "half";

interface Props {
  feats: FeatElement[];
}

export function FeatBrowser({ feats }: Props) {
  const [search, setSearch] = useState("");
  const [sourceFilters, setSourceFilters] = useState<Set<string>>(() => new Set());
  const [typeFilter, setTypeFilter] = useState<TypeFilter>("all");

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
      .sort((a, b) => a.name.localeCompare(b.name, undefined, { sensitivity: "base" }));
  }, [feats, search, sourceFilters, typeFilter]);

  function toggleSource(label: string) {
    setSourceFilters((prev) => {
      const next = new Set(prev);
      if (next.has(label)) next.delete(label);
      else next.add(label);
      return next;
    });
  }

  return (
    <>
      {/* Sticky filter bar */}
      <div className="sticky top-0 z-10 bg-stone-950 border-b border-stone-800 px-4 py-4 space-y-3">
        <div className="max-w-5xl mx-auto space-y-3">
          {/* Search */}
          <input
            type="search"
            placeholder="Search feats…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full min-h-[40px] rounded-lg bg-stone-800 border border-stone-700 px-3
              text-stone-100 text-sm focus:outline-none focus:border-amber-500"
          />

          {/* Type filter */}
          <div className="flex flex-wrap gap-1.5">
            <FilterPill active={typeFilter === "all"} onClick={() => setTypeFilter("all")} label="All feats" />
            <FilterPill active={typeFilter === "full"} onClick={() => setTypeFilter("full")} label="Full feat" />
            <FilterPill active={typeFilter === "half"} onClick={() => setTypeFilter("half")} label="Half feat (+1 ability)" />
          </div>

          {/* Source filter — only shown when multiple sources exist */}
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

      {/* Feat list */}
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
            <p className="text-xs text-stone-600 mb-4 tabular-nums">
              {displayFeats.length} feat{displayFeats.length !== 1 ? "s" : ""}
            </p>

            {displayFeats.length === 0 ? (
              <p className="text-sm text-stone-500 text-center py-16">
                No feats match your filters.
              </p>
            ) : (
              <ul className="divide-y divide-stone-800/60">
                {displayFeats.map((feat) => {
                  const sourceLabel = abbreviateSource(feat.source);
                  const half = isHalfFeat(feat);
                  const desc = feat.description
                    ? stripHtml(feat.description)
                    : feat.sheetText
                    ? stripHtml(feat.sheetText)
                    : null;

                  return (
                    <li key={feat.id} className="py-4">
                      {/* Name row */}
                      <div className="flex items-baseline gap-2 flex-wrap mb-1">
                        <span className="text-sm font-semibold text-stone-100">{feat.name}</span>
                        {half && (
                          <span className="text-[10px] font-medium px-1.5 py-0.5 rounded
                            bg-amber-900/40 text-amber-400 border border-amber-800/50">
                            Half feat
                          </span>
                        )}
                        <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${sourceChipClass(sourceLabel)}`}>
                          {sourceLabel}
                        </span>
                      </div>

                      {/* Prerequisite */}
                      {feat.prerequisite && (
                        <p className="text-xs text-stone-500 mb-1">
                          Prerequisite: {feat.prerequisite}
                        </p>
                      )}

                      {/* Description */}
                      {desc ? (
                        <p className="text-xs text-stone-300 leading-relaxed">{desc}</p>
                      ) : (
                        <p className="text-xs text-stone-600 italic">
                          No description available.
                        </p>
                      )}
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

