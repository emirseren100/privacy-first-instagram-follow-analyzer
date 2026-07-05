"use client";

import { useMemo, useState } from "react";
import type { TabConfig } from "@/utils/types";
import { UserList } from "./UserList";

interface ResultTabsProps {
  tabs: TabConfig[];
}

export function ResultTabs({ tabs }: ResultTabsProps) {
  const [activeTabId, setActiveTabId] = useState(tabs[0]?.id);
  const activeTab = useMemo(
    () => tabs.find((tab) => tab.id === activeTabId) ?? tabs[0],
    [activeTabId, tabs]
  );

  if (!activeTab) {
    return null;
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <div className="mb-4 overflow-x-auto pb-2">
        <div className="inline-flex min-w-full gap-1 rounded-3xl border border-zinc-200/80 bg-white/[0.72] p-1.5 shadow-sm backdrop-blur dark:border-white/10 dark:bg-white/[0.05] sm:min-w-0 sm:gap-2 sm:rounded-full">
          {tabs.map((tab) => {
            const isActive = tab.id === activeTab.id;
            return (
              <button
                className={`whitespace-nowrap rounded-full px-3 py-2 text-xs font-semibold transition duration-300 sm:px-4 sm:py-2.5 sm:text-sm ${
                  isActive
                    ? "scale-[1.02] bg-zinc-950 text-white shadow-sm dark:bg-white dark:text-zinc-950"
                    : "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-950 dark:text-zinc-300 dark:hover:bg-white/10 dark:hover:text-white"
                }`}
                key={tab.id}
                onClick={() => setActiveTabId(tab.id)}
                type="button"
              >
                {tab.label}
                <span className="ml-2 opacity-70">{tab.count.toLocaleString()}</span>
              </button>
            );
          })}
        </div>
      </div>
      <div className="animate-fade-up" key={activeTab.id}>
        <UserList
          description={activeTab.description}
          filename={`${activeTab.id}.csv`}
          title={activeTab.label}
          users={activeTab.users}
        />
      </div>
    </div>
  );
}
