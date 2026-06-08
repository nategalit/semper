export function FilterPill({
  active,
  onClick,
  label,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      onClick={onClick}
      className={`shrink-0 min-h-[32px] px-3 rounded-full text-xs font-medium transition-colors ${
        active
          ? "bg-amber-600 text-stone-950"
          : "bg-stone-800 text-stone-400 hover:text-stone-200"
      }`}
    >
      {label}
    </button>
  );
}
