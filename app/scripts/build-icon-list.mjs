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
// Skin-tone & ZWJ variants make the picker unusable; keep base emojis only.
const openmoji = (await keys('openmoji')).filter((k) => !k.includes('-200D-') && !/-1F3F[B-F]/.test(k));

await mkdir(join(root, 'src', 'data'), { recursive: true });
await writeFile(
  join(root, 'src', 'data', 'icon-list.json'),
  JSON.stringify({ phosphor, openmoji })
);
console.log(`phosphor: ${phosphor.length}, openmoji: ${openmoji.length}`);
