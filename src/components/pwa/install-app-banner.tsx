"use client";

import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

const STORAGE_KEY = "sq_pwa_install_snooze_until";
const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

export function InstallAppBanner() {
  const [promptEvent, setPromptEvent] = useState<BeforeInstallPromptEvent | null>(null);

  useEffect(() => {
    const dismissedUntil = window.localStorage.getItem(STORAGE_KEY);
    if (dismissedUntil && Date.now() < Number(dismissedUntil)) {
      return;
    }

    const handler = (e: Event) => {
      e.preventDefault();
      setPromptEvent(e as BeforeInstallPromptEvent);
    };
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const dismiss = useCallback(() => {
    window.localStorage.setItem(STORAGE_KEY, String(Date.now() + THIRTY_DAYS_MS));
    setPromptEvent(null);
  }, []);

  const install = useCallback(async () => {
    if (!promptEvent) return;
    await promptEvent.prompt();
    await promptEvent.userChoice;
    setPromptEvent(null);
  }, [promptEvent]);

  if (!promptEvent) {
    return null;
  }

  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-[9999] flex justify-center p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]"
      role="region"
      aria-label="Install app"
    >
      <div
        className="flex max-w-lg flex-wrap items-center gap-3 rounded-xl border px-4 py-3 shadow-lg"
        style={{
          borderColor: "var(--color-border-default)",
          background: "var(--color-bg-surface)",
          color: "var(--color-text-primary)",
        }}
      >
        <p className="min-w-[200px] flex-1 text-sm" style={{ color: "var(--color-text-secondary)" }}>
          Install SideQuest for quicker access from your home screen.
        </p>
        <div className="flex shrink-0 gap-2">
          <Button type="button" variant="ghost" size="sm" onClick={dismiss}>
            Not now
          </Button>
          <Button type="button" variant="primary" size="sm" onClick={() => void install()}>
            Install
          </Button>
        </div>
      </div>
    </div>
  );
}
