const DAY_KEY_PREFIX = 'dr.day.';

/** List of YYYY-MM-DD keys for the last `n` days, oldest first (today included). */
export function lastNDays(n, from = new Date()) {
  const days = [];
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(from);
    d.setDate(d.getDate() - i);
    days.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`);
  }
  return days;
}

/**
 * Aggregates the day-state logs for the given dates.
 * Returns { perChild: { [childId]: { done, withinTime, perDay: { [date]: done } } }, totalDone }
 */
export function collectStats(dates) {
  const perChild = {};
  let totalDone = 0;

  for (const date of dates) {
    let state;
    try {
      state = JSON.parse(localStorage.getItem(DAY_KEY_PREFIX + date) ?? 'null');
    } catch {
      state = null;
    }
    if (!state) continue;

    for (const periodState of Object.values(state)) {
      for (const [childId, tasks] of Object.entries(periodState)) {
        const bucket = (perChild[childId] ??= { done: 0, withinTime: 0, perDay: {} });
        for (const entry of Object.values(tasks)) {
          if (entry.status !== 'done') continue;
          bucket.done += 1;
          totalDone += 1;
          bucket.perDay[date] = (bucket.perDay[date] ?? 0) + 1;
          if (entry.withinTimeframe) bucket.withinTime += 1;
        }
      }
    }
  }

  return { perChild, totalDone };
}
