"use client";

import { useState, useMemo } from "react";
import type { FeatElement } from "@/lib/content/schema";
import type { AbilityKey } from "@/lib/content/srd";
import { abbreviateSource } from "@/lib/content/source-abbreviations";
import { cleanHtmlBrowse } from "@/lib/content/aurora/clean-html";
import { FilterPill } from "@/app/_components/filter-pill";
import { sourceChipClass } from "@/lib/ui-tokens";

export const ABILITY_KEYS: AbilityKey[] = ["str", "dex", "con", "int", "wis", "cha"];
export const ABILITY_LABELS: Record<AbilityKey, string> = {
  str: "STR", dex: "DEX", con: "CON", int: "INT", wis: "WIS", cha: "CHA",
};

const ABILITY_SUFFIX_MAP: Record<string, AbilityKey> = {
  STRENGTH: "str", STR: "str",
  DEXTERITY: "dex", DEX: "dex",
  CONSTITUTION: "con", CON: "con",
  INTELLIGENCE: "int", INT: "int",
  WISDOM: "wis", WIS: "wis",
  CHARISMA: "cha", CHA: "cha",
};

export function isHalfFeat(feat: FeatElement): boolean {
  return feat.rules.choices.some((c) => c.kind === "element" && c.type === "Ability Score Improvement");
}

export function halfFeatAbilities(feat: FeatElement): AbilityKey[] {
  const choice = feat.rules.choices.find((c) => c.kind === "element" && c.type === "Ability Score Improvement");
  if (!choice || choice.kind !== "element" || !choice.supports) return ABILITY_KEYS;
  const tokens = choice.supports.split("|").map((s) => s.trim()).filter(Boolean);
  const abilities: AbilityKey[] = [];
  for (const token of tokens) {
    const suffix = token.split("_").pop()?.toUpperCase() ?? "";
    const key = ABILITY_SUFFIX_MAP[suffix];
    if (!key) return ABILITY_KEYS;
    if (!abilities.includes(key)) abilities.push(key);
  }
  return abilities.length > 0 ? abilities : ABILITY_KEYS;
}

interface FeatPickerProps {
  feats: FeatElement[];
  pickedFeatId: string;
  onPick: (id: string) => void;
  disabledFeatIds: Set<string>;
  halfFeatAbility?: AbilityKey;
  onHalfFeatAbilityPick: (ability: AbilityKey | undefined) => void;
}

export function FeatPicker({ feats, pickedFeatId, onPick, disabledFeatIds, halfFeatAbility, onHalfFeatAbilityPick }: FeatPickerProps) {
  const [query, setQuery] = useState("");
  const [sourceFilters, setSourceFilters] = useState<Set<string>>(() => new Set());
  const [typeFilter, setTypeFilter] = useState<"all" | "full" | "half">("all");
  const [expandedFeatIds, setExpandedFeatIds] = useState<Set<string>>(() => new Set());

  const uniqueSources = useMemo(
    () => [...new Set(feats.map((f) => abbreviateSource(f.source)))].sort(),
    [feats]
  );

  if (feats.length === 0) {
    return (
      <p className="text-xs text-stone-600 text-center py-4">
        No feats available. Import Aurora content in Settings to unlock feats.
      </p>
    );
  }

  const q = query.toLowerCase();
  const filtered = feats.filter((f) => {
    if (q && !f.name.toLowerCase().includes(q) && !abbreviateSource(f.source).toLowerCase().includes(q)) return false;
    if (sourceFilters.size > 0 && !sourceFilters.has(abbreviateSource(f.source))) return false;
    if (typeFilter === "full" && isHalfFeat(f)) return false;
    if (typeFilter === "half" && !isHalfFeat(f)) return false;
    return true;
  });

  function toggleSource(label: string) {
    setSourceFilters((prev) => {
      const next = new Set(prev);
      if (next.has(label)) next.delete(label);
      else next.add(label);
      return next;
    });
  }

  return (
    <div>
      <input
        type="text"
        placeholder="Search feats…"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="w-full bg-stone-800 border border-stone-600 rounded-lg px-3 py-2 text-sm
          text-stone-200 placeholder:text-stone-600 mb-3 focus:outline-none focus:border-stone-400"
      />
      <div className="flex flex-wrap gap-1.5 mb-3">
        <FilterPill active={typeFilter === "all"} onClick={() => setTypeFilter("all")} label="All" />
        <FilterPill active={typeFilter === "full"} onClick={() => setTypeFilter("full")} label="Full feat" />
        <FilterPill active={typeFilter === "half"} onClick={() => setTypeFilter("half")} label="Half feat" />
      </div>
      {uniqueSources.length > 1 && (
        <div className="mb-3 space-y-1">
          <span className="text-[10px] uppercase tracking-widest text-stone-600 font-medium">Source</span>
          <div className="flex flex-wrap gap-1.5">
            <FilterPill active={sourceFilters.size === 0} onClick={() => setSourceFilters(new Set())} label="All" />
            {uniqueSources.map((src) => (
              <FilterPill key={src} active={sourceFilters.has(src)} onClick={() => toggleSource(src)} label={src} />
            ))}
          </div>
        </div>
      )}
      {filtered.length === 0 ? (
        <p className="text-xs text-stone-600 text-center py-3">No feats match your filters.</p>
      ) : (
        <div className="space-y-2 max-h-[min(52vh,480px)] overflow-y-auto pr-0.5">
          {filtered.map((feat) => {
            const picked = feat.id === pickedFeatId;
            const disabled = disabledFeatIds.has(feat.id);
            const expanded = expandedFeatIds.has(feat.id);
            const htmlDesc = cleanHtmlBrowse(feat.description || feat.sheetText || "");
            const sourceLabel = abbreviateSource(feat.source);

            function toggleExpand(e: React.MouseEvent) {
              e.stopPropagation();
              setExpandedFeatIds((prev) => {
                const next = new Set(prev);
                if (next.has(feat.id)) next.delete(feat.id); else next.add(feat.id);
                return next;
              });
            }

            return (
              <div
                key={feat.id}
                role="button"
                tabIndex={disabled ? -1 : 0}
                onClick={() => {
                  if (disabled) return;
                  const nextId = picked ? "" : feat.id;
                  onPick(nextId);
                  if (nextId) setExpandedFeatIds((prev) => new Set(prev).add(nextId));
                }}
                onKeyDown={(e) => {
                  if ((e.key === "Enter" || e.key === " ") && !disabled) {
                    e.preventDefault();
                    const nextId = picked ? "" : feat.id;
                    onPick(nextId);
                    if (nextId) setExpandedFeatIds((prev) => new Set(prev).add(nextId));
                  }
                }}
                aria-pressed={picked}
                aria-disabled={disabled}
                className={`rounded-xl border p-3 text-left transition-colors select-none ${
                  picked
                    ? "border-amber-500 bg-amber-900/20"
                    : disabled
                    ? "border-stone-700 bg-stone-800/20 opacity-40 cursor-not-allowed"
                    : "border-stone-700 bg-stone-800 hover:border-stone-500 cursor-pointer"
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <p className={`text-sm font-semibold leading-tight ${picked ? "text-amber-300" : "text-stone-200"}`}>
                    {feat.name}
                  </p>
                  <div className="flex items-center gap-1.5 shrink-0">
                    {sourceLabel && (
                      <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${sourceChipClass(sourceLabel)}`}>
                        {sourceLabel}
                      </span>
                    )}
                    {htmlDesc && (
                      <button
                        onClick={toggleExpand}
                        className="text-stone-500 hover:text-stone-300 transition-colors p-0.5"
                        aria-label={expanded ? "Collapse" : "Expand"}
                      >
                        <svg
                          className={`w-3.5 h-3.5 transition-transform duration-150 ${expanded ? "rotate-180" : ""}`}
                          viewBox="0 0 20 20" fill="currentColor" aria-hidden
                        >
                          <path fillRule="evenodd" d="M5.22 8.22a.75.75 0 0 1 1.06 0L10 11.94l3.72-3.72a.75.75 0 1 1 1.06 1.06l-4.25 4.25a.75.75 0 0 1-1.06 0L5.22 9.28a.75.75 0 0 1 0-1.06Z" clipRule="evenodd" />
                        </svg>
                      </button>
                    )}
                  </div>
                </div>
                {feat.prerequisite && (
                  <p className="text-[10px] text-amber-600/80 mt-0.5 leading-tight">
                    Requires: {feat.prerequisite}
                  </p>
                )}
                {expanded && htmlDesc && (
                  <div
                    className="aurora-content text-xs text-stone-400 leading-relaxed mt-2"
                    dangerouslySetInnerHTML={{ __html: htmlDesc }}
                  />
                )}
                {picked && isHalfFeat(feat) && (
                  <div className="mt-3 pt-2 border-t border-stone-700">
                    <p className="text-[10px] text-stone-400 uppercase tracking-wide mb-2">+1 Ability Score</p>
                    <div className="flex flex-wrap gap-1.5">
                      {halfFeatAbilities(feat).map((ability) => (
                        <button
                          key={ability}
                          onClick={(e) => {
                            e.stopPropagation();
                            onHalfFeatAbilityPick(halfFeatAbility === ability ? undefined : ability);
                          }}
                          className={`px-3 py-1 rounded-lg text-xs font-semibold border transition-colors ${
                            halfFeatAbility === ability
                              ? "border-amber-500 bg-amber-600 text-stone-950"
                              : "border-stone-600 text-stone-400 hover:border-stone-400 hover:text-stone-200"
                          }`}
                        >
                          {ABILITY_LABELS[ability]}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
