/**
 * Picks the active period for a given Date.
 * Priority (per spec §6): oneoff > weekly/weekend, then the narrowest window.
 * Returns null when nothing matches ("no tasks now" screen).
 */
export function pickActivePeriod(periods, now = new Date()) {
  const day = now.getDay() === 0 ? 7 : now.getDay(); // 1=Mon … 7=Sun
  const minutes = now.getHours() * 60 + now.getMinutes();
  const dateKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;

  const matching = (periods ?? []).filter((p) => {
    const s = p.schedule;
    if (!s) return false;
    if (!inWindow(s, minutes)) return false;
    if (s.type === 'oneoff') return s.date === dateKey;
    return (s.days ?? []).includes(day);
  });

  if (matching.length === 0) return null;
  matching.sort((a, b) => {
    const aOne = a.schedule.type === 'oneoff' ? 0 : 1;
    const bOne = b.schedule.type === 'oneoff' ? 0 : 1;
    if (aOne !== bOne) return aOne - bOne;
    return windowSize(a.schedule) - windowSize(b.schedule);
  });
  return matching[0];
}

function toMin(hhmm) {
  const [h, m] = (hhmm ?? '00:00').split(':').map(Number);
  return h * 60 + m;
}

function inWindow(s, minutes) {
  return minutes >= toMin(s.fromTime ?? '00:00') && minutes < toMin(s.toTime ?? '24:00');
}

function windowSize(s) {
  return toMin(s.toTime ?? '24:00') - toMin(s.fromTime ?? '00:00');
}
