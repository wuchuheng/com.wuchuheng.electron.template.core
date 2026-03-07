#!/usr/bin/env node
import { syncIpc, SyncIpcOptions } from './sync-ipc';
import path from 'node:path';

const args = process.argv.slice(2);
const command = args[0];

if (command === 'sync-ipc') {
  const projectRoot = process.cwd();
  const options: SyncIpcOptions = {
    projectRoot,
    ipcRoot: path.join(projectRoot, 'src', 'main', 'ipc'),
    manifestPath: path.join(projectRoot, 'src', 'shared', 'ipc-manifest.json'),
    typesPath: path.join(projectRoot, 'src', 'types', 'generated-electron-api.d.ts'),
    tsconfigPath: path.join(projectRoot, 'tsconfig.json'),
  };

  // Allow overrides via flags if needed
  syncIpc(options);
} else {
  console.log(`
Usage: electron-template-core <command>

Commands:
  sync-ipc    Synchronizes IPC handlers and generates TypeScript definitions.
  `);
}
