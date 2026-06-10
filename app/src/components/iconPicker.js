import iconList from '../data/icon-list.json';
import { POPULAR } from '../data/popularIcons.js';
import { iconEl } from './icon.js';
import { t } from '../i18n/index.js';

const PAGE_SIZE = 120;

/**
 * Modal icon picker. Popular icons first; the "all" toggle (or any search
 * text) browses the full set with infinite scrolling in batches.
 * source filter: 'all' | 'phosphor' | 'openmoji'
 */
export function openIconPicker({ source = 'all', onPick }) {
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  const panel = document.createElement('div');
  panel.className = 'modal-panel icon-picker';
  overlay.appendChild(panel);

  const topRow = document.createElement('div');
  topRow.className = 'icon-picker__top';
  panel.appendChild(topRow);

  const search = document.createElement('input');
  search.type = 'search';
  search.placeholder = t('config.iconSearch');
  search.className = 'icon-picker__search';
  topRow.appendChild(search);

  const allBtn = document.createElement('button');
  allBtn.type = 'button';
  allBtn.className = 'btn icon-picker__all';
  allBtn.textContent = t('config.iconAll');
  topRow.appendChild(allBtn);

  const grid = document.createElement('div');
  grid.className = 'icon-picker__grid';
  panel.appendChild(grid);

  const sources = source === 'all' ? ['phosphor', 'openmoji'] : [source];
  let browseAll = false;
  let matches = [];
  let shown = 0;

  function collect(query) {
    const result = [];
    if (!query && !browseAll) {
      for (const src of sources) {
        for (const key of POPULAR[src]) result.push({ source: src, key });
      }
      return result;
    }
    const q = query.toLowerCase();
    for (const src of sources) {
      for (const key of iconList[src]) {
        if (!q || key.toLowerCase().includes(q)) result.push({ source: src, key });
      }
    }
    return result;
  }

  function appendBatch() {
    const batch = matches.slice(shown, shown + PAGE_SIZE);
    for (const icon of batch) {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'icon-picker__item';
      btn.appendChild(iconEl(icon, 'icon-picker__icon'));
      btn.addEventListener('click', () => {
        close();
        onPick(icon);
      });
      grid.appendChild(btn);
    }
    shown += batch.length;
  }

  function render(query = '') {
    matches = collect(query);
    shown = 0;
    grid.replaceChildren();
    grid.scrollTop = 0;
    appendBatch();
  }

  // Infinite scroll: append the next batch near the bottom.
  grid.addEventListener('scroll', () => {
    if (shown >= matches.length) return;
    if (grid.scrollTop + grid.clientHeight >= grid.scrollHeight - 200) appendBatch();
  });

  function close() {
    overlay.remove();
  }

  allBtn.addEventListener('click', () => {
    browseAll = !browseAll;
    allBtn.classList.toggle('btn--active', browseAll);
    render(search.value.trim());
  });
  search.addEventListener('input', () => render(search.value.trim()));
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) close();
  });

  render();
  document.body.appendChild(overlay);
  search.focus();
}
