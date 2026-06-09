"use client";

import { useState, useRef } from "react";
import { useMutation } from "@/lib/character/mutation-context";
import { updateNotes, updateXp } from "@/app/actions/characters";
import type { DerivedStats } from "@/lib/character/calc";
import type { SrdClass } from "@/lib/content/srd";
import { SectionCard } from "../shared/section-card";
import { EmptyState } from "../shared/empty-state";
import { ConditionPicker } from "../panels/condition-picker";
import { ShortRestDialog, LongRestDialog } from "../panels/rest-dialogs";

// XP thresholds per Player's Handbook
const XP_THRESHOLDS = [
  0, 300, 900, 2700, 6500, 14000, 23000, 34000, 48000,
  64000, 85000, 100000, 120000, 140000, 165000, 195000,
  225000, 265000, 305000, 355000,
];

function xpToLevel(xp: number): number {
  let level = 1;
  for (let i = 1; i < XP_THRESHOLDS.length; i++) {
    if (xp >= XP_THRESHOLDS[i]) level = i + 1;
    else break;
  }
  return Math.min(level, 20);
}

interface Props {
  srdClass: SrdClass | undefined;
  derived: DerivedStats;
}

export function TabExtras({ srdClass, derived }: Props) {
  const { character, mutate } = useMutation();
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
              Short Rest
            </button>
            <button
              onClick={() => setLongRestOpen(true)}
              className="min-h-[52px] rounded-xl bg-stone-800 border border-stone-700 text-stone-200 font-semibold text-sm
                hover:border-amber-600 hover:text-amber-400 active:bg-stone-700 transition-colors"
            >
              Long Rest
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
                className="w-full min-h-[40px] rounded-xl border border-stone-700 text-stone-400 text-xs
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
                className="w-full min-h-[40px] rounded-xl border border-stone-700 text-stone-400 text-xs mt-2
                  hover:border-stone-500 hover:text-stone-300 transition-colors"
              >
                Add condition
              </button>
            </div>
          )}
        </SectionCard>

        {/* XP */}
        <SectionCard title="Experience Points">
          <XpEditor
            xp={xp}
            level={character.level}
            onSave={(val) => mutate({ xp: val }, () => updateXp(character.id, val))}
          />
        </SectionCard>

        {/* Notes */}
        <SectionCard title="Notes">
          <NotesEditor
            value={notes ?? ""}
            onSave={(val) => mutate({ notes: val || undefined }, () => updateNotes(character.id, val))}
          />
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

// ─── XpEditor ─────────────────────────────────────────────────────────────────

function XpEditor({ xp, level, onSave }: { xp: number; level: number; onSave: (v: number) => void }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(String(xp));

  const nextThreshold = XP_THRESHOLDS[level] ?? null;
  const xpForNext = nextThreshold !== null ? nextThreshold - xp : null;
  const impliedLevel = xpToLevel(xp);

  function handleBlur() {
    setEditing(false);
    const parsed = parseInt(draft, 10);
    const val = isNaN(parsed) ? xp : Math.max(0, parsed);
    setDraft(String(val));
    if (val !== xp) onSave(val);
  }

  if (editing) {
    return (
      <input
        type="number"
        autoFocus
        value={draft}
        min={0}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={handleBlur}
        onKeyDown={(e) => { if (e.key === "Enter") e.currentTarget.blur(); }}
        className="w-full bg-stone-800 border border-amber-500 rounded-xl px-3 py-2 text-sm text-stone-100
          focus:outline-none tabular-nums"
      />
    );
  }

  return (
    <button
      onClick={() => { setDraft(String(xp)); setEditing(true); }}
      className="w-full text-left group"
    >
      <div className="flex items-baseline justify-between">
        <span className="text-lg font-bold text-stone-100 tabular-nums group-hover:text-amber-400 transition-colors">
          {xp.toLocaleString()}
          <span className="text-xs font-normal text-stone-600 ml-1">XP</span>
        </span>
        {xpForNext !== null && (
          <span className="text-xs text-stone-500">
            {xpForNext.toLocaleString()} to level {level + 1}
          </span>
        )}
      </div>
      {impliedLevel !== level && (
        <p className="text-xs text-amber-500 mt-1">
          XP implies level {impliedLevel} — level up via Features tab
        </p>
      )}
    </button>
  );
}

// ─── NotesEditor ──────────────────────────────────────────────────────────────

function NotesEditor({ value, onSave }: { value: string; onSave: (v: string) => void }) {
  const [draft, setDraft] = useState(value);
  const dirty = useRef(false);

  function handleBlur() {
    if (dirty.current) {
      dirty.current = false;
      onSave(draft);
    }
  }

  return (
    <textarea
      value={draft}
      placeholder="Session notes, quest hooks, reminders…"
      rows={6}
      onChange={(e) => { setDraft(e.target.value); dirty.current = true; }}
      onBlur={handleBlur}
      className="w-full bg-transparent text-sm text-stone-300 placeholder:text-stone-600 resize-none
        focus:outline-none leading-relaxed"
    />
  );
}
