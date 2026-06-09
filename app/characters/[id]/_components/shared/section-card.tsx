import type { ReactNode } from "react";

interface Props {
  title?: string;
  children: ReactNode;
  className?: string;
}

export function SectionCard({ title, children, className = "" }: Props) {
  return (
    <div className={`rounded-xl border border-stone-700 bg-stone-900/50 p-4 ${className}`}>
      {title && (
        <h2 className="text-xs font-semibold uppercase tracking-widest text-stone-500 mb-3">{title}</h2>
      )}
      {children}
    </div>
  );
}
