"use client";

import { useState, useEffect, useRef } from "react";
import { useMutation } from "@/lib/character/mutation-context";
import { applyHpChange, setTempHp, setMaxHp } from "@/app/actions/characters";
import { toughHpBonus } from "@/lib/character/calc";
import type { CharacterData } from "@/lib/types/character";

interface Props {
  open: boolean;
  onClose: () => void;
}

type Mode = "damage" | "heal";

export function HpDialog({ open, onClose }: Props) {
  const { character, mutate } = useMutation();
  const [mode, setMode] = useState<Mode>("damage");
  const [amount, setAmount] = useState("");
  const [tempInput, setTempInput] = useState("");
  const [maxHpInput, setMaxHpInput] = useState("");
  const amountRef = useRef<HTMLInputElement>(null);

  const { currentHp, maxHp, tempHp } = character.data;
  const effectiveMaxHp = maxHp + toughHpBonus(character);

  // Reset form and focus amount input each time dialog opens.
  useEffect(() => {
    if (open) {
      setAmount("");
      setTempInput(String(tempHp));
      setMaxHpInput(String(maxHp));
      const t = setTimeout(() => amountRef.current?.focus(), 60);
      return () => clearTimeout(t);
    }
  }, [open, tempHp, maxHp]);

  function applyHp() {
    const n = parseInt(amount, 10);
    if (!n || n <= 0) return;

    // Mirror server logic client-side for the optimistic patch.
    let patch: Partial<CharacterData>;
    if (mode === "heal") {
      patch = { currentHp: Math.min(effectiveMaxHp, currentHp + n) };
    } else {
      const tempAbsorbed = Math.min(tempHp, n);
      patch = {
        tempHp: tempHp - tempAbsorbed,
        currentHp: Math.max(0, currentHp - (n - tempAbsorbed)),
      };
    }

    mutate(patch, () => applyHpChange(character.id, mode, n));
    onClose();
  }

  function applyTempHp() {
    const n = parseInt(tempInput, 10);
    if (isNaN(n) || n < 0) return;
    mutate({ tempHp: n }, () => setTempHp(character.id, n));
    onClose();
  }

  function applyMaxHp() {
    const n = parseInt(maxHpInput, 10);
    if (isNaN(n) || n < 1) return;
    const newCurrentHp = Math.min(currentHp, n);
    mutate({ maxHp: n, currentHp: newCurrentHp }, () => setMaxHp(character.id, n));
    onClose();
  }

  if (!open) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden
      />

      {/* Bottom sheet */}
      <div
        role="dialog"
        aria-modal
        aria-label="Adjust HP"
        className="fixed inset-x-0 bottom-0 z-50 rounded-t-2xl bg-stone-900 border-t border-stone-700 px-5 pt-4"
        style={{ paddingBottom: `max(1.5rem, env(safe-area-inset-bottom))` }}
      >
        {/* Pull handle */}
        <div className="w-10 h-1 bg-stone-700 rounded-full mx-auto mb-5" />

        {/* HP readout */}
        <div className="text-center mb-5">
          <span className="text-4xl font-bold tabular-nums text-amber-400">
            {currentHp}
          </span>
          <span className="text-2xl text-stone-500">/{effectiveMaxHp}</span>
          {tempHp > 0 && (
            <span className="ml-3 text-xl font-semibold text-sky-400">
              +{tempHp} temp
            </span>
          )}
        </div>

        {/* Damage / Heal toggle */}
        <div className="flex rounded-lg bg-stone-800 p-1 mb-4">
          {(["damage", "heal"] as const).map((m) => (
            <button
              key={m}
              onClick={() => setMode(m)}
              className={`flex-1 py-2.5 rounded-lg text-sm font-semibold capitalize transition-colors ${
                mode === m
                  ? m === "damage"
                    ? "bg-red-700 text-stone-100"
                    : "bg-emerald-700 text-stone-100"
                  : "text-stone-400 hover:text-stone-200"
              }`}
            >
              {m}
            </button>
          ))}
        </div>

        {/* Amount input with +/- steppers */}
        <div className="flex gap-2 mb-4">
          <button
            onClick={() => setAmount((v) => String(Math.max(1, (parseInt(v, 10) || 0) - 1)))}
            aria-label="Decrease amount"
            className="min-w-[48px] min-h-[48px] rounded-lg bg-stone-800 text-stone-200 text-xl font-bold hover:bg-stone-700 active:bg-stone-600 transition-colors"
          >
            −
          </button>
          <input
            ref={amountRef}
            type="number"
            min="1"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && applyHp()}
            placeholder="Amount"
            className="flex-1 min-h-[48px] rounded-lg bg-stone-800 border border-stone-700 px-3 text-center text-stone-100 text-lg font-semibold focus:outline-none focus:border-amber-500
              [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
          />
          <button
            onClick={() => setAmount((v) => String((parseInt(v, 10) || 0) + 1))}
            aria-label="Increase amount"
            className="min-w-[48px] min-h-[48px] rounded-lg bg-stone-800 text-stone-200 text-xl font-bold hover:bg-stone-700 active:bg-stone-600 transition-colors"
          >
            +
          </button>
        </div>

        {/* Apply button */}
        <button
          onClick={applyHp}
          disabled={!amount || parseInt(amount, 10) <= 0}
          className={`w-full min-h-[48px] rounded-xl font-semibold text-sm transition-colors mb-5 disabled:opacity-40 disabled:cursor-not-allowed ${
            mode === "damage"
              ? "bg-red-700 hover:bg-red-600 active:bg-red-800 text-stone-100"
              : "bg-emerald-700 hover:bg-emerald-600 active:bg-emerald-800 text-stone-100"
          }`}
        >
          Apply {mode === "damage" ? "Damage" : "Healing"}
        </button>

        {/* Temp HP section */}
        <div className="border-t border-stone-800 pt-4">
          <p className="text-[11px] font-semibold uppercase tracking-widest text-stone-500 mb-2">
            Temporary HP
          </p>
          <div className="flex gap-2">
            <input
              type="number"
              min="0"
              value={tempInput}
              onChange={(e) => setTempInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && applyTempHp()}
              className="flex-1 min-h-[44px] rounded-lg bg-stone-800 border border-stone-700 px-3 text-stone-100 text-sm focus:outline-none focus:border-sky-500
                [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
            />
            <button
              onClick={applyTempHp}
              className="min-h-[44px] px-5 rounded-xl bg-sky-800 hover:bg-sky-700 active:bg-sky-900 text-stone-100 text-sm font-semibold transition-colors"
            >
              Set
            </button>
          </div>
        </div>

        {/* Max HP section */}
        <div className="border-t border-stone-800 pt-4 pb-2">
          <p className="text-[11px] font-semibold uppercase tracking-widest text-stone-500 mb-2">
            Max HP
          </p>
          <div className="flex gap-2">
            <input
              type="number"
              min="1"
              value={maxHpInput}
              onChange={(e) => setMaxHpInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && applyMaxHp()}
              className="flex-1 min-h-[44px] rounded-lg bg-stone-800 border border-stone-700 px-3 text-stone-100 text-sm focus:outline-none focus:border-amber-500
                [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
            />
            <button
              onClick={applyMaxHp}
              className="min-h-[44px] px-5 rounded-xl bg-stone-700 hover:bg-stone-600 active:bg-stone-800 text-stone-100 text-sm font-semibold transition-colors"
            >
              Set
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
