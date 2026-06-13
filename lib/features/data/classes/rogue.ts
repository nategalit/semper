import type { FeatureDef } from "@/lib/features/types";

export const ROGUE_EXPERTISE: FeatureDef = {
  id: "rogue-expertise",
  name: "Expertise",
  source: "SRD",
  origin: { kind: "class", classId: "ID_CLASS_ROGUE", level: 1 },
  prose: { fallback: "Choose two of your skill proficiencies. Your proficiency bonus is doubled for any ability check you make using either of the chosen proficiencies." },
  actionType: "passive",
  actionTypeSource: "tagged",
  choices: [{ kind: "skill", from: { source: "any-proficient" }, count: 2, grants: "expertise" }],
};

export const ROGUE_SNEAK_ATTACK: FeatureDef = {
  id: "rogue-sneak-attack",
  name: "Sneak Attack",
  source: "SRD",
  origin: { kind: "class", classId: "ID_CLASS_ROGUE", level: 1 },
  prose: {
    fallback: "Once per turn, you can deal extra damage to a creature you hit with an attack roll if you have Advantage on the roll and the attack uses a Finesse or Ranged weapon. The extra damage is shown on the Sneak Attack table for your Rogue level.",
    srd: "Beginning at 1st level, you know how to strike subtly and exploit a foe's distraction. Once per turn, you can deal an extra 1d6 damage to one creature you hit with an attack if you have advantage on the attack roll.",
  },
  actionType: "situational",
  actionTypeSource: "tagged",
  effects: [
    {
      kind: "scaling-stat",
      stat: "sneak-attack-die",
      formula: {
        by: "class-level",
        classId: "ID_CLASS_ROGUE",
        table: { 1: "1d6", 3: "2d6", 5: "3d6", 7: "4d6", 9: "5d6", 11: "6d6", 13: "7d6", 15: "8d6", 17: "9d6", 19: "10d6" },
      },
    },
  ],
};

export const ROGUE_THIEVES_CANT: FeatureDef = {
  id: "rogue-thieves-cant",
  name: "Thieves' Cant",
  source: "SRD",
  origin: { kind: "class", classId: "ID_CLASS_ROGUE", level: 1 },
  prose: {
    fallback: "You know Thieves' Cant, a secret mix of dialect, jargon, and code used among rogues. You can also choose one additional language to learn.",
    srd: "During your rogue training you learned Thieves' Cant, a secret mix of dialect, jargon, and code that allows you to hide messages in seemingly normal conversation.",
  },
  actionType: "passive",
  actionTypeSource: "tagged",
  choices: [{ kind: "language", from: { source: "any-standard" }, count: 1 }],
};

export const ROGUE_WEAPON_MASTERY: FeatureDef = {
  id: "rogue-weapon-mastery",
  name: "Weapon Mastery",
  source: "SRD",
  origin: { kind: "class", classId: "ID_CLASS_ROGUE", level: 1 },
  prose: { fallback: "Your training with weapons allows you to use the mastery property of two kinds of weapons of your choice. You can change which kinds of weapons you chose when you finish a Long Rest." },
  actionType: "passive",
  actionTypeSource: "tagged",
  choices: [{ kind: "weapon-mastery", count: 2, pool: "any", rePickOn: "long-rest" }],
};

export const ROGUE_CUNNING_ACTION: FeatureDef = {
  id: "rogue-cunning-action",
  name: "Cunning Action",
  source: "SRD",
  origin: { kind: "class", classId: "ID_CLASS_ROGUE", level: 2 },
  prose: { fallback: "Your quick thinking and agility allow you to move and act quickly. You can take a Bonus Action on each of your turns to take the Dash, Disengage, or Hide action." },
  actionType: "bonus_action",
  actionTypeSource: "tagged",
};

export const ROGUE_STEADY_AIM: FeatureDef = {
  id: "rogue-steady-aim",
  name: "Steady Aim",
  source: "SRD",
  origin: { kind: "class", classId: "ID_CLASS_ROGUE", level: 3 },
  prose: {
    fallback: "As a Bonus Action, you give yourself Advantage on your next attack roll on the current turn. You can use this feature only if you haven't moved during this turn, and after you use it, your Speed is 0 until the end of the current turn.",
  },
  actionType: "bonus_action",
  actionTypeSource: "tagged",
};

export const ROGUE_UNCANNY_DODGE: FeatureDef = {
  id: "rogue-uncanny-dodge",
  name: "Uncanny Dodge",
  source: "SRD",
  origin: { kind: "class", classId: "ID_CLASS_ROGUE", level: 5 },
  prose: { fallback: "When an attacker that you can see hits you with an attack, you can use your Reaction to halve the attack's damage against you." },
  actionType: "reaction",
  actionTypeSource: "tagged",
};

export const ROGUE_CUNNING_STRIKE: FeatureDef = {
  id: "rogue-cunning-strike",
  name: "Cunning Strike",
  source: "SRD",
  origin: { kind: "class", classId: "ID_CLASS_ROGUE", level: 5 },
  prose: {
    fallback: "When you deal Sneak Attack damage, you can forgo one or more dice of that damage to add a special effect: Poison (forego 1 die, target makes Con save or is Poisoned 1 min), Trip (forego 1 die, Large or smaller target falls Prone), Withdraw (forego 1 die, take Disengage action), Knock Out (forego 5 dice, target makes Con save or is Unconscious 1 min). (Spending Sneak Attack dice is not expressible in current spendsResource — resource points at a FeatureResource, not a scaling-stat.)",
  },
  actionType: "situational",
  actionTypeSource: "tagged",
};

export const ROGUE_EXPERTISE_2: FeatureDef = {
  id: "rogue-expertise-2",
  name: "Expertise",
  source: "SRD",
  origin: { kind: "class", classId: "ID_CLASS_ROGUE", level: 6 },
  legacyNames: ["Expertise (2)"],
  prose: { fallback: "Choose two more of your skill proficiencies. Your proficiency bonus is doubled for any ability check you make using either of the chosen proficiencies." },
  actionType: "passive",
  actionTypeSource: "tagged",
  choices: [{ kind: "skill", from: { source: "any-proficient" }, count: 2, grants: "expertise" }],
};

export const ROGUE_EVASION: FeatureDef = {
  id: "rogue-evasion",
  name: "Evasion",
  source: "SRD",
  origin: { kind: "class", classId: "ID_CLASS_ROGUE", level: 7 },
  prose: { fallback: "When you are subjected to an effect that allows you to make a Dexterity saving throw to take only half damage, you instead take no damage if you succeed on the saving throw, and only half damage if you fail." },
  actionType: "passive",
  actionTypeSource: "tagged",
};

export const ROGUE_RELIABLE_TALENT: FeatureDef = {
  id: "rogue-reliable-talent",
  name: "Reliable Talent",
  source: "SRD",
  origin: { kind: "class", classId: "ID_CLASS_ROGUE", level: 11 },
  prose: { fallback: "Whenever you make an ability check that lets you add your proficiency bonus, you can treat a d20 roll of 9 or lower as a 10." },
  actionType: "passive",
  actionTypeSource: "tagged",
};

export const ROGUE_IMPROVED_CUNNING_STRIKE: FeatureDef = {
  id: "rogue-improved-cunning-strike",
  name: "Improved Cunning Strike",
  source: "SRD",
  origin: { kind: "class", classId: "ID_CLASS_ROGUE", level: 11 },
  parentFeatureId: "rogue-cunning-strike",
  augments: "extend",
  prose: {
    fallback: "You can use up to two Cunning Strike effects when you deal Sneak Attack damage, but you can't use the same effect more than once per turn.",
  },
  actionType: "situational",
  actionTypeSource: "tagged",
};

export const ROGUE_BLINDSENSE: FeatureDef = {
  id: "rogue-blindsense",
  name: "Blindsense",
  source: "SRD",
  origin: { kind: "class", classId: "ID_CLASS_ROGUE", level: 14 },
  prose: { fallback: "If you are able to hear, you are aware of the location of any hidden or invisible creature within 10 feet of you." },
  actionType: "passive",
  actionTypeSource: "tagged",
  effects: [{ kind: "sense", sense: "blindsense", range: 10 }],
};

export const ROGUE_DEVIOUS_STRIKES: FeatureDef = {
  id: "rogue-devious-strikes",
  name: "Devious Strikes",
  source: "SRD",
  origin: { kind: "class", classId: "ID_CLASS_ROGUE", level: 14 },
  parentFeatureId: "rogue-cunning-strike",
  augments: "extend",
  prose: {
    fallback: "You gain three more Cunning Strike options: Daze (forego 2 dice, target makes Con save or is Incapacitated until end of its next turn), Knock Out (forego 6 dice, target makes Con save or is Unconscious 1 min), Obscure (forego 3 dice, target makes Dex save or is Blinded until end of its next turn).",
  },
  actionType: "situational",
  actionTypeSource: "tagged",
};

export const ROGUE_SLIPPERY_MIND: FeatureDef = {
  id: "rogue-slippery-mind",
  name: "Slippery Mind",
  source: "SRD",
  origin: { kind: "class", classId: "ID_CLASS_ROGUE", level: 15 },
  prose: {
    fallback: "Your cunning mind is exceptionally difficult to control. You gain proficiency in Wisdom and Charisma saving throws.",
    srd: "You have acquired greater mental strength. You gain proficiency in Wisdom saving throws.",
  },
  actionType: "passive",
  actionTypeSource: "tagged",
  effects: [{ kind: "save-prof", saves: ["wis", "cha"] }],
};

export const ROGUE_ELUSIVE: FeatureDef = {
  id: "rogue-elusive",
  name: "Elusive",
  source: "SRD",
  origin: { kind: "class", classId: "ID_CLASS_ROGUE", level: 18 },
  prose: { fallback: "You are so evasive that attackers rarely gain the upper hand against you. No attack roll has Advantage against you while you don't have the Incapacitated condition." },
  actionType: "passive",
  actionTypeSource: "tagged",
};

export const ROGUE_STROKE_OF_LUCK: FeatureDef = {
  id: "rogue-stroke-of-luck",
  name: "Stroke of Luck",
  source: "SRD",
  origin: { kind: "class", classId: "ID_CLASS_ROGUE", level: 20 },
  prose: {
    fallback: "You have an uncanny knack for succeeding when you need to. If your attack misses a target within range, you can turn the miss into a hit. Alternatively, if you fail an ability check, you can treat the d20 roll as a 20.",
  },
  actionType: "situational",
  actionTypeSource: "tagged",
  resource: {
    id: "stroke_of_luck",
    shape: { kind: "charges", max: 1 },
    recharge: { on: "short-rest" },
    display: "pip",
  },
};
