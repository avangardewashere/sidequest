"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { TodayTabItem } from "@/components/home/today-focus-mock-data";
import { activeTabFromPathname, TAB_ROUTE_MAP } from "@/lib/tab-routes";

type TodayFocusTabBarProps = {
  tabs: TodayTabItem[];
};

export function TodayFocusTabBar({ tabs }: TodayFocusTabBarProps) {
  const pathname = usePathname();
  const activeTab = activeTabFromPathname(pathname);

  return (
    <nav
      aria-label="Home navigation"
      className="fixed bottom-0 left-0 right-0 z-10 border-t px-3 py-3"
      style={{ borderColor: "var(--color-border-default)", background: "var(--color-bg-surface)" }}
    >
      <ul className="mx-auto flex w-full max-w-md items-center justify-between gap-2">
        {tabs.map((tab) => {
          const isActive = tab.id === activeTab;
          return (
            <li key={tab.id} className="flex-1">
              <Link
                href={TAB_ROUTE_MAP[tab.id]}
                prefetch
                className="w-full rounded-md px-2 py-2 text-xs font-medium"
                style={{
                  display: "block",
                  textAlign: "center",
                  background: isActive ? "var(--color-primary)" : "transparent",
                  color: isActive ? "var(--color-primary-on-accent)" : "var(--color-text-tertiary)",
                  border: isActive ? "1px solid var(--color-primary-hover)" : "1px solid transparent",
                }}
                aria-current={isActive ? "page" : undefined}
              >
                {tab.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
