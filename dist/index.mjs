// src/ipc/helper.ts
import { ipcMain } from "electron";
var createEvent = () => {
  let dispatch = null;
  const trigger = (payload) => {
    if (dispatch) {
      dispatch(payload);
    }
  };
  trigger._isEvent = true;
  trigger._setDispatcher = (handler) => {
    dispatch = handler;
  };
  return trigger;
};
var channelSubscriptions = /* @__PURE__ */ new Map();
var registerEvent = (channel, eventFn) => {
  const subscribers = channelSubscriptions.get(channel) ?? /* @__PURE__ */ new Set();
  channelSubscriptions.set(channel, subscribers);
  const subscribeChannel = `${channel}:subscribe`;
  const unsubscribeChannel = `${channel}:unsubscribe`;
  const broadcastChannel = `${channel}:event`;
  ipcMain.on(subscribeChannel, (event) => {
    const sender = event.sender;
    subscribers.add(sender);
    sender.once("destroyed", () => {
      subscribers.delete(sender);
    });
  });
  ipcMain.on(unsubscribeChannel, (event) => {
    subscribers.delete(event.sender);
  });
  const dispatcher = (payload) => {
    for (const wc of Array.from(subscribers)) {
      if (wc.isDestroyed()) {
        subscribers.delete(wc);
        continue;
      }
      wc.send(broadcastChannel, payload);
    }
  };
  eventFn._setDispatcher?.(dispatcher);
};

// src/utils/logger.ts
import chalk from "chalk";
import dayjs from "dayjs";
import fs from "fs";
import path from "path";
if (chalk.level === 0) {
  chalk.level = 1;
}
var Logger = class {
  logDir;
  constructor(options) {
    this.logDir = options.logDir;
  }
  getDailyLogDir() {
    const dailyDir = path.join(this.logDir, dayjs().format("YYYY-MM-DD"));
    if (!fs.existsSync(dailyDir)) {
      fs.mkdirSync(dailyDir, { recursive: true });
    }
    return dailyDir;
  }
  getLogFile(level) {
    const logFile = path.join(this.getDailyLogDir(), `${level}.log`);
    if (!fs.existsSync(logFile)) {
      fs.writeFileSync(logFile, "");
    }
    return logFile;
  }
  writeLog(datetime, level, source, message) {
    const logFile = this.getLogFile(level);
    const timeStr = dayjs(datetime).format("HH:mm:ss");
    const text = `${timeStr} ["${level}"] [${source}] ${message}
`;
    fs.appendFileSync(logFile, text);
  }
  formatMessage(message) {
    return message.endsWith(".") ? message : `${message}.`;
  }
  info(message, source = "SYSTEM") {
    const datetime = /* @__PURE__ */ new Date();
    const formatted = this.formatMessage(message);
    const timeStr = dayjs(datetime).format("HH:mm:ss");
    const levelTag = chalk.green.bold("INFO");
    const sourceTag = chalk.gray.bold(source);
    console.log(`${timeStr} [${levelTag}] [${sourceTag}] ${formatted}`);
    this.writeLog(datetime, "info", source, formatted);
  }
  error(message, source = "SYSTEM") {
    const datetime = /* @__PURE__ */ new Date();
    const formatted = this.formatMessage(message);
    const timeStr = dayjs(datetime).format("HH:mm:ss");
    const levelTag = chalk.red.bold("ERROR");
    const sourceTag = chalk.gray.bold(source);
    console.error(`${timeStr} [${levelTag}] [${sourceTag}] ${formatted}`);
    console.trace();
    this.writeLog(datetime, "error", source, formatted);
  }
  warn(message, source = "SYSTEM") {
    const datetime = /* @__PURE__ */ new Date();
    const formatted = this.formatMessage(message);
    const timeStr = dayjs(datetime).format("HH:mm:ss");
    const levelTag = chalk.yellow.bold("WARN");
    const sourceTag = chalk.gray.bold(source);
    console.warn(`${timeStr} [${levelTag}] [${sourceTag}] ${formatted}`);
    this.writeLog(datetime, "warning", source, formatted);
  }
  verbose(message, source = "SYSTEM") {
    const datetime = /* @__PURE__ */ new Date();
    const formatted = this.formatMessage(message);
    const timeStr = dayjs(datetime).format("HH:mm:ss");
    const levelTag = chalk.gray.bold("VERBOSE");
    const sourceTag = chalk.gray.bold(source);
    console.log(`${timeStr} [${levelTag}] [${sourceTag}] ${formatted}`);
    this.writeLog(datetime, "verbose", source, formatted);
  }
};
var createLogger = (options) => new Logger(options);

// src/utils/path.ts
import { app } from "electron";
import path2 from "path";
import fs2 from "fs";
var getPaths = (appName) => {
  const baseDir = path2.join(app.getPath("appData"), appName);
  const storage = path2.join(baseDir, "storage");
  const paths = {
    storage,
    database: path2.join(storage, "database.sqlite"),
    logs: path2.join(storage, "logs")
  };
  [storage, paths.logs].forEach((dir) => {
    if (!fs2.existsSync(dir)) {
      fs2.mkdirSync(dir, { recursive: true });
    }
  });
  return paths;
};
var getAppIconPath = (appPath, resourcesPath, isPackaged) => {
  if (isPackaged) {
    return path2.join(resourcesPath, "icon.ico");
  }
  return path2.join(appPath, "src/renderer/assets/genLogo/icon.ico");
};

// src/utils/i18n.ts
var I18n = class {
  currentLocale;
  translations;
  constructor(options) {
    this.translations = options.translations;
    this.currentLocale = options.initialLocale || "zh";
  }
  /**
   * Lightweight translation helper for the main process.
   */
  t(key, options) {
    const translations = this.translations[this.currentLocale];
    const keys = key.split(".");
    let result = translations;
    for (const k of keys) {
      if (result && typeof result === "object" && k in result) {
        result = result[k];
      } else {
        return key;
      }
    }
    if (typeof result !== "string") return key;
    if (options) {
      let finalString = result;
      for (const [optKey, optValue] of Object.entries(options)) {
        finalString = finalString.replace(new RegExp(`{{${optKey}}}`, "g"), String(optValue));
      }
      return finalString;
    }
    return result;
  }
  /**
   * Set the locale for the main process translations.
   */
  setLocale(locale) {
    this.currentLocale = locale;
  }
  getLocale() {
    return this.currentLocale;
  }
};
var createI18n = (options) => new I18n(options);

// src/preload/bridge.ts
import { contextBridge, ipcRenderer } from "electron";
var exposeElectronApi = (manifestRaw) => {
  const manifest = manifestRaw && typeof manifestRaw === "object" && "default" in manifestRaw ? manifestRaw.default : manifestRaw;
  const createRendererApi = (ipcManifest) => {
    const api = {};
    Object.entries(ipcManifest).forEach(([moduleName, methods]) => {
      api[moduleName] = {};
      Object.entries(methods).forEach(([methodName, meta]) => {
        if (meta.type === "event") {
          api[moduleName][methodName] = (listener) => {
            const eventChannel = `${meta.channel}:event`;
            const subscribeChannel = `${meta.channel}:subscribe`;
            const unsubscribeChannel = `${meta.channel}:unsubscribe`;
            const handler = (_event, payload) => listener(payload);
            ipcRenderer.on(eventChannel, handler);
            ipcRenderer.send(subscribeChannel);
            return () => {
              ipcRenderer.removeListener(eventChannel, handler);
              ipcRenderer.send(unsubscribeChannel);
            };
          };
          return;
        }
        api[moduleName][methodName] = (...args) => ipcRenderer.invoke(meta.channel, ...args);
      });
    });
    return api;
  };
  const electronApi = createRendererApi(manifest);
  contextBridge.exposeInMainWorld("electron", electronApi);
};
export {
  I18n,
  Logger,
  createEvent,
  createI18n,
  createLogger,
  exposeElectronApi,
  getAppIconPath,
  getPaths,
  registerEvent
};
//# sourceMappingURL=index.mjs.map