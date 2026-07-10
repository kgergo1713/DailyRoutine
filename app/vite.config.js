import { defineConfig } from 'vite';
import { readFileSync } from 'node:fs';

const { version } = JSON.parse(readFileSync(new URL('./package.json', import.meta.url)));

export default defineConfig({
  // Custom domain: https://dailyroutine.kanyoghdomain.com/ (served from the domain root)
  base: '/',
  define: {
    __APP_VERSION__: JSON.stringify(version),
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
  },
});
