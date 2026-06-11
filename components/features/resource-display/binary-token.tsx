"use client";

interface BinaryTokenProps {
  name: string;
  current: number;
  onChange: (next: number) => void;
}

export function BinaryToken({ name, current, onChange }: BinaryTokenProps) {
  const active = current >= 1;
  return (
    <button
      onClick={() => onChange(active ? 0 : 1)}
      aria-label={active ? `Deactivate ${name}` : `Activate ${name}`}
      aria-pressed={active}
      className={`px-4 py-2 rounded-full text-sm font-semibold border transition-colors ${
        active
          ? "bg-amber-500/20 border-amber-500 text-amber-300"
          : "bg-stone-800 border-stone-600 text-stone-500"
      }`}
    >
      {active ? "Active" : "Inactive"}
    </button>
  );
}
