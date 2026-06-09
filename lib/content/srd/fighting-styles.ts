export interface FightingStyle {
  id: string;
  name: string;
  description: string;
}

/** SRD 5.1 Fighting Style options. */
export const FIGHTING_STYLES: FightingStyle[] = [
  {
    id: "archery",
    name: "Archery",
    description: "You gain a +2 bonus to attack rolls you make with ranged weapons.",
  },
  {
    id: "defense",
    name: "Defense",
    description: "While you are wearing armor, you gain a +1 bonus to AC.",
  },
  {
    id: "dueling",
    name: "Dueling",
    description: "When you are wielding a melee weapon in one hand and no other weapons, you gain a +2 bonus to damage rolls with that weapon.",
  },
  {
    id: "great_weapon_fighting",
    name: "Great Weapon Fighting",
    description: "When you roll a 1 or 2 on a damage die for an attack with a melee weapon held in two hands, you can reroll and must use the new roll.",
  },
  {
    id: "protection",
    name: "Protection",
    description: "When a creature you can see attacks a target other than you within 5 feet, you can use your reaction to impose disadvantage on the attack roll. You must be wielding a shield.",
  },
  {
    id: "two_weapon_fighting",
    name: "Two-Weapon Fighting",
    description: "When you engage in two-weapon fighting, you can add your ability modifier to the damage of the second attack.",
  },
];

/** Classes that gain Fighting Style and the level they gain it. */
export const FIGHTING_STYLE_BY_CLASS: Record<string, number> = {
  ID_CLASS_FIGHTER: 1,
  ID_CLASS_PALADIN: 2,
  ID_CLASS_RANGER:  2,
};

/** Subclasses that grant an additional Fighting Style and the level they grant it. */
export const SUBCLASS_FIGHTING_STYLE_GRANT: Record<string, number> = {
  ID_SUBCLASS_FIGHTER_CHAMPION: 10,
};
