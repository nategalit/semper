"use client";

import { useState, useMemo } from "react";
import type { ReactNode } from "react";
import { useMutation } from "@/lib/character/mutation-context";
import {
  getClassFeatures, getFeatFeatures, currentChargesFor, maxChargesFor,
  resolveRechargesOn, UNLIMITED,
} from "@/lib/character/features";
import { setFeatureCharge } from "@/app/actions/characters";
import { FIGHTING_STYLES, FIGHTING_STYLE_BY_CLASS } from "@/lib/content/srd";
import type { SrdClass, SrdRace, SrdBackground, SrdSubclass } from "@/lib/content/srd";
import type { CharacterData } from "@/lib/types/character";
import type { FeatureEntry, FightingStyleEntry } from "@/app/actions/content";
import type { FeatElement } from "@/lib/content/schema";
import { abbreviateSource } from "@/lib/content/source-abbreviations";
import { sourceChipClass } from "@/lib/ui-tokens";
import { cleanHtml } from "@/lib/content/aurora/clean-html";
import { EmptyState } from "../shared/empty-state";
import { SubclassPicker } from "../panels/subclass-picker";

// ─── Section collapse state ───────────────────────────────────────────────────

type SectionKey = "class" | "subclass" | "race" | "background" | "feats" | "items";

const SECTION_DEFAULTS: Record<SectionKey, boolean> = {
  class: true,
  subclass: true,
  race: false,
  background: false,
  feats: true,
  items: false,
};

// ─── Props ────────────────────────────────────────────────────────────────────

interface Props {
  srdClass: SrdClass | undefined;
  srdRace: SrdRace | undefined;
  srdBackground: SrdBackground | undefined;
  featureMap: Map<string, FeatureEntry>;
  importedFightingStyles?: FightingStyleEntry[];
  allSubclasses?: SrdSubclass[];
  importedFeats?: FeatElement[];
  onChangeLevelRequest?: () => void;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function TabFeatures({
  srdClass, srdRace, srdBackground, featureMap,
  importedFightingStyles, allSubclasses = [], importedFeats = [], onChangeLevelRequest,
}: Props) {
  const { character, mutate } = useMutation();
  const [subclassPickerOpen, setSubclassPickerOpen] = useState(false);
  const [search, setSearch] = useState("");

  const storageKey = `features-sections-${character.id}`;
  const [sectionOpen, setSectionOpen] = useState<Record<SectionKey, boolean>>(() => {
    if (typeof window === "undefined") return { ...SECTION_DEFAULTS };
    try {
      const raw = localStorage.getItem(storageKey);
      if (raw) return { ...SECTION_DEFAULTS, ...JSON.parse(raw) };
    } catch {}
    return { ...SECTION_DEFAULTS };
  });

  function toggleSection(key: SectionKey) {
    setSectionOpen((prev) => {
      const next = { ...prev, [key]: !prev[key] };
      try { localStorage.setItem(storageKey, JSON.stringify(next)); } catch {}
      return next;
    });
  }

  // ── Data resolution ──────────────────────────────────────────────────────

  const subrace = srdRace?.subraces.find((s) => s.id === character.data.subraceId);

  const fightingStyleGrantLevel = FIGHTING_STYLE_BY_CLASS[character.classId ?? ""] ?? 0;
  const chosenFightingStyleId =
    fightingStyleGrantLevel > 0 && fightingStyleGrantLevel <= character.level
      ? character.data.levelChoices?.[fightingStyleGrantLevel]?.fightingStyle
      : undefined;
  const chosenFightingStyle = chosenFightingStyleId
    ? (() => {
        const srd = FIGHTING_STYLES.find((s) => s.id === chosenFightingStyleId);
        if (srd) return { name: srd.name, description: srd.description, sourceLabel: "SRD" };
        return importedFightingStyles?.find((s) => s.id === chosenFightingStyleId) ?? undefined;
      })()
    : undefined;

  const currentSubclass = character.data.subclassId
    ? allSubclasses.find((s) => s.id === character.data.subclassId)
    : undefined;

  const needsSubclass =
    srdClass &&
    character.level >= srdClass.subclassUnlockLevel &&
    !character.data.subclassId;

  const classFeatures = character.classId
    ? getClassFeatures(character.classId, character.level, {})
    : [];
  const featFeatures = getFeatFeatures(character.data.levelChoices, character.level, {});
  const features = [...classFeatures, ...featFeatures];

  const pickedFeats: { feat: FeatElement; level: number }[] = [];
  if (character.data.levelChoices) {
    const featMap = new Map(importedFeats.map((f) => [f.id, f]));
    for (const [lvl, choice] of Object.entries(character.data.levelChoices).sort((a, b) => Number(a[0]) - Number(b[0]))) {
      if (choice.featId) {
        const feat = featMap.get(choice.featId);
        if (feat) pickedFeats.push({ feat, level: Number(lvl) });
      }
    }
  }

  const chargeLabels = new Set(features.map((d) => d.label));
  const activeClass = srdClass ?? character.data.resolvedClass;

  const descByNameLower = new Map<string, string>();
  for (const f of featureMap.values()) {
    const stripped = f.description.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
    if (stripped) descByNameLower.set(f.name.toLowerCase(), stripped);
  }
  if (activeClass?.featureDescriptions) {
    for (const [name, desc] of Object.entries(activeClass.featureDescriptions)) {
      if (desc) descByNameLower.set(name.toLowerCase(), desc);
    }
  }

  const nonChargeFeatures: { name: string; level: number; description?: string }[] =
    activeClass?.featuresByLevel
      ? Object.entries(activeClass.featuresByLevel)
          .filter(([lvl]) => Number(lvl) <= character.level)
          .sort(([a], [b]) => Number(a) - Number(b))
          .flatMap(([lvl, names]) =>
            names
              .filter((n) => !chargeLabels.has(n))
              .map((name) => ({
                name,
                level: Number(lvl),
                description: descByNameLower.get(name.toLowerCase()) || undefined,
              }))
          )
      : [];

  // ── Search index ─────────────────────────────────────────────────────────

  type SearchItem = { name: string; category: string; description?: string; meta?: string };

  const searchItems = useMemo((): SearchItem[] => {
    const items: SearchItem[] = [];

    for (const f of features) {
      items.push({ name: f.label, category: "Class Feature", description: f.description });
    }
    for (const { feat, level } of pickedFeats) {
      const desc = (feat.description || feat.sheetText || "")
        .replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
      items.push({ name: feat.name, category: "Feat", description: desc || undefined, meta: `L${level}` });
    }
    for (const f of nonChargeFeatures) {
      items.push({ name: f.name, category: "Class Progression", description: f.description, meta: `Lv${f.level}` });
    }
    if (chosenFightingStyle) {
      const desc = chosenFightingStyle.description?.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
      items.push({ name: chosenFightingStyle.name, category: "Fighting Style", description: desc });
    }
    if (currentSubclass) {
      if (currentSubclass.featuresByLevel) {
        for (const [lvl, names] of Object.entries(currentSubclass.featuresByLevel)) {
          if (Number(lvl) > character.level) continue;
          for (const name of names) {
            items.push({ name, category: "Subclass", description: currentSubclass.featureDescriptions?.[name], meta: `Lv${lvl}` });
          }
        }
      } else {
        for (const name of currentSubclass.features) {
          items.push({ name, category: "Subclass" });
        }
      }
    }
    if (srdRace) {
      for (const trait of srdRace.traits) items.push({ name: trait, category: "Race Trait" });
    }
    if (subrace) {
      for (const trait of subrace.traits ?? []) items.push({ name: trait, category: "Subrace Trait" });
    }
    if (srdBackground?.featureName) {
      items.push({ name: srdBackground.featureName, category: "Background Feature" });
    }

    return items;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [features, pickedFeats, nonChargeFeatures, chosenFightingStyle, currentSubclass, srdRace, subrace, srdBackground, character.level]);

  const q = search.toLowerCase();
  const filteredItems = q
    ? searchItems.filter((item) => item.name.toLowerCase().includes(q))
    : [];

  // ── Charge handler ───────────────────────────────────────────────────────

  function handleChargeChange(key: string, next: number) {
    const patch: Partial<CharacterData> = {
      featureCharges: { ...character.data.featureCharges, [key]: next },
    };
    mutate(patch, () => setFeatureCharge(character.id, key, next));
  }

  // ── Render ───────────────────────────────────────────────────────────────

  return (
    <>
      <div className="space-y-3">

        {/* Level button */}
        {onChangeLevelRequest && (
          <button
            onClick={onChangeLevelRequest}
            className="w-full flex items-center justify-between px-4 py-3 rounded-xl border border-stone-700
              bg-stone-800/50 hover:bg-stone-800 hover:border-stone-600 transition-colors"
          >
            <div className="text-left">
              <p className="text-sm font-semibold text-stone-200">
                Level {character.level} {srdClass ? `· ${srdClass.name}` : ""}
              </p>
              <p className="text-xs text-stone-500 mt-0.5">Tap to level up or down</p>
            </div>
            <span className="text-stone-500 text-lg">›</span>
          </button>
        )}

        {/* Search bar */}
        <div className="relative">
          <input
            type="text"
            placeholder="Search features…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full min-h-[40px] rounded-lg bg-stone-800 border border-stone-700 px-3 pr-8
              text-stone-100 text-sm placeholder:text-stone-600 focus:outline-none focus:border-amber-500/50"
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              aria-label="Clear search"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-500 hover:text-stone-300 text-xs"
            >
              ✕
            </button>
          )}
        </div>

        {/* Search results — replaces sections when active */}
        {q ? (
          filteredItems.length === 0 ? (
            <p className="text-sm text-stone-500 text-center py-8">
              No features match &ldquo;{search}&rdquo;
            </p>
          ) : (
            <div className="space-y-1.5">
              {filteredItems.map((item, i) => (
                <div key={`${item.category}-${item.name}-${i}`}
                  className="rounded-xl border border-stone-800 bg-stone-900/50 px-4 py-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-stone-200">{item.name}</p>
                      {item.description && (
                        <p className="text-xs text-stone-500 mt-0.5 leading-relaxed">{item.description}</p>
                      )}
                    </div>
                    <div className="shrink-0 text-right">
                      <p className="text-[10px] text-stone-600">{item.category}</p>
                      {item.meta && <p className="text-[10px] text-stone-700">{item.meta}</p>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )
        ) : (
          /* Normal sections */
          <>
            {/* Class — charge-tracked features + class progression + fighting style */}
            {(features.length > 0 || nonChargeFeatures.length > 0 || chosenFightingStyle) && (
              <CollapsibleSection
                title={srdClass?.name ?? "Class"}
                count={features.length + nonChargeFeatures.length + (chosenFightingStyle ? 1 : 0)}
                expanded={sectionOpen.class}
                onToggle={() => toggleSection("class")}
              >
                <div className="pt-3 space-y-6">
                  {features.length > 0 && (
                    <div className="space-y-4">
                      {features.map((def) => {
                        const max = maxChargesFor(def, character.level, {});
                        const current = currentChargesFor(def, character.level, {}, character.data.featureCharges ?? {});
                        const recharge = resolveRechargesOn(def, character.level);
                        return (
                          <FeatureRow
                            key={def.key}
                            label={def.label}
                            description={def.description}
                            current={current}
                            max={max}
                            recharge={recharge}
                            onSet={(next) => handleChargeChange(def.key, next)}
                          />
                        );
                      })}
                    </div>
                  )}

                  {nonChargeFeatures.length > 0 && (
                    <div>
                      {features.length > 0 && (
                        <p className="text-[10px] uppercase tracking-widest text-stone-600 mb-2">Progression</p>
                      )}
                      <div className="space-y-2">
                        {nonChargeFeatures.map(({ name, level, description }) => (
                          <div key={`${level}-${name}`} className="flex gap-3">
                            <span className="text-[10px] font-semibold text-stone-600 w-5 shrink-0 pt-0.5 text-right tabular-nums">
                              {level}
                            </span>
                            <div>
                              <p className="text-sm font-medium text-stone-300">{name}</p>
                              {description && (
                                <p className="text-xs text-stone-500 mt-0.5 leading-relaxed">{description}</p>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {chosenFightingStyle && (
                    <div>
                      <p className="text-[10px] uppercase tracking-widest text-stone-600 mb-2">Fighting Style</p>
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-sm font-semibold text-stone-200">{chosenFightingStyle.name}</p>
                          {chosenFightingStyle.description && (
                            <p className="text-xs text-stone-500 mt-1 leading-relaxed">
                              {chosenFightingStyle.description.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim()}
                            </p>
                          )}
                        </div>
                        <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium shrink-0 ${sourceChipClass(chosenFightingStyle.sourceLabel)}`}>
                          {chosenFightingStyle.sourceLabel}
                        </span>
                      </div>
                    </div>
                  )}

                  {srdClass && (
                    <div className="border-t border-stone-800/50 pt-3">
                      <div className="grid grid-cols-2 gap-2 text-xs text-stone-500">
                        <span>Hit Die: d{srdClass.hitDie}</span>
                        <span>Saves: {srdClass.savingThrows.map((s) => s.toUpperCase()).join(", ")}</span>
                      </div>
                      {srdClass.armorProficiencies.length > 0 && (
                        <p className="text-xs text-stone-600 mt-1">Armor: {srdClass.armorProficiencies.join(", ")}</p>
                      )}
                      <p className="text-xs text-stone-600 mt-1">Weapons: {srdClass.weaponProficiencies.join(", ")}</p>
                    </div>
                  )}
                </div>
              </CollapsibleSection>
            )}

            {/* Subclass */}
            {srdClass && (
              <CollapsibleSection
                title="Subclass"
                expanded={sectionOpen.subclass}
                onToggle={() => toggleSection("subclass")}
              >
                <div className="pt-3">
                  {needsSubclass ? (
                    <button
                      onClick={() => setSubclassPickerOpen(true)}
                      className="w-full flex items-center justify-between gap-2 rounded-lg border border-amber-700/60
                        bg-amber-900/20 px-3 py-3 text-left hover:bg-amber-900/30 transition-colors"
                    >
                      <span className="text-xs text-amber-300">
                        Choose your {srdClass.name} subclass (available at level {srdClass.subclassUnlockLevel})
                      </span>
                      <span className="text-xs text-amber-400 font-semibold shrink-0">Choose →</span>
                    </button>
                  ) : currentSubclass ? (
                    <>
                      <p className="text-sm font-semibold text-stone-200 mb-2">{currentSubclass.name}</p>
                      {currentSubclass.description && (
                        <div
                          className="aurora-content text-sm text-stone-300 overflow-x-auto mb-3"
                          dangerouslySetInnerHTML={{ __html: cleanHtml(currentSubclass.description, featureMap) }}
                        />
                      )}
                      {currentSubclass.featuresByLevel ? (
                        <div className="space-y-2">
                          {Object.entries(currentSubclass.featuresByLevel)
                            .filter(([lvl]) => Number(lvl) <= character.level)
                            .sort(([a], [b]) => Number(a) - Number(b))
                            .flatMap(([lvl, names]) => names.map((name) => ({ name, level: Number(lvl) })))
                            .map(({ name, level }) => (
                              <div key={`${level}-${name}`} className="flex gap-3">
                                <span className="text-[10px] font-semibold text-stone-600 w-5 shrink-0 pt-0.5 text-right tabular-nums">
                                  {level}
                                </span>
                                <div>
                                  <p className="text-sm font-medium text-stone-300">{name}</p>
                                  {currentSubclass.featureDescriptions?.[name] && (
                                    <p className="text-xs text-stone-500 mt-0.5 leading-relaxed">
                                      {currentSubclass.featureDescriptions[name]}
                                    </p>
                                  )}
                                </div>
                              </div>
                            ))
                          }
                        </div>
                      ) : (
                        <div className="flex flex-wrap gap-1.5">
                          {currentSubclass.features.map((f) => (
                            <span key={f} className="text-xs px-2 py-0.5 rounded-full bg-stone-800 border border-stone-700 text-stone-400">
                              {f}
                            </span>
                          ))}
                        </div>
                      )}
                      <button
                        onClick={() => setSubclassPickerOpen(true)}
                        className="mt-3 text-xs text-stone-600 hover:text-stone-400 transition-colors"
                      >
                        Change subclass
                      </button>
                    </>
                  ) : (
                    <EmptyState message="No subclass selected." />
                  )}
                </div>
              </CollapsibleSection>
            )}

            {/* Race / Subrace */}
            <CollapsibleSection
              title={srdRace ? (subrace ? `${srdRace.name} · ${subrace.name}` : srdRace.name) : "Race"}
              expanded={sectionOpen.race}
              onToggle={() => toggleSection("race")}
            >
              <div className="pt-3">
                {srdRace ? (
                  <>
                    <div
                      className="aurora-content text-sm text-stone-300 overflow-x-auto mb-3"
                      dangerouslySetInnerHTML={{ __html: cleanHtml(srdRace.description, featureMap) }}
                    />
                    {srdRace.traits.length > 0 && (
                      <ul className="space-y-1 mb-3">
                        {srdRace.traits.map((trait) => (
                          <li key={trait} className="text-sm text-stone-400 flex gap-2">
                            <span className="text-amber-600 shrink-0">·</span>
                            {trait}
                          </li>
                        ))}
                      </ul>
                    )}
                    {subrace && (
                      <div className="border-t border-stone-800 pt-3 mt-1">
                        <p className="text-xs text-stone-500 uppercase tracking-wider mb-2">{subrace.name}</p>
                        {subrace.description && (
                          <p className="text-sm text-stone-400 mb-2">
                            {subrace.description.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim()}
                          </p>
                        )}
                        {subrace.traits && subrace.traits.length > 0 && (
                          <ul className="space-y-1">
                            {subrace.traits.map((trait) => (
                              <li key={trait} className="text-sm text-stone-400 flex gap-2">
                                <span className="text-amber-600 shrink-0">·</span>
                                {trait}
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    )}
                  </>
                ) : (
                  <EmptyState message="No race selected." />
                )}
              </div>
            </CollapsibleSection>

            {/* Background */}
            <CollapsibleSection
              title={srdBackground ? `${srdBackground.name}` : "Background"}
              expanded={sectionOpen.background}
              onToggle={() => toggleSection("background")}
            >
              <div className="pt-3">
                {srdBackground ? (
                  <>
                    {srdBackground.description && (
                      <div
                        className="aurora-content text-sm text-stone-300 overflow-x-auto mb-3"
                        dangerouslySetInnerHTML={{ __html: cleanHtml(srdBackground.description, featureMap) }}
                      />
                    )}
                    <div className="space-y-1 text-xs text-stone-500">
                      <p>Skills: {srdBackground.skillProficiencies.join(", ")}</p>
                      {srdBackground.toolProficiency && <p>Tools: {srdBackground.toolProficiency}</p>}
                      {srdBackground.languages && (
                        <p>Languages: +{srdBackground.languages} additional</p>
                      )}
                    </div>
                    {srdBackground.featureName && (
                      <div className="mt-3 pt-3 border-t border-stone-800/60">
                        <p className="text-[10px] uppercase tracking-widest text-stone-600 mb-0.5">Feature</p>
                        <p className="text-sm font-semibold text-stone-300">{srdBackground.featureName}</p>
                      </div>
                    )}
                  </>
                ) : (
                  <EmptyState message="No background selected." />
                )}
              </div>
            </CollapsibleSection>

            {/* Feats */}
            {pickedFeats.length > 0 && (
              <CollapsibleSection
                title="Feats"
                count={pickedFeats.length}
                expanded={sectionOpen.feats}
                onToggle={() => toggleSection("feats")}
              >
                <div className="space-y-3 pt-3">
                  {pickedFeats.map(({ feat, level }) => {
                    const desc = (feat.description || feat.sheetText || "")
                      .replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
                    const sourceLabel = abbreviateSource(feat.source);
                    return (
                      <div key={`${level}-${feat.id}`} className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold text-stone-200">{feat.name}</span>
                          {sourceLabel && (
                            <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${sourceChipClass(sourceLabel)}`}>
                              {sourceLabel}
                            </span>
                          )}
                          <span className="text-[10px] text-stone-600 ml-auto">L{level}</span>
                        </div>
                        {feat.prerequisite && (
                          <p className="text-[10px] text-amber-600/80">Requires: {feat.prerequisite}</p>
                        )}
                        {desc && <p className="text-xs text-stone-400 leading-relaxed">{desc}</p>}
                      </div>
                    );
                  })}
                </div>
              </CollapsibleSection>
            )}

            {/* Items — stub */}
            <CollapsibleSection
              title="Items"
              expanded={sectionOpen.items}
              onToggle={() => toggleSection("items")}
            >
              <div className="pt-3">
                <EmptyState message="Item tracking coming soon." />
              </div>
            </CollapsibleSection>
          </>
        )}
      </div>

      {srdClass && (
        <SubclassPicker
          open={subclassPickerOpen}
          onClose={() => setSubclassPickerOpen(false)}
          srdClass={srdClass}
          allSubclasses={allSubclasses}
        />
      )}
    </>
  );
}

// ─── CollapsibleSection ───────────────────────────────────────────────────────

function CollapsibleSection({
  title, expanded, onToggle, count, children,
}: {
  title: string;
  expanded: boolean;
  onToggle: () => void;
  count?: number;
  children: ReactNode;
}) {
  return (
    <div className={`rounded-xl border transition-colors ${expanded ? "border-stone-700" : "border-stone-800"} bg-stone-900/50`}>
      <button
        className="w-full flex items-center justify-between px-4 py-3 sticky top-44 z-20 bg-stone-900 rounded-xl"
        onClick={onToggle}
        aria-expanded={expanded}
      >
        <span className="text-xs font-semibold uppercase tracking-widest text-stone-500">
          {title}
          {count !== undefined && (
            <span className="font-normal text-stone-700"> · {count}</span>
          )}
        </span>
        <svg
          className={`w-4 h-4 text-stone-600 transition-transform duration-150 ${expanded ? "rotate-180" : ""}`}
          viewBox="0 0 20 20" fill="currentColor" aria-hidden
        >
          <path fillRule="evenodd" d="M5.22 8.22a.75.75 0 0 1 1.06 0L10 11.94l3.72-3.72a.75.75 0 1 1 1.06 1.06l-4.25 4.25a.75.75 0 0 1-1.06 0L5.22 9.28a.75.75 0 0 1 0-1.06Z" clipRule="evenodd" />
        </svg>
      </button>
      {expanded && (
        <div className="px-4 pb-4 border-t border-stone-800/50">
          {children}
        </div>
      )}
    </div>
  );
}

// ─── FeatureRow ───────────────────────────────────────────────────────────────

interface FeatureRowProps {
  label: string;
  description?: string;
  current: number;
  max: number;
  recharge: "short" | "long";
  onSet: (next: number) => void;
}

function FeatureRow({ label, description, current, max, recharge, onSet }: FeatureRowProps) {
  const isUnlimited = max >= UNLIMITED;

  return (
    <div className="space-y-1.5">
      <div className="flex items-start justify-between gap-2">
        <div>
          <span className="text-sm font-medium text-stone-200">{label}</span>
          {description && (
            <p className="text-xs text-stone-500 mt-0.5 leading-relaxed">{description}</p>
          )}
        </div>
        <span className="text-[10px] uppercase tracking-wider text-stone-600 shrink-0 pt-0.5">
          {recharge === "short" ? "short rest" : "long rest"}
        </span>
      </div>

      {isUnlimited ? (
        <p className="text-2xl font-bold text-amber-400">∞</p>
      ) : max <= 6 ? (
        <div className="flex gap-0.5 flex-wrap">
          {Array.from({ length: max }).map((_, i) => {
            const filled = i < current;
            return (
              <button
                key={i}
                onClick={() => onSet(filled ? current - 1 : current + 1)}
                aria-label={filled ? `Use ${label}` : `Restore ${label}`}
                className="w-11 h-11 flex items-center justify-center active:scale-90 transition-transform"
              >
                <span className={`w-5 h-5 rounded-full border-2 transition-all duration-200 ${
                  filled
                    ? "bg-amber-400 border-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.4)]"
                    : "bg-stone-800 border-stone-600"
                }`} />
              </button>
            );
          })}
        </div>
      ) : (
        <div className="flex items-center gap-3">
          <button
            onClick={() => onSet(Math.max(0, current - 1))}
            disabled={current <= 0}
            aria-label={`Use ${label}`}
            className="w-11 h-11 rounded-xl bg-stone-800 border border-stone-700 text-stone-200 text-xl
              flex items-center justify-center hover:border-stone-500 disabled:opacity-30 disabled:cursor-not-allowed"
          >
            −
          </button>
          <span className="text-xl font-bold text-stone-100 tabular-nums min-w-[3ch] text-center">
            {current}
          </span>
          <button
            onClick={() => onSet(Math.min(max, current + 1))}
            disabled={current >= max}
            aria-label={`Restore ${label}`}
            className="w-11 h-11 rounded-xl bg-stone-800 border border-stone-700 text-stone-200 text-xl
              flex items-center justify-center hover:border-stone-500 disabled:opacity-30 disabled:cursor-not-allowed"
          >
            +
          </button>
          <span className="text-xs text-stone-600">/ {max}</span>
        </div>
      )}
    </div>
  );
}
