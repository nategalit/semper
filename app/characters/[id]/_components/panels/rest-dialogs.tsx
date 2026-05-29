"use client";

import { useState } from "react";
import { useMutation } from "@/lib/character/mutation-context";
import { shortRest, longRest } from "@/app/actions/characters";
import type { DerivedStats } from "@/lib/character/calc";
import type { SrdClass } from "@/lib/content/srd";
import type { CharacterData } from "@/lib/types/character";

interface ShortRestProps {
  open: boolean;
  onClose: () => void;
  srdClass: SrdClass | undefined;
  derived: DerivedStats;
}

export function ShortRestDialog({ open, onClose, srdClass, derived }: ShortRestProps) {
  const { character, mutate } = useMutation();
  const [diceSpent, setDiceSpent] = useState(0);
  const [hpRolled, setHpRolled] = useState(0);
  const [rolls, setRolls] = useState<number[]>([]);

  if (!open) return null;

  const hitDie = srdClass?.hitDie ?? 8;
  const conMod = derived.abilityMods.con ?? 0;
  const remaining = character.data.hitDiceRemaining;
  const currentHp = character.data.currentHp;
  const maxHp = character.data.maxHp;
  const hpSpace = maxHp - currentHp;
  const canRoll = diceSpent < remaining && hpRolled < hpSpace;

  function rollDie() {
    const result = Math.floor(Math.random() * hitDie) + 1;
    const gain = Math.max(1, result + conMod);
    setDiceSpent((d) => d + 1);
    setHpRolled((hp) => Math.min(hpSpace, hp + gain));
    setRolls((r) => [...r, result]);
  }

  function handleFinish() {
    const patch: Partial<CharacterData> = {
      currentHp: Math.min(maxHp, currentHp + hpRolled),
      hitDiceRemaining: Math.max(0, remaining - diceSpent),
    };
    mutate(patch, () => shortRest(character.id, hpRolled, diceSpent));
    handleClose();
  }

  function handleClose() {
    setDiceSpent(0);
    setHpRolled(0);
    setRolls([]);
    onClose();
  }

  return (
    <>
      <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm" onClick={handleClose} aria-hidden />
      <div
        role="dialog"
        aria-modal
        aria-label="Short Rest"
        className="fixed inset-x-0 bottom-0 z-50 bg-stone-900 border-t border-stone-700 rounded-t-2xl
          md:inset-auto md:top-[15vh] md:left-1/2 md:-translate-x-1/2 md:w-[min(420px,92vw)]
          md:rounded-2xl md:border md:border-stone-700 flex flex-col"
        style={{ maxHeight: "80dvh", paddingBottom: "env(safe-area-inset-bottom)" }}
      >
        <div className="flex items-center justify-between px-5 pt-4 pb-3 border-b border-stone-800">
          <div>
            <h2 className="text-base font-bold text-stone-100">Short Rest</h2>
            <p className="text-xs text-stone-500 mt-0.5">
              {remaining} d{hitDie} remaining · CON {conMod >= 0 ? `+${conMod}` : conMod}
            </p>
          </div>
          <button
            onClick={handleClose}
            className="min-w-[44px] min-h-[44px] flex items-center justify-center text-stone-400 hover:text-stone-200 text-xl"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        <div className="px-5 py-4 space-y-4 overflow-y-auto flex-1">
          {/* HP preview */}
          <div className="flex items-center justify-between">
            <span className="text-sm text-stone-400">HP gained</span>
            <span className="text-2xl font-bold text-emerald-400 tabular-nums">
              +{hpRolled}
            </span>
          </div>

          {/* Roll history */}
          {rolls.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {rolls.map((r, i) => (
                <span
                  key={i}
                  className="text-sm font-semibold px-2.5 py-1 rounded-lg bg-stone-800 border border-stone-700 text-stone-200"
                >
                  {r} + {conMod} = {Math.max(1, r + conMod)}
                </span>
              ))}
            </div>
          )}

          {/* Roll button */}
          <button
            onClick={rollDie}
            disabled={!canRoll}
            className="w-full min-h-[52px] rounded-xl bg-amber-600 text-stone-950 font-bold text-base
              hover:bg-amber-500 active:bg-amber-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            Roll d{hitDie} {diceSpent > 0 ? `(${diceSpent} spent)` : ""}
          </button>
        </div>

        <div className="px-5 pb-4 pt-2 border-t border-stone-800 space-y-2">
          <button
            onClick={handleFinish}
            className="w-full min-h-[48px] rounded-xl bg-stone-700 text-stone-100 font-semibold
              hover:bg-stone-600 active:bg-stone-800 transition-colors"
          >
            Finish Rest {hpRolled > 0 ? `(+${hpRolled} HP)` : ""}
          </button>
          <p className="text-center text-[10px] text-stone-600">
            Short-rest features will recharge automatically.
          </p>
        </div>
      </div>
    </>
  );
}

interface LongRestProps {
  open: boolean;
  onClose: () => void;
}

export function LongRestDialog({ open, onClose }: LongRestProps) {
  const { character, mutate } = useMutation();
  const [confirming, setConfirming] = useState(false);

  if (!open) return null;

  function handleConfirm() {
    const { data } = character;
    const patch: Partial<CharacterData> = {
      currentHp: data.maxHp,
      hitDiceRemaining: Math.min(
        data.hitDiceTotal,
        data.hitDiceRemaining + Math.max(1, Math.floor(data.hitDiceTotal / 2))
      ),
      deathSaves: { successes: 0, failures: 0 },
      spellSlots: Object.fromEntries(
        Object.entries(data.spellSlots ?? {}).map(([lvl, slot]) => [
          lvl,
          { ...slot, remaining: slot.total },
        ])
      ),
    };
    mutate(patch, () => longRest(character.id));
    setConfirming(false);
    onClose();
  }

  return (
    <>
      <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm" onClick={onClose} aria-hidden />
      <div
        role="dialog"
        aria-modal
        aria-label="Long Rest"
        className="fixed inset-x-0 bottom-0 z-50 bg-stone-900 border-t border-stone-700 rounded-t-2xl
          md:inset-auto md:top-[20vh] md:left-1/2 md:-translate-x-1/2 md:w-[min(380px,92vw)]
          md:rounded-2xl md:border md:border-stone-700"
        style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
      >
        <div className="px-5 pt-5 pb-4">
          <h2 className="text-base font-bold text-stone-100 mb-1">Long Rest</h2>
          <p className="text-sm text-stone-400 mb-4">
            This will restore HP to maximum, recover spell slots and class features,
            and regain up to half your hit dice.
          </p>

          <ul className="space-y-1.5 mb-5 text-sm text-stone-300">
            <RestItem label="HP" value={`${character.data.currentHp} → ${character.data.maxHp}`} />
            <RestItem
              label="Spell slots"
              value={Object.keys(character.data.spellSlots ?? {}).length > 0 ? "All restored" : "None"}
            />
            <RestItem label="Death saves" value="Cleared" />
          </ul>

          {!confirming ? (
            <div className="flex gap-2">
              <button
                onClick={onClose}
                className="flex-1 min-h-[48px] rounded-xl bg-stone-800 border border-stone-700 text-stone-300
                  font-semibold hover:border-stone-500 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => setConfirming(true)}
                className="flex-1 min-h-[48px] rounded-xl bg-amber-600 text-stone-950 font-bold
                  hover:bg-amber-500 active:bg-amber-700 transition-colors"
              >
                Take Long Rest
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              <p className="text-xs text-stone-500 text-center">Are you sure?</p>
              <div className="flex gap-2">
                <button
                  onClick={() => setConfirming(false)}
                  className="flex-1 min-h-[48px] rounded-xl bg-stone-800 border border-stone-700 text-stone-300
                    font-semibold hover:border-stone-500 transition-colors"
                >
                  Back
                </button>
                <button
                  onClick={handleConfirm}
                  className="flex-1 min-h-[48px] rounded-xl bg-emerald-600 text-stone-950 font-bold
                    hover:bg-emerald-500 active:bg-emerald-700 transition-colors"
                >
                  Confirm Rest
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

function RestItem({ label, value }: { label: string; value: string }) {
  return (
    <li className="flex items-center justify-between">
      <span className="text-stone-500">{label}</span>
      <span className="font-medium">{value}</span>
    </li>
  );
}
