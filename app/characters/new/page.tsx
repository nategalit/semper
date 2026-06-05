import { requireAuth } from "@/lib/dal";
import {
  SRD_RACES, SRD_CLASSES, SRD_SUBCLASSES, SRD_BACKGROUNDS,
} from "@/lib/content/srd";
import type { SrdRace, SrdClass, SrdSubclass, SrdBackground } from "@/lib/content/srd";
import {
  getEnabledRaces, getEnabledSubraces, getEnabledClasses, getEnabledSubclasses,
  getEnabledBackgrounds, getEnabledFeatures, getEnabledFightingStyles,
} from "@/app/actions/content";
import type { FeatureEntry } from "@/app/actions/content";
import type { SubraceElement } from "@/lib/content/schema";
import {
  adaptAuroraRace, adaptAuroraClass, adaptAuroraSubclass, adaptAuroraBackground,
  SUBCLASS_PARENT_TO_CLASS_ID,
} from "@/lib/content/aurora/adapters";
import { dedupRaces, dedupClasses, dedupBackgrounds, dedupSubclasses, logDedupStats } from "@/lib/content/dedup";
import { CharacterWizard } from "./_components/wizard";

export default async function NewCharacterPage() {
  await requireAuth();

  const [auroraRaceEls, auroraSubraceEls, auroraClassEls, auroraSubclassEls, auroraBackgroundEls, featureEls, importedFightingStyles] =
    await Promise.all([
      getEnabledRaces(),
      getEnabledSubraces(),
      getEnabledClasses(),
      getEnabledSubclasses(),
      getEnabledBackgrounds(),
      getEnabledFeatures(),
      getEnabledFightingStyles(),
    ]);

  const featureMap = new Map<string, FeatureEntry>(featureEls.map((f) => [f.id, f]));

  // Group Aurora subraces by their parentRace name so they can be linked to each race.
  const subracesByParent = new Map<string, SubraceElement[]>();
  for (const el of auroraSubraceEls) {
    const arr = subracesByParent.get(el.parentRace) ?? [];
    arr.push(el);
    subracesByParent.set(el.parentRace, arr);
  }

  const auroraClasses: SrdClass[] = auroraClassEls.map((el) => ({
    ...adaptAuroraClass(el),
    source: "Aurora" as const,
  }));

  const auroraRaces: SrdRace[] = auroraRaceEls.map((el) => ({
    ...adaptAuroraRace(el, subracesByParent.get(el.name) ?? []),
    source: "Aurora" as const,
  }));

  const auroraSubclasses: SrdSubclass[] = auroraSubclassEls.map((el) => {
    // Aurora subclasses use archetype category names as parentClass (e.g. "Divine Domain",
    // not "Cleric"). Fall through to SUBCLASS_PARENT_TO_CLASS_ID before using the raw string.
    const parentClass = auroraClasses.find((c) => c.name === el.parentClass);
    const classId = parentClass?.id
      ?? SUBCLASS_PARENT_TO_CLASS_ID[el.parentClass]
      ?? el.parentClass;
    return { ...adaptAuroraSubclass(el, classId), source: "Aurora" as const };
  });

  const auroraBackgrounds: SrdBackground[] = auroraBackgroundEls.map((el) => ({
    ...adaptAuroraBackground(el),
    source: "Aurora" as const,
  }));

  const srdRaces    = SRD_RACES.map((r) => ({ ...r, source: "SRD" as const, sourceLabel: "SRD" }));
  const srdClasses  = SRD_CLASSES.map((c) => ({ ...c, source: "SRD" as const, sourceLabel: "SRD" }));
  const srdBgs      = SRD_BACKGROUNDS.map((b) => ({ ...b, source: "SRD" as const, sourceLabel: "SRD" }));

  const { results: races,       stats: raceStats }  = dedupRaces([...srdRaces, ...auroraRaces]);
  const { results: classes,     stats: classStats }  = dedupClasses([...srdClasses, ...auroraClasses]);
  const { results: backgrounds, stats: bgStats }     = dedupBackgrounds([...srdBgs, ...auroraBackgrounds]);

  logDedupStats("races",       raceStats);
  logDedupStats("classes",     classStats);
  logDedupStats("backgrounds", bgStats);

  const subclassesRaw: SrdSubclass[] = [
    ...SRD_SUBCLASSES.map((s) => ({ ...s, source: "SRD" as const, sourceLabel: "SRD" })),
    ...auroraSubclasses,
  ];
  const { results: subclasses, stats: subclassStats } = dedupSubclasses(subclassesRaw);
  logDedupStats("subclasses", subclassStats);

  return (
    <div className="min-h-screen bg-stone-950 text-stone-100">
      <CharacterWizard
        races={races}
        classes={classes}
        subclasses={subclasses}
        backgrounds={backgrounds}
        featureMap={featureMap}
        importedFightingStyles={importedFightingStyles}
      />
    </div>
  );
}
