import { signedMod } from "@/lib/character/calc";

interface Props {
  label: string;
  modifier: number;
  proficient: boolean;
}

export function ProficiencyRow({ label, modifier, proficient }: Props) {
  return (
    <div className="flex items-center gap-2 py-1">
      <span
        className={`w-2.5 h-2.5 rounded-full shrink-0 border ${
          proficient ? "bg-amber-400 border-amber-400" : "bg-transparent border-stone-600"
        }`}
      />
      <span className="flex-1 text-sm text-stone-300">{label}</span>
      <span className="text-sm font-semibold text-stone-100 tabular-nums w-8 text-right">
        {signedMod(modifier)}
      </span>
    </div>
  );
}
