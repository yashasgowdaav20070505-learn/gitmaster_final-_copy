export type UiTheme = 'editorial-cream' | 'jet-cherry';

export const THEME_STORAGE_KEY = 'gitmaster_ui_theme';
export const DEFAULT_UI_THEME: UiTheme = 'editorial-cream';

export function getSavedTheme(): UiTheme {
  try {
    const saved = localStorage.getItem(THEME_STORAGE_KEY);
    if (saved === 'jet-cherry') {
      return 'jet-cherry';
    }
    if (saved === 'charcoal-sand') {
      // Cleanly migrate legacy charcoal-sand preference to default editorial-cream
      localStorage.setItem(THEME_STORAGE_KEY, DEFAULT_UI_THEME);
      return DEFAULT_UI_THEME;
    }
    return DEFAULT_UI_THEME;
  } catch {
    return DEFAULT_UI_THEME;
  }
}

export function applyTheme(theme: UiTheme): void {
  if (typeof document !== 'undefined') {
    document.documentElement.dataset.theme = theme;
  }
  try {
    localStorage.setItem(THEME_STORAGE_KEY, theme);
  } catch {
    // Ignore storage quota or private browsing errors
  }
}

export function applySavedTheme(): UiTheme {
  const theme = getSavedTheme();
  if (typeof document !== 'undefined') {
    document.documentElement.dataset.theme = theme;
  }
  return theme;
}
