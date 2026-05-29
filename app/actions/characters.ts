"use server";

import { revalidatePath } from "next/cache";
import { requireAuth } from "@/lib/dal";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import {
  DEFAULT_CHARACTER_DATA,
  type Character,
  type CharacterData,
  type Currency,
  type EquipmentItem,
  type NewCharacterInput,
  type UpdateCharacterInput,
} from "@/lib/types/character";
import {
  getClassFeatures,
  resolveRechargesOn,
  maxChargesFor,
} from "@/lib/character/features";

// Snake_case row as returned by Supabase Postgres.
interface CharacterRow {
  id: string;
  user_id: string;
  name: string;
  level: number;
  race_id: string | null;
  class_id: string | null;
  created_at: string;
  updated_at: string;
  data: CharacterData;
}

function mapRow(row: CharacterRow): Character {
  return {
    id: row.id,
    userId: row.user_id,
    name: row.name,
    level: row.level,
    raceId: row.race_id,
    classId: row.class_id,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    data: row.data,
  };
}

export async function createCharacter(
  input: NewCharacterInput
): Promise<Character> {
  const t0 = Date.now();

  const { userId } = await requireAuth();
  console.log(`[createCharacter] requireAuth: ${Date.now() - t0}ms`);

  const supabase = await createSupabaseServerClient();
  console.log(`[createCharacter] supabaseClient: ${Date.now() - t0}ms`);

  const { data, error } = await supabase
    .from("characters")
    .insert({
      user_id: userId,
      name: input.name,
      level: input.level ?? 1,
      race_id: input.raceId ?? null,
      class_id: input.classId ?? null,
      data: { ...DEFAULT_CHARACTER_DATA, ...input.data },
    })
    .select()
    .single();
  console.log(`[createCharacter] db insert: ${Date.now() - t0}ms`);

  if (error) throw new Error(error.message);

  revalidatePath("/dashboard");
  console.log(`[createCharacter] revalidatePath: ${Date.now() - t0}ms`);

  return mapRow(data as CharacterRow);
}

export async function listCharacters(): Promise<Character[]> {
  const { userId } = await requireAuth();
  const supabase = await createSupabaseServerClient();

  const { data, error } = await supabase
    .from("characters")
    .select()
    .eq("user_id", userId)
    .order("updated_at", { ascending: false });

  if (error) throw new Error(error.message);

  return (data as CharacterRow[]).map(mapRow);
}

export async function getCharacter(id: string): Promise<Character> {
  const { userId } = await requireAuth();
  const supabase = await createSupabaseServerClient();

  const { data, error } = await supabase
    .from("characters")
    .select()
    .eq("id", id)
    .eq("user_id", userId)
    .single();

  if (error) throw new Error(error.message);

  return mapRow(data as CharacterRow);
}

export async function updateCharacter(
  id: string,
  input: UpdateCharacterInput
): Promise<Character> {
  const { userId } = await requireAuth();
  const supabase = await createSupabaseServerClient();

  const updates: Record<string, unknown> = {};
  if (input.name !== undefined) updates.name = input.name;
  if (input.level !== undefined) updates.level = input.level;
  if ("raceId" in input) updates.race_id = input.raceId;
  if ("classId" in input) updates.class_id = input.classId;
  if (input.data !== undefined) updates.data = input.data;

  const { data, error } = await supabase
    .from("characters")
    .update(updates)
    .eq("id", id)
    .eq("user_id", userId)
    .select()
    .single();

  if (error) throw new Error(error.message);

  revalidatePath("/dashboard");
  revalidatePath(`/characters/${id}`);
  return mapRow(data as CharacterRow);
}

export async function toggleInspiration(characterId: string): Promise<void> {
  const { userId } = await requireAuth();
  const supabase = await createSupabaseServerClient();

  const { data: row, error: fetchError } = await supabase
    .from("characters")
    .select("data")
    .eq("id", characterId)
    .eq("user_id", userId)
    .single();

  if (fetchError || !row) throw new Error(fetchError?.message ?? "Not found");

  const current = row.data as CharacterData;
  const { error } = await supabase
    .from("characters")
    .update({ data: { ...current, inspiration: !current.inspiration } })
    .eq("id", characterId)
    .eq("user_id", userId);

  if (error) throw new Error(error.message);
  revalidatePath(`/characters/${characterId}`);
}

// ─── Internal patch helper ────────────────────────────────────────────────────
// Not exported. Each public mutation action provides a typed compute function
// so nested objects are always merged correctly by the action, not the caller.

async function patchCharacterData(
  id: string,
  computePatch: (current: CharacterData) => Partial<CharacterData>
): Promise<void> {
  const { userId } = await requireAuth();
  const supabase = await createSupabaseServerClient();

  const { data: row, error: fetchError } = await supabase
    .from("characters")
    .select("data")
    .eq("id", id)
    .eq("user_id", userId)
    .single();

  if (fetchError || !row) throw new Error(fetchError?.message ?? "Not found");

  const current = row.data as CharacterData;
  const merged: CharacterData = { ...current, ...computePatch(current) };

  const { error } = await supabase
    .from("characters")
    .update({ data: merged })
    .eq("id", id)
    .eq("user_id", userId);

  if (error) throw new Error(error.message);
  revalidatePath(`/characters/${id}`);
}

// ─── HP mutations ─────────────────────────────────────────────────────────────

export async function applyHpChange(
  id: string,
  mode: "damage" | "heal",
  amount: number
): Promise<void> {
  await patchCharacterData(id, (current) => {
    if (mode === "heal") {
      return { currentHp: Math.min(current.maxHp, current.currentHp + amount) };
    }
    // Damage: temporary HP absorbs first.
    const tempAbsorbed = Math.min(current.tempHp, amount);
    return {
      tempHp: current.tempHp - tempAbsorbed,
      currentHp: Math.max(0, current.currentHp - (amount - tempAbsorbed)),
    };
  });
}

export async function setTempHp(id: string, value: number): Promise<void> {
  await patchCharacterData(id, () => ({ tempHp: Math.max(0, value) }));
}

export async function setMaxHp(id: string, value: number): Promise<void> {
  await patchCharacterData(id, (current) => ({
    maxHp: Math.max(1, value),
    currentHp: Math.min(current.currentHp, Math.max(1, value)),
  }));
}

// ─── Spell slot mutations ─────────────────────────────────────────────────────

export async function expendSpellSlot(id: string, level: string): Promise<void> {
  await patchCharacterData(id, (current) => {
    const slot = current.spellSlots?.[level];
    if (!slot || slot.remaining <= 0) return {};
    return {
      spellSlots: {
        ...current.spellSlots,
        [level]: { ...slot, remaining: slot.remaining - 1 },
      },
    };
  });
}

// ─── Spell management ─────────────────────────────────────────────────────────

export async function learnSpell(id: string, spellId: string): Promise<void> {
  await patchCharacterData(id, (current) => {
    const existing = current.spellsKnown ?? [];
    if (existing.includes(spellId)) return {};
    return { spellsKnown: [...existing, spellId] };
  });
}

export async function forgetSpell(id: string, spellId: string): Promise<void> {
  await patchCharacterData(id, (current) => ({
    spellsKnown: (current.spellsKnown ?? []).filter((s) => s !== spellId),
    // Also un-prepare the spell if it was prepared.
    spellsPrepared: (current.spellsPrepared ?? []).filter((s) => s !== spellId),
  }));
}

export async function prepareSpell(id: string, spellId: string): Promise<void> {
  await patchCharacterData(id, (current) => {
    const existing = current.spellsPrepared ?? [];
    if (existing.includes(spellId)) return {};
    return { spellsPrepared: [...existing, spellId] };
  });
}

export async function unprepareSpell(id: string, spellId: string): Promise<void> {
  await patchCharacterData(id, (current) => ({
    spellsPrepared: (current.spellsPrepared ?? []).filter((s) => s !== spellId),
  }));
}

export async function restoreSpellSlot(id: string, level: string): Promise<void> {
  await patchCharacterData(id, (current) => {
    const slot = current.spellSlots?.[level];
    if (!slot || slot.remaining >= slot.total) return {};
    return {
      spellSlots: {
        ...current.spellSlots,
        [level]: { ...slot, remaining: slot.remaining + 1 },
      },
    };
  });
}

// ─── Skill proficiencies ──────────────────────────────────────────────────────

export async function setSubclass(id: string, subclassId: string): Promise<void> {
  await patchCharacterData(id, () => ({ subclassId }));
}

export async function setSkillProficiencies(
  id: string,
  skillProficiencies: string[]
): Promise<void> {
  await patchCharacterData(id, () => ({ skillProficiencies }));
}

// ─── Conditions & exhaustion ──────────────────────────────────────────────────

export async function setConditions(id: string, conditions: string[]): Promise<void> {
  await patchCharacterData(id, () => ({ conditions }));
}

export async function setExhaustion(id: string, level: number): Promise<void> {
  await patchCharacterData(id, () => ({ exhaustion: Math.max(0, Math.min(6, level)) }));
}

// ─── Death saves ──────────────────────────────────────────────────────────────

export async function setDeathSaves(
  id: string,
  successes: number,
  failures: number
): Promise<void> {
  await patchCharacterData(id, () => ({
    deathSaves: {
      successes: Math.max(0, Math.min(3, successes)),
      failures: Math.max(0, Math.min(3, failures)),
    },
  }));
}

// ─── Equipment ───────────────────────────────────────────────────────────────

export async function setEquipment(
  id: string,
  equipment: EquipmentItem[]
): Promise<void> {
  await patchCharacterData(id, () => ({ equipment }));
}

export async function setCurrency(
  id: string,
  currency: Currency
): Promise<void> {
  await patchCharacterData(id, () => ({ currency }));
}

// ─── Feature charges ──────────────────────────────────────────────────────────

export async function setFeatureCharge(
  id: string,
  key: string,
  value: number
): Promise<void> {
  await patchCharacterData(id, (current) => ({
    featureCharges: { ...current.featureCharges, [key]: Math.max(0, value) },
  }));
}

// ─── Rests ────────────────────────────────────────────────────────────────────

export async function shortRest(
  id: string,
  hpGained: number,
  diceSpent: number
): Promise<void> {
  const { userId } = await requireAuth();
  const supabase = await createSupabaseServerClient();

  const { data: row, error: fetchError } = await supabase
    .from("characters")
    .select("data, class_id, level")
    .eq("id", id)
    .eq("user_id", userId)
    .single();

  if (fetchError || !row) throw new Error(fetchError?.message ?? "Not found");

  const current = row.data as CharacterData;
  const classId = row.class_id as string | null;
  const level = row.level as number;

  const merged: CharacterData = {
    ...current,
    currentHp: Math.min(current.maxHp, current.currentHp + Math.max(0, hpGained)),
    hitDiceRemaining: Math.max(0, current.hitDiceRemaining - diceSpent),
    featureCharges: (() => {
      if (!classId) return current.featureCharges;
      const features = getClassFeatures(classId, level, {});
      const updated = { ...current.featureCharges };
      for (const def of features) {
        if (resolveRechargesOn(def, level) === "short") {
          updated[def.key] = maxChargesFor(def, level, {});
        }
      }
      return updated;
    })(),
    // Warlocks restore spell slots on short rest
    spellSlots: classId === "ID_CLASS_WARLOCK"
      ? Object.fromEntries(
          Object.entries(current.spellSlots ?? {}).map(([lvl, slot]) => [
            lvl,
            { ...slot, remaining: slot.total },
          ])
        )
      : current.spellSlots,
  };

  const { error } = await supabase
    .from("characters")
    .update({ data: merged })
    .eq("id", id)
    .eq("user_id", userId);

  if (error) throw new Error(error.message);
  revalidatePath(`/characters/${id}`);
}

export async function longRest(id: string): Promise<void> {
  const { userId } = await requireAuth();
  const supabase = await createSupabaseServerClient();

  const { data: row, error: fetchError } = await supabase
    .from("characters")
    .select("data, class_id, level")
    .eq("id", id)
    .eq("user_id", userId)
    .single();

  if (fetchError || !row) throw new Error(fetchError?.message ?? "Not found");

  const current = row.data as CharacterData;
  const classId = row.class_id as string | null;
  const level = row.level as number;

  const merged: CharacterData = {
    ...current,
    currentHp: current.maxHp,
    hitDiceRemaining: Math.min(
      current.hitDiceTotal,
      current.hitDiceRemaining + Math.max(1, Math.floor(current.hitDiceTotal / 2))
    ),
    deathSaves: { successes: 0, failures: 0 },
    spellSlots: Object.fromEntries(
      Object.entries(current.spellSlots ?? {}).map(([lvl, slot]) => [
        lvl,
        { ...slot, remaining: slot.total },
      ])
    ),
    conditions: (current.conditions ?? []).filter(
      (c) => !LONG_REST_CLEARS.has(c)
    ),
    featureCharges: (() => {
      if (!classId) return current.featureCharges;
      const features = getClassFeatures(classId, level, {});
      const updated = { ...current.featureCharges };
      for (const def of features) {
        updated[def.key] = maxChargesFor(def, level, {});
      }
      return updated;
    })(),
  };

  const { error } = await supabase
    .from("characters")
    .update({ data: merged })
    .eq("id", id)
    .eq("user_id", userId);

  if (error) throw new Error(error.message);
  revalidatePath(`/characters/${id}`);
}

const LONG_REST_CLEARS = new Set([
  "Exhaustion", // reduces by 1 level, handled separately — cleared here means level 1 cleared
  "Frightened", "Incapacitated", "Paralyzed",
]);

export async function deleteCharacter(id: string): Promise<void> {
  const { userId } = await requireAuth();
  const supabase = await createSupabaseServerClient();

  const { error } = await supabase
    .from("characters")
    .delete()
    .eq("id", id)
    .eq("user_id", userId);

  if (error) throw new Error(error.message);

  revalidatePath("/dashboard");
}
