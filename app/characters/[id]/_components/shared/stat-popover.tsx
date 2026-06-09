"use client";

import { useState, useTransition } from "react";
import { signedMod } from "@/lib/character/calc";
import type { StatBreakdown } from "@/lib/character/calc";
import type { OverridableStatKey } from "@/lib/types/character";
import { updateStatAdjustment } from "@/app/actions/characters";

interface Props {
  label: string;
  breakdown: StatBreakdown;
  mode: "modifier" | "absolute";
  totalSuffix?: string;
  onClose: () => void;
  characterId?: string;
  statKey?: OverridableStatKey;
  currentOtherMod?: number;
  currentOverride?: number | null;
}

export function StatPopover({
  label, breakdown, mode, totalSuffix, onClose,
  characterId, statKey, currentOtherMod = 0, currentOverride = null,
}: Props) {
  const [otherModInput, setOtherModInput] = useState(
    currentOtherMod ? String(currentOtherMod) : ""
  );
  const [overrideInput, setOverrideInput] = useState(
    currentOverride !== null && currentOverride !== undefined ? String(currentOverride) : ""
  );
  const [, startTransition] = useTransition();

  const hasEditing = !!(characterId && statKey);
  const overrideActive = overrideInput.trim() !== "";

  function handleSaveWith(om: string, ov: string) {
    if (!characterId || !statKey) return;
    const omNum = om.trim() === "" ? null : Number(om);
    const ovNum = ov.trim() === "" ? null : Number(ov);
    const prevOm = currentOtherMod || null;
    const prevOv = currentOverride ?? null;
    if (omNum === prevOm && ovNum === prevOv) { onClose(); return; }
    startTransition(async () => {
      await updateStatAdjustment(characterId, statKey, omNum, ovNum);
    });
    onClose();
  }

  function handleSave() {
    handleSaveWith(otherModInput, overrideInput);
  }

  const formatValue = (value: number, index: number): string => {
    if (mode === "modifier") return signedMod(value);
    return index === 0 ? String(value) : signedMod(value);
  };

  const formatTotal = (total: number): string => {
    if (mode === "modifier") return signedMod(total);
    return String(total) + (totalSuffix ?? "");
  };

  return (
    <div
      className="fixed inset-0 z-40 flex items-start justify-center pt-28"
      onClick={onClose}
    >
      <div
        className="w-72 max-h-[60vh] overflow-y-auto rounded-xl border border-stone-700
          bg-stone-900 shadow-2xl p-4"
        onClick={(e) => e.stopPropagation()}
      >
        <p className="text-[10px] font-semibold text-stone-500 uppercase tracking-widest mb-3">
          {label}
        </p>

        <div className="space-y-1.5">
          {breakdown.components.map((c, i) => (
            <div key={i} className="flex justify-between text-sm">
              <span className={c.label === "Other Modifier" ? "text-sky-400" : "text-stone-400"}>
                {c.label}
              </span>
              <span className={`font-semibold tabular-nums ${c.label === "Other Modifier" ? "text-sky-300" : "text-stone-100"}`}>
                {formatValue(c.value, i)}
              </span>
            </div>
          ))}
        </div>

        <div className="mt-3 pt-3 border-t border-stone-800 flex justify-between text-sm">
          <span className="text-stone-400">
            {overrideActive ? "Calculated" : "Total"}
          </span>
          <span className={`font-bold tabular-nums ${overrideActive ? "text-stone-600 line-through" : "text-amber-400"}`}>
            {formatTotal(breakdown.total)}
          </span>
        </div>

        {overrideActive && (
          <div className="flex justify-between text-sm mt-1">
            <span className="text-amber-500 text-xs">Override active</span>
            <span className="font-bold text-amber-400 tabular-nums">
              {mode === "modifier"
                ? signedMod(Number(overrideInput))
                : overrideInput + (totalSuffix ?? "")}
            </span>
          </div>
        )}

        {hasEditing && (
          <div className="mt-3 pt-3 border-t border-stone-800 space-y-2">
            <div className="flex justify-between items-center gap-3">
              <label className="text-xs text-stone-500 shrink-0">Other Modifier</label>
              <input
                type="number"
                value={otherModInput}
                onChange={(e) => setOtherModInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); handleSave(); } }}
                className="w-16 text-right text-sm bg-stone-800 border border-stone-700 rounded px-2 py-1
                  text-stone-100 focus:outline-none focus:border-sky-500 transition-colors"
                placeholder="0"
              />
            </div>
            <div className="flex justify-between items-center gap-3">
              <label className="text-xs text-stone-500 shrink-0">Override</label>
              <input
                type="number"
                value={overrideInput}
                onChange={(e) => setOverrideInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); handleSave(); } }}
                className={`w-16 text-right text-sm bg-stone-800 rounded px-2 py-1
                  text-stone-100 focus:outline-none transition-colors border ${
                  overrideActive
                    ? "border-amber-500 focus:border-amber-400"
                    : "border-stone-700 focus:border-amber-500"
                }`}
                placeholder="—"
              />
            </div>
            {overrideActive && (
              <p className="text-[10px] text-amber-500/80">
                Replaces the calculated total.{" "}
                <button
                  onClick={() => handleSaveWith(otherModInput, "")}
                  className="underline hover:text-amber-400"
                >
                  Clear
                </button>
              </p>
            )}
            <button
              onClick={handleSave}
              className="w-full mt-1 min-h-[40px] rounded-xl bg-amber-600 text-stone-950 text-sm font-bold
                hover:bg-amber-500 active:bg-amber-700 transition-colors"
            >
              Confirm
            </button>
            {(otherModInput !== "" || overrideInput !== "" || currentOtherMod !== 0 || currentOverride !== null) && (
              <button
                onClick={() => { setOtherModInput(""); setOverrideInput(""); handleSaveWith("", ""); }}
                className="w-full min-h-[36px] rounded-xl border border-stone-700 text-stone-400 text-sm
                  hover:border-stone-500 hover:text-stone-200 active:bg-stone-800 transition-colors"
              >
                Reset to default
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
