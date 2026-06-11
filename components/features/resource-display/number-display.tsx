"use client";

interface NumberDisplayProps {
  name: string;
  current: number;
  max: number;
  onChange: (next: number) => void;
}

export function NumberDisplay({ name, current, max, onChange }: NumberDisplayProps) {
  return (
    <div className="flex items-center gap-3">
      <button
        onClick={() => onChange(Math.max(0, current - 1))}
        disabled={current <= 0}
        aria-label={`Use ${name}`}
        className="w-11 h-11 rounded-xl bg-stone-800 border border-stone-700 text-stone-200 text-xl
          flex items-center justify-center hover:border-stone-500 disabled:opacity-30 disabled:cursor-not-allowed"
      >
        −
      </button>
      <span className="text-xl font-bold text-stone-100 tabular-nums min-w-[3ch] text-center">
        {current}
      </span>
      <button
        onClick={() => onChange(Math.min(max, current + 1))}
        disabled={current >= max}
        aria-label={`Restore ${name}`}
        className="w-11 h-11 rounded-xl bg-stone-800 border border-stone-700 text-stone-200 text-xl
          flex items-center justify-center hover:border-stone-500 disabled:opacity-30 disabled:cursor-not-allowed"
      >
        +
      </button>
      <span className="text-xs text-stone-600">/ {max}</span>
    </div>
  );
}
