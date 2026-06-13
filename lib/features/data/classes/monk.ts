import type { FeatureDef } from "@/lib/features/types";

// ─── Migrated chunk 3 — updated here for chunk 9c ────────────────────────────

export const KI_POINTS: FeatureDef = {
  id: "monk-ki-points",
  name: "Ki Points",
  source: "SRD",
  origin: { kind: "class", classId: "ID_CLASS_MONK", level: 2 },
  prose: {
    // PHB24 prose — transcribed from 2024 Player's Handbook. Verify in chunk 9.
    fallback: "Fuel special monk abilities: Flurry of Blows, Patient Defense, Step of the Wind, and more. Ki points = monk level. Recharge on a short or long rest.",
    phb24: "You gain a wellspring of extraordinary energy. This energy is represented by Focus Points. Your Monk level determines the number of Focus Points you have (equal to your Monk level). You can spend these points to fuel certain Monk features. You start knowing three such features: Flurry of Blows, Patient Defense, and Step of the Wind. You learn more as you gain levels. When you spend a Focus Point, it is unavailable until you finish a Short or Long Rest.",
  },
  actionType: "passive",
  actionTypeSource: "tagged",
  // "Ki" is the SRD L2 feature name; Path B dedup via legacyNames.
  legacyNames: ["Ki", "Monk's Focus"],
  resource: {
    id: "ki_points",
    // max = monk level; L1=0 is unreachable — origin.level: 2 gates the feature
    shape: { kind: "points", max: { from: "level", classId: "ID_CLASS_MONK" } },
    recharge: { on: "short-rest" },
    // "number" display: Ki pools reach up to 20; pip layout would be impractical
    display: "number",
  },
};

// ─── L1 ───────────────────────────────────────────────────────────────────────

export const MONK_MARTIAL_ARTS: FeatureDef = {
  id: "monk-martial-arts",
  name: "Martial Arts",
  source: "SRD",
  origin: { kind: "class", classId: "ID_CLASS_MONK", level: 1 },
  prose: {
    fallback: "Your unarmed strikes and monk weapons deal a martial arts die (d4 at L1, scaling with level). You can use Dexterity for their attack and damage rolls, and you can make one unarmed strike as a bonus action after attacking with an unarmed strike or monk weapon.",
    // PHB24 prose — transcribed from 2024 Player's Handbook. Verify in chunk 9.
    phb24: "Your practice of martial arts gives you mastery of combat styles that use Unarmed Strikes and Monk weapons. You gain the following benefits while you are unarmed or wielding only Monk weapons and you aren't wearing armor or wielding a Shield. Bonus Unarmed Strike. You can make an Unarmed Strike as a Bonus Action. Martial Arts Die. You can roll a Martial Arts die in place of the normal damage of your Unarmed Strike or Monk weapon. This die changes as you gain Monk levels, as shown in the Martial Arts column of the Monk Features table. Dexterous Attacks. You can use Dexterity instead of Strength for the attack and damage rolls of your Unarmed Strikes and Monk weapons.",
  },
  actionType: "passive",
  actionTypeSource: "tagged",
  effects: [
    // deriveStats consumer TODO — martialArtsDie stat not yet wired in calc.ts.
    // Stat name "martial-arts-die" confirmed by types.test.ts compile-time fixture.
    {
      kind: "scaling-stat",
      stat: "martial-arts-die",
      formula: { by: "class-level", classId: "ID_CLASS_MONK", table: { 1: "d6", 5: "d8", 11: "d10", 17: "d12" } },
    },
  ],
};

export const MONK_UNARMORED_DEFENSE: FeatureDef = {
  id: "monk-unarmored-defense",
  name: "Unarmored Defense",
  source: "SRD",
  origin: { kind: "class", classId: "ID_CLASS_MONK", level: 1 },
  prose: {
    fallback: "While not wearing armor or wielding a shield, your AC equals 10 + your Dexterity modifier + your Wisdom modifier.",
    // PHB24 prose — transcribed from 2024 Player's Handbook. Verify in chunk 9.
    phb24: "While you aren't wearing any armor or wielding a Shield, your Armor Class equals 10 plus your Dexterity and Wisdom modifiers.",
  },
  actionType: "passive",
  actionTypeSource: "tagged",
  effects: [
    // deriveStats consumer TODO — type encoded now, calc wiring follows.
    { kind: "ac-base", formula: "10+dex+wis", condition: { not_wearing: "any-armor" } },
  ],
};

// ─── L2 ───────────────────────────────────────────────────────────────────────

export const MONK_UNARMORED_MOVEMENT: FeatureDef = {
  id: "monk-unarmored-movement",
  name: "Unarmored Movement",
  source: "SRD",
  origin: { kind: "class", classId: "ID_CLASS_MONK", level: 2 },
  prose: {
    fallback: "Your speed increases by 10 feet while not wearing armor or wielding a shield. This bonus improves at higher levels.",
    // PHB24 prose — transcribed from 2024 Player's Handbook. Verify in chunk 9.
    phb24: "Your speed increases by 10 feet while you aren't wearing armor or wielding a Shield. This bonus increases when you reach certain Monk levels.",
  },
  actionType: "passive",
  actionTypeSource: "tagged",
  effects: [
    // Base +10. Scaling at L6/L10/L14/L18 is TODO — no deriveStats consumer yet.
    // EffectCondition doesn't distinguish "not wielding shield" from "not wearing armor";
    // "any-armor" covers the primary case.
    { kind: "speed", op: "add", value: 10, condition: { not_wearing: "any-armor" } },
  ],
};

// PHB24 prose — transcribed from 2024 Player's Handbook. Verify in chunk 9.
export const MONK_FLURRY_OF_BLOWS: FeatureDef = {
  id: "monk-flurry-of-blows",
  name: "Flurry of Blows",
  source: "SRD",
  origin: { kind: "class", classId: "ID_CLASS_MONK", level: 2 },
  prose: {
    fallback: "Immediately after you take the Attack action, you can spend 1 ki point to make two unarmed strikes as a bonus action.",
  },
  actionType: "bonus_action",
  actionTypeSource: "tagged",
  spendsResource: { resourceId: "ki_points", amount: 1 },
};

// PHB24 prose — transcribed from 2024 Player's Handbook. Verify in chunk 9.
export const MONK_PATIENT_DEFENSE: FeatureDef = {
  id: "monk-patient-defense",
  name: "Patient Defense",
  source: "SRD",
  origin: { kind: "class", classId: "ID_CLASS_MONK", level: 2 },
  prose: {
    fallback: "You can spend 1 ki point to take the Dodge action as a bonus action.",
  },
  actionType: "bonus_action",
  actionTypeSource: "tagged",
  spendsResource: { resourceId: "ki_points", amount: 1 },
};

// PHB24 prose — transcribed from 2024 Player's Handbook. Verify in chunk 9.
export const MONK_STEP_OF_THE_WIND: FeatureDef = {
  id: "monk-step-of-the-wind",
  name: "Step of the Wind",
  source: "SRD",
  origin: { kind: "class", classId: "ID_CLASS_MONK", level: 2 },
  prose: {
    fallback: "You can spend 1 ki point to take the Dash or Disengage action as a bonus action.",
  },
  actionType: "bonus_action",
  actionTypeSource: "tagged",
  spendsResource: { resourceId: "ki_points", amount: 1 },
};

// ─── L3 ───────────────────────────────────────────────────────────────────────

export const MONK_DEFLECT_ATTACKS: FeatureDef = {
  id: "monk-deflect-attacks",
  name: "Deflect Attacks",
  source: "SRD",
  origin: { kind: "class", classId: "ID_CLASS_MONK", level: 3 },
  prose: {
    fallback: "As a reaction when hit by a ranged weapon attack, reduce the damage by 1d10 + Dexterity modifier + monk level. If reduced to 0, you can spend 1 ki to catch and throw the missile as a ranged attack.",
    // PHB24 prose — transcribed from 2024 Player's Handbook. Verify in chunk 9.
    phb24: "When an attack hits you and its damage type is Bludgeoning, Piercing, or Slashing, you can use your Reaction to deflect it. When you do so, the damage you take is reduced by 1d10 plus your Dexterity modifier and Monk level. If you reduce the damage to 0, you can spend 1 Focus Point to redirect it as a Ranged attack.",
  },
  actionType: "reaction",
  actionTypeSource: "tagged",
  // PHB24 expanded this to all physical damage (not just ranged); Deflect Energy at L13 adds energy types.
  legacyNames: ["Deflect Missiles"],
};

// ─── L4 ───────────────────────────────────────────────────────────────────────

export const MONK_SLOW_FALL: FeatureDef = {
  id: "monk-slow-fall",
  name: "Slow Fall",
  source: "SRD",
  origin: { kind: "class", classId: "ID_CLASS_MONK", level: 4 },
  prose: {
    // PHB24 prose — transcribed from 2024 Player's Handbook. Verify in chunk 9.
    fallback: "As a reaction when you fall, reduce the falling damage you take by 5 × your monk level.",
  },
  actionType: "reaction",
  actionTypeSource: "tagged",
};

// ─── L5 ───────────────────────────────────────────────────────────────────────

export const MONK_EXTRA_ATTACK: FeatureDef = {
  id: "monk-extra-attack",
  name: "Extra Attack",
  source: "SRD",
  origin: { kind: "class", classId: "ID_CLASS_MONK", level: 5 },
  prose: {
    fallback: "You can attack twice instead of once whenever you take the Attack action on your turn.",
  },
  actionType: "passive",
  actionTypeSource: "tagged",
  effects: [
    // Monk Extra Attack is flat (always 2); no further scaling unlike Fighter.
    // deriveStats consumer TODO.
    { kind: "scaling-stat", stat: "attacksPerAction", formula: { by: "class-level", classId: "ID_CLASS_MONK", table: { 5: 2 } } },
  ],
};

export const MONK_STUNNING_STRIKE: FeatureDef = {
  id: "monk-stunning-strike",
  name: "Stunning Strike",
  source: "SRD",
  origin: { kind: "class", classId: "ID_CLASS_MONK", level: 5 },
  prose: {
    fallback: "When you hit a creature with a melee weapon attack, you can spend 1 ki point to force a Constitution saving throw. On a failure, the creature is stunned until the end of your next turn.",
    // PHB24 prose — transcribed from 2024 Player's Handbook. Verify in chunk 9.
    phb24: "Once per turn when you hit a creature with a Monk weapon or an Unarmed Strike, you can spend 1 Focus Point to attempt a stunning strike. The target must make a Constitution saving throw. On a failed save, the target has the Stunned condition until the start of your next turn.",
  },
  actionType: "situational",
  actionTypeSource: "tagged",
  spendsResource: { resourceId: "ki_points", amount: 1 },
};

// ─── L6 ───────────────────────────────────────────────────────────────────────

// SRD-only base class feature; PHB24 removed Ki-Empowered Strikes from the base class.
// Appears in Path C for SRD characters; edition-gating is a known limitation (see docs).
export const MONK_KI_EMPOWERED_STRIKES: FeatureDef = {
  id: "monk-ki-empowered-strikes",
  name: "Ki-Empowered Strikes",
  source: "SRD",
  origin: { kind: "class", classId: "ID_CLASS_MONK", level: 6 },
  prose: {
    fallback: "Your unarmed strikes count as magical for the purpose of overcoming resistance and immunity to nonmagical attacks and damage.",
  },
  actionType: "passive",
  actionTypeSource: "tagged",
};

// ─── L7 ───────────────────────────────────────────────────────────────────────

export const MONK_EVASION: FeatureDef = {
  id: "monk-evasion",
  name: "Evasion",
  source: "SRD",
  origin: { kind: "class", classId: "ID_CLASS_MONK", level: 7 },
  prose: {
    fallback: "When subjected to an effect that allows a Dexterity saving throw for half damage, you take no damage on a success and only half on a failure.",
    // PHB24 prose — transcribed from 2024 Player's Handbook. Verify in chunk 9.
    phb24: "When you are subjected to an effect that allows you to make a Dexterity saving throw to take only half damage, you instead take no damage if you succeed on the saving throw and only half damage if you fail.",
  },
  actionType: "passive",
  actionTypeSource: "tagged",
  // Save-outcome modifier mechanic (no damage on success) has no matching FeatureEffect kind.
  // Encoding as prose-only is intentional; a dedicated effect kind would be premature.
};

export const MONK_STILLNESS_OF_MIND: FeatureDef = {
  id: "monk-stillness-of-mind",
  name: "Stillness of Mind",
  source: "SRD",
  origin: { kind: "class", classId: "ID_CLASS_MONK", level: 7 },
  prose: {
    // PHB24 prose — transcribed from 2024 Player's Handbook. Verify in chunk 9.
    fallback: "As an action, you can end one effect on yourself that is causing you to be charmed or frightened.",
  },
  actionType: "action",
  actionTypeSource: "tagged",
};

// ─── L9 ───────────────────────────────────────────────────────────────────────

export const MONK_ACROBATIC_MOVEMENT: FeatureDef = {
  id: "monk-acrobatic-movement",
  name: "Acrobatic Movement",
  source: "SRD",
  origin: { kind: "class", classId: "ID_CLASS_MONK", level: 9 },
  prose: {
    fallback: "You can move along vertical surfaces and across liquids without falling, as long as you end your movement on a horizontal surface.",
    // PHB24 prose — transcribed from 2024 Player's Handbook. Verify in chunk 9.
    phb24: "While you aren't wearing armor or wielding a Shield, you gain the ability to move along vertical surfaces and across liquids on your turn without falling during the move.",
  },
  actionType: "passive",
  actionTypeSource: "tagged",
  legacyNames: ["Unarmored Movement Improvement"],
};

// ─── L10 ──────────────────────────────────────────────────────────────────────

export const MONK_SELF_RESTORATION: FeatureDef = {
  id: "monk-self-restoration",
  name: "Self-Restoration",
  source: "SRD",
  origin: { kind: "class", classId: "ID_CLASS_MONK", level: 10 },
  prose: {
    fallback: "Your mastery of ki makes you immune to disease and poison.",
    // PHB24 prose — transcribed from 2024 Player's Handbook. Verify in chunk 9.
    phb24: "Through sheer force of will, you can remove one of the following conditions from yourself at the end of each of your turns: Charmed, Frightened, or Poisoned. In addition, forgoing food and drink doesn't give you the Exhaustion condition.",
  },
  actionType: "passive",
  actionTypeSource: "tagged",
  legacyNames: ["Purity of Body"],
};

// ─── L11 ──────────────────────────────────────────────────────────────────────

// SRD-only base class feature; PHB24 removed this as a standalone feature.
// Appears in Path C for SRD characters; edition-gating is a known limitation (see docs).
export const MONK_TONGUE_OF_SUN_AND_MOON: FeatureDef = {
  id: "monk-tongue-of-sun-and-moon",
  name: "Tongue of the Sun and Moon",
  source: "SRD",
  origin: { kind: "class", classId: "ID_CLASS_MONK", level: 11 },
  prose: {
    fallback: "You learn to touch the ki of other minds so that you understand all spoken languages. Moreover, any creature that can understand a language can understand what you say.",
  },
  actionType: "passive",
  actionTypeSource: "tagged",
};

// ─── L13 ──────────────────────────────────────────────────────────────────────

// PHB24 prose — transcribed from 2024 Player's Handbook. Verify in chunk 9.
// Extends Deflect Attacks to cover energy damage types.
export const MONK_DEFLECT_ENERGY: FeatureDef = {
  id: "monk-deflect-energy",
  name: "Deflect Energy",
  source: "SRD",
  origin: { kind: "class", classId: "ID_CLASS_MONK", level: 13 },
  prose: {
    fallback: "You can now use your Deflect Attacks reaction against attacks that deal any damage type, not just Bludgeoning, Piercing, and Slashing.",
  },
  actionType: "passive",
  actionTypeSource: "tagged",
  parentFeatureId: "monk-deflect-attacks",
  augments: "extend",
};

// ─── L14 ──────────────────────────────────────────────────────────────────────

export const MONK_DISCIPLINED_SURVIVOR: FeatureDef = {
  id: "monk-disciplined-survivor",
  name: "Disciplined Survivor",
  source: "SRD",
  origin: { kind: "class", classId: "ID_CLASS_MONK", level: 14 },
  prose: {
    fallback: "You are proficient in all saving throws. When you fail a saving throw, you can spend 1 ki point to reroll it, and you must use the new result.",
    // PHB24 prose — transcribed from 2024 Player's Handbook. Verify in chunk 9.
    phb24: "Your physical and mental discipline grant you proficiency in all saving throws. Additionally, whenever you make a saving throw and fail, you can spend 1 Focus Point to reroll it, and you must use the new roll.",
  },
  actionType: "passive",
  actionTypeSource: "tagged",
  effects: [{ kind: "save-prof", saves: "all" }],
  spendsResource: { resourceId: "ki_points", amount: 1 },
  // "Diamond Soul" is the SRD L13 name; "Timeless Body" is the SRD L14 name.
  // Both map to this PHB24 feature for Path B dedup.
  legacyNames: ["Diamond Soul", "Timeless Body"],
};

// ─── L15 ──────────────────────────────────────────────────────────────────────

// SRD-only base class feature. PHB24 moves the resonant mechanic to Superior Defense (L18).
// Appears in Path C for SRD characters; edition-gating is a known limitation (see docs).
export const MONK_EMPTY_BODY: FeatureDef = {
  id: "monk-empty-body",
  name: "Empty Body",
  source: "SRD",
  origin: { kind: "class", classId: "ID_CLASS_MONK", level: 15 },
  prose: {
    fallback: "Spend 4 ki points to become invisible for 1 minute with resistance to all damage except force. Spend 8 ki points to cast astral projection on yourself without a silver cord.",
  },
  actionType: "special",
  actionTypeSource: "tagged",
  spendsResource: { resourceId: "ki_points", amount: 4 },
  legacyNames: ["Empty Body"],
};

// PHB24 prose — transcribed from 2024 Player's Handbook. Verify in chunk 9.
// Ki/Focus regen on initiative roll. The unconditional recharge variant
// { on: "initiative-roll" } (no once-per-LR qualifier) is not yet in the Recharge
// type union — same deferral decision as Persistent Rage PHB24 divergence from 9a.
export const MONK_PERFECT_FOCUS: FeatureDef = {
  id: "monk-perfect-focus",
  name: "Perfect Focus",
  source: "SRD",
  origin: { kind: "class", classId: "ID_CLASS_MONK", level: 15 },
  prose: {
    fallback: "When you roll Initiative, you can regain Focus Points equal to your Proficiency Bonus if you have no Focus Points remaining. This replaces the SRD Perfect Self feature at a lower level.",
  },
  actionType: "situational",
  actionTypeSource: "tagged",
  // TODO: unconditional initiative-roll recharge on ki_points resource for L15+ Monks.
  // Recharge type currently only supports { on: "initiative-roll"; once: "per-long-rest" }.
  // Wiring follows alongside Persistent Rage's PHB24 divergence.
};

// ─── L18 ──────────────────────────────────────────────────────────────────────

// PHB24 prose — transcribed from 2024 Player's Handbook. Verify in chunk 9.
export const MONK_SUPERIOR_DEFENSE: FeatureDef = {
  id: "monk-superior-defense",
  name: "Superior Defense",
  source: "SRD",
  origin: { kind: "class", classId: "ID_CLASS_MONK", level: 18 },
  prose: {
    fallback: "At the start of your turn, you can spend 3 ki points to gain resistance to all damage except Force damage until the start of your next turn.",
  },
  actionType: "free",
  actionTypeSource: "tagged",
  spendsResource: { resourceId: "ki_points", amount: 3 },
};

// ─── L20 ──────────────────────────────────────────────────────────────────────

export const MONK_BODY_AND_MIND: FeatureDef = {
  id: "monk-body-and-mind",
  name: "Body and Mind",
  source: "SRD",
  origin: { kind: "class", classId: "ID_CLASS_MONK", level: 20 },
  prose: {
    fallback: "You have developed your body and mind to new heights. Your Dexterity and Wisdom scores increase by 4, to a maximum of 25.",
    // PHB24 prose — transcribed from 2024 Player's Handbook. Verify in chunk 9.
    phb24: "You have perfected your body. Your Dexterity and Wisdom scores each increase by 4. Your maximum for those scores is now 25.",
  },
  actionType: "passive",
  actionTypeSource: "tagged",
  effects: [
    { kind: "ability", ability: "dex", op: "add", value: 4, cap: 25 },
    { kind: "ability", ability: "wis", op: "add", value: 4, cap: 25 },
  ],
  legacyNames: ["Perfect Self"],
};
