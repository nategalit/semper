/**
 * Design token constants for the app shell.
 * Use these instead of inline Tailwind strings so visual language stays consistent.
 *
 * Rounded rules (do not deviate without updating this comment):
 *   rounded-xl   — cards, primary buttons, large containers
 *   rounded-lg   — secondary buttons, info containers, inputs, smaller interactive elements
 *   rounded      — small chips and badges
 *   rounded-full — pills (FilterPill, status pills)
 *   rounded-md   — marketing/auth pages only (landing, login, dashboard) — NOT inside app shell
 */

// ─── Chips / Badges ──────────────────────���────────────────────────────────────
// Base structural classes (add at call site): text-[10px] font-medium px-1.5 py-0.5 rounded shrink-0

export const chip = {
  source: {
    /** SRD baseline content — visually recedes, no border */
    srd:          "bg-stone-700 text-stone-300",
    /** Aurora-imported content — announces itself with indigo + border */
    aurora:       "bg-indigo-900/60 text-indigo-300 border border-indigo-700/50",
    /** SRD chip when the card it's on is selected */
    srdActive:    "bg-stone-500 text-stone-100",
    /** Aurora chip when the card it's on is selected */
    auroraActive: "bg-indigo-600 text-indigo-100",
  },
  type: {
    /** Half-feat badge (+1 ability score) */
    half:  "bg-amber-900/40 text-amber-400 border border-amber-800/50",
    /** Spell school / spell level */
    spell: "bg-sky-900/40 text-sky-400 border border-sky-800/50",
  },
  status: {
    /** Soft warning — unprepared, at-limit */
    warning: "bg-amber-900/30 text-amber-500 border border-amber-800/40",
    /** Hard status — active conditions, errors */
    danger:  "bg-red-900/60 text-red-300 border border-red-700",
    /** Neutral informational — custom conditions */
    neutral: "bg-orange-900/60 text-orange-300 border border-orange-700",
  },
} as const;

/**
 * Returns the correct source chip color classes for a given source string.
 * Works with both ContentSource values ("SRD" | "Aurora") and sourceLabel strings
 * ("SRD", "PHB", "PHB24", "TCE", etc.). Anything that isn't literally "SRD" is
 * treated as Aurora/imported content.
 *
 * @param active - pass true when the card this chip belongs to is selected
 */
export function sourceChipClass(source: string | undefined, active = false): string {
  const isAurora = !!source && source !== "SRD";
  if (active) return isAurora ? chip.source.auroraActive : chip.source.srdActive;
  return isAurora ? chip.source.aurora : chip.source.srd;
}

// ─── Buttons ────────��──────────────────────────���──────────────────────────────
// Pair with w-full or px-N as needed at the call site.

export const btn = {
  /** Amber fill — confirm, save, primary actions */
  primary:     "min-h-[48px] rounded-xl bg-amber-600 text-stone-950 font-bold hover:bg-amber-500 active:bg-amber-700 transition-colors",
  /** Stone fill — cancel, secondary actions */
  secondary:   "min-h-[48px] rounded-xl bg-stone-700 text-stone-100 font-semibold hover:bg-stone-600 active:bg-stone-800 transition-colors",
  /** Outlined — tertiary actions, toggles */
  outline:     "min-h-[44px] rounded-lg border border-stone-600 text-stone-300 hover:border-stone-400 hover:text-stone-100 transition-colors",
  /** Text only — low-priority actions */
  ghost:       "min-h-[44px] rounded-lg text-stone-400 hover:text-stone-200 transition-colors",
  /** Outlined red — destructive secondary (forget spell, remove item) */
  danger:      "min-h-[44px] rounded-lg border border-red-800 bg-red-900/30 text-red-400 hover:bg-red-900/50 transition-colors",
  /** Solid red — destructive primary (delete character) */
  dangerSolid: "min-h-[44px] rounded-lg bg-red-700 text-stone-100 font-semibold hover:bg-red-600 transition-colors",
  /** Smaller variant of outline for inline / list actions */
  sm:          "min-h-[36px] rounded-lg border border-stone-600 text-stone-300 text-xs hover:border-stone-400 hover:text-stone-100 transition-colors",
} as const;

// ─── Cards / Containers ───────────────────────────────────────────────────────

export const card = {
  /** Tappable content cards — feat cards, subclass cards, spell cards */
  interactive: "rounded-xl border border-stone-700",
  /** Section containers — SectionCard wrapper, panel sections */
  section:     "rounded-xl border border-stone-800",
  /** Static info blocks — empty states, notices, non-interactive summaries */
  info:        "rounded-lg border border-stone-800 bg-stone-900/50",
} as const;

// ─── Labels / Headers ──────���──────────────────────────────────────────────────

export const label = {
  /** Top-level section headers — SectionCard title, panel section headers */
  section: "text-xs font-semibold uppercase tracking-widest text-stone-500",
  /** Filter group labels, subsection labels */
  group:   "text-[10px] uppercase tracking-widest text-stone-600 font-medium",
} as const;

// ─── Text hierarchy ────────��──────────────────────────────────────────────────
// Reference only — these aren't used programmatically, they document the rule.
//
//   text-stone-100  heading, active/selected item name
//   text-stone-300  body copy, interactive labels
//   text-stone-400  secondary metadata, labels
//   text-stone-500  section headers, hints (see label.section)
//   text-stone-600  filter group labels, very low priority (see label.group)
//   text-amber-400  primary accent — level numbers, active counts
//   text-amber-300  highlight — selected item names on amber-tinted background
//   text-amber-500  warning messages, soft errors
