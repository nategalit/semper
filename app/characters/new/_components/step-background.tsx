"use client";

import { useState, useMemo } from "react";
import { useWizardStore } from "@/lib/stores/wizard-store";
import type { SrdBackground } from "@/lib/content/srd";
import type { FeatureEntry } from "@/app/actions/content";
import { sourceChipClass } from "@/lib/ui-tokens";

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

function bgKey(bg: SrdBackground) {
  return `${bg.id}:${bg.sourceLabel ?? ""}`;
}

export function StepBackground({
  backgrounds,
  featureMap,
}: {
  backgrounds: SrdBackground[];
  featureMap: Map<string, FeatureEntry>;
}) {
  const { backgroundId, setBackgroundId } = useWizardStore();
  const [sourceFilters, setSourceFilters] = useState(() => new Set<string>());

  const allLabels = useMemo(() => {
    const seen = new Set<string>();
    for (const b of backgrounds) seen.add(b.sourceLabel ?? "SRD");
    return [...seen].sort();
  }, [backgrounds]);

  // Groups: one entry per unique background name, sorted alphabetically.
  const groups = useMemo(() => {
    const map = new Map<string, SrdBackground[]>();
    for (const b of backgrounds) {
      const arr = map.get(b.name) ?? [];
      arr.push(b);
      map.set(b.name, arr);
    }
    return [...map.values()].sort((a, b) => a[0].name.localeCompare(b[0].name));
  }, [backgrounds]);

  // Hide groups with no variants matching the active filter, but always keep the selected group.
  const visibleGroups = useMemo(() => {
    if (sourceFilters.size === 0) return groups;
    return groups.filter((group) =>
      group.some((b) => bgKey(b) === backgroundId) ||
      group.some((b) => sourceFilters.has(b.sourceLabel ?? "SRD"))
    );
  }, [groups, sourceFilters, backgroundId]);

  function toggleSource(label: string) {
    setSourceFilters((prev) => {
      const next = new Set(prev);
      if (next.has(label)) next.delete(label); else next.add(label);
      return next;
    });
  }

  return (
    <div>
      <h2 className="text-2xl font-bold mb-1">Choose a background</h2>
      <p className="text-stone-400 mb-4">Your background reflects where you came from and what you did before adventuring.</p>

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
            : group.filter((b) => sourceFilters.has(b.sourceLabel ?? "SRD") || bgKey(b) === backgroundId);

          const isGroupSelected = group.some((b) => bgKey(b) === backgroundId);
          const activeVariant = group.find((b) => bgKey(b) === backgroundId) ?? visibleVariants[0];
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
                onClick={() => { if (!isGroupSelected) setBackgroundId(bgKey(visibleVariants[0])); }}
              >
                <div className="flex items-start justify-between gap-3">
                  <span className={`text-sm font-semibold ${isGroupSelected ? "text-amber-300" : "text-stone-200"}`}>
                    {activeVariant.name}
                  </span>
                  {!isMulti && activeVariant.sourceLabel && (
                    <span className={`text-[10px] rounded px-1.5 py-0.5 font-medium shrink-0 ${sourceChipClass(activeVariant.source)}`}>
                      {activeVariant.sourceLabel}
                    </span>
                  )}
                </div>
                {!isGroupSelected && (
                  <p className="text-xs text-stone-500 mt-0.5">
                    Skills: {activeVariant.skillProficiencies.join(", ")}
                    {activeVariant.toolProficiency && ` · ${activeVariant.toolProficiency}`}
                    {activeVariant.languages && ` · +${activeVariant.languages} language${activeVariant.languages > 1 ? "s" : ""}`}
                  </p>
                )}
              </button>

              {/* Source chips — only shown when 2+ variants */}
              {isMulti && (
                <div className="flex flex-wrap gap-1 px-4 pb-2">
                  {visibleVariants.map((variant) => (
                    <button
                      key={bgKey(variant)}
                      onClick={() => setBackgroundId(bgKey(variant))}
                      className={`text-[10px] rounded px-1.5 py-0.5 font-medium transition-colors ${
                        sourceChipClass(variant.source, backgroundId === bgKey(variant))
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
                  {activeVariant.description && (
                    <div
                      className="aurora-content text-sm text-stone-300 overflow-x-auto mb-3"
                      dangerouslySetInnerHTML={{ __html: cleanHtml(activeVariant.description, featureMap) }}
                    />
                  )}
                  <div className="flex flex-wrap gap-2 text-xs text-stone-400">
                    <span>Skills: {activeVariant.skillProficiencies.join(", ")}</span>
                    {activeVariant.toolProficiency && <span>· Tools: {activeVariant.toolProficiency}</span>}
                    {activeVariant.languages && <span>· Languages: +{activeVariant.languages}</span>}
                    {activeVariant.featureName && <span className="text-stone-500">· Feature: {activeVariant.featureName}</span>}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
