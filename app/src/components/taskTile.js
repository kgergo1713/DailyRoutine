import { iconEl } from './icon.js';

/**
 * One task tile: icon + label + pie timer ring.
 * States: pending (dim) -> running (pie countdown) <-> paused (frozen ring) -> done.
 * Tapping a done task resets it to pending (accidental-tap recovery).
 * Over the time budget the ring turns amber and keeps counting — never red.
 */
export function createTaskTile({ task, durationSec, getEntry, onTap }) {
  const el = document.createElement('button');
  el.type = 'button';
  el.className = 'task-tile';
  el.dataset.taskId = task.id;

  const ring = document.createElement('div');
  ring.className = 'task-tile__ring';

  const face = document.createElement('div');
  face.className = 'task-tile__face';
  face.appendChild(iconEl(task.icon, 'task-tile__icon'));

  const check = document.createElement('div');
  check.className = 'task-tile__check';
  check.textContent = '✓';

  const label = document.createElement('div');
  label.className = 'task-tile__label';
  label.textContent = task.label;

  ring.appendChild(face);
  ring.appendChild(check);
  el.appendChild(ring);
  el.appendChild(label);

  // tap to advance the state machine (pending/paused -> running -> done -> pending)
  el.addEventListener('click', () => onTap());

  /** Total active seconds: accumulated past runs + the current run. */
  function elapsedSec(entry, now) {
    const accum = entry.accumSec ?? 0;
    if (entry.status === 'running' && entry.startedAt) {
      return accum + (now - entry.startedAt) / 1000;
    }
    return accum;
  }

  /** Called from the global rAF loop. */
  function update(now = Date.now()) {
    const entry = getEntry();
    el.dataset.status = entry.status;

    if ((entry.status === 'running' || entry.status === 'paused') && durationSec > 0) {
      const elapsed = elapsedSec(entry, now);
      const frac = Math.min(elapsed / durationSec, 1);
      const over = elapsed > durationSec;
      el.classList.toggle('task-tile--over', over);
      const color = over ? 'var(--c-over)' : 'var(--c-running)';
      const deg = over ? 360 : frac * 360;
      ring.style.background = `conic-gradient(${color} ${deg}deg, var(--c-ring-rest) ${deg}deg 360deg)`;
    } else {
      el.classList.remove('task-tile--over');
      ring.style.background = '';
    }
  }

  update();
  return { el, update };
}
