import { getCharacter } from "@/app/actions/characters";
import { listRolls } from "@/app/actions/rolls";
import { getEnabledSpells, getEnabledFeatures, getEnabledFightingStyles } from "@/app/actions/content";
import type { FeatureEntry, FightingStyleEntry } from "@/app/actions/content";
import { SRD_RACES, SRD_CLASSES, SRD_BACKGROUNDS } from "@/lib/content/srd";
import { deriveStats } from "@/lib/character/calc";
import { CharacterSheet } from "./_components/character-sheet";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function CharacterPage({ params }: Props) {
  const { id } = await params;

  const t0 = Date.now();
  const [character, initialRolls, importedSpells, featureEls, importedFightingStyles] = await Promise.all([
    getCharacter(id),
    listRolls(id),
    getEnabledSpells(),
    getEnabledFeatures(),
    getEnabledFightingStyles(),
  ]);
  const featureMap = new Map<string, FeatureEntry>(featureEls.map((f) => [f.id, f]));
  console.log(`[CharacterPage] parallel fetch total: ${Date.now() - t0}ms (getCharacter + listRolls + getEnabledSpells + getEnabledFeatures + getEnabledFightingStyles)`);

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

  const derived = deriveStats(character, srdClass, srdRace, srdBackground);

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
      />
    </div>
  );
}
