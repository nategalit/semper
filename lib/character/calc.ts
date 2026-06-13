import type { Character, EquipmentItem, WeaponStats, OverridableStatKey } from "@/lib/types/character";
import type { AbilityKey, SrdBackground, SrdClass, SrdRace } from "@/lib/content/srd";
import { SUBCLASS_SPELLCASTING } from "@/lib/content/srd";
import type { FeatElement, StatModifier } from "@/lib/content/schema";
import { collectActiveFeatures, applyFeatureEffect } from "@/lib/features/apply";
import type { DeriveContext } from "@/lib/character/feature-effects";

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

// ─── Feat stat modifiers ──────────────────────────────────────────────────────

const FEAT_ABILITY_STAT: Record<string, AbilityKey> = {
  strength: "str",    str: "str",
  dexterity: "dex",  dex: "dex",
  constitution: "con", con: "con",
  intelligence: "int", int: "int",
  wisdom: "wis",     wis: "wis",
  charisma: "cha",   cha: "cha",
};

/** Collects all static stat modifiers from feats the character has taken. */
export function collectFeatStatMods(
  levelChoices: Character["data"]["levelChoices"],
  feats: FeatElement[]
): StatModifier[] {
  if (!levelChoices) return [];
  const pickedIds = new Set(
    Object.values(levelChoices).map((c) => c.featId).filter((id): id is string => !!id)
  );
  const result: StatModifier[] = [];
  for (const feat of feats) {
    if (pickedIds.has(feat.id)) result.push(...feat.rules.statModifiers);
  }
  return result;
}

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

export interface StatBreakdown {
  components: { label: string; value: number }[];
  total: number;
}

export interface DerivedStats {
  proficiencyBonus: number;
  abilityMods: Record<AbilityKey, number>;
  /** Base max HP (rolled per level) + Tough feat bonus. Computed in deriveStats. */
  maxHp: number;
  maxHpBreakdown: StatBreakdown;
  /** Ability scores after applying feat static bonuses (e.g. Actor +1 CHA). Use for display; raw scores are in character.data.abilityScores. */
  effectiveAbilityScores: Record<AbilityKey, number>;
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
  acBreakdown: StatBreakdown;
  initiativeBreakdown: StatBreakdown;
  savingThrowBreakdowns: Record<AbilityKey, StatBreakdown>;
  skillBreakdowns: Record<string, StatBreakdown>;
  speedBreakdown: StatBreakdown;
  passivePerceptionBreakdown: StatBreakdown;
  spellSaveDCBreakdown?: StatBreakdown;
  spellAttackBonusBreakdown?: StatBreakdown;
  // ── chunk 10a additions ──────────────────────────────────────────────────────
  /** True if any active feature grants Advantage on Initiative rolls. */
  initiativeAdvantage: boolean;
  /** Resolved Martial Arts die string (e.g. "d8") for Monks. */
  martialArtsDie?: string;
  /** Resolved Sneak Attack die string (e.g. "3d6") for Rogues. */
  sneakAttackDie?: string;
  /** Resolved Song of Rest die string (e.g. "d8") for Bards. */
  songOfRestDie?: string;
  /** CR threshold that Clerics can destroy undead outright (e.g. "1/2", "1"). */
  destroyUndeadCR?: string;
  /** Number of attacks per Attack action (2 with Extra Attack). */
  attacksPerAction?: number;
  saveAdvantages: Array<{ against: string; source: string }>;
  resistances: Array<{ damageType: string; source: string }>;
  conditionImmunities: Array<{ condition: string; source: string; whileAuraActive?: boolean }>;
  senses: Array<{ sense: string; range: number; source: string }>;
}

// ─── Main deriver ─────────────────────────────────────────────────────────────

export function deriveStats(
  character: Character,
  srdClass: SrdClass | undefined,
  srdRace: SrdRace | undefined,
  srdBackground: SrdBackground | undefined,
  featStatMods: StatModifier[] = [],
): DerivedStats {
  const pb = proficiencyBonus(character.level);
  const ABILITY_KEYS: AbilityKey[] = ["str", "dex", "con", "int", "wis", "cha"];

  // ── Cache active features (shared by Pass 1 and Pass 2) ───────────────────
  const activeFeatures = collectActiveFeatures(character);

  // ── Ability scores ────────────────────────────────────────────────────────
  // Apply feat static ability bonuses first, then FeatureEffect "ability" ops.
  const abilityScores = { ...character.data.abilityScores };
  for (const mod of featStatMods) {
    const key = FEAT_ABILITY_STAT[mod.stat.toLowerCase()];
    if (key) abilityScores[key] += mod.value;
  }

  // ── Pass 1: ability + save-prof effects (must run before abilityMods) ─────
  const extraSaveProficiencies = new Set<AbilityKey>();
  for (const featDef of activeFeatures) {
    if (!featDef.effects) continue;
    for (const eff of featDef.effects) {
      if (eff.kind === "ability") {
        const numVal =
          typeof eff.value === "number" ? eff.value
          : eff.value === "level" ? character.level
          : pb;
        const capVal = eff.cap ?? 20;
        if (eff.op === "add") {
          abilityScores[eff.ability] = Math.min(abilityScores[eff.ability] + numVal, capVal);
        } else if (eff.op === "set-min") {
          abilityScores[eff.ability] = Math.max(abilityScores[eff.ability], numVal);
        }
      }
      if (eff.kind === "save-prof") {
        if (eff.saves === "all") {
          for (const k of ABILITY_KEYS) extraSaveProficiencies.add(k);
        } else {
          for (const k of eff.saves) extraSaveProficiencies.add(k as AbilityKey);
        }
      }
    }
  }

  const abilityMods = Object.fromEntries(
    ABILITY_KEYS.map((k) => [k, abilityMod(abilityScores[k])])
  ) as Record<AbilityKey, number>;

  // ── Saving throws ─────────────────────────────────────────────────────────
  const classSaves = new Set<AbilityKey>(srdClass?.savingThrows ?? []);
  const allSaveProficiencies = new Set<AbilityKey>([...classSaves, ...extraSaveProficiencies]);
  const savingThrows = Object.fromEntries(
    ABILITY_KEYS.map((k) => [
      k,
      {
        modifier: abilityMods[k] + (allSaveProficiencies.has(k) ? pb : 0),
        proficient: allSaveProficiencies.has(k),
      },
    ])
  ) as Record<AbilityKey, SavingThrowResult>;

  // Extra save components from magic items, accumulated below.
  const saveExtraComponents = Object.fromEntries(
    ABILITY_KEYS.map(k => [k, [] as { label: string; value: number }[]])
  ) as Record<AbilityKey, { label: string; value: number }[]>;

  // ── Skills ────────────────────────────────────────────────────────────────
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

  // ── Equipment detection (needed for Pass 2 context) ───────────────────────
  const liveEquipment = character.data.equipment ?? [];
  const armorItem  = liveEquipment.find(i => i.equipped && i.equipSlot === "armor");
  const shieldItem = liveEquipment.find(i => i.equipped && i.equipSlot === "shield");
  const armorEquipped     = !!(armorItem?.armor);
  const heavyArmorEquipped = armorEquipped && armorItem!.armor!.type === "heavy";

  // ── Magic stat mods ───────────────────────────────────────────────────────
  const magicStatMods = liveEquipment
    .filter(i => i.equipped && i.magic?.statModifiers?.length &&
      (!i.magic.requiresAttunement || i.attuned))
    .flatMap(i => i.magic!.statModifiers!);

  if (magicStatMods.length > 0) {
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
        saveExtraComponents[k].push({ label: "Magic Bonus", value: allSaveBonus });
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
        saveExtraComponents[k].push({ label: "Magic Bonus", value: perBonus });
      }
    }
  }

  // Magic AC bonus — computed now, applied to armorClass during AC finalization below.
  const magicAcBonus = magicStatMods.length > 0
    ? magicStatMods
        .filter(m => { const s = m.stat.toLowerCase(); return s === "ac" || s.includes("armor class"); })
        .reduce((sum, m) => sum + m.value, 0)
    : 0;

  const initiative = abilityMods.dex;
  const passivePerception = 10 + (skills["Perception"]?.modifier ?? abilityMods.wis);
  const baseSpeed = srdRace?.speed ?? 30;

  // Spellcasting stats
  const sc = srdClass?.spellcasting
    ?? SUBCLASS_SPELLCASTING[character.data.subclassId ?? ""]
    ?? null;
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

  // Apply remaining feat stat mods (initiative, speed, AC, passive perception).
  let featInitiative = 0;
  let featSpeed = 0;
  let featAc = 0;
  let featPassivePerc = 0;
  for (const mod of featStatMods) {
    const s = mod.stat.toLowerCase();
    if (s === "initiative") { featInitiative += mod.value; continue; }
    if (s === "ac:misc" || s === "ac") { featAc += mod.value; continue; }
    if (s === "perception:passive") { featPassivePerc += mod.value; continue; }
    if (s.includes("speed") && !s.includes("climb") && !s.includes("fly") && !s.includes("swim") && !s.includes("burrow")) {
      featSpeed += mod.value;
    }
  }

  // ─── Build breakdowns ──────────────────────────────────────────────────────

  const ABILITY_LABEL: Record<AbilityKey, string> = {
    str: "STR", dex: "DEX", con: "CON", int: "INT", wis: "WIS", cha: "CHA",
  };

  const initiativeComponents: { label: string; value: number }[] = [
    { label: "DEX", value: abilityMods.dex },
  ];
  if (featInitiative !== 0) initiativeComponents.push({ label: "Feat Bonus", value: featInitiative });
  const initiativeBreakdown = { components: initiativeComponents, total: initiative + featInitiative };

  const skillBreakdowns = Object.fromEntries(
    ALL_SKILLS.map(skill => {
      const ability = SKILL_ABILITIES[skill];
      const proficient = proficientSkills.has(skill);
      const components: { label: string; value: number }[] = [
        { label: ABILITY_LABEL[ability], value: abilityMods[ability] },
      ];
      if (proficient) components.push({ label: "Proficiency", value: pb });
      return [skill, { components, total: skills[skill].modifier }];
    })
  ) as Record<string, { components: { label: string; value: number }[]; total: number }>;

  const maxHpComponents: { label: string; value: number }[] = [
    { label: "Rolled HP", value: character.data.maxHp },
  ];

  // ── Pass 2: all other feature effects ─────────────────────────────────────
  const acBaseComponents:            { label: string; value: number }[] = [];
  const acAdditiveComponents:        { label: string; value: number }[] = [];
  const speedBonusComponents:        { label: string; value: number }[] = [];
  const initiativeAdvantageSources:  string[] = [];
  const scalingStats:                Record<string, string | number> = {};
  const saveAdvantages:              Array<{ against: string; source: string }> = [];
  const resistances:                 Array<{ damageType: string; source: string }> = [];
  const conditionImmunities:         Array<{ condition: string; source: string; whileAuraActive?: boolean }> = [];
  const senses:                      Array<{ sense: string; range: number; source: string }> = [];

  for (const featDef of activeFeatures) {
    if (!featDef.effects) continue;
    const ctx: DeriveContext = {
      level: character.level,
      pb,
      featureName: featDef.name,
      characterClassId: character.classId ?? "",
      abilityMods,
      armorEquipped,
      heavyArmorEquipped,
      proficientSkills,
      skillAbilities: SKILL_ABILITIES,
      maxHpComponents,
      initiativeBreakdown,
      skillBreakdowns,
      acBaseComponents,
      acAdditiveComponents,
      speedBonusComponents,
      initiativeAdvantageSources,
      scalingStats,
      saveAdvantages,
      resistances,
      conditionImmunities,
      senses,
    };
    for (const effect of featDef.effects) {
      applyFeatureEffect(effect, ctx);
    }
  }

  const maxHp = maxHpComponents.reduce((sum, c) => sum + c.value, 0);
  const maxHpBreakdown: StatBreakdown = { components: maxHpComponents, total: maxHp };

  // ── AC finalization (after Pass 2 so effect results are available) ─────────
  const acComponents: { label: string; value: number }[] = [];
  let armorClass: number;

  if (armorItem?.armor) {
    // Armor-equipped path (unchanged)
    acComponents.push({ label: armorItem.name, value: armorItem.armor.baseAc });
    if (armorItem.enhancement) {
      acComponents.push({ label: `+${armorItem.enhancement} Enhancement`, value: armorItem.enhancement });
    }
    let dexBonus: number;
    if (armorItem.armor.type === "heavy") {
      dexBonus = 0;
    } else if (armorItem.armor.type === "medium") {
      dexBonus = Math.min(abilityMods.dex, 2);
      if (dexBonus !== 0) acComponents.push({ label: "DEX (max 2)", value: dexBonus });
    } else {
      dexBonus = abilityMods.dex;
      if (dexBonus !== 0) acComponents.push({ label: "DEX", value: dexBonus });
    }
    armorClass = armorItem.armor.baseAc + (armorItem.enhancement ?? 0) + dexBonus;
  } else if (acBaseComponents.length > 0) {
    // Effect-driven unarmored defense (Barbarian, Monk, etc.)
    // Single compound component: "Unarmored Defense (DEX + CON)" carrying the full value.
    acComponents.push(acBaseComponents[0]);
    armorClass = acBaseComponents[0].value;
  } else {
    // Default unarmored: 10 + DEX
    acComponents.push({ label: "Base", value: 10 });
    const dexBonus = abilityMods.dex;
    if (dexBonus !== 0) acComponents.push({ label: "DEX", value: dexBonus });
    armorClass = 10 + dexBonus;
  }

  // Additive effects (e.g. Defense fighting style +1 AC while wearing armor)
  for (const comp of acAdditiveComponents) {
    acComponents.push(comp);
    armorClass += comp.value;
  }

  // Shield
  if (shieldItem) {
    const shieldEnh = shieldItem.enhancement ?? 0;
    const shieldTotal = 2 + shieldEnh;
    acComponents.push({
      label: shieldEnh > 0 ? `Shield (+${shieldEnh})` : "Shield",
      value: shieldTotal,
    });
    armorClass += shieldTotal;
  }

  // Magic AC bonus
  if (magicAcBonus !== 0) {
    acComponents.push({ label: "Magic Bonus", value: magicAcBonus });
    armorClass += magicAcBonus;
  }

  if (featAc !== 0) acComponents.push({ label: "Feat Bonus", value: featAc });
  const acBreakdown: StatBreakdown = { components: acComponents, total: armorClass + featAc };

  // ── Speed finalization ─────────────────────────────────────────────────────
  const speedBonusTotal = speedBonusComponents.reduce((s, c) => s + c.value, 0);
  const speed = baseSpeed + speedBonusTotal;
  const speedComponents: { label: string; value: number }[] = [
    { label: "Base", value: baseSpeed },
    ...speedBonusComponents,
  ];
  if (featSpeed !== 0) speedComponents.push({ label: "Feat Bonus", value: featSpeed });
  const speedBreakdown: StatBreakdown = { components: speedComponents, total: speed + featSpeed };

  // ── Remaining breakdowns ───────────────────────────────────────────────────
  const percProficient = proficientSkills.has("Perception");
  const passivePercComponents: { label: string; value: number }[] = [
    { label: "Base", value: 10 },
    { label: "WIS", value: abilityMods.wis },
  ];
  if (percProficient) passivePercComponents.push({ label: "Proficiency", value: pb });
  if (featPassivePerc !== 0) passivePercComponents.push({ label: "Feat Bonus", value: featPassivePerc });
  const passivePerceptionBreakdown: StatBreakdown = {
    components: passivePercComponents,
    total: passivePerception + featPassivePerc,
  };

  const savingThrowBreakdowns = Object.fromEntries(
    ABILITY_KEYS.map(k => {
      const components: { label: string; value: number }[] = [
        { label: ABILITY_LABEL[k], value: abilityMods[k] },
      ];
      if (allSaveProficiencies.has(k)) components.push({ label: "Proficiency", value: pb });
      components.push(...saveExtraComponents[k]);
      return [k, { components, total: savingThrows[k].modifier }];
    })
  ) as Record<AbilityKey, StatBreakdown>;

  const spellSaveDCBreakdown: StatBreakdown | undefined =
    spellcastingAbility !== undefined && spellSaveDC !== undefined
      ? {
          components: [
            { label: "Base", value: 8 },
            { label: "Proficiency", value: pb },
            { label: ABILITY_LABEL[spellcastingAbility], value: spellcastingModifier! },
          ],
          total: spellSaveDC,
        }
      : undefined;

  const spellAttackBonusBreakdown: StatBreakdown | undefined =
    spellcastingAbility !== undefined && spellAttackBonus !== undefined
      ? {
          components: [
            { label: "Proficiency", value: pb },
            { label: ABILITY_LABEL[spellcastingAbility], value: spellcastingModifier! },
          ],
          total: spellAttackBonus,
        }
      : undefined;

  // ── Scaling stats → typed DerivedStats fields ──────────────────────────────
  const martialArtsDie   = scalingStats["martial-arts-die"] as string | undefined;
  const sneakAttackDie   = scalingStats["sneak-attack-die"] as string | undefined;
  const songOfRestDie    = scalingStats["song-of-rest-die"] as string | undefined;
  const destroyUndeadCR  = scalingStats["destroy-undead-cr"] as string | undefined;
  const attacksPerAction = scalingStats["attacksPerAction"] !== undefined
    ? Number(scalingStats["attacksPerAction"]) : undefined;

  // ─── Apply otherModifiers and overrides ───────────────────────────────────

  const allOverrides = character.data.overrides ?? {};
  const allOtherMods = character.data.otherModifiers ?? {};

  function applyAdj(bd: StatBreakdown, key: OverridableStatKey): StatBreakdown {
    const om = allOtherMods[key];
    const ov = allOverrides[key];
    if (!om && ov === undefined) return bd;
    const components = [...bd.components];
    let total = bd.total;
    if (om) { components.push({ label: "Other Modifier", value: om }); total += om; }
    if (ov !== undefined) { total = ov; }
    return { components, total };
  }

  const adjAc               = applyAdj(acBreakdown,               "ac");
  const adjInitiative       = applyAdj(initiativeBreakdown,       "initiative");
  const adjSpeed            = applyAdj(speedBreakdown,            "speed");
  const adjPassivePerc      = applyAdj(passivePerceptionBreakdown,"passivePerception");
  const adjSaveDC           = spellSaveDCBreakdown     ? applyAdj(spellSaveDCBreakdown,     "spellSaveDC")     : undefined;
  const adjSpellAtk         = spellAttackBonusBreakdown ? applyAdj(spellAttackBonusBreakdown,"spellAttackBonus") : undefined;

  const adjSavingThrowBreakdowns = Object.fromEntries(
    ABILITY_KEYS.map(k => [k, applyAdj(savingThrowBreakdowns[k], `save_${k}` as OverridableStatKey)])
  ) as Record<AbilityKey, StatBreakdown>;

  const adjSkillBreakdowns = Object.fromEntries(
    ALL_SKILLS.map(s => [s, applyAdj(skillBreakdowns[s], `skill_${s}` as OverridableStatKey)])
  ) as Record<string, StatBreakdown>;

  const adjSavingThrows = Object.fromEntries(
    ABILITY_KEYS.map(k => [k, { ...savingThrows[k], modifier: adjSavingThrowBreakdowns[k].total }])
  ) as Record<AbilityKey, SavingThrowResult>;

  const adjSkills = Object.fromEntries(
    ALL_SKILLS.map(s => [s, { ...skills[s], modifier: adjSkillBreakdowns[s].total }])
  ) as Record<string, SkillResult>;

  return {
    proficiencyBonus: pb,
    abilityMods,
    maxHp,
    maxHpBreakdown,
    effectiveAbilityScores: abilityScores,
    savingThrows: adjSavingThrows,
    skills: adjSkills,
    armorClass:        adjAc.total,
    initiative:        adjInitiative.total,
    passivePerception: adjPassivePerc.total,
    speed:             adjSpeed.total,
    ...(spellcastingAbility !== undefined && {
      spellcastingAbility,
      spellcastingModifier,
      spellSaveDC:        adjSaveDC?.total  ?? spellSaveDC,
      spellAttackBonus:   adjSpellAtk?.total ?? spellAttackBonus,
    }),
    weaponAttacks,
    acBreakdown:               adjAc,
    initiativeBreakdown:       adjInitiative,
    savingThrowBreakdowns:     adjSavingThrowBreakdowns,
    skillBreakdowns:           adjSkillBreakdowns,
    speedBreakdown:            adjSpeed,
    passivePerceptionBreakdown: adjPassivePerc,
    ...(adjSaveDC   && { spellSaveDCBreakdown:      adjSaveDC   }),
    ...(adjSpellAtk && { spellAttackBonusBreakdown: adjSpellAtk }),
    // ── chunk 10a new fields ─────────────────────────────────────────────────
    initiativeAdvantage: initiativeAdvantageSources.length > 0,
    ...(martialArtsDie  !== undefined && { martialArtsDie }),
    ...(sneakAttackDie  !== undefined && { sneakAttackDie }),
    ...(songOfRestDie   !== undefined && { songOfRestDie }),
    ...(destroyUndeadCR !== undefined && { destroyUndeadCR }),
    ...(attacksPerAction !== undefined && { attacksPerAction }),
    saveAdvantages,
    resistances,
    conditionImmunities,
    senses,
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
