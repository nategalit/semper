"use client";

import { useState, useMemo } from "react";
import { useWizardStore } from "@/lib/stores/wizard-store";
import type { SrdClass } from "@/lib/content/srd";
import type { FeatureEntry } from "@/app/actions/content";
import { sourceChipClass } from "@/lib/ui-tokens";
import { cleanHtml } from "@/lib/content/aurora/clean-html";

function classKey(cls: SrdClass) {
  return `${cls.id}:${cls.sourceLabel ?? ""}`;
}

export function StepClass({
  classes,
  featureMap,
}: {
  classes: SrdClass[];
  featureMap: Map<string, FeatureEntry>;
}) {
  const { classId, setClassId } = useWizardStore();
  const [sourceFilters, setSourceFilters] = useState(() => new Set<string>());

  const allLabels = useMemo(() => {
    const seen = new Set<string>();
    for (const c of classes) seen.add(c.sourceLabel ?? "SRD");
    return [...seen].sort();
  }, [classes]);

  // Groups: one entry per unique class name, sorted alphabetically.
  const groups = useMemo(() => {
    const map = new Map<string, SrdClass[]>();
    for (const c of classes) {
      const arr = map.get(c.name) ?? [];
      arr.push(c);
      map.set(c.name, arr);
    }
    return [...map.values()].sort((a, b) => a[0].name.localeCompare(b[0].name));
  }, [classes]);

  // Hide groups with no variants matching the active filter, but always keep the selected group.
  const visibleGroups = useMemo(() => {
    if (sourceFilters.size === 0) return groups;
    return groups.filter((group) =>
      group.some((c) => classKey(c) === classId) ||
      group.some((c) => sourceFilters.has(c.sourceLabel ?? "SRD"))
    );
  }, [groups, sourceFilters, classId]);

  function toggleSource(label: string) {
    setSourceFilters((prev) => {
      const next = new Set(prev);
      if (next.has(label)) next.delete(label); else next.add(label);
      return next;
    });
  }

  return (
    <div>
      <h2 className="text-2xl font-bold mb-1">Choose a class</h2>
      <p className="text-stone-400 mb-4">Your class determines your combat abilities, skills, and spellcasting.</p>

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
            : group.filter((c) => sourceFilters.has(c.sourceLabel ?? "SRD") || classKey(c) === classId);

          const isGroupSelected = group.some((c) => classKey(c) === classId);
          const activeVariant = group.find((c) => classKey(c) === classId) ?? visibleVariants[0];
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
                onClick={() => { if (!isGroupSelected) setClassId(classKey(visibleVariants[0])); }}
              >
                <div className="flex items-start justify-between gap-3">
                  <p className={`text-sm font-semibold ${isGroupSelected ? "text-amber-300" : "text-stone-200"}`}>
                    {activeVariant.name}
                  </p>
                  <div className="flex items-center gap-2 shrink-0">
                    {!isMulti && activeVariant.sourceLabel && (
                      <span className={`text-[10px] rounded px-1.5 py-0.5 font-medium ${sourceChipClass(activeVariant.source)}`}>
                        {activeVariant.sourceLabel}
                      </span>
                    )}
                    <span className="text-xs text-stone-500">
                      d{activeVariant.hitDie} · {activeVariant.primaryAbilities.map((a) => a.toUpperCase()).join("/")}
                    </span>
                  </div>
                </div>
                {!isGroupSelected && (
                  <p className="text-xs text-stone-500 mt-0.5">
                    Saves: {activeVariant.savingThrows.map((s) => s.toUpperCase()).join(", ")}
                    {activeVariant.spellcasting && ` · Spellcasting (${activeVariant.spellcasting.ability.toUpperCase()})`}
                  </p>
                )}
              </button>

              {/* Source chips — only shown when 2+ variants */}
              {isMulti && (
                <div className="flex flex-wrap gap-1 px-4 pb-2">
                  {visibleVariants.map((variant) => (
                    <button
                      key={classKey(variant)}
                      onClick={() => setClassId(classKey(variant))}
                      className={`text-[10px] rounded px-1.5 py-0.5 font-medium transition-colors ${
                        sourceChipClass(variant.source, classId === classKey(variant))
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
                  <div className="flex flex-wrap gap-2 text-xs">
                    <span className="rounded-full bg-stone-800 px-2 py-0.5 text-stone-300">
                      Hit die: d{activeVariant.hitDie}
                    </span>
                    <span className="rounded-full bg-stone-800 px-2 py-0.5 text-stone-300">
                      Saves: {activeVariant.savingThrows.map((s) => s.toUpperCase()).join(", ")}
                    </span>
                    <span className="rounded-full bg-stone-800 px-2 py-0.5 text-stone-300">
                      Skills: choose {activeVariant.skillChoices.count}
                    </span>
                    {activeVariant.spellcasting && (
                      <span className="rounded-full bg-stone-800 px-2 py-0.5 text-amber-300">
                        Spellcasting ({activeVariant.spellcasting.ability.toUpperCase()})
                      </span>
                    )}
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
