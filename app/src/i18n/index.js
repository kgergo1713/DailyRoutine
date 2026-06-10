import hu from './hu.json';
import en from './en.json';

const LANGS = { hu, en };
const LANG_KEY = 'dr.lang';
let current = localStorage.getItem(LANG_KEY) in LANGS ? localStorage.getItem(LANG_KEY) : 'hu';

export function getLang() {
  return current;
}

export function listLangs() {
  return Object.keys(LANGS);
}

export function setLang(lang) {
  if (LANGS[lang]) {
    current = lang;
    localStorage.setItem(LANG_KEY, lang);
  }
}

/** t('routine.progress', { done: 2, total: 6 }) */
export function t(key, params = {}) {
  const value = key.split('.').reduce((node, part) => node?.[part], LANGS[current]);
  if (typeof value !== 'string') return key;
  return value.replace(/\{(\w+)\}/g, (_, name) => params[name] ?? `{${name}}`);
}
