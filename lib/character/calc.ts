import type { Character, EquipmentItem, WeaponStats } from "@/lib/types/character";
import type { AbilityKey, SrdBackground, SrdClass, SrdRace } from "@/lib/content/srd";

// ─── Skill → ability mapping ──────────────────────────────────────────────────

export const SKILL_ABILITIES: Record<string, AbilityKey> = {
  Acrobatics: "dex",
  "Animal Handling": "wis",
  Arcana: "int",
  Athletics: "str",
  Deception: "cha",
  History: "int",
  Insight: "wis",
  Intimidation: "cha",
  Investigation: "int",
  Medicine: "wis",
  Nature: "int",
  Perception: "wis",
  Performance: "cha",
  Persuasion: "cha",
  Religion: "int",
  "Sleight of Hand": "dex",
  Stealth: "dex",
  Survival: "wis",
};

export const ALL_SKILLS = Object.keys(SKILL_ABILITIES).sort();

// ─── Core formulas ────────────────────────────────────────────────────────────

export function proficiencyBonus(level: number): number {
  return Math.ceil(level / 4) + 1;
}

export function abilityMod(score: number): number {
  return Math.floor((score - 10) / 2);
}

/** Returns a signed string: "+3" or "-1". */
export function signedMod(mod: number): string {
  return mod >= 0 ? `+${mod}` : `${mod}`;
}

// ─── Derived stat interfaces ──────────────────────────────────────────────────

export interface SavingThrowResult {
  modifier: number;
  proficient: boolean;
}

export interface SkillResult {
  modifier: number;
  proficient: boolean;
  ability: AbilityKey;
}

export interface WeaponAttack {
  itemId: string;
  itemName: string;
  /** Human-readable variant label: "(two-handed)", "(thrown)", "(off-hand)", etc. */
  label?: string;
  attackBonus: number;
  damageDice: string;
  damageType: string;
  damageBonus: number;
  attackType: "melee" | "ranged";
  range?: { normal: number; long: number };
  proficient: boolean;
  /** Manual enhancement bonus applied to this weapon (+1/+2/+3). For display only — already folded into attackBonus/damageBonus. */
  enhancement?: number;
}

export interface DerivedStats {
  proficiencyBonus: number;
  abilityMods: Record<AbilityKey, number>;
  savingThrows: Record<AbilityKey, SavingThrowResult>;
  skills: Record<string, SkillResult>;
  armorClass: number;
  initiative: number;
  passivePerception: number;
  speed: number;
  spellcastingAbility?: AbilityKey;
  spellcastingModifier?: number;
  spellSaveDC?: number;
  spellAttackBonus?: number;
  weaponAttacks: WeaponAttack[];
}

// ─── Main deriver ─────────────────────────────────────────────────────────────

export function deriveStats(
  character: Character,
  srdClass: SrdClass | undefined,
  srdRace: SrdRace | undefined,
  srdBackground: SrdBackground | undefined
): DerivedStats {
  const pb = proficiencyBonus(character.level);
  const { abilityScores } = character.data;

  const ABILITY_KEYS: AbilityKey[] = ["str", "dex", "con", "int", "wis", "cha"];

  const abilityMods = Object.fromEntries(
    ABILITY_KEYS.map((k) => [k, abilityMod(abilityScores[k])])
  ) as Record<AbilityKey, number>;

  // Saving throws — proficient in the two class saves.
  const classSaves = new Set<AbilityKey>(srdClass?.savingThrows ?? []);
  const savingThrows = Object.fromEntries(
    ABILITY_KEYS.map((k) => [
      k,
      {
        modifier: abilityMods[k] + (classSaves.has(k) ? pb : 0),
        proficient: classSaves.has(k),
      },
    ])
  ) as Record<AbilityKey, SavingThrowResult>;

  // Skills — use stored skillProficiencies if present; fall back to background
  // skills only for characters created before Phase 6A (migration path).
  const storedSkills = character.data.skillProficiencies;
  const proficientSkills = new Set<string>(
    storedSkills ?? srdBackground?.skillProficiencies ?? []
  );
  const skills = Object.fromEntries(
    ALL_SKILLS.map((skill) => {
      const ability = SKILL_ABILITIES[skill];
      const proficient = proficientSkills.has(skill);
      return [
        skill,
        {
          modifier: abilityMods[ability] + (proficient ? pb : 0),
          proficient,
          ability,
        },
      ];
    })
  ) as Record<string, SkillResult>;

  // AC — single source of truth: the live equipment array.
  const liveEquipment = character.data.equipment ?? [];
  const armorItem  = liveEquipment.find(i => i.equipped && i.equipSlot === "armor");
  const shieldItem = liveEquipment.find(i => i.equipped && i.equipSlot === "shield");
  let armorClass: number;
  if (armorItem?.armor) {
    const dexBonus =
      armorItem.armor.type === "heavy"  ? 0 :
      armorItem.armor.type === "medium" ? Math.min(abilityMods.dex, 2) :
      abilityMods.dex;
    armorClass = armorItem.armor.baseAc + (armorItem.enhancement ?? 0) + dexBonus;
  } else {
    armorClass = 10 + abilityMods.dex;
    if (srdClass?.id === "ID_CLASS_BARBARIAN")
      armorClass = 10 + abilityMods.dex + abilityMods.con;
    else if (srdClass?.id === "ID_CLASS_MONK")
      armorClass = 10 + abilityMods.dex + abilityMods.wis;
  }
  if (shieldItem) armorClass += 2 + (shieldItem.enhancement ?? 0);

  // Passive magic item bonuses: statModifiers from equipped + condition-met items.
  // Items requiring attunement only contribute when attuned.
  const magicStatMods = liveEquipment
    .filter(i => i.equipped && i.magic?.statModifiers?.length &&
      (!i.magic.requiresAttunement || i.attuned))
    .flatMap(i => i.magic!.statModifiers!);

  if (magicStatMods.length > 0) {
    // AC bonus
    armorClass += magicStatMods
      .filter(m => { const s = m.stat.toLowerCase(); return s === "ac" || s.includes("armor class"); })
      .reduce((sum, m) => sum + m.value, 0);

    // All-saves bonus (e.g. Cloak of Protection)
    const allSaveBonus = magicStatMods
      .filter(m => {
        const s = m.stat.toLowerCase();
        return s === "saving throws" || s === "saving-throws" ||
          (s.includes("saving") && s.includes("all"));
      })
      .reduce((sum, m) => sum + m.value, 0);

    if (allSaveBonus !== 0) {
      for (const k of ABILITY_KEYS) {
        savingThrows[k] = { ...savingThrows[k], modifier: savingThrows[k].modifier + allSaveBonus };
      }
    }

    // Per-ability saving throw bonuses
    for (const k of ABILITY_KEYS) {
      const perBonus = magicStatMods
        .filter(m => {
          const s = m.stat.toLowerCase();
          return s.includes("saving") && !s.includes("all") &&
            s !== "saving throws" && s !== "saving-throws" && s.includes(k);
        })
        .reduce((sum, m) => sum + m.value, 0);
      if (perBonus !== 0) {
        savingThrows[k] = { ...savingThrows[k], modifier: savingThrows[k].modifier + perBonus };
      }
    }
  }

  const initiative = abilityMods.dex;
  const passivePerception = 10 + (skills["Perception"]?.modifier ?? abilityMods.wis);
  const speed = srdRace?.speed ?? 30;

  // Spellcasting stats.
  const sc = srdClass?.spellcasting ?? null;
  const spellcastingAbility = sc?.ability;
  const spellcastingModifier =
    spellcastingAbility !== undefined ? abilityMods[spellcastingAbility] : undefined;
  const spellSaveDC =
    spellcastingModifier !== undefined ? 8 + pb + spellcastingModifier : undefined;
  const spellAttackBonus =
    spellcastingModifier !== undefined ? pb + spellcastingModifier : undefined;

  const weaponAttacks = deriveWeaponAttacks(
    character.data.equipment ?? [],
    abilityMods,
    pb,
    srdClass?.weaponProficiencies ?? []
  );

  return {
    proficiencyBonus: pb,
    abilityMods,
    savingThrows,
    skills,
    armorClass,
    initiative,
    passivePerception,
    speed,
    ...(spellcastingAbility !== undefined && {
      spellcastingAbility,
      spellcastingModifier,
      spellSaveDC,
      spellAttackBonus,
    }),
    weaponAttacks,
  };
}

// ─── Weapon attack derivation ─────────────────────────────────────────────────

function isProficientWithWeapon(
  itemName: string,
  weapon: WeaponStats,
  profs: string[]
): boolean {
  const profsLower = profs.map((p) => p.toLowerCase());
  if (profsLower.includes("martial")) return true;
  if (profsLower.includes("simple") && weapon.category.includes("simple")) return true;
  // Specific named proficiencies: "Longswords" → match item named "Longsword"
  const nameLower = itemName.toLowerCase();
  return profsLower.some((p) => {
    const singular = p.replace(/s$/, "");
    return nameLower === p || nameLower === singular || nameLower.includes(singular);
  });
}

/** Standard versatile die step-up: 1d6→1d8, 1d8→1d10, 1d10→1d12. Fallback for items
 *  stored before versatileDamageDice was captured at add-time. */
function versatileUpsizeDie(damageDice: string): string {
  const UP: Record<string, string> = { "1d6": "1d8", "1d8": "1d10", "1d10": "1d12" };
  return UP[damageDice] ?? damageDice;
}

function magicBonus(item: EquipmentItem, kind: "attack" | "damage"): number {
  if (!item.magic?.statModifiers) return 0;
  return item.magic.statModifiers
    .filter((m) => m.stat.toLowerCase().includes(kind))
    .reduce((sum, m) => sum + m.value, 0);
}

function deriveWeaponAttacks(
  equipment: EquipmentItem[],
  abilityMods: Record<AbilityKey, number>,
  pb: number,
  weaponProfs: string[]
): WeaponAttack[] {
  const attacks: WeaponAttack[] = [];

  const equipped = equipment.filter((i) => i.equipped && i.weapon);

  // Detect two-weapon fighting: mainhand + offhand, both with Light property
  const mainhand = equipped.find((i) => i.equipSlot === "mainhand");
  const offhand  = equipped.find((i) => i.equipSlot === "offhand");
  const isTwoWeapon =
    mainhand?.weapon &&
    offhand?.weapon &&
    mainhand.weapon.properties.includes("light") &&
    offhand.weapon.properties.includes("light");

  for (const item of equipped) {
    const w = item.weapon!;
    const proficient = isProficientWithWeapon(item.name, w, weaponProfs);
    const magicAtk = magicBonus(item, "attack");
    const magicDmg = magicBonus(item, "damage");
    const enh = item.enhancement ?? 0;

    // Ability mod selection: finesse uses best of STR/DEX; ranged uses DEX
    const isFinesse = w.properties.includes("finesse");
    const strMod = abilityMods.str;
    const dexMod = abilityMods.dex;
    const baseAbilityMod =
      isFinesse
        ? Math.max(strMod, dexMod)
        : w.attackType === "ranged"
        ? dexMod
        : strMod;

    const attackBonus  = baseAbilityMod + (proficient ? pb : 0) + magicAtk + enh;
    const damageBonus  = baseAbilityMod + magicDmg + enh;
    const enhField = enh > 0 ? { enhancement: enh } : {};

    // Primary attack — versatile weapons emit a single attack for the active wield mode.
    const isOffhandAttack = isTwoWeapon && item.equipSlot === "offhand";
    // Check "versatile" property as authoritative signal — versatileDamageDice may be absent
    // on items that were added before this field was stored, so we fall back to die upsizing.
    const isVersatile = w.properties.includes("versatile") && item.equipSlot !== "offhand";

    if (isVersatile) {
      const hasShield = equipped.some(i => i.equipSlot === "shield");
      const hasOffhand = equipped.some(i => i.equipSlot === "offhand");
      const offhandOccupied = hasShield || hasOffhand;
      // Offhand occupied overrides any stored wieldMode preference.
      const effectiveMode: "1h" | "2h" = offhandOccupied ? "1h" : (item.wieldMode ?? "2h");
      const twoHandedDice = w.versatileDamageDice ?? versatileUpsizeDie(w.damageDice);
      attacks.push({
        itemId: item.id,
        itemName: item.name,
        attackBonus,
        damageBonus,
        damageDice: effectiveMode === "2h" ? twoHandedDice : w.damageDice,
        damageType: w.damageType,
        attackType: "melee",
        proficient,
        ...(effectiveMode === "2h" ? { label: "(two-handed)" } : {}),
        ...enhField,
      });
    } else {
      attacks.push({
        itemId: item.id,
        itemName: item.name,
        attackBonus,
        // Two-weapon offhand: no ability mod on damage, still gets enhancement
        damageBonus: isOffhandAttack ? (magicDmg + enh) : damageBonus,
        damageDice: w.damageDice,
        damageType: w.damageType,
        attackType: w.attackType,
        ...(w.range ? { range: w.range } : {}),
        proficient,
        ...(isOffhandAttack ? { label: "(off-hand)" } : {}),
        ...enhField,
      });
    }

    // Thrown: melee weapon with thrown property gets a ranged attack entry
    if (w.properties.includes("thrown") && w.attackType === "melee" && w.range) {
      attacks.push({
        itemId: item.id,
        itemName: item.name,
        label: "(thrown)",
        attackBonus,
        damageBonus,
        damageDice: w.damageDice,
        damageType: w.damageType,
        attackType: "ranged",
        range: w.range,
        proficient,
        ...enhField,
      });
    }
  }

  return attacks;
}
