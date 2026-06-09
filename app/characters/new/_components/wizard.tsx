"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useWizardStore, STEP_LABELS } from "@/lib/stores/wizard-store";
import type { WizardStep } from "@/lib/stores/wizard-store";
import { createCharacter } from "@/app/actions/characters";
import type { SrdRace, SrdClass, SrdBackground, SrdSubclass, AbilityKey } from "@/lib/content/srd";
import { FIGHTING_STYLES, FIGHTING_STYLE_BY_CLASS } from "@/lib/content/srd";
import type { FeatureEntry, FightingStyleEntry } from "@/app/actions/content";
import { DEFAULT_CHARACTER_DATA } from "@/lib/types/character";
import type { LevelChoiceRecord } from "@/lib/types/character";
import { isEditionMatch } from "@/lib/content/edition-filter";
import { StepName } from "./step-name";
import { StepEdition } from "./step-edition";
import { StepRace } from "./step-race";
import { StepSubrace } from "./step-subrace";
import { StepClass } from "./step-class";
import { StepAbilities } from "./step-abilities";
import { StepBackground } from "./step-background";
import { StepSkills } from "./step-skills";
import { StepSubclass } from "./step-subclass";
import { StepClassFeatures } from "./step-class-features";
import type { FightingStyleOption } from "./step-class-features";
import { StepReview } from "./step-review";

interface Props {
  races: SrdRace[];
  classes: SrdClass[];
  subclasses: SrdSubclass[];
  backgrounds: SrdBackground[];
  featureMap: Map<string, FeatureEntry>;
  importedFightingStyles: FightingStyleEntry[];
}

export function CharacterWizard({ races, classes, subclasses, backgrounds, featureMap, importedFightingStyles }: Props) {
  const router = useRouter();
  const {
    step, setStep,
    name, edition, raceId, subraceId, classId, backgroundId, classSkills,
    wizardSubclassId, wizardFightingStyleId,
    flexibleAbilityPicks, computedAbilityScores, reset,
  } = useWizardStore();

  useEffect(() => { reset(); }, []);

  const filteredRaces = races.filter((r) => isEditionMatch(r.sourceLabel, edition));
  const filteredClasses = classes.filter((c) => isEditionMatch(c.sourceLabel, edition));
  const filteredBackgrounds = backgrounds.filter((b) => isEditionMatch(b.sourceLabel, edition));
  const filteredSubclasses = subclasses.filter((s) => isEditionMatch(s.sourceLabel, edition));

  const selectedRace = filteredRaces.find((r) => r.id === raceId);
  const raceHasSubraces = (selectedRace?.subraces.length ?? 0) > 0;

  // Resolve selected class (classId stored as "{id}:{sourceLabel}").
  const selectedClass = filteredClasses.find((c) => `${c.id}:${c.sourceLabel ?? ""}` === classId);
  // "class-features" step shown when the class grants Fighting Style at level 1.
  const classFightingStyleLevel = FIGHTING_STYLE_BY_CLASS[selectedClass?.id ?? ""] ?? 0;
  const needsClassFeatureStep = classFightingStyleLevel === 1;

  // Merged fighting styles: SRD base 6 + Aurora extras, deduped by name.
  const srdNameSet = new Set(FIGHTING_STYLES.map((s) => s.name.toLowerCase()));
  const allFightingStyles: FightingStyleOption[] = [
    ...FIGHTING_STYLES.map((s) => ({ ...s, sourceLabel: "SRD" })),
    ...importedFightingStyles.filter((s) => !srdNameSet.has(s.name.toLowerCase())),
  ];

  // Dynamic step list — "subrace" and "class-features" conditionally inserted.
  const activeSteps: WizardStep[] = [
    "name", "edition", "race",
    ...(raceHasSubraces ? (["subrace"] as WizardStep[]) : []),
    "class", "abilities", "background", "skills", "subclass",
    ...(needsClassFeatureStep ? (["class-features"] as WizardStep[]) : []),
    "review",
  ];

  const stepIndex = activeSteps.indexOf(step);

  // Guard: if we land on "subrace" but the race no longer has subraces, go back to "race".
  useEffect(() => {
    if (step === "subrace" && !raceHasSubraces) setStep("race");
  }, [step, raceHasSubraces, setStep]);

  function handleNext() {
    if (stepIndex < activeSteps.length - 1) setStep(activeSteps[stepIndex + 1]);
  }

  function handlePrev() {
    if (stepIndex > 0) setStep(activeSteps[stepIndex - 1]);
  }

  async function handleFinish() {
    const t0 = performance.now();
    const race = races.find((r) => r.id === raceId);
    const srdClass = classes.find((c) => `${c.id}:${c.sourceLabel ?? ""}` === classId);
    const srdBackground = backgrounds.find((b) => `${b.id}:${b.sourceLabel ?? ""}` === backgroundId);
    const subrace = race?.subraces.find((s) => s.id === subraceId);

    const base = computedAbilityScores();
    const raceBonus = race?.abilityScoreBonuses ?? {};
    const subraceBonus = subrace?.abilityScoreBonuses ?? {};

    const flexibleBonus: Partial<Record<string, number>> = {};
    const flexAmt = race?.flexibleBonuses?.amount ?? 1;
    for (const k of flexibleAbilityPicks) flexibleBonus[k] = (flexibleBonus[k] ?? 0) + flexAmt;

    const finalScores = {
      str: base.str + (raceBonus.str ?? 0) + (subraceBonus.str ?? 0) + (flexibleBonus.str ?? 0),
      dex: base.dex + (raceBonus.dex ?? 0) + (subraceBonus.dex ?? 0) + (flexibleBonus.dex ?? 0),
      con: base.con + (raceBonus.con ?? 0) + (subraceBonus.con ?? 0) + (flexibleBonus.con ?? 0),
      int: base.int + (raceBonus.int ?? 0) + (subraceBonus.int ?? 0) + (flexibleBonus.int ?? 0),
      wis: base.wis + (raceBonus.wis ?? 0) + (subraceBonus.wis ?? 0) + (flexibleBonus.wis ?? 0),
      cha: base.cha + (raceBonus.cha ?? 0) + (subraceBonus.cha ?? 0) + (flexibleBonus.cha ?? 0),
    };

    const conMod = Math.floor((finalScores.con - 10) / 2);
    const hitDie = srdClass?.hitDie ?? 8;
    const maxHp = hitDie + conMod;

    const bgSkillList = srdBackground?.skillProficiencies ?? [];
    const skillProficiencies = [...new Set([...classSkills, ...bgSkillList])];

    const abilityChoices: Partial<Record<AbilityKey, number>> = {};
    for (const k of flexibleAbilityPicks) abilityChoices[k] = flexAmt;

    console.log(`[wizard] pre-submit compute: ${(performance.now() - t0).toFixed(0)}ms`);
    const l1Choice: LevelChoiceRecord | undefined = wizardFightingStyleId
      ? { hpGained: maxHp, fightingStyle: wizardFightingStyleId }
      : undefined;

    const character = await createCharacter({
      name,
      raceId: race?.id ?? undefined,
      classId: srdClass?.id ?? undefined,
      data: {
        ...DEFAULT_CHARACTER_DATA,
        abilityScores: finalScores,
        subraceId: subraceId || undefined,
        subclassId: wizardSubclassId || undefined,
        backgroundId: srdBackground?.id ?? undefined,
        maxHp,
        currentHp: maxHp,
        hitDiceTotal: 1,
        hitDiceRemaining: 1,
        skillProficiencies,
        edition,
        ...(l1Choice ? { levelChoices: { 1: l1Choice } } : {}),
        ...(race ? { resolvedRace: race } : {}),
        ...(subrace ? { resolvedSubrace: subrace } : {}),
        ...(srdClass ? { resolvedClass: srdClass } : {}),
        ...(srdBackground ? { resolvedBackground: srdBackground } : {}),
        ...(flexibleAbilityPicks.length > 0 ? { abilityChoices } : {}),
      },
    });

    console.log(`[wizard] createCharacter action returned: ${(performance.now() - t0).toFixed(0)}ms`);
    router.push(`/characters/${character.id}`);
    console.log(`[wizard] router.push called: ${(performance.now() - t0).toFixed(0)}ms`);
  }

  return (
    <div className="max-w-2xl mx-auto px-6 py-10">
      {/* Step indicator */}
      <nav className="mb-10">
        <ol className="flex items-center gap-2 flex-wrap">
          {activeSteps.map((s, i) => (
            <li key={s} className="flex items-center gap-2">
              <span
                className={`text-xs font-medium px-2 py-0.5 rounded-full transition-colors ${
                  i < stepIndex
                    ? "bg-amber-700 text-stone-100"
                    : i === stepIndex
                    ? "bg-amber-400 text-stone-950"
                    : "bg-stone-800 text-stone-500"
                }`}
              >
                {STEP_LABELS[s]}
              </span>
              {i < activeSteps.length - 1 && (
                <span className="text-stone-700">›</span>
              )}
            </li>
          ))}
        </ol>
      </nav>

      {/* Step content */}
      <div className="min-h-[420px]">
        {step === "name"       && <StepName />}
        {step === "edition"    && <StepEdition />}
        {step === "race"       && <StepRace races={filteredRaces} featureMap={featureMap} />}
        {step === "subrace"    && <StepSubrace selectedRace={selectedRace} />}
        {step === "class"      && <StepClass classes={filteredClasses} featureMap={featureMap} />}
        {step === "abilities"  && <StepAbilities races={filteredRaces} />}
        {step === "background" && <StepBackground backgrounds={filteredBackgrounds} featureMap={featureMap} />}
        {step === "skills"     && <StepSkills classes={filteredClasses} backgrounds={filteredBackgrounds} />}
        {step === "subclass"   && <StepSubclass classes={filteredClasses} subclasses={filteredSubclasses} featureMap={featureMap} />}
        {step === "class-features" && <StepClassFeatures allFightingStyles={allFightingStyles} />}
        {step === "review"     && (
          <StepReview races={filteredRaces} classes={filteredClasses} backgrounds={filteredBackgrounds} />
        )}
      </div>

      {/* Navigation */}
      <div className="mt-10 flex justify-between">
        {stepIndex > 0 ? (
          <button
            onClick={handlePrev}
            className="rounded-xl border border-stone-700 px-4 py-2 text-sm text-stone-300 hover:border-stone-500 hover:text-stone-100 transition-colors"
          >
            ← Back
          </button>
        ) : (
          <div />
        )}

        {step !== "review" ? (
          <button
            onClick={handleNext}
            disabled={!canAdvance(step, { name, raceId, subraceId, classId, backgroundId, classSkills, wizardSubclassId, wizardFightingStyleId, flexibleAbilityPicks, races: filteredRaces, classes: filteredClasses })}
            className="rounded-xl bg-amber-600 px-5 py-2 text-sm font-semibold text-stone-950 hover:bg-amber-500 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            Next →
          </button>
        ) : (
          <button
            onClick={handleFinish}
            className="rounded-xl bg-amber-600 px-5 py-2 text-sm font-semibold text-stone-950 hover:bg-amber-500 transition-colors"
          >
            Create character
          </button>
        )}
      </div>
    </div>
  );
}

function canAdvance(
  step: string,
  {
    name, raceId, subraceId, classId, backgroundId, classSkills, wizardSubclassId,
    wizardFightingStyleId, flexibleAbilityPicks, races, classes,
  }: {
    name: string;
    raceId: string;
    subraceId: string;
    classId: string;
    backgroundId: string;
    classSkills: string[];
    wizardSubclassId: string;
    wizardFightingStyleId: string;
    flexibleAbilityPicks: string[];
    races: SrdRace[];
    classes: SrdClass[];
  }
): boolean {
  switch (step) {
    case "name":    return name.trim().length >= 1;
    case "edition": return true;
    case "race":    return !!raceId;
    case "subrace": {
      const race = races.find((r) => r.id === raceId);
      if (!race) return true;
      if (race.subraceRequired && !subraceId) return false;
      return true;
    }
    case "class":   return !!classId;
    case "abilities": {
      const race = races.find((r) => r.id === raceId);
      const needed = race?.flexibleBonuses?.count ?? 0;
      return flexibleAbilityPicks.length === needed;
    }
    case "background": return !!backgroundId;
    case "skills": {
      const srdClass = classes.find((c) => `${c.id}:${c.sourceLabel ?? ""}` === classId);
      if (!srdClass) return false;
      return classSkills.length === srdClass.skillChoices.count;
    }
    case "subclass": {
      const srdClass = classes.find((c) => `${c.id}:${c.sourceLabel ?? ""}` === classId);
      if (!srdClass) return false;
      if (srdClass.subclassUnlockLevel === 1) return !!wizardSubclassId;
      return true;
    }
    case "class-features": return !!wizardFightingStyleId;
    default: return true;
  }
}
