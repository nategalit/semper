// Inference engine for actionType — assigns a categorized ActionType to any
// feature given its prose text and optional Aurora-tagged action string.
//
// Rules are applied in order; first match wins. The engine is deliberately
// conservative: only explicit, unambiguous phrases produce a non-"passive"
// result. "situational" is never returned — it remains hand-tag-only.

import type { ActionType, FeatureDef } from "./types";

export const INFER_RULES: { pattern: RegExp; type: ActionType }[] = [
  { pattern: /\bas an action\b/i,                        type: "action" },
  { pattern: /\bas a bonus action\b/i,                   type: "bonus_action" },
  { pattern: /\bas a reaction\b/i,                       type: "reaction" },
  { pattern: /\busing your reaction\b/i,                 type: "reaction" },
  { pattern: /\bas a (magic|utilize|attack) action\b/i,  type: "action" },
  { pattern: /\bas a free action\b/i,                    type: "free" },
  { pattern: /\bat the end of a long rest\b/i,           type: "special" },
];

/** Returns the ActionType implied by prose, or "passive" if no rule matches. */
export function inferActionType(prose: string): ActionType {
  for (const rule of INFER_RULES) {
    if (rule.pattern.test(prose)) return rule.type;
  }
  return "passive";
}

const AURORA_ACTION_MAP: Record<string, ActionType> = {
  "action":       "action",
  "bonus action": "bonus_action",
  "reaction":     "reaction",
  "free action":  "free",
  "special":      "special",
  "no action":    "passive",
  "none":         "passive",
  "passive":      "passive",
};

/**
 * Maps an Aurora <action> string to an ActionType.
 * Returns undefined for unknown strings so the caller can fall back to inference.
 */
export function mapAuroraAction(actionString: string | undefined): ActionType | undefined {
  if (actionString == null) return undefined;
  return AURORA_ACTION_MAP[actionString.toLowerCase()];
}

/**
 * Resolves actionType + actionTypeSource for any feature using three-tier precedence:
 *   1. def.actionType (hand-tagged)  → "tagged"
 *   2. Aurora action string (author-tagged in a different format) → "tagged"
 *   3. inferActionType(prose)  → "inferred"
 */
export function ensureActionType(
  def: Partial<FeatureDef>,
  prose: string,
  auroraAction?: string,
): { actionType: ActionType; actionTypeSource: "tagged" | "inferred" } {
  if (def.actionType != null) {
    return { actionType: def.actionType, actionTypeSource: "tagged" };
  }
  const fromAurora = mapAuroraAction(auroraAction);
  if (fromAurora != null) {
    return { actionType: fromAurora, actionTypeSource: "tagged" };
  }
  return { actionType: inferActionType(prose), actionTypeSource: "inferred" };
}
