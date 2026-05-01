export const CAPTURE_CREATED_EVENT = "sidequest:capture-created";

export function dispatchCaptureCreated(): void {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent(CAPTURE_CREATED_EVENT));
  }
}

/** Default top bar title from pathname (override via `AuthenticatedAppShell` `title` prop). */
export function appShellTitle(pathname: string): string {
  if (pathname === "/") return "Today";
  if (pathname.startsWith("/quests/view")) return "Quests";
  if (pathname.startsWith("/quests/create")) return "Create quest";
  if (/^\/quests\/[a-f0-9]{24}\/edit$/i.test(pathname)) return "Edit quest";
  if (/^\/quests\/[a-f0-9]{24}$/i.test(pathname)) return "Quest";
  if (pathname.startsWith("/quests")) return "Quests";
  if (pathname.startsWith("/stats")) return "Stats";
  if (pathname.startsWith("/you")) return "You";
  if (pathname.startsWith("/onboarding")) return "Onboarding";
  return "SideQuest";
}

/** Capture FAB hidden on quest detail and onboarding (per Phase 8.5 roadmap). */
export function shouldHideCaptureFab(pathname: string): boolean {
  if (pathname.startsWith("/onboarding")) return true;
  if (/^\/quests\/[a-f0-9]{24}$/i.test(pathname)) return true;
  return false;
}
