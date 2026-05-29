"use client";

import { useWizardStore } from "@/lib/stores/wizard-store";
import type { Edition } from "@/lib/stores/wizard-store";

const OPTIONS: { value: Edition; label: string; desc: string }[] = [
  {
    value: "2014",
    label: "2014 Rules",
    desc: "Classic D&D 5e. Uses the original Player's Handbook races, classes, and rules.",
  },
  {
    value: "mix",
    label: "Mix (default)",
    desc: "Show content from all editions. Ideal if your table combines old and new material.",
  },
  {
    value: "2024",
    label: "2024 Rules",
    desc: "Revised D&D 5e. Uses the updated 2024 Player's Handbook content.",
  },
];

export function StepEdition() {
  const { edition, setEdition } = useWizardStore();

  return (
    <div>
      <h2 className="text-2xl font-bold mb-1">Choose rules edition</h2>
      <p className="text-stone-400 mb-6">
        Select which edition of D&amp;D 5e your game uses. This filters races, classes, and
        backgrounds to match your table&apos;s ruleset.
      </p>
      <div className="space-y-3">
        {OPTIONS.map((opt) => (
          <button
            key={opt.value}
            onClick={() => setEdition(opt.value)}
            className={`w-full rounded-lg border p-4 text-left transition-colors ${
              edition === opt.value
                ? "border-amber-500 bg-amber-900/20"
                : "border-stone-700 bg-stone-900 hover:border-stone-500"
            }`}
          >
            <p className={`font-semibold text-sm ${edition === opt.value ? "text-amber-300" : "text-stone-200"}`}>
              {opt.label}
            </p>
            <p className="text-xs text-stone-500 mt-0.5">{opt.desc}</p>
          </button>
        ))}
      </div>
    </div>
  );
}
