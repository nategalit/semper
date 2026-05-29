import type { TabId } from "./tab-config";
import { PRIMARY_TABS, MORE_TABS, TAB_LABELS } from "./tab-config";

interface Props {
  activeTab: TabId;
  onTabChange: (tab: TabId) => void;
}

const ALL_TABS = [...PRIMARY_TABS, ...MORE_TABS] as TabId[];

export function TabShellDesktop({ activeTab, onTabChange }: Props) {
  return (
    <nav className="hidden md:flex border-b border-stone-800 bg-stone-900/60 px-4 max-w-4xl mx-auto w-full">
      {ALL_TABS.map((tab) => (
        <button
          key={tab}
          onClick={() => onTabChange(tab)}
          className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors -mb-px ${
            activeTab === tab
              ? "border-amber-400 text-amber-400"
              : "border-transparent text-stone-400 hover:text-stone-200"
          }`}
        >
          {TAB_LABELS[tab]}
        </button>
      ))}
    </nav>
  );
}
