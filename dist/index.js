"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/index.ts
var index_exports = {};
__export(index_exports, {
  I18n: () => I18n,
  Logger: () => Logger,
  createEvent: () => createEvent,
  createI18n: () => createI18n,
  createLogger: () => createLogger,
  exposeElectronApi: () => exposeElectronApi,
  getAppIconPath: () => getAppIconPath,
  getPaths: () => getPaths,
  registerEvent: () => registerEvent
});
module.exports = __toCommonJS(index_exports);

// src/ipc/helper.ts
var import_electron = require("electron");
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
  import_electron.ipcMain.on(subscribeChannel, (event) => {
    const sender = event.sender;
    subscribers.add(sender);
    sender.once("destroyed", () => {
      subscribers.delete(sender);
    });
  });
  import_electron.ipcMain.on(unsubscribeChannel, (event) => {
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
var import_chalk = __toESM(require("chalk"));
var import_dayjs = __toESM(require("dayjs"));
var import_node_fs = __toESM(require("fs"));
var import_node_path = __toESM(require("path"));
if (import_chalk.default.level === 0) {
  import_chalk.default.level = 1;
}
var Logger = class {
  logDir;
  constructor(options) {
    this.logDir = options.logDir;
  }
  getDailyLogDir() {
    const dailyDir = import_node_path.default.join(this.logDir, (0, import_dayjs.default)().format("YYYY-MM-DD"));
    if (!import_node_fs.default.existsSync(dailyDir)) {
      import_node_fs.default.mkdirSync(dailyDir, { recursive: true });
    }
    return dailyDir;
  }
  getLogFile(level) {
    const logFile = import_node_path.default.join(this.getDailyLogDir(), `${level}.log`);
    if (!import_node_fs.default.existsSync(logFile)) {
      import_node_fs.default.writeFileSync(logFile, "");
    }
    return logFile;
  }
  writeLog(datetime, level, source, message) {
    const logFile = this.getLogFile(level);
    const timeStr = (0, import_dayjs.default)(datetime).format("HH:mm:ss");
    const text = `${timeStr} ["${level}"] [${source}] ${message}
`;
    import_node_fs.default.appendFileSync(logFile, text);
  }
  formatMessage(message) {
    return message.endsWith(".") ? message : `${message}.`;
  }
  info(message, source = "SYSTEM") {
    const datetime = /* @__PURE__ */ new Date();
    const formatted = this.formatMessage(message);
    const timeStr = (0, import_dayjs.default)(datetime).format("HH:mm:ss");
    const levelTag = import_chalk.default.green.bold("INFO");
    const sourceTag = import_chalk.default.gray.bold(source);
    console.log(`${timeStr} [${levelTag}] [${sourceTag}] ${formatted}`);
    this.writeLog(datetime, "info", source, formatted);
  }
  error(message, source = "SYSTEM") {
    const datetime = /* @__PURE__ */ new Date();
    const formatted = this.formatMessage(message);
    const timeStr = (0, import_dayjs.default)(datetime).format("HH:mm:ss");
    const levelTag = import_chalk.default.red.bold("ERROR");
    const sourceTag = import_chalk.default.gray.bold(source);
    console.error(`${timeStr} [${levelTag}] [${sourceTag}] ${formatted}`);
    console.trace();
    this.writeLog(datetime, "error", source, formatted);
  }
  warn(message, source = "SYSTEM") {
    const datetime = /* @__PURE__ */ new Date();
    const formatted = this.formatMessage(message);
    const timeStr = (0, import_dayjs.default)(datetime).format("HH:mm:ss");
    const levelTag = import_chalk.default.yellow.bold("WARN");
    const sourceTag = import_chalk.default.gray.bold(source);
    console.warn(`${timeStr} [${levelTag}] [${sourceTag}] ${formatted}`);
    this.writeLog(datetime, "warning", source, formatted);
  }
  verbose(message, source = "SYSTEM") {
    const datetime = /* @__PURE__ */ new Date();
    const formatted = this.formatMessage(message);
    const timeStr = (0, import_dayjs.default)(datetime).format("HH:mm:ss");
    const levelTag = import_chalk.default.gray.bold("VERBOSE");
    const sourceTag = import_chalk.default.gray.bold(source);
    console.log(`${timeStr} [${levelTag}] [${sourceTag}] ${formatted}`);
    this.writeLog(datetime, "verbose", source, formatted);
  }
};
var createLogger = (options) => new Logger(options);

// src/utils/path.ts
var import_electron2 = require("electron");
var import_node_path2 = __toESM(require("path"));
var import_node_fs2 = __toESM(require("fs"));
var getPaths = (appName) => {
  const baseDir = import_node_path2.default.join(import_electron2.app.getPath("appData"), appName);
  const storage = import_node_path2.default.join(baseDir, "storage");
  const paths = {
    storage,
    database: import_node_path2.default.join(storage, "database.sqlite"),
    logs: import_node_path2.default.join(storage, "logs")
  };
  [storage, paths.logs].forEach((dir) => {
    if (!import_node_fs2.default.existsSync(dir)) {
      import_node_fs2.default.mkdirSync(dir, { recursive: true });
    }
  });
  return paths;
};
var getAppIconPath = (appPath, resourcesPath, isPackaged) => {
  if (isPackaged) {
    return import_node_path2.default.join(resourcesPath, "icon.ico");
  }
  return import_node_path2.default.join(appPath, "src/renderer/assets/genLogo/icon.ico");
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
var import_electron3 = require("electron");
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
            import_electron3.ipcRenderer.on(eventChannel, handler);
            import_electron3.ipcRenderer.send(subscribeChannel);
            return () => {
              import_electron3.ipcRenderer.removeListener(eventChannel, handler);
              import_electron3.ipcRenderer.send(unsubscribeChannel);
            };
          };
          return;
        }
        api[moduleName][methodName] = (...args) => import_electron3.ipcRenderer.invoke(meta.channel, ...args);
      });
    });
    return api;
  };
  const electronApi = createRendererApi(manifest);
  import_electron3.contextBridge.exposeInMainWorld("electron", electronApi);
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  I18n,
  Logger,
  createEvent,
  createI18n,
  createLogger,
  exposeElectronApi,
  getAppIconPath,
  getPaths,
  registerEvent
});
//# sourceMappingURL=index.js.map