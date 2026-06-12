import { describe, it, expect } from "vitest";
import { applyDraftChoices } from "../wizard-choices";
import type { FeatureDef } from "@/lib/features/types";

const FIGHTER_FS_DEF: FeatureDef = {
  id: "fighter-fighting-style",
  name: "Fighting Style",
  source: "SRD",
  origin: { kind: "class", classId: "ID_CLASS_FIGHTER", level: 1 },
  prose: { fallback: "Adopt a particular style of fighting as your specialty." },
  actionType: "passive",
  actionTypeSource: "tagged",
  choices: [{ kind: "feat", from: { tag: "fighting-style" }, count: 1 }],
};

const GENERIC_DEF: FeatureDef = {
  id: "some-future-choice",
  name: "Future Choice",
  source: "SRD",
  origin: { kind: "class", classId: "ID_CLASS_FIGHTER", level: 1 },
  prose: { fallback: "..." },
  actionType: "passive",
  actionTypeSource: "tagged",
  choices: [{ kind: "skill", from: { source: "rogue-class-list" }, count: 1, grants: "proficient" as const }],
};

describe("applyDraftChoices", () => {
  it("maps fighting style choice to fightingStyle named field", () => {
    const record = applyDraftChoices(
      [FIGHTER_FS_DEF],
      { "fighter-fighting-style": "ID_WOTC_PHB24_CLASSFEAT_FIGHTER_FIGHTINGSTYLE_DEFENSE" },
      12
    );
    expect(record.fightingStyle).toBe("ID_WOTC_PHB24_CLASSFEAT_FIGHTER_FIGHTINGSTYLE_DEFENSE");
    expect(record.hpGained).toBe(12);
    expect(record.picks).toBeUndefined();
  });

  it("falls through to picks for choice kinds without a named field", () => {
    const record = applyDraftChoices(
      [GENERIC_DEF],
      { "some-future-choice": "stealth" },
      10
    );
    expect(record.fightingStyle).toBeUndefined();
    expect(record.picks?.["some-future-choice"]).toBe("stealth");
  });

  it("returns just hpGained when no draft values are provided", () => {
    const record = applyDraftChoices([FIGHTER_FS_DEF], {}, 10);
    expect(record.hpGained).toBe(10);
    expect(record.fightingStyle).toBeUndefined();
    expect(record.picks).toBeUndefined();
  });

  it("handles mixed defs: named and overflow in the same call", () => {
    const record = applyDraftChoices(
      [FIGHTER_FS_DEF, GENERIC_DEF],
      {
        "fighter-fighting-style": "defense",
        "some-future-choice": "perception",
      },
      12
    );
    expect(record.fightingStyle).toBe("defense");
    expect(record.picks?.["some-future-choice"]).toBe("perception");
  });

  it("skips defs whose value is absent from draftValues", () => {
    const record = applyDraftChoices(
      [FIGHTER_FS_DEF, GENERIC_DEF],
      { "fighter-fighting-style": "defense" },
      12
    );
    expect(record.fightingStyle).toBe("defense");
    expect(record.picks).toBeUndefined();
  });

  it("creating a Fighter with Defense results in correct levelChoices shape", () => {
    // Simulates what handleFinish does: choiceFeatureDefs returns FIGHTER_FS_DEF,
    // draftLevelChoices[1] has the picked style.
    const record = applyDraftChoices(
      [FIGHTER_FS_DEF],
      { "fighter-fighting-style": "ID_SRD_FIGHTINGSTYLE_DEFENSE" },
      12
    );
    expect(record).toEqual({
      hpGained: 12,
      fightingStyle: "ID_SRD_FIGHTINGSTYLE_DEFENSE",
    });
  });
});
