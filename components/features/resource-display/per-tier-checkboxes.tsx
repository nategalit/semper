"use client";

import type { FeatureResource } from "@/lib/features/types";

interface PerTierCheckboxesProps {
  resource: FeatureResource;
  current: number;
  max: number;
  onChange: (next: number) => void;
}

export function PerTierCheckboxes({ resource, current, max, onChange }: PerTierCheckboxesProps) {
  const shape = resource.shape;
  const tiers = shape.kind === "per-tier-one-shot" ? shape.tiers : [];

  return (
    <div className="flex flex-col gap-1">
      {tiers.map((tier, i) => {
        const spent = i >= current;
        return (
          <label key={tier} className="flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={spent}
              onChange={() => onChange(spent ? current + 1 : current - 1)}
              className="w-4 h-4 accent-amber-500"
            />
            <span className={`text-sm ${spent ? "line-through text-stone-600" : "text-stone-300"}`}>
              {tier === 0 ? "Cantrip" : `${tier}${["st","nd","rd"][tier-1] ?? "th"}-level`}
            </span>
          </label>
        );
      })}
      {tiers.length === 0 && (
        <span className="text-xs text-stone-600">{current} / {max} remaining</span>
      )}
    </div>
  );
}
