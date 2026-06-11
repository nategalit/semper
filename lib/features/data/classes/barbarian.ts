import type { FeatureDef } from "@/lib/features/types";

export const BARBARIAN_RAGE: FeatureDef = {
  id: "barbarian-rage",
  name: "Rage",
  source: "SRD",
  origin: { kind: "class", classId: "ID_CLASS_BARBARIAN", level: 1 },
  prose: {
    fallback: "Enter a rage as a bonus action. While raging you gain advantage on STR checks and saves, bonus damage, and resistance to physical damage. Lasts 1 minute.",
    phb24: `You can imbue yourself with a primal power called Rage, a force that grants you extraordinary might and resilience. You can enter it as a Bonus Action if you aren't wearing Heavy armor.

You can enter your Rage the number of times shown for your Barbarian level in the Rages column of the Barbarian Features table. You regain one expended use when you finish a Short Rest, and you regain all expended uses when you finish a Long Rest.

While active, your Rage follows the rules below.

Damage Resistance. You have Resistance to Bludgeoning, Piercing, and Slashing damage.

Rage Damage. When you make an attack using Strength—with either a weapon or an Unarmed Strike—and deal damage to the target, you gain a bonus to the damage that increases as you gain levels as a Barbarian, as shown in the Rage Damage column of the Barbarian Features table.

Strength Advantage. You have Advantage on Strength checks and Strength saving throws.

No Concentration or Spells. You can't maintain Concentration, and you can't cast spells.

Duration. The Rage lasts until the end of your next turn, and it ends early if you don Heavy armor or have the Incapacitated condition. If your Rage is still active on your next turn, you can extend the Rage for another round by doing one of the following:

- Make an attack roll against an enemy.
- Force an enemy to make a saving throw.
- Take a Bonus Action to extend your Rage.

Each time the Rage is extended, it lasts until the end of your next turn. You can maintain a Rage for up to 10 minutes.`,
  },
  actionType: "bonus_action",
  actionTypeSource: "tagged",
  resource: {
    id: "rage",
    shape: { kind: "charges", max: { from: "class-table", classId: "barbarian", column: "rages" } },
    // TODO: PHB24 also grants 1 rage on short rest; the legacy path doesn't model this either.
    recharge: { on: "long-rest" },
    display: "pip",
  },
};
