"use client";

import type { FightingStyleEntry } from "@/app/actions/content";
import { sourceChipClass } from "@/lib/ui-tokens";

export type { FightingStyleEntry };

interface FightingStylePickerProps {
  styles: FightingStyleEntry[];
  pickedId: string;
  onPick: (id: string) => void;
}

export function FightingStylePicker({ styles, pickedId, onPick }: FightingStylePickerProps) {
  return (
    <div className="space-y-2">
      {styles.map((style) => (
        <button
          key={style.id}
          onClick={() => onPick(style.id)}
          className={`w-full rounded-xl border p-3 text-left transition-colors ${
            pickedId === style.id
              ? "border-amber-500 bg-amber-900/20"
              : "border-stone-700 bg-stone-800 hover:border-stone-500"
          }`}
        >
          <div className="flex items-start justify-between gap-2">
            <p className={`text-sm font-semibold ${
              pickedId === style.id ? "text-amber-300" : "text-stone-200"
            }`}>
              {style.name}
            </p>
            <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium shrink-0 ${sourceChipClass(style.sourceLabel)}`}>
              {style.sourceLabel}
            </span>
          </div>
          <p className="text-xs text-stone-500 mt-1 leading-relaxed">
            {style.description.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim()}
          </p>
        </button>
      ))}
    </div>
  );
}
