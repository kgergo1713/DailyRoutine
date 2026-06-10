const THEME_KEY = 'dr.theme';

export function getTheme() {
  return localStorage.getItem(THEME_KEY) === 'dark' ? 'dark' : 'light';
}

export function setTheme(theme) {
  localStorage.setItem(THEME_KEY, theme);
  applyTheme();
}

export function applyTheme() {
  document.documentElement.dataset.theme = getTheme();
}
