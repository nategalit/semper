"use client";

import { useState, useEffect } from "react";
import { useMutation } from "@/lib/character/mutation-context";
import { expendSpellSlot, restoreSpellSlot, initializeSpellSlots } from "@/app/actions/characters";
import { getSpellSlotsForClass } from "@/lib/content/srd/progression";
import type { DerivedStats, StatBreakdown } from "@/lib/character/calc";
import type { OverridableStatKey } from "@/lib/types/character";
import { signedMod } from "@/lib/character/calc";
import type { SrdClass } from "@/lib/content/srd";
import { getCasterType, SUBCLASS_SPELLCASTING, SUBCLASS_SPELL_CLASS, SRD_SUBCLASSES } from "@/lib/content/srd";
import type { CharacterData, SpellSlotLevel } from "@/lib/types/character";
import type { DisplaySpell } from "@/lib/types/spell";
import { SectionCard } from "../shared/section-card";
import { EmptyState } from "../shared/empty-state";
import { SpellManager } from "../panels/spell-manager";
import { StatPopover } from "../shared/stat-popover";
import { ExpandableCard } from "@/app/_components/expandable-card";
import { cleanHtmlBrowse } from "@/lib/content/aurora/clean-html";

interface Props {
  derived: DerivedStats;
  srdClass: SrdClass | undefined;
  allSpells: DisplaySpell[];
}

interface ActiveBreakdown {
  label: string;
  breakdown: StatBreakdown;
  mode: "modifier" | "absolute";
  statKey: OverridableStatKey;
  currentOtherMod: number;
  currentOverride: number | null;
}

export function TabSpells({ derived, srdClass, allSpells }: Props) {
  const { character, mutate } = useMutation();
  const [managerOpen, setManagerOpen] = useState(false);
  const [expandedIds, setExpandedIds] = useState<Set<string>>(() => new Set());
  const [activeBreakdown, setActiveBreakdown] = useState<ActiveBreakdown | null>(null);

  const subclassSC = SUBCLASS_SPELLCASTING[character.data.subclassId ?? ""];
  const effectiveSC = srdClass?.spellcasting ?? subclassSC ?? null;
  const spellSlots = character.data.spellSlots ?? {};

  // One-time initialization: subclass-granted casters (EK/AT) get no slots from
  // level-up until the 8.6-B fix; auto-populate if slots are missing.
  useEffect(() => {
    if (!subclassSC) return;
    if (Object.keys(spellSlots).length > 0) return;
    const computed = getSpellSlotsForClass(
      character.classId ?? "",
      subclassSC,
      character.level,
      undefined
    );
    if (!computed || Object.keys(computed).length === 0) return;
    mutate({ spellSlots: computed }, () => initializeSpellSlots(character.id, computed));
  }, [character.id]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!effectiveSC) {
    return <EmptyState message="This character doesn't cast spells." />;
  }
  if (effectiveSC.startsAtLevel > character.level) {
    return <EmptyState message="Spellcasting becomes available at a higher level." />;
  }
  const spellsKnown = character.data.spellsKnown ?? [];
  const spellsPrepared = character.data.spellsPrepared ?? [];
  // For subclass-granted casters, use subclassId as the caster key for limit lookups.
  const casterId = subclassSC ? (character.data.subclassId ?? "") : (character.classId ?? "");
  const casterType = getCasterType(casterId);
  const isPrepared = casterType === "prepared";

  const leveledSpellIds = isPrepared ? spellsPrepared : spellsKnown;

  // Domain / oath spells — always prepared, sourced from the SRD subclass grantedSpells.
  const srdSubclass = SRD_SUBCLASSES.find((s) => s.id === character.data.subclassId);
  const domainSpells = (srdSubclass?.grantedSpells ?? [])
    .filter((g) => g.level <= character.level)
    .map((g) => allSpells.find((s) => s.id === g.id))
    .filter((s): s is NonNullable<typeof s> => s !== undefined)
    .sort((a, b) => a.level - b.level || a.name.localeCompare(b.name));
  const domainSectionTitle = character.classId === "ID_CLASS_PALADIN" ? "Oath Spells" : "Domain Spells";

  const cantrips = allSpells
    .filter((s) => s.level === 0 && spellsKnown.includes(s.id))
    .sort((a, b) => a.name.localeCompare(b.name));
  const leveledSpells = allSpells
    .filter((s) => s.level > 0 && leveledSpellIds.includes(s.id))
    .sort((a, b) => a.level - b.level || a.name.localeCompare(b.name));

  function toggleSpell(id: string) {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  }

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
              <StatCell label="Ability" value={derived.spellcastingAbility.toUpperCase()} />
              <StatCell
                label="Spell Save DC"
                value={String(derived.spellSaveDC ?? "—")}
                breakdown={derived.spellSaveDCBreakdown}
                hasOverride={!!(character.data.overrides?.spellSaveDC !== undefined || character.data.otherModifiers?.spellSaveDC)}
                onOpen={(bd) => setActiveBreakdown({
                  label: "Spell Save DC", breakdown: bd, mode: "absolute", statKey: "spellSaveDC",
                  currentOtherMod: character.data.otherModifiers?.spellSaveDC ?? 0,
                  currentOverride: character.data.overrides?.spellSaveDC ?? null,
                })}
              />
              <StatCell
                label="Spell Attack"
                value={signedMod(derived.spellAttackBonus ?? 0)}
                breakdown={derived.spellAttackBonusBreakdown}
                hasOverride={!!(character.data.overrides?.spellAttackBonus !== undefined || character.data.otherModifiers?.spellAttackBonus)}
                onOpen={(bd) => setActiveBreakdown({
                  label: "Spell Attack Bonus", breakdown: bd, mode: "modifier", statKey: "spellAttackBonus",
                  currentOtherMod: character.data.otherModifiers?.spellAttackBonus ?? 0,
                  currentOverride: character.data.overrides?.spellAttackBonus ?? null,
                })}
              />
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
            <ul className="space-y-1.5">
              {cantrips.map((spell) => (
                <li key={spell.id}>
                  <SpellExpandCard
                    spell={spell}
                    expanded={expandedIds.has(spell.id)}
                    onToggle={() => toggleSpell(spell.id)}
                  />
                </li>
              ))}
            </ul>
          </SectionCard>
        )}

        {/* Leveled spells */}
        {leveledSpells.length > 0 ? (
          <SectionCard title={isPrepared ? "Prepared Spells" : "Known Spells"}>
            <ul className="space-y-1.5">
              {leveledSpells.map((spell) => (
                <li key={spell.id}>
                  <SpellExpandCard
                    spell={spell}
                    expanded={expandedIds.has(spell.id)}
                    onToggle={() => toggleSpell(spell.id)}
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

        {/* Domain / oath spells */}
        {domainSpells.length > 0 && (
          <SectionCard title={domainSectionTitle}>
            <p className="text-xs text-stone-500 mb-2">Always prepared — don't count against your limit.</p>
            <ul className="space-y-1.5">
              {domainSpells.map((spell) => (
                <li key={spell.id}>
                  <SpellExpandCard
                    spell={spell}
                    expanded={expandedIds.has(spell.id)}
                    onToggle={() => toggleSpell(spell.id)}
                  />
                </li>
              ))}
            </ul>
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

      {activeBreakdown && (
        <StatPopover
          label={activeBreakdown.label}
          breakdown={activeBreakdown.breakdown}
          mode={activeBreakdown.mode}
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

// ── Sub-components ────────────────────────────────────────────────────────────

function SpellExpandCard({ spell, expanded, onToggle }: { spell: DisplaySpell; expanded: boolean; onToggle: () => void }) {
  const htmlDesc = spell.description ? cleanHtmlBrowse(spell.description) : null;

  return (
    <ExpandableCard
      expanded={expanded}
      onToggle={onToggle}
      header={
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm font-medium text-stone-100">{spell.name}</span>
          {spell.level > 0 && (
            <span className="text-[10px] uppercase tracking-widest text-stone-500 font-medium">
              L{spell.level}
            </span>
          )}
          <span className="text-[10px] uppercase tracking-widest text-stone-600">{spell.school}</span>
          {spell.concentration && (
            <span className="text-[10px] text-violet-400">Conc.</span>
          )}
          {spell.ritual && (
            <span className="text-[10px] text-emerald-500">Ritual</span>
          )}
        </div>
      }
    >
      <p className="text-xs text-stone-500 mb-2">
        {spell.castingTime} · {spell.range} · {spell.duration}
        {spell.components && ` · ${spell.components}`}
      </p>
      {htmlDesc ? (
        <div
          className="aurora-content text-xs text-stone-300 leading-relaxed"
          dangerouslySetInnerHTML={{ __html: htmlDesc }}
        />
      ) : (
        <p className="text-xs text-stone-600 italic">No description available.</p>
      )}
    </ExpandableCard>
  );
}

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

interface StatCellProps {
  label: string;
  value: string;
  breakdown?: StatBreakdown;
  hasOverride?: boolean;
  onOpen?: (bd: StatBreakdown) => void;
}

function StatCell({ label, value, breakdown, hasOverride, onOpen }: StatCellProps) {
  if (breakdown && onOpen) {
    return (
      <button
        onClick={() => onOpen(breakdown)}
        className="relative flex flex-col items-center gap-0.5 rounded-lg p-1 -m-1 hover:bg-stone-800 transition-colors"
        aria-label={`${label}: ${value}. Tap for breakdown.`}
      >
        {hasOverride && (
          <span className="absolute top-0 right-0 w-1.5 h-1.5 rounded-full bg-amber-400" aria-hidden />
        )}
        <span className="text-xs text-stone-500">{label}</span>
        <span className="text-lg font-semibold text-stone-100">{value}</span>
      </button>
    );
  }
  return (
    <div className="flex flex-col items-center gap-0.5">
      <span className="text-xs text-stone-500">{label}</span>
      <span className="text-lg font-semibold text-stone-100">{value}</span>
    </div>
  );
}
