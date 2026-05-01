"use client";

import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import { BottomNav } from "@/components/ui/bottom-nav";
import { Button } from "@/components/ui/button";
import { CaptureQuestSheet } from "@/components/layout/capture-quest-sheet";
import { GlobalSearchDialog, isTypingInFormField } from "@/components/layout/global-search-dialog";
import { appShellTitle, shouldHideCaptureFab } from "@/lib/app-shell";

export type AuthenticatedAppShellProps = {
  children: ReactNode;
  /** When set, overrides pathname-derived title. */
  title?: string;
};

export function AuthenticatedAppShell({ children, title: titleProp }: AuthenticatedAppShellProps) {
  const pathname = usePathname() ?? "";
  const { data: session, status } = useSession();
  const [captureOpen, setCaptureOpen] = useState(false);
  const [captureMountKey, setCaptureMountKey] = useState(0);
  const [searchOpen, setSearchOpen] = useState(false);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (!(event.key === "k" || event.key === "K")) {
        return;
      }
      if (!(event.metaKey || event.ctrlKey)) {
        return;
      }
      if (isTypingInFormField(event.target)) {
        return;
      }
      event.preventDefault();
      setSearchOpen(true);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  const resolvedTitle = titleProp ?? appShellTitle(pathname);
  const showChrome = status === "authenticated" && Boolean(session?.user);
  const hideFab = shouldHideCaptureFab(pathname);
  const showFab = showChrome && !hideFab;

  const mainPaddingBottom = showChrome ? (showFab ? "pb-[calc(7.25rem+env(safe-area-inset-bottom,0px))]" : "pb-[calc(4.5rem+env(safe-area-inset-bottom,0px))]") : "";

  const fabBottom = "calc(4.25rem + env(safe-area-inset-bottom, 0px))";

  const handleSignOut = useCallback(() => {
    void signOut({ redirect: false });
  }, []);

  const header = useMemo(
    () => (
      <header
        className="sticky top-0 z-50 flex h-14 shrink-0 items-center justify-between gap-3 border-b px-4 backdrop-blur-md"
        style={{
          borderColor: "var(--color-border-subtle)",
          background: "color-mix(in srgb, var(--color-bg-base) 88%, transparent)",
          color: "var(--color-text-primary)",
        }}
      >
        <p className="m-0 truncate text-base font-semibold">{resolvedTitle}</p>
        <div className="flex shrink-0 items-center gap-1">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            aria-haspopup="dialog"
            title="Search (⌘K / Ctrl+K)"
            onClick={() => setSearchOpen(true)}
          >
            Search
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            disabled
            className="opacity-50"
            title="Settings (coming in a later release)"
            aria-disabled
          >
            Settings
          </Button>
          <Button type="button" variant="ghost" size="sm" onClick={handleSignOut}>
            Sign out
          </Button>
        </div>
      </header>
    ),
    [handleSignOut, resolvedTitle, setSearchOpen],
  );

  if (!showChrome) {
    return <>{children}</>;
  }

  return (
    <div className="relative min-h-dvh" style={{ background: "var(--color-bg-base)", color: "var(--color-text-primary)" }}>
      {header}
      <div className={mainPaddingBottom}>{children}</div>

      {showFab ? (
        <button
          type="button"
          aria-label="Quick capture quest"
          className="fixed right-4 z-[60] flex h-14 w-14 items-center justify-center rounded-full text-2xl font-semibold shadow-lg transition hover:opacity-95"
          style={{
            bottom: fabBottom,
            background: "var(--color-primary)",
            color: "var(--color-primary-on-accent)",
            boxShadow: "0 8px 24px rgba(91, 91, 214, 0.28)",
          }}
          onClick={() => {
            setCaptureMountKey((k) => k + 1);
            setCaptureOpen(true);
          }}
        >
          +
        </button>
      ) : null}

      <BottomNav className="fixed bottom-0 left-0 right-0 z-40 pb-[env(safe-area-inset-bottom,0px)]" />

      <CaptureQuestSheet key={captureMountKey} open={captureOpen} onOpenChange={setCaptureOpen} />
      <GlobalSearchDialog open={searchOpen} onOpenChange={setSearchOpen} />
    </div>
  );
}
