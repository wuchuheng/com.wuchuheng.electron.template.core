import { contextBridge, ipcRenderer } from 'electron';

export interface ManifestEntry {
  channel: string;
  type: 'invoke' | 'event';
}

export type IpcManifest = Record<string, Record<string, ManifestEntry>>;

/**
 * Dynamically creates a renderer API from the provided IPC manifest and
 * exposes it to the browser's global scope.
 */
export const exposeElectronApi = (manifestRaw: unknown): void => {
  // Handle potential ESM wrapping where the JSON object is inside a 'default' property
  const manifest = (
    manifestRaw && typeof manifestRaw === 'object' && 'default' in manifestRaw
      ? (manifestRaw as any).default
      : manifestRaw
  ) as IpcManifest;

  const createRendererApi = (ipcManifest: IpcManifest) => {
    const api: Record<string, Record<string, any>> = {};

    Object.entries(ipcManifest).forEach(([moduleName, methods]) => {
      api[moduleName] = {};

      Object.entries(methods).forEach(([methodName, meta]) => {
        if (meta.type === 'event') {
          api[moduleName][methodName] = (listener: (payload: unknown) => void) => {
            const eventChannel = `${meta.channel}:event`;
            const subscribeChannel = `${meta.channel}:subscribe`;
            const unsubscribeChannel = `${meta.channel}:unsubscribe`;

            const handler = (_event: unknown, payload: unknown) => listener(payload);
            ipcRenderer.on(eventChannel, handler);
            ipcRenderer.send(subscribeChannel);

            return () => {
              ipcRenderer.removeListener(eventChannel, handler);
              ipcRenderer.send(unsubscribeChannel);
            };
          };
          return;
        }

        api[moduleName][methodName] = (...args: unknown[]) => ipcRenderer.invoke(meta.channel, ...args);
      });
    });

    return api;
  };

  const electronApi = createRendererApi(manifest);
  contextBridge.exposeInMainWorld('electron', electronApi);
};
