// @ts-check
import js from '@eslint/js';
import playwright from 'eslint-plugin-playwright';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  { ignores: ['node_modules/', 'playwright-report/', 'test-results/', '.auth/', 'results/'] },
  js.configs.recommended,
  ...tseslint.configs.recommendedTypeChecked,
  {
    languageOptions: {
      parserOptions: { projectService: true, tsconfigRootDir: import.meta.dirname },
    },
    rules: {
      '@typescript-eslint/no-floating-promises': 'error',
      '@typescript-eslint/no-explicit-any': 'error',
      // Express 5 awaits async handlers itself.
      '@typescript-eslint/no-misused-promises': ['error', { checksVoidReturn: { arguments: false } }],
    },
  },
  {
    // Spec §5.1 standards, enforced by the linter instead of by memory.
    files: ['tests/**/*.ts'],
    ...playwright.configs['flat/recommended'],
    rules: {
      ...playwright.configs['flat/recommended'].rules,
      'playwright/no-wait-for-timeout': 'error',
      'playwright/no-focused-test': 'error',
      'playwright/prefer-web-first-assertions': 'error',
      'playwright/no-element-handle': 'error',
      'playwright/no-raw-locators': 'error',
      'playwright/no-nth-methods': 'error',
    },
  },
  { files: ['**/*.mjs'], ...tseslint.configs.disableTypeChecked },
);
