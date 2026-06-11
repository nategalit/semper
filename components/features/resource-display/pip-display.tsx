"use client";

const UNLIMITED = 999;

interface PipDisplayProps {
  name: string;
  current: number;
  max: number;
  onChange: (next: number) => void;
}

export function PipDisplay({ name, current, max, onChange }: PipDisplayProps) {
  if (max >= UNLIMITED) {
    return <p className="text-2xl font-bold text-amber-400">∞</p>;
  }

  return (
    <div className="flex gap-0.5 flex-wrap">
      {Array.from({ length: max }).map((_, i) => {
        const filled = i < current;
        return (
          <button
            key={i}
            onClick={() => onChange(filled ? current - 1 : current + 1)}
            aria-label={filled ? `Use ${name}` : `Restore ${name}`}
            className="w-11 h-11 flex items-center justify-center active:scale-90 transition-transform"
          >
            <span className={`w-5 h-5 rounded-full border-2 transition-all duration-200 ${
              filled
                ? "bg-amber-400 border-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.4)]"
                : "bg-stone-800 border-stone-600"
            }`} />
          </button>
        );
      })}
    </div>
  );
}
