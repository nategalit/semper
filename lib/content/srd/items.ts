import type { WeaponStats, ArmorStats, ToolStats, EquipmentItem } from "@/lib/types/character";

export interface SrdItem {
  id: string;
  name: string;
  itemType: "Weapon" | "Armor" | "Shield" | "Gear" | "Tool";
  weight?: number;
  cost?: { amount: number; currency: "cp" | "sp" | "ep" | "gp" | "pp" };
  weapon?: WeaponStats;
  armor?: ArmorStats;
  tool?: ToolStats;
  consumable?: boolean;
}

/** Convert a catalog SrdItem into a character EquipmentItem instance. */
export function adaptSrdItem(item: SrdItem): EquipmentItem {
  return {
    id: crypto.randomUUID(),
    name: item.name,
    quantity: 1,
    sourceId: item.id,
    ...(item.weight !== undefined ? { weight: item.weight } : {}),
    ...(item.weapon ? { weapon: item.weapon } : {}),
    ...(item.armor ? { armor: item.armor } : {}),
    ...(item.tool ? { tool: item.tool } : {}),
    ...(item.consumable ? { consumable: true } : {}),
  };
}

// ─── SRD 5.1 (CC-BY) weapon data ─────────────────────────────────────────────

const SM = "simple melee";
const SR = "simple ranged";
const MM = "martial melee";
const MR = "martial ranged";

const SIMPLE_MELEE: SrdItem[] = [
  {
    id: "srd:club", name: "Club", itemType: "Weapon", weight: 2,
    cost: { amount: 1, currency: "sp" },
    weapon: { damageDice: "1d4", damageType: "bludgeoning", attackType: "melee", properties: ["light"], category: SM },
  },
  {
    id: "srd:dagger", name: "Dagger", itemType: "Weapon", weight: 1,
    cost: { amount: 2, currency: "gp" },
    weapon: { damageDice: "1d4", damageType: "piercing", attackType: "melee", range: { normal: 20, long: 60 }, properties: ["finesse", "light", "thrown"], category: SM },
  },
  {
    id: "srd:greatclub", name: "Greatclub", itemType: "Weapon", weight: 10,
    cost: { amount: 2, currency: "sp" },
    weapon: { damageDice: "1d8", damageType: "bludgeoning", attackType: "melee", properties: ["two-handed"], category: SM },
  },
  {
    id: "srd:handaxe", name: "Handaxe", itemType: "Weapon", weight: 2,
    cost: { amount: 5, currency: "gp" },
    weapon: { damageDice: "1d6", damageType: "slashing", attackType: "melee", range: { normal: 20, long: 60 }, properties: ["light", "thrown"], category: SM },
  },
  {
    id: "srd:javelin", name: "Javelin", itemType: "Weapon", weight: 2,
    cost: { amount: 5, currency: "sp" },
    weapon: { damageDice: "1d6", damageType: "piercing", attackType: "melee", range: { normal: 30, long: 120 }, properties: ["thrown"], category: SM },
  },
  {
    id: "srd:light-hammer", name: "Light Hammer", itemType: "Weapon", weight: 2,
    cost: { amount: 2, currency: "gp" },
    weapon: { damageDice: "1d4", damageType: "bludgeoning", attackType: "melee", range: { normal: 20, long: 60 }, properties: ["light", "thrown"], category: SM },
  },
  {
    id: "srd:mace", name: "Mace", itemType: "Weapon", weight: 4,
    cost: { amount: 5, currency: "gp" },
    weapon: { damageDice: "1d6", damageType: "bludgeoning", attackType: "melee", properties: [], category: SM },
  },
  {
    id: "srd:quarterstaff", name: "Quarterstaff", itemType: "Weapon", weight: 4,
    cost: { amount: 2, currency: "sp" },
    weapon: { damageDice: "1d6", damageType: "bludgeoning", attackType: "melee", versatileDamageDice: "1d8", properties: ["versatile"], category: SM },
  },
  {
    id: "srd:sickle", name: "Sickle", itemType: "Weapon", weight: 2,
    cost: { amount: 1, currency: "gp" },
    weapon: { damageDice: "1d4", damageType: "slashing", attackType: "melee", properties: ["light"], category: SM },
  },
  {
    id: "srd:spear", name: "Spear", itemType: "Weapon", weight: 3,
    cost: { amount: 1, currency: "gp" },
    weapon: { damageDice: "1d6", damageType: "piercing", attackType: "melee", range: { normal: 20, long: 60 }, versatileDamageDice: "1d8", properties: ["thrown", "versatile"], category: SM },
  },
];

const SIMPLE_RANGED: SrdItem[] = [
  {
    id: "srd:crossbow-light", name: "Crossbow, Light", itemType: "Weapon", weight: 5,
    cost: { amount: 25, currency: "gp" },
    weapon: { damageDice: "1d8", damageType: "piercing", attackType: "ranged", range: { normal: 80, long: 320 }, properties: ["ammunition", "loading", "two-handed"], category: SR },
  },
  {
    id: "srd:dart", name: "Dart", itemType: "Weapon", weight: 0.25,
    cost: { amount: 5, currency: "cp" },
    weapon: { damageDice: "1d4", damageType: "piercing", attackType: "ranged", range: { normal: 20, long: 60 }, properties: ["finesse", "thrown"], category: SR },
  },
  {
    id: "srd:shortbow", name: "Shortbow", itemType: "Weapon", weight: 2,
    cost: { amount: 25, currency: "gp" },
    weapon: { damageDice: "1d6", damageType: "piercing", attackType: "ranged", range: { normal: 80, long: 320 }, properties: ["ammunition", "two-handed"], category: SR },
  },
  {
    id: "srd:sling", name: "Sling", itemType: "Weapon", weight: 0,
    cost: { amount: 1, currency: "sp" },
    weapon: { damageDice: "1d4", damageType: "bludgeoning", attackType: "ranged", range: { normal: 30, long: 120 }, properties: ["ammunition"], category: SR },
  },
];

const MARTIAL_MELEE: SrdItem[] = [
  {
    id: "srd:battleaxe", name: "Battleaxe", itemType: "Weapon", weight: 4,
    cost: { amount: 10, currency: "gp" },
    weapon: { damageDice: "1d8", damageType: "slashing", attackType: "melee", versatileDamageDice: "1d10", properties: ["versatile"], category: MM },
  },
  {
    id: "srd:flail", name: "Flail", itemType: "Weapon", weight: 2,
    cost: { amount: 10, currency: "gp" },
    weapon: { damageDice: "1d8", damageType: "bludgeoning", attackType: "melee", properties: [], category: MM },
  },
  {
    id: "srd:glaive", name: "Glaive", itemType: "Weapon", weight: 6,
    cost: { amount: 20, currency: "gp" },
    weapon: { damageDice: "1d10", damageType: "slashing", attackType: "melee", properties: ["heavy", "reach", "two-handed"], category: MM },
  },
  {
    id: "srd:greataxe", name: "Greataxe", itemType: "Weapon", weight: 7,
    cost: { amount: 30, currency: "gp" },
    weapon: { damageDice: "1d12", damageType: "slashing", attackType: "melee", properties: ["heavy", "two-handed"], category: MM },
  },
  {
    id: "srd:greatsword", name: "Greatsword", itemType: "Weapon", weight: 6,
    cost: { amount: 50, currency: "gp" },
    weapon: { damageDice: "2d6", damageType: "slashing", attackType: "melee", properties: ["heavy", "two-handed"], category: MM },
  },
  {
    id: "srd:halberd", name: "Halberd", itemType: "Weapon", weight: 6,
    cost: { amount: 20, currency: "gp" },
    weapon: { damageDice: "1d10", damageType: "slashing", attackType: "melee", properties: ["heavy", "reach", "two-handed"], category: MM },
  },
  {
    id: "srd:lance", name: "Lance", itemType: "Weapon", weight: 6,
    cost: { amount: 10, currency: "gp" },
    weapon: { damageDice: "1d12", damageType: "piercing", attackType: "melee", properties: ["reach", "special"], category: MM },
  },
  {
    id: "srd:longsword", name: "Longsword", itemType: "Weapon", weight: 3,
    cost: { amount: 15, currency: "gp" },
    weapon: { damageDice: "1d8", damageType: "slashing", attackType: "melee", versatileDamageDice: "1d10", properties: ["versatile"], category: MM },
  },
  {
    id: "srd:maul", name: "Maul", itemType: "Weapon", weight: 10,
    cost: { amount: 10, currency: "gp" },
    weapon: { damageDice: "2d6", damageType: "bludgeoning", attackType: "melee", properties: ["heavy", "two-handed"], category: MM },
  },
  {
    id: "srd:morningstar", name: "Morningstar", itemType: "Weapon", weight: 4,
    cost: { amount: 15, currency: "gp" },
    weapon: { damageDice: "1d8", damageType: "piercing", attackType: "melee", properties: [], category: MM },
  },
  {
    id: "srd:pike", name: "Pike", itemType: "Weapon", weight: 18,
    cost: { amount: 5, currency: "gp" },
    weapon: { damageDice: "1d10", damageType: "piercing", attackType: "melee", properties: ["heavy", "reach", "two-handed"], category: MM },
  },
  {
    id: "srd:rapier", name: "Rapier", itemType: "Weapon", weight: 2,
    cost: { amount: 25, currency: "gp" },
    weapon: { damageDice: "1d8", damageType: "piercing", attackType: "melee", properties: ["finesse"], category: MM },
  },
  {
    id: "srd:scimitar", name: "Scimitar", itemType: "Weapon", weight: 3,
    cost: { amount: 25, currency: "gp" },
    weapon: { damageDice: "1d6", damageType: "slashing", attackType: "melee", properties: ["finesse", "light"], category: MM },
  },
  {
    id: "srd:shortsword", name: "Shortsword", itemType: "Weapon", weight: 2,
    cost: { amount: 10, currency: "gp" },
    weapon: { damageDice: "1d6", damageType: "piercing", attackType: "melee", properties: ["finesse", "light"], category: MM },
  },
  {
    id: "srd:trident", name: "Trident", itemType: "Weapon", weight: 4,
    cost: { amount: 5, currency: "gp" },
    weapon: { damageDice: "1d6", damageType: "piercing", attackType: "melee", range: { normal: 20, long: 60 }, versatileDamageDice: "1d8", properties: ["thrown", "versatile"], category: MM },
  },
  {
    id: "srd:war-pick", name: "War Pick", itemType: "Weapon", weight: 2,
    cost: { amount: 5, currency: "gp" },
    weapon: { damageDice: "1d8", damageType: "piercing", attackType: "melee", properties: [], category: MM },
  },
  {
    id: "srd:warhammer", name: "Warhammer", itemType: "Weapon", weight: 2,
    cost: { amount: 15, currency: "gp" },
    weapon: { damageDice: "1d8", damageType: "bludgeoning", attackType: "melee", versatileDamageDice: "1d10", properties: ["versatile"], category: MM },
  },
  {
    id: "srd:whip", name: "Whip", itemType: "Weapon", weight: 3,
    cost: { amount: 2, currency: "gp" },
    weapon: { damageDice: "1d4", damageType: "slashing", attackType: "melee", properties: ["finesse", "reach"], category: MM },
  },
];

const MARTIAL_RANGED: SrdItem[] = [
  {
    id: "srd:blowgun", name: "Blowgun", itemType: "Weapon", weight: 1,
    cost: { amount: 10, currency: "gp" },
    weapon: { damageDice: "1", damageType: "piercing", attackType: "ranged", range: { normal: 25, long: 100 }, properties: ["ammunition", "loading"], category: MR },
  },
  {
    id: "srd:crossbow-hand", name: "Crossbow, Hand", itemType: "Weapon", weight: 3,
    cost: { amount: 75, currency: "gp" },
    weapon: { damageDice: "1d6", damageType: "piercing", attackType: "ranged", range: { normal: 30, long: 120 }, properties: ["ammunition", "light", "loading"], category: MR },
  },
  {
    id: "srd:crossbow-heavy", name: "Crossbow, Heavy", itemType: "Weapon", weight: 18,
    cost: { amount: 50, currency: "gp" },
    weapon: { damageDice: "1d10", damageType: "piercing", attackType: "ranged", range: { normal: 100, long: 400 }, properties: ["ammunition", "heavy", "loading", "two-handed"], category: MR },
  },
  {
    id: "srd:longbow", name: "Longbow", itemType: "Weapon", weight: 2,
    cost: { amount: 50, currency: "gp" },
    weapon: { damageDice: "1d8", damageType: "piercing", attackType: "ranged", range: { normal: 150, long: 600 }, properties: ["ammunition", "heavy", "two-handed"], category: MR },
  },
  {
    id: "srd:net", name: "Net", itemType: "Weapon", weight: 3,
    cost: { amount: 1, currency: "gp" },
    weapon: { damageDice: "0", damageType: "bludgeoning", attackType: "ranged", range: { normal: 5, long: 15 }, properties: ["special", "thrown"], category: MR },
  },
];

// ─── SRD 5.1 armor ────────────────────────────────────────────────────────────

const ARMOR: SrdItem[] = [
  { id: "srd:padded",          name: "Padded",          itemType: "Armor", weight: 8,  cost: { amount: 5,    currency: "gp" }, armor: { baseAc: 11, type: "light",  stealthDisadvantage: true } },
  { id: "srd:leather",         name: "Leather",         itemType: "Armor", weight: 10, cost: { amount: 10,   currency: "gp" }, armor: { baseAc: 11, type: "light"  } },
  { id: "srd:studded-leather", name: "Studded Leather",  itemType: "Armor", weight: 13, cost: { amount: 45,   currency: "gp" }, armor: { baseAc: 12, type: "light"  } },
  { id: "srd:hide",            name: "Hide",            itemType: "Armor", weight: 12, cost: { amount: 10,   currency: "gp" }, armor: { baseAc: 12, type: "medium" } },
  { id: "srd:chain-shirt",     name: "Chain Shirt",     itemType: "Armor", weight: 20, cost: { amount: 50,   currency: "gp" }, armor: { baseAc: 13, type: "medium" } },
  { id: "srd:scale-mail",      name: "Scale Mail",      itemType: "Armor", weight: 45, cost: { amount: 50,   currency: "gp" }, armor: { baseAc: 14, type: "medium", stealthDisadvantage: true } },
  { id: "srd:breastplate",     name: "Breastplate",     itemType: "Armor", weight: 20, cost: { amount: 400,  currency: "gp" }, armor: { baseAc: 14, type: "medium" } },
  { id: "srd:half-plate",      name: "Half Plate",      itemType: "Armor", weight: 40, cost: { amount: 750,  currency: "gp" }, armor: { baseAc: 15, type: "medium", stealthDisadvantage: true } },
  { id: "srd:ring-mail",       name: "Ring Mail",       itemType: "Armor", weight: 40, cost: { amount: 30,   currency: "gp" }, armor: { baseAc: 14, type: "heavy",  stealthDisadvantage: true } },
  { id: "srd:chain-mail",      name: "Chain Mail",      itemType: "Armor", weight: 55, cost: { amount: 75,   currency: "gp" }, armor: { baseAc: 16, type: "heavy",  strReq: 13, stealthDisadvantage: true } },
  { id: "srd:splint",          name: "Splint",          itemType: "Armor", weight: 60, cost: { amount: 200,  currency: "gp" }, armor: { baseAc: 17, type: "heavy",  strReq: 15, stealthDisadvantage: true } },
  { id: "srd:plate",           name: "Plate",           itemType: "Armor", weight: 65, cost: { amount: 1500, currency: "gp" }, armor: { baseAc: 18, type: "heavy",  strReq: 15, stealthDisadvantage: true } },
];

const SHIELDS: SrdItem[] = [
  { id: "srd:shield", name: "Shield", itemType: "Shield", weight: 6, cost: { amount: 10, currency: "gp" } },
];

// ─── Adventuring gear ─────────────────────────────────────────────────────────

const GEAR: SrdItem[] = [
  { id: "srd:backpack",          name: "Backpack",              itemType: "Gear",  weight: 5,    cost: { amount: 2,  currency: "gp" } },
  { id: "srd:bedroll",           name: "Bedroll",               itemType: "Gear",  weight: 7,    cost: { amount: 1,  currency: "gp" } },
  { id: "srd:candle",            name: "Candle",                itemType: "Gear",  weight: 0,    cost: { amount: 1,  currency: "cp" } },
  { id: "srd:crowbar",           name: "Crowbar",               itemType: "Gear",  weight: 5,    cost: { amount: 2,  currency: "gp" } },
  { id: "srd:grappling-hook",    name: "Grappling Hook",        itemType: "Gear",  weight: 4,    cost: { amount: 2,  currency: "gp" } },
  { id: "srd:hammer",            name: "Hammer",                itemType: "Gear",  weight: 3,    cost: { amount: 1,  currency: "gp" } },
  { id: "srd:healers-kit",       name: "Healer's Kit",          itemType: "Gear",  weight: 3,    cost: { amount: 5,  currency: "gp" }, consumable: true },
  { id: "srd:holy-water",        name: "Holy Water (flask)",    itemType: "Gear",  weight: 1,    cost: { amount: 25, currency: "gp" }, consumable: true },
  { id: "srd:lantern-bullseye",  name: "Lantern, Bullseye",     itemType: "Gear",  weight: 2,    cost: { amount: 10, currency: "gp" } },
  { id: "srd:lantern-hooded",    name: "Lantern, Hooded",       itemType: "Gear",  weight: 2,    cost: { amount: 5,  currency: "gp" } },
  { id: "srd:lock",              name: "Lock",                  itemType: "Gear",  weight: 1,    cost: { amount: 10, currency: "gp" } },
  { id: "srd:mirror-steel",      name: "Mirror, Steel",         itemType: "Gear",  weight: 0.5,  cost: { amount: 5,  currency: "gp" } },
  { id: "srd:oil-flask",         name: "Oil (flask)",           itemType: "Gear",  weight: 1,    cost: { amount: 1,  currency: "sp" }, consumable: true },
  { id: "srd:pouch",             name: "Pouch",                 itemType: "Gear",  weight: 1,    cost: { amount: 5,  currency: "sp" } },
  { id: "srd:rations",           name: "Rations (1 day)",       itemType: "Gear",  weight: 2,    cost: { amount: 5,  currency: "sp" }, consumable: true },
  { id: "srd:rope-hempen",       name: "Rope, Hempen (50 ft.)", itemType: "Gear",  weight: 10,   cost: { amount: 1,  currency: "gp" } },
  { id: "srd:rope-silk",         name: "Rope, Silk (50 ft.)",   itemType: "Gear",  weight: 5,    cost: { amount: 10, currency: "gp" } },
  { id: "srd:sack",              name: "Sack",                  itemType: "Gear",  weight: 0.5,  cost: { amount: 1,  currency: "cp" } },
  { id: "srd:signal-whistle",    name: "Signal Whistle",        itemType: "Gear",  weight: 0,    cost: { amount: 5,  currency: "cp" } },
  { id: "srd:torch",             name: "Torch",                 itemType: "Gear",  weight: 1,    cost: { amount: 1,  currency: "cp" }, consumable: true },
  { id: "srd:tinderbox",         name: "Tinderbox",             itemType: "Gear",  weight: 1,    cost: { amount: 5,  currency: "sp" } },
  { id: "srd:vial",              name: "Vial",                  itemType: "Gear",  weight: 0,    cost: { amount: 1,  currency: "gp" } },
  { id: "srd:waterskin",         name: "Waterskin",             itemType: "Gear",  weight: 5,    cost: { amount: 2,  currency: "sp" } },
];

// ─── Tools ────────────────────────────────────────────────────────────────────

const TOOLS: SrdItem[] = [
  { id: "srd:thieves-tools",       name: "Thieves' Tools",        itemType: "Tool", weight: 1, cost: { amount: 25, currency: "gp" }, tool: { associatedAbility: "dex" } },
  { id: "srd:navigators-tools",    name: "Navigator's Tools",     itemType: "Tool", weight: 2, cost: { amount: 25, currency: "gp" }, tool: { associatedAbility: "wis" } },
  { id: "srd:herbalism-kit",       name: "Herbalism Kit",         itemType: "Tool", weight: 3, cost: { amount: 5,  currency: "gp" }, tool: { associatedAbility: "wis" } },
  { id: "srd:disguise-kit",        name: "Disguise Kit",          itemType: "Tool", weight: 3, cost: { amount: 25, currency: "gp" }, tool: { associatedAbility: "cha" } },
  { id: "srd:forgery-kit",         name: "Forgery Kit",           itemType: "Tool", weight: 5, cost: { amount: 15, currency: "gp" }, tool: { associatedAbility: "dex" } },
  { id: "srd:poisoners-kit",       name: "Poisoner's Kit",        itemType: "Tool", weight: 2, cost: { amount: 50, currency: "gp" }, tool: { associatedAbility: "int" } },
  { id: "srd:alchemists-supplies", name: "Alchemist's Supplies",  itemType: "Tool", weight: 8, cost: { amount: 50, currency: "gp" }, tool: { associatedAbility: "int" } },
  { id: "srd:smiths-tools",        name: "Smith's Tools",         itemType: "Tool", weight: 8, cost: { amount: 20, currency: "gp" }, tool: { associatedAbility: "str" } },
  { id: "srd:tinkers-tools",       name: "Tinker's Tools",        itemType: "Tool", weight: 10, cost: { amount: 50, currency: "gp" }, tool: { associatedAbility: "dex" } },
  { id: "srd:woodcarvers-tools",   name: "Woodcarver's Tools",    itemType: "Tool", weight: 5, cost: { amount: 1,  currency: "gp" }, tool: { associatedAbility: "dex" } },
];

export const SRD_ITEMS: SrdItem[] = [
  ...SIMPLE_MELEE,
  ...SIMPLE_RANGED,
  ...MARTIAL_MELEE,
  ...MARTIAL_RANGED,
  ...ARMOR,
  ...SHIELDS,
  ...GEAR,
  ...TOOLS,
];
