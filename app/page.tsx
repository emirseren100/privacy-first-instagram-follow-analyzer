"use client";

import {
  BadgeCheck,
  DatabaseZap,
  Eye,
  HeartHandshake,
  Shield,
  Sparkles,
  UserCheck,
  UserMinus,
  Users
} from "lucide-react";
import { useMemo, useState } from "react";
import { PrivacyNotice } from "@/components/PrivacyNotice";
import { ResultTabs } from "@/components/ResultTabs";
import { StatsCard } from "@/components/StatsCard";
import { ThemeToggle } from "@/components/ThemeToggle";
import { UploadDropzone } from "@/components/UploadDropzone";
import { parseInstagramExport } from "@/utils/parseInstagramExport";
import { analyzeFollows } from "@/utils/setOperations";
import type { FollowAnalysis, ParseProgress, ParsedInstagramExport, TabConfig } from "@/utils/types";
import { NetworkField } from "@/components/NetworkField";

const emptyAnalysis: FollowAnalysis = {
  followers: [],
  following: [],
  notFollowingBack: [],
  iDontFollowBack: [],
  mutuals: []
};

function createTabs(analysis: FollowAnalysis): TabConfig[] {
  return [
    {
      id: "notFollowingBack",
      label: "Not Following Me Back",
      description: "Accounts you follow that are not present in your followers export.",
      count: analysis.notFollowingBack.length,
      users: analysis.notFollowingBack
    },
    {
      id: "iDontFollowBack",
      label: "I Don't Follow Back",
      description: "Accounts that follow you but are not present in your following export.",
      count: analysis.iDontFollowBack.length,
      users: analysis.iDontFollowBack
    },
    {
      id: "mutuals",
      label: "Mutuals",
      description: "Accounts that appear in both followers and following.",
      count: analysis.mutuals.length,
      users: analysis.mutuals
    },
    {
      id: "followers",
      label: "All Followers",
      description: "Every normalized, deduplicated username found in follower files.",
      count: analysis.followers.length,
      users: analysis.followers
    },
    {
      id: "following",
      label: "All Following",
      description: "Every normalized, deduplicated username found in following files.",
      count: analysis.following.length,
      users: analysis.following
    }
  ];
}

export default function Home() {
  const [analysis, setAnalysis] = useState<FollowAnalysis>(emptyAnalysis);
  const [parsed, setParsed] = useState<ParsedInstagramExport | null>(null);
  const [progress, setProgress] = useState<ParseProgress | null>(null);
  const [errors, setErrors] = useState<string[]>([]);
  const [warnings, setWarnings] = useState<string[]>([]);
  const [isParsing, setIsParsing] = useState(false);
  const hasResults = analysis.followers.length > 0 || analysis.following.length > 0;
  const tabs = useMemo(() => createTabs(analysis), [analysis]);

  async function handleFiles(files: File[]) {
    setIsParsing(true);
    setErrors([]);
    setWarnings([]);
    setProgress({
      currentFile: "",
      completed: 0,
      total: files.length,
      message: "Preparing local files"
    });

    try {
      const result = await parseInstagramExport(files, setProgress);
      const nextAnalysis = analyzeFollows(result.followers, result.following);
      setParsed(result);
      setAnalysis(nextAnalysis);
      setErrors(result.errors);
      setWarnings(result.warnings);
    } catch (error) {
      setErrors([error instanceof Error ? error.message : "Files could not be parsed"]);
      setWarnings([]);
    } finally {
      setIsParsing(false);
    }
  }

  return (
    <main className="grain-overlay relative isolate min-h-screen overflow-hidden pb-16">
      <NetworkField />
      <div className="relative z-10">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-4 py-5 sm:px-6">
        <a className="inline-flex items-center gap-3" href="#top">
          <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-zinc-950 text-white shadow-ink dark:bg-white dark:text-zinc-950">
            <Eye aria-hidden className="h-5 w-5" />
          </span>
          <span className="font-semibold text-zinc-950 dark:text-white">Follow Clarity</span>
        </a>
        <ThemeToggle />
      </header>

      <section className="mx-auto max-w-6xl px-4 pb-0 pt-4 sm:px-6 sm:pt-8 md:pt-12" id="top">
        <div className="grid gap-8 lg:grid-cols-[1.08fr_0.92fr] lg:items-end">
          <div className="animate-fade-up">
            <div className="mb-5 flex flex-wrap gap-2">
              {["No login", "No scraping", "Local-only"].map((badge) => (
                <span
                  className="inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-white/[0.78] px-3 py-1.5 text-xs font-semibold text-zinc-700 shadow-sm backdrop-blur dark:border-white/10 dark:bg-white/[0.07] dark:text-zinc-200"
                  key={badge}
                >
                  <BadgeCheck aria-hidden className="h-3.5 w-3.5 text-emerald-500" />
                  {badge}
                </span>
              ))}
            </div>
            <h1 className="max-w-4xl font-display text-[2.65rem] font-semibold leading-[1.01] tracking-normal text-zinc-950 dark:text-white sm:text-6xl lg:text-7xl">
              See your Instagram follow relationships clearly.
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-7 text-zinc-600 dark:text-zinc-300 sm:mt-6 sm:text-lg sm:leading-8">
              Upload the export. The browser reads it locally, then shows who follows back and who does not.
            </p>
          </div>

          <div className="hidden animate-fade-up rounded-[32px] border border-zinc-200/80 bg-white/[0.74] p-4 shadow-ink backdrop-blur [animation-delay:120ms] dark:border-white/10 dark:bg-white/[0.055] lg:block">
            <div className="rounded-[26px] bg-zinc-950 p-5 text-white dark:bg-white dark:text-zinc-950">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold">Local proof</span>
                <Sparkles aria-hidden className="h-4 w-4 text-rose-300 dark:text-rose-500" />
              </div>
              <div className="mt-8 space-y-3">
                {[
                  ["Files stay on device", "JSZip + DOMParser + JSON"],
                  ["No account access", "No password, cookie, token"],
                  ["Current export quality", "Diagnostics after parsing"]
                ].map(([title, text]) => (
                  <div
                    className="flex items-start gap-3 rounded-2xl bg-white/10 p-3 dark:bg-zinc-950/[0.08]"
                    key={title}
                  >
                    <DatabaseZap
                      aria-hidden
                      className="mt-0.5 h-4 w-4 shrink-0 text-emerald-300 dark:text-emerald-600"
                    />
                    <div>
                      <p className="text-sm font-semibold">{title}</p>
                      <p className="mt-0.5 text-xs opacity-70">{text}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="mt-4 flex items-start gap-3 px-2 text-sm leading-6 text-zinc-600 dark:text-zinc-300">
              <Shield aria-hidden className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
              <span>Designed for Instagram export files only. No public account needed.</span>
            </div>
          </div>
        </div>
      </section>

      <div id="upload">
        <UploadDropzone
          errors={errors}
          isParsing={isParsing}
          onFilesSelected={handleFiles}
          progress={progress}
          warnings={warnings}
        />
      </div>

      <PrivacyNotice />

      {hasResults ? (
        <>
          <section className="mx-auto grid max-w-6xl gap-4 px-4 py-8 sm:px-6 md:grid-cols-2 xl:grid-cols-5">
            <StatsCard icon={Users} label="Followers" tone="sky" value={analysis.followers.length} />
            <StatsCard icon={UserCheck} label="Following" tone="violet" value={analysis.following.length} />
            <StatsCard
              icon={UserMinus}
              label="Not following me back"
              tone="rose"
              value={analysis.notFollowingBack.length}
            />
            <StatsCard
              icon={HeartHandshake}
              label="I don't follow back"
              tone="amber"
              value={analysis.iDontFollowBack.length}
            />
            <StatsCard icon={BadgeCheck} label="Mutuals" tone="emerald" value={analysis.mutuals.length} />
          </section>

          <section className="mx-auto max-w-6xl px-4 sm:px-6">
            <div className="rounded-[28px] border border-zinc-200/80 bg-white/[0.74] px-5 py-4 text-sm text-zinc-600 shadow-sm backdrop-blur dark:border-white/10 dark:bg-white/[0.055] dark:text-zinc-300">
              <p>
                Found followers in{" "}
                <strong className="font-semibold text-zinc-950 dark:text-white">
                  {parsed?.sourceFiles.followers.length ?? 0}
                </strong>{" "}
                file(s) and following in{" "}
                <strong className="font-semibold text-zinc-950 dark:text-white">
                  {parsed?.sourceFiles.following.length ?? 0}
                </strong>{" "}
                file(s). Local formats parsed:{" "}
                <strong className="font-semibold text-zinc-950 dark:text-white">
                  {parsed?.sourceFormats.json ?? 0}
                </strong>{" "}
                JSON /{" "}
                <strong className="font-semibold text-zinc-950 dark:text-white">
                  {parsed?.sourceFormats.html ?? 0}
                </strong>{" "}
                HTML. Ignored unrelated files:{" "}
                <strong className="font-semibold text-zinc-950 dark:text-white">
                  {parsed?.ignoredFiles.length ?? 0}
                </strong>
                .
              </p>
              <details className="group mt-3 overflow-hidden rounded-2xl border border-zinc-200/70 bg-zinc-50/70 p-3 transition dark:border-white/10 dark:bg-white/[0.035]">
                <summary className="cursor-pointer font-semibold text-zinc-800 marker:text-rose-500 dark:text-zinc-100">
                  Show parsed file details
                </summary>
                <div className="mt-3 grid gap-3 text-xs leading-5 md:grid-cols-3">
                  <div>
                    <p className="font-semibold text-zinc-900 dark:text-white">Followers files</p>
                    <p className="mt-1 break-words">{parsed?.sourceFiles.followers.join(", ") || "None"}</p>
                  </div>
                  <div>
                    <p className="font-semibold text-zinc-900 dark:text-white">Following files</p>
                    <p className="mt-1 break-words">{parsed?.sourceFiles.following.join(", ") || "None"}</p>
                  </div>
                  <div>
                    <p className="font-semibold text-zinc-900 dark:text-white">Ignored files</p>
                    <p className="mt-1 break-words">{parsed?.ignoredFiles.join(", ") || "None"}</p>
                  </div>
                </div>
                <div className="mt-4 overflow-x-auto rounded-2xl border border-zinc-200/70 dark:border-white/10">
                  <table className="min-w-full text-left text-xs">
                    <thead className="bg-zinc-100/70 text-zinc-700 dark:bg-white/5 dark:text-zinc-200">
                      <tr>
                        <th className="px-3 py-2 font-semibold">File</th>
                        <th className="px-3 py-2 font-semibold">Type</th>
                        <th className="px-3 py-2 font-semibold">Records seen</th>
                        <th className="px-3 py-2 font-semibold">Usernames found</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-200/70 dark:divide-white/10">
                      {(parsed?.sourceStats ?? []).map((stat) => (
                        <tr key={`${stat.kind}-${stat.name}`}>
                          <td className="max-w-[360px] break-words px-3 py-2">{stat.name}</td>
                          <td className="px-3 py-2">{stat.kind}</td>
                          <td className="px-3 py-2">{stat.recordCount.toLocaleString()}</td>
                          <td className="px-3 py-2">{stat.usernameCount.toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </details>
            </div>
          </section>

          <ResultTabs tabs={tabs} />
        </>
      ) : (
        <section className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
          <div className="rounded-[30px] border border-zinc-200/80 bg-white/[0.62] p-8 text-center shadow-sm backdrop-blur dark:border-white/10 dark:bg-white/[0.04]">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-rose-600 dark:text-rose-300">
              Waiting for export
            </p>
            <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-zinc-600 dark:text-zinc-300">
              Results appear here after the browser finds follower and following JSON or HTML data in your selected files.
            </p>
          </div>
        </section>
      )}
      </div>
    </main>
  );
}
