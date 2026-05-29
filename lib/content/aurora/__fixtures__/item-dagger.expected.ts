import type { ItemElement } from "../../schema";

export const DAGGER: ItemElement = {
  elementType: "Item",
  itemType: "Weapon",
  id: "ID_WOTC_PHB_WEAPON_DAGGER",
  name: "Dagger",
  source: "Player's Handbook",
  sourceType: "imported",
  description: "",
  sheetText: "",
  // category: first ID_ in <supports> that matches WEAPON_CATEGORIES
  category: { id: "ID_INTERNAL_WEAPON_CATEGORY_SIMPLE_MELEE", name: "simple melee" },
  cost: { amount: 2, currency: "gp" },
  weight: 1,
  slot: "onehand",
  damage: {
    dice: "1d4",
    damageType: { id: "ID_INTERNAL_DAMAGE_TYPE_PIERCING", name: "piercing" },
  },
  range: { normal: 20, long: 60 },
  // properties: all WEAPON_PROPERTY IDs from <supports>, in order
  properties: [
    { id: "ID_INTERNAL_WEAPON_PROPERTY_FINESSE", name: "finesse" },
    { id: "ID_INTERNAL_WEAPON_PROPERTY_LIGHT",   name: "light" },
    { id: "ID_INTERNAL_WEAPON_PROPERTY_THROWN",  name: "thrown" },
  ],
  proficiencyId: "ID_PROFICIENCY_WEAPON_PROFICIENCY_DAGGER",
  rules: { statModifiers: [], grants: [], choices: [], extraRules: [] },
};

export const CLUB: ItemElement = {
  elementType: "Item",
  itemType: "Weapon",
  id: "ID_WOTC_PHB_WEAPON_CLUB",
  name: "Club",
  source: "Player's Handbook",
  sourceType: "imported",
  description: "",
  sheetText: "",
  category: { id: "ID_INTERNAL_WEAPON_CATEGORY_SIMPLE_MELEE", name: "simple melee" },
  cost: { amount: 1, currency: "sp" },
  weight: 2,
  slot: "onehand",
  damage: {
    dice: "1d4",
    damageType: { id: "ID_INTERNAL_DAMAGE_TYPE_BLUDGEONING", name: "bludgeoning" },
  },
  range: undefined,
  properties: [
    { id: "ID_INTERNAL_WEAPON_PROPERTY_LIGHT", name: "light" },
  ],
  proficiencyId: "ID_PROFICIENCY_WEAPON_PROFICIENCY_CLUB",
  rules: { statModifiers: [], grants: [], choices: [], extraRules: [] },
};
