"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { AppTabId } from "@/lib/tab-routes";
import { activeTabFromPathname, TAB_ROUTE_MAP } from "@/lib/tab-routes";

export type BottomNavItem = {
  id: AppTabId;
  label: string;
};

const DEFAULT_ITEMS: BottomNavItem[] = [
  { id: "today", label: "Today" },
  { id: "quests", label: "Quests" },
  { id: "stats", label: "Stats" },
  { id: "you", label: "You" },
];

export type BottomNavProps = {
  items?: BottomNavItem[];
  "aria-label"?: string;
  className?: string;
};

export function BottomNav({
  items = DEFAULT_ITEMS,
  "aria-label": ariaLabel = "Primary navigation",
  className = "",
}: BottomNavProps) {
  const pathname = usePathname();
  const activeTab = activeTabFromPathname(pathname);

  return (
    <nav
      aria-label={ariaLabel}
      className={[
        "border-t px-3 py-3",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      style={{ borderColor: "var(--color-border-default)", background: "var(--color-bg-surface)" }}
    >
      <ul className="mx-auto flex w-full max-w-md items-center justify-between gap-2">
        {items.map((item) => {
          const isActive = item.id === activeTab;
          return (
            <li key={item.id} className="flex-1">
              <Link
                href={TAB_ROUTE_MAP[item.id]}
                prefetch
                className="block w-full rounded-md px-2 py-2 text-center text-xs font-medium"
                style={{
                  background: isActive ? "var(--color-primary)" : "transparent",
                  color: isActive ? "var(--color-primary-on-accent)" : "var(--color-text-tertiary)",
                  border: isActive ? "1px solid var(--color-primary-hover)" : "1px solid transparent",
                }}
                aria-current={isActive ? "page" : undefined}
              >
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
