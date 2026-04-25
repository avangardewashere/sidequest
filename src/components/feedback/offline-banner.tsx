"use client";

import { useNetworkStatus } from "@/hooks/useNetworkStatus";

export function OfflineBanner() {
  const { isOnline } = useNetworkStatus();

  if (isOnline) {
    return null;
  }

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed inset-x-0 top-0 z-[80] border-b px-4 py-2 text-center text-xs font-medium"
      style={{
        borderColor: "var(--color-warning)",
        background: "var(--color-warning-subtle)",
        color: "var(--color-warning)",
      }}
    >
      You are offline. Actions may fail until your connection is restored.
    </div>
  );
}
