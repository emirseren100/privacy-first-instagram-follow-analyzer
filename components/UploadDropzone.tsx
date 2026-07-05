"use client";

import {
  AlertCircle,
  CalendarDays,
  CheckCircle2,
  FileCode2,
  FileJson,
  FileUp,
  Info,
  Loader2,
  PackageOpen
} from "lucide-react";
import { useRef, useState } from "react";
import type { ParseProgress } from "@/utils/types";

interface UploadDropzoneProps {
  errors: string[];
  isParsing: boolean;
  onFilesSelected: (files: File[]) => void;
  progress: ParseProgress | null;
  warnings: string[];
}

export function UploadDropzone({
  errors,
  isParsing,
  onFilesSelected,
  progress,
  warnings
}: UploadDropzoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  function handleFiles(fileList: FileList | null) {
    const files = Array.from(fileList ?? []);
    if (files.length > 0) {
      onFilesSelected(files);
    }
  }

  const progressPercent =
    progress && progress.total > 0 ? Math.round((progress.completed / progress.total) * 100) : 0;
  const exportChecklist = [
    "Date range: All time / Tum zamanlar",
    "Format: JSON preferred, HTML supported",
    "Data category: Followers and following"
  ];

  return (
    <section className="mx-auto max-w-6xl px-4 py-3 sm:px-6 sm:py-6">
      <div
        className={`relative overflow-hidden rounded-[34px] border p-1 transition duration-300 ${
          isDragging
            ? "border-rose-400 bg-rose-100/50 shadow-glow dark:bg-rose-400/10"
            : "border-zinc-200/80 bg-white/[0.68] shadow-ink dark:border-white/[0.12] dark:bg-white/[0.045]"
        }`}
        onDragLeave={(event) => {
          event.preventDefault();
          setIsDragging(false);
        }}
        onDragOver={(event) => {
          event.preventDefault();
          setIsDragging(true);
        }}
        onDrop={(event) => {
          event.preventDefault();
          setIsDragging(false);
          handleFiles(event.dataTransfer.files);
        }}
      >
        {isParsing ? (
          <div className="absolute inset-x-0 top-0 h-1 overflow-hidden bg-zinc-200 dark:bg-white/10">
            <div
              className="h-full bg-rose-500 transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        ) : null}
        <div className="rounded-[30px] bg-white/[0.88] px-4 py-5 dark:bg-zinc-950/[0.78] sm:px-10 sm:py-10">
          <input
            accept=".zip,.json,.html,.htm,application/json,application/zip,text/html"
            className="sr-only"
            multiple
            onChange={(event) => handleFiles(event.target.files)}
            ref={inputRef}
            type="file"
          />

          <div className="grid gap-5 sm:gap-8 lg:grid-cols-[1.12fr_0.88fr] lg:items-stretch">
            <div>
              <div className="mb-4 flex flex-wrap gap-3 sm:mb-6">
                <span className="inline-flex items-center gap-2 rounded-full bg-zinc-950 px-3 py-1.5 text-xs font-semibold text-white dark:bg-white dark:text-zinc-950">
                  <PackageOpen aria-hidden className="h-3.5 w-3.5" />
                  ZIP export
                </span>
                <span className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-zinc-700 shadow-sm ring-1 ring-zinc-200 dark:bg-white/10 dark:text-zinc-200 dark:ring-white/10">
                  <FileJson aria-hidden className="h-3.5 w-3.5" />
                  JSON files
                </span>
                <span className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-zinc-700 shadow-sm ring-1 ring-zinc-200 dark:bg-white/10 dark:text-zinc-200 dark:ring-white/10">
                  <FileCode2 aria-hidden className="h-3.5 w-3.5" />
                  HTML files
                </span>
              </div>
              <h2 className="max-w-2xl text-2xl font-semibold tracking-normal text-zinc-950 dark:text-white sm:text-4xl">
                Drop your complete Instagram export here.
              </h2>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-600 dark:text-zinc-300 sm:mt-3">
                Choose the ZIP from the Instagram export tool, or upload follower and following JSON
                or HTML files directly.
              </p>
              <button
                className="mt-4 inline-flex min-h-12 max-w-full items-center gap-2 rounded-full bg-rose-600 px-5 py-3 text-sm font-semibold text-white shadow-glow transition duration-300 hover:-translate-y-0.5 hover:bg-rose-500 disabled:cursor-wait disabled:opacity-70 sm:mt-6"
                disabled={isParsing}
                onClick={() => inputRef.current?.click()}
                type="button"
              >
                {isParsing ? (
                  <Loader2 aria-hidden className="h-4 w-4 animate-spin" />
                ) : (
                  <FileUp aria-hidden className="h-4 w-4" />
                )}
                {isParsing ? "Parsing export" : "Select ZIP, JSON, or HTML"}
              </button>
              <div className="mt-4 rounded-3xl border border-zinc-200 bg-zinc-50/80 p-4 shadow-sm dark:border-white/10 dark:bg-white/[0.045] sm:mt-5">
                <div className="flex items-center gap-2 text-sm font-semibold text-zinc-950 dark:text-white">
                  <CalendarDays aria-hidden className="h-4 w-4 text-rose-500" />
                  Use the newest complete export
                </div>
                <ul className="mt-3 grid gap-2 text-sm text-zinc-600 dark:text-zinc-300">
                  {exportChecklist.map((item) => (
                    <li className="flex items-start gap-2" key={item}>
                      <CheckCircle2 aria-hidden className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="flex flex-col justify-between rounded-[28px] border border-zinc-200 bg-zinc-950 p-5 text-white shadow-sm dark:border-white/10 dark:bg-white dark:text-zinc-950">
              <div>
                <div className="flex items-center justify-between gap-4">
                  <p className="text-sm font-semibold">
                    {progress?.message ?? "Ready for local analysis"}
                  </p>
                  <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-semibold dark:bg-zinc-950/10">
                    Local
                  </span>
                </div>
                <p className="mt-4 line-clamp-2 text-sm leading-6 text-zinc-300 dark:text-zinc-600">
                  {progress?.currentFile || "followers_1.json, followers_2.json, followers.html, following.json"}
                </p>
              </div>
              <div className="mt-8">
                <div className="h-2 overflow-hidden rounded-full bg-white/10 dark:bg-zinc-950/10">
                  <div
                    className="h-full rounded-full bg-rose-500 transition-all duration-500"
                    style={{ width: `${isParsing ? Math.max(progressPercent, 8) : progressPercent}%` }}
                  />
                </div>
                <p className="mt-3 text-xs font-semibold text-zinc-300 dark:text-zinc-600">
                  {progress ? `${progress.completed} / ${progress.total} files checked` : "No file selected"}
                </p>
              </div>
            </div>
          </div>

          {errors.length > 0 ? (
            <div className="mt-6 animate-fade-up rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-900 dark:border-rose-300/20 dark:bg-rose-300/10 dark:text-rose-100">
              <div className="flex items-center gap-2 font-semibold">
                <AlertCircle aria-hidden className="h-4 w-4" />
                Export needs attention
              </div>
              <ul className="mt-2 list-disc space-y-1 pl-5">
                {errors.map((error) => (
                  <li key={error}>{error}</li>
                ))}
              </ul>
            </div>
          ) : null}
          {warnings.length > 0 ? (
            <div className="mt-4 animate-fade-up rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900 dark:border-amber-300/20 dark:bg-amber-300/10 dark:text-amber-100">
              <div className="flex items-center gap-2 font-semibold">
                <Info aria-hidden className="h-4 w-4" />
                Parsed with warnings
              </div>
              <ul className="mt-2 list-disc space-y-1 pl-5">
                {warnings.map((warning) => (
                  <li key={warning}>{warning}</li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}
