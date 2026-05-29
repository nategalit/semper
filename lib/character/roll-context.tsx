"use client";

import { createContext, useContext } from "react";
import type { LocalRollEntry, RollEntry } from "@/lib/types/roll";
import type { AddRollInput } from "@/app/actions/rolls";

export interface RollContextValue {
  rolls: LocalRollEntry[];
  /** Roll dice, add to local list immediately, then attempt to persist. */
  roll: (input: AddRollInput & { characterId: string }) => void;
  /** Retry syncing a roll that previously failed. */
  retryRoll: (id: string) => void;
}

export const RollContext = createContext<RollContextValue | null>(null);

export function useRolls(): RollContextValue {
  const ctx = useContext(RollContext);
  if (!ctx) {
    throw new Error("useRolls must be used inside a CharacterSheet component");
  }
  return ctx;
}

/** Convert a server-fetched RollEntry to a fully-synced LocalRollEntry. */
export function toLocalRoll(roll: RollEntry): LocalRollEntry {
  return { ...roll, synced: true, syncError: false };
}
