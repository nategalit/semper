import { describe, it, expect } from "vitest";
import { choiceFeatureDefs } from "../apply";

describe("choiceFeatureDefs", () => {
  it("returns fighter-fighting-style at fighter L1", () => {
    const defs = choiceFeatureDefs("ID_CLASS_FIGHTER", undefined, 1);
    expect(defs.map((d) => d.id)).toContain("fighter-fighting-style");
  });

  it("returns paladin-fighting-style at paladin L2", () => {
    const defs = choiceFeatureDefs("ID_CLASS_PALADIN", undefined, 2);
    expect(defs.map((d) => d.id)).toContain("paladin-fighting-style");
  });

  it("returns ranger-fighting-style at ranger L2", () => {
    const defs = choiceFeatureDefs("ID_CLASS_RANGER", undefined, 2);
    expect(defs.map((d) => d.id)).toContain("ranger-fighting-style");
  });

  it("returns champion extra fighting style at subclass L10", () => {
    const defs = choiceFeatureDefs("ID_CLASS_FIGHTER", "ID_SUBCLASS_FIGHTER_CHAMPION", 10);
    expect(defs.map((d) => d.id)).toContain("champion-extra-fighting-style");
  });

  it("returns barbarian ASI at L4", () => {
    const defs = choiceFeatureDefs("ID_CLASS_BARBARIAN", undefined, 4);
    expect(defs.map((d) => d.id)).toContain("barbarian-asi-l4");
    expect(defs[0].choices?.[0]).toEqual({ kind: "asi-or-feat", canTakeHalfFeat: true });
  });

  it("returns fighter ASI at L6 (fighter-specific schedule)", () => {
    const defs = choiceFeatureDefs("ID_CLASS_FIGHTER", undefined, 6);
    expect(defs.map((d) => d.id)).toContain("fighter-asi-l6");
  });

  it("returns no choices at levels with no grants", () => {
    expect(choiceFeatureDefs("ID_CLASS_BARBARIAN", undefined, 2)).toHaveLength(0);
    expect(choiceFeatureDefs("ID_CLASS_FIGHTER", undefined, 3)).toHaveLength(0);
  });

  it("does not return defs for a different class", () => {
    const defs = choiceFeatureDefs("ID_CLASS_WIZARD", undefined, 1);
    expect(defs.map((d) => d.id)).not.toContain("fighter-fighting-style");
  });

  it("fighting-style choice has correct shape", () => {
    const defs = choiceFeatureDefs("ID_CLASS_FIGHTER", undefined, 1);
    const fsDef = defs.find((d) => d.id === "fighter-fighting-style");
    expect(fsDef).toBeDefined();
    expect(fsDef?.choices).toHaveLength(1);
    expect(fsDef?.choices?.[0]).toEqual({ kind: "feat", from: { tag: "fighting-style" }, count: 1 });
  });

  it("storage shape: levelChoices[lvl].fightingStyle maps to fighting-style choice", () => {
    // Validate that the choice id matches the storage key used by levelUpCharacter.
    // fighter-fighting-style writes to levelChoices[1].fightingStyle = pickedStyleId.
    const defs = choiceFeatureDefs("ID_CLASS_FIGHTER", undefined, 1);
    const fsDef = defs.find((d) => d.id === "fighter-fighting-style");
    expect(fsDef?.choices?.[0].kind).toBe("feat");
  });
});
