"use client";

import { useState } from "react";
import { useMutation } from "@/lib/character/mutation-context";
import { expendSpellSlot, restoreSpellSlot } from "@/app/actions/characters";
import type { DerivedStats } from "@/lib/character/calc";
import { signedMod } from "@/lib/character/calc";
import type { SrdClass } from "@/lib/content/srd";
import { getCasterType } from "@/lib/content/srd";
import type { CharacterData, SpellSlotLevel } from "@/lib/types/character";
import type { DisplaySpell } from "@/lib/types/spell";
import { SectionCard } from "../shared/section-card";
import { EmptyState } from "../shared/empty-state";
import { SpellManager } from "../panels/spell-manager";

interface Props {
  derived: DerivedStats;
  srdClass: SrdClass | undefined;
  allSpells: DisplaySpell[];
}

export function TabSpells({ derived, srdClass, allSpells }: Props) {
  const { character, mutate } = useMutation();
  const [managerOpen, setManagerOpen] = useState(false);

  if (!srdClass?.spellcasting) {
    return <EmptyState message="This character doesn't cast spells." />;
  }
  if (srdClass.spellcasting.startsAtLevel > character.level) {
    return <EmptyState message="Spellcasting becomes available at a higher level." />;
  }

  const spellSlots = character.data.spellSlots ?? {};
  const spellsKnown = character.data.spellsKnown ?? [];
  const spellsPrepared = character.data.spellsPrepared ?? [];
  const casterType = getCasterType(character.classId);
  const isPrepared = casterType === "prepared";

  // Which spell IDs are currently active (prepared or known)?
  const activeSpellIds = isPrepared ? spellsPrepared : spellsKnown;
  const activeSpells = allSpells
    .filter((s) => activeSpellIds.includes(s.id))
    .sort((a, b) => a.level - b.level || a.name.localeCompare(b.name));

  const cantrips = activeSpells.filter((s) => s.level === 0);
  const leveledSpells = activeSpells.filter((s) => s.level > 0);

  function handlePipClick(level: string, slot: SpellSlotLevel, wasFilled: boolean) {
    if (wasFilled && slot.remaining <= 0) return;
    if (!wasFilled && slot.remaining >= slot.total) return;

    const newRemaining = wasFilled ? slot.remaining - 1 : slot.remaining + 1;
    const optimisticPatch: Partial<CharacterData> = {
      spellSlots: {
        ...character.data.spellSlots,
        [level]: { ...slot, remaining: newRemaining },
      },
    };
    mutate(
      optimisticPatch,
      wasFilled
        ? () => expendSpellSlot(character.id, level)
        : () => restoreSpellSlot(character.id, level)
    );
  }

  return (
    <>
      <div className="space-y-4">
        {/* Spellcasting stats */}
        {derived.spellcastingAbility && (
          <SectionCard title="Spellcasting">
            <div className="grid grid-cols-3 gap-3">
              <StatCell label="Ability"       value={derived.spellcastingAbility.toUpperCase()} />
              <StatCell label="Spell Save DC" value={String(derived.spellSaveDC ?? "—")} />
              <StatCell label="Spell Attack"  value={signedMod(derived.spellAttackBonus ?? 0)} />
            </div>
          </SectionCard>
        )}

        {/* Spell slots */}
        {Object.keys(spellSlots).length > 0 && (
          <SectionCard title="Spell Slots">
            <div className="space-y-1">
              {Object.entries(spellSlots)
                .sort(([a], [b]) => Number(a) - Number(b))
                .map(([level, slot]) => (
                  <SlotRow
                    key={level}
                    level={level}
                    slot={slot}
                    onPipClick={(wasFilled) => handlePipClick(level, slot, wasFilled)}
                  />
                ))}
            </div>
          </SectionCard>
        )}

        {/* Cantrips */}
        {cantrips.length > 0 && (
          <SectionCard title="Cantrips">
            <ul className="divide-y divide-stone-800/60">
              {cantrips.map((spell) => (
                <li key={spell.id} className="py-2">
                  <SpellRow name={spell.name} sublabel={`${spell.school} · ${spell.castingTime}`} />
                </li>
              ))}
            </ul>
          </SectionCard>
        )}

        {/* Leveled spells */}
        {leveledSpells.length > 0 ? (
          <SectionCard title={isPrepared ? "Prepared Spells" : "Known Spells"}>
            <ul className="divide-y divide-stone-800/60">
              {leveledSpells.map((spell) => (
                <li key={spell.id} className="py-2">
                  <SpellRow
                    name={spell.name}
                    sublabel={`Level ${spell.level} · ${spell.school}`}
                    badges={[
                      spell.concentration ? "Conc." : null,
                      spell.ritual ? "Ritual" : null,
                    ].filter(Boolean) as string[]}
                  />
                </li>
              ))}
            </ul>
          </SectionCard>
        ) : (
          <SectionCard title={isPrepared ? "Prepared Spells" : "Known Spells"}>
            <EmptyState message={isPrepared ? "No spells prepared." : "No spells known."} />
          </SectionCard>
        )}

        {/* Manage Spells button */}
        <button
          onClick={() => setManagerOpen(true)}
          className="w-full min-h-[48px] rounded-xl border border-stone-700 text-stone-300 text-sm font-semibold
            hover:border-amber-600 hover:text-amber-400 active:bg-stone-800 transition-colors"
        >
          Manage Spells
        </button>
      </div>

      <SpellManager
        open={managerOpen}
        onClose={() => setManagerOpen(false)}
        srdClass={srdClass}
        derived={derived}
        allSpells={allSpells}
      />
    </>
  );
}

// ── Sub-components ────────────────────────────────────────────────────────────

function SlotRow({ level, slot, onPipClick }: { level: string; slot: SpellSlotLevel; onPipClick: (wasFilled: boolean) => void }) {
  return (
    <div className="flex items-center gap-3 py-1">
      <span className="text-sm text-stone-400 w-16 shrink-0">Level {level}</span>
      <span className="text-xs text-stone-600 tabular-nums w-8 shrink-0">
        {slot.remaining}/{slot.total}
      </span>
      <div className="flex flex-wrap gap-0.5">
        {Array.from({ length: slot.total }).map((_, i) => {
          const filled = i < slot.remaining;
          return <SlotPip key={i} filled={filled} onClick={() => onPipClick(filled)} />;
        })}
      </div>
    </div>
  );
}

function SlotPip({ filled, onClick }: { filled: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      aria-label={filled ? "Expend spell slot" : "Restore spell slot"}
      className="w-11 h-11 flex items-center justify-center active:scale-90 transition-transform"
    >
      <span className={`w-5 h-5 rounded-full border-2 transition-all duration-200 ${
        filled
          ? "bg-amber-400 border-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.45)]"
          : "bg-stone-800 border-stone-600"
      }`} />
    </button>
  );
}

function SpellRow({ name, sublabel, badges = [] }: { name: string; sublabel: string; badges?: string[] }) {
  return (
    <div className="flex items-start justify-between gap-2">
      <div>
        <p className="text-sm font-medium text-stone-100">{name}</p>
        <p className="text-xs text-stone-500 mt-0.5">{sublabel}</p>
      </div>
      {badges.length > 0 && (
        <div className="flex gap-1 shrink-0 mt-0.5">
          {badges.map((b) => (
            <span key={b} className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-stone-800 text-stone-400">
              {b}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

function StatCell({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col items-center gap-0.5">
      <span className="text-xs text-stone-500">{label}</span>
      <span className="text-lg font-semibold text-stone-100">{value}</span>
    </div>
  );
}
