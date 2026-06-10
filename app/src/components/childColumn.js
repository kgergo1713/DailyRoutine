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

    const tile = createTaskTile({
      task,
      durationSec: pt.durationSec,
      getEntry: read,
      onTap: () => {
        const entry = read();
        const now = Date.now();
        if (entry.status === 'pending') {
          setEntry(dayState, periodId, child.id, task.id, { ...entry, status: 'running', startedAt: now });
        } else if (entry.status === 'running') {
          const within = (now - entry.startedAt) / 1000 <= pt.durationSec;
          setEntry(dayState, periodId, child.id, task.id, {
            ...entry, status: 'done', completedAt: now, withinTimeframe: within,
          });
        }
      },
      onLongPressUndo: () => {
        setEntry(dayState, periodId, child.id, task.id, {
          status: 'pending', startedAt: null, completedAt: null, withinTimeframe: null,
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
