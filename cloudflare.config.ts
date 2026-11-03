import { defineConfig } from 'cf/config';

export default defineConfig({
  worker: {
    name: 'lsr-store',
    compatibilityDate: '2026-11-03',
    domains: ['libreria.rodrigomartinez.dev'],
    assets: {
      notFoundHandling: 'single-page-application',
    },
    observability: {
      enabled: true,
      traces: { enabled: true },
    },
  },
});
