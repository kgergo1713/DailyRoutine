/**
 * Curated pool of cute OpenMoji icons shown as the reward when
 * a child completes all tasks.  Grouped by theme for readability.
 * Every code is verified to exist in public/icons/openmoji/.
 */
export const rewardIcons = [
  // Fruits
  { source: 'openmoji', key: '1F34E' }, // 🍎 red apple
  { source: 'openmoji', key: '1F34A' }, // 🍊 tangerine
  { source: 'openmoji', key: '1F34B' }, // 🍋 lemon
  { source: 'openmoji', key: '1F347' }, // 🍇 grapes
  { source: 'openmoji', key: '1F353' }, // 🍓 strawberry
  { source: 'openmoji', key: '1F352' }, // 🍒 cherries
  { source: 'openmoji', key: '1F351' }, // 🍑 peach
  { source: 'openmoji', key: '1F34D' }, // 🍍 pineapple
  { source: 'openmoji', key: '1F95D' }, // 🥝 kiwi
  { source: 'openmoji', key: '1F349' }, // 🍉 watermelon
  { source: 'openmoji', key: '1F34C' }, // 🍌 banana

  // Animals
  { source: 'openmoji', key: '1F431' }, // 🐱 cat
  { source: 'openmoji', key: '1F436' }, // 🐶 dog
  { source: 'openmoji', key: '1F430' }, // 🐰 rabbit
  { source: 'openmoji', key: '1F438' }, // 🐸 frog
  { source: 'openmoji', key: '1F43C' }, // 🐼 panda
  { source: 'openmoji', key: '1F428' }, // 🐨 koala
  { source: 'openmoji', key: '1F98A' }, // 🦊 fox
  { source: 'openmoji', key: '1F427' }, // 🐧 penguin
  { source: 'openmoji', key: '1F98B' }, // 🦋 butterfly
  { source: 'openmoji', key: '1F41D' }, // 🐝 honeybee
  { source: 'openmoji', key: '1F984' }, // 🦄 unicorn
  { source: 'openmoji', key: '1F42C' }, // 🐬 dolphin
  { source: 'openmoji', key: '1F43B' }, // 🐻 bear
  { source: 'openmoji', key: '1F414' }, // 🐔 chicken
  { source: 'openmoji', key: '1F422' }, // 🐢 turtle

  // Nature & sky
  { source: 'openmoji', key: '1F308' }, // 🌈 rainbow
  { source: 'openmoji', key: '1F338' }, // 🌸 cherry blossom
  { source: 'openmoji', key: '1F33A' }, // 🌺 hibiscus
  { source: 'openmoji', key: '1F33B' }, // 🌻 sunflower
  { source: 'openmoji', key: '1F31F' }, // 🌟 glowing star
  { source: 'openmoji', key: '2B50'  }, // ⭐ star
  { source: 'openmoji', key: '1F319' }, // 🌙 crescent moon
  { source: 'openmoji', key: '1F31E' }, // 🌞 sun with face

  // Happy faces & fun
  { source: 'openmoji', key: '1F60A' }, // 😊 smiling face
  { source: 'openmoji', key: '1F970' }, // 🥰 smiling face with hearts
  { source: 'openmoji', key: '1F929' }, // 🤩 star-struck
  { source: 'openmoji', key: '1F973' }, // 🥳 party face
  { source: 'openmoji', key: '1F388' }, // 🎈 balloon
  { source: 'openmoji', key: '1F380' }, // 🎀 ribbon
  { source: 'openmoji', key: '1F381' }, // 🎁 wrapped gift
  { source: 'openmoji', key: '1F3C6' }, // 🏆 trophy
];

/**
 * Pick a reward icon that is stable for a given child on a given day,
 * but varies across children and across days.
 *
 * @param {string} childId
 * @returns {{ source: string, key: string }}
 */
export function pickRewardIcon(childId) {
  const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
  const raw = childId + today;
  // Simple djb2-style hash (always positive)
  let h = 5381;
  for (let i = 0; i < raw.length; i++) {
    h = (((h << 5) + h) + raw.charCodeAt(i)) >>> 0;
  }
  return rewardIcons[h % rewardIcons.length];
}
