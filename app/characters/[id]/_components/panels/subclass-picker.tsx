"use client";

import { useState } from "react";
import { useMutation } from "@/lib/character/mutation-context";
import { setSubclass } from "@/app/actions/characters";
import type { SrdClass, SrdSubclass } from "@/lib/content/srd";
import type { CharacterData } from "@/lib/types/character";
import { sourceChipClass } from "@/lib/ui-tokens";

function stripHtml(html: string): string {
  return html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}

interface Props {
  open: boolean;
  onClose: () => void;
  srdClass: SrdClass;
  allSubclasses?: SrdSubclass[];
}

export function SubclassPicker({ open, onClose, srdClass, allSubclasses = [] }: Props) {
  const { character, mutate } = useMutation();
  const subclasses = allSubclasses.filter((s) => s.classId === srdClass.id);
  const [picked, setPicked] = useState(character.data.subclassId ?? "");

  if (!open) return null;

  const selected = subclasses.find((s) => s.id === picked);

  function handleSave() {
    if (!picked) return;
    const patch: Partial<CharacterData> = { subclassId: picked };
    mutate(patch, () => setSubclass(character.id, picked));
    onClose();
  }

  return (
    <>
      <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm" onClick={onClose} aria-hidden />
      <div
        role="dialog"
        aria-modal
        aria-label="Choose subclass"
        className="fixed inset-x-0 bottom-0 z-50 bg-stone-900 border-t border-stone-700 rounded-t-2xl
          md:inset-auto md:top-[8vh] md:left-1/2 md:-translate-x-1/2 md:w-[min(560px,92vw)]
          md:rounded-2xl md:border md:border-stone-700 flex flex-col"
        style={{ maxHeight: "88dvh" }}
      >
        <div className="flex items-center justify-between px-5 pt-4 pb-3 border-b border-stone-800 shrink-0">
          <h2 className="text-base font-bold text-stone-100">
            Choose {srdClass.name} Subclass
          </h2>
          <button
            onClick={onClose}
            className="min-w-[44px] min-h-[44px] flex items-center justify-center text-stone-400 hover:text-stone-200 text-xl"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        <div className="overflow-y-auto flex-1 px-5 py-4 space-y-2">
          {subclasses.map((sub) => (
            <button
              key={sub.id}
              onClick={() => setPicked(sub.id)}
              className={`w-full rounded-xl border p-4 text-left transition-colors ${
                picked === sub.id
                  ? "border-amber-500 bg-amber-900/20"
                  : "border-stone-700 bg-stone-800 hover:border-stone-500"
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <p className={`text-sm font-semibold ${picked === sub.id ? "text-amber-300" : "text-stone-200"}`}>
                  {sub.name}
                </p>
                <span className={`text-[10px] rounded px-1.5 py-0.5 font-medium shrink-0 ${sourceChipClass(sub.source)}`}>
                  {sub.sourceLabel ?? "SRD"}
                </span>
              </div>
              <p className="text-xs text-stone-500 mt-1 leading-relaxed">{stripHtml(sub.description)}</p>
              {picked === sub.id && (
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {sub.features.map((f) => (
                    <span key={f} className="text-[10px] px-2 py-0.5 rounded-full bg-stone-700 text-stone-400">
                      {f}
                    </span>
                  ))}
                </div>
              )}
            </button>
          ))}
        </div>

        <div className="px-5 pb-4 pt-2 border-t border-stone-800 shrink-0">
          <button
            onClick={handleSave}
            disabled={!picked}
            className="w-full min-h-[48px] rounded-xl bg-amber-600 text-stone-950 font-bold
              hover:bg-amber-500 active:bg-amber-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            {selected ? `Choose ${selected.name}` : "Select a subclass"}
          </button>
        </div>
      </div>
    </>
  );
}
