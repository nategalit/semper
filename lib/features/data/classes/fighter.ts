import type { FeatureDef } from "@/lib/features/types";

// ─── Migrated chunk 3 / chunk 5 — updated here for chunk 9b ──────────────────

export const FIGHTER_FIGHTING_STYLE: FeatureDef = {
  id: "fighter-fighting-style",
  name: "Fighting Style",
  source: "SRD",
  origin: { kind: "class", classId: "ID_CLASS_FIGHTER", level: 1 },
  prose: { fallback: "Adopt a particular style of fighting as your specialty. You can't take a Fighting Style option more than once, even if you later get to choose again." },
  actionType: "passive",
  actionTypeSource: "tagged",
  choices: [{ kind: "feat", from: { tag: "fighting-style" }, count: 1 }],
};

export const ACTION_SURGE: FeatureDef = {
  id: "fighter-action-surge",
  name: "Action Surge",
  source: "SRD",
  origin: { kind: "class", classId: "ID_CLASS_FIGHTER", level: 2 },
  prose: {
    fallback: "On your turn, take one additional action on top of your regular action. Two uses per rest at level 17.",
    // PHB24 prose — transcribed from 2024 Player's Handbook. Verify in chunk 9.
    phb24: "Starting at 2nd level, you can push yourself beyond your normal limits for a moment. On your turn, you can take one additional action. Once you use this feature, you must finish a Short or Long Rest before you can use it again. Starting at 17th level, you can use it twice before a rest, but only once on the same turn.",
  },
  actionType: "free",
  actionTypeSource: "tagged",
  // "Action Surge (2)" is the SRD L17 feature name; the resource auto-scales via actionSurgeUses table.
  legacyNames: ["Action Surge (2)"],
  resource: {
    id: "action_surge",
    shape: { kind: "charges", max: { from: "class-table", classId: "fighter", column: "actionSurgeUses" } },
    recharge: { on: "short-rest" },
    display: "pip",
  },
};

export const SECOND_WIND: FeatureDef = {
  id: "fighter-second-wind",
  name: "Second Wind",
  source: "SRD",
  origin: { kind: "class", classId: "ID_CLASS_FIGHTER", level: 1 },
  prose: {
    fallback: "As a bonus action, regain HP equal to 1d10 + your fighter level. Once per short or long rest.",
    // PHB24 prose — transcribed from 2024 Player's Handbook. Verify in chunk 9.
    phb24: "You have a limited well of stamina that you can draw on to protect yourself from harm. As a Bonus Action, you can regain Hit Points equal to 1d10 plus your Fighter level. Once you use this feature, you must finish a Short or Long Rest before you can use it again.",
  },
  actionType: "bonus_action",
  actionTypeSource: "tagged",
  resource: {
    id: "second_wind",
    shape: { kind: "charges", max: 1 },
    recharge: { on: "short-rest" },
    display: "pip",
  },
};

// ─── L1 ───────────────────────────────────────────────────────────────────────

// PHB24 prose — transcribed from 2024 Player's Handbook. Verify in chunk 9.
export const FIGHTER_WEAPON_MASTERY: FeatureDef = {
  id: "fighter-weapon-mastery",
  name: "Weapon Mastery",
  source: "SRD",
  origin: { kind: "class", classId: "ID_CLASS_FIGHTER", level: 1 },
  prose: {
    fallback: "Your training with weapons allows you to use the mastery properties of three kinds of Simple or Martial weapons of your choice. Whenever you finish a Long Rest, you can change one of the weapon types you chose.",
  },
  actionType: "passive",
  actionTypeSource: "tagged",
  // Weapon-mastery picker UI is a stub (returns null). TODO: implement picker.
  choices: [{ kind: "weapon-mastery", count: 3, pool: "any", rePickOn: "long-rest" }],
};

// ─── L2 ───────────────────────────────────────────────────────────────────────

// PHB24 prose — transcribed from 2024 Player's Handbook. Verify in chunk 9.
// References Second Wind's resource for an alternate use; no separate resource encoded here.
// Phase 9 tooltip on Second Wind should mention this alternate use.
export const FIGHTER_TACTICAL_MIND: FeatureDef = {
  id: "fighter-tactical-mind",
  name: "Tactical Mind",
  source: "SRD",
  origin: { kind: "class", classId: "ID_CLASS_FIGHTER", level: 2 },
  prose: {
    fallback: "When you fail an ability check, you can expend a use of Second Wind to push yourself toward success. Roll 1d10 and add the number rolled to the check, potentially turning a failure into a success.",
  },
  actionType: "situational",
  actionTypeSource: "tagged",
};

// ─── L5 ───────────────────────────────────────────────────────────────────────

export const FIGHTER_EXTRA_ATTACK: FeatureDef = {
  id: "fighter-extra-attack",
  name: "Extra Attack",
  source: "SRD",
  origin: { kind: "class", classId: "ID_CLASS_FIGHTER", level: 5 },
  prose: {
    fallback: "You can attack twice instead of once whenever you take the Attack action on your turn.",
    // PHB24 prose — transcribed from 2024 Player's Handbook. Verify in chunk 9.
    phb24: "You can attack twice instead of once whenever you take the Attack action on your turn. The number of attacks increases to three when you reach level 11 and to four when you reach level 20.",
  },
  actionType: "passive",
  actionTypeSource: "tagged",
  effects: [
    // Full progression table on L5 entry; L11/L20 FeatureDefs are prose-only augments.
    // deriveStats consumer TODO — attacksPerAction stat not yet wired in calc.ts.
    {
      kind: "scaling-stat",
      stat: "attacksPerAction",
      formula: { by: "class-level", classId: "ID_CLASS_FIGHTER", table: { 5: 2, 11: 3, 20: 4 } },
    },
  ],
};

// ─── L9 ───────────────────────────────────────────────────────────────────────

export const FIGHTER_INDOMITABLE: FeatureDef = {
  id: "fighter-indomitable",
  name: "Indomitable",
  source: "SRD",
  origin: { kind: "class", classId: "ID_CLASS_FIGHTER", level: 9 },
  prose: {
    fallback: "If you fail a saving throw, you can reroll it. You must use the new roll. Once per long rest.",
    // PHB24 prose — transcribed from 2024 Player's Handbook. Verify in chunk 9.
    phb24: "If you fail a saving throw, you can reroll it with a bonus equal to your Fighter level. You must use the new roll. You can use this feature once per Long Rest. The number of uses increases to two at level 13 and three at level 17.",
  },
  actionType: "situational",
  actionTypeSource: "tagged",
  resource: {
    id: "indomitable",
    shape: { kind: "charges", max: { from: "class-table", classId: "fighter", column: "indomitableUses" } },
    recharge: { on: "long-rest" },
    display: "pip",
  },
};

// PHB24 prose — transcribed from 2024 Player's Handbook. Verify in chunk 9.
export const FIGHTER_TACTICAL_SHIFT: FeatureDef = {
  id: "fighter-tactical-shift",
  name: "Tactical Shift",
  source: "SRD",
  origin: { kind: "class", classId: "ID_CLASS_FIGHTER", level: 9 },
  prose: {
    fallback: "Whenever you activate Second Wind with a Bonus Action, you can move up to half your Speed without provoking Opportunity Attacks.",
  },
  actionType: "situational",
  actionTypeSource: "tagged",
  parentFeatureId: "fighter-second-wind",
  augments: "extend",
};

// ─── L11 ──────────────────────────────────────────────────────────────────────

export const FIGHTER_TWO_EXTRA_ATTACKS: FeatureDef = {
  id: "fighter-two-extra-attacks",
  name: "Two Extra Attacks",
  source: "SRD",
  origin: { kind: "class", classId: "ID_CLASS_FIGHTER", level: 11 },
  prose: {
    fallback: "You can attack three times whenever you take the Attack action on your turn.",
  },
  actionType: "passive",
  actionTypeSource: "tagged",
  parentFeatureId: "fighter-extra-attack",
  augments: "extend",
  legacyNames: ["Extra Attack (2)"],
};

// ─── L13 ──────────────────────────────────────────────────────────────────────

export const FIGHTER_INDOMITABLE_2: FeatureDef = {
  id: "fighter-indomitable-2",
  name: "Indomitable",
  source: "SRD",
  origin: { kind: "class", classId: "ID_CLASS_FIGHTER", level: 13 },
  prose: {
    fallback: "You can now use Indomitable twice between long rests.",
  },
  actionType: "passive",
  actionTypeSource: "tagged",
  parentFeatureId: "fighter-indomitable",
  augments: "extend",
  legacyNames: ["Indomitable (2)"],
};

// ─── L17 ──────────────────────────────────────────────────────────────────────

export const FIGHTER_INDOMITABLE_3: FeatureDef = {
  id: "fighter-indomitable-3",
  name: "Indomitable",
  source: "SRD",
  origin: { kind: "class", classId: "ID_CLASS_FIGHTER", level: 17 },
  prose: {
    fallback: "You can now use Indomitable three times between long rests.",
  },
  actionType: "passive",
  actionTypeSource: "tagged",
  parentFeatureId: "fighter-indomitable",
  augments: "extend",
  legacyNames: ["Indomitable (3)"],
};

// ─── L20 ──────────────────────────────────────────────────────────────────────

export const FIGHTER_THREE_EXTRA_ATTACKS: FeatureDef = {
  id: "fighter-three-extra-attacks",
  name: "Three Extra Attacks",
  source: "SRD",
  origin: { kind: "class", classId: "ID_CLASS_FIGHTER", level: 20 },
  prose: {
    fallback: "You can attack four times whenever you take the Attack action on your turn.",
  },
  actionType: "passive",
  actionTypeSource: "tagged",
  parentFeatureId: "fighter-extra-attack",
  augments: "extend",
  legacyNames: ["Extra Attack (3)"],
};
