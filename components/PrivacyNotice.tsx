import { LockKeyhole, ShieldCheck, WifiOff } from "lucide-react";

const items = [
  {
    icon: LockKeyhole,
    title: "No Instagram credentials",
    text: "The app never asks for login, cookies, sessions, tokens, or passwords."
  },
  {
    icon: WifiOff,
    title: "Local browser analysis",
    text: "Your ZIP and JSON files are parsed in this browser tab, not uploaded to an app server."
  },
  {
    icon: ShieldCheck,
    title: "Export files only",
    text: "It works from your own Instagram data export and does not scrape or call unofficial APIs."
  }
];

export function PrivacyNotice() {
  return (
    <section className="mx-auto grid max-w-6xl gap-3 px-4 py-6 sm:px-6 md:grid-cols-3">
      {items.map((item) => {
        const Icon = item.icon;
        return (
          <article
            className="group rounded-[24px] border border-zinc-200/80 bg-white/[0.72] p-5 shadow-sm backdrop-blur transition duration-300 hover:-translate-y-1 hover:bg-white hover:shadow-ink dark:border-white/10 dark:bg-white/[0.045] dark:hover:bg-white/[0.07]"
            key={item.title}
          >
            <div className="mb-5 inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-zinc-950 text-white transition group-hover:scale-105 dark:bg-white dark:text-zinc-950">
              <Icon aria-hidden className="h-5 w-5" />
            </div>
            <h3 className="text-base font-semibold text-zinc-950 dark:text-white">{item.title}</h3>
            <p className="mt-2 text-sm leading-6 text-zinc-600 dark:text-zinc-300">{item.text}</p>
          </article>
        );
      })}
    </section>
  );
}
