"use client";

import { useWizardStore } from "@/lib/stores/wizard-store";
import { SRD_SUBCLASSES } from "@/lib/content/srd";
import type { SrdRace, SrdClass, SrdBackground, AbilityKey } from "@/lib/content/srd";

const ABILITY_LABELS: Record<AbilityKey, string> = {
  str: "STR", dex: "DEX", con: "CON", int: "INT", wis: "WIS", cha: "CHA",
};
const ABILITIES: AbilityKey[] = ["str", "dex", "con", "int", "wis", "cha"];

interface Props {
  races: SrdRace[];
  classes: SrdClass[];
  backgrounds: SrdBackground[];
}

export function StepReview({ races, classes, backgrounds }: Props) {
  const { name, raceId, subraceId, classId, backgroundId, wizardSubclassId, computedAbilityScores } =
    useWizardStore();

  const race = races.find((r) => r.id === raceId);
  const subrace = race?.subraces.find((s) => s.id === subraceId);
  const srdClass = classes.find((c) => `${c.id}:${c.sourceLabel ?? ""}` === classId);
  const background = backgrounds.find((b) => `${b.id}:${b.sourceLabel ?? ""}` === backgroundId);
  const subclass = SRD_SUBCLASSES.find((s) => s.id === wizardSubclassId);

  const base = computedAbilityScores();
  const raceBonus = race?.abilityScoreBonuses ?? {};
  const subraceBonus = subrace?.abilityScoreBonuses ?? {};

  const finalScores = ABILITIES.reduce(
    (acc, k) => ({
      ...acc,
      [k]: base[k] + (raceBonus[k] ?? 0) + (subraceBonus[k] ?? 0),
    }),
    {} as Record<AbilityKey, number>
  );

  const conMod = Math.floor((finalScores.con - 10) / 2);
  const hitDie = srdClass?.hitDie ?? 8;
  const maxHp = hitDie + conMod;

  return (
    <div>
      <h2 className="text-2xl font-bold mb-1">Review &amp; create</h2>
      <p className="text-stone-400 mb-6">Looks good? Hit "Create character" to save.</p>

      <div className="space-y-4">
        <Row label="Name">{name || <Missing />}</Row>
        <Row label="Race">
          {race ? (
            <span>{race.name}{subrace ? ` (${subrace.name})` : ""}</span>
          ) : (
            <Missing />
          )}
        </Row>
        <Row label="Class">{srdClass?.name ?? <Missing />}</Row>
        {subclass && <Row label="Subclass">{subclass.name}</Row>}
        <Row label="Background">{background?.name ?? <Missing />}</Row>
        <Row label="HP at level 1">
          <span>{maxHp} (d{hitDie} + {conMod >= 0 ? "+" : ""}{conMod} CON)</span>
        </Row>

        <div className="rounded-lg border border-stone-800 bg-stone-900/50 p-4">
          <p className="text-xs font-medium text-stone-400 mb-3">ABILITY SCORES</p>
          <div className="grid grid-cols-3 gap-3">
            {ABILITIES.map((k) => {
              const bonus = (raceBonus[k] ?? 0) + (subraceBonus[k] ?? 0);
              return (
                <div key={k} className="text-center">
                  <p className="text-xs text-stone-500">{ABILITY_LABELS[k]}</p>
                  <p className="text-2xl font-bold text-amber-300">{finalScores[k]}</p>
                  {bonus > 0 && (
                    <p className="text-xs text-stone-500">
                      {base[k]} +{bonus}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-baseline gap-3">
      <span className="text-sm text-stone-500 w-24 shrink-0">{label}</span>
      <span className="text-stone-100 font-medium">{children}</span>
    </div>
  );
}

function Missing() {
  return <span className="text-red-400 text-sm">Not selected</span>;
}
