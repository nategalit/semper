"use client";

import { useWizardStore } from "@/lib/stores/wizard-store";
import type { SrdClass, SrdBackground } from "@/lib/content/srd";

interface Props {
  classes: SrdClass[];
  backgrounds: SrdBackground[];
}

export function StepSkills({ classes, backgrounds }: Props) {
  const { classId, backgroundId, classSkills, toggleClassSkill } = useWizardStore();

  const srdClass = classes.find((c) => `${c.id}:${c.sourceLabel ?? ""}` === classId);
  const srdBackground = backgrounds.find((b) => `${b.id}:${b.sourceLabel ?? ""}` === backgroundId);

  if (!srdClass) return null;

  const { from: options, count } = srdClass.skillChoices;
  const bgSkills = new Set<string>(srdBackground?.skillProficiencies ?? []);
  const selected = new Set<string>(classSkills);
  const remaining = count - selected.size;
  const atLimit = remaining <= 0;

  return (
    <div>
      <h2 className="text-2xl font-bold mb-1">Class skills</h2>
      <p className="text-stone-400 mb-2">
        {srdClass.name}s choose{" "}
        <span className="text-amber-400 font-semibold">{count}</span> skill
        {count !== 1 ? "s" : ""} from the list below.
      </p>

      {remaining > 0 ? (
        <p className="text-sm text-stone-500 mb-4">
          {remaining} more to pick
        </p>
      ) : (
        <p className="text-sm text-emerald-400 mb-4">All picks made ✓</p>
      )}

      <div className="grid grid-cols-2 gap-2 mb-6">
        {options.map((skill) => {
          const isSelected = selected.has(skill);
          const fromBg = bgSkills.has(skill);
          const disabled = !isSelected && atLimit;

          return (
            <button
              key={skill}
              onClick={() => !disabled && toggleClassSkill(skill)}
              disabled={disabled}
              className={`rounded-lg border px-3 py-2.5 text-left text-sm transition-colors relative ${
                isSelected
                  ? "border-amber-500 bg-amber-900/20 text-amber-300"
                  : disabled
                  ? "border-stone-800 bg-stone-900/30 text-stone-600 cursor-not-allowed"
                  : "border-stone-700 bg-stone-900 text-stone-300 hover:border-stone-500"
              }`}
            >
              {skill}
              {fromBg && (
                <span className="absolute top-1 right-1.5 text-[9px] text-stone-500 uppercase tracking-wider">
                  bg
                </span>
              )}
            </button>
          );
        })}
      </div>

      {srdBackground && bgSkills.size > 0 && (
        <p className="text-xs text-stone-500">
          Background also grants:{" "}
          <span className="text-stone-400">{srdBackground.skillProficiencies.join(", ")}</span>.
          These stack with your class picks.
        </p>
      )}
    </div>
  );
}
