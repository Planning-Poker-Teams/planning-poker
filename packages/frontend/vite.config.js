import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import legacy from '@vitejs/plugin-legacy';
import html from 'vite-plugin-html';
import path from 'path';
import fs from 'fs';

export default defineConfig({
  test: {
    test: 'vitest',
    environment: 'jsdom',
  },
  plugins: [
    vue(),
    html({
    inject: {
      data: {
          TITLE: 'Planning Poker',
          BASE_URL: process.env.BASE_URL,
        },
      },
    }),
    legacy({
      targets: ['> 1%', 'last 2 versions', 'not dead'],
    }),
    removeDevelopmentEnvironment(),
  ],
});

/**
 * Removes `public/environment.js` when building.
 *
 * This file is a placeholder for local development. During deployment, the actual file is created.
 */
function removeDevelopmentEnvironment() {
  return {
    name: 'strip-dev-css',
    resolveId(source) {
      return source === 'virtual-module' ? source : null;
    },
    renderStart(outputOptions, inputOptions) {
      const outDir = outputOptions.dir;
      const cssDir = path.resolve(outDir, 'environment.js');
      fs.unlink(cssDir, () => console.log(`Deleted ${cssDir}`));

      // fs.rmdir(cssDir, { recursive: true }, () => console.log(`Deleted ${cssDir}`));
    },
  };
}
