"use client";

import { useWizardStore } from "@/lib/stores/wizard-store";

export function StepName() {
  const { name, setName } = useWizardStore();

  return (
    <div>
      <h2 className="text-2xl font-bold mb-1">Name your character</h2>
      <p className="text-stone-400 mb-8">What does the world call them?</p>

      <label htmlFor="char-name" className="block text-sm font-medium text-stone-300 mb-2">
        Character name
      </label>
      <input
        id="char-name"
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="e.g. Thorin Stonehelm"
        maxLength={100}
        className="w-full rounded-lg border border-stone-700 bg-stone-900 px-4 py-3 text-lg text-stone-100 placeholder-stone-600 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
      />
    </div>
  );
}
