"use client";

import {
  useWizardStore,
  STANDARD_ARRAY,
  POINT_BUY_COST,
  POINT_BUY_BUDGET,
  type AbilityMethod,
} from "@/lib/stores/wizard-store";
import type { AbilityKey, SrdRace } from "@/lib/content/srd";

const ABILITY_LABELS: Record<AbilityKey, string> = {
  str: "Strength",
  dex: "Dexterity",
  con: "Constitution",
  int: "Intelligence",
  wis: "Wisdom",
  cha: "Charisma",
};
const ABILITIES: AbilityKey[] = ["str", "dex", "con", "int", "wis", "cha"];

interface Props {
  races: SrdRace[];
}

export function StepAbilities({ races }: Props) {
  const {
    raceId, subraceId,
    abilityMethod,
    abilityScores,
    arrayAssignments,
    setAbilityMethod,
    setAbilityScore,
    setArrayAssignment,
    pointBuySpent,
    flexibleAbilityPicks,
    toggleFlexiblePick,
    computedAbilityScores,
  } = useWizardStore();

  const spent = pointBuySpent();
  const remaining = POINT_BUY_BUDGET - spent;

  const race = races.find((r) => r.id === raceId);
  const subrace = race?.subraces.find((s) => s.id === subraceId);
  const fixedBonuses = { ...(race?.abilityScoreBonuses ?? {}), ...(subrace?.abilityScoreBonuses ?? {}) } as Partial<Record<AbilityKey, number>>;
  const hasRacialBonuses = Object.keys(fixedBonuses).length > 0 || !!race?.flexibleBonuses;

  const base = computedAbilityScores();
  const totals = ABILITIES.reduce((acc, k) => {
    const flexAmt = flexibleAbilityPicks.includes(k) ? (race?.flexibleBonuses?.amount ?? 1) : 0;
    acc[k] = base[k] + (fixedBonuses[k] ?? 0) + flexAmt;
    return acc;
  }, {} as Record<AbilityKey, number>);

  return (
    <div>
      <h2 className="text-2xl font-bold mb-1">Set ability scores</h2>
      <p className="text-stone-400 mb-6">Choose how to generate your six core ability scores.</p>

      {/* Method toggle */}
      <div className="flex gap-2 mb-8">
        {(["standard-array", "point-buy"] as AbilityMethod[]).map((m) => (
          <button
            key={m}
            onClick={() => setAbilityMethod(m)}
            className={`rounded-lg px-4 py-1.5 text-sm font-medium transition-colors ${
              abilityMethod === m
                ? "bg-amber-600 text-stone-950"
                : "border border-stone-700 text-stone-400 hover:text-stone-200"
            }`}
          >
            {m === "standard-array" ? "Standard Array" : "Point Buy"}
          </button>
        ))}
      </div>

      {abilityMethod === "standard-array" ? (
        <StandardArrayPanel
          assignments={arrayAssignments}
          onAssign={setArrayAssignment}
        />
      ) : (
        <PointBuyPanel
          scores={abilityScores}
          remaining={remaining}
          onSet={setAbilityScore}
        />
      )}

      {hasRacialBonuses && (
        <div className="mt-8 rounded-lg border border-stone-800 bg-stone-900/50 p-4">
          <p className="text-xs font-medium text-stone-400 uppercase tracking-wider mb-3">
            Racial bonuses{race ? ` — ${race.name}` : ""}
          </p>

          {/* Fixed bonuses */}
          {Object.keys(fixedBonuses).length > 0 && (
            <div className="flex flex-wrap gap-2 mb-3">
              {ABILITIES.filter((k) => fixedBonuses[k]).map((k) => (
                <span key={k} className="text-xs rounded-full bg-stone-800 px-2 py-0.5 text-amber-300">
                  +{fixedBonuses[k]} {k.toUpperCase()} (fixed)
                </span>
              ))}
            </div>
          )}

          {/* Flexible picks */}
          {race?.flexibleBonuses && (
            <div>
              <p className="text-xs text-stone-400 mb-2">
                Choose {race.flexibleBonuses.count} abilities to receive +{race.flexibleBonuses.amount} each
                ({flexibleAbilityPicks.length}/{race.flexibleBonuses.count} chosen):
              </p>
              <div className="flex flex-wrap gap-2">
                {ABILITIES.map((k) => {
                  const isFixed = !!fixedBonuses[k];
                  const isPicked = flexibleAbilityPicks.includes(k);
                  const isFull = flexibleAbilityPicks.length >= race.flexibleBonuses!.count && !isPicked;
                  return (
                    <button
                      key={k}
                      onClick={() => !isFixed && toggleFlexiblePick(k, race.flexibleBonuses!.count)}
                      disabled={isFixed || isFull}
                      className={`rounded-lg border px-3 py-1 text-xs font-medium transition-colors ${
                        isPicked
                          ? "border-amber-500 bg-amber-900/30 text-amber-300"
                          : isFixed
                          ? "border-stone-700 bg-stone-800/50 text-stone-600 cursor-not-allowed"
                          : isFull
                          ? "border-stone-800 text-stone-600 cursor-not-allowed"
                          : "border-stone-700 text-stone-300 hover:border-stone-500"
                      }`}
                    >
                      +{race.flexibleBonuses!.amount} {k.toUpperCase()}
                      {isFixed && " (fixed)"}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Totals row */}
          <div className="mt-4 pt-3 border-t border-stone-800">
            <p className="text-xs text-stone-500 mb-2">Final scores (base + racial)</p>
            <div className="flex flex-wrap gap-3">
              {ABILITIES.map((k) => (
                <div key={k} className="text-center">
                  <p className="text-xs text-stone-500">{k.toUpperCase()}</p>
                  <p className={`text-base font-bold ${totals[k] !== base[k] ? "text-amber-300" : "text-stone-300"}`}>
                    {totals[k]}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function StandardArrayPanel({
  assignments,
  onAssign,
}: {
  assignments: Record<number, AbilityKey | "">;
  onAssign: (index: number, key: AbilityKey | "") => void;
}) {
  const assignedKeys = new Set(Object.values(assignments).filter(Boolean));

  return (
    <div>
      <p className="text-sm text-stone-400 mb-4">
        Assign each value to one ability. Values: {[...STANDARD_ARRAY].join(", ")}.
      </p>
      <div className="space-y-3">
        {([...STANDARD_ARRAY] as number[]).map((value, i) => (
          <div key={i} className="flex items-center gap-4">
            <span className="w-8 text-center font-bold text-amber-300">{value}</span>
            <select
              value={assignments[i]}
              onChange={(e) => onAssign(i, e.target.value as AbilityKey | "")}
              className="flex-1 rounded-lg border border-stone-700 bg-stone-900 px-3 py-1.5 text-sm text-stone-100 focus:border-amber-500 focus:outline-none"
            >
              <option value="">— assign to —</option>
              {ABILITIES.map((key) => (
                <option
                  key={key}
                  value={key}
                  disabled={assignedKeys.has(key) && assignments[i] !== key}
                >
                  {ABILITY_LABELS[key]}
                </option>
              ))}
            </select>
          </div>
        ))}
      </div>
    </div>
  );
}

function PointBuyPanel({
  scores,
  remaining,
  onSet,
}: {
  scores: Record<AbilityKey, number>;
  remaining: number;
  onSet: (key: AbilityKey, value: number) => void;
}) {
  return (
    <div>
      <p className="text-sm text-stone-400 mb-1">
        You have <span className={remaining < 0 ? "text-red-400 font-bold" : "text-amber-300 font-semibold"}>{remaining}</span> points remaining.
      </p>
      <p className="text-xs text-stone-500 mb-5">Scores range from 8–15. Each point above 13 costs 2 points.</p>
      <div className="space-y-3">
        {ABILITIES.map((key) => {
          const current = scores[key];
          const cost = POINT_BUY_COST[current] ?? 0;
          return (
            <div key={key} className="flex items-center gap-4">
              <span className="w-28 text-sm text-stone-300">{ABILITY_LABELS[key]}</span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => onSet(key, Math.max(8, current - 1))}
                  disabled={current <= 8}
                  className="w-7 h-7 rounded border border-stone-700 text-stone-300 hover:border-stone-500 disabled:opacity-30 text-lg leading-none"
                >
                  −
                </button>
                <span className="w-8 text-center font-bold text-amber-300">{current}</span>
                <button
                  onClick={() => {
                    const nextCost = POINT_BUY_COST[current + 1] ?? 99;
                    const deltaCost = nextCost - cost;
                    if (current < 15 && remaining >= deltaCost) onSet(key, current + 1);
                  }}
                  disabled={current >= 15 || remaining < (POINT_BUY_COST[current + 1] ?? 99) - cost}
                  className="w-7 h-7 rounded border border-stone-700 text-stone-300 hover:border-stone-500 disabled:opacity-30 text-lg leading-none"
                >
                  +
                </button>
              </div>
              <span className="text-xs text-stone-500">cost: {cost}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
