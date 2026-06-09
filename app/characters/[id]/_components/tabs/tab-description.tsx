"use client";

import { useState, useRef } from "react";
import { useMutation } from "@/lib/character/mutation-context";
import { updateDescription } from "@/app/actions/characters";
import type { CharacterData } from "@/lib/types/character";
import { SectionCard } from "../shared/section-card";

// ─── Alignment options ────────────────────────────────────────────────────────

const ALIGNMENTS = [
  "Lawful Good", "Neutral Good", "Chaotic Good",
  "Lawful Neutral", "True Neutral", "Chaotic Neutral",
  "Lawful Evil", "Neutral Evil", "Chaotic Evil",
];

// ─── Component ────────────────────────────────────────────────────────────────

export function TabDescription() {
  const { character, mutate } = useMutation();
  const { alignment, personalityTraits = [], ideal, bond, flaw } = character.data;

  function save(patch: Partial<Pick<CharacterData, "alignment" | "personalityTraits" | "ideal" | "bond" | "flaw">>) {
    const full = {
      alignment: patch.alignment ?? alignment,
      personalityTraits: patch.personalityTraits ?? personalityTraits,
      ideal: patch.ideal ?? ideal,
      bond: patch.bond ?? bond,
      flaw: patch.flaw ?? flaw,
    };
    mutate(patch, () => updateDescription(character.id, full));
  }

  return (
    <div className="space-y-4">
      {/* Alignment */}
      <SectionCard title="Alignment">
        <AlignmentPicker
          value={alignment ?? ""}
          onSave={(val) => save({ alignment: val || undefined })}
        />
      </SectionCard>

      {/* Personality Traits */}
      <SectionCard title="Personality Traits">
        <TraitListEditor
          traits={personalityTraits}
          placeholder="Add a personality trait…"
          onSave={(traits) => save({ personalityTraits: traits })}
        />
      </SectionCard>

      {/* Ideal */}
      <SectionCard title="Ideal">
        <InlineTextArea
          value={ideal ?? ""}
          placeholder="What do you believe in?"
          onSave={(val) => save({ ideal: val || undefined })}
        />
      </SectionCard>

      {/* Bond */}
      <SectionCard title="Bond">
        <InlineTextArea
          value={bond ?? ""}
          placeholder="Who or what are you devoted to?"
          onSave={(val) => save({ bond: val || undefined })}
        />
      </SectionCard>

      {/* Flaw */}
      <SectionCard title="Flaw">
        <InlineTextArea
          value={flaw ?? ""}
          placeholder="What is your greatest weakness?"
          onSave={(val) => save({ flaw: val || undefined })}
        />
      </SectionCard>
    </div>
  );
}

// ─── AlignmentPicker ──────────────────────────────────────────────────────────

function AlignmentPicker({ value, onSave }: { value: string; onSave: (v: string) => void }) {
  return (
    <div className="flex flex-wrap gap-2">
      {ALIGNMENTS.map((a) => (
        <button
          key={a}
          onClick={() => onSave(value === a ? "" : a)}
          className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition-colors ${
            value === a
              ? "border-amber-500 bg-amber-600/20 text-amber-300"
              : "border-stone-700 text-stone-400 hover:border-stone-500 hover:text-stone-200"
          }`}
        >
          {a}
        </button>
      ))}
    </div>
  );
}

// ─── InlineTextArea ───────────────────────────────────────────────────────────

function InlineTextArea({ value, placeholder, onSave }: {
  value: string;
  placeholder: string;
  onSave: (v: string) => void;
}) {
  const [draft, setDraft] = useState(value);
  const [focused, setFocused] = useState(false);
  const dirty = useRef(false);

  function handleBlur() {
    setFocused(false);
    if (dirty.current) {
      dirty.current = false;
      onSave(draft);
    }
  }

  return (
    <textarea
      value={draft}
      placeholder={placeholder}
      rows={draft.length > 80 || focused ? 3 : 2}
      onChange={(e) => { setDraft(e.target.value); dirty.current = true; }}
      onFocus={() => setFocused(true)}
      onBlur={handleBlur}
      className="w-full bg-transparent text-sm text-stone-300 placeholder:text-stone-600 resize-none
        focus:outline-none focus:ring-0 leading-relaxed"
    />
  );
}

// ─── TraitListEditor ──────────────────────────────────────────────────────────

function TraitListEditor({ traits, placeholder, onSave }: {
  traits: string[];
  placeholder: string;
  onSave: (traits: string[]) => void;
}) {
  const [newTrait, setNewTrait] = useState("");

  function addTrait() {
    const trimmed = newTrait.trim();
    if (!trimmed) return;
    onSave([...traits, trimmed]);
    setNewTrait("");
  }

  function removeTrait(i: number) {
    onSave(traits.filter((_, idx) => idx !== i));
  }

  function updateTrait(i: number, val: string) {
    const updated = traits.map((t, idx) => (idx === i ? val : t));
    onSave(updated.filter(Boolean));
  }

  return (
    <div className="space-y-2">
      {traits.map((trait, i) => (
        <div key={i} className="flex items-start gap-2 group">
          <TraitInput
            value={trait}
            onSave={(val) => (val ? updateTrait(i, val) : removeTrait(i))}
          />
          <button
            onClick={() => removeTrait(i)}
            aria-label="Remove trait"
            className="shrink-0 mt-1 w-6 h-6 rounded text-stone-700 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100 text-xs"
          >
            ✕
          </button>
        </div>
      ))}
      <div className="flex gap-2 mt-1">
        <input
          type="text"
          value={newTrait}
          placeholder={placeholder}
          onChange={(e) => setNewTrait(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addTrait(); } }}
          className="flex-1 bg-transparent text-sm text-stone-300 placeholder:text-stone-600
            focus:outline-none border-b border-stone-800 focus:border-stone-600 transition-colors py-1"
        />
        {newTrait.trim() && (
          <button
            onClick={addTrait}
            className="text-xs text-amber-500 hover:text-amber-400 shrink-0"
          >
            Add
          </button>
        )}
      </div>
    </div>
  );
}

function TraitInput({ value, onSave }: { value: string; onSave: (v: string) => void }) {
  const [draft, setDraft] = useState(value);
  const dirty = useRef(false);

  return (
    <input
      type="text"
      value={draft}
      onChange={(e) => { setDraft(e.target.value); dirty.current = true; }}
      onBlur={() => { if (dirty.current) { dirty.current = false; onSave(draft); } }}
      className="flex-1 bg-transparent text-sm text-stone-300 focus:outline-none
        border-b border-transparent focus:border-stone-700 transition-colors py-0.5"
    />
  );
}
