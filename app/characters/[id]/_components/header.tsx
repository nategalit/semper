"use client";

import { useState, useEffect, useRef, useTransition } from "react";
import Link from "next/link";
import { toggleInspiration, renameCharacter } from "@/app/actions/characters";
import { signedMod } from "@/lib/character/calc";
import type { Character } from "@/lib/types/character";
import type { DerivedStats, StatBreakdown } from "@/lib/character/calc";
import type { OverridableStatKey } from "@/lib/types/character";
import { HpDialog } from "./panels/hp-dialog";
import { ConditionPicker } from "./panels/condition-picker";
import { StatPopover } from "./shared/stat-popover";

interface Props {
  character: Character;
  derived: DerivedStats;
  onLevelTap?: () => void;
}

interface ActiveBreakdown {
  label: string;
  breakdown: StatBreakdown;
  mode: "modifier" | "absolute";
  totalSuffix?: string;
  statKey: OverridableStatKey;
  currentOtherMod: number;
  currentOverride: number | null;
}

export function Header({ character, derived, onLevelTap }: Props) {
  const [inspirePending, startInspireTransition] = useTransition();
  const [, startRenameTransition] = useTransition();
  const [hpOpen, setHpOpen] = useState(false);
  const [conditionsOpen, setConditionsOpen] = useState(false);
  const [activeBreakdown, setActiveBreakdown] = useState<ActiveBreakdown | null>(null);
  const [editingName, setEditingName] = useState(false);
  const [nameInput, setNameInput] = useState(character.name);
  const [displayName, setDisplayName] = useState(character.name);
  const nameInputRef = useRef<HTMLInputElement>(null);
  const { data } = character;

  useEffect(() => { setDisplayName(character.name); }, [character.name]);

  function startEditName() {
    setNameInput(displayName);
    setEditingName(true);
    setTimeout(() => nameInputRef.current?.select(), 0);
  }

  function saveName() {
    const trimmed = nameInput.trim();
    setEditingName(false);
    if (!trimmed || trimmed === displayName) return;
    setDisplayName(trimmed);
    startRenameTransition(async () => {
      await renameCharacter(character.id, trimmed);
    });
  }
  const conditions = data.conditions ?? [];
  const effectiveMaxHp = derived.maxHp;

  function handleInspiration() {
    startInspireTransition(async () => {
      await toggleInspiration(character.id);
    });
  }

  const hasSubtitle = character.level || derived.speed;

  return (
    <>
      <header className="sticky top-0 z-30 bg-stone-900 border-b border-stone-800 px-4 py-3">
        {/* Back nav */}
        <div className="max-w-4xl mx-auto mb-1">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-1 text-[11px] text-stone-600 hover:text-stone-400 transition-colors"
          >
            ‹ Dashboard
          </Link>
        </div>

        {/* Name + inspiration row */}
        <div className="flex items-start justify-between gap-3 max-w-4xl mx-auto">
          <div className="min-w-0">
            {editingName ? (
              <input
                ref={nameInputRef}
                type="text"
                value={nameInput}
                onChange={(e) => setNameInput(e.target.value)}
                onBlur={saveName}
                onKeyDown={(e) => {
                  if (e.key === "Enter") { e.preventDefault(); saveName(); }
                  if (e.key === "Escape") { setEditingName(false); }
                }}
                className="w-full text-xl font-bold bg-transparent border-b border-amber-500 text-stone-100
                  focus:outline-none focus:border-amber-400 pb-0.5"
                aria-label="Character name"
              />
            ) : (
              <button
                onClick={startEditName}
                className="text-xl font-bold text-stone-100 truncate max-w-full text-left
                  hover:text-amber-400 transition-colors"
                aria-label={`Character name: ${displayName}. Tap to edit.`}
              >
                {displayName}
              </button>
            )}
            {hasSubtitle && (
              <div className="text-xs text-stone-400 mt-0.5">
                {character.level && onLevelTap ? (
                  <button
                    onClick={onLevelTap}
                    className="underline underline-offset-2 decoration-stone-600 hover:text-stone-200
                      hover:decoration-stone-400 transition-colors"
                    title="Tap to change level"
                  >
                    Level {character.level}
                  </button>
                ) : (
                  `Level ${character.level}`
                )}
                {derived.speed ? ` · Speed ${derived.speed} ft.` : ""}
              </div>
            )}
          </div>

          {/* Inspiration toggle — 44×44 tap target */}
          <button
            onClick={handleInspiration}
            disabled={inspirePending}
            title={data.inspiration ? "Inspired — tap to remove" : "Tap to gain inspiration"}
            className={`shrink-0 w-11 h-11 rounded-full border-2 flex items-center justify-center transition-colors disabled:opacity-50 ${
              data.inspiration
                ? "border-amber-400 bg-amber-400/20 text-amber-400"
                : "border-stone-600 text-stone-600 hover:border-stone-400 hover:text-stone-400"
            }`}
          >
            ★
          </button>
        </div>

        {/* Stat chips row */}
        <div className="flex flex-wrap gap-x-4 gap-y-2 mt-3 max-w-4xl mx-auto">
          {/* HP chip — tappable, min 44×44 */}
          <button
            onClick={() => setHpOpen(true)}
            className="flex flex-col items-center min-w-[44px] min-h-[44px] justify-center rounded-lg px-2 -mx-2
              hover:bg-stone-800 active:bg-stone-700 transition-colors"
            aria-label={`HP: ${data.currentHp} of ${effectiveMaxHp}. Tap to adjust.`}
          >
            <span className="text-base font-bold leading-tight text-amber-400 tabular-nums">
              {data.currentHp}/{effectiveMaxHp}
              {data.tempHp > 0 && (
                <span className="text-sky-400 ml-1">+{data.tempHp}</span>
              )}
            </span>
            <span className="text-[10px] text-stone-500 uppercase tracking-wide">HP</span>
          </button>

          <StatChip
            label="AC"
            value={String(derived.armorClass)}
            breakdown={derived.acBreakdown}
            hasOverride={!!(data.overrides?.ac !== undefined || data.otherModifiers?.ac)}
            onOpen={(bd) => setActiveBreakdown({
              label: "Armor Class", breakdown: bd, mode: "absolute",
              statKey: "ac", currentOtherMod: data.otherModifiers?.ac ?? 0, currentOverride: data.overrides?.ac ?? null,
            })}
          />
          <StatChip label="Prof" value={signedMod(derived.proficiencyBonus)} />
          <StatChip
            label="Init"
            value={signedMod(derived.initiative)}
            breakdown={derived.initiativeBreakdown}
            hasOverride={!!(data.overrides?.initiative !== undefined || data.otherModifiers?.initiative)}
            onOpen={(bd) => setActiveBreakdown({
              label: "Initiative", breakdown: bd, mode: "modifier",
              statKey: "initiative", currentOtherMod: data.otherModifiers?.initiative ?? 0, currentOverride: data.overrides?.initiative ?? null,
            })}
          />
          <StatChip
            label="Speed"
            value={`${derived.speed} ft`}
            breakdown={derived.speedBreakdown}
            hasOverride={!!(data.overrides?.speed !== undefined || data.otherModifiers?.speed)}
            onOpen={(bd) => setActiveBreakdown({
              label: "Speed", breakdown: bd, mode: "absolute", totalSuffix: " ft",
              statKey: "speed", currentOtherMod: data.otherModifiers?.speed ?? 0, currentOverride: data.overrides?.speed ?? null,
            })}
          />
          <StatChip
            label="Perc."
            value={String(derived.passivePerception)}
            breakdown={derived.passivePerceptionBreakdown}
            hasOverride={!!(data.overrides?.passivePerception !== undefined || data.otherModifiers?.passivePerception)}
            onOpen={(bd) => setActiveBreakdown({
              label: "Passive Perception", breakdown: bd, mode: "absolute",
              statKey: "passivePerception", currentOtherMod: data.otherModifiers?.passivePerception ?? 0, currentOverride: data.overrides?.passivePerception ?? null,
            })}
          />
        </div>

        {/* Active conditions row — tappable */}
        <div className="flex flex-wrap gap-2 mt-2 max-w-4xl mx-auto">
          {conditions.map((c) => (
            <button
              key={c}
              onClick={() => setConditionsOpen(true)}
              className="text-xs font-medium px-2 py-0.5 rounded-full bg-red-900/60 border border-red-700 text-red-300
                hover:bg-red-900/80 active:scale-95 transition-all"
            >
              {c}
            </button>
          ))}
          <button
            onClick={() => setConditionsOpen(true)}
            aria-label="Manage conditions"
            className={`text-xs font-medium px-2 py-0.5 rounded-full border transition-colors ${
              conditions.length > 0
                ? "border-stone-700 text-stone-600 hover:text-stone-400 hover:border-stone-500"
                : "border-dashed border-stone-700 text-stone-600 hover:text-stone-400 hover:border-stone-500"
            }`}
          >
            {conditions.length === 0 ? "+ condition" : "+"}
          </button>
        </div>
      </header>

      <HpDialog open={hpOpen} onClose={() => setHpOpen(false)} effectiveMaxHp={effectiveMaxHp} />
      <ConditionPicker open={conditionsOpen} onClose={() => setConditionsOpen(false)} />

      {activeBreakdown && (
        <StatPopover
          label={activeBreakdown.label}
          breakdown={activeBreakdown.breakdown}
          mode={activeBreakdown.mode}
          totalSuffix={activeBreakdown.totalSuffix}
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

interface StatChipProps {
  label: string;
  value: string;
  breakdown?: StatBreakdown;
  hasOverride?: boolean;
  onOpen?: (breakdown: StatBreakdown) => void;
}

function StatChip({ label, value, breakdown, hasOverride, onOpen }: StatChipProps) {
  if (breakdown && onOpen) {
    return (
      <button
        onClick={() => onOpen(breakdown)}
        className="relative flex flex-col items-center min-w-[44px] min-h-[44px] justify-center rounded-lg px-2 -mx-2
          hover:bg-stone-800 active:bg-stone-700 transition-colors"
        aria-label={`${label}: ${value}. Tap for breakdown.`}
      >
        {hasOverride && (
          <span className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-amber-400" aria-hidden />
        )}
        <span className="text-base font-bold leading-tight text-stone-100">{value}</span>
        <span className="text-[10px] text-stone-500 uppercase tracking-wide">{label}</span>
      </button>
    );
  }
  return (
    <div className="flex flex-col items-center min-w-[44px]">
      <span className="text-base font-bold leading-tight text-stone-100">{value}</span>
      <span className="text-[10px] text-stone-500 uppercase tracking-wide">{label}</span>
    </div>
  );
}

