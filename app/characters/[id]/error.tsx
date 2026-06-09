"use client";

import { useEffect } from "react";
import Link from "next/link";

interface Props {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function CharacterError({ error, reset }: Props) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen bg-stone-950 text-stone-100 flex flex-col items-center justify-center px-6">
      <p className="text-4xl font-bold text-stone-800 mb-4">!</p>
      <h1 className="text-xl font-semibold text-stone-300 mb-2">Something went wrong</h1>
      <p className="text-sm text-stone-500 mb-8 text-center max-w-xs">
        {error.message ?? "Unable to load this character. Try again or return to your dashboard."}
      </p>
      <div className="flex gap-3">
        <button
          onClick={reset}
          className="rounded-xl bg-stone-700 px-5 py-2.5 text-sm font-semibold text-stone-100 hover:bg-stone-600 transition-colors"
        >
          Try again
        </button>
        <Link
          href="/dashboard"
          className="rounded-xl bg-amber-600 px-5 py-2.5 text-sm font-bold text-stone-950 hover:bg-amber-500 transition-colors"
        >
          Dashboard
        </Link>
      </div>
    </div>
  );
}
