import type { TabId } from "./tab-config";
import { PRIMARY_TABS, MORE_TABS, TAB_LABELS } from "./tab-config";

interface Props {
  activeTab: TabId;
  onTabChange: (tab: TabId) => void;
  moreOpen: boolean;
  onMoreToggle: () => void;
  onMoreTabChange: (tab: TabId) => void;
}

export function TabShellMobile({ activeTab, onTabChange, moreOpen, onMoreToggle, onMoreTabChange }: Props) {
  return (
    <>
      {/* More sheet backdrop */}
      {moreOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
          onClick={onMoreToggle}
        />
      )}

      {/* More sheet */}
      {moreOpen && (
        <div className="fixed bottom-0 left-0 right-0 z-50 bg-stone-900 border-t border-stone-700 rounded-t-2xl md:hidden"
          style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
        >
          <div className="w-10 h-1 bg-stone-700 rounded-full mx-auto mt-3 mb-4" />
          {MORE_TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => onMoreTabChange(tab)}
              className={`w-full text-left px-6 py-4 text-sm font-medium border-b border-stone-800 last:border-0 transition-colors ${
                activeTab === tab ? "text-amber-400" : "text-stone-200 hover:text-stone-100"
              }`}
            >
              {TAB_LABELS[tab]}
            </button>
          ))}
        </div>
      )}

      {/* Bottom nav bar */}
      <nav
        className="fixed bottom-0 left-0 right-0 z-30 flex md:hidden bg-stone-900 border-t border-stone-800"
        style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
      >
        {PRIMARY_TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => onTabChange(tab)}
            className={`flex-1 flex flex-col items-center gap-0.5 py-2 text-[10px] font-medium transition-colors ${
              activeTab === tab && !moreOpen
                ? "text-amber-400"
                : "text-stone-500 hover:text-stone-300"
            }`}
          >
            <TabIcon tab={tab} />
            {TAB_LABELS[tab]}
          </button>
        ))}

        {/* More button */}
        <button
          onClick={onMoreToggle}
          className={`flex-1 flex flex-col items-center gap-0.5 py-2 text-[10px] font-medium transition-colors ${
            moreOpen || MORE_TABS.includes(activeTab)
              ? "text-amber-400"
              : "text-stone-500 hover:text-stone-300"
          }`}
        >
          <span className="text-lg leading-none">···</span>
          More
        </button>
      </nav>
    </>
  );
}

function TabIcon({ tab }: { tab: TabId }) {
  const icons: Record<TabId, string> = {
    stats:       "⚔",
    actions:     "🗡",
    spells:      "✦",
    inventory:   "◆",
    features:    "★",
    description: "◉",
    extras:      "⋯",
  };
  return <span className="text-lg leading-none">{icons[tab]}</span>;
}
