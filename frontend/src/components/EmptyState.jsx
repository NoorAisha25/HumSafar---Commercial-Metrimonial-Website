import { Users } from "lucide-react";

export default function EmptyState({ title, desc, compact = false }) {
  return (
    <div
      className={`flex flex-col items-center justify-center rounded-2xl border border-dashed border-border/70 text-center ${
        compact ? "gap-2 p-6" : "gap-3 p-16"
      }`}
    >
      <span className="flex h-10 w-10 items-center justify-center rounded-full bg-surface-2 text-muted">
        <Users size={18} />
      </span>
      <p className="font-display font-semibold text-cream">{title}</p>
      {desc && <p className="max-w-sm text-sm text-muted">{desc}</p>}
    </div>
  );
}
