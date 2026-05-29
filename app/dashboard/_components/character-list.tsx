"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { deleteCharacter } from "@/app/actions/characters";
import type { Character } from "@/lib/types/character";

interface Props {
  initialCharacters: Character[];
}

export function CharacterList({ initialCharacters }: Props) {
  const [characters, setCharacters] = useState(initialCharacters);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const confirmTarget = characters.find((c) => c.id === confirmDeleteId);

  function openConfirm(id: string, e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    setConfirmDeleteId(id);
  }

  function handleConfirmDelete() {
    if (!confirmDeleteId) return;
    const id = confirmDeleteId;
    setConfirmDeleteId(null);
    setCharacters((prev) => prev.filter((c) => c.id !== id));
    startTransition(async () => {
      await deleteCharacter(id);
    });
  }

  if (characters.length === 0) {
    return (
      <div className="rounded-lg border border-stone-800 bg-stone-900/50 p-12 text-center">
        <p className="text-stone-400 mb-4">You have no characters yet.</p>
        <Link
          href="/characters/new"
          className="rounded-md bg-amber-600 px-4 py-2 text-sm font-semibold text-stone-950 hover:bg-amber-500 transition-colors"
        >
          Create your first character
        </Link>
      </div>
    );
  }

  return (
    <>
      <ul className="grid gap-4 sm:grid-cols-2">
        {characters.map((c) => (
          <li key={c.id} className="relative group">
            <Link
              href={`/characters/${c.id}`}
              className="block rounded-lg border border-stone-800 bg-stone-900 p-5 hover:border-amber-700 transition-colors"
            >
              <div className="flex items-start justify-between pr-8">
                <div>
                  <p className="font-semibold text-stone-100">{c.name}</p>
                  <p className="mt-1 text-sm text-stone-400">
                    Level {c.level}
                    {c.classId && ` · ${c.classId.replace(/^ID_CLASS_/, "")}`}
                    {c.raceId && ` · ${c.raceId.replace(/^ID_RACE_/, "")}`}
                  </p>
                </div>
                <span className="text-xs text-stone-500">
                  {new Date(c.updatedAt).toLocaleDateString()}
                </span>
              </div>
            </Link>
            <button
              onClick={(e) => openConfirm(c.id, e)}
              disabled={isPending}
              aria-label={`Delete ${c.name}`}
              className="absolute top-3 right-3 w-8 h-8 flex items-center justify-center rounded-md
                text-stone-600 hover:text-red-400 hover:bg-stone-800 transition-colors
                opacity-0 group-hover:opacity-100 focus:opacity-100"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                className="w-4 h-4"
              >
                <path
                  fillRule="evenodd"
                  d="M8.75 1A2.75 2.75 0 0 0 6 3.75v.443c-.795.077-1.584.176-2.365.298a.75.75 0 1 0 .23 1.482l.149-.022.841 10.518A2.75 2.75 0 0 0 7.596 19h4.807a2.75 2.75 0 0 0 2.742-2.53l.841-10.52.149.023a.75.75 0 0 0 .23-1.482A41.03 41.03 0 0 0 14 4.193V3.75A2.75 2.75 0 0 0 11.25 1h-2.5ZM10 4c.84 0 1.673.025 2.5.075V3.75c0-.69-.56-1.25-1.25-1.25h-2.5c-.69 0-1.25.56-1.25 1.25v.325C8.327 4.025 9.16 4 10 4ZM8.58 7.72a.75.75 0 0 0-1.5.06l.3 7.5a.75.75 0 1 0 1.5-.06l-.3-7.5Zm4.34.06a.75.75 0 1 0-1.5-.06l-.3 7.5a.75.75 0 1 0 1.5.06l.3-7.5Z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
          </li>
        ))}
      </ul>

      {/* Delete confirmation dialog */}
      {confirmDeleteId && confirmTarget && (
        <>
          <div
            className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm"
            onClick={() => setConfirmDeleteId(null)}
          />
          <div
            role="dialog"
            aria-modal
            aria-label="Confirm character deletion"
            className="fixed inset-x-0 bottom-0 z-50 bg-stone-900 border-t border-stone-700 rounded-t-2xl px-6 py-6
              md:inset-auto md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2
              md:w-[min(400px,92vw)] md:rounded-2xl md:border md:border-stone-700"
          >
            <h2 className="text-base font-bold text-stone-100 mb-2">Delete character?</h2>
            <p className="text-sm text-stone-400 mb-6">
              <span className="text-stone-200 font-medium">{confirmTarget.name}</span> will be
              permanently deleted. This cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setConfirmDeleteId(null)}
                className="flex-1 min-h-[48px] rounded-xl border border-stone-700 text-stone-300
                  hover:border-stone-500 hover:text-stone-100 text-sm font-semibold transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                className="flex-1 min-h-[48px] rounded-xl bg-red-700 hover:bg-red-600
                  text-white text-sm font-bold transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </>
      )}
    </>
  );
}
