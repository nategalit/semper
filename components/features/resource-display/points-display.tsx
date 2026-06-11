"use client";

interface PointsDisplayProps {
  name: string;
  current: number;
  max: number;
  onChange: (next: number) => void;
}

export function PointsDisplay({ name, current, max, onChange }: PointsDisplayProps) {
  return (
    <div className="flex items-center gap-3">
      <button
        onClick={() => onChange(Math.max(0, current - 1))}
        disabled={current <= 0}
        aria-label={`Spend ${name} point`}
        className="w-11 h-11 rounded-xl bg-stone-800 border border-stone-700 text-stone-200 text-xl
          flex items-center justify-center hover:border-stone-500 disabled:opacity-30 disabled:cursor-not-allowed"
      >
        −
      </button>
      <div className="text-center">
        <span className="text-xl font-bold text-stone-100 tabular-nums">{current}</span>
        <span className="text-xs text-stone-600"> / {max}</span>
      </div>
      <button
        onClick={() => onChange(Math.min(max, current + 1))}
        disabled={current >= max}
        aria-label={`Recover ${name} point`}
        className="w-11 h-11 rounded-xl bg-stone-800 border border-stone-700 text-stone-200 text-xl
          flex items-center justify-center hover:border-stone-500 disabled:opacity-30 disabled:cursor-not-allowed"
      >
        +
      </button>
    </div>
  );
}
