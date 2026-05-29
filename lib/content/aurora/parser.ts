import { DOMParser, XMLSerializer } from "@xmldom/xmldom";
import {
  AURORA_TYPE_MAP,
  type AuroraElement,
  type BackgroundElement,
  type ClassElement,
  type ClassFeatureElement,
  type ClassFeatureVariant,
  type ClassMulticlass,
  type ConditionElement,
  type ElementSelectChoice,
  type ElementType,
  type ExtraRule,
  type FeatElement,
  type GrantedElement,
  type IdNamePair,
  type ItemElement,
  type LanguageElement,
  type ListSelectChoice,
  type NormalizedRules,
  type ProficiencyElement,
  type RaceElement,
  type RacialTraitElement,
  type SelectChoice,
  type SourceType,
  type SpellElement,
  type StatModifier,
  type SubclassElement,
  type SubraceElement,
} from "../schema";
import {
  DAMAGE_TYPES,
  SPELL_NON_CLASS_TAGS,
  WEAPON_CATEGORIES,
  WEAPON_PROPERTIES,
  lookupId,
} from "../lookups";

// ─── Internal DOM type ────────────────────────────────────────────────────────
// @xmldom/xmldom's Element type structurally conflicts with the browser DOM
// lib types that TypeScript includes by default. Using `any` for the traversal
// layer is the standard workaround; all public API return types remain typed.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type El = any;

// ─── XML helpers ──────────────────────────────────────────────────────────────

const _serializer = new XMLSerializer();

function attr(el: El, name: string): string {
  return el.getAttribute(name) ?? "";
}

function firstChild(el: El, tag: string): El | null {
  for (const node of Array.from<El>(el.childNodes)) {
    if (node.nodeType === 1 && node.tagName === tag) return node;
  }
  return null;
}

function allChildren(el: El, tag: string): El[] {
  const out: El[] = [];
  for (const node of Array.from<El>(el.childNodes)) {
    if (node.nodeType === 1 && node.tagName === tag) out.push(node);
  }
  return out;
}

function textOf(el: El | null): string {
  return el?.textContent?.trim() ?? "";
}

/** Serializes the child nodes of an element to an HTML-ish string, stripping spurious xmlns. */
function innerXML(el: El | null): string {
  if (!el) return "";
  return Array.from<El>(el.childNodes)
    .map((node: El) => {
      if (node.nodeType === 3) return (node.nodeValue as string | null) ?? ""; // text node
      if (node.nodeType === 8) return ""; // comment — Aurora uses for errata
      return (_serializer.serializeToString(node) as string).replace(/ xmlns="[^"]*"/g, "");
    })
    .join("")
    .trim();
}

function parseNameList(csv: string): string[] {
  return csv.split(",").map((s) => s.trim()).filter(Boolean);
}

// ─── Setters ──────────────────────────────────────────────────────────────────

interface SetterEntry {
  value: string;
  attrs: Record<string, string>;
}

/** Parses <setters><set name="..." [extra]="...">value</set>...</setters> */
function parseSetters(settersEl: El | null): Map<string, SetterEntry> {
  const map = new Map<string, SetterEntry>();
  if (!settersEl) return map;
  for (const setEl of allChildren(settersEl, "set")) {
    const name = attr(setEl, "name") as string;
    if (!name) continue;
    const extra: Record<string, string> = {};
    for (const a of Array.from<El>(setEl.attributes)) {
      if (a.name !== "name") extra[a.name as string] = a.value as string;
    }
    // <set name="names" type="male"> → key "names:male"
    const key = extra.type ? `${name}:${extra.type}` : name;
    map.set(key, { value: textOf(setEl), attrs: extra });
  }
  return map;
}

// ─── Rules normalization ──────────────────────────────────────────────────────

function parseRules(rulesEl: El | null): NormalizedRules {
  const statModifiers: StatModifier[] = [];
  const grants: GrantedElement[] = [];
  const choices: SelectChoice[] = [];
  const extraRules: ExtraRule[] = [];

  if (!rulesEl) return { statModifiers, grants, choices, extraRules };

  for (const node of Array.from<El>(rulesEl.childNodes)) {
    if (node.nodeType !== 1) continue;

    switch (node.tagName as string) {
      case "stat": {
        const value = parseInt(attr(node, "value"), 10);
        if (isNaN(value)) break;
        const mod: StatModifier = { stat: attr(node, "name"), value };
        const bonus = attr(node, "bonus");
        if (bonus) mod.bonus = bonus;
        const req = attr(node, "requirements");
        if (req) mod.requirements = req;
        statModifiers.push(mod);
        break;
      }

      case "grant": {
        const id = attr(node, "id");
        const type = attr(node, "type");
        const levelStr = attr(node, "level");
        const req = attr(node, "requirements");
        const grant: GrantedElement = { type, id };
        const resolved = lookupId(id);
        if (resolved) grant.name = resolved;
        if (levelStr) grant.level = parseInt(levelStr, 10);
        if (req) grant.requirements = req;
        grants.push(grant);
        break;
      }

      case "select": {
        const type = attr(node, "type");
        const name = attr(node, "name");
        const number = parseInt(attr(node, "number") || "1", 10);
        const optional = attr(node, "optional") === "true";

        if (type === "List") {
          const items = allChildren(node, "item").map((item: El) => ({
            id: attr(item, "id") as string,
            text: textOf(item),
          }));
          const choice: ListSelectChoice = { kind: "list", name, number, items };
          if (optional) choice.optional = true;
          choices.push(choice);
        } else {
          const supports = attr(node, "supports");
          const levelStr = attr(node, "level");
          const req = attr(node, "requirements");
          const choice: ElementSelectChoice = { kind: "element", type, name, supports, number };
          if (levelStr) choice.level = parseInt(levelStr, 10);
          if (optional) choice.optional = true;
          if (req) choice.requirements = req;
          choices.push(choice);
        }
        break;
      }

      default: {
        const attributes: Record<string, string> = {};
        for (const a of Array.from<El>(node.attributes)) {
          attributes[a.name as string] = a.value as string;
        }
        extraRules.push({ tag: node.tagName as string, attributes });
      }
    }
  }

  return { statModifiers, grants, choices, extraRules };
}

// ─── Sheet parsing ────────────────────────────────────────────────────────────

interface ParsedSheet {
  sheetText: string;
  action?: string;
  usage?: string;
  variants: ClassFeatureVariant[];
}

function parseSheet(sheetEl: El | null): ParsedSheet {
  if (!sheetEl) return { sheetText: "", variants: [] };

  const display = attr(sheetEl, "display") !== "false";
  const baseAction = attr(sheetEl, "action") || undefined;
  const baseUsage = attr(sheetEl, "usage") || undefined;

  const descEls = allChildren(sheetEl, "description");

  if (descEls.length === 0) {
    const text = textOf(sheetEl);
    if (!display || !text) return { sheetText: "", variants: [] };
    return {
      sheetText: text,
      action: baseAction,
      usage: baseUsage,
      variants: [{ level: 0, text, ...(baseAction && { action: baseAction }), ...(baseUsage && { usage: baseUsage }) }],
    };
  }

  const variants: ClassFeatureVariant[] = descEls.map((descEl: El) => {
    const levelStr = attr(descEl, "level");
    const descUsage = attr(descEl, "usage") || baseUsage;
    const descAction = attr(descEl, "action") || baseAction;
    const text = textOf(descEl);
    const v: ClassFeatureVariant = { level: levelStr ? parseInt(levelStr, 10) : 0, text };
    if (descAction) v.action = descAction;
    if (descUsage) v.usage = descUsage;
    return v;
  });

  if (!display) return { sheetText: "", variants: [] };

  return { sheetText: variants[0]?.text ?? "", action: baseAction, usage: baseUsage, variants };
}

// ─── Weapon <supports> decoder ────────────────────────────────────────────────

interface WeaponSupports {
  category: IdNamePair | undefined;
  damageType: IdNamePair | undefined;
  properties: IdNamePair[];
}

function decodeWeaponSupports(supportsText: string): WeaponSupports {
  let category: IdNamePair | undefined;
  let damageType: IdNamePair | undefined;
  const properties: IdNamePair[] = [];

  for (const raw of supportsText.split(",").map((s) => s.trim()).filter(Boolean)) {
    if (WEAPON_CATEGORIES[raw]) {
      category = { id: raw, name: WEAPON_CATEGORIES[raw] };
    } else if (DAMAGE_TYPES[raw]) {
      damageType = { id: raw, name: DAMAGE_TYPES[raw] };
    } else if (WEAPON_PROPERTIES[raw]) {
      properties.push({ id: raw, name: WEAPON_PROPERTIES[raw] });
    }
    // WEAPON_GROUPS are for display grouping only; not stored on the item
  }

  return { category, damageType, properties };
}

// ─── Base payload shared by every element ────────────────────────────────────

interface BaseElementData {
  id: string;
  name: string;
  source: string;
  sourceType: SourceType;
  description: string;
  sheetText: string;
}

// ─── Type-specific normalizers ────────────────────────────────────────────────

function normalizeRace(
  el: El,
  base: BaseElementData,
  elementMap: Map<string, El>
): RaceElement {
  const setters = parseSetters(firstChild(el, "setters"));
  const rules = parseRules(firstChild(el, "rules"));

  // Walk the Race's Racial Trait grants; subraceRequired if any contain <select type="Sub Race">
  const subraceRequired = rules.grants.some((grant) => {
    if (grant.type !== "Racial Trait") return false;
    const traitEl = elementMap.get(grant.id);
    if (!traitEl) return false;
    const traitRules = firstChild(traitEl, "rules");
    if (!traitRules) return false;
    return allChildren(traitRules, "select").some((s: El) => attr(s, "type") === "Sub Race");
  });

  return {
    ...base,
    elementType: "Race",
    subraceRequired,
    nameData: {
      male: parseNameList(setters.get("names:male")?.value ?? ""),
      female: parseNameList(setters.get("names:female")?.value ?? ""),
      child: parseNameList(setters.get("names:child")?.value ?? ""),
      family: parseNameList(setters.get("names:family")?.value ?? ""),
      format: setters.get("names-format")?.value ?? "{{name}}",
    },
    sizeData: {
      heightBase: setters.get("height")?.value ?? "",
      heightModifier: setters.get("height")?.attrs.modifier ?? "",
      weightBase: setters.get("weight")?.value ?? "",
      weightModifier: setters.get("weight")?.attrs.modifier ?? "",
    },
    rules,
  };
}

function normalizeSubrace(el: El, base: BaseElementData): SubraceElement {
  const setters = parseSetters(firstChild(el, "setters"));
  const rules = parseRules(firstChild(el, "rules"));
  const parentRace = textOf(firstChild(el, "supports"));
  const heightEntry = setters.get("height");
  const weightEntry = setters.get("weight");

  return {
    ...base,
    elementType: "Subrace",
    parentRace,
    ...(heightEntry || weightEntry
      ? {
          sizeData: {
            heightBase: heightEntry?.value ?? "",
            heightModifier: heightEntry?.attrs.modifier ?? "",
            weightBase: weightEntry?.value ?? "",
            weightModifier: weightEntry?.attrs.modifier ?? "",
          },
        }
      : {}),
    rules,
  };
}

function normalizeClass(el: El, base: BaseElementData): ClassElement {
  const setters = parseSetters(firstChild(el, "setters"));
  const rules = parseRules(firstChild(el, "rules"));

  let multiclass: ClassMulticlass | undefined;
  const mcEl = firstChild(el, "multiclass");
  if (mcEl) {
    const mcSetters = parseSetters(firstChild(mcEl, "setters"));
    multiclass = {
      prerequisiteText: textOf(firstChild(mcEl, "prerequisite")),
      requirements: textOf(firstChild(mcEl, "requirements")),
      proficienciesText: mcSetters.get("multiclass proficiencies")?.value ?? "",
      rules: parseRules(firstChild(mcEl, "rules")),
    };
  }

  return {
    ...base,
    elementType: "Class",
    hitDie: setters.get("hd")?.value ?? "",
    shortDescription: setters.get("short")?.value ?? base.sheetText,
    ...(multiclass ? { multiclass } : {}),
    rules,
  };
}

function normalizeSubclass(el: El, base: BaseElementData): SubclassElement {
  return {
    ...base,
    elementType: "Subclass",
    parentClass: textOf(firstChild(el, "supports")),
    rules: parseRules(firstChild(el, "rules")),
  };
}

function normalizeFeature(
  el: El,
  base: BaseElementData,
  elementType: "ClassFeature" | "RacialTrait",
  sheet: ParsedSheet
): ClassFeatureElement | RacialTraitElement {
  const replacedBy = textOf(firstChild(el, "requirements")) || undefined;
  return {
    ...base,
    elementType,
    ...(sheet.action ? { action: sheet.action } : {}),
    ...(sheet.usage ? { usage: sheet.usage } : {}),
    variants: sheet.variants,
    ...(replacedBy ? { replacedBy } : {}),
    rules: parseRules(firstChild(el, "rules")),
  };
}

function normalizeSpell(el: El, base: BaseElementData): SpellElement {
  const setters = parseSetters(firstChild(el, "setters"));
  const supportsText = textOf(firstChild(el, "supports"));

  const classes = supportsText
    .split(",")
    .map((s: string) => s.trim())
    .filter((s: string) => s && !SPELL_NON_CLASS_TAGS.has(s));

  const keywords = (setters.get("keywords")?.value ?? "")
    .split(",")
    .map((s: string) => s.trim())
    .filter(Boolean);

  const materialDesc = setters.get("materialComponent")?.value || undefined;

  return {
    ...base,
    elementType: "Spell",
    level: parseInt(setters.get("level")?.value ?? "0", 10),
    school: setters.get("school")?.value ?? "",
    castingTime: setters.get("time")?.value ?? "",
    duration: setters.get("duration")?.value ?? "",
    range: setters.get("range")?.value ?? "",
    components: {
      verbal: setters.get("hasVerbalComponent")?.value === "true",
      somatic: setters.get("hasSomaticComponent")?.value === "true",
      material: setters.get("hasMaterialComponent")?.value === "true",
      ...(materialDesc ? { materialDescription: materialDesc } : {}),
    },
    concentration: setters.get("isConcentration")?.value === "true",
    ritual: setters.get("isRitual")?.value === "true",
    classes,
    keywords,
  };
}

function normalizeItem(el: El, base: BaseElementData, auroraType: string): ItemElement {
  const settersEl = firstChild(el, "setters");
  const setters = parseSetters(settersEl);
  const supportsText = textOf(firstChild(el, "supports"));
  const { category, damageType, properties } = decodeWeaponSupports(supportsText);

  const costEntry = setters.get("cost");
  const weightEntry = setters.get("weight");
  // <set name="damage" type="piercing">1d4</set> is keyed as "damage:piercing" by parseSetters
  const damageEntry = setters.get("damage")
    ?? [...setters.entries()].find(([k]) => k.startsWith("damage:"))?.[1];
  const rangeEntry = setters.get("range");

  type CostCurrency = NonNullable<ItemElement["cost"]>["currency"];

  let cost: ItemElement["cost"];
  if (costEntry) {
    const amount = parseInt(costEntry.value, 10);
    if (!isNaN(amount)) {
      cost = { amount, currency: (costEntry.attrs.currency as CostCurrency) ?? "gp" };
    }
  }

  const weightNum = weightEntry?.attrs.lb ? parseFloat(weightEntry.attrs.lb) : undefined;

  let damage: ItemElement["damage"];
  if (damageEntry && damageType) {
    damage = { dice: damageEntry.value, damageType };
  }

  let range: ItemElement["range"];
  if (rangeEntry?.value) {
    const [normalStr, longStr] = rangeEntry.value.split("/");
    const normal = parseInt(normalStr, 10);
    const long = parseInt(longStr, 10);
    if (!isNaN(normal) && !isNaN(long)) range = { normal, long };
  }

  // Versatile / two-handed damage — scan raw XML because parseSetters key-collides
  // when two <set name="damage"> entries share the same type attribute.
  let versatileDamageDice: string | undefined;
  if (settersEl) {
    for (const setEl of allChildren(settersEl, "set")) {
      if (
        (attr(setEl, "name") as string) === "damage" &&
        (attr(setEl, "equipped") as string).toLowerCase().includes("two-handed")
      ) {
        const v = textOf(setEl);
        if (v) versatileDamageDice = v;
        break;
      }
    }
  }

  // Aurora uses <set name="armor"> for the armor category: "Light", "Medium", "Heavy", "Shield"
  // The actual base AC is in <set name="armorClass"> as a text string like "11 + Dex modifier" or "16".
  // We extract the leading integer. Shields (+2 bonus) are excluded — no armorBaseAc.
  const armorCategoryRaw = setters.get("armor")?.value ?? "";
  const isShield = armorCategoryRaw.toLowerCase() === "shield";
  let armorType: ItemElement["armorType"];
  if (auroraType === "Armor" && !isShield) {
    const cat = armorCategoryRaw.toLowerCase();
    if (cat === "light") armorType = "light";
    else if (cat === "medium") armorType = "medium";
    else if (cat === "heavy") armorType = "heavy";
  }
  const armorClassText = isShield ? "" : (setters.get("armorClass")?.value ?? "");
  const armorAcMatch = armorClassText.match(/(\d+)/);
  const armorAcRaw = armorAcMatch ? parseInt(armorAcMatch[1], 10) : NaN;
  const armorStrRaw = parseInt(setters.get("strength")?.value ?? "", 10);
  const chargesRaw = parseInt(setters.get("charges")?.value ?? "", 10);

  return {
    ...base,
    elementType: "Item",
    itemType: auroraType,
    ...(category ? { category } : {}),
    ...(cost ? { cost } : {}),
    ...(weightNum !== undefined ? { weight: weightNum } : {}),
    slot: setters.get("slot")?.value,
    ...(damage ? { damage } : {}),
    ...(versatileDamageDice ? { versatileDamageDice } : {}),
    ...(range ? { range } : {}),
    properties,
    proficiencyId: setters.get("proficiency")?.value,
    ...(!isNaN(armorAcRaw) ? { armorBaseAc: armorAcRaw } : {}),
    ...(!isNaN(armorStrRaw) ? { armorStrReq: armorStrRaw } : {}),
    ...(setters.get("stealth")?.value?.toLowerCase().includes("disadvantage")
      ? { stealthDisadvantage: true }
      : {}),
    ...(armorType ? { armorType } : {}),
    ...(setters.get("rarity")?.value ? { rarity: setters.get("rarity")!.value } : {}),
    ...(setters.get("attunement")?.value
      ? { attunement: setters.get("attunement")!.value }
      : {}),
    ...(!isNaN(chargesRaw) ? { charges: chargesRaw } : {}),
    rules: parseRules(firstChild(el, "rules")),
  };
}

function normalizeBackground(el: El, base: BaseElementData): BackgroundElement {
  const setters = parseSetters(firstChild(el, "setters"));
  return {
    ...base,
    elementType: "Background",
    shortDescription: setters.get("short")?.value ?? "",
    rules: parseRules(firstChild(el, "rules")),
  };
}

function normalizeLanguage(el: El, base: BaseElementData): LanguageElement {
  const setters = parseSetters(firstChild(el, "setters"));
  return {
    ...base,
    elementType: "Language",
    languageType: setters.get("type")?.value,
    speakers: setters.get("speakers")?.value,
    script: setters.get("script")?.value,
  };
}

function normalizeProficiency(el: El, base: BaseElementData, auroraType: string): ProficiencyElement {
  const setters = parseSetters(firstChild(el, "setters"));
  return {
    ...base,
    elementType: "Proficiency",
    proficiencyType: setters.get("category")?.value ?? auroraType,
  };
}

function normalizeFeat(el: El, base: BaseElementData): FeatElement {
  const setters = parseSetters(firstChild(el, "setters"));
  return {
    ...base,
    elementType: "Feat",
    prerequisite: setters.get("prerequisite")?.value,
    rules: parseRules(firstChild(el, "rules")),
  };
}

function normalizeCondition(base: BaseElementData): ConditionElement {
  return { ...base, elementType: "Condition" };
}

// ─── Main dispatcher ──────────────────────────────────────────────────────────

function normalizeElement(
  el: El,
  sourceType: SourceType,
  elementMap: Map<string, El>
): AuroraElement | null {
  const auroraType = attr(el, "type") as string;
  const elementType = AURORA_TYPE_MAP[auroraType] as ElementType | undefined;
  if (!elementType) return null;

  const id = attr(el, "id") as string;
  const name = attr(el, "name") as string;
  if (!id || !name) return null;

  const sheet = parseSheet(firstChild(el, "sheet"));
  const base: BaseElementData = {
    id,
    name,
    source: attr(el, "source") as string,
    sourceType,
    description: innerXML(firstChild(el, "description")),
    sheetText: sheet.sheetText,
  };

  switch (elementType) {
    case "Race":         return normalizeRace(el, base, elementMap);
    case "Subrace":      return normalizeSubrace(el, base);
    case "Class":        return normalizeClass(el, base);
    case "Subclass":     return normalizeSubclass(el, base);
    case "ClassFeature": return normalizeFeature(el, base, "ClassFeature", sheet);
    case "RacialTrait":  return normalizeFeature(el, base, "RacialTrait", sheet);
    case "Spell":        return normalizeSpell(el, base);
    case "Item":         return normalizeItem(el, base, auroraType);
    case "Background":   return normalizeBackground(el, base);
    case "Language":     return normalizeLanguage(el, base);
    case "Proficiency":  return normalizeProficiency(el, base, auroraType);
    case "Feat":         return normalizeFeat(el, base);
    case "Condition":    return normalizeCondition(base);
    default:             return null;
  }
}

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Parse a raw Aurora element XML file string into normalized AuroraElement objects.
 * Emits one AuroraElement per <element> node in the file (skipping unknown types).
 */
export function parseAuroraFile(
  xml: string,
  sourceType: SourceType = "imported"
): AuroraElement[] {
  const doc = new DOMParser().parseFromString(xml, "text/xml");
  const rawElements = Array.from<El>(doc.getElementsByTagName("element"));

  // Build an in-file element map for cross-references (e.g. subraceRequired)
  const elementMap = new Map<string, El>();
  for (const el of rawElements) {
    const id = attr(el, "id") as string;
    if (id) elementMap.set(id, el);
  }

  const results: AuroraElement[] = [];
  for (const el of rawElements) {
    const normalized = normalizeElement(el, sourceType, elementMap);
    if (normalized) results.push(normalized);
  }
  return results;
}
