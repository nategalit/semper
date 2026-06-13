import type {
  BackgroundElement,
  ClassElement,
  GrantedElement,
  ItemElement,
  RaceElement,
  SubclassElement,
  SubraceElement,
} from "../schema";
import type { AbilityKey, SrdBackground, SrdClass, SrdRace, SrdSubclass, SrdSubrace } from "../srd/types";
import type { EquipmentItem, WeaponStats, ArmorStats, MagicItemStats } from "../../types/character";
import { abbreviateSource } from "../source-abbreviations";

// ─── Ability stat maps ────────────────────────────────────────────────────────

const STAT_TO_ABILITY: Record<string, AbilityKey> = {
  strength: "str",
  dexterity: "dex",
  constitution: "con",
  intelligence: "int",
  wisdom: "wis",
  charisma: "cha",
};

// Suffixes found in Aurora saving throw proficiency IDs
const SAVE_ID_SUFFIX_TO_ABILITY: [string, AbilityKey][] = [
  ["SAVINGTHROW_STRENGTH", "str"],
  ["SAVINGTHROW_DEXTERITY", "dex"],
  ["SAVINGTHROW_CONSTITUTION", "con"],
  ["SAVINGTHROW_INTELLIGENCE", "int"],
  ["SAVINGTHROW_WISDOM", "wis"],
  ["SAVINGTHROW_CHARISMA", "cha"],
];

// ─── SRD ID normalization ─────────────────────────────────────────────────────

/**
 * Maps known Aurora class names to canonical SRD class IDs.
 * This ensures cantripLimit / maxCastableSpellLevel tables match regardless
 * of which Aurora book version of a class is selected.
 */
const SRD_CLASS_ID_BY_NAME: Record<string, string> = {
  Barbarian: "ID_CLASS_BARBARIAN",
  Bard:      "ID_CLASS_BARD",
  Cleric:    "ID_CLASS_CLERIC",
  Druid:     "ID_CLASS_DRUID",
  Fighter:   "ID_CLASS_FIGHTER",
  Monk:      "ID_CLASS_MONK",
  Paladin:   "ID_CLASS_PALADIN",
  Ranger:    "ID_CLASS_RANGER",
  Rogue:     "ID_CLASS_ROGUE",
  Sorcerer:  "ID_CLASS_SORCERER",
  Warlock:   "ID_CLASS_WARLOCK",
  Wizard:    "ID_CLASS_WIZARD",
  Artificer:       "ID_CLASS_ARTIFICER",
  "Blood Hunter":  "ID_CLASS_BLOOD_HUNTER",
};

/**
 * Maps known Aurora race names to canonical SRD race IDs.
 */
const SRD_RACE_ID_BY_NAME: Record<string, string> = {
  Dwarf:      "ID_RACE_DWARF",
  Elf:        "ID_RACE_ELF",
  Halfling:   "ID_RACE_HALFLING",
  Human:      "ID_RACE_HUMAN",
  Dragonborn: "ID_RACE_DRAGONBORN",
  Gnome:      "ID_RACE_GNOME",
  "Half-Elf": "ID_RACE_HALFELF",
  "Half-Orc": "ID_RACE_HALFORC",
  Tiefling:   "ID_RACE_TIEFLING",
};

// ─── Spellcasting ─────────────────────────────────────────────────────────────

const SPELLCASTING_ABILITY_BY_CLASS_NAME: Record<string, AbilityKey> = {
  Bard:          "cha",
  Cleric:        "wis",
  Druid:         "wis",
  Paladin:       "cha",
  Ranger:        "wis",
  Sorcerer:      "cha",
  Warlock:       "cha",
  Wizard:        "int",
  Artificer:     "int",
  "Blood Hunter": "int",
};

// ─── Skill lists ──────────────────────────────────────────────────────────────

const ALL_SKILLS = [
  "Acrobatics","Animal Handling","Arcana","Athletics","Deception","History",
  "Insight","Intimidation","Investigation","Medicine","Nature","Perception",
  "Performance","Persuasion","Religion","Sleight of Hand","Stealth","Survival",
];

const CLASS_SKILL_LISTS: Record<string, string[]> = {
  Barbarian:  ["Animal Handling","Athletics","Intimidation","Nature","Perception","Survival"],
  Bard:       ALL_SKILLS,
  Cleric:     ["History","Insight","Medicine","Persuasion","Religion"],
  Druid:      ["Arcana","Animal Handling","Insight","Medicine","Nature","Perception","Religion","Survival"],
  Fighter:    ["Acrobatics","Animal Handling","Athletics","History","Insight","Intimidation","Perception","Survival"],
  Monk:       ["Acrobatics","Athletics","History","Insight","Religion","Stealth"],
  Paladin:    ["Athletics","Insight","Intimidation","Medicine","Persuasion","Religion"],
  Ranger:     ["Animal Handling","Athletics","Insight","Investigation","Nature","Perception","Stealth","Survival"],
  Rogue:      ["Acrobatics","Athletics","Deception","Insight","Intimidation","Investigation","Perception","Performance","Persuasion","Sleight of Hand","Stealth"],
  Sorcerer:   ["Arcana","Deception","Insight","Intimidation","Persuasion","Religion"],
  Warlock:    ["Arcana","Deception","History","Intimidation","Investigation","Nature","Religion"],
  Wizard:     ["Arcana","History","Insight","Investigation","Medicine","Religion"],
  Artificer:  ["Arcana","History","Investigation","Medicine","Nature","Perception","Sleight of Hand"],
};

// ─── Primary abilities lookup ─────────────────────────────────────────────────

const PRIMARY_ABILITIES_BY_CLASS_NAME: Record<string, AbilityKey[]> = {
  Barbarian:  ["str"],
  Bard:       ["cha"],
  Cleric:     ["wis"],
  Druid:      ["wis"],
  Fighter:    ["str", "dex"],
  Monk:       ["dex", "wis"],
  Paladin:    ["str", "cha"],
  Ranger:     ["dex", "wis"],
  Rogue:      ["dex"],
  Sorcerer:   ["cha"],
  Warlock:    ["cha"],
  Wizard:     ["int"],
  Artificer:  ["int"],
};

// ─── Trait name derivation ────────────────────────────────────────────────────

// Aurora IDs encode apostrophes by omitting them (PALADINS_SMITE → "Paladins Smite").
// These corrections restore the canonical display name.
const APOSTROPHE_CORRECTIONS: Record<string, string> = {
  "Paladins Smite": "Paladin's Smite",
  "Monks Focus":    "Monk's Focus",
};

/**
 * Derives a human-readable name from an Aurora element ID for racial traits.
 * e.g. "ID_RACIAL_TRAIT_TIEFLING_HELLISH_RESISTANCE" + raceName="Tiefling"
 *   → strips ID_, optional source prefix, category, race prefix
 *   → "Hellish Resistance"
 */
function deriveTraitName(id: string, raceName: string): string {
  let s = id.replace(/^ID_/, "");
  // Strip one optional source-book segment: WOTC_PHB_, WOTC_SCAG_, etc.
  s = s.replace(/^(?:WOTC|UA|MPMM|CR|MTF|VGTM|SCAG|XGTE|TCOE|ERLW|RLW|DMSG|WBTW|TCE)_[A-Z0-9]+_/, "");
  // Strip UA with numeric date: UA20171113_
  s = s.replace(/^UA[0-9]+_/, "");
  // Strip category prefix
  s = s.replace(/^(?:RACIAL_TRAIT_|BACKGROUND_FEATURE_|VISION_|GRANTS_|CLASS_FEATURE_[A-Z]+_)/, "");
  // Strip leading race name (e.g. TIEFLING_, HALFELF_, DRAGONBORN_)
  const racePrefix = raceName.toUpperCase().replace(/[^A-Z]/g, "") + "_";
  if (s.startsWith(racePrefix)) s = s.slice(racePrefix.length);
  const derived = s.split("_").map((w) => w.charAt(0) + w.slice(1).toLowerCase()).join(" ");
  return APOSTROPHE_CORRECTIONS[derived] ?? derived;
}

// ─── Grant extraction helpers ─────────────────────────────────────────────────

const ARMOR_ID_FRAGMENTS: [string, string][] = [
  ["LIGHT_ARMOR",  "Light"],
  ["MEDIUM_ARMOR", "Medium"],
  ["HEAVY_ARMOR",  "Heavy"],
  ["SHIELDS",      "Shields"],
];

function extractArmorProfs(grants: GrantedElement[]): string[] {
  const result: string[] = [];
  for (const g of grants) {
    if (!g.id.includes("ARMOR_PROFICIENCY")) continue;
    for (const [fragment, label] of ARMOR_ID_FRAGMENTS) {
      if (g.id.includes(fragment) && !result.includes(label)) result.push(label);
    }
  }
  return result;
}

const WEAPON_ID_FRAGMENTS: [string, string][] = [
  ["SIMPLE_WEAPONS",  "Simple"],
  ["MARTIAL_WEAPONS", "Martial"],
  ["SHORTSWORDS",     "Shortswords"],
  ["LONGSWORDS",      "Longswords"],
  ["RAPIERS",         "Rapiers"],
  ["HAND_CROSSBOWS",  "Hand Crossbows"],
  ["LIGHT_CROSSBOWS", "Light Crossbows"],
  ["QUARTERSTAFFS",   "Quarterstaffs"],
  ["DAGGERS",         "Daggers"],
  ["DARTS",           "Darts"],
  ["SLINGS",          "Slings"],
];

function extractWeaponProfs(grants: GrantedElement[]): string[] {
  const result: string[] = [];
  for (const g of grants) {
    if (!g.id.includes("WEAPON_PROFICIENCY")) continue;
    for (const [fragment, label] of WEAPON_ID_FRAGMENTS) {
      if (g.id.includes(fragment) && !result.includes(label)) result.push(label);
    }
  }
  return result;
}

function extractSavingThrows(grants: GrantedElement[]): AbilityKey[] {
  const result: AbilityKey[] = [];
  for (const g of grants) {
    for (const [suffix, ability] of SAVE_ID_SUFFIX_TO_ABILITY) {
      if (g.id.includes(suffix) && !result.includes(ability)) result.push(ability);
    }
  }
  return result;
}

// ─── Subclass unlock level ────────────────────────────────────────────────────

// ID fragments (uppercase) that mark a subclass selection grant — specific first
const SUBCLASS_ID_KEYWORDS = [
  "MARTIAL_ARCHETYPE", "SACRED_OATH", "DIVINE_DOMAIN", "DRUIDIC_CIRCLE",
  "ROGUISH_ARCHETYPE", "SORCEROUS_ORIGIN", "OTHERWORLDLY_PATRON", "BARDIC_COLLEGE",
  "MONASTIC_TRADITION", "RANGER_ARCHETYPE", "ARCANE_TRADITION", "PRIMAL_PATH",
  "ARTIFICER_SPECIALIST",
  // generic fallbacks — broad but class feature IDs rarely collide
  "_ARCHETYPE", "_DOMAIN", "_ORIGIN", "_PATRON", "_CIRCLE", "_TRADITION", "_OATH", "_COLLEGE",
];

function detectSubclassLevel(grants: GrantedElement[]): 1 | 2 | 3 {
  for (const g of grants) {
    if (g.type !== "Class Feature") continue;
    const id = g.id.toUpperCase();
    if (SUBCLASS_ID_KEYWORDS.some((kw) => id.includes(kw))) {
      const lvl = g.level ?? 3;
      return lvl <= 1 ? 1 : lvl === 2 ? 2 : 3;
    }
  }
  return 3;
}

// ─── Spellcasting detection ───────────────────────────────────────────────────

function detectSpellcasting(
  grants: GrantedElement[],
  className: string
): SrdClass["spellcasting"] {
  for (const g of grants) {
    if (g.type !== "Class Feature") continue;
    const id = g.id.toUpperCase();
    if (id.includes("SPELLCASTING") || id.includes("PACT_MAGIC")) {
      const ability = SPELLCASTING_ABILITY_BY_CLASS_NAME[className] ?? "int";
      return { ability, startsAtLevel: g.level ?? 1 };
    }
  }
  return null;
}

// ─── Ability score bonus extraction ──────────────────────────────────────────

function extractAbilityBonuses(
  el: RaceElement | SubraceElement
): Partial<Record<AbilityKey, number>> {
  const bonuses: Partial<Record<AbilityKey, number>> = {};
  for (const mod of el.rules.statModifiers) {
    const ability = STAT_TO_ABILITY[mod.stat.toLowerCase()];
    if (ability) bonuses[ability] = (bonuses[ability] ?? 0) + mod.value;
  }
  return bonuses;
}

// ─── Public adapters ──────────────────────────────────────────────────────────

export function adaptAuroraSubrace(el: SubraceElement): SrdSubrace {
  return {
    id: el.id,
    name: el.name,
    description: el.description,
    abilityScoreBonuses: extractAbilityBonuses(el),
  };
}

export function adaptAuroraRace(
  el: RaceElement,
  subraceEls: SubraceElement[] = []
): SrdRace {
  const speedMod = el.rules.statModifiers.find(
    (m) => m.stat === "innate speed" && m.bonus === "base"
  );
  const speed = speedMod?.value ?? 30;

  const sizeGrant = el.rules.grants.find((g) => g.type === "Size");
  const size: "Small" | "Medium" = sizeGrant?.id === "ID_SIZE_SMALL" ? "Small" : "Medium";

  // Resolved Vision grants (lookupId knows these) + Racial Trait grants (derive from ID)
  const traits: string[] = [];
  for (const g of el.rules.grants) {
    if (g.type === "Vision" && g.name) {
      traits.push(g.name);
    } else if (g.type === "Racial Trait") {
      traits.push(g.name ?? deriveTraitName(g.id, el.name));
    }
  }

  // Detect flexible ability score improvement choices (e.g. Half-Elf picks +1 to any two).
  // Skip TCoE/UA opt-in choices whose requirements start with an ID (meaning: only active
  // when the player opts into a variant rule — not a core racial feature).
  const flexibleChoice = el.rules.choices.find((c) => {
    if (c.kind !== "element" || (c as { type: string }).type !== "Ability Score Improvement") return false;
    const req = ((c as { requirements?: string }).requirements ?? "").trim();
    return !req || req.startsWith("!");
  });
  const flexibleBonuses = flexibleChoice
    ? { count: (flexibleChoice as { number: number }).number, amount: 1 }
    : undefined;

  const languages: string[] = el.rules.grants
    .filter((g) => g.type === "Language" && g.name)
    .map((g) => g.name!);

  return {
    id: el.id,
    name: el.name,
    description: el.description,
    speed,
    size,
    abilityScoreBonuses: extractAbilityBonuses(el),
    ...(flexibleBonuses ? { flexibleBonuses } : {}),
    traits,
    ...(languages.length > 0 ? { languages } : {}),
    subraces: subraceEls.map(adaptAuroraSubrace),
    subraceRequired: el.subraceRequired,
    sourceLabel: abbreviateSource(el.source),
  };
}

export function adaptAuroraClass(el: ClassElement): SrdClass {
  const hitDie = parseInt(el.hitDie.replace("d", ""), 10) || 8;
  const grants = el.rules.grants;

  const savingThrows = extractSavingThrows(grants);
  const armorProficiencies = extractArmorProfs(grants);
  const weaponProficiencies = extractWeaponProfs(grants);

  const skillChoice = el.rules.choices.find(
    (c) => c.kind === "element" && c.type === "Proficiency" && c.supports.includes("Skill")
  );
  const skillCount = skillChoice ? (skillChoice as { number: number }).number : 2;
  const skillFrom = CLASS_SKILL_LISTS[el.name] ?? ALL_SKILLS;

  const subclassUnlockLevel = detectSubclassLevel(grants);
  const spellcasting = detectSpellcasting(grants, el.name);

  const featureKeys = grants
    .filter((g) => g.type === "Class Feature")
    .map((g) => g.name ?? deriveTraitName(g.id, el.name))
    .sort();

  const featuresByLevel: Record<number, string[]> = {};
  for (const g of grants) {
    if (g.type !== "Class Feature") continue;
    const name = g.name ?? deriveTraitName(g.id, el.name);
    const lvl = g.level ?? 1;
    (featuresByLevel[lvl] ??= []).push(name);
  }

  return {
    id: SRD_CLASS_ID_BY_NAME[el.name] ?? el.id,
    name: el.name,
    description: el.description,
    hitDie,
    primaryAbilities: PRIMARY_ABILITIES_BY_CLASS_NAME[el.name] ?? ["str"],
    savingThrows: savingThrows.length >= 2
      ? [savingThrows[0], savingThrows[1]]
      : ["str", "con"],
    armorProficiencies,
    weaponProficiencies,
    skillChoices: { from: skillFrom, count: skillCount },
    subclassUnlockLevel,
    spellcasting,
    featureKeys,
    ...(Object.keys(featuresByLevel).length > 0 ? { featuresByLevel } : {}),
    sourceLabel: abbreviateSource(el.source),
  };
}

/**
 * Maps Aurora archetype <supports> strings (parentClass) to canonical SRD class IDs.
 * Aurora subclasses use archetype category names like "Divine Domain" rather than the
 * class name "Cleric", so the name-based class lookup in page.tsx always falls back here.
 */
export const SUBCLASS_PARENT_TO_CLASS_ID: Record<string, string> = {
  // ── 2014 archetype categories ──────────────────────────────────────────────
  "Divine Domain":    "ID_CLASS_CLERIC",
  "Arcane Tradition": "ID_CLASS_WIZARD",
  "Primal Path":      "ID_CLASS_BARBARIAN",
  "Bard College":     "ID_CLASS_BARD",
  "Druid Circle":     "ID_CLASS_DRUID",
  "Otherworldly Patron": "ID_CLASS_WARLOCK",
  "Martial Archetype":   "ID_CLASS_FIGHTER",
  "Sacred Oath":         "ID_CLASS_PALADIN",
  "Roguish Archetype":   "ID_CLASS_ROGUE",
  "Monastic Tradition":  "ID_CLASS_MONK",
  "Sorcerous Origin":    "ID_CLASS_SORCERER",
  "Ranger Archetype":                     "ID_CLASS_RANGER",
  "Ranger Archetype, Ranger Conclave":    "ID_CLASS_RANGER",
  "Ranger Conclave":                      "ID_CLASS_RANGER",
  // ── Artificer (all variants) ───────────────────────────────────────────────
  "Artificer Specialist":               "ID_CLASS_ARTIFICER",
  "Artificer Specialist, ERLW Version": "ID_CLASS_ARTIFICER",
  "Artificer Specialist, TCOE Base":    "ID_CLASS_ARTIFICER",
  "UA Artificer Specialist":            "ID_CLASS_ARTIFICER",
  "UA20170109 Artificer Specialist":    "ID_CLASS_ARTIFICER",
  // ── 2024 archetype categories (PHB 2024) ───────────────────────────────────
  "Barbarian Subclass": "ID_CLASS_BARBARIAN",
  "Bard Subclass":      "ID_CLASS_BARD",
  "Cleric Subclass":    "ID_CLASS_CLERIC",
  "Druid Subclass":     "ID_CLASS_DRUID",
  "Fighter Subclass":   "ID_CLASS_FIGHTER",
  "Monk Subclass":      "ID_CLASS_MONK",
  "Paladin Subclass":   "ID_CLASS_PALADIN",
  "Ranger Subclass":    "ID_CLASS_RANGER",
  "Rogue Subclass":     "ID_CLASS_ROGUE",
  "Sorcerer Subclass":  "ID_CLASS_SORCERER",
  "Warlock Subclass":   "ID_CLASS_WARLOCK",
  "Wizard Subclass":    "ID_CLASS_WIZARD",
};

export function adaptAuroraSubclass(el: SubclassElement, classId: string): SrdSubclass {
  const features = el.rules.grants
    .filter((g) => g.type === "Class Feature" && g.name)
    .map((g) => g.name!);
  return {
    id: el.id,
    classId,
    name: el.name,
    description: el.description,
    features,
    sourceLabel: abbreviateSource(el.source),
  };
}

// ─── Item adapter ─────────────────────────────────────────────────────────────

const CONSUMABLE_PATTERNS = [
  /^potion/i, /^scroll/i, /^arrow/i, /^bolt/i, /^bullet/i,
  /^needle/i, /^ration/i, /^candle\b/i, /^torch\b/i,
  /^oil\b/i, /^antitoxin/i, /^acid\b/i, /^alchemist's fire/i,
];

const TOOL_ABILITY_MAP: Record<string, AbilityKey> = {
  "Alchemist's Supplies": "int", "Brewer's Supplies": "int",
  "Calligrapher's Supplies": "dex", "Carpenter's Tools": "str",
  "Cartographer's Tools": "int", "Cobbler's Tools": "dex",
  "Cook's Utensils": "wis", "Glassblower's Tools": "int",
  "Jeweler's Tools": "int", "Leatherworker's Tools": "dex",
  "Mason's Tools": "str", "Painter's Supplies": "wis",
  "Potter's Tools": "dex", "Smith's Tools": "str",
  "Tinker's Tools": "dex", "Weaver's Tools": "dex",
  "Woodcarver's Tools": "dex", "Disguise Kit": "cha",
  "Forgery Kit": "dex", "Herbalism Kit": "wis",
  "Navigator's Tools": "wis", "Poisoner's Kit": "int",
  "Thieves' Tools": "dex", "Healer's Kit": "wis",
};

export function adaptAuroraItem(el: ItemElement): EquipmentItem {
  const item: EquipmentItem = {
    id: crypto.randomUUID(),
    name: el.name,
    quantity: 1,
    sourceId: el.id,
    ...(el.weight !== undefined ? { weight: el.weight } : {}),
    ...(CONSUMABLE_PATTERNS.some((p) => p.test(el.name)) ? { consumable: true } : {}),
  };

  // Weapon sub-object — present when the item has damage and a category
  if (el.damage && el.category) {
    const categoryName = el.category.name.toLowerCase();
    const attackType: "melee" | "ranged" = categoryName.includes("ranged") ? "ranged" : "melee";
    const weapon: WeaponStats = {
      damageDice: el.damage.dice,
      damageType: el.damage.damageType.name.toLowerCase(),
      attackType,
      properties: el.properties.map((p) => p.name.toLowerCase()),
      category: categoryName,
    };
    if (el.versatileDamageDice) weapon.versatileDamageDice = el.versatileDamageDice;
    if (el.range) weapon.range = el.range;
    if (el.proficiencyId) weapon.proficiencyId = el.proficiencyId;
    item.weapon = weapon;
  }

  // Armor sub-object — present when armorBaseAc is parsed
  if (el.armorBaseAc !== undefined) {
    // Fall back to AC-range heuristic if armorType wasn't in supports text
    const type: ArmorStats["type"] =
      el.armorType ?? (el.armorBaseAc <= 12 ? "light" : el.armorBaseAc <= 15 ? "medium" : "heavy");
    const armor: ArmorStats = { baseAc: el.armorBaseAc, type };
    if (el.armorStrReq) armor.strReq = el.armorStrReq;
    if (el.stealthDisadvantage) armor.stealthDisadvantage = true;
    item.armor = armor;
  }

  // Magic sub-object — present when rarity or attunement metadata exists
  if (el.rarity || el.attunement) {
    const modifiers = el.rules.statModifiers
      .filter((m) => !m.requirements)
      .map((m) => ({ stat: m.stat, value: m.value }));
    const magic: MagicItemStats = {
      rarity: el.rarity ?? "Common",
      requiresAttunement: !!el.attunement,
      statModifiers: modifiers.length > 0 ? modifiers : undefined,
      grantedFeatures: [],
    };
    if (el.attunement) magic.attunementNote = el.attunement;
    if (el.charges !== undefined) {
      magic.chargesMax = el.charges;
      item.chargesRemaining = el.charges;
    }
    item.magic = magic;
  }

  // Tool sub-object
  if (el.itemType === "Tool") {
    item.tool = {
      ...(el.proficiencyId ? { proficiencyId: el.proficiencyId } : {}),
      ...(TOOL_ABILITY_MAP[el.name] ? { associatedAbility: TOOL_ABILITY_MAP[el.name] } : {}),
    };
  }

  return item;
}

export function adaptAuroraBackground(el: BackgroundElement): SrdBackground {
  const skillGrants = el.rules.grants.filter(
    (g) => g.type === "Proficiency" && g.id.includes("PROFICIENCY_SKILL_") && g.name
  );
  const skills = skillGrants.map((g) => g.name!);

  const toolGrant = el.rules.grants.find(
    (g) =>
      g.type === "Proficiency" &&
      g.id.includes("TOOL_PROFICIENCY") &&
      !g.id.includes("VEHICLES") &&
      g.name
  );

  const langChoices = el.rules.choices.filter(
    (c) => c.kind === "element" && (c as { type: string }).type === "Language"
  );
  const languageCount = langChoices.length > 0
    ? langChoices.reduce((sum, c) => sum + (c as { number: number }).number, 0)
    : undefined;

  const featureGrant = el.rules.grants.find((g) => g.type === "Background Feature" && g.name);

  return {
    id: el.id,
    name: el.name,
    description: el.description,
    skillProficiencies: [skills[0] ?? "Athletics", skills[1] ?? "Perception"],
    ...(toolGrant?.name ? { toolProficiency: toolGrant.name } : {}),
    ...(languageCount ? { languages: languageCount } : {}),
    ...(featureGrant?.name ? { featureName: featureGrant.name } : {}),
    sourceLabel: abbreviateSource(el.source),
  };
}
