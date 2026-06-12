"use client";

import type { FeatureChoice } from "@/lib/features/types";
import type { FeatElement } from "@/lib/content/schema";
import type { AbilityScores } from "@/lib/types/character";
import type { FightingStyleEntry } from "@/app/actions/content";
import { FightingStylePicker } from "../../panels/fighting-style-picker";
import { AsiOrFeatPicker, type AsiOrFeatValue } from "./asi-or-feat";

export type { AsiOrFeatValue };

export type ChoiceValue = string | AsiOrFeatValue;

interface ChoicePickerProps {
  choice: FeatureChoice;
  value: ChoiceValue | undefined;
  onChange: (value: ChoiceValue) => void;
  // Context — required by specific choice kinds
  allFightingStyles?: FightingStyleEntry[];
  effectiveScores?: AbilityScores;
  feats?: FeatElement[];
  disabledFeatIds?: Set<string>;
}

export function ChoicePicker({
  choice,
  value,
  onChange,
  allFightingStyles,
  effectiveScores,
  feats,
  disabledFeatIds,
}: ChoicePickerProps) {
  switch (choice.kind) {
    case "feat":
      if (choice.from.tag === "fighting-style") {
        return (
          <FightingStylePicker
            styles={allFightingStyles ?? []}
            pickedId={(value as string) ?? ""}
            onPick={(id) => onChange(id)}
          />
        );
      }
      return null;

    case "asi-or-feat":
      return (
        <AsiOrFeatPicker
          value={(value as AsiOrFeatValue | undefined) ?? { mode: "asi", asi: {} }}
          onChange={onChange}
          effectiveScores={effectiveScores ?? { str: 10, dex: 10, con: 10, int: 10, wis: 10, cha: 10 }}
          feats={feats ?? []}
          disabledFeatIds={disabledFeatIds ?? new Set()}
        />
      );

    // Stubs for future choice kinds (chunks 6, 9)
    case "skill":
    case "language":
    case "weapon-mastery":
    case "spell":
    case "mode":
    case "subfeature":
    default:
      return null;
  }
}
