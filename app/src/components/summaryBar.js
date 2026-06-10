import { t } from '../i18n/index.js';
import { getEntry } from '../data/store.js';

/**
 * Bottom summary bar: one cell per child with progress dots and a
 * neutral within/over time label (green / amber, never red).
 */
export function createSummaryBar({ children, periodTasks, dayState }) {
  const el = document.createElement('footer');
  el.className = 'summary';

  const cells = children.map((child) => {
    const cell = document.createElement('div');
    cell.className = 'summary__cell';
    cell.style.setProperty('--c-child', child.color);

    const name = document.createElement('span');
    name.className = 'summary__name';
    name.textContent = child.name;

    const dots = document.createElement('span');
    dots.className = 'summary__dots';

    const text = document.createElement('span');
    text.className = 'summary__text';

    cell.appendChild(name);
    cell.appendChild(dots);
    cell.appendChild(text);
    el.appendChild(cell);
    return { child, dots, text };
  });

  function update() {
    for (const { child, dots, text } of cells) {
      dots.replaceChildren();
      let done = 0;
      let anyOver = false;
      for (const pt of periodTasks) {
        const entry = getEntry(dayState, child.id, pt.taskId);
        const dot = document.createElement('i');
        dot.className = 'summary__dot';
        if (entry.status === 'done') {
          done += 1;
          dot.dataset.kind = entry.withinTimeframe ? 'within' : 'over';
          if (!entry.withinTimeframe) anyOver = true;
        } else {
          dot.dataset.kind = entry.status === 'running' ? 'running' : 'pending';
        }
        dots.appendChild(dot);
      }
      text.textContent = done === periodTasks.length
        ? t('routine.allDone')
        : t('routine.progress', { done, total: periodTasks.length });
      text.dataset.kind = anyOver ? 'over' : 'within';
    }
  }

  update();
  return { el, update };
}
