import { Suspense } from "react";
import { AuthenticatedAppShell } from "@/components/layout/authenticated-app-shell";
import QuestDetailClient from "./quest-detail-client";

export default function QuestDetailPage() {
  return (
    <Suspense fallback={<main className="p-6">Loading…</main>}>
      <AuthenticatedAppShell>
        <QuestDetailClient />
      </AuthenticatedAppShell>
    </Suspense>
  );
}
