import { getSession } from "@/lib/dal";
import { getEnabledSpells } from "@/app/actions/content";
import { SRD_SPELLS } from "@/lib/content/srd";
import type { SpellSchool } from "@/lib/content/srd";
import { AppHeader } from "@/app/_components/app-header";
import { SpellBrowser } from "./_components/spell-browser";
import type { DisplaySpell } from "@/lib/types/spell";

const VALID_SCHOOLS = new Set([
  "abjuration","conjuration","divination","enchantment",
  "evocation","illusion","necromancy","transmutation",
]);

function srdToDisplay(s: (typeof SRD_SPELLS)[number]): DisplaySpell {
  return { ...s, sourceLabel: "SRD" };
}

interface Props {
  searchParams: Promise<{ q?: string; level?: string; school?: string }>;
}

export default async function SpellsPage({ searchParams }: Props) {
  const { q, level, school } = await searchParams;

  const session = await getSession();
  const importedSpells = session ? await getEnabledSpells() : [];
  const allSpells: DisplaySpell[] = [
    ...SRD_SPELLS.map(srdToDisplay),
    ...importedSpells,
  ];

  const parsedLevel = level !== undefined ? parseInt(level, 10) : null;
  const initialLevel = parsedLevel !== null && !isNaN(parsedLevel) ? parsedLevel : null;
  const initialSchool = school && VALID_SCHOOLS.has(school) ? (school as SpellSchool) : null;

  return (
    <div className="min-h-screen bg-stone-950 text-stone-100">
      <AppHeader />
      <SpellBrowser
        allSpells={allSpells}
        initialSearch={q ?? ""}
        initialLevel={initialLevel}
        initialSchool={initialSchool}
      />
    </div>
  );
}
