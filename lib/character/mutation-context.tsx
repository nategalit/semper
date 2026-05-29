"use client";

import { createContext, useContext } from "react";
import type { Character, CharacterData } from "@/lib/types/character";

export interface MutationContextValue {
  /** The current character, including any pending optimistic updates. */
  character: Character;
  /**
   * Apply a patch optimistically and fire a server action in the background.
   * The optimistic state reverts automatically if the server action throws.
   */
  mutate: (patch: Partial<CharacterData>, action: () => Promise<void>) => void;
  isPending: boolean;
}

export const CharacterMutationContext =
  createContext<MutationContextValue | null>(null);

export function useMutation(): MutationContextValue {
  const ctx = useContext(CharacterMutationContext);
  if (!ctx) {
    throw new Error("useMutation must be used inside a CharacterSheet component");
  }
  return ctx;
}
