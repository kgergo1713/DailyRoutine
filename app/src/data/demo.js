import { t } from '../i18n/index.js';

/**
 * Demo configuration: 4 children, weekday-morning + evening + weekend routines.
 * Loaded on first start; replaced later by the config view.
 */
export function buildDemoConfig() {
  const tasks = [
    { id: 'wakeup', label: t('demo.tasks.wakeup'), icon: { source: 'phosphor', key: 'sun-fill' }, defaultDurationSec: 300 },
    { id: 'dress', label: t('demo.tasks.dress'), icon: { source: 'phosphor', key: 't-shirt-fill' }, defaultDurationSec: 420 },
    { id: 'breakfast', label: t('demo.tasks.breakfast'), icon: { source: 'phosphor', key: 'fork-knife-fill' }, defaultDurationSec: 900 },
    { id: 'teeth', label: t('demo.tasks.teeth'), icon: { source: 'phosphor', key: 'tooth-fill' }, defaultDurationSec: 180 },
    { id: 'shoes', label: t('demo.tasks.shoes'), icon: { source: 'phosphor', key: 'sneaker-fill' }, defaultDurationSec: 180 },
    { id: 'backpack', label: t('demo.tasks.backpack'), icon: { source: 'phosphor', key: 'backpack-fill' }, defaultDurationSec: 300 },
    { id: 'pajamas', label: t('demo.tasks.pajamas'), icon: { source: 'phosphor', key: 'moon-fill' }, defaultDurationSec: 300 },
    { id: 'tidyup', label: t('demo.tasks.tidyup'), icon: { source: 'phosphor', key: 'basket-fill' }, defaultDurationSec: 600 },
    { id: 'bath', label: t('demo.tasks.bath'), icon: { source: 'phosphor', key: 'shower-fill' }, defaultDurationSec: 900 },
  ];

  const byId = Object.fromEntries(tasks.map((task) => [task.id, task]));
  const taskRefs = (ids) => ids.map((id) => ({ taskId: id, durationSec: byId[id].defaultDurationSec, perChild: true }));

  return {
    children: [
      { id: 'peti', name: t('demo.children.peti'), marker: { type: 'openmoji', value: '1F697' }, color: '#457b9d', order: 0 }, // autó
      { id: 'balint', name: t('demo.children.balint'), marker: { type: 'openmoji', value: '1F388' }, color: '#e76f51', order: 1 }, // lufi
      { id: 'sari', name: t('demo.children.sari'), marker: { type: 'openmoji', value: '1F98B' }, color: '#8e7cc3', order: 2 }, // pillangó
      { id: 'adam', name: t('demo.children.adam'), marker: { type: 'openmoji', value: '1F9F8' }, color: '#e9c46a', order: 3 }, // maci
    ],
    tasks,
    periods: [
      {
        id: 'weekday-morning',
        name: t('demo.periods.weekdayMorning'),
        schedule: { type: 'weekly', days: [1, 2, 3, 4, 5], fromTime: '06:00', toTime: '09:00' },
        tasks: taskRefs(['wakeup', 'dress', 'breakfast', 'teeth', 'shoes', 'backpack']),
      },
      {
        id: 'evening',
        name: t('demo.periods.evening'),
        schedule: { type: 'weekly', days: [1, 2, 3, 4, 5, 6, 7], fromTime: '18:30', toTime: '20:30' },
        tasks: taskRefs(['tidyup', 'bath', 'teeth', 'pajamas']),
      },
      {
        id: 'weekend-morning',
        name: t('demo.periods.weekendMorning'),
        schedule: { type: 'weekly', days: [6, 7], fromTime: '07:00', toTime: '10:00' },
        tasks: taskRefs(['dress', 'breakfast', 'teeth', 'tidyup']),
      },
    ],
  };
}
