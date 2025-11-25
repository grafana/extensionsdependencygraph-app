import { defineConfig } from 'eslint/config';
import baseConfig from './.config/eslint.config.mjs';
import grafanaPlugins from '@grafana/eslint-plugin-plugins';

export default defineConfig([
  {
    files: ['src/**/*.{ts,tsx}'],
    plugins: { '@grafana/plugins': grafanaPlugins },
    rules: {
      '@grafana/plugins/import-is-compatible': [
        'warn',
        // optionally pass the minimum supported version
        // { minGrafanaVersion: '10.3.0' },
      ],
    },
  },
  {
    ignores: [
      '**/logs',
      '**/*.log',
      '**/npm-debug.log*',
      '**/yarn-debug.log*',
      '**/yarn-error.log*',
      '**/.pnpm-debug.log*',
      '**/node_modules/',
      '.yarn/cache',
      '.yarn/unplugged',
      '.yarn/build-state.yml',
      '.yarn/install-state.gz',
      '**/.pnp.*',
      '**/pids',
      '**/*.pid',
      '**/*.seed',
      '**/*.pid.lock',
      '**/lib-cov',
      '**/coverage',
      '**/dist/',
      '**/artifacts/',
      '**/work/',
      '**/ci/',
      'test-results/',
      'playwright-report/',
      'blob-report/',
      'playwright/.cache/',
      'playwright/.auth/',
      '**/.idea',
      '**/.eslintcache',
    ],
  },
  ...baseConfig,
]);
