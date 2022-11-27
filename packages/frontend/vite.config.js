import fs from 'fs';
import path from 'path';
import legacy from '@vitejs/plugin-legacy';
import vue from '@vitejs/plugin-vue';
import { defineConfig } from 'vite';
import { createHtmlPlugin } from 'vite-plugin-html';

export default defineConfig({
  test: {
    test: 'vitest',
    environment: 'jsdom',
  },
  plugins: [
    vue(),
    createHtmlPlugin({
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
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src/'),
      '@assets': path.resolve(__dirname, 'src/asset/'),
      '@components': path.resolve(__dirname, 'src/components/'),
      '@hooks': path.resolve(__dirname, 'src/hooks/'),
      '@router': path.resolve(__dirname, 'src/router/'),
      '@store': path.resolve(__dirname, 'src/store/'),
      '@views': path.resolve(__dirname, 'src/views/'),
    },
  },
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
