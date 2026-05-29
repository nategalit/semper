import Link from "next/link";
import { getSession } from "@/lib/dal";
import { AppHeader } from "@/app/_components/app-header";

export default async function Home() {
  const session = await getSession();

  return (
    <div className="min-h-screen bg-stone-950 text-stone-100">
      <AppHeader />
      <main className="flex flex-col items-center justify-center min-h-[calc(100vh-65px)] p-8">
        <h1 className="text-4xl font-bold tracking-tight text-stone-100">Semper</h1>
        <p className="mt-3 text-stone-400">D&amp;D 5e character sheets, forged for play.</p>
        <div className="mt-8">
          {session ? (
            <Link
              href="/dashboard"
              className="rounded-md bg-amber-600 px-8 py-3 text-base font-semibold text-stone-950 hover:bg-amber-500 transition-colors"
            >
              Go to Dashboard
            </Link>
          ) : (
            <Link
              href="/login"
              className="rounded-md bg-amber-600 px-8 py-3 text-base font-semibold text-stone-950 hover:bg-amber-500 transition-colors"
            >
              Sign In
            </Link>
          )}
        </div>
      </main>
    </div>
  );
}
