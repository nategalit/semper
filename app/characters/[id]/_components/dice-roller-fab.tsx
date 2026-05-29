"use client";

import { useState } from "react";
import { useMutation } from "@/lib/character/mutation-context";
import { useRolls } from "@/lib/character/roll-context";
import type { RollMode } from "@/lib/types/roll";

const DICE = [4, 6, 8, 10, 12, 20, 100] as const;
type DieFaces = (typeof DICE)[number];

function rollDie(faces: number): number {
  return Math.floor(Math.random() * faces) + 1;
}

function formatDie(faces: DieFaces): string {
  return faces === 100 ? "d%" : `d${faces}`;
}

export function DiceRollerFab() {
  const { character } = useMutation();
  const { rolls, roll, retryRoll } = useRolls();

  const [open, setOpen] = useState(false);
  const [selectedDie, setSelectedDie] = useState<DieFaces>(20);
  const [modifier, setModifier] = useState(0);
  const [mode, setMode] = useState<RollMode>(null);
  const [lastResult, setLastResult] = useState<number[] | null>(null);

  function handleRoll() {
    const faces = selectedDie === 100 ? 100 : selectedDie;
    let results: number[];

    if (selectedDie === 20 && mode) {
      // Roll 2 dice, take higher (advantage) or lower (disadvantage)
      results = [rollDie(faces), rollDie(faces)];
    } else {
      results = [rollDie(faces)];
    }

    const kept = mode === "advantage"
      ? Math.max(...results)
      : mode === "disadvantage"
      ? Math.min(...results)
      : results[0];

    const total = kept + modifier;
    const isCrit = selectedDie === 20 && kept === 20;
    const diceLabel = selectedDie === 100 ? "d%" : `d${selectedDie}`;
    const label = modifier !== 0
      ? `${diceLabel} ${modifier >= 0 ? "+" : ""}${modifier}`
      : diceLabel;

    setLastResult(results);

    roll({
      characterId: character.id,
      label: isCrit ? `${label} — NAT 20!` : label,
      dice: diceLabel,
      results,
      modifier,
      total,
      mode: selectedDie === 20 ? mode : null,
      rollType: "other",
    });
  }

  const recentRolls = rolls.slice(0, 10);

  return (
    <>
      {/* FAB button */}
      {!open && (
        <button
          onClick={() => setOpen(true)}
          aria-label="Open dice roller"
          className="fixed right-4 bottom-20 md:bottom-6 z-40 w-14 h-14 rounded-full
            bg-amber-600 text-stone-950 text-2xl flex items-center justify-center
            shadow-lg shadow-amber-900/40 hover:bg-amber-500 active:scale-95 transition-all"
        >
          ⚄
        </button>
      )}

      {/* Panel */}
      {open && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
            onClick={() => setOpen(false)}
            aria-hidden
          />
          <div
            role="dialog"
            aria-modal
            aria-label="Dice Roller"
            className="fixed inset-x-0 bottom-0 z-40 bg-stone-900 border-t border-stone-700 rounded-t-2xl
              md:inset-auto md:right-6 md:bottom-6 md:w-80 md:rounded-2xl md:border md:border-stone-700
              flex flex-col"
            style={{ maxHeight: "80dvh", paddingBottom: "env(safe-area-inset-bottom)" }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 pt-4 pb-3 border-b border-stone-800 shrink-0">
              <h2 className="text-base font-bold text-stone-100">Dice Roller</h2>
              <button
                onClick={() => setOpen(false)}
                className="min-w-[44px] min-h-[44px] flex items-center justify-center text-stone-400 hover:text-stone-200 text-xl"
                aria-label="Close"
              >
                ✕
              </button>
            </div>

            <div className="overflow-y-auto flex-1 px-5 py-4 space-y-4">
              {/* Die selector */}
              <div className="grid grid-cols-4 gap-2">
                {DICE.map((d) => (
                  <button
                    key={d}
                    onClick={() => {
                      setSelectedDie(d);
                      if (d !== 20) setMode(null);
                    }}
                    className={`min-h-[44px] rounded-xl text-sm font-bold transition-colors ${
                      selectedDie === d
                        ? "bg-amber-600 text-stone-950"
                        : "bg-stone-800 border border-stone-700 text-stone-300 hover:text-stone-100"
                    }`}
                  >
                    {formatDie(d)}
                  </button>
                ))}
              </div>

              {/* Advantage/Disadvantage — d20 only */}
              {selectedDie === 20 && (
                <div className="flex gap-2">
                  <button
                    onClick={() => setMode(mode === "advantage" ? null : "advantage")}
                    className={`flex-1 min-h-[40px] rounded-xl text-xs font-semibold transition-colors ${
                      mode === "advantage"
                        ? "bg-emerald-600/30 border border-emerald-600 text-emerald-400"
                        : "bg-stone-800 border border-stone-700 text-stone-400 hover:text-stone-200"
                    }`}
                  >
                    Advantage
                  </button>
                  <button
                    onClick={() => setMode(mode === "disadvantage" ? null : "disadvantage")}
                    className={`flex-1 min-h-[40px] rounded-xl text-xs font-semibold transition-colors ${
                      mode === "disadvantage"
                        ? "bg-red-600/30 border border-red-600 text-red-400"
                        : "bg-stone-800 border border-stone-700 text-stone-400 hover:text-stone-200"
                    }`}
                  >
                    Disadvantage
                  </button>
                </div>
              )}

              {/* Modifier */}
              <div className="flex items-center gap-3">
                <span className="text-xs text-stone-500 w-20 shrink-0">Modifier</span>
                <button
                  onClick={() => setModifier((m) => m - 1)}
                  className="w-11 h-11 rounded-xl bg-stone-800 border border-stone-700 text-stone-200 text-lg
                    flex items-center justify-center hover:border-stone-500"
                  aria-label="Decrease modifier"
                >
                  −
                </button>
                <span className="flex-1 text-center text-lg font-bold text-stone-100 tabular-nums">
                  {modifier >= 0 ? `+${modifier}` : modifier}
                </span>
                <button
                  onClick={() => setModifier((m) => m + 1)}
                  className="w-11 h-11 rounded-xl bg-stone-800 border border-stone-700 text-stone-200 text-lg
                    flex items-center justify-center hover:border-stone-500"
                  aria-label="Increase modifier"
                >
                  +
                </button>
              </div>

              {/* Roll button */}
              <button
                onClick={handleRoll}
                className="w-full min-h-[52px] rounded-xl bg-amber-600 text-stone-950 font-bold text-base
                  hover:bg-amber-500 active:scale-95 transition-all"
              >
                Roll {formatDie(selectedDie)}
                {mode && <span className="text-xs ml-1.5 opacity-70">({mode === "advantage" ? "adv" : "disadv"})</span>}
              </button>

              {/* Recent rolls */}
              {recentRolls.length > 0 && (
                <div>
                  <p className="text-xs text-stone-500 uppercase tracking-wider mb-2">Recent Rolls</p>
                  <ul className="space-y-1">
                    {recentRolls.map((r) => {
                      const kept = r.mode === "advantage"
                        ? Math.max(...r.results)
                        : r.mode === "disadvantage"
                        ? Math.min(...r.results)
                        : r.results[0];
                      const isCrit = r.dice === "d20" && kept === 20;

                      return (
                        <li
                          key={r.id}
                          className="flex items-center justify-between py-1"
                        >
                          <div className="min-w-0">
                            <span className={`text-xs font-medium ${isCrit ? "text-amber-400" : "text-stone-400"}`}>
                              {r.label}
                            </span>
                            {r.results.length > 1 && (
                              <span className="text-[10px] text-stone-600 ml-1">
                                [{r.results.join(", ")}]
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            {r.syncError && (
                              <button
                                onClick={() => retryRoll(r.id)}
                                className="text-[10px] text-amber-500 hover:text-amber-400"
                              >
                                ⚠ Retry
                              </button>
                            )}
                            <span className={`text-base font-bold tabular-nums ${
                              isCrit ? "text-amber-400" : "text-stone-100"
                            }`}>
                              {r.total}
                            </span>
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </>
  );
}
