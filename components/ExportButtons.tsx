"use client";

import { Check, Clipboard, Download } from "lucide-react";
import { useState } from "react";
import { copyUsernames, downloadCsv } from "@/utils/exportCsv";

interface ExportButtonsProps {
  filename: string;
  users: string[];
}

export function ExportButtons({ filename, users }: ExportButtonsProps) {
  const [copied, setCopied] = useState(false);
  const disabled = users.length === 0;

  async function handleCopy() {
    await copyUsernames(users);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <button
        className="inline-flex h-11 items-center gap-2 rounded-full border border-zinc-200 bg-white px-4 text-sm font-semibold text-zinc-900 shadow-sm transition duration-300 hover:-translate-y-0.5 hover:border-zinc-300 disabled:cursor-not-allowed disabled:opacity-45 dark:border-white/10 dark:bg-white/10 dark:text-white"
        disabled={disabled}
        onClick={handleCopy}
        type="button"
      >
        {copied ? <Check aria-hidden className="h-4 w-4" /> : <Clipboard aria-hidden className="h-4 w-4" />}
        {copied ? "Copied" : "Copy usernames"}
      </button>
      <button
        className="inline-flex h-11 items-center gap-2 rounded-full bg-zinc-950 px-4 text-sm font-semibold text-white shadow-sm transition duration-300 hover:-translate-y-0.5 hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-45 dark:bg-white dark:text-zinc-950 dark:hover:bg-zinc-100"
        disabled={disabled}
        onClick={() => downloadCsv(filename, users)}
        type="button"
      >
        <Download aria-hidden className="h-4 w-4" />
        Export CSV
      </button>
    </div>
  );
}
