import { Suspense } from "react";
import QuestListViewClient from "./quest-list-view-client";

export default function ViewQuestsPage() {
  return (
    <Suspense
      fallback={
        <main className="mx-auto flex w-full max-w-4xl flex-1 items-center justify-center p-6">
          <p>Loading quests...</p>
        </main>
      }
    >
      <QuestListViewClient />
    </Suspense>
  );
}
