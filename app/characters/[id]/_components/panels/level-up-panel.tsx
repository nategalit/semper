"use client";

import { useState, useTransition, useMemo } from "react";
import { useMutation } from "@/lib/character/mutation-context";
import { levelUpCharacter } from "@/app/actions/characters";
import { abilityMod } from "@/lib/character/calc";
import { averageHpPerLevel, getAsiLevels } from "@/lib/content/srd/progression";
import { SRD_SUBCLASSES } from "@/lib/content/srd";
import type { SrdClass, SrdSubclass, AbilityKey } from "@/lib/content/srd";
import type { AbilityScores } from "@/lib/types/character";

// ─── Constants ────────────────────────────────────────────────────────────────

const ABILITY_KEYS: AbilityKey[] = ["str", "dex", "con", "int", "wis", "cha"];
const ABILITY_LABELS: Record<AbilityKey, string> = {
  str: "STR", dex: "DEX", con: "CON", int: "INT", wis: "WIS", cha: "CHA",
};

// ─── Types ────────────────────────────────────────────────────────────────────

interface Props {
  open: boolean;
  onClose: () => void;
  srdClass: SrdClass | undefined;
}

// ─── Main panel ───────────────────────────────────────────────────────────────

export function LevelUpPanel({ open, onClose, srdClass }: Props) {
  const { character } = useMutation();
  const [isPending, startTransition] = useTransition();

  const currentLevel = character.level;
  const { abilityScores } = character.data;
  const hitDie = srdClass?.hitDie ?? 8;
  const conMod = abilityMod(abilityScores.con);
  const avgHp = averageHpPerLevel(hitDie, conMod);
  const classId = character.classId ?? "";

  const asiLevelSet = useMemo(() => new Set(getAsiLevels(classId)), [classId]);
  const subclassUnlockLevel = srdClass?.subclassUnlockLevel ?? 3;
  const availableSubclasses = srdClass
    ? SRD_SUBCLASSES.filter((s) => s.classId === srdClass.id)
    : [];

  const [targetLevel, setTargetLevel] = useState(currentLevel);
  const [hpByNewLevel, setHpByNewLevel] = useState<Record<number, number>>({});
  const [asiByNewLevel, setAsiByNewLevel] = useState<Record<number, Partial<Record<AbilityKey, number>>>>({});
  const [pickedSubclassId, setPickedSubclassId] = useState(character.data.subclassId ?? "");

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

  // ── ASI helpers ─────────────────────────────────────────────────────────────

  function getAsiForLevel(lvl: number): Partial<Record<AbilityKey, number>> {
    return asiByNewLevel[lvl] ?? {};
  }

  function totalAsiPoints(asi: Partial<Record<AbilityKey, number>>): number {
    return Object.values(asi).reduce((sum, v) => sum + (v ?? 0), 0);
  }

  function adjustAsi(lvl: number, ability: AbilityKey, delta: number) {
    const current = getAsiForLevel(lvl);
    const currentVal = current[ability] ?? 0;
    const newVal = Math.max(0, currentVal + delta);
    const newAsi = { ...current, [ability]: newVal };
    if (totalAsiPoints(newAsi) > 2) return;
    if ((abilityScores[ability] + newVal) > 20) return;
    setAsiByNewLevel((prev) => ({ ...prev, [lvl]: newAsi }));
  }

  // ── Validation ──────────────────────────────────────────────────────────────

  const asiLevelsInRange = newLevels.filter((l) => asiLevelSet.has(l));
  const allAsiAllocated = asiLevelsInRange.every(
    (l) => totalAsiPoints(getAsiForLevel(l)) === 2
  );

  const canConfirm =
    !isPending &&
    targetLevel !== currentLevel &&
    (isDown
      ? true
      : (!needsSubclassPick || !!pickedSubclassId) && allAsiAllocated);

  // ── Confirm ─────────────────────────────────────────────────────────────────

  function handleConfirm() {
    if (targetLevel === currentLevel || isPending) return;

    const hpGained: Record<number, number> = {};
    if (isUp) {
      for (const lvl of newLevels) hpGained[lvl] = getHpForLevel(lvl);
    }

    startTransition(async () => {
      await levelUpCharacter(
        character.id,
        targetLevel,
        hpGained,
        isUp ? asiByNewLevel : {},
        needsSubclassPick && pickedSubclassId ? pickedSubclassId : undefined,
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
          md:inset-auto md:top-[4vh] md:left-1/2 md:-translate-x-1/2 md:w-[min(600px,92vw)]
          md:rounded-2xl md:border md:border-stone-700 flex flex-col"
        style={{ maxHeight: "92dvh" }}
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
                    onClick={() =>
                      setTargetLevel(lvl === targetLevel ? currentLevel : lvl)
                    }
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
            newLevels.map((lvl) => (
              <LevelSection
                key={lvl}
                lvl={lvl}
                srdClass={srdClass}
                hitDie={hitDie}
                avgHp={avgHp}
                hpValue={getHpForLevel(lvl)}
                onHpChange={(hp) => setHpForLevel(lvl, hp)}
                onHpRoll={() => rollHpForLevel(lvl)}
                hasAsi={asiLevelSet.has(lvl)}
                asi={getAsiForLevel(lvl)}
                asiPoints={totalAsiPoints(getAsiForLevel(lvl))}
                abilityScores={abilityScores}
                onAsiAdjust={(ability, delta) => adjustAsi(lvl, ability, delta)}
                isSubclassLevel={lvl === subclassUnlockLevel && needsSubclassPick}
                availableSubclasses={availableSubclasses}
                pickedSubclassId={pickedSubclassId}
                onSubclassPick={setPickedSubclassId}
              />
            ))}
        </div>

        {/* Footer */}
        <div className="px-5 pb-5 pt-3 border-t border-stone-800 shrink-0 space-y-2">
          {isUp && asiLevelsInRange.length > 0 && !allAsiAllocated && (
            <p className="text-xs text-center text-amber-500">
              Allocate 2 ASI points for each ASI level before confirming.
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
            className="w-full min-h-[48px] rounded-xl bg-amber-600 text-stone-950 font-bold
              hover:bg-amber-500 active:bg-amber-700 disabled:opacity-40 disabled:cursor-not-allowed
              transition-colors"
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
  hasAsi: boolean;
  asi: Partial<Record<AbilityKey, number>>;
  asiPoints: number;
  abilityScores: AbilityScores;
  onAsiAdjust: (ability: AbilityKey, delta: number) => void;
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
  hasAsi,
  asi,
  asiPoints,
  abilityScores,
  onAsiAdjust,
  isSubclassLevel,
  availableSubclasses,
  pickedSubclassId,
  onSubclassPick,
}: LevelSectionProps) {
  const features: string[] = srdClass?.featuresByLevel?.[lvl] ?? [];
  const computedFeatures = [
    ...(hasAsi ? ["Ability Score Improvement"] : []),
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

        {/* Features */}
        {computedFeatures.length > 0 && (
          <div>
            <p className="text-xs text-stone-500 uppercase tracking-wide mb-2">Features</p>
            <div className="flex flex-wrap gap-1.5">
              {computedFeatures.map((f) => (
                <span
                  key={f}
                  className="text-[10px] px-2 py-0.5 rounded-full bg-stone-700 text-stone-400"
                >
                  {f}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* ASI picker */}
        {hasAsi && (
          <div>
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs text-stone-500 uppercase tracking-wide">
                Ability Score Improvement
              </p>
              <span className={`text-xs font-semibold ${asiPoints === 2 ? "text-emerald-400" : "text-stone-500"}`}>
                {asiPoints}/2
              </span>
            </div>
            <div className="space-y-1">
              {ABILITY_KEYS.map((ability) => {
                const current = abilityScores[ability];
                const allocated = asi[ability] ?? 0;
                const newScore = current + allocated;
                const atCap = newScore >= 20;
                const atZero = allocated === 0;
                return (
                  <div key={ability} className="flex items-center gap-3">
                    <span className="w-8 text-xs font-medium text-stone-400">
                      {ABILITY_LABELS[ability]}
                    </span>
                    <span className="w-8 text-center text-sm font-semibold text-stone-200 tabular-nums">
                      {current}
                    </span>
                    <button
                      onClick={() => onAsiAdjust(ability, -1)}
                      disabled={atZero}
                      className="w-8 h-8 rounded border border-stone-600 text-stone-400
                        hover:border-stone-400 disabled:opacity-30 disabled:cursor-not-allowed
                        transition-colors text-base flex items-center justify-center"
                    >
                      −
                    </button>
                    <span className={`w-6 text-center text-sm font-bold tabular-nums ${
                      allocated > 0 ? "text-amber-400" : "text-stone-600"
                    }`}>
                      {allocated > 0 ? `+${allocated}` : "—"}
                    </span>
                    <button
                      onClick={() => onAsiAdjust(ability, 1)}
                      disabled={atCap || asiPoints >= 2}
                      className="w-8 h-8 rounded border border-stone-600 text-stone-400
                        hover:border-stone-400 disabled:opacity-30 disabled:cursor-not-allowed
                        transition-colors text-base flex items-center justify-center"
                    >
                      +
                    </button>
                    {allocated > 0 && (
                      <span className="text-xs text-stone-500">→ {newScore}</span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Subclass picker */}
        {isSubclassLevel && (
          <div>
            <p className="text-xs text-stone-500 uppercase tracking-wide mb-2">
              Choose Subclass
            </p>
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
                    <p className={`text-sm font-semibold ${
                      pickedSubclassId === sub.id ? "text-amber-300" : "text-stone-200"
                    }`}>
                      {sub.name}
                    </p>
                    {sub.description && (
                      <p className="text-xs text-stone-500 mt-1 leading-relaxed line-clamp-2">
                        {sub.description}
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
