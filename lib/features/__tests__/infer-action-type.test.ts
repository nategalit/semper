import { describe, it, expect } from "vitest";
import {
  INFER_RULES,
  inferActionType,
  mapAuroraAction,
  ensureActionType,
} from "../infer-action-type";

describe("INFER_RULES", () => {
  it("contains exactly 7 rules", () => {
    expect(INFER_RULES).toHaveLength(7);
  });
});

describe("inferActionType — rule matches", () => {
  it('"as an action" → action', () => {
    expect(inferActionType("You can use this feature as an action.")).toBe("action");
  });

  it('"as a bonus action" → bonus_action', () => {
    expect(inferActionType("You can enter a Rage as a bonus action.")).toBe("bonus_action");
  });

  it('"as a reaction" → reaction', () => {
    expect(inferActionType("You can cast this spell as a reaction when you take damage.")).toBe("reaction");
  });

  it('"using your reaction" → reaction', () => {
    expect(inferActionType("You can cast this spell using your reaction.")).toBe("reaction");
  });

  it('"as a magic action" → action', () => {
    expect(inferActionType("You can produce a magical effect as a magic action.")).toBe("action");
  });

  it('"as a utilize action" → action', () => {
    expect(inferActionType("You can activate this item as a utilize action.")).toBe("action");
  });

  it('"as a free action" → free', () => {
    expect(inferActionType("You can communicate telepathically as a free action.")).toBe("free");
  });

  it('"at the end of a long rest" → special', () => {
    expect(inferActionType("You regain all expended uses at the end of a long rest.")).toBe("special");
  });
});

describe("inferActionType — default and edge cases", () => {
  it("returns passive when no rule matches", () => {
    expect(inferActionType("You gain a +2 bonus to Strength saving throws.")).toBe("passive");
  });

  it('returns passive for "when you" prose without other rule matches (Sneak Attack pattern)', () => {
    expect(
      inferActionType(
        "Once per turn, when you hit a creature with an attack roll that has Advantage, you deal an extra 1d6 damage."
      )
    ).toBe("passive");
  });

  it('returns passive for "whenever you" prose without other rule matches', () => {
    expect(
      inferActionType("Whenever you make an attack roll, you can add your proficiency bonus.")
    ).toBe("passive");
  });

  it("is case-insensitive", () => {
    expect(inferActionType("You can cast THIS SPELL AS AN ACTION.")).toBe("action");
    expect(inferActionType("USE AS A BONUS ACTION to enter rage.")).toBe("bonus_action");
    expect(inferActionType("AT THE END OF A LONG REST you regain all uses.")).toBe("special");
  });

  it("first-match wins when prose contains multiple rule patterns", () => {
    expect(
      inferActionType("You can use this as an action, or as a bonus action if you are raging.")
    ).toBe("action");
  });

  it("is pure — same input always returns same output", () => {
    const prose = "You can enter a Rage as a bonus action.";
    expect(inferActionType(prose)).toBe(inferActionType(prose));
  });

  it("returns passive for empty string", () => {
    expect(inferActionType("")).toBe("passive");
  });
});

describe("mapAuroraAction", () => {
  it('maps "Action" → action', () => {
    expect(mapAuroraAction("Action")).toBe("action");
  });

  it('maps "Bonus Action" → bonus_action', () => {
    expect(mapAuroraAction("Bonus Action")).toBe("bonus_action");
  });

  it('maps "Reaction" → reaction', () => {
    expect(mapAuroraAction("Reaction")).toBe("reaction");
  });

  it('maps "Free Action" → free', () => {
    expect(mapAuroraAction("Free Action")).toBe("free");
  });

  it('maps "Special" → special', () => {
    expect(mapAuroraAction("Special")).toBe("special");
  });

  it('maps "No Action" → passive', () => {
    expect(mapAuroraAction("No Action")).toBe("passive");
  });

  it('maps "None" → passive', () => {
    expect(mapAuroraAction("None")).toBe("passive");
  });

  it('maps "Passive" → passive', () => {
    expect(mapAuroraAction("Passive")).toBe("passive");
  });

  it("is case-insensitive", () => {
    expect(mapAuroraAction("BONUS ACTION")).toBe("bonus_action");
    expect(mapAuroraAction("bonus action")).toBe("bonus_action");
    expect(mapAuroraAction("REACTION")).toBe("reaction");
  });

  it("returns undefined for unknown strings", () => {
    expect(mapAuroraAction("Unknown Value")).toBeUndefined();
    expect(mapAuroraAction("")).toBeUndefined();
  });

  it("returns undefined for undefined input", () => {
    expect(mapAuroraAction(undefined)).toBeUndefined();
  });
});

describe("ensureActionType", () => {
  it("returns tagged when def.actionType is set — wins over everything", () => {
    const result = ensureActionType({ actionType: "action" }, "some prose", "Bonus Action");
    expect(result).toEqual({ actionType: "action", actionTypeSource: "tagged" });
  });

  it("def.actionType wins over auroraAction (precedence test)", () => {
    const result = ensureActionType({ actionType: "reaction" }, "some prose", "Action");
    expect(result.actionType).toBe("reaction");
    expect(result.actionTypeSource).toBe("tagged");
  });

  it("returns tagged when auroraAction is set and def has no actionType", () => {
    const result = ensureActionType({}, "prose with no rule match — just a passive description", "Bonus Action");
    expect(result).toEqual({ actionType: "bonus_action", actionTypeSource: "tagged" });
  });

  it("returns inferred when neither def.actionType nor auroraAction is set — prose match", () => {
    const result = ensureActionType({}, "You can cast this spell as a bonus action.");
    expect(result).toEqual({ actionType: "bonus_action", actionTypeSource: "inferred" });
  });

  it("returns passive + inferred when no def, no auroraAction, and prose has no match", () => {
    const result = ensureActionType({}, "You gain a +2 bonus to all saving throws.");
    expect(result).toEqual({ actionType: "passive", actionTypeSource: "inferred" });
  });

  it("returns inferred when auroraAction is unknown (falls through to prose)", () => {
    const result = ensureActionType({}, "You can activate this as a reaction.", "Some Unknown String");
    expect(result).toEqual({ actionType: "reaction", actionTypeSource: "inferred" });
  });
});
