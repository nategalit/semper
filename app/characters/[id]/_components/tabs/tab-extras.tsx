"use client";

import { useState } from "react";
import { useMutation } from "@/lib/character/mutation-context";
import type { DerivedStats } from "@/lib/character/calc";
import type { SrdClass } from "@/lib/content/srd";
import { SectionCard } from "../shared/section-card";
import { EmptyState } from "../shared/empty-state";
import { ConditionPicker } from "../panels/condition-picker";
import { ShortRestDialog, LongRestDialog } from "../panels/rest-dialogs";

interface Props {
  srdClass: SrdClass | undefined;
  derived: DerivedStats;
}

export function TabExtras({ srdClass, derived }: Props) {
  const { character } = useMutation();
  const { notes, conditions = [], xp, exhaustion = 0 } = character.data;
  const [conditionsOpen, setConditionsOpen] = useState(false);
  const [shortRestOpen, setShortRestOpen] = useState(false);
  const [longRestOpen, setLongRestOpen] = useState(false);

  return (
    <>
      <div className="space-y-4">
        {/* Rests */}
        <SectionCard title="Rests">
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => setShortRestOpen(true)}
              className="min-h-[52px] rounded-xl bg-stone-800 border border-stone-700 text-stone-200 font-semibold text-sm
                hover:border-amber-600 hover:text-amber-400 active:bg-stone-700 transition-colors"
            >
              🌙 Short Rest
            </button>
            <button
              onClick={() => setLongRestOpen(true)}
              className="min-h-[52px] rounded-xl bg-stone-800 border border-stone-700 text-stone-200 font-semibold text-sm
                hover:border-amber-600 hover:text-amber-400 active:bg-stone-700 transition-colors"
            >
              ⭐ Long Rest
            </button>
          </div>
          <p className="text-xs text-stone-600 mt-2 text-center">
            {character.data.hitDiceRemaining}/{character.data.hitDiceTotal} hit dice remaining
          </p>
        </SectionCard>

        {/* Conditions */}
        <SectionCard title="Conditions">
          {conditions.length > 0 || exhaustion > 0 ? (
            <div className="space-y-2">
              {exhaustion > 0 && (
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-orange-900/60 border border-orange-700 text-orange-300">
                    Exhaustion {exhaustion}
                  </span>
                </div>
              )}
              {conditions.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {conditions.map((c) => (
                    <span
                      key={c}
                      className="text-xs font-medium px-2 py-0.5 rounded-full bg-red-900/60 border border-red-700 text-red-300"
                    >
                      {c}
                    </span>
                  ))}
                </div>
              )}
              <button
                onClick={() => setConditionsOpen(true)}
                className="w-full min-h-[40px] rounded-lg border border-stone-700 text-stone-400 text-xs
                  hover:border-stone-500 hover:text-stone-300 transition-colors"
              >
                Manage conditions
              </button>
            </div>
          ) : (
            <div>
              <EmptyState message="No active conditions." />
              <button
                onClick={() => setConditionsOpen(true)}
                className="w-full min-h-[40px] rounded-lg border border-stone-700 text-stone-400 text-xs mt-2
                  hover:border-stone-500 hover:text-stone-300 transition-colors"
              >
                Add condition
              </button>
            </div>
          )}
        </SectionCard>

        <SectionCard title="Experience Points">
          <p className="text-sm text-stone-200">{xp.toLocaleString()} XP</p>
        </SectionCard>

        <SectionCard title="Notes">
          {notes ? (
            <p className="text-sm text-stone-300 whitespace-pre-wrap">{notes}</p>
          ) : (
            <EmptyState message="No notes." />
          )}
        </SectionCard>
      </div>

      <ConditionPicker open={conditionsOpen} onClose={() => setConditionsOpen(false)} />
      <ShortRestDialog
        open={shortRestOpen}
        onClose={() => setShortRestOpen(false)}
        srdClass={srdClass}
        derived={derived}
      />
      <LongRestDialog open={longRestOpen} onClose={() => setLongRestOpen(false)} />
    </>
  );
}
