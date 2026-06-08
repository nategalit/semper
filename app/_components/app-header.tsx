import Link from "next/link";
import { getSession } from "@/lib/dal";
import { signOut } from "@/app/actions/auth";

interface Props {
  backHref?: string;
  backLabel?: string;
  title?: string;
}

export async function AppHeader({ backHref, backLabel, title }: Props) {
  const session = await getSession();

  return (
    <header className="border-b border-stone-800 px-6 py-4 flex items-center justify-between">
      <div className="flex items-center gap-3">
        {backHref ? (
          <>
            <Link
              href={backHref}
              className="text-stone-400 hover:text-stone-200 transition-colors text-sm"
            >
              ← {backLabel ?? "Back"}
            </Link>
            {title && (
              <>
                <span className="text-stone-700">|</span>
                <span className="text-sm font-semibold text-stone-100">{title}</span>
              </>
            )}
          </>
        ) : (
          <Link href="/" className="text-xl font-bold text-amber-400">
            Semper
          </Link>
        )}
      </div>

      <nav className="flex items-center gap-4">
        {session ? (
          <>
            <span className="hidden sm:block text-sm text-stone-400">
              {session.email}
            </span>
            <Link
              href="/dashboard"
              className="text-sm text-stone-400 hover:text-stone-200 transition-colors"
            >
              Dashboard
            </Link>
            <Link
              href="/spells"
              className="text-sm text-stone-400 hover:text-stone-200 transition-colors"
            >
              Spells
            </Link>
            <Link
              href="/feats"
              className="text-sm text-stone-400 hover:text-stone-200 transition-colors"
            >
              Feats
            </Link>
            <Link
              href="/settings/content"
              className="text-sm text-stone-400 hover:text-stone-200 transition-colors"
            >
              Settings
            </Link>
            <form action={signOut}>
              <button
                type="submit"
                className="text-sm text-stone-400 hover:text-stone-200 transition-colors"
              >
                Sign out
              </button>
            </form>
          </>
        ) : (
          <Link
            href="/login"
            className="text-sm text-stone-400 hover:text-stone-200 transition-colors"
          >
            Sign in
          </Link>
        )}
      </nav>
    </header>
  );
}
