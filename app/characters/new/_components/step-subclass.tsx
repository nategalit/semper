"use client";

import { useState, useMemo } from "react";
import { useWizardStore } from "@/lib/stores/wizard-store";
import { SRD_CLASSES } from "@/lib/content/srd";
import type { SrdClass, SrdSubclass } from "@/lib/content/srd";
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

function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}

interface Props {
  classes: SrdClass[];
  subclasses: SrdSubclass[];
  featureMap: Map<string, FeatureEntry>;
}

export function StepSubclass({ classes, subclasses, featureMap }: Props) {
  const { classId, wizardSubclassId, setWizardSubclassId } = useWizardStore();
  const [sourceFilters, setSourceFilters] = useState(() => new Set<string>());
  const [sortOrder, setSortOrder] = useState<"alpha" | "count">("alpha");

  const srdClass = classes.find((c) => `${c.id}:${c.sourceLabel ?? ""}` === classId);
  // Resolve to the canonical SRD class ID so Aurora-variant classes still find SRD subclasses.
  const canonicalClassId = useMemo(() => {
    if (!srdClass) return classId.split(":")[0];
    return SRD_CLASSES.find((c) => c.name === srdClass.name)?.id ?? classId.split(":")[0];
  }, [srdClass, classId]);
  const available = useMemo(
    () => subclasses.filter((s) => s.classId === canonicalClassId),
    [subclasses, canonicalClassId]
  );

  const { sortedLabels, labelCounts } = useMemo(() => {
    const counts = new Map<string, number>();
    for (const s of available) {
      const label = s.sourceLabel ?? "SRD";
      counts.set(label, (counts.get(label) ?? 0) + 1);
    }
    const labels = [...counts.keys()];
    const sorted = sortOrder === "count"
      ? labels.sort((a, b) => (counts.get(b) ?? 0) - (counts.get(a) ?? 0))
      : labels.sort();
    return { sortedLabels: sorted, labelCounts: counts };
  }, [available, sortOrder]);

  const visible = sourceFilters.size === 0
    ? available
    : available.filter((s) => sourceFilters.has(s.sourceLabel ?? "SRD"));

  // Group same-name subclasses (Case B variants) into one card with version chips.
  const groups = useMemo(() => {
    const map = new Map<string, SrdSubclass[]>();
    for (const s of visible) {
      const arr = map.get(s.name) ?? [];
      arr.push(s);
      map.set(s.name, arr);
    }
    return [...map.values()];
  }, [visible]);

  const selectedSub = available.find((s) => s.id === wizardSubclassId);

  function toggleSource(label: string) {
    setSourceFilters((prev) => {
      const next = new Set(prev);
      if (next.has(label)) next.delete(label); else next.add(label);
      return next;
    });
  }

  if (!srdClass) return null;

  if (srdClass.subclassUnlockLevel > 1) {
    return (
      <div>
        <h2 className="text-2xl font-bold mb-1">Subclass</h2>
        <p className="text-stone-400 mb-6">
          {srdClass.name}s choose a subclass at level {srdClass.subclassUnlockLevel}.
        </p>
        <div className="rounded-lg border border-stone-800 bg-stone-900/50 p-5 text-stone-400 text-sm">
          Your subclass will be available to select on the Features tab once you reach
          level {srdClass.subclassUnlockLevel}. You can skip this step for now.
        </div>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-2xl font-bold mb-1">Choose a subclass</h2>
      <p className="text-stone-400 mb-4">
        {srdClass.name}s choose their subclass at level 1.
      </p>

      {sortedLabels.length > 1 && (
        <div className="space-y-1 mb-5">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase tracking-widest text-stone-600 font-medium">Sources</span>
            <select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value as "alpha" | "count")}
              className="text-[10px] bg-transparent text-stone-500 hover:text-stone-300 border-none outline-none cursor-pointer"
              aria-label="Sort sources"
            >
              <option value="alpha">A→Z</option>
              <option value="count">Most</option>
            </select>
          </div>
          <div className="flex flex-wrap gap-1.5">
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
            {sortedLabels.map((label) => (
              <button
                key={label}
                onClick={() => toggleSource(label)}
                className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                  sourceFilters.has(label)
                    ? "bg-amber-600 text-stone-950"
                    : "border border-stone-700 text-stone-400 hover:text-stone-200"
                }`}
              >
                {label} <span className="opacity-60">({labelCounts.get(label)})</span>
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="space-y-2">
        {groups.map((group) => {
          const isMulti = group.length > 1;
          const isGroupSelected = group.some((s) => s.id === wizardSubclassId);
          const displaySub = group.find((s) => s.id === wizardSubclassId) ?? group[0];

          return (
            <div
              key={group[0].name}
              className={`rounded-lg border transition-colors ${
                isGroupSelected
                  ? "border-amber-500 bg-amber-900/20"
                  : "border-stone-700 bg-stone-900 hover:border-stone-500"
              }`}
            >
              {/* Card header — clickable to select */}
              <button
                className="w-full p-4 text-left"
                onClick={() => { if (!isGroupSelected) setWizardSubclassId(group[0].id); }}
              >
                <div className="flex items-start gap-2 justify-between">
                  <p className={`text-sm font-semibold ${isGroupSelected ? "text-amber-300" : "text-stone-200"}`}>
                    {displaySub.name}
                  </p>
                  {!isMulti && displaySub.sourceLabel && (
                    <span className={`text-[10px] rounded px-1.5 py-0.5 font-medium shrink-0 ${sourceChipClass(displaySub.source)}`}>
                      {displaySub.sourceLabel}
                    </span>
                  )}
                </div>
                {!isGroupSelected && (
                  <p className="text-xs text-stone-500 mt-1 line-clamp-2">
                    {stripHtml(displaySub.description)}
                  </p>
                )}
              </button>

              {/* Version chips for Case B multi-source variants */}
              {isMulti && (
                <div className="flex flex-wrap gap-1 px-4 pb-2">
                  {group.map((variant) => (
                    <button
                      key={variant.id}
                      onClick={() => setWizardSubclassId(variant.id)}
                      className={`text-[10px] rounded px-1.5 py-0.5 font-medium transition-colors ${
                        wizardSubclassId === variant.id
                          ? "bg-amber-500 text-stone-950"
                          : isGroupSelected
                          ? "bg-stone-700 text-stone-300 hover:bg-stone-600"
                          : "bg-stone-800 text-stone-400 hover:bg-stone-700"
                      }`}
                    >
                      {variant.sourceLabel ?? "SRD"}
                    </button>
                  ))}
                </div>
              )}

              {/* Expanded detail — full description + features */}
              {isGroupSelected && selectedSub && (
                <div className="px-4 pb-4 border-t border-stone-700/40 pt-3 mt-0.5">
                  {selectedSub.description && (
                    <div
                      className="aurora-content text-sm text-stone-300 overflow-x-auto mb-3"
                      dangerouslySetInnerHTML={{ __html: cleanHtml(selectedSub.description, featureMap) }}
                    />
                  )}
                  {selectedSub.features.length > 0 && (
                    <>
                      <p className="text-xs text-stone-500 uppercase tracking-wider mb-1.5">Features</p>
                      <ul className="flex flex-wrap gap-1.5">
                        {selectedSub.features.map((f) => (
                          <li
                            key={f}
                            className="text-xs px-2 py-0.5 rounded-full bg-stone-800 border border-stone-700 text-stone-400"
                          >
                            {f}
                          </li>
                        ))}
                      </ul>
                    </>
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
