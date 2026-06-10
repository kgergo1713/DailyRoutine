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

  // ===================== periods =====================
  const periodSec = section('config.periods');
  const periodList = document.createElement('div');
  periodList.className = 'config__list';
  periodSec.appendChild(periodList);

  let selectedPeriod = config.periods[0] ?? null;

  const DAY_LABELS = t('config.dayLabels').split(',');

  function renderPeriods() {
    periodList.replaceChildren();
    config.periods.forEach((period) => {
      const row = document.createElement('div');
      row.className = 'config__period-row';
      if (period === selectedPeriod) row.classList.add('config__period-row--active');

      const main = document.createElement('div');
      main.className = 'config__period-main';

      const name = document.createElement('input');
      name.type = 'text';
      name.value = period.name;
      name.addEventListener('change', () => {
        period.name = name.value.trim() || period.name;
        persist();
      });
      name.addEventListener('focus', () => selectPeriod(period));

      const times = document.createElement('div');
      times.className = 'config__period-times';
      const from = timeInput(period.schedule.fromTime ?? '06:00', (v) => {
        period.schedule.fromTime = v;
        persist();
      });
      const dash = document.createElement('span');
      dash.textContent = '–';
      const to = timeInput(period.schedule.toTime ?? '09:00', (v) => {
        period.schedule.toTime = v;
        persist();
      });
      times.append(from, dash, to);

      const days = document.createElement('div');
      days.className = 'config__days';
      for (let d = 1; d <= 7; d++) {
        const chip = document.createElement('button');
        chip.type = 'button';
        chip.className = 'config__day-chip';
        chip.textContent = DAY_LABELS[d - 1];
        const has = (period.schedule.days ?? []).includes(d);
        chip.classList.toggle('config__day-chip--on', has);
        chip.addEventListener('click', () => {
          const set = new Set(period.schedule.days ?? []);
          set.has(d) ? set.delete(d) : set.add(d);
          period.schedule.days = [...set].sort((a, b) => a - b);
          persist();
          renderPeriods();
        });
        days.appendChild(chip);
      }

      main.append(name, times, days);

      const side = document.createElement('div');
      side.className = 'config__period-side';
      const selectBtn = document.createElement('button');
      selectBtn.type = 'button';
      selectBtn.className = 'btn';
      selectBtn.textContent = t('config.editTasks');
      selectBtn.addEventListener('click', () => selectPeriod(period));
      const del = document.createElement('button');
      del.type = 'button';
      del.className = 'btn btn--danger';
      del.textContent = t('config.delete');
      del.addEventListener('click', () => {
        if (config.periods.length <= 1) return; // keep at least one
        if (!confirm(t('config.deleteConfirm'))) return;
        config.periods = config.periods.filter((p) => p.id !== period.id);
        if (selectedPeriod === period) selectedPeriod = config.periods[0];
        persist();
        renderPeriods();
        renderTasks();
      });
      side.append(selectBtn, del);

      row.append(main, side);
      periodList.appendChild(row);
    });
  }

  function timeInput(value, onChange) {
    const input = document.createElement('input');
    input.type = 'time';
    input.value = value;
    input.className = 'config__time';
    input.addEventListener('change', () => onChange(input.value));
    return input;
  }

  function selectPeriod(period) {
    if (selectedPeriod === period) return;
    selectedPeriod = period;
    renderPeriods();
    renderTasks();
  }

  const addPeriod = document.createElement('button');
  addPeriod.type = 'button';
  addPeriod.className = 'btn btn--add';
  addPeriod.textContent = t('config.addPeriod');
  addPeriod.addEventListener('click', () => {
    const period = {
      id: crypto.randomUUID(),
      name: t('config.newPeriodName'),
      schedule: { type: 'weekly', days: [1, 2, 3, 4, 5], fromTime: '06:00', toTime: '09:00' },
      tasks: [],
    };
    config.periods.push(period);
    selectedPeriod = period;
    persist();
    renderPeriods();
    renderTasks();
  });
  periodSec.appendChild(addPeriod);

  // ===================== tasks (of the selected period) =====================
  const taskSec = section('config.tasks');
  const taskPeriodLabel = document.createElement('p');
  taskPeriodLabel.className = 'config__task-period';
  taskSec.insertBefore(taskPeriodLabel, taskSec.firstChild.nextSibling);
  const taskList = document.createElement('div');
  taskList.className = 'config__list';
  taskSec.appendChild(taskList);

  function renderTasks() {
    taskList.replaceChildren();
    taskPeriodLabel.textContent = selectedPeriod ? selectedPeriod.name : '';
    if (!selectedPeriod) return;
    selectedPeriod.tasks.forEach((pt, i) => {
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
        selectedPeriod.tasks.splice(i, 1);
        // Remove the template too when no other period references it.
        const used = config.periods.some((p) => p.tasks.some((x) => x.taskId === task.id));
        if (!used) config.tasks = config.tasks.filter((x) => x.id !== task.id);
        persist();
        renderTasks();
      });

      row.append(iconBtn, label, dur, up, down, del);
      taskList.appendChild(row);
    });
  }

  function swapTask(i, j) {
    const arr = selectedPeriod.tasks;
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
    if (!selectedPeriod) return;
    const task = {
      id: crypto.randomUUID(),
      label: t('config.newTaskLabel'),
      icon: { source: 'phosphor', key: 'star-fill' },
      defaultDurationSec: 300,
    };
    config.tasks.push(task);
    selectedPeriod.tasks.push({ taskId: task.id, durationSec: 300, perChild: true });
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
      // Accept both old (period) and new (periods) export shapes.
      if (imported.period && !imported.periods) {
        imported.periods = [imported.period];
        delete imported.period;
      }
      if (!imported.children || !imported.tasks || !imported.periods) throw new Error('bad shape');
      delete config.period;
      Object.assign(config, imported);
      selectedPeriod = config.periods[0] ?? null;
      persist();
      renderChildren();
      renderPeriods();
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
    delete config.period;
    Object.assign(config, buildDemoConfig());
    selectedPeriod = config.periods[0];
    persist();
    renderChildren();
    renderPeriods();
    renderTasks();
  });

  dataRow.append(exportBtn, importBtn, fileInput, resetBtn);

  // ===================== about =====================
  const aboutSec = section('config.about');

  const feedback = document.createElement('p');
  feedback.className = 'config__about-line';
  feedback.textContent = `${t('config.aboutFeedback')}: `;
  const mail = document.createElement('a');
  mail.href = 'mailto:kgergo1713@gmail.com';
  mail.textContent = 'kgergo1713@gmail.com';
  feedback.appendChild(mail);
  aboutSec.appendChild(feedback);

  const support = document.createElement('p');
  support.className = 'config__about-line';
  support.textContent = `${t('config.aboutSupport')}: Revolut · `;
  const rev = document.createElement('a');
  rev.href = 'https://revolut.me/kgergo1713';
  rev.target = '_blank';
  rev.rel = 'noopener noreferrer';
  rev.textContent = '@kgergo1713';
  support.appendChild(rev);
  aboutSec.appendChild(support);

  // --- version footer ---
  const version = document.createElement('p');
  version.className = 'config__version';
  version.textContent = `DailyRoutine v${__APP_VERSION__}`;
  body.appendChild(version);

  renderChildren();
  renderPeriods();
  renderTasks();
  return { el };
}
