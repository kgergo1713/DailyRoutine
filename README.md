# DailyRoutine

A visual task-tracking tablet app for kids. It eases the "emergency mode" of getting ready in the morning (and at other times of day) by always showing the child only the **next task** — never the overwhelming pile of everything at once.

Built as an **offline-first PWA**, designed for Android tablets (installable from the browser, runs full-screen, works without a network connection).

**Live app:** https://kgergo1713.github.io/DailyRoutine/

## Core principles

1. **Visual only, no sound.** No alarms, bells, or speech.
2. **Positive or neutral feedback only.** No sad faces, no red alerts, no failure states. Running over the time budget is a neutral state, not a punishment.
3. **One task at a time.** The upcoming task is always highlighted so the child never has to choose.
4. **Fully customizable.** Number of children, names, markers, icons, periods, tasks — everything is configurable, nothing is hardcoded.
5. **Offline-first.** Works without installation or network (browser kiosk mode). All data stays local — privacy by design, nothing ever leaves the device.

The app is designed with neurodivergent (ADHD/autistic) children in mind, for whom visual scheduling and single-task focus are proven aids.

## Features

- **Routine view** — one column per child with their marker and name; task tiles with four states (`pending` → `running` ⇄ `paused` → `done`); the next task is highlighted with a calm pulsing outline; completed tasks shrink to small check marks so the whole routine always fits on screen.
- **One task at a time** — tapping another task automatically pauses the running one (its progress is preserved); tapping a paused task resumes it.
- **Timer** — a pie-slice ring counts down the time budget; on overrun it turns to a neutral amber and keeps counting. No red, ever.
- **Summary bar** — per-child progress dots; when everything is done, a smiley appears instead of text (pre-readers!).
- **Schedules** — multiple periods (weekday morning, evening, weekend…) with per-day and time-window settings; the app picks the active period automatically and shows a calm "nothing to do now" screen otherwise.
- **Configuration view** (parent, ⚙) — children (name, color, OpenMoji marker), per-period task lists (label, icon, time budget, order), period editor with day chips, JSON export/import, demo reset.
- **Icon picker** — curated popular icons up front, full searchable set (~1500 Phosphor + ~1100 kid-friendly OpenMoji) behind an "All" toggle with infinite scroll.
- **Statistics view** (★) — stars for on-time completions, per-day bar charts, Today / 7 days / 30 days ranges. Positive framing only, no rankings.
- **Quick toggles on the main screen** — language (HU/EN), light/dark theme and fullscreen as icon buttons in the top bar.
- **Screen wake lock** — the display stays awake while the board is visible (Screen Wake Lock API), re-acquired automatically when the app regains focus.

## Tech stack

| Layer | Choice |
|---|---|
| Framework | Vanilla JS + [Vite](https://vitejs.dev) |
| Storage | `localStorage` — all data stays on the device |
| App shell | PWA (manifest + service worker, full offline cache) |
| Timer | `requestAnimationFrame` + absolute timestamps (stays accurate across tab switches and reloads) |
| Icons | [Phosphor Icons](https://phosphoricons.com) (task icons) + [OpenMoji](https://openmoji.org) (child markers) |
| i18n | JSON language files (`hu`, `en`) |
| Deploy | GitHub Actions → GitHub Pages on every push to `main` |

## Getting started

```bash
git clone https://github.com/kgergo1713/DailyRoutine.git
cd DailyRoutine/app
npm install
npm run dev
```

Open the printed local URL in a browser. The app ships with Hungarian demo data (4 children, weekday-morning, evening and weekend routines) so it is usable immediately; the demo config can be replaced or cleared at any time in Settings.

### Production build

```bash
npm run build
npm run preview   # serve the build locally
```

## Installing on an Android tablet

1. Open https://kgergo1713.github.io/DailyRoutine/ in Chrome on the tablet.
2. Choose **Add to Home screen** / **Install app** from the menu.
3. Launch it from the home screen — it runs full-screen and works offline from then on.

When running in a browser tab instead, use the ⛶ button for fullscreen. The screen is kept awake while the app is visible — keeping the tablet on a charger is recommended.

Each device keeps its own configuration and history; nothing is shared or uploaded.

## Project structure

```
/app
  /src
    /views        routine, config, stats
    /components   taskTile, childColumn, summaryBar, iconPicker, icon
    /data         store (localStorage), schedule, stats, theme, demo data
    /i18n         hu.json, en.json
  /scripts        build-icon-list.mjs
  /public
    /icons        phosphor + openmoji SVGs
    manifest.webmanifest, sw.js, app icon
/.github/workflows  GitHub Pages deploy
MORNING_ROUTINE_APP_SPEC.md   full specification (Hungarian)
```

## Privacy

All data (configuration and completion logs) is stored locally on the device. There are no trackers, no analytics, no external CDNs, and no network requests with user data.

## Feedback & support

- Feedback and feature suggestions: [kgergo1713@gmail.com](mailto:kgergo1713@gmail.com)
- If you'd like to support development: Revolut [@kgergo1713](https://revolut.me/kgergo1713)

## License & attribution

- App code: MIT
- [Phosphor Icons](https://github.com/phosphor-icons/core): MIT
- [OpenMoji](https://openmoji.org): [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/) — All emojis designed by OpenMoji – the open-source emoji and icon project.
