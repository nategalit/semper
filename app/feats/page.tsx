import { getSession } from "@/lib/dal";
import { getEnabledFeats } from "@/app/actions/content";
import { AppHeader } from "@/app/_components/app-header";
import { FeatBrowser } from "./_components/feat-browser";

export default async function FeatsPage() {
  const session = await getSession();
  const feats = session ? await getEnabledFeats() : [];

  return (
    <div className="min-h-screen bg-stone-950 text-stone-100">
      <AppHeader />
      <FeatBrowser feats={feats} />
    </div>
  );
}
