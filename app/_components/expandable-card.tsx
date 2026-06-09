import type { ReactNode } from "react";

interface Props {
  expanded: boolean;
  onToggle: () => void;
  header: ReactNode;
  children: ReactNode;
  className?: string;
}

export function ExpandableCard({ expanded, onToggle, header, children, className }: Props) {
  return (
    <div
      className={`rounded-xl border transition-colors ${
        expanded
          ? "border-stone-600 bg-stone-900"
          : "border-stone-800 bg-stone-900 hover:border-stone-700"
      } ${className ?? ""}`}
    >
      <button
        className="w-full px-4 py-3 text-left flex items-center justify-between gap-3"
        onClick={onToggle}
        aria-expanded={expanded}
      >
        <div className="min-w-0 flex-1">{header}</div>
        <svg
          className={`shrink-0 w-4 h-4 text-stone-500 transition-transform duration-150 ${expanded ? "rotate-180" : ""}`}
          viewBox="0 0 20 20"
          fill="currentColor"
          aria-hidden
        >
          <path
            fillRule="evenodd"
            d="M5.22 8.22a.75.75 0 0 1 1.06 0L10 11.94l3.72-3.72a.75.75 0 1 1 1.06 1.06l-4.25 4.25a.75.75 0 0 1-1.06 0L5.22 9.28a.75.75 0 0 1 0-1.06Z"
            clipRule="evenodd"
          />
        </svg>
      </button>
      {expanded && (
        <div className="border-t border-stone-800 px-4 pb-4 pt-3">
          {children}
        </div>
      )}
    </div>
  );
}
