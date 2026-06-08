"use client";

import { useState, useTransition } from "react";
import { toggleInspiration } from "@/app/actions/characters";
import { signedMod, toughHpBonus } from "@/lib/character/calc";
import type { Character } from "@/lib/types/character";
import type { DerivedStats } from "@/lib/character/calc";
import { HpDialog } from "./panels/hp-dialog";
import { ConditionPicker } from "./panels/condition-picker";

interface Props {
  character: Character;
  derived: DerivedStats;
  onLevelTap?: () => void;
}

export function Header({ character, derived, onLevelTap }: Props) {
  const [inspirePending, startInspireTransition] = useTransition();
  const [hpOpen, setHpOpen] = useState(false);
  const [conditionsOpen, setConditionsOpen] = useState(false);
  const { data } = character;
  const conditions = data.conditions ?? [];
  const effectiveMaxHp = data.maxHp + toughHpBonus(character);

  function handleInspiration() {
    startInspireTransition(async () => {
      await toggleInspiration(character.id);
    });
  }

  const hasSubtitle = character.level || derived.speed;

  return (
    <>
      <header className="sticky top-0 z-30 bg-stone-900 border-b border-stone-800 px-4 py-3">
        {/* Name + inspiration row */}
        <div className="flex items-start justify-between gap-3 max-w-4xl mx-auto">
          <div className="min-w-0">
            <h1 className="text-xl font-bold text-stone-100 truncate">{character.name}</h1>
            {hasSubtitle && (
              <div className="text-xs text-stone-400 mt-0.5">
                {character.level && onLevelTap ? (
                  <button
                    onClick={onLevelTap}
                    className="underline underline-offset-2 decoration-stone-600 hover:text-stone-200
                      hover:decoration-stone-400 transition-colors"
                    title="Tap to change level"
                  >
                    Level {character.level}
                  </button>
                ) : (
                  `Level ${character.level}`
                )}
                {derived.speed ? ` · Speed ${derived.speed} ft.` : ""}
              </div>
            )}
          </div>

          {/* Inspiration toggle — 44×44 tap target */}
          <button
            onClick={handleInspiration}
            disabled={inspirePending}
            title={data.inspiration ? "Inspired — tap to remove" : "Tap to gain inspiration"}
            className={`shrink-0 w-11 h-11 rounded-full border-2 flex items-center justify-center transition-colors disabled:opacity-50 ${
              data.inspiration
                ? "border-amber-400 bg-amber-400/20 text-amber-400"
                : "border-stone-600 text-stone-600 hover:border-stone-400 hover:text-stone-400"
            }`}
          >
            ★
          </button>
        </div>

        {/* Stat chips row */}
        <div className="flex flex-wrap gap-x-4 gap-y-2 mt-3 max-w-4xl mx-auto">
          {/* HP chip — tappable, min 44×44 */}
          <button
            onClick={() => setHpOpen(true)}
            className="flex flex-col items-center min-w-[44px] min-h-[44px] justify-center rounded-lg px-2 -mx-2
              hover:bg-stone-800 active:bg-stone-700 transition-colors"
            aria-label={`HP: ${data.currentHp} of ${effectiveMaxHp}. Tap to adjust.`}
          >
            <span className="text-base font-bold leading-tight text-amber-400 tabular-nums">
              {data.currentHp}/{effectiveMaxHp}
              {data.tempHp > 0 && (
                <span className="text-sky-400 ml-1">+{data.tempHp}</span>
              )}
            </span>
            <span className="text-[10px] text-stone-500 uppercase tracking-wide">HP</span>
          </button>

          <StatChip label="AC"     value={String(derived.armorClass)} />
          <StatChip label="Prof"   value={signedMod(derived.proficiencyBonus)} />
          <StatChip label="Init"   value={signedMod(derived.initiative)} />
          <StatChip label="Speed"  value={`${derived.speed} ft`} />
          <StatChip label="Perc."  value={String(derived.passivePerception)} />
        </div>

        {/* Active conditions row — tappable */}
        <div className="flex flex-wrap gap-2 mt-2 max-w-4xl mx-auto">
          {conditions.map((c) => (
            <button
              key={c}
              onClick={() => setConditionsOpen(true)}
              className="text-xs font-medium px-2 py-0.5 rounded-full bg-red-900/60 border border-red-700 text-red-300
                hover:bg-red-900/80 active:scale-95 transition-all"
            >
              {c}
            </button>
          ))}
          <button
            onClick={() => setConditionsOpen(true)}
            aria-label="Manage conditions"
            className={`text-xs font-medium px-2 py-0.5 rounded-full border transition-colors ${
              conditions.length > 0
                ? "border-stone-700 text-stone-600 hover:text-stone-400 hover:border-stone-500"
                : "border-dashed border-stone-700 text-stone-600 hover:text-stone-400 hover:border-stone-500"
            }`}
          >
            {conditions.length === 0 ? "+ condition" : "+"}
          </button>
        </div>
      </header>

      <HpDialog open={hpOpen} onClose={() => setHpOpen(false)} />
      <ConditionPicker open={conditionsOpen} onClose={() => setConditionsOpen(false)} />
    </>
  );
}

function StatChip({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col items-center min-w-[44px]">
      <span className="text-base font-bold leading-tight text-stone-100">{value}</span>
      <span className="text-[10px] text-stone-500 uppercase tracking-wide">{label}</span>
    </div>
  );
}
