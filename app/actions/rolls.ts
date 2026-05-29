"use server";

import { requireAuth } from "@/lib/dal";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { RollEntry, RollType, RollMode } from "@/lib/types/roll";

interface RollHistoryRow {
  id: string;
  character_id: string;
  user_id: string;
  rolled_at: string;
  label: string;
  dice: string;
  results: number[];
  modifier: number;
  total: number;
  mode: string | null;
  roll_type: string;
}

function mapRow(row: RollHistoryRow): RollEntry {
  return {
    id: row.id,
    characterId: row.character_id,
    rolledAt: row.rolled_at,
    label: row.label,
    dice: row.dice,
    results: row.results,
    modifier: row.modifier,
    total: row.total,
    mode: (row.mode as RollMode) ?? null,
    rollType: row.roll_type as RollType,
  };
}

export interface AddRollInput {
  label: string;
  dice: string;
  results: number[];
  modifier: number;
  total: number;
  mode: RollMode;
  rollType: RollType;
}

/** Persists a roll and returns the new row id. */
export async function addRoll(
  characterId: string,
  input: AddRollInput
): Promise<string> {
  const { userId } = await requireAuth();
  const supabase = await createSupabaseServerClient();

  const { data, error } = await supabase
    .from("roll_history")
    .insert({
      character_id: characterId,
      user_id: userId,
      label: input.label,
      dice: input.dice,
      results: input.results,
      modifier: input.modifier,
      total: input.total,
      mode: input.mode ?? null,
      roll_type: input.rollType,
    })
    .select("id")
    .single();

  if (error) throw new Error(error.message);
  return (data as { id: string }).id;
}

/** Returns the 50 most recent rolls for a character, newest first. */
export async function listRolls(characterId: string): Promise<RollEntry[]> {
  const { userId } = await requireAuth();
  const supabase = await createSupabaseServerClient();

  const { data, error } = await supabase
    .from("roll_history")
    .select()
    .eq("character_id", characterId)
    .eq("user_id", userId)
    .order("rolled_at", { ascending: false })
    .limit(50);

  if (error) throw new Error(error.message);
  return (data as RollHistoryRow[]).map(mapRow);
}
