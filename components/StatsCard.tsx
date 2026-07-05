import type { LucideIcon } from "lucide-react";

interface StatsCardProps {
  label: string;
  value: number;
  tone: "rose" | "amber" | "emerald" | "sky" | "violet";
  icon: LucideIcon;
}

const toneClasses: Record<StatsCardProps["tone"], { icon: string; line: string; glow: string }> = {
  rose: {
    icon: "bg-rose-100 text-rose-700 dark:bg-rose-400/15 dark:text-rose-200",
    line: "bg-rose-500",
    glow: "shadow-[0_18px_60px_rgba(244,63,94,0.16)]"
  },
  amber: {
    icon: "bg-amber-100 text-amber-700 dark:bg-amber-300/15 dark:text-amber-100",
    line: "bg-amber-400",
    glow: "shadow-[0_18px_60px_rgba(245,158,11,0.13)]"
  },
  emerald: {
    icon: "bg-emerald-100 text-emerald-700 dark:bg-emerald-300/15 dark:text-emerald-100",
    line: "bg-emerald-400",
    glow: "shadow-[0_18px_60px_rgba(16,185,129,0.13)]"
  },
  sky: {
    icon: "bg-sky-100 text-sky-700 dark:bg-sky-300/15 dark:text-sky-100",
    line: "bg-sky-400",
    glow: "shadow-[0_18px_60px_rgba(56,189,248,0.13)]"
  },
  violet: {
    icon: "bg-violet-100 text-violet-700 dark:bg-violet-300/15 dark:text-violet-100",
    line: "bg-violet-400",
    glow: "shadow-[0_18px_60px_rgba(139,92,246,0.13)]"
  }
};

export function StatsCard({ label, value, tone, icon: Icon }: StatsCardProps) {
  const toneClass = toneClasses[tone];

  return (
    <article
      className={`animate-fade-up overflow-hidden rounded-[26px] border border-zinc-200/80 bg-white/[0.82] p-5 shadow-sm backdrop-blur transition duration-300 hover:-translate-y-1 hover:shadow-ink dark:border-white/10 dark:bg-white/[0.065] ${toneClass.glow}`}
    >
      <div className={`mb-5 h-1.5 w-14 rounded-full ${toneClass.line}`} />
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="min-h-10 text-sm font-semibold leading-5 text-zinc-500 dark:text-zinc-400">{label}</p>
          <p className="mt-2 text-4xl font-semibold tracking-normal text-zinc-950 dark:text-white">
            {value.toLocaleString()}
          </p>
        </div>
        <div className={`inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${toneClass.icon}`}>
          <Icon aria-hidden className="h-5 w-5" />
        </div>
      </div>
    </article>
  );
}
