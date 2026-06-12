"use client";

import { useState, useTransition, useMemo } from "react";
import { useMutation } from "@/lib/character/mutation-context";
import { levelUpCharacter } from "@/app/actions/characters";
import { abilityMod } from "@/lib/character/calc";
import { averageHpPerLevel } from "@/lib/content/srd/progression";
import { FIGHTING_STYLES } from "@/lib/content/srd";
import type { SrdClass, SrdSubclass, AbilityKey } from "@/lib/content/srd";
import type { AbilityScores } from "@/lib/types/character";
import type { FightingStyleEntry } from "@/app/actions/content";
import type { FeatElement } from "@/lib/content/schema";
import { btn, sourceChipClass } from "@/lib/ui-tokens";
import { choiceFeatureDefs } from "@/lib/features";
import type { FeatureDef } from "@/lib/features/types";
import { ChoicePicker, type AsiOrFeatValue, type ChoiceValue } from "../features/choice-picker";
import { ABILITY_KEYS, isHalfFeat } from "./feat-picker";
import { totalAsiPoints } from "../features/choice-picker/asi-or-feat";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Props {
  open: boolean;
  onClose: () => void;
  srdClass: SrdClass | undefined;
  importedFightingStyles?: FightingStyleEntry[];
  allSubclasses?: SrdSubclass[];
  importedFeats?: FeatElement[];
}

// ─── Main panel ───────────────────────────────────────────────────────────────

export function LevelUpPanel({
  open,
  onClose,
  srdClass,
  importedFightingStyles = [],
  allSubclasses = [],
  importedFeats = [],
}: Props) {
  const { character } = useMutation();
  const [isPending, startTransition] = useTransition();

  const currentLevel = character.level;
  const { abilityScores } = character.data;
  const hitDie = srdClass?.hitDie ?? 8;
  const conMod = abilityMod(abilityScores.con);
  const avgHp = averageHpPerLevel(hitDie, conMod);
  const classId = character.classId ?? "";

  const subclassUnlockLevel = srdClass?.subclassUnlockLevel ?? 3;
  const availableSubclasses = srdClass
    ? allSubclasses.filter((s) => s.classId === srdClass.id)
    : [];

  // Merge SRD styles with Aurora-imported styles, deduplicating by name.
  const srdStyleNames = useMemo(() => new Set(FIGHTING_STYLES.map((s) => s.name.toLowerCase())), []);
  const allFightingStyles: FightingStyleEntry[] = useMemo(() => [
    ...FIGHTING_STYLES.map((s) => ({ ...s, sourceLabel: "SRD" })),
    ...importedFightingStyles.filter((s) => !srdStyleNames.has(s.name.toLowerCase())),
  ], [importedFightingStyles, srdStyleNames]);

  const [targetLevel, setTargetLevel] = useState(currentLevel);
  const [hpByNewLevel, setHpByNewLevel] = useState<Record<number, number>>({});
  // Unified ASI/Feat state: replaces separate asiByNewLevel, modeByLevel, featByNewLevel, featAsiByLevel
  const [asiValueByLevel, setAsiValueByLevel] = useState<Record<number, AsiOrFeatValue>>({});
  // Fighting style choices keyed by level
  const [fightingStyleByLevel, setFightingStyleByLevel] = useState<Record<number, string>>({});
  const [pickedSubclassId, setPickedSubclassId] = useState(character.data.subclassId ?? "");

  // Must be above the early return — hooks cannot be called conditionally.
  const activeFeatIds = useMemo(() => {
    const ids = new Set<string>();
    for (const choice of Object.values(character.data.levelChoices ?? {})) {
      if (choice.featId) ids.add(choice.featId);
    }
    for (const v of Object.values(asiValueByLevel)) {
      if (v.mode === "feat" && v.featId) ids.add(v.featId);
    }
    return ids;
  }, [character.data.levelChoices, asiValueByLevel]);

  if (!open) return null;

  const isUp   = targetLevel > currentLevel;
  const isDown = targetLevel < currentLevel;
  const newLevels = isUp
    ? Array.from({ length: targetLevel - currentLevel }, (_, i) => currentLevel + 1 + i)
    : [];

  const needsSubclassPick =
    isUp &&
    newLevels.includes(subclassUnlockLevel) &&
    !character.data.subclassId;

  const effectiveSubclassId = pickedSubclassId || character.data.subclassId;

  // ── HP helpers ──────────────────────────────────────────────────────────────

  function getHpForLevel(lvl: number): number {
    return hpByNewLevel[lvl] ?? avgHp;
  }

  function setHpForLevel(lvl: number, hp: number) {
    setHpByNewLevel((prev) => ({ ...prev, [lvl]: Math.max(1, hp) }));
  }

  function rollHpForLevel(lvl: number) {
    const rolled = Math.floor(Math.random() * hitDie) + 1;
    setHpForLevel(lvl, rolled + conMod);
  }

  // ── ASI/Feat helpers ────────────────────────────────────────────────────────

  function getAsiValue(lvl: number): AsiOrFeatValue {
    return asiValueByLevel[lvl] ?? { mode: "asi", asi: {} };
  }

  // Effective ability scores up to (but not including) lvl, applying all prior ASI picks.
  function effectiveScoresAtLevel(lvl: number): AbilityScores {
    const result: AbilityScores = { ...abilityScores };
    for (const prevLvl of newLevels) {
      if (prevLvl >= lvl) break;
      const prevAsi = asiValueByLevel[prevLvl]?.asi ?? {};
      for (const key of ABILITY_KEYS) {
        result[key] += prevAsi[key] ?? 0;
      }
    }
    return result;
  }

  function handleAsiChange(lvl: number, v: AsiOrFeatValue) {
    setAsiValueByLevel((prev) => ({ ...prev, [lvl]: v }));
  }

  // ── Fighting style helpers ──────────────────────────────────────────────────

  function getFightingStyleForLevel(lvl: number): string {
    return fightingStyleByLevel[lvl] ?? "";
  }

  function handleFightingStyleChange(lvl: number, id: string) {
    setFightingStyleByLevel((prev) => ({ ...prev, [lvl]: id }));
  }

  // ── Generic choice helpers ──────────────────────────────────────────────────

  function getChoiceValue(def: FeatureDef, lvl: number, choiceKind: string): ChoiceValue | undefined {
    if (choiceKind === "asi-or-feat") return getAsiValue(lvl);
    if (choiceKind === "feat") return getFightingStyleForLevel(lvl) || undefined;
    return undefined;
  }

  function handleChoiceChange(def: FeatureDef, lvl: number, choiceKind: string, v: ChoiceValue) {
    if (choiceKind === "asi-or-feat") {
      handleAsiChange(lvl, v as AsiOrFeatValue);
    } else if (choiceKind === "feat") {
      handleFightingStyleChange(lvl, v as string);
    }
  }

  // ── Validation ──────────────────────────────────────────────────────────────

  const asiLevelsInRange = newLevels.filter((l) =>
    choiceFeatureDefs(classId, effectiveSubclassId, l).some((d) =>
      d.choices?.some((c) => c.kind === "asi-or-feat")
    )
  );

  const allAsiLevelsComplete = asiLevelsInRange.every((l) => {
    const v = asiValueByLevel[l];
    if (!v || v.mode !== "feat") return totalAsiPoints(v?.asi ?? {}) === 2;
    if (!v.featId) return false;
    const feat = importedFeats.find((f) => f.id === v.featId);
    if (feat && isHalfFeat(feat)) return !!v.featAsi;
    return true;
  });

  const fightingStyleLevels = newLevels.filter((l) =>
    choiceFeatureDefs(classId, effectiveSubclassId, l).some((d) =>
      d.choices?.some((c) => c.kind === "feat")
    )
  );
  const allFightingStylesComplete = fightingStyleLevels.every((l) => !!fightingStyleByLevel[l]);

  const canConfirm =
    !isPending &&
    targetLevel !== currentLevel &&
    (isDown
      ? true
      : (!needsSubclassPick || !!pickedSubclassId) &&
        allAsiLevelsComplete &&
        allFightingStylesComplete);

  // ── Confirm ─────────────────────────────────────────────────────────────────

  function handleConfirm() {
    if (targetLevel === currentLevel || isPending) return;

    const hpGained: Record<number, number> = {};
    if (isUp) {
      for (const lvl of newLevels) hpGained[lvl] = getHpForLevel(lvl);
    }

    // Derive asiByNewLevel and featByNewLevel from asiValueByLevel for the action.
    const asiByNewLevel: Record<number, Partial<Record<AbilityKey, number>>> = {};
    const featByNewLevel: Record<number, string> = {};
    for (const [lStr, v] of Object.entries(asiValueByLevel)) {
      const l = Number(lStr);
      if (v.mode === "asi") {
        if (Object.keys(v.asi).length > 0) asiByNewLevel[l] = v.asi;
      } else if (v.mode === "feat" && v.featId) {
        featByNewLevel[l] = v.featId;
        if (v.featAsi) asiByNewLevel[l] = { [v.featAsi]: 1 };
      }
    }

    const fightingStyleArg = Object.keys(fightingStyleByLevel).length > 0
      ? fightingStyleByLevel
      : undefined;

    startTransition(async () => {
      await levelUpCharacter(
        character.id,
        targetLevel,
        hpGained,
        isUp ? asiByNewLevel : {},
        needsSubclassPick && pickedSubclassId ? pickedSubclassId : undefined,
        fightingStyleArg,
        Object.keys(featByNewLevel).length > 0 ? featByNewLevel : undefined,
      );
      onClose();
    });
  }

  // ── Render ──────────────────────────────────────────────────────────────────

  return (
    <>
      <div
        className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden
      />
      <div
        role="dialog"
        aria-modal
        aria-label="Change level"
        className="fixed inset-x-0 bottom-0 z-50 bg-stone-900 border-t border-stone-700 rounded-t-2xl
          md:inset-auto md:top-[2vh] md:left-1/2 md:-translate-x-1/2 md:w-[min(600px,92vw)]
          md:rounded-2xl md:border md:border-stone-700 flex flex-col"
        style={{ maxHeight: "96dvh" }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-4 pb-3 border-b border-stone-800 shrink-0">
          <div>
            <h2 className="text-base font-bold text-stone-100">Change Level</h2>
            <p className="text-xs text-stone-400 mt-0.5">
              Level {currentLevel} · {srdClass?.name ?? "Unknown Class"}
            </p>
          </div>
          <button
            onClick={onClose}
            className="min-w-[44px] min-h-[44px] flex items-center justify-center text-stone-400 hover:text-stone-200 text-xl"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        {/* Body */}
        <div className="overflow-y-auto flex-1 px-5 py-4 space-y-6">
          {/* Level grid */}
          <div>
            <p className="text-xs text-stone-500 uppercase tracking-wide mb-3">Select Level</p>
            <div className="grid grid-cols-5 gap-2">
              {Array.from({ length: 20 }, (_, i) => i + 1).map((lvl) => {
                const isCurrent = lvl === currentLevel;
                const isTarget  = lvl === targetLevel;
                const isInRange = isUp && lvl > currentLevel && lvl <= targetLevel;
                return (
                  <button
                    key={lvl}
                    onClick={() => {
                      const next = lvl === targetLevel ? currentLevel : lvl;
                      setTargetLevel(next);
                      const keep = (l: number) => l > currentLevel && l <= next;
                      const prune = <T,>(prev: Record<number, T>) =>
                        Object.fromEntries(Object.entries(prev).filter(([k]) => keep(Number(k))));
                      setAsiValueByLevel(prune);
                      setFightingStyleByLevel(prune);
                      setHpByNewLevel(prune);
                    }}
                    className={`h-11 rounded-lg text-sm font-semibold border transition-colors ${
                      isTarget && isCurrent
                        ? "border-amber-400 bg-amber-400/20 text-amber-300"
                        : isTarget
                        ? "border-amber-500 bg-amber-600 text-stone-950"
                        : isCurrent
                        ? "border-amber-600 text-amber-400"
                        : isInRange
                        ? "border-stone-600 bg-stone-800/60 text-stone-300"
                        : "border-stone-700 text-stone-500 hover:border-stone-500 hover:text-stone-300"
                    }`}
                  >
                    {lvl}
                  </button>
                );
              })}
            </div>
            <p className="text-xs text-stone-600 mt-2 text-center">
              Tap a level · tap again to reset
            </p>
          </div>

          {/* Level-down notice */}
          {isDown && (
            <div className="rounded-xl border border-stone-700 bg-stone-800/40 px-4 py-3">
              <p className="text-sm font-medium text-stone-300">
                Level down to {targetLevel}
              </p>
              <p className="text-xs text-stone-500 mt-1 leading-relaxed">
                HP and ability score gains from levels {targetLevel + 1}–{currentLevel} will
                be reversed using your saved choices.
                {!character.data.levelChoices &&
                  " No saved choices found — HP and stats will not change, only the level number."}
              </p>
            </div>
          )}

          {/* Level-up sections */}
          {isUp &&
            newLevels.map((lvl) => {
              const choiceDefs = choiceFeatureDefs(classId, effectiveSubclassId, lvl);
              const disabledFeatIds = new Set(activeFeatIds);
              const currentFeatId = asiValueByLevel[lvl]?.featId;
              if (currentFeatId) disabledFeatIds.delete(currentFeatId);
              return (
                <LevelSection
                  key={lvl}
                  lvl={lvl}
                  srdClass={srdClass}
                  hitDie={hitDie}
                  avgHp={avgHp}
                  hpValue={getHpForLevel(lvl)}
                  onHpChange={(hp) => setHpForLevel(lvl, hp)}
                  onHpRoll={() => rollHpForLevel(lvl)}
                  choiceDefs={choiceDefs}
                  getChoiceValue={(def, kind) => getChoiceValue(def, lvl, kind)}
                  onChoiceChange={(def, kind, v) => handleChoiceChange(def, lvl, kind, v)}
                  effectiveScores={effectiveScoresAtLevel(lvl)}
                  feats={importedFeats}
                  disabledFeatIds={disabledFeatIds}
                  allFightingStyles={allFightingStyles}
                  isSubclassLevel={lvl === subclassUnlockLevel && needsSubclassPick}
                  availableSubclasses={availableSubclasses}
                  pickedSubclassId={pickedSubclassId}
                  onSubclassPick={setPickedSubclassId}
                />
              );
            })}
        </div>

        {/* Footer */}
        <div className="px-5 pb-5 pt-3 border-t border-stone-800 shrink-0 space-y-2">
          {isUp && asiLevelsInRange.length > 0 && !allAsiLevelsComplete && (
            <p className="text-xs text-center text-amber-500">
              Choose ability score increases or a feat for each ASI level before confirming.
            </p>
          )}
          {isUp && fightingStyleLevels.length > 0 && !allFightingStylesComplete && (
            <p className="text-xs text-center text-amber-500">
              Choose a Fighting Style before confirming.
            </p>
          )}
          {needsSubclassPick && !pickedSubclassId && (
            <p className="text-xs text-center text-amber-500">
              Choose a subclass for level {subclassUnlockLevel}.
            </p>
          )}
          <button
            onClick={handleConfirm}
            disabled={!canConfirm}
            className={`w-full ${btn.primary} disabled:opacity-40 disabled:cursor-not-allowed`}
          >
            {isPending
              ? "Saving…"
              : isDown
              ? `Level Down to ${targetLevel}`
              : isUp
              ? `Level Up to ${targetLevel}`
              : "Select a level"}
          </button>
        </div>
      </div>
    </>
  );
}

// ─── Per-level section ────────────────────────────────────────────────────────

interface LevelSectionProps {
  lvl: number;
  srdClass: SrdClass | undefined;
  hitDie: number;
  avgHp: number;
  hpValue: number;
  onHpChange: (hp: number) => void;
  onHpRoll: () => void;
  choiceDefs: FeatureDef[];
  getChoiceValue: (def: FeatureDef, choiceKind: string) => ChoiceValue | undefined;
  onChoiceChange: (def: FeatureDef, choiceKind: string, value: ChoiceValue) => void;
  effectiveScores: AbilityScores;
  feats: FeatElement[];
  disabledFeatIds: Set<string>;
  allFightingStyles: FightingStyleEntry[];
  isSubclassLevel: boolean;
  availableSubclasses: SrdSubclass[];
  pickedSubclassId: string;
  onSubclassPick: (id: string) => void;
}

function LevelSection({
  lvl,
  srdClass,
  hitDie,
  avgHp,
  hpValue,
  onHpChange,
  onHpRoll,
  choiceDefs,
  getChoiceValue,
  onChoiceChange,
  effectiveScores,
  feats,
  disabledFeatIds,
  allFightingStyles,
  isSubclassLevel,
  availableSubclasses,
  pickedSubclassId,
  onSubclassPick,
}: LevelSectionProps) {
  const features: string[] = srdClass?.featuresByLevel?.[lvl] ?? [];
  const hasAsiChoice = choiceDefs.some((d) => d.choices?.some((c) => c.kind === "asi-or-feat"));
  const computedFeatures = [
    ...(hasAsiChoice ? ["Ability Score Improvement"] : []),
    ...features.filter((f) => !f.toLowerCase().includes("ability score")),
  ];

  return (
    <div className="rounded-xl border border-stone-700 bg-stone-800/30 overflow-hidden">
      {/* Level header */}
      <div className="px-4 py-2 bg-stone-800 border-b border-stone-700">
        <p className="text-sm font-bold text-amber-300">Level {lvl}</p>
      </div>

      <div className="px-4 py-3 space-y-4">
        {/* HP gained */}
        <div>
          <p className="text-xs text-stone-500 uppercase tracking-wide mb-2">HP Gained</p>
          <div className="flex items-center gap-3">
            <button
              onClick={() => onHpChange(hpValue - 1)}
              className="w-10 h-10 rounded-lg border border-stone-600 text-stone-300 text-lg
                hover:border-stone-400 active:scale-95 transition-all flex items-center justify-center"
              aria-label="Decrease HP"
            >
              −
            </button>
            <div className="flex-1 text-center">
              <span className="text-2xl font-bold text-stone-100 tabular-nums">
                {hpValue > 0 ? `+${hpValue}` : hpValue}
              </span>
              <p className="text-[10px] text-stone-600 mt-0.5">
                avg +{avgHp} · 1d{hitDie}+CON
              </p>
            </div>
            <button
              onClick={() => onHpChange(hpValue + 1)}
              className="w-10 h-10 rounded-lg border border-stone-600 text-stone-300 text-lg
                hover:border-stone-400 active:scale-95 transition-all flex items-center justify-center"
              aria-label="Increase HP"
            >
              +
            </button>
          </div>
          <div className="flex gap-2 mt-2">
            <button
              onClick={() => onHpChange(avgHp)}
              className="flex-1 py-1.5 rounded-lg border border-stone-600 text-xs text-stone-400
                hover:border-stone-400 hover:text-stone-200 transition-colors"
            >
              Average (+{avgHp})
            </button>
            <button
              onClick={onHpRoll}
              className="flex-1 py-1.5 rounded-lg border border-stone-600 text-xs text-stone-400
                hover:border-stone-400 hover:text-stone-200 transition-colors"
            >
              Roll 1d{hitDie}
            </button>
          </div>
        </div>

        {/* Features list */}
        {computedFeatures.length > 0 && (
          <div>
            <p className="text-xs text-stone-500 uppercase tracking-wide mb-2">Features</p>
            <div className="flex flex-wrap gap-1.5">
              {computedFeatures.map((f) => (
                <span key={f} className="text-[10px] px-2 py-0.5 rounded-full bg-stone-700 text-stone-400">
                  {f}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Generic choice pickers — driven by FeatureDef.choices */}
        {choiceDefs.map((def) =>
          (def.choices ?? []).map((choice, i) => {
            const label =
              choice.kind === "asi-or-feat"
                ? "Ability Score Improvement"
                : choice.kind === "feat"
                ? def.name
                : def.name;
            return (
              <div key={`${def.id}-${i}`}>
                <p className="text-xs text-stone-500 uppercase tracking-wide mb-2">{label}</p>
                <ChoicePicker
                  choice={choice}
                  value={getChoiceValue(def, choice.kind)}
                  onChange={(v) => onChoiceChange(def, choice.kind, v)}
                  allFightingStyles={allFightingStyles}
                  effectiveScores={effectiveScores}
                  feats={feats}
                  disabledFeatIds={disabledFeatIds}
                />
              </div>
            );
          })
        )}

        {/* Subclass picker */}
        {isSubclassLevel && (
          <div>
            <p className="text-xs text-stone-500 uppercase tracking-wide mb-2">Choose Subclass</p>
            {availableSubclasses.length === 0 ? (
              <p className="text-xs text-stone-600">
                No subclasses available. Use the Features tab to set one later.
              </p>
            ) : (
              <div className="space-y-2">
                {availableSubclasses.map((sub) => (
                  <button
                    key={sub.id}
                    onClick={() => onSubclassPick(sub.id)}
                    className={`w-full rounded-xl border p-3 text-left transition-colors ${
                      pickedSubclassId === sub.id
                        ? "border-amber-500 bg-amber-900/20"
                        : "border-stone-700 bg-stone-800 hover:border-stone-500"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <p className={`text-sm font-semibold ${
                        pickedSubclassId === sub.id ? "text-amber-300" : "text-stone-200"
                      }`}>
                        {sub.name}
                      </p>
                      <span className={`text-[10px] rounded px-1.5 py-0.5 font-medium shrink-0 ${sourceChipClass(sub.source)}`}>
                        {sub.sourceLabel ?? "SRD"}
                      </span>
                    </div>
                    {sub.description && (
                      <p className="text-xs text-stone-500 mt-1 leading-relaxed line-clamp-2">
                        {sub.description.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim()}
                      </p>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
