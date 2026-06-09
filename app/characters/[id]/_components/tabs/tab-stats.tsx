"use client";

import { useState } from "react";
import type { Character } from "@/lib/types/character";
import type { DerivedStats, StatBreakdown } from "@/lib/character/calc";
import type { AbilityKey } from "@/lib/content/srd";
import type { SrdClass, SrdBackground, SrdRace } from "@/lib/content/srd";
import type { OverridableStatKey } from "@/lib/types/character";
import { AbilityBlock } from "../shared/ability-block";
import { ProficiencyRow } from "../shared/proficiency-row";
import { SectionCard } from "../shared/section-card";
import { StatPopover } from "../shared/stat-popover";
import { ClassSkillPicker } from "../panels/class-skill-picker";

interface Props {
  character: Character;
  derived: DerivedStats;
  srdClass: SrdClass | undefined;
  srdRace: SrdRace | undefined;
  srdBackground: SrdBackground | undefined;
}

const ABILITY_LABELS: Record<AbilityKey, string> = {
  str: "STR", dex: "DEX", con: "CON", int: "INT", wis: "WIS", cha: "CHA",
};
const ABILITY_KEYS: AbilityKey[] = ["str", "dex", "con", "int", "wis", "cha"];

interface ActiveBreakdown {
  label: string;
  breakdown: StatBreakdown;
  statKey: OverridableStatKey;
  currentOtherMod: number;
  currentOverride: number | null;
}

export function TabStats({ character, derived, srdClass, srdRace, srdBackground }: Props) {
  const [pickerOpen, setPickerOpen] = useState(false);
  const [activeBreakdown, setActiveBreakdown] = useState<ActiveBreakdown | null>(null);
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
          const bd = derived.savingThrowBreakdowns[key];
          const sk = `save_${key}` as OverridableStatKey;
          return (
            <ProficiencyRow
              key={key}
              label={ABILITY_LABELS[key]}
              modifier={st.modifier}
              proficient={st.proficient}
              hasOverride={!!(character.data.overrides?.[sk] !== undefined || character.data.otherModifiers?.[sk])}
              onClick={() => setActiveBreakdown({
                label: `${ABILITY_LABELS[key]} Save`, breakdown: bd, statKey: sk,
                currentOtherMod: character.data.otherModifiers?.[sk] ?? 0,
                currentOverride: character.data.overrides?.[sk] ?? null,
              })}
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
        {Object.entries(derived.skills).map(([skill, result]) => {
          const bd = derived.skillBreakdowns[skill];
          const sk = `skill_${skill}` as OverridableStatKey;
          return (
            <ProficiencyRow
              key={skill}
              label={`${skill} (${result.ability.toUpperCase()})`}
              modifier={result.modifier}
              proficient={result.proficient}
              hasOverride={!!(character.data.overrides?.[sk] !== undefined || character.data.otherModifiers?.[sk])}
              onClick={() => setActiveBreakdown({
                label: skill, breakdown: bd, statKey: sk,
                currentOtherMod: character.data.otherModifiers?.[sk] ?? 0,
                currentOverride: character.data.overrides?.[sk] ?? null,
              })}
            />
          );
        })}
      </SectionCard>

      {/* Passive perception */}
      <SectionCard title="Senses">
        <div className="flex justify-between items-center">
          <span className="text-sm text-stone-300">Passive Perception</span>
          <span className="text-sm font-semibold text-stone-100">{derived.passivePerception}</span>
        </div>
      </SectionCard>

      {/* Proficiencies */}
      {(srdClass || srdBackground || srdRace) && (
        <SectionCard title="Proficiencies">
          <div className="space-y-2">
            {srdClass && srdClass.armorProficiencies.length > 0 && (
              <ProfRow label="Armor" value={srdClass.armorProficiencies.join(", ")} />
            )}
            {srdClass && (
              <ProfRow label="Weapons" value={srdClass.weaponProficiencies.join(", ")} />
            )}
            {srdBackground?.toolProficiency && (
              <ProfRow label="Tools" value={srdBackground.toolProficiency} />
            )}
            {(srdRace?.languages?.length || srdBackground?.languages) && (
              <ProfRow
                label="Languages"
                value={[
                  ...(srdRace?.languages ?? []),
                  ...(srdBackground?.languages ? [`+${srdBackground.languages} of your choice`] : []),
                ].join(", ")}
              />
            )}
          </div>
        </SectionCard>
      )}
    </div>

    {srdClass && (
      <ClassSkillPicker
        open={pickerOpen}
        onClose={() => setPickerOpen(false)}
        srdClass={srdClass}
        srdBackground={srdBackground}
      />
    )}

    {activeBreakdown && (
      <StatPopover
        label={activeBreakdown.label}
        breakdown={activeBreakdown.breakdown}
        mode="modifier"
        onClose={() => setActiveBreakdown(null)}
        characterId={character.id}
        statKey={activeBreakdown.statKey}
        currentOtherMod={activeBreakdown.currentOtherMod}
        currentOverride={activeBreakdown.currentOverride}
      />
    )}
    </>
  );
}

function ProfRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex gap-3 text-sm">
      <span className="text-stone-500 w-20 shrink-0">{label}</span>
      <span className="text-stone-300 leading-relaxed">{value}</span>
    </div>
  );
}
