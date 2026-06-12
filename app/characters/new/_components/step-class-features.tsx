"use client";

import { useWizardStore } from "@/lib/stores/wizard-store";
import { ChoicePicker } from "@/app/characters/[id]/_components/features/choice-picker";
import type { FeatureDef } from "@/lib/features/types";
import type { FightingStyleEntry } from "@/app/actions/content";

interface Props {
  l1ChoiceDefs: FeatureDef[];
  allFightingStyles: FightingStyleEntry[];
}

export function StepClassFeatures({ l1ChoiceDefs, allFightingStyles }: Props) {
  const { draftLevelChoices, setDraftLevelChoice } = useWizardStore();
  const draftAtL1 = draftLevelChoices[1] ?? {};

  return (
    <div>
      <h2 className="text-xl font-bold text-stone-100 mb-1">Class Features</h2>
      <p className="text-sm text-stone-400 mb-6">Make your level 1 choices.</p>
      <div className="space-y-6">
        {l1ChoiceDefs.map((def) =>
          def.choices?.map((choice, i) => (
            <div key={`${def.id}-${i}`}>
              <p className="text-sm font-semibold text-stone-300 mb-2">{def.name}</p>
              <ChoicePicker
                choice={choice}
                value={draftAtL1[def.id]}
                onChange={(v) => setDraftLevelChoice(1, def.id, v as string)}
                allFightingStyles={allFightingStyles}
              />
            </div>
          ))
        )}
      </div>
    </div>
  );
}
