import { Suspense } from "react";
import QuestDetailClient from "./quest-detail-client";

export default function QuestDetailPage() {
  return (
    <Suspense fallback={<main className="p-6">Loading…</main>}>
      <QuestDetailClient />
    </Suspense>
  );
}
