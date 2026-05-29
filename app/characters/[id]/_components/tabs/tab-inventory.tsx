"use client";

import { useState } from "react";
import { useMutation } from "@/lib/character/mutation-context";
import { setEquipment, setCurrency } from "@/app/actions/characters";
import type { CharacterData, Currency, EquipmentItem } from "@/lib/types/character";
import { SectionCard } from "../shared/section-card";
import { EmptyState } from "../shared/empty-state";
import { EquipmentManager } from "../panels/equipment-manager";

const CURRENCY_LABELS: Array<{ key: keyof Currency; label: string; color: string }> = [
  { key: "pp", label: "PP", color: "text-purple-300" },
  { key: "gp", label: "GP", color: "text-amber-300" },
  { key: "ep", label: "EP", color: "text-cyan-300" },
  { key: "sp", label: "SP", color: "text-stone-300" },
  { key: "cp", label: "CP", color: "text-orange-400" },
];

const SLOT_LABELS: Record<string, string> = {
  armor: "Armor",
  shield: "Shield",
  mainhand: "Main",
  offhand: "Off",
  other: "Other",
};

const SHIELD_RE = /^shield$/i;

const RARITY_COLORS: Record<string, string> = {
  common:     "text-stone-200",
  uncommon:   "text-green-400",
  rare:       "text-blue-400",
  "very rare":"text-purple-400",
  legendary:  "text-amber-400",
  artifact:   "text-red-400",
};

function rarityColor(rarity: string | undefined): string {
  if (!rarity) return "text-stone-200";
  return RARITY_COLORS[rarity.toLowerCase()] ?? "text-stone-200";
}

function isEnhanceable(item: EquipmentItem): boolean {
  return !!(item.weapon || item.armor || SHIELD_RE.test(item.name.trim()));
}

function hasBuiltInCombatBonus(item: EquipmentItem): boolean {
  if (!item.magic?.statModifiers?.length) return false;
  const mods = item.magic.statModifiers;
  if (item.weapon) {
    return mods.some(m => { const s = m.stat.toLowerCase(); return s.includes("attack") || s.includes("damage"); });
  }
  if (item.armor || SHIELD_RE.test(item.name.trim())) {
    return mods.some(m => { const s = m.stat.toLowerCase(); return s.includes("ac") || s.includes("armor") || s.includes("class"); });
  }
  return false;
}

function getBuiltInBonus(item: EquipmentItem): number {
  if (!item.magic?.statModifiers?.length) return 0;
  const mods = item.magic.statModifiers;
  const keys = item.weapon
    ? ["attack"]
    : ["ac", "armor", "class"];
  return mods
    .filter(m => keys.some(k => m.stat.toLowerCase().includes(k)))
    .reduce((sum, m) => sum + m.value, 0);
}

export function TabInventory() {
  const { character, mutate } = useMutation();
  const { currency, equipment = [] } = character.data;
  const [managerOpen, setManagerOpen] = useState(false);
  const [editingCurrency, setEditingCurrency] = useState<keyof Currency | null>(null);
  const [currencyDraft, setCurrencyDraft] = useState("");

  const MAX_ATTUNEMENT = 3;
  const attuned = equipment.filter((i) => i.attuned).length;

  // ── Equipment mutations ────────────────────────────────────────────────────

  function patch(next: EquipmentItem[]) {
    mutate({ equipment: next }, () => setEquipment(character.id, next));
  }

  function toggleEquip(id: string, item: EquipmentItem) {
    const willEquip = !item.equipped;

    // Auto-assign slot when equipping if not already set
    let equipSlot = item.equipSlot;
    if (willEquip && !equipSlot) {
      if (item.armor) equipSlot = "armor";
      else if (/^shield$/i.test(item.name.trim())) equipSlot = "shield";
      else if (item.weapon) equipSlot = "mainhand";
      else equipSlot = "other";
    }

    const next = equipment.map((i) =>
      i.id === id ? { ...i, equipped: willEquip, ...(equipSlot ? { equipSlot } : {}) } : i
    );
    patch(next);
  }

  function toggleAttune(id: string, item: EquipmentItem) {
    if (!item.attuned && attuned >= MAX_ATTUNEMENT) return;
    const next = equipment.map((i) =>
      i.id === id ? { ...i, attuned: !i.attuned } : i
    );
    patch(next);
  }

  function updateQuantity(id: string, delta: number) {
    const next = equipment
      .map((i) => (i.id === id ? { ...i, quantity: Math.max(0, i.quantity + delta) } : i))
      .filter((i) => i.quantity > 0);
    patch(next);
  }

  function removeItem(id: string) {
    patch(equipment.filter((i) => i.id !== id));
  }

  function cycleEnhancement(id: string, item: EquipmentItem) {
    const cur = item.enhancement ?? 0;
    const next = cur >= 3 ? 0 : cur + 1;
    patch(equipment.map((i) => i.id === id ? { ...i, enhancement: next } : i));
  }

  function toggleWieldMode(id: string, item: EquipmentItem) {
    const current = item.wieldMode ?? "2h";
    patch(equipment.map((i) => i.id === id ? { ...i, wieldMode: current === "2h" ? "1h" : "2h" } : i));
  }

  // ── Currency editing ───────────────────────────────────────────────────────

  function startEditCurrency(key: keyof Currency) {
    setEditingCurrency(key);
    setCurrencyDraft(String(currency[key]));
  }

  function commitCurrency(key: keyof Currency) {
    const val = parseInt(currencyDraft, 10);
    if (!isNaN(val) && val >= 0) {
      const next: Currency = { ...currency, [key]: val };
      const patch: Partial<CharacterData> = { currency: next };
      mutate(patch, () => setCurrency(character.id, next));
    }
    setEditingCurrency(null);
  }

  // ── Encumbrance ───────────────────────────────────────────────────────────

  const totalWeight = equipment.reduce((sum, i) => sum + (i.weight ?? 0) * i.quantity, 0);
  const carryCapacity = character.data.abilityScores.str * 15;
  const weightPct = carryCapacity > 0 ? totalWeight / carryCapacity : 0;
  const weightColor =
    weightPct >= 1   ? "text-red-400"   :
    weightPct >= 0.5 ? "text-amber-400" :
    "text-stone-500";

  // Off-hand occupation affects versatile weapon toggle availability
  const offhandOccupied =
    equipment.some(i => i.equipped && i.equipSlot === "shield") ||
    equipment.some(i => i.equipped && i.equipSlot === "offhand");

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <>
    <div className="space-y-4">
      {/* Currency */}
      <SectionCard title="Currency">
        <div className="flex flex-wrap gap-4">
          {CURRENCY_LABELS.map(({ key, label, color }) => (
            <div key={key} className="flex flex-col items-center min-w-[44px]">
              {editingCurrency === key ? (
                <input
                  type="number"
                  min="0"
                  value={currencyDraft}
                  onChange={(e) => setCurrencyDraft(e.target.value)}
                  onBlur={() => commitCurrency(key)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") commitCurrency(key);
                    if (e.key === "Escape") setEditingCurrency(null);
                  }}
                  className="w-14 text-center bg-stone-800 border border-amber-600 rounded px-1 py-0.5 text-sm text-stone-100 outline-none"
                  autoFocus
                />
              ) : (
                <button
                  onClick={() => startEditCurrency(key)}
                  className="text-base font-bold hover:text-amber-300 transition-colors"
                >
                  <span className={color}>{currency[key]}</span>
                </button>
              )}
              <span className="text-[10px] text-stone-500 uppercase mt-0.5">{label}</span>
            </div>
          ))}
        </div>
        <p className="text-[10px] text-stone-600 mt-3">Tap a value to edit</p>
      </SectionCard>

      {/* Equipment */}
      <SectionCard title="Equipment">
        {equipment.length > 0 ? (
          <ul className="divide-y divide-stone-800">
            {equipment.map((item) => {
              const canAttune = !!item.magic?.requiresAttunement;
              const attuneBlocked = !item.attuned && attuned >= MAX_ATTUNEMENT;
              return (
                <li key={item.id} className="py-2.5">
                  <div className="flex items-start gap-2">
                    {/* Equip toggle */}
                    <button
                      onClick={() => toggleEquip(item.id, item)}
                      title={item.equipped ? "Unequip" : "Equip"}
                      className={`mt-0.5 w-4 h-4 rounded-sm border-2 shrink-0 transition-colors ${
                        item.equipped
                          ? "bg-amber-500 border-amber-500"
                          : "bg-transparent border-stone-600 hover:border-stone-400"
                      }`}
                      aria-label={item.equipped ? `Unequip ${item.name}` : `Equip ${item.name}`}
                    />

                    {/* Item info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className={`text-sm ${rarityColor(item.magic?.rarity)}`}>
                          {item.name}{(item.enhancement ?? 0) > 0 ? ` +${item.enhancement}` : ""}
                        </span>
                        {item.equipped && item.equipSlot && (
                          <span className="text-[10px] text-amber-400 uppercase tracking-wide">
                            {SLOT_LABELS[item.equipSlot] ?? item.equipSlot}
                          </span>
                        )}
                        {item.magic?.rarity && (
                          <span className={`text-[10px] ${rarityColor(item.magic.rarity)}`}>{item.magic.rarity}</span>
                        )}
                        {item.consumable && (
                          <span className="text-[10px] text-stone-500">consumable</span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 mt-0.5 text-[10px] text-stone-500">
                        {item.weapon && (
                          <span>{item.weapon.damageDice} {item.weapon.damageType}</span>
                        )}
                        {item.armor && (
                          <span>AC {item.armor.baseAc} ({item.armor.type})</span>
                        )}
                        {item.weight !== undefined && item.weight > 0 && (
                          <span>{item.weight * item.quantity} lb.</span>
                        )}
                        {item.chargesRemaining !== undefined && item.magic?.chargesMax && (
                          <span>{item.chargesRemaining}/{item.magic.chargesMax} charges</span>
                        )}
                      </div>
                    </div>

                    {/* Right controls */}
                    <div className="flex items-center gap-1 shrink-0">
                      {/* Attunement */}
                      {canAttune && (
                        <button
                          onClick={() => toggleAttune(item.id, item)}
                          disabled={attuneBlocked}
                          title={
                            item.attuned
                              ? "Remove attunement"
                              : attuneBlocked
                              ? "Max 3 attuned items"
                              : "Attune"
                          }
                          className={`text-[10px] px-1.5 py-0.5 rounded border transition-colors ${
                            item.attuned
                              ? "border-purple-500 text-purple-300 bg-purple-900/20"
                              : attuneBlocked
                              ? "border-stone-700 text-stone-600 cursor-not-allowed"
                              : "border-stone-700 text-stone-500 hover:border-purple-600 hover:text-purple-400"
                          }`}
                          aria-label={item.attuned ? `Remove attunement from ${item.name}` : `Attune ${item.name}`}
                        >
                          {item.attuned ? "Attuned" : "Attune"}
                        </button>
                      )}

                      {/* Versatile wield-mode toggle — versatile property is authoritative */}
                      {item.weapon?.properties.includes("versatile") && item.equipSlot !== "offhand" && (() => {
                        const effectiveMode = offhandOccupied ? "1h" : (item.wieldMode ?? "2h");
                        return (
                          <button
                            onClick={() => !offhandOccupied && toggleWieldMode(item.id, item)}
                            disabled={offhandOccupied}
                            title={offhandOccupied
                              ? "Off-hand occupied — forced 1H"
                              : `Versatile: ${effectiveMode.toUpperCase()} — tap to toggle`}
                            className={`text-[10px] px-1.5 py-0.5 rounded border transition-colors ${
                              offhandOccupied
                                ? "border-stone-700 text-stone-600 cursor-not-allowed"
                                : effectiveMode === "2h"
                                ? "border-sky-600 text-sky-300 bg-sky-900/20"
                                : "border-stone-700 text-stone-500 hover:border-sky-700 hover:text-sky-400"
                            }`}
                            aria-label={`Wield mode for ${item.name}: ${effectiveMode}`}
                          >
                            {effectiveMode.toUpperCase()}
                          </button>
                        );
                      })()}

                      {/* Enhancement cycle — weapons, armor, shields only */}
                      {isEnhanceable(item) && (
                        hasBuiltInCombatBonus(item) ? (
                          (() => {
                            const bonus = getBuiltInBonus(item);
                            return bonus > 0 ? (
                              <span
                                className="text-[10px] px-1.5 py-0.5 rounded border border-amber-800 text-amber-400 font-medium"
                                title="Built-in magic bonus from item properties"
                              >
                                +{bonus}
                              </span>
                            ) : null;
                          })()
                        ) : (
                          <button
                            onClick={() => cycleEnhancement(item.id, item)}
                            title={
                              (item.enhancement ?? 0) > 0
                                ? `Enhancement +${item.enhancement} — tap to change`
                                : "No enhancement — tap to add +1"
                            }
                            className={`text-[10px] px-1.5 py-0.5 rounded border transition-colors ${
                              (item.enhancement ?? 0) > 0
                                ? "border-amber-600 text-amber-300 bg-amber-900/20"
                                : "border-stone-700 text-stone-600 hover:border-amber-700 hover:text-amber-500"
                            }`}
                            aria-label={`Enhancement for ${item.name}: currently +${item.enhancement ?? 0}`}
                          >
                            {(item.enhancement ?? 0) > 0 ? `+${item.enhancement}` : "+0"}
                          </button>
                        )
                      )}

                      {/* Quantity */}
                      <div className="flex items-center gap-0.5">
                        <button
                          onClick={() => updateQuantity(item.id, -1)}
                          className="w-6 h-6 rounded bg-stone-800 border border-stone-700 text-stone-400 text-xs flex items-center justify-center hover:border-stone-500"
                          aria-label={`Decrease ${item.name} quantity`}
                        >
                          −
                        </button>
                        <span className="text-xs text-stone-300 min-w-[1.5rem] text-center">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.id, 1)}
                          className="w-6 h-6 rounded bg-stone-800 border border-stone-700 text-stone-400 text-xs flex items-center justify-center hover:border-stone-500"
                          aria-label={`Increase ${item.name} quantity`}
                        >
                          +
                        </button>
                      </div>

                      {/* Remove */}
                      <button
                        onClick={() => removeItem(item.id)}
                        className="w-6 h-6 rounded bg-stone-800 border border-stone-700 text-stone-600 text-xs flex items-center justify-center hover:border-red-700 hover:text-red-400"
                        aria-label={`Remove ${item.name}`}
                      >
                        ×
                      </button>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        ) : (
          <EmptyState message="No equipment." />
        )}

        {/* Attunement counter */}
        {attuned > 0 && (
          <p className="text-xs text-stone-500 mt-3">
            Attunement: {attuned}/{MAX_ATTUNEMENT}
          </p>
        )}

        {/* Encumbrance */}
        {equipment.length > 0 && (
          <p className={`text-xs mt-3 ${weightColor}`}>
            Carried: {totalWeight} / {carryCapacity} lb.
            {weightPct >= 1 ? " — Heavily Encumbered" : weightPct >= 0.5 ? " — Encumbered" : ""}
          </p>
        )}

        <button
          onClick={() => setManagerOpen(true)}
          className="mt-4 w-full rounded-lg border border-stone-700 bg-stone-900 px-3 py-2.5 text-sm text-stone-400 hover:border-amber-600 hover:text-amber-300 transition-colors"
        >
          + Add Equipment
        </button>
      </SectionCard>
    </div>

    <EquipmentManager
      open={managerOpen}
      onClose={() => setManagerOpen(false)}
    />
  </>
  );
}
