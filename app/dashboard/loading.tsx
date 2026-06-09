export default function DashboardLoading() {
  return (
    <div className="min-h-screen bg-stone-950 animate-pulse">
      <div className="border-b border-stone-800 px-6 py-4 flex items-center justify-between">
        <div className="h-5 w-20 bg-stone-800 rounded" />
        <div className="h-4 w-32 bg-stone-800 rounded" />
      </div>
      <main className="max-w-4xl mx-auto px-6 py-10">
        <div className="flex items-center justify-between mb-8">
          <div className="h-7 w-40 bg-stone-800 rounded" />
          <div className="h-9 w-32 bg-stone-800 rounded-xl" />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="rounded-xl border border-stone-800 bg-stone-900 p-5 space-y-3">
              <div className="h-5 w-32 bg-stone-800 rounded" />
              <div className="h-3.5 w-24 bg-stone-800 rounded" />
              <div className="h-3 w-16 bg-stone-800 rounded" />
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
