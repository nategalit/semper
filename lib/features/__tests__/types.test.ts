// Type-shape and registry tests for the feature data layer.
//
// Chunk 1: type variants, empty registry.
// Chunk 2a: three migration-target entries (Tough, Alert, Remarkable Athlete) registered;
//           three new FeatureEffect kinds added to the union.

import { describe, it, expect } from "vitest";
import {
  FEATURE_REGISTRY,
  allFeatureDefs,
  getFeatureDef,
  type FeatureChoice,
  type FeatureDef,
  type FeatureEffect,
  type FeatureResource,
  type GrantedSpells,
  type ProseBySource,
  type ResourceShape,
} from "..";

describe("FEATURE_REGISTRY", () => {
  it("contains base class/feat/subclass defs plus fighting-style and ASI defs (chunk 9h)", () => {
    // 20 named defs + 50 std-class ASI (10 classes × 5) + 7 fighter ASI + 6 rogue ASI = 83
    // chunk 7 adds 4: brutal-strike ×2, aura-of-protection, aura-expansion
    // chunk 9a adds 14: full Barbarian L1-L20 fill
    // chunk 9b adds 15: 9 Fighter features L1-L20 + 6 fighting-style feat defs
    // chunk 9c adds 22: full Monk L1-L20 fill
    // chunk 9d adds 10: full Paladin L1-L18 fill
    // chunk 9e adds 14: full Ranger L1-L20 fill
    // chunk 9f adds 17: full Rogue L1-L20 fill
    // chunk 9g adds 9: full Sorcerer L1-L20 fill
    // chunk 9h adds 6: full Wizard L1-L20 fill
    expect(Object.keys(FEATURE_REGISTRY)).toHaveLength(194);
  });

  it("getFeatureDef resolves feat-tough", () => {
    const def = getFeatureDef("feat-tough");
    expect(def).toBeDefined();
    expect(def?.name).toBe("Tough");
    expect(def?.effects).toEqual([{ kind: "hp-per-level", value: 2 }]);
  });

  it("getFeatureDef resolves feat-alert", () => {
    const def = getFeatureDef("feat-alert");
    expect(def).toBeDefined();
    expect(def?.name).toBe("Alert");
    expect(def?.effects).toEqual([{ kind: "initiative-add", value: "prof-bonus" }]);
  });

  it("getFeatureDef resolves subclass-champion-remarkable-athlete", () => {
    const def = getFeatureDef("subclass-champion-remarkable-athlete");
    expect(def).toBeDefined();
    expect(def?.name).toBe("Remarkable Athlete");
    expect(def?.effects).toEqual([{ kind: "half-prof-on-checks", abilities: ["str", "dex", "con"] }]);
  });

  it("getFeatureDef returns undefined for unknown id", () => {
    expect(getFeatureDef("rage")).toBeUndefined();
    expect(getFeatureDef("")).toBeUndefined();
  });

  it("allFeatureDefs returns all 194 entries (chunk 9h)", () => {
    expect(allFeatureDefs()).toHaveLength(194);
  });

  it("resolves barbarian-brutal-strike (chunk 7)", () => {
    const def = getFeatureDef("barbarian-brutal-strike");
    expect(def).toBeDefined();
    expect(def?.name).toBe("Brutal Strike");
    expect(def?.parentFeatureId).toBeUndefined();
    expect(def?.augments).toBeUndefined();
    expect(def?.actionType).toBe("special");
  });

  it("resolves barbarian-improved-brutal-strike as child of brutal-strike (chunk 7)", () => {
    const def = getFeatureDef("barbarian-improved-brutal-strike");
    expect(def).toBeDefined();
    expect(def?.parentFeatureId).toBe("barbarian-brutal-strike");
    expect(def?.augments).toBe("extend");
    expect(def?.actionType).toBe("special");
  });

  it("resolves paladin-aura-of-protection (chunk 7)", () => {
    const def = getFeatureDef("paladin-aura-of-protection");
    expect(def).toBeDefined();
    expect(def?.name).toBe("Aura of Protection");
    expect(def?.parentFeatureId).toBeUndefined();
    expect(def?.actionType).toBe("passive");
  });

  it("resolves paladin-aura-expansion as child of aura-of-protection (chunk 7)", () => {
    const def = getFeatureDef("paladin-aura-expansion");
    expect(def).toBeDefined();
    expect(def?.parentFeatureId).toBe("paladin-aura-of-protection");
    expect(def?.augments).toBe("extend");
    expect(def?.actionType).toBe("passive");
  });
});

// ── Compile-time shape verification ─────────────────────────────────────────
// Each block below pins one variant of a union so a schema regression
// (renamed kind, dropped field, changed type) surfaces immediately.

describe("FeatureChoice variants", () => {
  it("compiles every documented kind", () => {
    const choices: FeatureChoice[] = [
      { kind: "skill", from: { source: "rogue-class-list" }, count: 1, grants: "expertise" },
      { kind: "language", from: { source: "any-standard" }, count: 2 },
      { kind: "weapon-mastery", count: 2, pool: "any", rePickOn: "long-rest" },
      { kind: "feat", from: { tag: "epic-boon" }, count: 1 },
      { kind: "spell", from: { classList: "wizard", levels: [1] }, count: 1, alwaysPrepared: true },
      {
        kind: "mode",
        affects: "blessed-strikes",
        options: [
          { id: "potent-spellcasting", label: "Potent Spellcasting", prose: "..." },
          { id: "divine-strike", label: "Divine Strike", prose: "...", inheritedBy: ["improved-blessed-strikes"] },
        ],
      },
      {
        kind: "subfeature",
        options: [
          { id: "abyssal", label: "Abyssal Tiefling", prose: "..." },
          { id: "chthonic", label: "Chthonic Tiefling", prose: "..." },
        ],
      },
    ];
    expect(choices).toHaveLength(7);
  });
});

describe("FeatureEffect variants", () => {
  it("compiles every documented kind", () => {
    const effects: FeatureEffect[] = [
      { kind: "ability", ability: "str", op: "add", value: 4, cap: 25 },
      { kind: "ability", ability: "con", op: "set-min", value: "level" },
      { kind: "ac", op: "add", value: 1, condition: { wearing: "armor" } },
      { kind: "speed", op: "add", value: 10, condition: { not_wearing: "heavy-armor" } },
      { kind: "speed", op: "set", value: 30, mode: "climb" },
      { kind: "save-prof", saves: "all" },
      { kind: "save-prof", saves: ["wis", "cha"] },
      { kind: "save-advantage", against: "all" },
      { kind: "save-advantage", against: { traits: ["int", "wis", "cha"] } },
      { kind: "skill-prof", skill: "perception", level: "expertise" },
      { kind: "sense", sense: "darkvision", range: 60 },
      { kind: "resistance", damageType: "fire" },
      { kind: "resistance", damageType: "by-choice", choiceId: "draconic-ancestry" },
      { kind: "condition-immunity", condition: "frightened", whileAuraActive: true },
      {
        kind: "scaling-stat",
        stat: "martial-arts-die",
        formula: { by: "class-level", classId: "ID_CLASS_MONK", table: { 1: "d6", 5: "d8", 11: "d10", 17: "d12" } },
      },
      // chunk-2 migration kinds
      { kind: "hp-per-level", value: 2 },
      { kind: "initiative-add", value: "prof-bonus" },
      { kind: "initiative-add", value: 5 },
      { kind: "half-prof-on-checks", abilities: ["str", "dex", "con"] },
      // chunk-9a additions
      { kind: "ac-base", formula: "10+dex+con", condition: { not_wearing: "any-armor" } },
      { kind: "ac-base", formula: "10+dex+wis" },
      { kind: "initiative-advantage" },
    ];
    expect(effects.length).toBeGreaterThan(0);
  });
});

describe("ResourceShape + Recharge variants", () => {
  it("compiles every shape including class-table DerivedCount", () => {
    const shapes: ResourceShape[] = [
      { kind: "charges", max: 3 },
      { kind: "charges", max: { from: "ability-mod", ability: "cha", min: 1 } },
      { kind: "charges", max: { from: "class-table", classId: "barbarian", column: "rages" } },
      { kind: "pool", max: { from: "level", classId: "ID_CLASS_PALADIN", multiplier: 5 } },
      { kind: "points", max: { from: "level", classId: "ID_CLASS_SORCERER" }, convertsTo: "spell-slots" },
      { kind: "slots", level: "by-table", max: { from: "level", classId: "ID_CLASS_WARLOCK" } },
      { kind: "per-tier-one-shot", tiers: [6, 7, 8, 9] },
      { kind: "binary-token" },
    ];
    expect(shapes).toHaveLength(8);
  });

  it("compiles every recharge variant", () => {
    const rage: FeatureResource = {
      id: "rage",
      shape: { kind: "charges", max: 3 },
      recharge: { on: "long-rest" },
      display: "pip",
    };
    const sorceryPoints: FeatureResource = {
      id: "sorcery-points",
      shape: { kind: "points", max: { from: "level", classId: "ID_CLASS_SORCERER" }, convertsTo: "spell-slots" },
      recharge: { on: "long-rest", partialOn: "short-rest", amount: "half-max-round-up" },
      display: "number",
    };
    const persistentRage: FeatureResource = {
      id: "persistent-rage",
      shape: { kind: "charges", max: 1 },
      recharge: { on: "initiative-roll", once: "per-long-rest" },
      display: "binary-token",
    };
    const bardicInspiration: FeatureResource = {
      id: "bardic_inspiration",
      shape: { kind: "charges", max: { from: "ability-mod", ability: "cha", min: 1 } },
      recharge: { on: "long-rest", switchesTo: "short-rest", atLevel: 5 },
      display: "pip",
    };
    expect([rage, sorceryPoints, persistentRage, bardicInspiration]).toHaveLength(4);
  });
});

describe("ProseBySource", () => {
  it("requires only fallback", () => {
    const prose: ProseBySource = { fallback: "Default text." };
    expect(prose.fallback).toBe("Default text.");
  });

  it("accepts per-edition overrides", () => {
    const prose: ProseBySource = {
      fallback: "SRD text.",
      srd: "SRD text.",
      phb24: "2024 PHB text.",
      byAuroraImport: { "import-uuid-1": "Custom imported text." },
    };
    expect(prose.phb24).toBe("2024 PHB text.");
  });
});

describe("GrantedSpells", () => {
  it("supports scaling by character level", () => {
    const granted: GrantedSpells = {
      spells: ["ID_SPELL_PRESTIDIGITATION"],
      source: "race",
      preparation: "always-prepared",
      countsAgainstPrepared: false,
      scaling: {
        byCharacterLevel: {
          3: ["ID_SPELL_DETECT_MAGIC"],
          5: ["ID_SPELL_MISTY_STEP"],
        },
      },
    };
    expect(granted.scaling?.byCharacterLevel[5]).toEqual(["ID_SPELL_MISTY_STEP"]);
  });
});

describe("FeatureDef", () => {
  it("compiles a minimal passive feature", () => {
    const def: FeatureDef = {
      id: "darkvision-elf",
      name: "Darkvision",
      source: "SRD",
      origin: { kind: "race", raceId: "ID_RACE_ELF" },
      prose: { fallback: "You have darkvision out to 60 feet." },
      actionType: "passive",
      actionTypeSource: "tagged",
      effects: [{ kind: "sense", sense: "darkvision", range: 60 }],
    };
    expect(def.id).toBe("darkvision-elf");
  });

  it("compiles a feature that composes resource + effects + choice", () => {
    const def: FeatureDef = {
      id: "rage",
      name: "Rage",
      source: "SRD",
      origin: { kind: "class", classId: "ID_CLASS_BARBARIAN", level: 1 },
      prose: {
        fallback: "Enter a rage as a bonus action.",
        phb24: "As a bonus action, enter a Rage that lasts until the end of your next turn unless you extend it.",
      },
      actionType: "bonus_action",
      actionTypeSource: "tagged",
      resource: {
        id: "rage",
        shape: { kind: "charges", max: 3 },
        recharge: { on: "long-rest" },
        display: "pip",
      },
      effects: [
        { kind: "resistance", damageType: "bludgeoning" },
        { kind: "resistance", damageType: "piercing" },
        { kind: "resistance", damageType: "slashing" },
        { kind: "save-advantage", against: { traits: ["str-checks", "str-saves"] } },
      ],
    };
    expect(def.resource?.id).toBe("rage");
  });

  it("accepts legacyNames for cross-version renames (chunk 9a)", () => {
    const def: FeatureDef = {
      id: "barbarian-brutal-strike",
      name: "Brutal Strike",
      source: "SRD",
      origin: { kind: "class", classId: "ID_CLASS_BARBARIAN", level: 9 },
      prose: { fallback: "..." },
      actionType: "special",
      actionTypeSource: "tagged",
      legacyNames: ["Brutal Critical"],
    };
    expect(def.legacyNames).toEqual(["Brutal Critical"]);
  });

  it("accepts spendsResource field (chunk 9c)", () => {
    const def: FeatureDef = {
      id: "monk-stunning-strike",
      name: "Stunning Strike",
      source: "SRD",
      origin: { kind: "class", classId: "ID_CLASS_MONK", level: 5 },
      prose: { fallback: "Spend 1 ki to force a CON save." },
      actionType: "situational",
      actionTypeSource: "tagged",
      spendsResource: { resourceId: "ki_points", amount: 1 },
    };
    expect(def.spendsResource?.amount).toBe(1);
  });

  it("accepts actionTypeSource: 'inferred' (chunk 8)", () => {
    const def: FeatureDef = {
      id: "test-inferred",
      name: "Test Feature",
      source: "SRD",
      origin: { kind: "class", classId: "ID_CLASS_BARBARIAN", level: 1 },
      prose: { fallback: "You gain a bonus." },
      actionType: "passive",
      actionTypeSource: "inferred",
    };
    expect(def.actionTypeSource).toBe("inferred");
  });

  it("compiles a child feature pointing at a parent", () => {
    const def: FeatureDef = {
      id: "improved-brutal-strike",
      name: "Improved Brutal Strike",
      source: "Aurora",
      origin: { kind: "class", classId: "ID_CLASS_BARBARIAN", level: 13 },
      prose: { fallback: "..." },
      actionType: "passive",
      actionTypeSource: "tagged",
      parentFeatureId: "brutal-strike",
      augments: "replace",
    };
    expect(def.parentFeatureId).toBe("brutal-strike");
  });
});
