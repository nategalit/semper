"use client";

import { useWizardStore } from "@/lib/stores/wizard-store";
import type { SrdRace } from "@/lib/content/srd";

export function StepSubrace({ selectedRace }: { selectedRace: SrdRace | undefined }) {
  const { subraceId, setSubraceId } = useWizardStore();

  if (!selectedRace) return null;

  return (
    <div>
      <h2 className="text-2xl font-bold mb-1">Choose a subrace</h2>
      <p className="text-stone-400 mb-6">
        {selectedRace.name}s choose a subrace that further shapes their heritage.
        {!selectedRace.subraceRequired && (
          <span className="text-stone-500"> This choice is optional.</span>
        )}
      </p>

      <div className="space-y-2">
        {selectedRace.subraces.map((subrace) => {
          const isSelected = subraceId === subrace.id;
          return (
            <button
              key={subrace.id}
              onClick={() => setSubraceId(isSelected ? "" : subrace.id)}
              className={`w-full rounded-lg border p-4 text-left transition-colors ${
                isSelected
                  ? "border-amber-500 bg-amber-900/20"
                  : "border-stone-700 bg-stone-900 hover:border-stone-500"
              }`}
            >
              <p className={`text-sm font-semibold ${isSelected ? "text-amber-300" : "text-stone-200"}`}>
                {subrace.name}
              </p>
              <div className="flex flex-wrap gap-2 mt-1.5">
                {Object.entries(subrace.abilityScoreBonuses).map(([k, v]) => (
                  <span key={k} className="text-xs rounded-full bg-stone-800 px-2 py-0.5 text-amber-300">
                    +{v} {k.toUpperCase()}
                  </span>
                ))}
                {subrace.traits?.map((t) => (
                  <span key={t} className="text-xs rounded-full bg-stone-800 px-2 py-0.5 text-stone-400">
                    {t}
                  </span>
                ))}
              </div>
            </button>
          );
        })}
      </div>

      {!selectedRace.subraceRequired && (
        <p className="text-xs text-stone-600 mt-4">
          You can skip this step — no subrace is required for {selectedRace.name}s.
        </p>
      )}
    </div>
  );
}
