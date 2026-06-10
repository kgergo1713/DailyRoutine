import { createChildColumn } from '../components/childColumn.js';
import { createSummaryBar } from '../components/summaryBar.js';

/** Main routine view: top bar, child columns, bottom summary. */
export function createRoutineView({ config, dayState }) {
  const el = document.createElement('div');
  el.className = 'routine';

  // --- top bar: period name + clock ---
  const top = document.createElement('header');
  top.className = 'routine__top';
  const periodName = document.createElement('span');
  periodName.className = 'routine__period';
  periodName.textContent = config.period.name;
  const clock = document.createElement('span');
  clock.className = 'routine__clock';
  top.appendChild(periodName);
  top.appendChild(clock);
  el.appendChild(top);

  // --- child columns ---
  const taskById = Object.fromEntries(config.tasks.map((task) => [task.id, task]));
  const children = [...config.children].sort((a, b) => a.order - b.order);

  const cols = document.createElement('main');
  cols.className = 'routine__cols';
  cols.style.setProperty('--col-count', children.length);
  const columns = children.map((child) => {
    const col = createChildColumn({ child, periodTasks: config.period.tasks, taskById, dayState });
    cols.appendChild(col.el);
    return col;
  });
  el.appendChild(cols);

  // --- summary ---
  const summary = createSummaryBar({ children, periodTasks: config.period.tasks, dayState });
  el.appendChild(summary.el);

  let lastClock = '';
  function update(now = Date.now()) {
    for (const col of columns) col.update(now);
    summary.update();
    const hhmm = new Date(now).toLocaleTimeString('hu-HU', { hour: '2-digit', minute: '2-digit' });
    if (hhmm !== lastClock) {
      lastClock = hhmm;
      clock.textContent = hhmm;
    }
  }

  update();
  return { el, update };
}
