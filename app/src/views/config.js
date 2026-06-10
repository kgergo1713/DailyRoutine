import { t } from '../i18n/index.js';
import { saveConfig } from '../data/store.js';
import { buildDemoConfig } from '../data/demo.js';
import { iconEl } from '../components/icon.js';
import { openIconPicker } from '../components/iconPicker.js';

const CHILD_COLORS = ['#457b9d', '#e76f51', '#8e7cc3', '#e9c46a', '#2a9d8f', '#d4757b', '#7f9c5b', '#c98a3d'];

/**
 * Parent configuration view: children CRUD, task library CRUD,
 * export/import/reset. Calls onClose() to return to the routine view.
 */
export function createConfigView({ config, onClose }) {
  const el = document.createElement('div');
  el.className = 'config';

  // --- header ---
  const head = document.createElement('header');
  head.className = 'config__head';
  const backBtn = document.createElement('button');
  backBtn.type = 'button';
  backBtn.className = 'btn btn--back';
  backBtn.textContent = `← ${t('config.back')}`;
  backBtn.addEventListener('click', () => {
    persist();
    onClose();
  });
  const title = document.createElement('h1');
  title.className = 'config__title';
  title.textContent = t('config.title');
  head.appendChild(backBtn);
  head.appendChild(title);
  el.appendChild(head);

  const body = document.createElement('div');
  body.className = 'config__body';
  el.appendChild(body);

  function persist() {
    saveConfig(config);
  }

  function section(labelKey) {
    const sec = document.createElement('section');
    sec.className = 'config__section';
    const h = document.createElement('h2');
    h.textContent = t(labelKey);
    sec.appendChild(h);
    body.appendChild(sec);
    return sec;
  }

  // ===================== children =====================
  const childSec = section('config.children');
  const childList = document.createElement('div');
  childList.className = 'config__list';
  childSec.appendChild(childList);

  function renderChildren() {
    childList.replaceChildren();
    const sorted = [...config.children].sort((a, b) => a.order - b.order);
    sorted.forEach((child, i) => {
      const row = document.createElement('div');
      row.className = 'config__row';
      row.style.setProperty('--c-child', child.color);

      // marker button -> icon picker (openmoji markers)
      const markerBtn = document.createElement('button');
      markerBtn.type = 'button';
      markerBtn.className = 'config__icon-btn';
      markerBtn.appendChild(iconEl({ source: 'openmoji', key: child.marker.value }, 'config__icon'));
      markerBtn.addEventListener('click', () =>
        openIconPicker({
          source: 'openmoji',
          onPick: (icon) => {
            child.marker = { type: 'openmoji', value: icon.key };
            persist();
            renderChildren();
          },
        })
      );

      const name = document.createElement('input');
      name.type = 'text';
      name.value = child.name;
      name.placeholder = t('config.name');
      name.addEventListener('change', () => {
        child.name = name.value.trim() || child.name;
        persist();
      });

      const color = document.createElement('input');
      color.type = 'color';
      color.value = child.color;
      color.className = 'config__color';
      color.addEventListener('change', () => {
        child.color = color.value;
        persist();
        renderChildren();
      });

      const up = moveBtn(t('config.moveUp'), () => swapOrder(sorted, i, i - 1));
      const down = moveBtn(t('config.moveDown'), () => swapOrder(sorted, i, i + 1));
      const del = document.createElement('button');
      del.type = 'button';
      del.className = 'btn btn--danger';
      del.textContent = t('config.delete');
      del.addEventListener('click', () => {
        if (!confirm(t('config.deleteConfirm'))) return;
        config.children = config.children.filter((c) => c.id !== child.id);
        persist();
        renderChildren();
      });

      row.append(markerBtn, name, color, up, down, del);
      childList.appendChild(row);
    });
  }

  function moveBtn(label, fn) {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'btn';
    b.textContent = label;
    b.addEventListener('click', fn);
    return b;
  }

  function swapOrder(sorted, i, j) {
    if (j < 0 || j >= sorted.length) return;
    [sorted[i].order, sorted[j].order] = [sorted[j].order, sorted[i].order];
    persist();
    renderChildren();
  }

  const addChild = document.createElement('button');
  addChild.type = 'button';
  addChild.className = 'btn btn--add';
  addChild.textContent = t('config.addChild');
  addChild.addEventListener('click', () => {
    config.children.push({
      id: crypto.randomUUID(),
      name: t('config.newChildName'),
      marker: { type: 'openmoji', value: '2B50' },
      color: CHILD_COLORS[config.children.length % CHILD_COLORS.length],
      order: Math.max(-1, ...config.children.map((c) => c.order)) + 1,
    });
    persist();
    renderChildren();
  });
  childSec.appendChild(addChild);

  // ===================== tasks =====================
  const taskSec = section('config.tasks');
  const taskList = document.createElement('div');
  taskList.className = 'config__list';
  taskSec.appendChild(taskList);

  function renderTasks() {
    taskList.replaceChildren();
    config.period.tasks.forEach((pt, i) => {
      const task = config.tasks.find((task) => task.id === pt.taskId);
      if (!task) return;
      const row = document.createElement('div');
      row.className = 'config__row';

      const iconBtn = document.createElement('button');
      iconBtn.type = 'button';
      iconBtn.className = 'config__icon-btn';
      iconBtn.appendChild(iconEl(task.icon, 'config__icon'));
      iconBtn.addEventListener('click', () =>
        openIconPicker({
          source: 'all',
          onPick: (icon) => {
            task.icon = icon;
            persist();
            renderTasks();
          },
        })
      );

      const label = document.createElement('input');
      label.type = 'text';
      label.value = task.label;
      label.placeholder = t('config.label');
      label.addEventListener('change', () => {
        task.label = label.value.trim() || task.label;
        persist();
      });

      const dur = document.createElement('input');
      dur.type = 'number';
      dur.min = '1';
      dur.max = '120';
      dur.className = 'config__dur';
      dur.value = String(Math.round(pt.durationSec / 60));
      dur.title = t('config.durationMin');
      dur.addEventListener('change', () => {
        const min = Math.max(1, Math.min(120, Number(dur.value) || 1));
        pt.durationSec = min * 60;
        task.defaultDurationSec = min * 60;
        persist();
      });

      const up = moveBtn(t('config.moveUp'), () => swapTask(i, i - 1));
      const down = moveBtn(t('config.moveDown'), () => swapTask(i, i + 1));
      const del = document.createElement('button');
      del.type = 'button';
      del.className = 'btn btn--danger';
      del.textContent = t('config.delete');
      del.addEventListener('click', () => {
        if (!confirm(t('config.deleteConfirm'))) return;
        config.period.tasks.splice(i, 1);
        config.tasks = config.tasks.filter((x) => x.id !== task.id);
        persist();
        renderTasks();
      });

      row.append(iconBtn, label, dur, up, down, del);
      taskList.appendChild(row);
    });
  }

  function swapTask(i, j) {
    const arr = config.period.tasks;
    if (j < 0 || j >= arr.length) return;
    [arr[i], arr[j]] = [arr[j], arr[i]];
    persist();
    renderTasks();
  }

  const addTask = document.createElement('button');
  addTask.type = 'button';
  addTask.className = 'btn btn--add';
  addTask.textContent = t('config.addTask');
  addTask.addEventListener('click', () => {
    const task = {
      id: crypto.randomUUID(),
      label: t('config.newTaskLabel'),
      icon: { source: 'phosphor', key: 'star-fill' },
      defaultDurationSec: 300,
    };
    config.tasks.push(task);
    config.period.tasks.push({ taskId: task.id, durationSec: 300, perChild: true });
    persist();
    renderTasks();
  });
  taskSec.appendChild(addTask);

  // ===================== data =====================
  const dataSec = section('config.data');
  const dataRow = document.createElement('div');
  dataRow.className = 'config__data-row';
  dataSec.appendChild(dataRow);

  const exportBtn = document.createElement('button');
  exportBtn.type = 'button';
  exportBtn.className = 'btn';
  exportBtn.textContent = t('config.export');
  exportBtn.addEventListener('click', () => {
    const blob = new Blob([JSON.stringify(config, null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'dailyroutine-config.json';
    a.click();
    URL.revokeObjectURL(a.href);
  });

  const importBtn = document.createElement('button');
  importBtn.type = 'button';
  importBtn.className = 'btn';
  importBtn.textContent = t('config.import');
  const fileInput = document.createElement('input');
  fileInput.type = 'file';
  fileInput.accept = 'application/json';
  fileInput.hidden = true;
  importBtn.addEventListener('click', () => fileInput.click());
  fileInput.addEventListener('change', async () => {
    const file = fileInput.files?.[0];
    if (!file) return;
    try {
      const imported = JSON.parse(await file.text());
      if (!imported.children || !imported.tasks || !imported.period) throw new Error('bad shape');
      Object.assign(config, imported);
      persist();
      renderChildren();
      renderTasks();
    } catch {
      alert('Hibás fájl.');
    }
    fileInput.value = '';
  });

  const resetBtn = document.createElement('button');
  resetBtn.type = 'button';
  resetBtn.className = 'btn btn--danger';
  resetBtn.textContent = t('config.reset');
  resetBtn.addEventListener('click', () => {
    if (!confirm(t('config.resetConfirm'))) return;
    Object.assign(config, buildDemoConfig());
    persist();
    renderChildren();
    renderTasks();
  });

  dataRow.append(exportBtn, importBtn, fileInput, resetBtn);

  renderChildren();
  renderTasks();
  return { el };
}
