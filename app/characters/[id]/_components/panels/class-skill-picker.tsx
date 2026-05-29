"use client";

import { useState } from "react";
import { useMutation } from "@/lib/character/mutation-context";
import { setSkillProficiencies } from "@/app/actions/characters";
import type { SrdClass, SrdBackground } from "@/lib/content/srd";
import type { CharacterData } from "@/lib/types/character";

interface Props {
  open: boolean;
  onClose: () => void;
  srdClass: SrdClass;
  srdBackground: SrdBackground | undefined;
}

export function ClassSkillPicker({ open, onClose, srdClass, srdBackground }: Props) {
  const { character, mutate } = useMutation();
  const { from: options, count } = srdClass.skillChoices;

  // Seed with any already-stored class skills that appear in this class's list.
  const stored = character.data.skillProficiencies ?? [];
  const bgSkills = new Set<string>(srdBackground?.skillProficiencies ?? []);
  const alreadyClassSkills = stored.filter((s) => options.includes(s));
  const [picks, setPicks] = useState<string[]>(alreadyClassSkills);

  if (!open) return null;

  const selected = new Set(picks);
  const atLimit = picks.length >= count;

  function toggle(skill: string) {
    if (selected.has(skill)) {
      setPicks((p) => p.filter((s) => s !== skill));
    } else if (!atLimit) {
      setPicks((p) => [...p, skill]);
    }
  }

  function handleSave() {
    const bgList = srdBackground?.skillProficiencies ?? [];
    const merged = [...new Set([...picks, ...bgList])];
    const patch: Partial<CharacterData> = { skillProficiencies: merged };
    mutate(patch, () => setSkillProficiencies(character.id, merged));
    onClose();
  }

  const remaining = count - picks.length;

  return (
    <>
      <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm" onClick={onClose} aria-hidden />
      <div
        role="dialog"
        aria-modal
        aria-label="Choose class skills"
        className="fixed inset-x-0 bottom-0 z-50 bg-stone-900 border-t border-stone-700 rounded-t-2xl
          md:inset-auto md:top-[10vh] md:left-1/2 md:-translate-x-1/2 md:w-[min(480px,92vw)]
          md:rounded-2xl md:border md:border-stone-700 flex flex-col"
        style={{ maxHeight: "85dvh" }}
      >
        <div className="flex items-center justify-between px-5 pt-4 pb-3 border-b border-stone-800 shrink-0">
          <div>
            <h2 className="text-base font-bold text-stone-100">Class Skills — {srdClass.name}</h2>
            <p className={`text-xs mt-0.5 ${remaining > 0 ? "text-stone-500" : "text-emerald-400"}`}>
              {remaining > 0 ? `Pick ${remaining} more` : "All picks made ✓"}
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

        <div className="overflow-y-auto flex-1 px-5 py-4">
          <div className="grid grid-cols-2 gap-2 mb-4">
            {options.map((skill) => {
              const isSelected = selected.has(skill);
              const fromBg = bgSkills.has(skill);
              const disabled = !isSelected && atLimit;

              return (
                <button
                  key={skill}
                  onClick={() => toggle(skill)}
                  disabled={disabled}
                  className={`rounded-xl border px-3 py-2.5 text-left text-sm transition-colors relative min-h-[44px] ${
                    isSelected
                      ? "border-amber-500 bg-amber-900/20 text-amber-300"
                      : disabled
                      ? "border-stone-800 bg-stone-900/30 text-stone-600 cursor-not-allowed"
                      : "border-stone-700 bg-stone-800 text-stone-300 hover:border-stone-500"
                  }`}
                >
                  {skill}
                  {fromBg && (
                    <span className="absolute top-1 right-1.5 text-[9px] text-stone-500 uppercase tracking-wider">
                      bg
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {srdBackground && (
            <p className="text-xs text-stone-500">
              Background also grants:{" "}
              <span className="text-stone-400">{srdBackground.skillProficiencies.join(", ")}</span>
            </p>
          )}
        </div>

        <div className="px-5 pb-4 pt-2 border-t border-stone-800 shrink-0">
          <button
            onClick={handleSave}
            disabled={picks.length !== count}
            className="w-full min-h-[48px] rounded-xl bg-amber-600 text-stone-950 font-bold
              hover:bg-amber-500 active:bg-amber-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            Save class skills
          </button>
        </div>
      </div>
    </>
  );
}
