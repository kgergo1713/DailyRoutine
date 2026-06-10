import { createChildColumn } from '../components/childColumn.js';
import { createSummaryBar } from '../components/summaryBar.js';
import { pickActivePeriod } from '../data/schedule.js';
import { t, getLang, listLangs, setLang } from '../i18n/index.js';
import { getTheme, setTheme } from '../data/theme.js';

/**
 * Main routine view: top bar, child columns, bottom summary.
 * Re-selects the active period automatically; shows a calm
 * "nothing to do now" screen when no period matches.
 */
export function createRoutineView({ config, dayState, onOpenConfig, onOpenStats }) {
  const el = document.createElement('div');
  el.className = 'routine';

  // --- top bar: period name + clock + parent settings ---
  const top = document.createElement('header');
  top.className = 'routine__top';
  const periodName = document.createElement('span');
  periodName.className = 'routine__period';
  const clock = document.createElement('span');
  clock.className = 'routine__clock';

  function topBtn(label, ariaLabel, onClick, extraClass = '') {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = `routine__gear ${extraClass}`.trim();
    b.textContent = label;
    b.setAttribute('aria-label', ariaLabel);
    b.addEventListener('click', onClick);
    return b;
  }

  // language toggle: shows the current language code, tap cycles hu <-> en
  const lang = topBtn(getLang().toUpperCase(), 'Nyelv / Language', () => {
    const langs = listLangs();
    const next = langs[(langs.indexOf(getLang()) + 1) % langs.length];
    setLang(next);
    location.reload();
  }, 'routine__gear--lang');

  // theme toggle: shows what you'd switch to
  const theme = topBtn(getTheme() === 'dark' ? '☀' : '☾', 'Téma / Theme', () => {
    setTheme(getTheme() === 'dark' ? 'light' : 'dark');
    theme.textContent = getTheme() === 'dark' ? '☀' : '☾';
  });

  // fullscreen toggle (useful when running in a browser tab, not as installed PWA)
  const fullscreen = topBtn('⛶', 'Teljes képernyő / Fullscreen', () => {
    if (document.fullscreenElement) {
      document.exitFullscreen();
    } else {
      document.documentElement.requestFullscreen().catch(() => {});
    }
  });

  const stars = topBtn('★', 'Statisztika', onOpenStats);
  const gear = topBtn('⚙', 'Beállítások', onOpenConfig);

  top.appendChild(periodName);
  top.appendChild(clock);
  top.appendChild(lang);
  top.appendChild(theme);
  top.appendChild(fullscreen);
  top.appendChild(stars);
  top.appendChild(gear);
  el.appendChild(top);

  const body = document.createElement('div');
  body.className = 'routine__body';
  el.appendChild(body);

  const taskById = Object.fromEntries(config.tasks.map((task) => [task.id, task]));
  const children = [...config.children].sort((a, b) => a.order - b.order);

  let activePeriodId = undefined; // undefined = not built yet
  let columns = [];
  let summary = null;

  function buildPeriod(period) {
    body.replaceChildren();
    columns = [];
    summary = null;

    if (!period) {
      periodName.textContent = '';
      const idle = document.createElement('div');
      idle.className = 'routine__idle';
      idle.textContent = t('routine.noPeriod');
      body.appendChild(idle);
      return;
    }

    periodName.textContent = period.name;

    const cols = document.createElement('main');
    cols.className = 'routine__cols';
    cols.style.setProperty('--col-count', children.length);
    columns = children.map((child) => {
      const col = createChildColumn({
        child, periodId: period.id, periodTasks: period.tasks, taskById, dayState,
      });
      cols.appendChild(col.el);
      return col;
    });
    body.appendChild(cols);

    summary = createSummaryBar({ children, periodId: period.id, periodTasks: period.tasks, dayState });
    body.appendChild(summary.el);
  }

  let lastClock = '';
  function update(now = Date.now()) {
    const period = pickActivePeriod(config.periods, new Date(now));
    const id = period?.id ?? null;
    if (id !== activePeriodId) {
      activePeriodId = id;
      buildPeriod(period);
    }

    for (const col of columns) col.update(now);
    if (summary) summary.update();
    const hhmm = new Date(now).toLocaleTimeString('hu-HU', { hour: '2-digit', minute: '2-digit' });
    if (hhmm !== lastClock) {
      lastClock = hhmm;
      clock.textContent = hhmm;
    }
  }

  update();
  return { el, update };
}
