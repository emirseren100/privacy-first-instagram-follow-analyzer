"use client";

import { ArrowDownAZ, ArrowUpAZ, ExternalLink, Search, UserRoundX } from "lucide-react";
import { useMemo, useState } from "react";
import { ExportButtons } from "./ExportButtons";

interface UserListProps {
  title: string;
  description: string;
  users: string[];
  filename: string;
}

export function UserList({ title, description, users, filename }: UserListProps) {
  const [query, setQuery] = useState("");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");

  const visibleUsers = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase().replace(/^@+/, "");
    const filtered = normalizedQuery
      ? users.filter((username) => username.includes(normalizedQuery))
      : users;

    return [...filtered].sort((a, b) =>
      sortDirection === "asc" ? a.localeCompare(b) : b.localeCompare(a)
    );
  }, [query, sortDirection, users]);
  const hasQuery = query.trim().length > 0;

  return (
    <section className="rounded-[26px] border border-zinc-200/80 bg-white/[0.86] p-3 shadow-ink backdrop-blur transition duration-300 dark:border-white/10 dark:bg-zinc-950/[0.64] sm:rounded-[30px] sm:p-6">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-rose-600 dark:text-rose-300">
            {visibleUsers.length.toLocaleString()} visible
          </p>
          <h2 className="mt-2 text-2xl font-semibold text-zinc-950 dark:text-white">{title}</h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-600 dark:text-zinc-300">
            {description}
          </p>
        </div>
        <ExportButtons filename={filename} users={visibleUsers} />
      </div>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
        <label className="relative flex-1">
          <Search
            aria-hidden
            className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400"
          />
          <input
            className="h-12 w-full rounded-2xl border border-zinc-200 bg-white pl-11 pr-4 text-sm text-zinc-950 outline-none transition placeholder:text-zinc-400 focus:border-rose-300 focus:ring-4 focus:ring-rose-100 dark:border-white/10 dark:bg-white/[0.06] dark:text-white dark:focus:border-rose-300/60 dark:focus:ring-rose-300/10"
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search username"
            type="search"
            value={query}
          />
        </label>
        <button
          className="inline-flex h-12 shrink-0 items-center justify-center gap-2 rounded-2xl border border-zinc-200 bg-white px-4 text-sm font-semibold text-zinc-900 shadow-sm transition hover:-translate-y-0.5 dark:border-white/10 dark:bg-white/[0.06] dark:text-white sm:min-w-28"
          onClick={() => setSortDirection((current) => (current === "asc" ? "desc" : "asc"))}
          type="button"
          title={sortDirection === "asc" ? "Sort Z-A" : "Sort A-Z"}
        >
          {sortDirection === "asc" ? (
            <ArrowDownAZ aria-hidden className="h-4 w-4" />
          ) : (
            <ArrowUpAZ aria-hidden className="h-4 w-4" />
          )}
          {sortDirection === "asc" ? "A-Z" : "Z-A"}
        </button>
      </div>

      <div className="mt-5 max-h-[520px] overflow-auto rounded-3xl border border-zinc-200/80 bg-zinc-50/[0.76] dark:border-white/10 dark:bg-white/[0.035]">
        {visibleUsers.length > 0 ? (
          <ul className="divide-y divide-zinc-200/80 dark:divide-white/10">
            {visibleUsers.map((username) => (
              <li
                className="flex min-h-14 items-center justify-between gap-4 px-4 py-3 transition duration-200 hover:bg-white hover:pl-5 dark:hover:bg-white/[0.05]"
                key={username}
              >
                <span className="truncate font-medium text-zinc-900 dark:text-zinc-100">@{username}</span>
                <a
                  className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-zinc-500 transition hover:bg-zinc-100 hover:text-rose-600 dark:text-zinc-400 dark:hover:bg-white/10 dark:hover:text-rose-200"
                  href={`https://instagram.com/${encodeURIComponent(username)}`}
                  rel="noreferrer"
                  target="_blank"
                  title={`Open @${username} on Instagram`}
                >
                  <ExternalLink aria-hidden className="h-4 w-4" />
                  <span className="sr-only">Open profile</span>
                </a>
              </li>
            ))}
          </ul>
        ) : (
          <div className="flex min-h-56 flex-col items-center justify-center px-6 text-center text-sm text-zinc-500 dark:text-zinc-400">
            <span className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-zinc-400 shadow-sm dark:bg-white/10 dark:text-zinc-300">
              <UserRoundX aria-hidden className="h-5 w-5" />
            </span>
            <p className="font-semibold text-zinc-800 dark:text-zinc-100">
              {hasQuery ? "No matching usernames" : `No usernames in ${title}`}
            </p>
            <p className="mt-2 max-w-sm leading-6">
              {hasQuery
                ? "Try a different search term or clear the search field."
                : "This tab is empty for the export you uploaded."}
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
