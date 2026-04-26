"use client";

import { TodayFocusTabBar } from "@/components/home/today-focus-tab-bar";
import { todayFocusMockData } from "@/components/home/today-focus-mock-data";

export default function YouPage() {
  return (
    <div className="relative min-h-screen">
      <main className="mx-auto w-full max-w-md px-4 py-6 pb-28">
        <h1 className="text-xl font-semibold" style={{ color: "var(--color-text-primary)" }}>
          You
        </h1>
        <p className="mt-2 text-sm" style={{ color: "var(--color-text-secondary)" }}>
          Profile and settings baseline for Phase 4.4.
        </p>
      </main>
      <TodayFocusTabBar tabs={todayFocusMockData.tabs} />
    </div>
  );
}
