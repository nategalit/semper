export type SourceType = "bundled" | "imported";
export type Currency = "cp" | "sp" | "ep" | "gp" | "pp";

export interface IdNamePair {
  id: string;
  name: string;
}

// ─── Shared base ─────────────────────────────────────────────────────────────

export interface BaseElement {
  id: string;
  name: string;
  source: string;
  sourceType: SourceType;
  /** Sanitized HTML string for detail/info modal. */
  description: string;
  /** Short blurb rendered directly on the character sheet. Empty when display="false". */
  sheetText: string;
}

// ─── Rules normalization ─────────────────────────────────────────────────────

export interface StatModifier {
  stat: string;
  value: number;
  /** "base" means set as floor (non-stacking). Absent means additive. */
  bonus?: string;
  requirements?: string;
}

export interface GrantedElement {
  /** Aurora rule type: "Proficiency" | "Language" | "Racial Trait" | "Spell" | "Class Feature" | etc. */
  type: string;
  id: string;
  /** Human-readable name, resolved from lookup where possible. */
  name?: string;
  /** Minimum character level required for this grant. */
  level?: number;
  /** Boolean expression: comma = AND, || = OR, ! = NOT. */
  requirements?: string;
}

/**
 * Player selects from a list of existing elements (spells, subraces, languages, etc.).
 * Matches <select> nodes where type != "List".
 */
export interface ElementSelectChoice {
  kind: "element";
  /** Aurora element type to select from. */
  type: string;
  name: string;
  /** Filter applied against target elements' <supports> block. */
  supports: string;
  number: number;
  level?: number;
  optional?: boolean;
  requirements?: string;
}

/**
 * Player picks from an inline list of text options (personality traits, ideals, bonds, flaws,
 * specialty tables, fighting styles, etc.).
 * Matches <select type="List"> nodes with <item> children.
 */
export interface ListSelectChoice {
  kind: "list";
  name: string;
  number: number;
  optional?: boolean;
  items: Array<{ id: string; text: string }>;
}

export type SelectChoice = ElementSelectChoice | ListSelectChoice;

/** Rule node that doesn't map to a known normalized type. Stored as-is so the UI can skip it. */
export interface ExtraRule {
  tag: string;
  attributes: Record<string, string>;
}

export interface NormalizedRules {
  statModifiers: StatModifier[];
  grants: GrantedElement[];
  choices: SelectChoice[];
  extraRules: ExtraRule[];
}

// ─── Element types ────────────────────────────────────────────────────────────

export interface RaceElement extends BaseElement {
  elementType: "Race";
  /** True when a <select type="Sub Race"> is present in the race's trait tree. */
  subraceRequired: boolean;
  nameData: {
    male: string[];
    female: string[];
    child: string[];
    family: string[];
    format: string;
  };
  sizeData: {
    heightBase: string;
    heightModifier: string;
    weightBase: string;
    weightModifier: string;
  };
  rules: NormalizedRules;
}

export interface SubraceElement extends BaseElement {
  elementType: "Subrace";
  /** Name of the parent race (from <supports> tag). */
  parentRace: string;
  sizeData?: {
    heightBase: string;
    heightModifier: string;
    weightBase: string;
    weightModifier: string;
  };
  rules: NormalizedRules;
}

/** A level-scaled variant of a class feature's sheet text. level=0 means all levels. */
export interface ClassFeatureVariant {
  level: number;
  text: string;
  action?: string;
  usage?: string;
}

interface BaseFeatureElement extends BaseElement {
  /** Default action type when used ("Action" | "Bonus Action" | "Reaction"). */
  action?: string;
  /** Default usage string, e.g. "1/Short Rest". */
  usage?: string;
  /** Level-scaled sheet descriptions, sorted by level ascending. */
  variants: ClassFeatureVariant[];
  /**
   * Raw <requirements> string from the element's direct child (not inside <rules>).
   * Used by Aurora to suppress the feature when a replacement is active.
   */
  replacedBy?: string;
  rules: NormalizedRules;
}

export interface ClassFeatureElement extends BaseFeatureElement {
  elementType: "ClassFeature";
}

/** Racial traits, background features, and archetype features share this shape. */
export interface RacialTraitElement extends BaseFeatureElement {
  elementType: "RacialTrait";
}

export interface ClassMulticlass {
  prerequisiteText: string;
  /** Raw Aurora requirements expression. */
  requirements: string;
  proficienciesText: string;
  rules: NormalizedRules;
}

export interface ClassElement extends BaseElement {
  elementType: "Class";
  /** Hit die size string, e.g. "d10". */
  hitDie: string;
  shortDescription: string;
  multiclass?: ClassMulticlass;
  rules: NormalizedRules;
}

export interface SubclassElement extends BaseElement {
  elementType: "Subclass";
  /** Name of the parent class (from <supports> tag). */
  parentClass: string;
  rules: NormalizedRules;
}

export interface SpellElement extends BaseElement {
  elementType: "Spell";
  /** 0 = cantrip. */
  level: number;
  school: string;
  castingTime: string;
  duration: string;
  range: string;
  components: {
    verbal: boolean;
    somatic: boolean;
    material: boolean;
    materialDescription?: string;
  };
  concentration: boolean;
  ritual: boolean;
  /** Class names that can cast this spell, derived from <supports> (non-class tags filtered out). */
  classes: string[];
  keywords: string[];
}

export interface ItemElement extends BaseElement {
  elementType: "Item";
  /** Aurora element type string: "Weapon", "Armor", "Gear", "Tool", "Mount", etc. */
  itemType: string;
  category?: IdNamePair;
  cost?: { amount: number; currency: Currency };
  weight?: number;
  slot?: string;
  damage?: { dice: string; damageType: IdNamePair };
  /** Two-handed / versatile damage dice (from <set name="damage" equipped="Two-Handed">). */
  versatileDamageDice?: string;
  /** Normal/long range in feet (ranged weapons and thrown weapons only). */
  range?: { normal: number; long: number };
  properties: IdNamePair[];
  proficiencyId?: string;
  /** Base AC value for armor items (from <set name="armor">). */
  armorBaseAc?: number;
  /** Minimum STR required to wear this armor (from <set name="strength">). */
  armorStrReq?: number;
  /** True when <set name="stealth"> value contains "Disadvantage". */
  stealthDisadvantage?: boolean;
  /** "Light Armor" | "Medium Armor" | "Heavy Armor" — parsed from <supports> text. */
  armorType?: "light" | "medium" | "heavy";
  /** Rarity string, e.g. "Uncommon" (from <set name="rarity">). */
  rarity?: string;
  /** Attunement description text, e.g. "by a spellcaster" (from <set name="attunement">). Present means attunement required. */
  attunement?: string;
  /** Maximum charges for structured charged items (from <set name="charges">). */
  charges?: number;
  rules: NormalizedRules;
}

export interface BackgroundElement extends BaseElement {
  elementType: "Background";
  /** Comma-separated summary from <set name="short">, e.g. "Athletics, Intimidation, Gaming Set". */
  shortDescription: string;
  rules: NormalizedRules;
}

export interface LanguageElement extends BaseElement {
  elementType: "Language";
  languageType?: string;
  speakers?: string;
  script?: string;
}

export interface ProficiencyElement extends BaseElement {
  elementType: "Proficiency";
  /** "Skill" | "Weapon" | "Armor" | "Tool" | "Saving Throw" | "Gaming Set" | etc. */
  proficiencyType: string;
}

export interface FeatElement extends BaseElement {
  elementType: "Feat";
  prerequisite?: string;
  rules: NormalizedRules;
}

export interface ConditionElement extends BaseElement {
  elementType: "Condition";
}

// ─── Union type ───────────────────────────────────────────────────────────────

export type AuroraElement =
  | RaceElement
  | SubraceElement
  | ClassElement
  | SubclassElement
  | ClassFeatureElement
  | RacialTraitElement
  | SpellElement
  | ItemElement
  | BackgroundElement
  | LanguageElement
  | ProficiencyElement
  | FeatElement
  | ConditionElement;

export type ElementType = AuroraElement["elementType"];

// ─── Aurora element type string → our ElementType ────────────────────────────

/** Maps Aurora's raw type= attribute values to our ElementType discriminant. */
export const AURORA_TYPE_MAP: Record<string, ElementType> = {
  Race: "Race",
  "Sub Race": "Subrace",
  Class: "Class",
  Archetype: "Subclass",
  "Archetype Feature": "ClassFeature",
  "Class Feature": "ClassFeature",
  "Racial Trait": "RacialTrait",
  "Background Feature": "RacialTrait",
  Spell: "Spell",
  Weapon: "Item",
  Armor: "Item",
  Gear: "Item",
  Tool: "Item",
  Mount: "Item",
  "Magic Item": "Item",
  Background: "Background",
  Language: "Language",
  Proficiency: "Proficiency",
  Feat: "Feat",
  Condition: "Condition",
};
