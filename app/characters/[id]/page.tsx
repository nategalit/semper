import { getCharacter } from "@/app/actions/characters";
import { listRolls } from "@/app/actions/rolls";
import { getEnabledSpells, getEnabledFeatures, getEnabledFightingStyles, getEnabledSubclasses, getEnabledFeats } from "@/app/actions/content";
import type { FeatureEntry, FightingStyleEntry } from "@/app/actions/content";
import type { FeatElement } from "@/lib/content/schema";
import { SRD_RACES, SRD_CLASSES, SRD_BACKGROUNDS, SRD_SUBCLASSES } from "@/lib/content/srd";
import type { SrdSubclass } from "@/lib/content/srd";
import { adaptAuroraSubclass, SUBCLASS_PARENT_TO_CLASS_ID } from "@/lib/content/aurora/adapters";
import { dedupSubclasses } from "@/lib/content/dedup";
import { deriveStats, collectFeatStatMods } from "@/lib/character/calc";
import { CharacterSheet } from "./_components/character-sheet";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function CharacterPage({ params }: Props) {
  const { id } = await params;

  const t0 = Date.now();
  const [character, initialRolls, importedSpells, featureEls, importedFightingStyles, rawSubclasses, importedFeats] = await Promise.all([
    getCharacter(id),
    listRolls(id),
    getEnabledSpells(),
    getEnabledFeatures(),
    getEnabledFightingStyles(),
    getEnabledSubclasses(),
    getEnabledFeats(),
  ]);
  const featureMap = new Map<string, FeatureEntry>(featureEls.map((f) => [f.id, f]));
  const auroraSubclasses: SrdSubclass[] = rawSubclasses.flatMap((el) => {
    const classId = SUBCLASS_PARENT_TO_CLASS_ID[el.parentClass];
    return classId ? [adaptAuroraSubclass(el, classId)] : [];
  });
  const { results: allSubclasses } = dedupSubclasses([
    ...SRD_SUBCLASSES.map((s) => ({ ...s, source: "SRD" as const, sourceLabel: "SRD" })),
    ...auroraSubclasses,
  ]);
  console.log(`[CharacterPage] parallel fetch total: ${Date.now() - t0}ms (getCharacter + listRolls + getEnabledSpells + getEnabledFeatures + getEnabledFightingStyles + getEnabledSubclasses + getEnabledFeats)`);

  // Post-6C characters store resolved objects; pre-6C fall back to SRD lookup.
  const srdRace = character.data.resolvedRace ?? SRD_RACES.find((r) => r.id === character.raceId) ?? undefined;
  // featuresByLevel and featureDescriptions were added to SRD_CLASSES in Phase 8.
  // Characters created before that have a resolvedClass in the DB that's missing them.
  // Always patch from the current static entry so older characters get the live data.
  const staticClass   = SRD_CLASSES.find((c) => c.id === character.classId);
  const resolvedClass = character.data.resolvedClass ?? staticClass;
  const srdClass = resolvedClass
    ? {
        ...resolvedClass,
        featuresByLevel:     resolvedClass.featuresByLevel    ?? staticClass?.featuresByLevel,
        featureDescriptions: resolvedClass.featureDescriptions ?? staticClass?.featureDescriptions,
      }
    : undefined;
  const srdBackground = character.data.resolvedBackground ?? SRD_BACKGROUNDS.find(
    (b) => b.id === character.data.backgroundId
  ) ?? undefined;

  const featStatMods = collectFeatStatMods(character.data.levelChoices, importedFeats);
  const derived = deriveStats(character, srdClass, srdRace, srdBackground, featStatMods);

  return (
    <div className="min-h-screen bg-stone-950 text-stone-100">
      <CharacterSheet
        character={character}
        derived={derived}
        srdClass={srdClass}
        srdRace={srdRace}
        srdBackground={srdBackground}
        initialRolls={initialRolls}
        importedSpells={importedSpells}
        featureMap={featureMap}
        importedFightingStyles={importedFightingStyles}
        allSubclasses={allSubclasses}
        importedFeats={importedFeats}
      />
    </div>
  );
}
