"use client";

import { useState } from "react";
import type { Character } from "@/lib/types/character";
import type { DerivedStats } from "@/lib/character/calc";
import type { AbilityKey } from "@/lib/content/srd";
import type { SrdClass, SrdBackground } from "@/lib/content/srd";
import { AbilityBlock } from "../shared/ability-block";
import { ProficiencyRow } from "../shared/proficiency-row";
import { SectionCard } from "../shared/section-card";
import { ClassSkillPicker } from "../panels/class-skill-picker";

interface Props {
  character: Character;
  derived: DerivedStats;
  srdClass: SrdClass | undefined;
  srdBackground: SrdBackground | undefined;
}

const ABILITY_LABELS: Record<AbilityKey, string> = {
  str: "STR", dex: "DEX", con: "CON", int: "INT", wis: "WIS", cha: "CHA",
};
const ABILITY_KEYS: AbilityKey[] = ["str", "dex", "con", "int", "wis", "cha"];

export function TabStats({ character, derived, srdClass, srdBackground }: Props) {
  const [pickerOpen, setPickerOpen] = useState(false);
  const abilityScores = derived.effectiveAbilityScores;

  // Show the migration banner when: has a class with skill choices, but none of
  // those class skill options appear in the stored skillProficiencies yet.
  const classOptions = srdClass?.skillChoices.from ?? [];
  const stored = character.data.skillProficiencies;
  const needsClassSkills =
    classOptions.length > 0 &&
    (!stored || !stored.some((s) => classOptions.includes(s)));

  return (
    <>
    <div className="space-y-4">
      {/* Ability scores */}
      <SectionCard title="Ability Scores">
        <div className="flex flex-wrap gap-2 justify-center">
          {ABILITY_KEYS.map((key) => (
            <AbilityBlock
              key={key}
              label={ABILITY_LABELS[key]}
              score={abilityScores[key]}
              mod={derived.abilityMods[key]}
            />
          ))}
        </div>
      </SectionCard>

      {/* Saving throws */}
      <SectionCard title="Saving Throws">
        {ABILITY_KEYS.map((key) => {
          const st = derived.savingThrows[key];
          return (
            <ProficiencyRow
              key={key}
              label={ABILITY_LABELS[key]}
              modifier={st.modifier}
              proficient={st.proficient}
            />
          );
        })}
      </SectionCard>

      {/* Skills — with migration banner */}
      <SectionCard title="Skills">
        {needsClassSkills && (
          <button
            onClick={() => setPickerOpen(true)}
            className="w-full mb-3 flex items-center justify-between gap-2 rounded-lg border border-amber-700/60
              bg-amber-900/20 px-3 py-2 text-left hover:bg-amber-900/30 transition-colors"
          >
            <span className="text-xs text-amber-300">
              Class skills not configured — modifiers may be low.
            </span>
            <span className="text-xs text-amber-400 font-semibold shrink-0">Choose →</span>
          </button>
        )}
        {Object.entries(derived.skills).map(([skill, result]) => (
          <ProficiencyRow
            key={skill}
            label={`${skill} (${result.ability.toUpperCase()})`}
            modifier={result.modifier}
            proficient={result.proficient}
          />
        ))}
      </SectionCard>

      {/* Passive perception */}
      <SectionCard title="Senses">
        <div className="flex justify-between items-center">
          <span className="text-sm text-stone-300">Passive Perception</span>
          <span className="text-sm font-semibold text-stone-100">{derived.passivePerception}</span>
        </div>
      </SectionCard>
    </div>

    {srdClass && (
      <ClassSkillPicker
        open={pickerOpen}
        onClose={() => setPickerOpen(false)}
        srdClass={srdClass}
        srdBackground={srdBackground}
      />
    )}
    </>
  );
}
