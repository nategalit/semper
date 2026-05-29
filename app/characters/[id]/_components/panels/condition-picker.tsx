"use client";

import { useMutation } from "@/lib/character/mutation-context";
import { setConditions, setExhaustion } from "@/app/actions/characters";
import type { CharacterData } from "@/lib/types/character";

interface Props {
  open: boolean;
  onClose: () => void;
}

const CONDITIONS = [
  "Blinded", "Charmed", "Deafened", "Exhaustion", "Frightened",
  "Grappled", "Incapacitated", "Invisible", "Paralyzed", "Petrified",
  "Poisoned", "Prone", "Restrained", "Stunned", "Unconscious",
];

export function ConditionPicker({ open, onClose }: Props) {
  const { character, mutate } = useMutation();
  const conditions = character.data.conditions ?? [];
  const exhaustion = character.data.exhaustion ?? 0;

  if (!open) return null;

  function toggleCondition(condition: string) {
    const next = conditions.includes(condition)
      ? conditions.filter((c) => c !== condition)
      : [...conditions, condition];
    const patch: Partial<CharacterData> = { conditions: next };
    mutate(patch, () => setConditions(character.id, next));
  }

  function changeExhaustion(delta: number) {
    const next = Math.max(0, Math.min(6, exhaustion + delta));
    mutate({ exhaustion: next }, () => setExhaustion(character.id, next));
  }

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
        aria-label="Conditions"
        className="fixed inset-x-0 bottom-0 z-50 bg-stone-900 border-t border-stone-700 rounded-t-2xl
          md:inset-auto md:top-[10vh] md:left-1/2 md:-translate-x-1/2 md:w-[min(480px,92vw)]
          md:rounded-2xl md:border md:border-stone-700 flex flex-col"
        style={{ maxHeight: "85dvh" }}
      >
        <div className="flex items-center justify-between px-5 pt-4 pb-3 border-b border-stone-800 shrink-0">
          <h2 className="text-base font-bold text-stone-100">Conditions</h2>
          <button
            onClick={onClose}
            className="min-w-[44px] min-h-[44px] flex items-center justify-center text-stone-400 hover:text-stone-200 text-xl"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        <div className="overflow-y-auto flex-1 px-5 py-4 space-y-4">
          {/* Exhaustion stepper */}
          <div>
            <p className="text-xs text-stone-500 uppercase tracking-wider mb-2">Exhaustion</p>
            <div className="flex items-center gap-4">
              <button
                onClick={() => changeExhaustion(-1)}
                disabled={exhaustion <= 0}
                aria-label="Decrease exhaustion"
                className="w-11 h-11 rounded-xl bg-stone-800 border border-stone-700 text-stone-200 text-xl
                  flex items-center justify-center hover:border-stone-500 disabled:opacity-30 disabled:cursor-not-allowed"
              >
                −
              </button>
              <div className="flex-1 text-center">
                <span className="text-2xl font-bold text-stone-100">{exhaustion}</span>
                <span className="text-xs text-stone-500 block mt-0.5">
                  {EXHAUSTION_LABELS[exhaustion]}
                </span>
              </div>
              <button
                onClick={() => changeExhaustion(1)}
                disabled={exhaustion >= 6}
                aria-label="Increase exhaustion"
                className="w-11 h-11 rounded-xl bg-stone-800 border border-stone-700 text-stone-200 text-xl
                  flex items-center justify-center hover:border-stone-500 disabled:opacity-30 disabled:cursor-not-allowed"
              >
                +
              </button>
            </div>
          </div>

          {/* Condition toggles */}
          <div>
            <p className="text-xs text-stone-500 uppercase tracking-wider mb-2">Active Conditions</p>
            <div className="grid grid-cols-2 gap-2">
              {CONDITIONS.map((condition) => {
                const active = conditions.includes(condition);
                return (
                  <button
                    key={condition}
                    onClick={() => toggleCondition(condition)}
                    className={`min-h-[44px] rounded-xl border text-sm font-medium transition-colors px-3 text-left ${
                      active
                        ? "bg-red-900/30 border-red-700 text-red-300"
                        : "bg-stone-800 border-stone-700 text-stone-300 hover:border-stone-500"
                    }`}
                  >
                    {condition}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

const EXHAUSTION_LABELS: Record<number, string> = {
  0: "None",
  1: "Disadvantage on checks",
  2: "Speed halved",
  3: "Disadvantage on attacks & saves",
  4: "HP maximum halved",
  5: "Speed reduced to 0",
  6: "Death",
};
