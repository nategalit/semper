export type TabId =
  | "stats"
  | "actions"
  | "spells"
  | "inventory"
  | "features"
  | "description"
  | "extras";

export const PRIMARY_TABS: TabId[] = ["stats", "actions", "spells", "inventory", "features"];
export const MORE_TABS: TabId[] = ["description", "extras"];

export const TAB_LABELS: Record<TabId, string> = {
  stats: "Stats",
  actions: "Actions",
  spells: "Spells",
  inventory: "Inventory",
  features: "Features",
  description: "Description",
  extras: "Extras",
};
