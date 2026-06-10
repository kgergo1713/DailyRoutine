import './style.css';
import { loadConfig, loadDayState } from './data/store.js';
import { createRoutineView } from './views/routine.js';

const config = loadConfig();
const dayState = loadDayState();

const view = createRoutineView({ config, dayState });
document.querySelector('#app').appendChild(view.el);

// Single rAF loop drives every timer; absolute timestamps keep it
// accurate across reloads and tab switches.
function tick() {
  view.update(Date.now());
  requestAnimationFrame(tick);
}
requestAnimationFrame(tick);

// PWA service worker
if ('serviceWorker' in navigator && !import.meta.env.DEV) {
  navigator.serviceWorker.register(`${import.meta.env.BASE_URL}sw.js`);
}
