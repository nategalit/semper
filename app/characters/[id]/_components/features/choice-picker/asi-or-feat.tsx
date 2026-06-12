"use client";

import type { FeatElement } from "@/lib/content/schema";
import type { AbilityKey } from "@/lib/content/srd";
import type { AbilityScores } from "@/lib/types/character";
import { ABILITY_KEYS, ABILITY_LABELS, FeatPicker, isHalfFeat } from "../../panels/feat-picker";

export interface AsiOrFeatValue {
  mode: "asi" | "feat";
  asi: Partial<Record<AbilityKey, number>>;
  featId?: string;
  featAsi?: AbilityKey;
}

export function totalAsiPoints(asi: Partial<Record<AbilityKey, number>>): number {
  return Object.values(asi).reduce((sum, v) => sum + (v ?? 0), 0);
}

interface AsiOrFeatPickerProps {
  value: AsiOrFeatValue;
  onChange: (v: AsiOrFeatValue) => void;
  effectiveScores: AbilityScores;
  feats: FeatElement[];
  disabledFeatIds: Set<string>;
}

export function AsiOrFeatPicker({ value, onChange, effectiveScores, feats, disabledFeatIds }: AsiOrFeatPickerProps) {
  const { mode, asi, featId, featAsi } = value;
  const asiPoints = totalAsiPoints(asi);

  function switchMode(m: "asi" | "feat") {
    if (m === "asi") {
      onChange({ mode: "asi", asi: {} });
    } else {
      onChange({ mode: "feat", asi: {} });
    }
  }

  function adjustAsi(ability: AbilityKey, delta: number) {
    const currentVal = asi[ability] ?? 0;
    const newVal = Math.max(0, currentVal + delta);
    const newAsi = { ...asi, [ability]: newVal };
    if (totalAsiPoints(newAsi) > 2) return;
    if ((effectiveScores[ability] + newVal) > 20) return;
    onChange({ ...value, asi: newAsi });
  }

  function handleFeatPick(id: string) {
    onChange({ mode: "feat", asi: {}, featId: id || undefined, featAsi: undefined });
  }

  function handleFeatAsiPick(ability: AbilityKey | undefined) {
    const newAsi = ability ? { [ability]: 1 } as Partial<Record<AbilityKey, number>> : {};
    onChange({ ...value, featAsi: ability, asi: newAsi });
  }

  return (
    <div>
      {/* Mode toggle */}
      <div className="flex gap-1 mb-3 bg-stone-800 rounded-lg p-1">
        <button
          onClick={() => switchMode("asi")}
          className={`flex-1 py-1.5 rounded text-xs font-semibold transition-colors ${
            mode === "asi" ? "bg-stone-600 text-stone-100" : "text-stone-500 hover:text-stone-300"
          }`}
        >
          Ability Scores
        </button>
        <button
          onClick={() => switchMode("feat")}
          className={`flex-1 py-1.5 rounded text-xs font-semibold transition-colors ${
            mode === "feat" ? "bg-stone-600 text-stone-100" : "text-stone-500 hover:text-stone-300"
          }`}
        >
          Feat
        </button>
      </div>

      {/* ASI allocation */}
      {mode === "asi" && (
        <div>
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs text-stone-500 uppercase tracking-wide">Allocate points</p>
            <span className={`text-xs font-semibold ${asiPoints === 2 ? "text-emerald-400" : "text-stone-500"}`}>
              {asiPoints}/2
            </span>
          </div>
          <div className="space-y-1">
            {ABILITY_KEYS.map((ability) => {
              const current = effectiveScores[ability];
              const allocated = asi[ability] ?? 0;
              const newScore = current + allocated;
              const atCap = newScore >= 20;
              const atZero = allocated === 0;
              return (
                <div key={ability} className="flex items-center gap-3">
                  <span className="w-8 text-xs font-medium text-stone-400">{ABILITY_LABELS[ability]}</span>
                  <span className="w-8 text-center text-sm font-semibold text-stone-200 tabular-nums">{current}</span>
                  <button
                    onClick={() => adjustAsi(ability, -1)}
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
                    onClick={() => adjustAsi(ability, 1)}
                    disabled={atCap || asiPoints >= 2}
                    className="w-8 h-8 rounded border border-stone-600 text-stone-400
                      hover:border-stone-400 disabled:opacity-30 disabled:cursor-not-allowed
                      transition-colors text-base flex items-center justify-center"
                  >
                    +
                  </button>
                  {allocated > 0 && <span className="text-xs text-stone-500">→ {newScore}</span>}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Feat picker */}
      {mode === "feat" && (
        <FeatPicker
          feats={feats}
          pickedFeatId={featId ?? ""}
          onPick={handleFeatPick}
          disabledFeatIds={disabledFeatIds}
          halfFeatAbility={featAsi}
          onHalfFeatAbilityPick={handleFeatAsiPick}
        />
      )}
    </div>
  );
}
