import { app } from 'electron';
import path from 'node:path';
import fs from 'node:fs';

export interface AppPaths {
  database: string;
  logs: string;
  storage: string;
}

/**
 * Standardized utility for resolving all persistent data paths.
 * All paths are rooted in the Electron userData directory to ensure
 * persistence across application updates.
 */
export const getPaths = (appName: string): AppPaths => {
  const baseDir = path.join(app.getPath('appData'), appName);
  const storage = path.join(baseDir, 'storage');

  const paths: AppPaths = {
    storage,
    database: path.join(storage, 'database.sqlite'),
    logs: path.join(storage, 'logs'),
  };

  // Ensure critical directories exist
  [storage, paths.logs].forEach(dir => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  });

  return paths;
};

/**
 * Resolves the absolute path to the application icon.
 */
export const getAppIconPath = (appPath: string, resourcesPath: string, isPackaged: boolean) => {
  if (isPackaged) {
    return path.join(resourcesPath, 'icon.ico');
  }
  return path.join(appPath, 'src/renderer/assets/genLogo/icon.ico');
};
