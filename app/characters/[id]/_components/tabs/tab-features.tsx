"use client";

import { useState } from "react";
import { useMutation } from "@/lib/character/mutation-context";
import {
  getClassFeatures, currentChargesFor, maxChargesFor,
  resolveRechargesOn, UNLIMITED,
} from "@/lib/character/features";
import { setFeatureCharge } from "@/app/actions/characters";
import { SRD_SUBCLASSES } from "@/lib/content/srd";
import type { SrdClass, SrdRace, SrdBackground } from "@/lib/content/srd";
import type { CharacterData } from "@/lib/types/character";
import type { FeatureEntry } from "@/app/actions/content";
import { SectionCard } from "../shared/section-card";
import { EmptyState } from "../shared/empty-state";
import { SubclassPicker } from "../panels/subclass-picker";

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

interface Props {
  srdClass: SrdClass | undefined;
  srdRace: SrdRace | undefined;
  srdBackground: SrdBackground | undefined;
  featureMap: Map<string, FeatureEntry>;
  onChangeLevelRequest?: () => void;
}

export function TabFeatures({ srdClass, srdRace, srdBackground, featureMap, onChangeLevelRequest }: Props) {
  const { character, mutate } = useMutation();
  const [subclassPickerOpen, setSubclassPickerOpen] = useState(false);
  const subrace = srdRace?.subraces.find((s) => s.id === character.data.subraceId);

  const currentSubclass = character.data.subclassId
    ? SRD_SUBCLASSES.find((s) => s.id === character.data.subclassId)
    : undefined;

  const needsSubclass =
    srdClass &&
    character.level >= srdClass.subclassUnlockLevel &&
    !character.data.subclassId;

  const features = character.classId
    ? getClassFeatures(character.classId, character.level, {})
    : [];

  const chargeLabels = new Set(features.map((d) => d.label));
  const activeClass = srdClass ?? character.data.resolvedClass;
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
                description: activeClass.featureDescriptions?.[name],
              }))
          )
      : [];

  function handleChargeChange(key: string, next: number) {
    const patch: Partial<CharacterData> = {
      featureCharges: { ...character.data.featureCharges, [key]: next },
    };
    mutate(patch, () => setFeatureCharge(character.id, key, next));
  }

  return (
    <>
    <div className="space-y-4">
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

      {/* Feature Charges */}
      {features.length > 0 && (
        <SectionCard title="Class Features">
          <div className="space-y-4">
            {features.map((def) => {
              const max = maxChargesFor(def, character.level, {});
              const current = currentChargesFor(
                def, character.level, {}, character.data.featureCharges ?? {}
              );
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
        </SectionCard>
      )}

      {/* Non-charge class features */}
      {nonChargeFeatures.length > 0 && (
        <SectionCard title="Class Progression">
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
        </SectionCard>
      )}

      {/* Subclass */}
      {srdClass && (
        needsSubclass ? (
          <SectionCard title="Subclass">
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
          </SectionCard>
        ) : currentSubclass ? (
          <SectionCard title={currentSubclass.name}>
            <p className="text-sm text-stone-300 mb-3">{currentSubclass.description}</p>
            {currentSubclass.featuresByLevel ? (
              <div className="space-y-2">
                {Object.entries(currentSubclass.featuresByLevel)
                  .filter(([lvl]) => Number(lvl) <= character.level)
                  .sort(([a], [b]) => Number(a) - Number(b))
                  .flatMap(([lvl, names]) =>
                    names.map((name) => ({ name, level: Number(lvl) }))
                  )
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
          </SectionCard>
        ) : null
      )}

      {/* Race */}
      {srdRace ? (
        <SectionCard title={subrace ? `${srdRace.name} — ${subrace.name}` : srdRace.name}>
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
                <p className="text-sm text-stone-400 mb-2">{subrace.description}</p>
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
        </SectionCard>
      ) : (
        <SectionCard title="Race">
          <EmptyState message="No race selected." />
        </SectionCard>
      )}

      {/* Class info */}
      {srdClass ? (
        <SectionCard title={srdClass.name}>
          <div
            className="aurora-content text-sm text-stone-300 overflow-x-auto mb-3"
            dangerouslySetInnerHTML={{ __html: cleanHtml(srdClass.description, featureMap) }}
          />
          <div className="grid grid-cols-2 gap-2 text-xs text-stone-400">
            <span>Hit Die: d{srdClass.hitDie}</span>
            <span>Saves: {srdClass.savingThrows.map((s) => s.toUpperCase()).join(", ")}</span>
          </div>
          {srdClass.armorProficiencies.length > 0 && (
            <p className="text-xs text-stone-500 mt-2">
              Armor: {srdClass.armorProficiencies.join(", ")}
            </p>
          )}
          <p className="text-xs text-stone-500 mt-1">
            Weapons: {srdClass.weaponProficiencies.join(", ")}
          </p>
        </SectionCard>
      ) : (
        <SectionCard title="Class">
          <EmptyState message="No class selected." />
        </SectionCard>
      )}

      {/* Background */}
      {srdBackground ? (
        <SectionCard title={`Background — ${srdBackground.name}`}>
          <div
            className="aurora-content text-sm text-stone-300 overflow-x-auto mb-2"
            dangerouslySetInnerHTML={{ __html: cleanHtml(srdBackground.description, featureMap) }}
          />
          <p className="text-xs text-stone-500">
            Skill Proficiencies: {srdBackground.skillProficiencies.join(", ")}
          </p>
          {srdBackground.toolProficiency && (
            <p className="text-xs text-stone-500 mt-1">Tools: {srdBackground.toolProficiency}</p>
          )}
          {srdBackground.languages && (
            <p className="text-xs text-stone-500 mt-1">
              Languages: {srdBackground.languages} additional language{srdBackground.languages > 1 ? "s" : ""}
            </p>
          )}
        </SectionCard>
      ) : (
        <SectionCard title="Background">
          <EmptyState message="No background selected." />
        </SectionCard>
      )}
    </div>

    {srdClass && (
      <SubclassPicker
        open={subclassPickerOpen}
        onClose={() => setSubclassPickerOpen(false)}
        srdClass={srdClass}
      />
    )}
  </>
  );
}

// ── Sub-components ────────────────────────────────────────────────────────────

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
        /* Pip UI */
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
        /* Stepper for >6 charges */
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
