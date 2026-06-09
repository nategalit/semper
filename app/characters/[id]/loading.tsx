export default function CharacterLoading() {
  return (
    <div className="min-h-screen bg-stone-950 animate-pulse">
      {/* Header skeleton */}
      <div className="sticky top-0 z-30 bg-stone-900 border-b border-stone-800 px-4 py-3">
        <div className="max-w-4xl mx-auto">
          <div className="h-2.5 w-20 bg-stone-800 rounded mb-2" />
          <div className="flex items-start justify-between gap-3 mb-3">
            <div className="space-y-2 flex-1">
              <div className="h-6 w-40 bg-stone-800 rounded" />
              <div className="h-3 w-28 bg-stone-800 rounded" />
            </div>
            <div className="w-11 h-11 rounded-full bg-stone-800 shrink-0" />
          </div>
          <div className="flex gap-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex flex-col items-center gap-1">
                <div className="h-5 w-8 bg-stone-800 rounded" />
                <div className="h-2.5 w-6 bg-stone-800 rounded" />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Tab bar skeleton */}
      <div className="border-b border-stone-800 px-4 flex gap-1">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-10 w-16 bg-stone-800 rounded-t mt-1" />
        ))}
      </div>

      {/* Content skeleton */}
      <div className="max-w-4xl mx-auto px-4 py-4 space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="rounded-xl border border-stone-800 bg-stone-900/50 p-4 space-y-3">
            <div className="h-3 w-24 bg-stone-800 rounded" />
            <div className="h-4 w-full bg-stone-800 rounded" />
            <div className="h-4 w-3/4 bg-stone-800 rounded" />
          </div>
        ))}
      </div>
    </div>
  );
}
