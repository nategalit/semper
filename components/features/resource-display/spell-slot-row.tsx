"use client";

import type { FeatureResource } from "@/lib/features/types";

interface SpellSlotRowProps {
  resource: FeatureResource;
  current: number;
  max: number;
  onChange: (next: number) => void;
}

export function SpellSlotRow({ resource, current, max, onChange }: SpellSlotRowProps) {
  const shape = resource.shape;
  const level = shape.kind === "slots" ? shape.level : "?";

  return (
    <div className="flex items-center gap-2">
      <span className="text-[10px] uppercase tracking-wider text-stone-500 w-8 shrink-0">
        {typeof level === "number" ? `L${level}` : "Pact"}
      </span>
      <div className="flex gap-0.5 flex-wrap">
        {Array.from({ length: max }).map((_, i) => {
          const filled = i < current;
          return (
            <button
              key={i}
              onClick={() => onChange(filled ? current - 1 : current + 1)}
              aria-label={filled ? `Expend slot` : `Recover slot`}
              className="w-9 h-9 flex items-center justify-center active:scale-90 transition-transform"
            >
              <span className={`w-4 h-4 rounded border-2 transition-all duration-200 ${
                filled
                  ? "bg-violet-500 border-violet-500"
                  : "bg-stone-800 border-stone-600"
              }`} />
            </button>
          );
        })}
      </div>
      <span className="text-xs text-stone-600">{current}/{max}</span>
    </div>
  );
}
