"use client";

import { useState, useMemo, useEffect } from "react";
import { useMutation } from "@/lib/character/mutation-context";
import { setEquipment } from "@/app/actions/characters";
import { getEnabledItems } from "@/app/actions/content";
import { SRD_ITEMS, adaptSrdItem } from "@/lib/content/srd/items";
import { adaptAuroraItem } from "@/lib/content/aurora/adapters";
import type { ItemElement } from "@/lib/content/schema";
import type { EquipmentItem } from "@/lib/types/character";
import type { SrdItem } from "@/lib/content/srd/items";

type ItemType = "all" | "weapon" | "armor" | "shield" | "gear" | "tool";

interface CatalogEntry {
  id: string;
  name: string;
  itemType: string;
  weight?: number;
  cost?: { amount: number; currency: string };
  sourceLabel: string;
  rarity?: string;
  build: () => EquipmentItem;
}

const RARITY_COLORS: Record<string, string> = {
  common:      "text-stone-200",
  uncommon:    "text-green-400",
  rare:        "text-blue-400",
  "very rare": "text-purple-400",
  legendary:   "text-amber-400",
  artifact:    "text-red-400",
};

function rarityColor(rarity: string | undefined): string {
  if (!rarity) return "text-stone-200";
  return RARITY_COLORS[rarity.toLowerCase()] ?? "text-stone-200";
}

interface Props {
  open: boolean;
  onClose: () => void;
}

function formatCost(cost: { amount: number; currency: string } | undefined): string {
  if (!cost) return "";
  return `${cost.amount} ${cost.currency}`;
}

function srdToCatalog(item: SrdItem): CatalogEntry {
  return {
    id: item.id,
    name: item.name,
    itemType: item.itemType.toLowerCase(),
    weight: item.weight,
    cost: item.cost,
    sourceLabel: "SRD",
    build: () => adaptSrdItem(item),
  };
}

function auroraToCatalog(el: ItemElement): CatalogEntry {
  return {
    id: el.id,
    name: el.name,
    itemType: el.itemType.toLowerCase(),
    weight: el.weight,
    cost: el.cost,
    sourceLabel: el.source ?? "Aurora",
    rarity: el.rarity,
    build: () => adaptAuroraItem(el),
  };
}

export function EquipmentManager({ open, onClose }: Props) {
  const { character, mutate } = useMutation();
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<ItemType>("all");
  const [sourceFilter, setSourceFilter] = useState<string | null>(null);
  const [auroraItems, setAuroraItems] = useState<ItemElement[] | null>(null);
  const [loadError, setLoadError] = useState(false);

  useEffect(() => {
    if (!open || auroraItems !== null) return;
    getEnabledItems()
      .then(setAuroraItems)
      .catch(() => { setAuroraItems([]); setLoadError(true); });
  }, [open, auroraItems]);

  const catalog = useMemo<CatalogEntry[]>(() => {
    const srd = SRD_ITEMS.map(srdToCatalog);
    const aurora = (auroraItems ?? []).map(auroraToCatalog);
    // Dedupe by name — prefer Aurora (richer description) over SRD when both present
    const nameMap = new Map<string, CatalogEntry>();
    for (const entry of [...srd, ...aurora]) nameMap.set(entry.name.toLowerCase(), entry);
    return [...nameMap.values()].sort((a, b) => a.name.localeCompare(b.name));
  }, [auroraItems]);

  const sources = useMemo(
    () => [...new Set(catalog.map((e) => e.sourceLabel))].sort(),
    [catalog]
  );

  // Hide Aurora enhancement templates ("Weapon, +1" etc.) — they have no damage dice
  // and are useless as standalone items. Enhancement is applied via the inventory cycle button.
  // "Ammunition, +1" is excluded from this filter — it's a real consumable.
  const ENHANCEMENT_TEMPLATE_RE = /^(weapon|armor|shield),\s*\+[1-3]$/i;

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    return catalog.filter((e) => {
      if (ENHANCEMENT_TEMPLATE_RE.test(e.name)) return false;
      if (q && !e.name.toLowerCase().includes(q)) return false;
      if (typeFilter !== "all" && !e.itemType.includes(typeFilter)) return false;
      if (sourceFilter && e.sourceLabel !== sourceFilter) return false;
      return true;
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [catalog, search, typeFilter, sourceFilter]);

  const ownedSourceIds = useMemo(
    () => new Set((character.data.equipment ?? []).map((i) => i.sourceId)),
    [character.data.equipment]
  );

  function handleAdd(entry: CatalogEntry) {
    const newItem = entry.build();
    const next = [...(character.data.equipment ?? []), newItem];
    mutate({ equipment: next }, () => setEquipment(character.id, next));
  }

  function handleRemoveLast(entry: CatalogEntry) {
    const current = character.data.equipment ?? [];
    const idx = [...current].reverse().findIndex((i) => i.sourceId === entry.id);
    if (idx === -1) return;
    const realIdx = current.length - 1 - idx;
    const next = current.filter((_, i) => i !== realIdx);
    mutate({ equipment: next }, () => setEquipment(character.id, next));
  }

  if (!open) return null;

  const TYPE_LABELS: { key: ItemType; label: string }[] = [
    { key: "all", label: "All" },
    { key: "weapon", label: "Weapons" },
    { key: "armor", label: "Armor" },
    { key: "shield", label: "Shields" },
    { key: "gear", label: "Gear" },
    { key: "tool", label: "Tools" },
  ];

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-stone-950/95">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-stone-800 shrink-0">
        <h2 className="text-base font-semibold text-stone-100">Add Equipment</h2>
        <button
          onClick={onClose}
          className="text-stone-400 hover:text-stone-100 text-2xl leading-none w-9 h-9 flex items-center justify-center"
          aria-label="Close"
        >
          ×
        </button>
      </div>

      {/* Search */}
      <div className="px-4 pt-3 pb-2 shrink-0">
        <input
          type="search"
          placeholder="Search items…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full rounded-lg bg-stone-800 border border-stone-700 px-3 py-2 text-sm text-stone-100 placeholder-stone-500 outline-none focus:border-amber-600"
        />
      </div>

      {/* Type filter */}
      <div className="flex gap-1.5 px-4 pb-2 flex-wrap shrink-0">
        {TYPE_LABELS.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setTypeFilter(key)}
            className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
              typeFilter === key
                ? "bg-amber-600 text-stone-950"
                : "border border-stone-700 text-stone-400 hover:text-stone-200"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Source filter (only when multiple sources) */}
      {sources.length > 1 && (
        <div className="flex gap-1.5 px-4 pb-2 flex-wrap shrink-0">
          <button
            onClick={() => setSourceFilter(null)}
            className={`rounded-full px-2.5 py-0.5 text-[10px] font-medium transition-colors ${
              sourceFilter === null
                ? "bg-stone-500 text-stone-100"
                : "border border-stone-700 text-stone-500 hover:text-stone-300"
            }`}
          >
            All sources
          </button>
          {sources.map((s) => (
            <button
              key={s}
              onClick={() => setSourceFilter(s === sourceFilter ? null : s)}
              className={`rounded-full px-2.5 py-0.5 text-[10px] font-medium transition-colors ${
                sourceFilter === s
                  ? "bg-stone-500 text-stone-100"
                  : "border border-stone-700 text-stone-500 hover:text-stone-300"
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      )}

      {/* Item list */}
      <div className="flex-1 overflow-y-auto px-4 pb-6">
        {auroraItems === null ? (
          loadError
            ? <p className="text-sm text-stone-500 text-center py-8">Failed to load items.</p>
            : <p className="text-sm text-stone-500 text-center py-8 animate-pulse">Loading items…</p>
        ) : filtered.length === 0 ? (
          <p className="text-sm text-stone-500 text-center py-8">No items match your search.</p>
        ) : (
          <ul className="divide-y divide-stone-800">
            {filtered.map((entry) => {
              const count = (character.data.equipment ?? []).filter(
                (i) => i.sourceId === entry.id
              ).length;
              return (
                <li key={entry.id} className="flex items-center justify-between py-2.5 gap-3">
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm truncate ${rarityColor(entry.rarity)}`}>{entry.name}</p>
                    <p className="text-[10px] text-stone-500 flex gap-2 mt-0.5">
                      <span className="capitalize">{entry.itemType}</span>
                      {entry.weight !== undefined && entry.weight > 0 && (
                        <span>{entry.weight} lb.</span>
                      )}
                      {entry.cost && <span>{formatCost(entry.cost)}</span>}
                      {entry.sourceLabel !== "SRD" && (
                        <span className="text-indigo-400">{entry.sourceLabel}</span>
                      )}
                    </p>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    {count > 0 && (
                      <>
                        <button
                          onClick={() => handleRemoveLast(entry)}
                          className="w-7 h-7 rounded-lg bg-stone-800 border border-stone-700 text-stone-300 text-sm flex items-center justify-center hover:border-red-700 hover:text-red-400"
                          aria-label={`Remove one ${entry.name}`}
                        >
                          −
                        </button>
                        <span className="text-xs text-stone-400 min-w-[1.2rem] text-center">{count}</span>
                      </>
                    )}
                    <button
                      onClick={() => handleAdd(entry)}
                      className="w-7 h-7 rounded-lg bg-stone-800 border border-stone-700 text-stone-300 text-sm flex items-center justify-center hover:border-amber-600 hover:text-amber-300"
                      aria-label={`Add ${entry.name}`}
                    >
                      +
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
