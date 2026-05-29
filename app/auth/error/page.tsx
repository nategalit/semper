import Link from "next/link";

export default function AuthErrorPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-stone-950 px-4">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-red-400 mb-2">Authentication failed</h1>
        <p className="text-stone-400 mb-6">
          The magic link may have expired or already been used.
        </p>
        <Link
          href="/login"
          className="rounded-md bg-amber-600 px-4 py-2 text-sm font-semibold text-stone-950 hover:bg-amber-500 transition-colors"
        >
          Back to login
        </Link>
      </div>
    </div>
  );
}
