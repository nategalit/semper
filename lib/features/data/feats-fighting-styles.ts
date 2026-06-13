// Fighting Style feat FeatureDefs — one per SRD option.
//
// origin.featId values match FightingStyle.id from lib/content/srd/fighting-styles.ts,
// which is the string stored in LevelChoiceRecord.fightingStyle. The collectActiveFeatures
// "feat" case reads levelChoices[level].featId — a separate wiring pass will connect
// fightingStyle → pickedFeatIds so these FeatureDefs are activated for characters
// that have made a fighting style choice. TODO: wiring in collectActiveFeatures.

import type { FeatureDef } from "@/lib/features/types";

export const FEAT_FIGHTING_STYLE_ARCHERY: FeatureDef = {
  id: "feat-fighting-style-archery",
  name: "Archery",
  source: "SRD",
  origin: { kind: "feat", featId: "archery" },
  prose: { fallback: "You gain a +2 bonus to attack rolls you make with ranged weapons." },
  actionType: "passive",
  actionTypeSource: "tagged",
};

export const FEAT_FIGHTING_STYLE_DEFENSE: FeatureDef = {
  id: "feat-fighting-style-defense",
  name: "Defense",
  source: "SRD",
  origin: { kind: "feat", featId: "defense" },
  prose: { fallback: "While you are wearing armor, you gain a +1 bonus to AC." },
  actionType: "passive",
  actionTypeSource: "tagged",
  effects: [
    // deriveStats consumer TODO — { kind: "ac" } not yet wired in feature-effects.ts.
    // This is the confirmed bug from testing (Fighter breastplate, Paladin both missing +1 AC).
    { kind: "ac", op: "add", value: 1, condition: { wearing: "armor" } },
  ],
};

export const FEAT_FIGHTING_STYLE_DUELING: FeatureDef = {
  id: "feat-fighting-style-dueling",
  name: "Dueling",
  source: "SRD",
  origin: { kind: "feat", featId: "dueling" },
  prose: { fallback: "When you are wielding a melee weapon in one hand and no other weapons, you gain a +2 bonus to damage rolls with that weapon." },
  actionType: "passive",
  actionTypeSource: "tagged",
};

export const FEAT_FIGHTING_STYLE_GREAT_WEAPON_FIGHTING: FeatureDef = {
  id: "feat-fighting-style-great-weapon-fighting",
  name: "Great Weapon Fighting",
  source: "SRD",
  origin: { kind: "feat", featId: "great_weapon_fighting" },
  prose: { fallback: "When you roll a 1 or 2 on a damage die for an attack with a melee weapon held in two hands, you can reroll the die and must use the new roll." },
  actionType: "passive",
  actionTypeSource: "tagged",
};

export const FEAT_FIGHTING_STYLE_PROTECTION: FeatureDef = {
  id: "feat-fighting-style-protection",
  name: "Protection",
  source: "SRD",
  origin: { kind: "feat", featId: "protection" },
  prose: { fallback: "When a creature you can see attacks a target other than you within 5 feet, you can use your reaction to impose disadvantage on the attack roll. You must be wielding a shield." },
  actionType: "reaction",
  actionTypeSource: "tagged",
};

export const FEAT_FIGHTING_STYLE_TWO_WEAPON_FIGHTING: FeatureDef = {
  id: "feat-fighting-style-two-weapon-fighting",
  name: "Two-Weapon Fighting",
  source: "SRD",
  origin: { kind: "feat", featId: "two_weapon_fighting" },
  prose: { fallback: "When you engage in two-weapon fighting, you can add your ability modifier to the damage of the second attack." },
  actionType: "passive",
  actionTypeSource: "tagged",
};
