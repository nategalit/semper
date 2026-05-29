import { readFileSync } from "fs";
import { join } from "path";
import { describe, expect, it } from "vitest";
import type {
  BackgroundElement,
  ClassElement,
  ClassFeatureElement,
  ItemElement,
  RaceElement,
  RacialTraitElement,
  SpellElement,
  SubraceElement,
} from "../../schema";
import { parseAuroraFile } from "../parser";

const FIXTURES = join(__dirname, "../__fixtures__");
const xml = (name: string) => readFileSync(join(FIXTURES, name), "utf-8");

// ─── Race ─────────────────────────────────────────────────────────────────────

describe("Race — Elf", () => {
  const elements = parseAuroraFile(xml("race-elf.xml"));
  const elf = elements.find((e) => e.id === "ID_RACE_ELF") as RaceElement;

  it("emits a Race element", () => {
    expect(elf).toBeDefined();
    expect(elf.elementType).toBe("Race");
    expect(elf.name).toBe("Elf");
    expect(elf.source).toBe("Player's Handbook");
    expect(elf.sourceType).toBe("imported");
  });

  it("sets subraceRequired=true via structural walk", () => {
    expect(elf.subraceRequired).toBe(true);
  });

  it("parses name lists", () => {
    expect(elf.nameData.male).toContain("Adran");
    expect(elf.nameData.female).toContain("Adrie");
    expect(elf.nameData.child).toContain("Ara");
    expect(elf.nameData.family).toContain("Amakiir");
    expect(elf.nameData.format).toBe("{{name}} {{family}}");
  });

  it("parses size data", () => {
    expect(elf.sizeData.heightBase).toBe("4'6\"");
    expect(elf.sizeData.heightModifier).toBe("2d10");
    expect(elf.sizeData.weightBase).toBe("90 lb.");
    expect(elf.sizeData.weightModifier).toBe("1d4");
  });

  it("normalizes stat modifiers", () => {
    expect(elf.rules.statModifiers).toContainEqual(
      expect.objectContaining({ stat: "dexterity", value: 2 })
    );
    expect(elf.rules.statModifiers).toContainEqual(
      expect.objectContaining({ stat: "innate speed", value: 30, bonus: "base" })
    );
  });

  it("resolves language grant names", () => {
    expect(elf.rules.grants).toContainEqual(
      expect.objectContaining({ type: "Language", id: "ID_LANGUAGE_ELVISH", name: "Elvish" })
    );
    expect(elf.rules.grants).toContainEqual(
      expect.objectContaining({ type: "Language", id: "ID_LANGUAGE_COMMON", name: "Common" })
    );
  });

  it("resolves vision grant name", () => {
    expect(elf.rules.grants).toContainEqual(
      expect.objectContaining({ type: "Vision", id: "ID_VISION_DARKVISION", name: "Darkvision" })
    );
  });

  it("has no extraRules", () => {
    expect(elf.rules.extraRules).toHaveLength(0);
  });

  it("has non-empty description HTML", () => {
    expect(elf.description.length).toBeGreaterThan(0);
    expect(elf.description).toContain("<p");
  });

  it("has empty sheetText (display=false)", () => {
    expect(elf.sheetText).toBe("");
  });

  it("emits subraces as Subrace elements", () => {
    const highElf = elements.find((e) => e.id === "ID_SUB_RACE_HIGH_ELF") as SubraceElement;
    expect(highElf).toBeDefined();
    expect(highElf.elementType).toBe("Subrace");
    expect(highElf.parentRace).toBe("Elf");
    expect(highElf.sizeData?.heightModifier).toBe("2d10");
  });

  it("emits racial traits as RacialTrait elements", () => {
    const keenSenses = elements.find(
      (e) => e.id === "ID_RACIAL_TRAIT_KEEN_SENSES"
    ) as RacialTraitElement;
    expect(keenSenses).toBeDefined();
    expect(keenSenses.elementType).toBe("RacialTrait");
  });

  it("RacialTrait with display=false has empty sheetText but populated variants", () => {
    const subraceTrait = elements.find(
      (e) => e.id === "ID_RACIAL_TRAIT_ELVEN_SUBRACE"
    ) as RacialTraitElement;
    expect(subraceTrait.sheetText).toBe("");
    expect(subraceTrait.variants).toHaveLength(0);
  });

  it("RacialTrait without display=false has sheetText", () => {
    const feyAncestry = elements.find(
      (e) => e.id === "ID_RACIAL_TRAIT_FEY_ANCESTRY"
    ) as RacialTraitElement;
    expect(feyAncestry.sheetText).toBeTruthy();
  });
});

// ─── Class ────────────────────────────────────────────────────────────────────

describe("Class — Fighter", () => {
  const elements = parseAuroraFile(xml("class-fighter.xml"));
  const fighter = elements.find((e) => e.id === "ID_WOTC_PHB_CLASS_FIGHTER") as ClassElement;

  it("emits a Class element", () => {
    expect(fighter).toBeDefined();
    expect(fighter.elementType).toBe("Class");
    expect(fighter.name).toBe("Fighter");
    expect(fighter.hitDie).toBe("d10");
  });

  it("parses shortDescription from setters", () => {
    expect(fighter.shortDescription).toMatch(/master of martial combat/i);
  });

  it("grants class features at correct levels", () => {
    expect(fighter.rules.grants).toContainEqual(
      expect.objectContaining({ type: "Class Feature", id: "ID_WOTC_PHB_CLASS_FEATURE_SECONDWIND", level: 1 })
    );
    expect(fighter.rules.grants).toContainEqual(
      expect.objectContaining({ type: "Class Feature", id: "ID_WOTC_PHB_CLASS_FEATURE_ACTIONSURGE", level: 2 })
    );
    expect(fighter.rules.grants).toContainEqual(
      expect.objectContaining({ type: "Class Feature", id: "ID_WOTC_PHB_CLASS_FEATURE_MARTIALARCHETYPE", level: 3 })
    );
  });

  it("resolves proficiency grant names", () => {
    expect(fighter.rules.grants).toContainEqual(
      expect.objectContaining({ type: "Proficiency", id: "ID_PROFICIENCY_ARMOR_PROFICIENCY_HEAVY_ARMOR", name: "heavy armor" })
    );
    expect(fighter.rules.grants).toContainEqual(
      expect.objectContaining({ type: "Proficiency", id: "ID_PROFICIENCY_SAVINGTHROW_STRENGTH", name: "Strength saving throw" })
    );
  });

  it("captures skill choice select", () => {
    expect(fighter.rules.choices).toContainEqual(
      expect.objectContaining({
        kind: "element",
        type: "Proficiency",
        name: "Skill Proficiency (Fighter)",
        supports: "Skill,Fighter",
        number: 2,
      })
    );
  });

  it("parses multiclass block", () => {
    expect(fighter.multiclass).toBeDefined();
    expect(fighter.multiclass!.prerequisiteText).toBe("Strength 13 or Dexterity 13");
    expect(fighter.multiclass!.proficienciesText).toBe(
      "Light armor, medium armor, shields, simple weapons, martial weapons"
    );
    expect(fighter.multiclass!.requirements).toContain("[str:13]");
  });

  it("multiclass has its own normalized rules", () => {
    expect(fighter.multiclass!.rules.grants).toContainEqual(
      expect.objectContaining({ type: "Proficiency", id: "ID_PROFICIENCY_ARMOR_PROFICIENCY_LIGHT_ARMOR" })
    );
  });

  it("emits Second Wind as ClassFeature with action/usage", () => {
    const sw = elements.find(
      (e) => e.id === "ID_WOTC_PHB_CLASS_FEATURE_SECONDWIND"
    ) as ClassFeatureElement;
    expect(sw.elementType).toBe("ClassFeature");
    expect(sw.action).toBe("Bonus Action");
    expect(sw.usage).toBe("1/Short Rest");
    expect(sw.sheetText).toContain("1d10");
    expect(sw.variants).toHaveLength(1);
    expect(sw.replacedBy).toBe("!ID_INTERNAL_FEATURE_REPLACEMENT_FIGHTER_SECOND_WIND");
  });

  it("emits Action Surge with level-scaled variants", () => {
    const as = elements.find(
      (e) => e.id === "ID_WOTC_PHB_CLASS_FEATURE_ACTIONSURGE"
    ) as ClassFeatureElement;
    expect(as.variants).toHaveLength(2);
    const v0 = as.variants.find((v) => v.level === 0);
    const v17 = as.variants.find((v) => v.level === 17);
    expect(v0?.usage).toBe("1/Short Rest");
    expect(v17?.usage).toBe("2/Short Rest");
  });

  it("Martial Archetype has display=false → empty sheetText, archetype select in rules", () => {
    const ma = elements.find(
      (e) => e.id === "ID_WOTC_PHB_CLASS_FEATURE_MARTIALARCHETYPE"
    ) as ClassFeatureElement;
    expect(ma.sheetText).toBe("");
    expect(ma.rules.choices).toContainEqual(
      expect.objectContaining({ kind: "element", type: "Archetype", supports: "Martial Archetype" })
    );
  });
});

// ─── Spell ────────────────────────────────────────────────────────────────────

describe("Spell", () => {
  const elements = parseAuroraFile(xml("spells.xml"));

  it("parses Acid Splash (cantrip)", () => {
    const spell = elements.find((e) => e.id === "ID_PHB_SPELL_ACID_SPLASH") as SpellElement;
    expect(spell.elementType).toBe("Spell");
    expect(spell.level).toBe(0);
    expect(spell.school).toBe("Conjuration");
    expect(spell.castingTime).toBe("1 action");
    expect(spell.duration).toBe("Instantaneous");
    expect(spell.range).toBe("60 feet");
    expect(spell.components.verbal).toBe(true);
    expect(spell.components.somatic).toBe(true);
    expect(spell.components.material).toBe(false);
    expect(spell.components.materialDescription).toBeUndefined();
    expect(spell.concentration).toBe(false);
    expect(spell.ritual).toBe(false);
    expect(spell.keywords).toContain("acid");
  });

  it("filters non-class tags from supports (Spell Saving Throw)", () => {
    const spell = elements.find((e) => e.id === "ID_PHB_SPELL_ACID_SPLASH") as SpellElement;
    expect(spell.classes).toEqual(["Sorcerer", "Wizard", "Artificer"]);
    expect(spell.classes).not.toContain("Spell Saving Throw");
  });

  it("parses Alarm (1st-level ritual with material component)", () => {
    const spell = elements.find((e) => e.id === "ID_PHB_SPELL_ALARM") as SpellElement;
    expect(spell.level).toBe(1);
    expect(spell.ritual).toBe(true);
    expect(spell.components.material).toBe(true);
    expect(spell.components.materialDescription).toBe(
      "a tiny bell and a piece of fine silver wire"
    );
    expect(spell.classes).toEqual(["Ranger", "Wizard", "Artificer"]);
  });

  it("parses Aid (2nd-level concentration=false)", () => {
    const spell = elements.find((e) => e.id === "ID_PHB_SPELL_AID") as SpellElement;
    expect(spell.level).toBe(2);
    expect(spell.concentration).toBe(false);
    expect(spell.components.material).toBe(true);
    expect(spell.components.materialDescription).toBe("a tiny strip of white cloth");
  });
});

// ─── Item (Weapon) ────────────────────────────────────────────────────────────

describe("Item — Weapons", () => {
  const elements = parseAuroraFile(xml("items-weapons.xml"));

  it("parses Dagger (simple melee, finesse, light, thrown, ranged)", () => {
    const dagger = elements.find((e) => e.id === "ID_WOTC_PHB_WEAPON_DAGGER") as ItemElement;
    expect(dagger.elementType).toBe("Item");
    expect(dagger.itemType).toBe("Weapon");
    expect(dagger.category).toEqual({ id: "ID_INTERNAL_WEAPON_CATEGORY_SIMPLE_MELEE", name: "simple melee" });
    expect(dagger.cost).toEqual({ amount: 2, currency: "gp" });
    expect(dagger.weight).toBe(1);
    expect(dagger.slot).toBe("onehand");
    expect(dagger.damage).toEqual({
      dice: "1d4",
      damageType: { id: "ID_INTERNAL_DAMAGE_TYPE_PIERCING", name: "piercing" },
    });
    expect(dagger.range).toEqual({ normal: 20, long: 60 });
    expect(dagger.properties).toContainEqual({ id: "ID_INTERNAL_WEAPON_PROPERTY_FINESSE", name: "finesse" });
    expect(dagger.properties).toContainEqual({ id: "ID_INTERNAL_WEAPON_PROPERTY_LIGHT",   name: "light" });
    expect(dagger.properties).toContainEqual({ id: "ID_INTERNAL_WEAPON_PROPERTY_THROWN",  name: "thrown" });
    expect(dagger.proficiencyId).toBe("ID_PROFICIENCY_WEAPON_PROFICIENCY_DAGGER");
  });

  it("parses Club (no range, light property only)", () => {
    const club = elements.find((e) => e.id === "ID_WOTC_PHB_WEAPON_CLUB") as ItemElement;
    expect(club.cost).toEqual({ amount: 1, currency: "sp" });
    expect(club.range).toBeUndefined();
    expect(club.damage?.damageType.name).toBe("bludgeoning");
    expect(club.properties).toHaveLength(1);
    expect(club.properties[0].name).toBe("light");
  });

  it("parses Greatclub (twohand, no range)", () => {
    const gc = elements.find((e) => e.id === "ID_WOTC_PHB_WEAPON_GREATCLUB") as ItemElement;
    expect(gc.slot).toBe("twohand");
    expect(gc.properties).toContainEqual({ id: "ID_INTERNAL_WEAPON_PROPERTY_TWOHANDED", name: "two-handed" });
    expect(gc.range).toBeUndefined();
  });
});

// ─── Background ───────────────────────────────────────────────────────────────

describe("Background — Soldier", () => {
  const elements = parseAuroraFile(xml("background-soldier.xml"));
  const soldier = elements.find((e) => e.id === "ID_BACKGROUND_SOLDIER") as BackgroundElement;

  it("emits a Background element", () => {
    expect(soldier).toBeDefined();
    expect(soldier.elementType).toBe("Background");
    expect(soldier.name).toBe("Soldier");
    expect(soldier.shortDescription).toBe("Athletics, Intimidation, Gaming Set, Vehicles (Land)");
  });

  it("grants skill proficiencies with resolved names", () => {
    expect(soldier.rules.grants).toContainEqual(
      expect.objectContaining({ type: "Proficiency", id: "ID_PROFICIENCY_SKILL_ATHLETICS", name: "Athletics" })
    );
    expect(soldier.rules.grants).toContainEqual(
      expect.objectContaining({ type: "Proficiency", id: "ID_PROFICIENCY_SKILL_INTIMIDATION", name: "Intimidation" })
    );
  });

  it("grants vehicle proficiency", () => {
    expect(soldier.rules.grants).toContainEqual(
      expect.objectContaining({ id: "ID_PROFICIENCY_TOOL_PROFICIENCY_VEHICLES_LAND", name: "vehicles (land)" })
    );
  });

  it("grants Background Feature with requirements", () => {
    expect(soldier.rules.grants).toContainEqual(
      expect.objectContaining({
        type: "Background Feature",
        id: "ID_BACKGROUND_FEATURE_MILITARY_RANK",
        requirements: "!ID_INTERNAL_GRANT_OPTIONAL_BACKGROUND_FEATURE",
      })
    );
  });

  it("captures Gaming Set as ElementSelectChoice", () => {
    expect(soldier.rules.choices).toContainEqual(
      expect.objectContaining({ kind: "element", type: "Proficiency", name: "Gaming Set", supports: "Gaming Set" })
    );
  });

  it("captures Variant Feature as optional ElementSelectChoice", () => {
    expect(soldier.rules.choices).toContainEqual(
      expect.objectContaining({ kind: "element", type: "Background Feature", optional: true })
    );
  });

  it("parses Specialty as optional ListSelectChoice with 8 items", () => {
    const specialty = soldier.rules.choices.find(
      (c) => c.kind === "list" && c.name === "Specialty"
    ) as ReturnType<typeof soldier.rules.choices.find> & { kind: "list" };
    expect(specialty).toBeDefined();
    expect((specialty as { items: unknown[] }).items).toHaveLength(8);
    expect((specialty as { optional: boolean }).optional).toBe(true);
  });

  it("parses Personality Trait ListSelectChoice with number=2", () => {
    const trait = soldier.rules.choices.find(
      (c) => c.kind === "list" && c.name === "Personality Trait"
    );
    expect(trait).toBeDefined();
    expect((trait as { number: number }).number).toBe(2);
    expect((trait as { items: unknown[] }).items).toHaveLength(8);
  });

  it("parses Ideal, Bond, Flaw ListSelectChoices", () => {
    const names = soldier.rules.choices.filter((c) => c.kind === "list").map((c) => c.name);
    expect(names).toContain("Ideal");
    expect(names).toContain("Bond");
    expect(names).toContain("Flaw");
  });

  it("emits Military Rank as RacialTrait sibling", () => {
    const rank = elements.find((e) => e.id === "ID_BACKGROUND_FEATURE_MILITARY_RANK");
    expect(rank?.elementType).toBe("RacialTrait");
    expect(rank?.name).toBe("Feature: Military Rank");
  });
});
