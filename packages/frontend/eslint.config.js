const js = require('@eslint/js');
const { defineConfigWithVueTs, vueTsConfigs } = require('@vue/eslint-config-typescript');
const prettierConfig = require('@vue/eslint-config-prettier/skip-formatting');
const globals = require('globals');
const { importX } = require('eslint-plugin-import-x');
const pluginVue = require('eslint-plugin-vue');

module.exports = defineConfigWithVueTs(
  {
    ignores: ['dist/**', 'coverage/**'],
  },
  js.configs.recommended,
  pluginVue.configs['flat/recommended'],
  vueTsConfigs.recommended,
  importX.flatConfigs.recommended,
  importX.flatConfigs.typescript,
  {
    files: ['src/**/*.{ts,vue}'],
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
      },
    },
    rules: {
      'no-console': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
      'no-debugger': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
      'vue/multi-word-component-names': 'off',
      'import-x/order': ['error', { alphabetize: { order: 'asc', caseInsensitive: true } }],
      'no-undef': 'off',
    },
  },
  {
    files: ['src/**/*.spec.ts'],
    languageOptions: {
      globals: globals.vitest,
    },
  },
  prettierConfig
);
