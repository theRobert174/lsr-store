import { access } from 'node:fs/promises';
import { resolve } from 'node:path';
import {
  cleanBuildOutputDir,
  readBuildOutput,
  writeAssets,
  writeRootConfig,
  writeWorkerConfig,
} from '@cloudflare/build-output-utils';
import config from '../cloudflare.config.ts';

// Angular owns compilation. Package its existing output as an assets-only Worker.
// Pin the beta CLI and output utility together until this format becomes stable.
const root = process.cwd();
const sourceDirectory = resolve(root, 'dist/lsr-store/browser');
await access(resolve(sourceDirectory, 'index.html'));
await access(resolve(sourceDirectory, 'stock.json'));
await cleanBuildOutputDir(root);
await writeRootConfig(root, undefined, { mode: 'production', isPreview: false });
await writeAssets({ root, sourceDirectory });
await writeWorkerConfig({ root, config: config.worker });
await readBuildOutput(root);
console.log('Cloudflare: salida estática empaquetada para libreria.rodrigomartinez.dev.');
