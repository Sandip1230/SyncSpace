import { useCallback, useEffect, useState } from "react";

const STORAGE_KEY = "syncspace:settings";

export const DEFAULT_SETTINGS = {
  fontScale: 1, // multiplies every UI/editor font-size (see variables.css)
  editorFontSize: 13.5,
  editorMinimap: false,
  editorWordWrap: false,
  runTimeoutMs: 5000,
  whiteboardDefaultColor: "#3fc6d6",
  whiteboardDefaultStrokeWidth: 3,
};

function loadSettings() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_SETTINGS;
    return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export function useSettings() {
  const [settings, setSettings] = useState(loadSettings);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    } catch {
      // localStorage unavailable (private browsing, quota) — settings
      // just won't persist across reloads; not worth surfacing an error for.
    }
    document.documentElement.style.setProperty("--font-scale", String(settings.fontScale));
  }, [settings]);

  const update = useCallback((patch) => {
    setSettings((prev) => ({ ...prev, ...patch }));
  }, []);

  const reset = useCallback(() => setSettings(DEFAULT_SETTINGS), []);

  return { settings, update, reset };
}
