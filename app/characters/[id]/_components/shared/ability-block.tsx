import { signedMod } from "@/lib/character/calc";

interface Props {
  label: string;
  score: number;
  mod: number;
}

export function AbilityBlock({ label, score, mod }: Props) {
  return (
    <div className="flex flex-col items-center gap-0.5 rounded-xl border border-stone-700 bg-stone-800/50 px-3 py-3 min-w-[68px]">
      <span className="text-[10px] font-semibold uppercase tracking-widest text-stone-400">{label}</span>
      <span className="text-2xl font-bold text-stone-100 leading-tight">{signedMod(mod)}</span>
      <span className="text-xs text-stone-500">{score}</span>
    </div>
  );
}
