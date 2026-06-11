"use client";

import type { Character } from "@/lib/types/character";
import type { FeatureResource } from "@/lib/features/types";
import { getResourceState } from "@/lib/features/resources/derive";
import { PipDisplay } from "./pip-display";
import { NumberDisplay } from "./number-display";
import { SpellSlotRow } from "./spell-slot-row";
import { PerTierCheckboxes } from "./per-tier-checkboxes";
import { BinaryToken } from "./binary-token";
import { PointsDisplay } from "./points-display";

interface Props {
  resource: FeatureResource;
  character: Character;
  onChange: (newCurrent: number) => void;
}

export function ResourceDisplay({ resource, character, onChange }: Props) {
  const { current, max } = getResourceState(resource, character);
  const name = resource.id;

  switch (resource.display) {
    case "pip":
      return <PipDisplay name={name} current={current} max={max} onChange={onChange} />;
    case "number":
      return <NumberDisplay name={name} current={current} max={max} onChange={onChange} />;
    case "spell-slot-row":
      return <SpellSlotRow resource={resource} current={current} max={max} onChange={onChange} />;
    case "per-tier-checkboxes":
      return <PerTierCheckboxes resource={resource} current={current} max={max} onChange={onChange} />;
    case "binary-token":
      return <BinaryToken name={name} current={current} onChange={onChange} />;
    case "points":
      return <PointsDisplay name={name} current={current} max={max} onChange={onChange} />;
  }
}
