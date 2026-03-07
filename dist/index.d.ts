type EventHandler<T = unknown> = ((payload: T) => void) & {
    _isEvent: true;
    _setDispatcher?: (dispatch: (payload: T) => void) => void;
};
/**
 * Creates an event trigger that can broadcast to subscribed renderer processes.
 * The loader will detect `_isEvent` and wire up subscriptions automatically.
 */
declare const createEvent: <T>() => EventHandler<T>;
/**
 * Registers an event channel with subscribe/unsubscribe handling and
 * dispatch wiring for the provided event trigger.
 */
declare const registerEvent: <T>(channel: string, eventFn: EventHandler<T>) => void;

type LogSource = 'SYSTEM' | 'DEVICE' | string;
type LogLevel = 'info' | 'error' | 'warning' | 'verbose';
interface LoggerOptions {
    logDir: string;
}
declare class Logger {
    private logDir;
    constructor(options: LoggerOptions);
    private getDailyLogDir;
    private getLogFile;
    private writeLog;
    private formatMessage;
    info(message: string, source?: LogSource): void;
    error(message: string, source?: LogSource): void;
    warn(message: string, source?: LogSource): void;
    verbose(message: string, source?: LogSource): void;
}
declare const createLogger: (options: LoggerOptions) => Logger;

interface AppPaths {
    database: string;
    logs: string;
    storage: string;
}
/**
 * Standardized utility for resolving all persistent data paths.
 * All paths are rooted in the Electron userData directory to ensure
 * persistence across application updates.
 */
declare const getPaths: (appName: string) => AppPaths;
/**
 * Resolves the absolute path to the application icon.
 */
declare const getAppIconPath: (appPath: string, resourcesPath: string, isPackaged: boolean) => string;

type Translations = Record<string, any>;
interface I18nOptions {
    translations: {
        zh: Translations;
        en: Translations;
    };
    initialLocale?: 'zh' | 'en';
}
declare class I18n {
    private currentLocale;
    private translations;
    constructor(options: I18nOptions);
    /**
     * Lightweight translation helper for the main process.
     */
    t(key: string, options?: Record<string, string | number>): string;
    /**
     * Set the locale for the main process translations.
     */
    setLocale(locale: 'zh' | 'en'): void;
    getLocale(): 'zh' | 'en';
}
declare const createI18n: (options: I18nOptions) => I18n;

interface ManifestEntry {
    channel: string;
    type: 'invoke' | 'event';
}
type IpcManifest = Record<string, Record<string, ManifestEntry>>;
/**
 * Dynamically creates a renderer API from the provided IPC manifest and
 * exposes it to the browser's global scope.
 */
declare const exposeElectronApi: (manifestRaw: unknown) => void;

export { type AppPaths, type EventHandler, I18n, type I18nOptions, type IpcManifest, type LogLevel, type LogSource, Logger, type LoggerOptions, type ManifestEntry, type Translations, createEvent, createI18n, createLogger, exposeElectronApi, getAppIconPath, getPaths, registerEvent };
