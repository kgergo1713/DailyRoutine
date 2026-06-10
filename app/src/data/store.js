import { buildDemoConfig } from './demo.js';

const CONFIG_KEY = 'dr.config';
const DAY_KEY_PREFIX = 'dr.day.';

/** YYYY-MM-DD for today (local time). */
export function todayKey() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export function loadConfig() {
  try {
    const raw = localStorage.getItem(CONFIG_KEY);
    if (raw) return JSON.parse(raw);
  } catch { /* corrupt data -> reseed */ }
  const demo = buildDemoConfig();
  saveConfig(demo);
  return demo;
}

export function saveConfig(config) {
  localStorage.setItem(CONFIG_KEY, JSON.stringify(config));
}

/**
 * Daily state: per child+task status entries.
 * { [childId]: { [taskId]: { status, startedAt, completedAt, withinTimeframe } } }
 */
export function loadDayState(dateKey = todayKey()) {
  try {
    const raw = localStorage.getItem(DAY_KEY_PREFIX + dateKey);
    if (raw) return JSON.parse(raw);
  } catch { /* ignore */ }
  return {};
}

export function saveDayState(state, dateKey = todayKey()) {
  localStorage.setItem(DAY_KEY_PREFIX + dateKey, JSON.stringify(state));
}

export function getEntry(state, childId, taskId) {
  return state[childId]?.[taskId] ?? { status: 'pending', startedAt: null, completedAt: null, withinTimeframe: null };
}

export function setEntry(state, childId, taskId, entry) {
  if (!state[childId]) state[childId] = {};
  state[childId][taskId] = entry;
  saveDayState(state);
}
