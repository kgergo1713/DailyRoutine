import hu from './hu.json';

const LANGS = { hu };
let current = 'hu';

export function setLang(lang) {
  if (LANGS[lang]) current = lang;
}

/** t('routine.progress', { done: 2, total: 6 }) */
export function t(key, params = {}) {
  const value = key.split('.').reduce((node, part) => node?.[part], LANGS[current]);
  if (typeof value !== 'string') return key;
  return value.replace(/\{(\w+)\}/g, (_, name) => params[name] ?? `{${name}}`);
}
