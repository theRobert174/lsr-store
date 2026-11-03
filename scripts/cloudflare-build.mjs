import { spawnSync } from 'node:child_process';

const build = spawnSync(process.execPath, ['node_modules/@angular/cli/bin/ng.js', 'build'], {
  stdio: 'inherit',
});
if (build.error) throw build.error;
if (build.status !== 0) process.exit(build.status ?? 1);
await import('./cloudflare-package.mjs');
