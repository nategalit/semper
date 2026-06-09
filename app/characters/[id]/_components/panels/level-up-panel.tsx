"use client";

import { useState, useTransition, useMemo } from "react";
import { useMutation } from "@/lib/character/mutation-context";
import { levelUpCharacter } from "@/app/actions/characters";
import { abilityMod } from "@/lib/character/calc";
import { averageHpPerLevel, getAsiLevels } from "@/lib/content/srd/progression";
import { FIGHTING_STYLES, FIGHTING_STYLE_BY_CLASS } from "@/lib/content/srd";
import type { SrdClass, SrdSubclass, AbilityKey } from "@/lib/content/srd";
import type { AbilityScores } from "@/lib/types/character";
import type { FightingStyleEntry } from "@/app/actions/content";
import type { FeatElement } from "@/lib/content/schema";
import { abbreviateSource } from "@/lib/content/source-abbreviations";
import { FilterPill } from "@/app/_components/filter-pill";
import { btn, sourceChipClass } from "@/lib/ui-tokens";
import { cleanHtmlBrowse } from "@/lib/content/aurora/clean-html";

// ─── Constants ────────────────────────────────────────────────────────────────

const ABILITY_KEYS: AbilityKey[] = ["str", "dex", "con", "int", "wis", "cha"];
const ABILITY_LABELS: Record<AbilityKey, string> = {
  str: "STR", dex: "DEX", con: "CON", int: "INT", wis: "WIS", cha: "CHA",
};

// Maps the final segment of Aurora ASI element IDs to ability keys.
// Covers both ID_PHB_FEAT_ASI_STRENGTH and ID_INTERNAL_ABILITY_SCORE_IMPROVEMENT_FEAT_STRENGTH patterns.
const ABILITY_SUFFIX_MAP: Record<string, AbilityKey> = {
  STRENGTH: "str", STR: "str",
  DEXTERITY: "dex", DEX: "dex",
  CONSTITUTION: "con", CON: "con",
  INTELLIGENCE: "int", INT: "int",
  WISDOM: "wis", WIS: "wis",
  CHARISMA: "cha", CHA: "cha",
};

function isHalfFeat(feat: FeatElement): boolean {
  return feat.rules.choices.some((c) => c.kind === "element" && c.type === "Ability Score Improvement");
}

// Returns allowed ability keys for a half-feat's ASI sub-choice.
// Parses the pipe-delimited Aurora ID list in the choice's `supports` field.
// Falls back to all 6 abilities when `supports` is a category label (not IDs).
function halfFeatAbilities(feat: FeatElement): AbilityKey[] {
  const choice = feat.rules.choices.find((c) => c.kind === "element" && c.type === "Ability Score Improvement");
  if (!choice || choice.kind !== "element" || !choice.supports) return ABILITY_KEYS;
  const tokens = choice.supports.split("|").map((s) => s.trim()).filter(Boolean);
  const abilities: AbilityKey[] = [];
  for (const token of tokens) {
    const suffix = token.split("_").pop()?.toUpperCase() ?? "";
    const key = ABILITY_SUFFIX_MAP[suffix];
    if (!key) return ABILITY_KEYS; // unparseable token → show all 6
    if (!abilities.includes(key)) abilities.push(key);
  }
  return abilities.length > 0 ? abilities : ABILITY_KEYS;
}

// ─── Types ────────────────────────────────────────────────────────────────────

interface FightingStyleOption {
  id: string;
  name: string;
  description: string;
  sourceLabel: string;
}

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

  const asiLevelSet = useMemo(() => new Set(getAsiLevels(classId)), [classId]);
  const subclassUnlockLevel = srdClass?.subclassUnlockLevel ?? 3;
  const availableSubclasses = srdClass
    ? allSubclasses.filter((s) => s.classId === srdClass.id)
    : [];

  const fightingStyleGrantLevel = FIGHTING_STYLE_BY_CLASS[classId] ?? 0;

  const srdStyleNames = useMemo(() => new Set(FIGHTING_STYLES.map((s) => s.name.toLowerCase())), []);
  const allFightingStyles: FightingStyleOption[] = useMemo(() => [
    ...FIGHTING_STYLES.map((s) => ({ ...s, sourceLabel: "SRD" })),
    ...importedFightingStyles.filter((s) => !srdStyleNames.has(s.name.toLowerCase())),
  ], [importedFightingStyles, srdStyleNames]);

  const [targetLevel, setTargetLevel] = useState(currentLevel);
  const [hpByNewLevel, setHpByNewLevel] = useState<Record<number, number>>({});
  const [asiByNewLevel, setAsiByNewLevel] = useState<Record<number, Partial<Record<AbilityKey, number>>>>({});
  const [pickedSubclassId, setPickedSubclassId] = useState(character.data.subclassId ?? "");
  const [pickedFightingStyleId, setPickedFightingStyleId] = useState("");
  const [featByNewLevel, setFeatByNewLevel] = useState<Record<number, string>>({});
  const [modeByLevel, setModeByLevel] = useState<Record<number, "asi" | "feat">>({});
  const [featAsiByLevel, setFeatAsiByLevel] = useState<Record<number, AbilityKey>>({});

  // Must be above the early return — hooks cannot be called conditionally.
  const activeFeatIds = useMemo(() => {
    const ids = new Set<string>();
    for (const choice of Object.values(character.data.levelChoices ?? {})) {
      if (choice.featId) ids.add(choice.featId);
    }
    for (const featId of Object.values(featByNewLevel)) {
      ids.add(featId);
    }
    return ids;
  }, [character.data.levelChoices, featByNewLevel]);

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

  const needsFightingStylePick =
    isUp &&
    fightingStyleGrantLevel > 0 &&
    newLevels.includes(fightingStyleGrantLevel);

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

  // Scores after applying all earlier draft ASI allocations (levels strictly before lvl).
  function effectiveScoresAtLevel(lvl: number): AbilityScores {
    const result: AbilityScores = { ...abilityScores };
    for (const prevLvl of newLevels) {
      if (prevLvl >= lvl) break;
      const prevAsi = asiByNewLevel[prevLvl] ?? {};
      for (const key of ABILITY_KEYS) {
        result[key] += prevAsi[key] ?? 0;
      }
    }
    return result;
  }

  function adjustAsi(lvl: number, ability: AbilityKey, delta: number) {
    const current = getAsiForLevel(lvl);
    const currentVal = current[ability] ?? 0;
    const newVal = Math.max(0, currentVal + delta);
    const newAsi = { ...current, [ability]: newVal };
    if (totalAsiPoints(newAsi) > 2) return;
    if ((effectiveScoresAtLevel(lvl)[ability] + newVal) > 20) return;
    setAsiByNewLevel((prev) => ({ ...prev, [lvl]: newAsi }));
  }

  // ── Feat helpers ─────────────────────────────────────────────────────────────

  function getModeForLevel(lvl: number): "asi" | "feat" {
    return modeByLevel[lvl] ?? "asi";
  }

  function getFeatForLevel(lvl: number): string {
    return featByNewLevel[lvl] ?? "";
  }

  function switchMode(lvl: number, mode: "asi" | "feat") {
    setModeByLevel((prev) => ({ ...prev, [lvl]: mode }));
    if (mode === "asi") {
      setFeatByNewLevel((prev) => { const n = { ...prev }; delete n[lvl]; return n; });
      setFeatAsiByLevel((prev) => { const n = { ...prev }; delete n[lvl]; return n; });
    } else {
      setAsiByNewLevel((prev) => { const n = { ...prev }; delete n[lvl]; return n; });
    }
  }

  function handleFeatPick(lvl: number, featId: string) {
    // Clear the ability sub-choice whenever the feat changes or is deselected.
    setFeatAsiByLevel((prev) => { const n = { ...prev }; delete n[lvl]; return n; });
    setAsiByNewLevel((prev) => { const n = { ...prev }; delete n[lvl]; return n; });
    setFeatByNewLevel((prev) => {
      const n = { ...prev };
      if (featId) n[lvl] = featId;
      else delete n[lvl];
      return n;
    });
  }

  function handleFeatAsiPick(lvl: number, ability: AbilityKey | undefined) {
    setFeatAsiByLevel((prev) => {
      const n = { ...prev };
      if (ability) n[lvl] = ability;
      else delete n[lvl];
      return n;
    });
    // Write the +1 into asiByNewLevel so effectiveScoresAtLevel and level-down reversal both work.
    setAsiByNewLevel((prev) => {
      const n = { ...prev };
      if (ability) n[lvl] = { [ability]: 1 };
      else delete n[lvl];
      return n;
    });
  }

  // ── Validation ──────────────────────────────────────────────────────────────

  const asiLevelsInRange = newLevels.filter((l) => asiLevelSet.has(l));
  const allAsiLevelsComplete = asiLevelsInRange.every((l) => {
    if (getModeForLevel(l) !== "feat") return totalAsiPoints(getAsiForLevel(l)) === 2;
    const featId = getFeatForLevel(l);
    if (!featId) return false;
    const feat = importedFeats.find((f) => f.id === featId);
    if (feat && isHalfFeat(feat)) return !!featAsiByLevel[l];
    return true;
  });

  const canConfirm =
    !isPending &&
    targetLevel !== currentLevel &&
    (isDown
      ? true
      : (!needsSubclassPick || !!pickedSubclassId) &&
        (!needsFightingStylePick || !!pickedFightingStyleId) &&
        allAsiLevelsComplete);

  // ── Confirm ─────────────────────────────────────────────────────────────────

  function handleConfirm() {
    if (targetLevel === currentLevel || isPending) return;

    const hpGained: Record<number, number> = {};
    if (isUp) {
      for (const lvl of newLevels) hpGained[lvl] = getHpForLevel(lvl);
    }

    const fightingStyleByLevel: Record<number, string> = {};
    if (needsFightingStylePick && pickedFightingStyleId && fightingStyleGrantLevel > 0) {
      fightingStyleByLevel[fightingStyleGrantLevel] = pickedFightingStyleId;
    }

    startTransition(async () => {
      await levelUpCharacter(
        character.id,
        targetLevel,
        hpGained,
        isUp ? asiByNewLevel : {},
        needsSubclassPick && pickedSubclassId ? pickedSubclassId : undefined,
        Object.keys(fightingStyleByLevel).length > 0 ? fightingStyleByLevel : undefined,
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
                      // Prune draft choices for levels that are no longer in the new level-up range.
                      const keep = (l: number) => l > currentLevel && l <= next;
                      const prune = <T,>(prev: Record<number, T>) =>
                        Object.fromEntries(Object.entries(prev).filter(([k]) => keep(Number(k))));
                      setFeatByNewLevel(prune);
                      setModeByLevel(prune);
                      setFeatAsiByLevel(prune);
                      setAsiByNewLevel(prune);
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
              // Feats disabled for this level = all active feats minus this level's own pick
              const disabledFeatIds = new Set(activeFeatIds);
              disabledFeatIds.delete(getFeatForLevel(lvl));
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
                  hasAsi={asiLevelSet.has(lvl)}
                  asi={getAsiForLevel(lvl)}
                  asiPoints={totalAsiPoints(getAsiForLevel(lvl))}
                  abilityScores={effectiveScoresAtLevel(lvl)}
                  onAsiAdjust={(ability, delta) => adjustAsi(lvl, ability, delta)}
                  asiMode={getModeForLevel(lvl)}
                  onSwitchMode={(mode) => switchMode(lvl, mode)}
                  feats={importedFeats}
                  pickedFeatId={getFeatForLevel(lvl)}
                  onFeatPick={(id) => handleFeatPick(lvl, id)}
                  disabledFeatIds={disabledFeatIds}
                  halfFeatAbility={featAsiByLevel[lvl]}
                  onHalfFeatAbilityPick={(ability) => handleFeatAsiPick(lvl, ability)}
                  isSubclassLevel={lvl === subclassUnlockLevel && needsSubclassPick}
                  availableSubclasses={availableSubclasses}
                  pickedSubclassId={pickedSubclassId}
                  onSubclassPick={setPickedSubclassId}
                  isFightingStyleLevel={lvl === fightingStyleGrantLevel && needsFightingStylePick}
                  allFightingStyles={allFightingStyles}
                  pickedFightingStyleId={pickedFightingStyleId}
                  onFightingStylePick={setPickedFightingStyleId}
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
          {needsSubclassPick && !pickedSubclassId && (
            <p className="text-xs text-center text-amber-500">
              Choose a subclass for level {subclassUnlockLevel}.
            </p>
          )}
          {needsFightingStylePick && !pickedFightingStyleId && (
            <p className="text-xs text-center text-amber-500">
              Choose a Fighting Style for level {fightingStyleGrantLevel}.
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
  hasAsi: boolean;
  asi: Partial<Record<AbilityKey, number>>;
  asiPoints: number;
  abilityScores: AbilityScores;
  onAsiAdjust: (ability: AbilityKey, delta: number) => void;
  asiMode: "asi" | "feat";
  onSwitchMode: (mode: "asi" | "feat") => void;
  feats: FeatElement[];
  pickedFeatId: string;
  onFeatPick: (id: string) => void;
  disabledFeatIds: Set<string>;
  halfFeatAbility?: AbilityKey;
  onHalfFeatAbilityPick: (ability: AbilityKey | undefined) => void;
  isSubclassLevel: boolean;
  availableSubclasses: SrdSubclass[];
  pickedSubclassId: string;
  onSubclassPick: (id: string) => void;
  isFightingStyleLevel: boolean;
  allFightingStyles: FightingStyleOption[];
  pickedFightingStyleId: string;
  onFightingStylePick: (id: string) => void;
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
  asiMode,
  onSwitchMode,
  feats,
  pickedFeatId,
  onFeatPick,
  disabledFeatIds,
  halfFeatAbility,
  onHalfFeatAbilityPick,
  isSubclassLevel,
  availableSubclasses,
  pickedSubclassId,
  onSubclassPick,
  isFightingStyleLevel,
  allFightingStyles,
  pickedFightingStyleId,
  onFightingStylePick,
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

        {/* ASI / Feat toggle + picker */}
        {hasAsi && (
          <div>
            {/* Mode toggle */}
            <div className="flex gap-1 mb-3 bg-stone-800 rounded-lg p-1">
              <button
                onClick={() => onSwitchMode("asi")}
                className={`flex-1 py-1.5 rounded text-xs font-semibold transition-colors ${
                  asiMode === "asi"
                    ? "bg-stone-600 text-stone-100"
                    : "text-stone-500 hover:text-stone-300"
                }`}
              >
                Ability Scores
              </button>
              <button
                onClick={() => onSwitchMode("feat")}
                className={`flex-1 py-1.5 rounded text-xs font-semibold transition-colors ${
                  asiMode === "feat"
                    ? "bg-stone-600 text-stone-100"
                    : "text-stone-500 hover:text-stone-300"
                }`}
              >
                Feat
              </button>
            </div>

            {/* ASI picker */}
            {asiMode === "asi" && (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs text-stone-500 uppercase tracking-wide">
                    Allocate points
                  </p>
                  <span className={`text-xs font-semibold ${
                    asiPoints === 2 ? "text-emerald-400" : "text-stone-500"
                  }`}>
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

            {/* Feat picker */}
            {asiMode === "feat" && (
              <FeatPicker
                feats={feats}
                pickedFeatId={pickedFeatId}
                onPick={onFeatPick}
                disabledFeatIds={disabledFeatIds}
                halfFeatAbility={halfFeatAbility}
                onHalfFeatAbilityPick={onHalfFeatAbilityPick}
              />
            )}
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

        {/* Fighting Style picker */}
        {isFightingStyleLevel && (
          <div>
            <p className="text-xs text-stone-500 uppercase tracking-wide mb-2">
              Choose Fighting Style
            </p>
            <div className="space-y-2">
              {allFightingStyles.map((style) => (
                <button
                  key={style.id}
                  onClick={() => onFightingStylePick(style.id)}
                  className={`w-full rounded-xl border p-3 text-left transition-colors ${
                    pickedFightingStyleId === style.id
                      ? "border-amber-500 bg-amber-900/20"
                      : "border-stone-700 bg-stone-800 hover:border-stone-500"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <p className={`text-sm font-semibold ${
                      pickedFightingStyleId === style.id ? "text-amber-300" : "text-stone-200"
                    }`}>
                      {style.name}
                    </p>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium shrink-0 ${sourceChipClass(style.sourceLabel)}`}>
                      {style.sourceLabel}
                    </span>
                  </div>
                  <p className="text-xs text-stone-500 mt-1 leading-relaxed">
                    {style.description.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim()}
                  </p>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Feat picker ──────────────────────────────────────────────────────────────

interface FeatPickerProps {
  feats: FeatElement[];
  pickedFeatId: string;
  onPick: (id: string) => void;
  disabledFeatIds: Set<string>;
  halfFeatAbility?: AbilityKey;
  onHalfFeatAbilityPick: (ability: AbilityKey | undefined) => void;
}

function FeatPicker({ feats, pickedFeatId, onPick, disabledFeatIds, halfFeatAbility, onHalfFeatAbilityPick }: FeatPickerProps) {
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

      {/* Type filter */}
      <div className="flex flex-wrap gap-1.5 mb-3">
        <FilterPill active={typeFilter === "all"} onClick={() => setTypeFilter("all")} label="All" />
        <FilterPill active={typeFilter === "full"} onClick={() => setTypeFilter("full")} label="Full feat" />
        <FilterPill active={typeFilter === "half"} onClick={() => setTypeFilter("half")} label="Half feat" />
      </div>

      {/* Source filter — only shown when multiple sources present */}
      {uniqueSources.length > 1 && (
        <div className="mb-3 space-y-1">
          <span className="text-[10px] uppercase tracking-widest text-stone-600 font-medium">Source</span>
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

      {filtered.length === 0 ? (
        <p className="text-xs text-stone-600 text-center py-3">
          No feats match your filters.
        </p>
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
              // div instead of button so inner ability buttons are valid HTML
              <div
                key={feat.id}
                role="button"
                tabIndex={disabled ? -1 : 0}
                onClick={() => {
                  if (disabled) return;
                  const nextId = picked ? "" : feat.id;
                  onPick(nextId);
                  // Auto-expand on pick so the description is readable immediately.
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
                  <p className={`text-sm font-semibold leading-tight ${
                    picked ? "text-amber-300" : "text-stone-200"
                  }`}>
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
                    <p className="text-[10px] text-stone-400 uppercase tracking-wide mb-2">
                      +1 Ability Score
                    </p>
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
