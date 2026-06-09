import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-stone-950 text-stone-100 flex flex-col items-center justify-center px-6">
      <p className="text-6xl font-bold text-stone-800 mb-4">404</p>
      <h1 className="text-xl font-semibold text-stone-300 mb-2">Page not found</h1>
      <p className="text-sm text-stone-500 mb-8 text-center">
        The page you&apos;re looking for doesn&apos;t exist or has been moved.
      </p>
      <Link
        href="/dashboard"
        className="rounded-xl bg-amber-600 px-5 py-2.5 text-sm font-bold text-stone-950 hover:bg-amber-500 transition-colors"
      >
        Back to Dashboard
      </Link>
    </div>
  );
}
