import './style.css';
import { loadConfig, loadDayState } from './data/store.js';
import { applyTheme } from './data/theme.js';
import { createRoutineView } from './views/routine.js';
import { createConfigView } from './views/config.js';
import { createStatsView } from './views/stats.js';

applyTheme();

const config = loadConfig();
const dayState = loadDayState();
const root = document.querySelector('#app');

let view = null;

function showRoutine() {
  root.replaceChildren();
  view = createRoutineView({ config, dayState, onOpenConfig: showConfig, onOpenStats: showStats });
  root.appendChild(view.el);
}

function showConfig() {
  root.replaceChildren();
  view = null; // config view has no per-frame updates
  const cfgView = createConfigView({ config, onClose: showRoutine });
  root.appendChild(cfgView.el);
}

function showStats() {
  root.replaceChildren();
  view = null;
  const statsView = createStatsView({ config, onClose: showRoutine });
  root.appendChild(statsView.el);
}

showRoutine();

// Single rAF loop drives every timer; absolute timestamps keep it
// accurate across reloads and tab switches.
function tick() {
  if (view) view.update(Date.now());
  requestAnimationFrame(tick);
}
requestAnimationFrame(tick);

// PWA service worker
if ('serviceWorker' in navigator && !import.meta.env.DEV) {
  navigator.serviceWorker.register(`${import.meta.env.BASE_URL}sw.js`);
}
