"use client";

import type { TodayTabItem } from "@/components/home/today-focus-mock-data";

type TodayFocusTabBarProps = {
  tabs: TodayTabItem[];
  activeTab: TodayTabItem["id"];
  onTabChange?: (tabId: TodayTabItem["id"]) => void;
};

export function TodayFocusTabBar({ tabs, activeTab, onTabChange }: TodayFocusTabBarProps) {
  return (
    <nav
      aria-label="Home navigation"
      className="fixed bottom-0 left-0 right-0 z-10 border-t px-3 py-3"
      style={{ borderColor: "var(--sq-border)", background: "var(--sq-surface)" }}
    >
      <ul className="mx-auto flex w-full max-w-md items-center justify-between gap-2">
        {tabs.map((tab) => {
          const isActive = tab.id === activeTab;
          return (
            <li key={tab.id} className="flex-1">
              <button
                type="button"
                onClick={() => onTabChange?.(tab.id)}
                className="w-full rounded-md px-2 py-2 text-xs font-medium"
                style={{
                  background: isActive ? "var(--sq-button)" : "transparent",
                  color: isActive ? "var(--sq-button-text)" : "var(--sq-text-muted)",
                  border: isActive ? "1px solid var(--sq-border-strong)" : "1px solid transparent",
                }}
              >
                {tab.label}
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
