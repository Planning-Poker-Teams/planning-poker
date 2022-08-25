import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import legacy from '@vitejs/plugin-legacy';
import html from 'vite-plugin-html';

// https://vitejs.dev/config/
export default defineConfig({
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
  ],
});
