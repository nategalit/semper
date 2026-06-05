"use client";

import { useWizardStore } from "@/lib/stores/wizard-store";

export interface FightingStyleOption {
  id: string;
  name: string;
  description: string;
  sourceLabel: string;
}

interface Props {
  allFightingStyles: FightingStyleOption[];
}

export function StepClassFeatures({ allFightingStyles }: Props) {
  const { wizardFightingStyleId, setWizardFightingStyleId } = useWizardStore();

  return (
    <div>
      <h2 className="text-xl font-bold text-stone-100 mb-1">Class Features</h2>
      <p className="text-sm text-stone-400 mb-6">Choose your Fighting Style.</p>
      <div className="space-y-2">
        {allFightingStyles.map((style) => (
          <button
            key={style.id}
            onClick={() => setWizardFightingStyleId(style.id)}
            className={`w-full rounded-xl border p-3 text-left transition-colors ${
              wizardFightingStyleId === style.id
                ? "border-amber-500 bg-amber-900/20"
                : "border-stone-700 bg-stone-800 hover:border-stone-500"
            }`}
          >
            <div className="flex items-start justify-between gap-2">
              <p className={`text-sm font-semibold ${
                wizardFightingStyleId === style.id ? "text-amber-300" : "text-stone-200"
              }`}>
                {style.name}
              </p>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-stone-700 text-stone-500 shrink-0">
                {style.sourceLabel}
              </span>
            </div>
            <p className="text-xs text-stone-500 mt-1 leading-relaxed">
              {style.description}
            </p>
          </button>
        ))}
      </div>
    </div>
  );
}
