import { t } from '../i18n/index.js';
import { iconEl } from '../components/icon.js';
import { collectStats, lastNDays } from '../data/stats.js';

const RANGES = [
  { key: 'day', days: 1 },
  { key: 'week', days: 7 },
  { key: 'month', days: 30 },
];

/**
 * Statistics view. Positive framing only: stars and gentle bars,
 * no rankings, no shaming (spec §8).
 */
export function createStatsView({ config, onClose }) {
  const el = document.createElement('div');
  el.className = 'stats';

  const head = document.createElement('header');
  head.className = 'config__head';
  const backBtn = document.createElement('button');
  backBtn.type = 'button';
  backBtn.className = 'btn btn--back';
  backBtn.textContent = `← ${t('config.back')}`;
  backBtn.addEventListener('click', onClose);
  const title = document.createElement('h1');
  title.className = 'config__title';
  title.textContent = t('stats.title');
  head.appendChild(backBtn);
  head.appendChild(title);
  el.appendChild(head);

  // --- range chips ---
  const rangeRow = document.createElement('div');
  rangeRow.className = 'stats__ranges';
  el.appendChild(rangeRow);

  const body = document.createElement('div');
  body.className = 'stats__body';
  el.appendChild(body);

  let activeRange = 'week';

  for (const range of RANGES) {
    const chip = document.createElement('button');
    chip.type = 'button';
    chip.className = 'config__day-chip';
    chip.textContent = t(`stats.range.${range.key}`);
    chip.dataset.range = range.key;
    chip.addEventListener('click', () => {
      activeRange = range.key;
      render();
    });
    rangeRow.appendChild(chip);
  }

  function render() {
    for (const chip of rangeRow.children) {
      chip.classList.toggle('config__day-chip--on', chip.dataset.range === activeRange);
    }

    const { days } = RANGES.find((r) => r.key === activeRange);
    const dates = lastNDays(days);
    const { perChild, totalDone } = collectStats(dates);

    body.replaceChildren();

    if (totalDone === 0) {
      const empty = document.createElement('div');
      empty.className = 'routine__idle';
      empty.textContent = t('stats.empty');
      body.appendChild(empty);
      return;
    }

    const maxPerDay = Math.max(
      1,
      ...Object.values(perChild).flatMap((c) => Object.values(c.perDay))
    );

    const children = [...config.children].sort((a, b) => a.order - b.order);
    for (const child of children) {
      const data = perChild[child.id] ?? { done: 0, withinTime: 0, perDay: {} };

      const card = document.createElement('section');
      card.className = 'stats__card';
      card.style.setProperty('--c-child', child.color);

      const header = document.createElement('div');
      header.className = 'stats__card-head';
      header.appendChild(iconEl({ source: 'openmoji', key: child.marker.value }, 'stats__marker'));
      const name = document.createElement('h2');
      name.textContent = child.name;
      header.appendChild(name);

      // stars: one per within-time completion (capped visually)
      const stars = document.createElement('div');
      stars.className = 'stats__stars';
      const starCount = Math.min(data.withinTime, 10);
      stars.textContent = '⭐'.repeat(starCount);
      if (data.withinTime > 10) stars.textContent += ` +${data.withinTime - 10}`;
      header.appendChild(stars);
      card.appendChild(header);

      const numbers = document.createElement('p');
      numbers.className = 'stats__numbers';
      numbers.textContent = t('stats.summary', { done: data.done, withinTime: data.withinTime });
      card.appendChild(numbers);

      // per-day mini bar chart (only for multi-day ranges)
      if (days > 1) {
        const chart = document.createElement('div');
        chart.className = 'stats__chart';
        for (const date of dates) {
          const wrap = document.createElement('div');
          wrap.className = 'stats__bar-wrap';
          const bar = document.createElement('div');
          bar.className = 'stats__bar';
          const value = data.perDay[date] ?? 0;
          bar.style.height = `${(value / maxPerDay) * 100}%`;
          bar.title = `${date}: ${value}`;
          const label = document.createElement('span');
          label.className = 'stats__bar-label';
          label.textContent = date.slice(8); // day of month
          wrap.appendChild(bar);
          wrap.appendChild(label);
          chart.appendChild(wrap);
        }
        card.appendChild(chart);
      }

      body.appendChild(card);
    }
  }

  render();
  return { el };
}
