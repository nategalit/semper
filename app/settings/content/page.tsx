import { requireAuth } from "@/lib/dal";
import { listContentSources } from "@/app/actions/content";
import { AppHeader } from "@/app/_components/app-header";
import { ContentManager } from "./_components/content-manager";

export const metadata = { title: "Content Sources · Semper" };

export default async function ContentSettingsPage() {
  await requireAuth();
  const sources = await listContentSources();

  return (
    <div className="min-h-screen bg-stone-950 text-stone-100">
      <AppHeader backHref="/dashboard" backLabel="Dashboard" title="Content Sources" />

      <main className="max-w-2xl mx-auto px-6 py-8">
        <div className="mb-6">
          <p className="text-stone-400 text-sm leading-relaxed">
            Semper includes the{" "}
            <span className="text-stone-300">Systems Reference Document (SRD)</span> spells
            out of the box. Connect an Aurora Legacy index to import spells from books you
            own.
          </p>
        </div>

        <ContentManager initialSources={sources} />
      </main>
    </div>
  );
}
