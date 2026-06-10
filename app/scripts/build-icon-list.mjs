// Generates src/data/icon-list.json from the files under public/icons.
// Run after changing the icon sets: node scripts/build-icon-list.mjs
import { readdir, writeFile, mkdir } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = dirname(dirname(fileURLToPath(import.meta.url)));

async function keys(dir) {
  const files = await readdir(join(root, 'public', 'icons', dir));
  return files.filter((f) => f.endsWith('.svg')).map((f) => f.slice(0, -4));
}

const phosphor = await keys('phosphor');

// Keep the OpenMoji set kid-friendly and picker-friendly: drop ZWJ sequences,
// skin tones, flags, keycaps, enclosed CJK/Latin signs and abstract symbol blocks.
function cp(k) {
  return parseInt(k.split('-')[0], 16);
}
const SYMBOL_RANGES = [
  [0x0000, 0x1f2ff], // keycaps, ©®, mahjong, cards, enclosed letters/CJK
  [0x1f500, 0x1f53d], // arrows, AV symbols
  [0x1f549, 0x1f54e], // religious symbols
  [0x1f5e8, 0x1f5ef], // speech bubble glyphs
  [0x203c, 0x2199], // punctuation, arrows
  [0x21a9, 0x2328], // arrows, keyboard
  [0x23cf, 0x23fe], // media buttons
  [0x24c2, 0x25fe], // enclosed M, geometric shapes
  [0x2616, 0x2617], // shogi
  [0x2622, 0x2623], // radioactive/biohazard
  [0x2626, 0x2653], // religious, zodiac
  [0x2660, 0x2667], // card suits
  [0x2934, 0x2935], // arrows
  [0x2b00, 0x2b4f], // arrows/shapes (keeps 2B50 star)
  [0x2b55, 0x3299], // shapes, CJK marks
  [0xe000, 0xffff], // private use
];
const EXTRA_DROP = new Set(['1F004', '1F0CF', '1F3F4', '1F6AB', '1F6B7', '1F6C9', '1F6CA', '2B1B', '2B1C', '2B24']);

const openmoji = (await keys('openmoji')).filter((k) => {
  if (k.includes('-200D-') || /-1F3F[B-F]/.test(k)) return false; // ZWJ, skin tones
  if (/^1F1E|^1F1F/.test(k)) return false; // flag pairs
  if (k.startsWith('1F3F4-E')) return false; // tag flags
  if (EXTRA_DROP.has(k)) return false;
  const c = cp(k);
  return !SYMBOL_RANGES.some(([lo, hi]) => c >= lo && c <= hi);
});

await mkdir(join(root, 'src', 'data'), { recursive: true });
await writeFile(
  join(root, 'src', 'data', 'icon-list.json'),
  JSON.stringify({ phosphor, openmoji })
);
console.log(`phosphor: ${phosphor.length}, openmoji: ${openmoji.length}`);
