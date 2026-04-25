const LAST_COMPLETION_DATE_KEY = "sidequest.lastCompletionDate";
const LAST_CELEBRATED_LEVEL_KEY = "sidequest.lastCelebratedLevel";
const LAST_DAILY_CUE_DATE_KEY = "sidequest.lastDailyCueDate";

function getStorage(): Storage | null {
  if (typeof window === "undefined" || !window.localStorage) {
    return null;
  }
  return window.localStorage;
}

function readStorageValue(key: string): string | null {
  const storage = getStorage();
  if (!storage) {
    return null;
  }
  try {
    return storage.getItem(key);
  } catch {
    return null;
  }
}

function writeStorageValue(key: string, value: string) {
  const storage = getStorage();
  if (!storage) {
    return;
  }
  try {
    storage.setItem(key, value);
  } catch {
    // Best effort only.
  }
}

export function localDateKey(now: Date = new Date()): string {
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function readLastCompletionDateKey(): string | null {
  return readStorageValue(LAST_COMPLETION_DATE_KEY);
}

export function markCompletionToday(now: Date = new Date()) {
  writeStorageValue(LAST_COMPLETION_DATE_KEY, localDateKey(now));
}

export function shouldShowStreakRisk(now: Date, hasCompletionToday: boolean): boolean {
  return now.getHours() >= 18 && !hasCompletionToday;
}

export function consumeLevelUpCelebration(currentLevel: number): boolean {
  const raw = readStorageValue(LAST_CELEBRATED_LEVEL_KEY);
  const parsed = raw ? Number.parseInt(raw, 10) : Number.NaN;
  if (!Number.isFinite(parsed)) {
    writeStorageValue(LAST_CELEBRATED_LEVEL_KEY, String(currentLevel));
    return false;
  }
  if (currentLevel > parsed) {
    writeStorageValue(LAST_CELEBRATED_LEVEL_KEY, String(currentLevel));
    return true;
  }
  if (currentLevel < parsed) {
    writeStorageValue(LAST_CELEBRATED_LEVEL_KEY, String(currentLevel));
  }
  return false;
}

export function consumeDailyCue(now: Date = new Date()): boolean {
  const today = localDateKey(now);
  const lastCueDate = readStorageValue(LAST_DAILY_CUE_DATE_KEY);
  if (lastCueDate === today) {
    return false;
  }
  writeStorageValue(LAST_DAILY_CUE_DATE_KEY, today);
  return true;
}
