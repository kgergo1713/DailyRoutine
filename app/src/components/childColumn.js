import { iconEl } from './icon.js';
import { createTaskTile } from './taskTile.js';
import { getEntry, setEntry } from '../data/store.js';

/**
 * A child's column: header (marker + name) and the task tiles.
 * The first not-done task gets a calm "next" highlight.
 */
export function createChildColumn({ child, periodId, periodTasks, taskById, dayState }) {
  const el = document.createElement('section');
  el.className = 'child-col';
  el.style.setProperty('--c-child', child.color);

  const head = document.createElement('header');
  head.className = 'child-col__head';
  head.appendChild(iconEl(child.marker.type === 'openmoji'
    ? { source: 'openmoji', key: child.marker.value }
    : { source: 'phosphor', key: child.marker.value }, 'child-col__marker'));
  const name = document.createElement('h2');
  name.className = 'child-col__name';
  name.textContent = child.name;
  head.appendChild(name);
  el.appendChild(head);

  const list = document.createElement('div');
  list.className = 'child-col__tasks';
  el.appendChild(list);

  const tiles = periodTasks.map((pt) => {
    const task = taskById[pt.taskId];
    const read = () => getEntry(dayState, periodId, child.id, task.id);

    /** Pause whatever is currently running for this child (one task at a time). */
    function pauseRunning(now) {
      for (const other of periodTasks) {
        if (other.taskId === task.id) continue;
        const entry = getEntry(dayState, periodId, child.id, other.taskId);
        if (entry.status === 'running') {
          const accum = (entry.accumSec ?? 0) + (now - entry.startedAt) / 1000;
          setEntry(dayState, periodId, child.id, other.taskId, {
            ...entry, status: 'paused', accumSec: accum, startedAt: null,
          });
        }
      }
    }

    const tile = createTaskTile({
      task,
      durationSec: pt.durationSec,
      getEntry: read,
      onTap: () => {
        const entry = read();
        const now = Date.now();
        if (entry.status === 'pending' || entry.status === 'paused') {
          pauseRunning(now);
          setEntry(dayState, periodId, child.id, task.id, {
            ...entry, status: 'running', startedAt: now, accumSec: entry.accumSec ?? 0,
          });
        } else if (entry.status === 'running') {
          const totalSec = (entry.accumSec ?? 0) + (now - entry.startedAt) / 1000;
          const within = totalSec <= pt.durationSec;
          setEntry(dayState, periodId, child.id, task.id, {
            ...entry, status: 'done', completedAt: now, withinTimeframe: within,
          });
        }
      },
      onLongPressUndo: () => {
        setEntry(dayState, periodId, child.id, task.id, {
          status: 'pending', startedAt: null, completedAt: null, withinTimeframe: null, accumSec: 0,
        });
      },
    });

    list.appendChild(tile.el);
    return { tile, taskId: task.id };
  });

  function update(now) {
    // Highlight the first task that is not done.
    const nextId = tiles.find(({ taskId }) => read(taskId).status !== 'done')?.taskId ?? null;
    for (const { tile, taskId } of tiles) {
      tile.el.classList.toggle('task-tile--next', taskId === nextId && read(taskId).status === 'pending');
      tile.update(now);
    }
  }

  function read(taskId) {
    return getEntry(dayState, periodId, child.id, taskId);
  }

  update();
  return { el, update };
}
