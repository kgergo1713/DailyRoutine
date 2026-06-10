# DailyRoutine

A visual task-tracking tablet app for kids. It eases the "emergency mode" of getting ready in the morning (and at other times of day) by always showing the child only the **next task** — never the overwhelming pile of everything at once.

Built as an **offline-first PWA**, designed for Android tablets (installable from the browser, runs full-screen, works without a network connection).

## Core principles

1. **Visual only, no sound.** No alarms, bells, or speech.
2. **Positive or neutral feedback only.** No sad faces, no red alerts, no failure states. Running over the time budget is a neutral state, not a punishment.
3. **One task at a time.** The upcoming task is always highlighted so the child never has to choose.
4. **Fully customizable.** Number of children, names, markers, icons, periods, tasks — everything is configurable, nothing is hardcoded.
5. **Offline-first.** Works without installation or network (browser kiosk mode). All data stays local — privacy by design, nothing ever leaves the device.

The app is designed with neurodivergent (ADHD/autistic) children in mind, for whom visual scheduling and single-task focus are proven aids.

## Features

- **Routine view** — one column per child with their marker and name, task icons with three states (`pending` → `running` → `done`), a calm pie-slice countdown timer for the running task, and a per-child progress summary bar.
- **Timer** — when the time budget expires, the timer keeps counting (overrun is measured and logged), but the visual state stays neutral. No red, ever.
- **Configuration view** (parent) — manage children, a task library with icons and default durations, periods/schedules, language, theme, JSON export/import.
- **Statistics view** — daily/weekly/period summaries with positive framing ("weekly stars"), never shaming rankings.
- **Schedules** — weekday mornings/afternoons/evenings, weekends, and one-off events; the app picks the active period automatically based on the current date and time.

> The first release targets the MVP scope (routine view, task state machine, pie timer, summary bar, local persistence). Configuration, schedules, statistics, and i18n follow in later phases — see the [development phases](MORNING_ROUTINE_APP_SPEC.md) in the spec (Hungarian).

## Tech stack

| Layer | Choice |
|---|---|
| Framework | Vanilla JS + [Vite](https://vitejs.dev) |
| Storage | `localStorage` (MVP), `IndexedDB` later |
| App shell | PWA (manifest + service worker, full offline cache) |
| Timer | `requestAnimationFrame` + absolute timestamps (stays accurate across tab switches and reloads) |
| Icons | [Phosphor Icons](https://phosphoricons.com) (task icons) + [OpenMoji](https://openmoji.org) (child markers) |
| i18n | JSON language files (`hu` first, `en` planned) |

## Getting started

```bash
git clone https://github.com/kgergo1713/DailyRoutine.git
cd DailyRoutine/app
npm install
npm run dev
```

Open the printed local URL in a browser. The app ships with Hungarian demo data (children and a weekday-morning routine) so it is usable immediately; the demo config can be replaced or cleared at any time.

### Production build

```bash
npm run build
npm run preview   # serve the build locally
```

## Installing on an Android tablet

The app is published via GitHub Pages. On the tablet:

1. Open the GitHub Pages URL in Chrome.
2. Choose **Add to Home screen** / **Install app** from the menu.
3. Launch it from the home screen — it runs full-screen and works offline from then on.

## Project structure

```
/app
  /src
    /views        routine, config, stats
    /components   TaskTile, TimerRing, ChildColumn, SummaryBar, IconPicker
    /data         storage wrapper
    /i18n         hu.json, en.json
    /icons        phosphor + openmoji SVGs, icon-registry.json
  /scripts        build-icon-sprite.js
  /public         manifest.json, sw.js, app icons
MORNING_ROUTINE_APP_SPEC.md   full specification (Hungarian)
```

## Privacy

All data (configuration and completion logs) is stored locally on the device. There are no trackers, no analytics, no external CDNs, and no network requests with user data.

## License & attribution

- App code: MIT
- [Phosphor Icons](https://github.com/phosphor-icons/core): MIT
- [OpenMoji](https://openmoji.org): [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/) — All emojis designed by OpenMoji – the open-source emoji and icon project.
