"use client";

import { useState, useMemo } from "react";
import { useWizardStore } from "@/lib/stores/wizard-store";
import type { SrdRace, ContentSource } from "@/lib/content/srd";
import type { FeatureEntry } from "@/app/actions/content";

const SOURCE_COLORS: Record<ContentSource, string> = {
  SRD:    "bg-stone-700 text-stone-300",
  Aurora: "bg-indigo-900/60 text-indigo-300 border border-indigo-700/50",
};

const SOURCE_CHIP_ACTIVE: Record<ContentSource, string> = {
  SRD:    "bg-stone-500 text-stone-100",
  Aurora: "bg-indigo-600 text-indigo-100",
};

function cleanHtml(html: string, featureMap?: Map<string, FeatureEntry>, depth = 3): string {
  if (!html) return "";
  let result = html.replace(/<div\s+element="([^"]+)"[^>]*\/?>/gi, (_, id) => {
    if (depth > 0 && featureMap && featureMap.size > 0) {
      const f = featureMap.get(id);
      if (f) return `<h5>${f.name}</h5>${cleanHtml(f.description, featureMap, depth - 1)}`;
    }
    return "";
  });
  result = result.replace(/<div[^>]*class="reference"[^>]*>[\s\S]*?<\/div>/gi, "");
  result = result.replace(/<\/?div[^>]*>/gi, "");
  return result.trim();
}

export function StepRace({
  races,
  featureMap,
}: {
  races: SrdRace[];
  featureMap: Map<string, FeatureEntry>;
}) {
  const { raceId, setRaceId, setSubraceId } = useWizardStore();
  const [sourceFilters, setSourceFilters] = useState(() => new Set<string>());

  const allLabels = useMemo(() => {
    const seen = new Set<string>();
    for (const r of races) seen.add(r.sourceLabel ?? "SRD");
    return [...seen].sort();
  }, [races]);

  // Groups: one entry per unique race name, sorted alphabetically.
  const groups = useMemo(() => {
    const map = new Map<string, SrdRace[]>();
    for (const r of races) {
      const arr = map.get(r.name) ?? [];
      arr.push(r);
      map.set(r.name, arr);
    }
    return [...map.values()].sort((a, b) => a[0].name.localeCompare(b[0].name));
  }, [races]);

  // Hide groups with no variants matching the active filter, but always keep the selected group.
  const visibleGroups = useMemo(() => {
    if (sourceFilters.size === 0) return groups;
    return groups.filter((group) =>
      group.some((r) => r.id === raceId) ||
      group.some((r) => sourceFilters.has(r.sourceLabel ?? "SRD"))
    );
  }, [groups, sourceFilters, raceId]);

  function toggleSource(label: string) {
    setSourceFilters((prev) => {
      const next = new Set(prev);
      if (next.has(label)) next.delete(label); else next.add(label);
      return next;
    });
  }

  return (
    <div>
      <h2 className="text-2xl font-bold mb-1">Choose a race</h2>
      <p className="text-stone-400 mb-4">Your race shapes your appearance, traits, and some abilities.</p>

      {allLabels.length > 1 && (
        <div className="flex flex-wrap gap-1.5 mb-5">
          <button
            onClick={() => setSourceFilters(new Set())}
            className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
              sourceFilters.size === 0
                ? "bg-amber-600 text-stone-950"
                : "border border-stone-700 text-stone-400 hover:text-stone-200"
            }`}
          >
            All
          </button>
          {allLabels.map((label) => (
            <button
              key={label}
              onClick={() => toggleSource(label)}
              className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                sourceFilters.has(label)
                  ? "bg-amber-600 text-stone-950"
                  : "border border-stone-700 text-stone-400 hover:text-stone-200"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      )}

      <div className="space-y-2">
        {visibleGroups.map((group) => {
          const visibleVariants = sourceFilters.size === 0
            ? group
            : group.filter((r) => sourceFilters.has(r.sourceLabel ?? "SRD") || r.id === raceId);

          const isGroupSelected = group.some((r) => r.id === raceId);
          const activeVariant = group.find((r) => r.id === raceId) ?? visibleVariants[0];
          const isMulti = visibleVariants.length > 1;

          return (
            <div
              key={group[0].name}
              className={`rounded-lg border transition-colors ${
                isGroupSelected
                  ? "border-amber-500 bg-amber-900/20"
                  : "border-stone-700 bg-stone-900 hover:border-stone-500"
              }`}
            >
              {/* Card header */}
              <button
                className="w-full p-4 text-left"
                onClick={() => {
                  if (!isGroupSelected) {
                    setRaceId(visibleVariants[0].id);
                    setSubraceId("");
                  }
                }}
              >
                <div className="flex items-start justify-between gap-3">
                  <p className={`text-sm font-semibold ${isGroupSelected ? "text-amber-300" : "text-stone-200"}`}>
                    {activeVariant.name}
                  </p>
                  <div className="flex items-center gap-2 shrink-0">
                    {!isMulti && activeVariant.sourceLabel && (
                      <span className={`text-[10px] rounded px-1.5 py-0.5 font-medium ${SOURCE_COLORS[activeVariant.source ?? "SRD"]}`}>
                        {activeVariant.sourceLabel}
                      </span>
                    )}
                    <span className="text-xs text-stone-500">{activeVariant.size} · {activeVariant.speed} ft</span>
                  </div>
                </div>
                {!isGroupSelected && (
                  <p className="text-xs text-stone-500 mt-0.5">
                    {Object.entries(activeVariant.abilityScoreBonuses)
                      .map(([k, v]) => `+${v} ${k.toUpperCase()}`)
                      .join(", ")}
                    {activeVariant.flexibleBonuses && ` · +${activeVariant.flexibleBonuses.amount}×${activeVariant.flexibleBonuses.count} (choice)`}
                    {activeVariant.subraces.length > 0 && ` · ${activeVariant.subraces.length} subraces`}
                  </p>
                )}
              </button>

              {/* Source chips — only shown when 2+ variants */}
              {isMulti && (
                <div className="flex flex-wrap gap-1 px-4 pb-2">
                  {visibleVariants.map((variant) => (
                    <button
                      key={variant.id}
                      onClick={() => { setRaceId(variant.id); setSubraceId(""); }}
                      className={`text-[10px] rounded px-1.5 py-0.5 font-medium transition-colors ${
                        raceId === variant.id
                          ? SOURCE_CHIP_ACTIVE[variant.source ?? "SRD"]
                          : SOURCE_COLORS[variant.source ?? "SRD"]
                      } hover:opacity-80`}
                    >
                      {variant.sourceLabel ?? "SRD"}
                    </button>
                  ))}
                </div>
              )}

              {/* Expanded detail */}
              {isGroupSelected && activeVariant && (
                <div className="px-4 pb-4 border-t border-stone-700/40 pt-3 mt-0.5">
                  <div className="flex flex-wrap gap-2 mb-3">
                    {Object.entries(activeVariant.abilityScoreBonuses).map(([k, v]) => (
                      <span key={k} className="text-xs rounded-full bg-stone-800 px-2 py-0.5 text-amber-300">
                        +{v} {k.toUpperCase()}
                      </span>
                    ))}
                    {activeVariant.flexibleBonuses && (
                      <span className="text-xs rounded-full bg-stone-800 px-2 py-0.5 text-amber-200">
                        +{activeVariant.flexibleBonuses.amount}×{activeVariant.flexibleBonuses.count} (your choice)
                      </span>
                    )}
                  </div>

                  {activeVariant.description && (
                    <div
                      className="aurora-content text-sm text-stone-300 overflow-x-auto mb-3"
                      dangerouslySetInnerHTML={{ __html: cleanHtml(activeVariant.description, featureMap) }}
                    />
                  )}

                  {activeVariant.subraces.length > 0 && (
                    <p className="text-xs text-stone-500 mt-1">
                      {activeVariant.subraces.length} subrace{activeVariant.subraces.length !== 1 ? "s" : ""} available — choose on the next step.
                    </p>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
