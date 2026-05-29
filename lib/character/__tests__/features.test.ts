import { describe, it, expect } from "vitest";
import {
  getClassFeatures,
  maxChargesFor,
  resolveRechargesOn,
  UNLIMITED,
} from "../features";

describe("getClassFeatures", () => {
  describe("Barbarian level 1", () => {
    const features = getClassFeatures("ID_CLASS_BARBARIAN", 1);

    it("returns exactly one feature", () => {
      expect(features).toHaveLength(1);
    });

    it("Rage: 2 charges, long rest", () => {
      const rage = features[0];
      expect(rage.key).toBe("rage");
      expect(rage.label).toBe("Rage");
      expect(maxChargesFor(rage, 1)).toBe(2);
      expect(resolveRechargesOn(rage, 1)).toBe("long");
    });
  });

  describe("Fighter level 3", () => {
    const features = getClassFeatures("ID_CLASS_FIGHTER", 3);

    it("returns exactly two features", () => {
      expect(features).toHaveLength(2);
    });

    it("Second Wind: 1 charge, short rest", () => {
      const sw = features.find((f) => f.key === "second_wind")!;
      expect(sw).toBeDefined();
      expect(sw.label).toBe("Second Wind");
      expect(maxChargesFor(sw, 3)).toBe(1);
      expect(resolveRechargesOn(sw, 3)).toBe("short");
    });

    it("Action Surge: 1 charge at level 3, short rest", () => {
      const as = features.find((f) => f.key === "action_surge")!;
      expect(as).toBeDefined();
      expect(as.label).toBe("Action Surge");
      expect(maxChargesFor(as, 3)).toBe(1);
      expect(resolveRechargesOn(as, 3)).toBe("short");
    });
  });

  describe("Monk level 5", () => {
    const features = getClassFeatures("ID_CLASS_MONK", 5);

    it("returns exactly one feature", () => {
      expect(features).toHaveLength(1);
    });

    it("Ki Points: charges = level (5), short rest", () => {
      const ki = features[0];
      expect(ki.key).toBe("ki_points");
      expect(ki.label).toBe("Ki Points");
      expect(maxChargesFor(ki, 5)).toBe(5);
      expect(resolveRechargesOn(ki, 5)).toBe("short");
    });
  });

  // Edge cases
  describe("Barbarian level scaling", () => {
    it("level 3 = 3 Rage charges", () => {
      const [rage] = getClassFeatures("ID_CLASS_BARBARIAN", 3);
      expect(maxChargesFor(rage, 3)).toBe(3);
    });
    it("level 6 = 4 Rage charges", () => {
      const [rage] = getClassFeatures("ID_CLASS_BARBARIAN", 6);
      expect(maxChargesFor(rage, 6)).toBe(4);
    });
    it("level 20 = unlimited", () => {
      const [rage] = getClassFeatures("ID_CLASS_BARBARIAN", 20);
      expect(maxChargesFor(rage, 20)).toBe(UNLIMITED);
    });
  });

  describe("Fighter Action Surge level scaling", () => {
    it("level 1 = Action Surge not available yet", () => {
      const features = getClassFeatures("ID_CLASS_FIGHTER", 1);
      expect(features.find((f) => f.key === "action_surge")).toBeUndefined();
    });
    it("level 17 = 2 Action Surge charges", () => {
      const features = getClassFeatures("ID_CLASS_FIGHTER", 17);
      const as = features.find((f) => f.key === "action_surge")!;
      expect(maxChargesFor(as, 17)).toBe(2);
    });
  });

  describe("Bard Bardic Inspiration recharge", () => {
    it("level 4 recharges on long rest", () => {
      const [bi] = getClassFeatures("ID_CLASS_BARD", 4, { cha: 3 });
      expect(resolveRechargesOn(bi, 4)).toBe("long");
    });
    it("level 5 recharges on short rest (Font of Inspiration)", () => {
      const [bi] = getClassFeatures("ID_CLASS_BARD", 5, { cha: 3 });
      expect(resolveRechargesOn(bi, 5)).toBe("short");
    });
    it("charges = CHA modifier", () => {
      const [bi] = getClassFeatures("ID_CLASS_BARD", 1, { cha: 4 });
      expect(maxChargesFor(bi, 1, { cha: 4 })).toBe(4);
    });
  });

  describe("Monk Ki Points not available at level 1", () => {
    it("returns no features at level 1", () => {
      const features = getClassFeatures("ID_CLASS_MONK", 1);
      expect(features).toHaveLength(0);
    });
  });

  describe("Paladin", () => {
    it("level 2: only Lay on Hands (Channel Divinity not yet)", () => {
      const features = getClassFeatures("ID_CLASS_PALADIN", 2);
      expect(features.find((f) => f.key === "lay_on_hands")).toBeDefined();
      expect(features.find((f) => f.key === "channel_divinity")).toBeUndefined();
    });
    it("Lay on Hands pool = level × 5", () => {
      const features = getClassFeatures("ID_CLASS_PALADIN", 4);
      const loh = features.find((f) => f.key === "lay_on_hands")!;
      expect(maxChargesFor(loh, 4)).toBe(20);
    });
  });

  describe("Cleric Channel Divinity", () => {
    it("not available at level 1", () => {
      const features = getClassFeatures("ID_CLASS_CLERIC", 1);
      expect(features.find((f) => f.key === "channel_divinity")).toBeUndefined();
    });
    it("1 charge at level 2", () => {
      const features = getClassFeatures("ID_CLASS_CLERIC", 2);
      const cd = features.find((f) => f.key === "channel_divinity")!;
      expect(maxChargesFor(cd, 2)).toBe(1);
    });
    it("2 charges at level 6", () => {
      const features = getClassFeatures("ID_CLASS_CLERIC", 6);
      const cd = features.find((f) => f.key === "channel_divinity")!;
      expect(maxChargesFor(cd, 6)).toBe(2);
    });
    it("3 charges at level 18", () => {
      const features = getClassFeatures("ID_CLASS_CLERIC", 18);
      const cd = features.find((f) => f.key === "channel_divinity")!;
      expect(maxChargesFor(cd, 18)).toBe(3);
    });
  });
});
