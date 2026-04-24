"use client";

import { useState } from "react";
import { TodayFocusFab } from "@/components/home/today-focus-fab";
import { TodayFocusHeader } from "@/components/home/today-focus-header";
import { TodayFocusMainQuest } from "@/components/home/today-focus-main-quest";
import { todayFocusMockData, type TodayTabItem } from "@/components/home/today-focus-mock-data";
import { TodayFocusTabBar } from "@/components/home/today-focus-tab-bar";
import { TodayFocusTaskSection } from "@/components/home/today-focus-task-section";
import { TodayFocusXpStats } from "@/components/home/today-focus-xp-stats";

export function TodayFocusShell() {
  const [activeTab, setActiveTab] = useState<TodayTabItem["id"]>("today");

  const handleMenuClick = () => {};
  const handleSearchClick = () => {};
  const handleStartFocus = () => {};
  const handleOpenQuest = () => {};
  const handleTaskClick = () => {};
  const handleFabClick = () => {};
  const handleTabChange = (tabId: TodayTabItem["id"]) => {
    setActiveTab(tabId);
  };

  return (
    <div className="relative min-h-screen">
      <main className="mx-auto w-full max-w-md pb-28">
        <TodayFocusHeader
          data={todayFocusMockData.header}
          onMenuClick={handleMenuClick}
          onSearchClick={handleSearchClick}
        />
        <TodayFocusXpStats xp={todayFocusMockData.xp} stats={todayFocusMockData.stats} />
        <TodayFocusMainQuest
          quest={todayFocusMockData.mainQuest}
          onStartFocus={handleStartFocus}
          onOpenQuest={handleOpenQuest}
        />

        {todayFocusMockData.sections.map((section) => (
          <TodayFocusTaskSection key={section.id} section={section} onTaskClick={handleTaskClick} />
        ))}
      </main>

      <TodayFocusFab onClick={handleFabClick} />
      <TodayFocusTabBar tabs={todayFocusMockData.tabs} activeTab={activeTab} onTabChange={handleTabChange} />
    </div>
  );
}
