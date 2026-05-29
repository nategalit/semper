import Link from "next/link";
import { requireAuth } from "@/lib/dal";
import { listCharacters } from "@/app/actions/characters";
import { AppHeader } from "@/app/_components/app-header";
import { CharacterList } from "./_components/character-list";

export default async function DashboardPage() {
  await requireAuth();
  const characters = await listCharacters();

  return (
    <div className="min-h-screen bg-stone-950 text-stone-100">
      <AppHeader />

      <main className="max-w-4xl mx-auto px-6 py-10">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold">My Characters</h1>
          <Link
            href="/characters/new"
            className="rounded-md bg-amber-600 px-4 py-2 text-sm font-semibold text-stone-950 hover:bg-amber-500 transition-colors"
          >
            + New character
          </Link>
        </div>

        <CharacterList initialCharacters={characters} />
      </main>
    </div>
  );
}
