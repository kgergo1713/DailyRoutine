import iconList from '../data/icon-list.json';
import { POPULAR } from '../data/popularIcons.js';
import { iconEl } from './icon.js';
import { t } from '../i18n/index.js';

/**
 * Modal icon picker. Popular icons first, then free-text search over
 * icon keys (Phosphor names; OpenMoji hex codes are searchable too).
 * source filter: 'all' | 'phosphor' | 'openmoji'
 */
export function openIconPicker({ source = 'all', onPick }) {
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  const panel = document.createElement('div');
  panel.className = 'modal-panel icon-picker';
  overlay.appendChild(panel);

  const search = document.createElement('input');
  search.type = 'search';
  search.placeholder = t('config.iconSearch');
  search.className = 'icon-picker__search';
  panel.appendChild(search);

  const grid = document.createElement('div');
  grid.className = 'icon-picker__grid';
  panel.appendChild(grid);

  const sources = source === 'all' ? ['phosphor', 'openmoji'] : [source];

  function entries(query) {
    const result = [];
    if (!query) {
      for (const src of sources) {
        for (const key of POPULAR[src]) result.push({ source: src, key });
      }
      return result;
    }
    const q = query.toLowerCase();
    for (const src of sources) {
      for (const key of iconList[src]) {
        if (key.toLowerCase().includes(q)) {
          result.push({ source: src, key });
          if (result.length >= 120) return result;
        }
      }
    }
    return result;
  }

  function render(query = '') {
    grid.replaceChildren();
    for (const icon of entries(query)) {
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
  }

  function close() {
    overlay.remove();
  }

  search.addEventListener('input', () => render(search.value.trim()));
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) close();
  });

  render();
  document.body.appendChild(overlay);
  search.focus();
}
