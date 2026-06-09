import { signedMod } from "@/lib/character/calc";

interface Props {
  label: string;
  modifier: number;
  proficient: boolean;
  hasOverride?: boolean;
  onClick?: () => void;
}

export function ProficiencyRow({ label, modifier, proficient, hasOverride, onClick }: Props) {
  const inner = (
    <>
      <span
        className={`w-2.5 h-2.5 rounded-full shrink-0 border ${
          proficient ? "bg-amber-400 border-amber-400" : "bg-transparent border-stone-600"
        }`}
      />
      <span className="flex-1 text-sm text-stone-300">{label}</span>
      <span className="relative text-sm font-semibold text-stone-100 tabular-nums w-8 text-right">
        {signedMod(modifier)}
        {hasOverride && (
          <span className="absolute -top-0.5 -right-1.5 w-1.5 h-1.5 rounded-full bg-amber-400" aria-hidden />
        )}
      </span>
    </>
  );

  if (onClick) {
    return (
      <button
        onClick={onClick}
        className="w-full flex items-center gap-2 py-1 rounded hover:bg-stone-800 -mx-1 px-1 transition-colors"
      >
        {inner}
      </button>
    );
  }
  return <div className="flex items-center gap-2 py-1">{inner}</div>;
}
