"use client";

import { useMutation } from "@/lib/character/mutation-context";
import { setDeathSaves } from "@/app/actions/characters";
import type { DerivedStats, WeaponAttack } from "@/lib/character/calc";
import type { SrdClass } from "@/lib/content/srd";
import { signedMod } from "@/lib/character/calc";
import type { CharacterData } from "@/lib/types/character";
import { SectionCard } from "../shared/section-card";

interface Props {
  derived: DerivedStats;
  srdClass: SrdClass | undefined;
}

export function TabActions({ derived }: Props) {
  const { character, mutate } = useMutation();
  const { deathSaves } = character.data;
  const unarmedAttack = derived.abilityMods.str + derived.proficiencyBonus;

  function handleSaveClick(type: "successes" | "failures", wasFilled: boolean) {
    const current = deathSaves[type];
    const next = wasFilled ? Math.max(0, current - 1) : Math.min(3, current + 1);
    const patch: Partial<CharacterData> = {
      deathSaves: { ...deathSaves, [type]: next },
    };
    const newSuccesses = type === "successes" ? next : deathSaves.successes;
    const newFailures  = type === "failures"  ? next : deathSaves.failures;
    mutate(patch, () => setDeathSaves(character.id, newSuccesses, newFailures));
  }

  return (
    <>
    <div className="space-y-4">
      <SectionCard title="Attacks">
        {/* Equipped weapon attacks */}
        {derived.weaponAttacks.map((atk) => (
          <AttackRow key={`${atk.itemId}-${atk.label ?? ""}`} attack={atk} />
        ))}
        {/* Unarmed strike — always shown */}
        <div className="flex items-center justify-between py-1">
          <div>
            <p className="text-sm font-medium text-stone-100">Unarmed Strike</p>
            <p className="text-xs text-stone-400">Melee · 1 + STR bludgeoning</p>
          </div>
          <div className="text-right">
            <p className="text-sm font-semibold text-stone-100">{signedMod(unarmedAttack)}</p>
            <p className="text-xs text-stone-500">to hit</p>
          </div>
        </div>
        {derived.weaponAttacks.length === 0 && (
          <p className="text-xs text-stone-600 mt-1">
            Equip a weapon in Inventory to see weapon attacks here.
          </p>
        )}
      </SectionCard>

      <SectionCard title="Combat Stats">
        <div className="grid grid-cols-2 gap-3">
          <StatRow label="Armor Class" value={String(derived.armorClass)} />
          <StatRow label="Initiative"   value={signedMod(derived.initiative)} />
          <StatRow label="Speed"        value={`${derived.speed} ft.`} />
          <StatRow label="Prof. Bonus"  value={signedMod(derived.proficiencyBonus)} />
        </div>
      </SectionCard>

      {/* Interactive death saves */}
      <SectionCard title="Death Saves">
        <div className="flex gap-8">
          <SaveDots
            label="Successes"
            count={deathSaves.successes}
            dotColor="bg-emerald-400 border-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.5)]"
            emptyColor="border-stone-600"
            onDotClick={(wasFilled) => handleSaveClick("successes", wasFilled)}
          />
          <SaveDots
            label="Failures"
            count={deathSaves.failures}
            dotColor="bg-red-500 border-red-500 shadow-[0_0_6px_rgba(239,68,68,0.5)]"
            emptyColor="border-stone-600"
            onDotClick={(wasFilled) => handleSaveClick("failures", wasFilled)}
          />
        </div>
        <p className="text-xs text-stone-600 mt-3">Tap dot to add · tap filled dot to remove</p>
      </SectionCard>
    </div>

  </>
  );
}

function AttackRow({ attack }: { attack: WeaponAttack }) {
  const rangeText = attack.range
    ? ` · ${attack.range.normal}/${attack.range.long} ft.`
    : "";
  const typeLabel = attack.attackType === "ranged" ? "Ranged" : "Melee";
  const dmgBonus = attack.damageBonus !== 0 ? ` ${signedMod(attack.damageBonus)}` : "";
  return (
    <div className="flex items-center justify-between py-1 border-b border-stone-800 last:border-0">
      <div>
        <p className="text-sm font-medium text-stone-100">
          {attack.itemName}{(attack.enhancement ?? 0) > 0 ? ` +${attack.enhancement}` : ""}
          {attack.label && (
            <span className="text-stone-500 font-normal text-xs ml-1">{attack.label}</span>
          )}
        </p>
        <p className="text-xs text-stone-400">
          {typeLabel}{rangeText} · {attack.damageDice}{dmgBonus} {attack.damageType}
          {!attack.proficient && <span className="text-stone-600 ml-1">(no prof.)</span>}
        </p>
      </div>
      <div className="text-right">
        <p className="text-sm font-semibold text-stone-100">{signedMod(attack.attackBonus)}</p>
        <p className="text-xs text-stone-500">to hit</p>
      </div>
    </div>
  );
}

function StatRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col">
      <span className="text-xs text-stone-500">{label}</span>
      <span className="text-base font-semibold text-stone-100">{value}</span>
    </div>
  );
}

interface SaveDotsProps {
  label: string;
  count: number;
  dotColor: string;
  emptyColor: string;
  onDotClick: (wasFilled: boolean) => void;
}

function SaveDots({ label, count, dotColor, emptyColor, onDotClick }: SaveDotsProps) {
  return (
    <div>
      <p className="text-xs text-stone-500 mb-1">{label}</p>
      <div className="flex gap-0">
        {Array.from({ length: 3 }).map((_, i) => {
          const filled = i < count;
          return (
            <button
              key={i}
              onClick={() => onDotClick(filled)}
              aria-label={filled ? `Remove ${label.toLowerCase()} ${i + 1}` : `Add ${label.toLowerCase()}`}
              className="w-11 h-11 flex items-center justify-center active:scale-90 transition-transform"
            >
              <span className={`w-5 h-5 rounded-full border-2 transition-all duration-200 ${
                filled ? dotColor : emptyColor
              }`} />
            </button>
          );
        })}
      </div>
    </div>
  );
}
