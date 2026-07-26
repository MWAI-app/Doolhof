const STORAGE_KEY = "doolhof-save-v1";

export function loadProgress() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const data = JSON.parse(raw);
    if (typeof data.level !== "number" || typeof data.score !== "number") return null;
    return data;
  } catch {
    return null;
  }
}

export function saveProgress(level, score) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ level, score }));
  } catch {
    // localStorage onbeschikbaar (privémodus/quota) — voortgang wordt dan niet bewaard
  }
}

export function clearProgress() {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // localStorage onbeschikbaar
  }
}
