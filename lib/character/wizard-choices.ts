import type { FeatureDef } from "@/lib/features/types";
import type { LevelChoiceRecord } from "@/lib/types/character";

/**
 * Maps wizard draft choices for one level into a LevelChoiceRecord for persistence.
 *
 * Named fields (fightingStyle, featId, asi) are used for backward-compat choice kinds.
 * Any choice kind without a named field lands in picks[defId] for forward compat.
 */
export function applyDraftChoices(
  defs: FeatureDef[],
  draftValues: Record<string, string>,
  hpGained: number
): LevelChoiceRecord {
  const record: LevelChoiceRecord = { hpGained };

  for (const def of defs) {
    const value = draftValues[def.id];
    if (!value) continue;
    const choice = def.choices?.[0];
    if (!choice) continue;

    if (
      choice.kind === "feat" &&
      "from" in choice &&
      choice.from != null &&
      "tag" in choice.from &&
      choice.from.tag === "fighting-style"
    ) {
      record.fightingStyle = value;
    } else {
      record.picks = { ...(record.picks ?? {}), [def.id]: value };
    }
  }

  return record;
}
