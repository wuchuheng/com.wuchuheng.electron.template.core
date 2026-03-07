import chalk from 'chalk';
import dayjs from 'dayjs';
import fs from 'node:fs';
import path from 'node:path';

// Force chalk to use colors even on Windows terminals
if (chalk.level === 0) {
  chalk.level = 1;
}

export type LogSource = 'SYSTEM' | 'DEVICE' | string;
export type LogLevel = 'info' | 'error' | 'warning' | 'verbose';

export interface LoggerOptions {
  logDir: string;
}

export class Logger {
  private logDir: string;

  constructor(options: LoggerOptions) {
    this.logDir = options.logDir;
  }

  private getDailyLogDir(): string {
    const dailyDir = path.join(this.logDir, dayjs().format('YYYY-MM-DD'));
    if (!fs.existsSync(dailyDir)) {
      fs.mkdirSync(dailyDir, { recursive: true });
    }
    return dailyDir;
  }

  private getLogFile(level: LogLevel): string {
    const logFile = path.join(this.getDailyLogDir(), `${level}.log`);
    if (!fs.existsSync(logFile)) {
      fs.writeFileSync(logFile, '');
    }
    return logFile;
  }

  private writeLog(datetime: Date, level: LogLevel, source: LogSource, message: string): void {
    const logFile = this.getLogFile(level);
    const timeStr = dayjs(datetime).format('HH:mm:ss');
    const text = `${timeStr} ["${level}"] [${source}] ${message}\n`;
    fs.appendFileSync(logFile, text);
  }

  private formatMessage(message: string): string {
    return message.endsWith('.') ? message : `${message}.`;
  }

  info(message: string, source: LogSource = 'SYSTEM'): void {
    const datetime = new Date();
    const formatted = this.formatMessage(message);
    const timeStr = dayjs(datetime).format('HH:mm:ss');
    const levelTag = chalk.green.bold('INFO');
    const sourceTag = chalk.gray.bold(source);

    console.log(`${timeStr} [${levelTag}] [${sourceTag}] ${formatted}`);
    this.writeLog(datetime, 'info', source, formatted);
  }

  error(message: string, source: LogSource = 'SYSTEM'): void {
    const datetime = new Date();
    const formatted = this.formatMessage(message);
    const timeStr = dayjs(datetime).format('HH:mm:ss');
    const levelTag = chalk.red.bold('ERROR');
    const sourceTag = chalk.gray.bold(source);

    console.error(`${timeStr} [${levelTag}] [${sourceTag}] ${formatted}`);
    console.trace();
    this.writeLog(datetime, 'error', source, formatted);
  }

  warn(message: string, source: LogSource = 'SYSTEM'): void {
    const datetime = new Date();
    const formatted = this.formatMessage(message);
    const timeStr = dayjs(datetime).format('HH:mm:ss');
    const levelTag = chalk.yellow.bold('WARN');
    const sourceTag = chalk.gray.bold(source);

    console.warn(`${timeStr} [${levelTag}] [${sourceTag}] ${formatted}`);
    this.writeLog(datetime, 'warning', source, formatted);
  }

  verbose(message: string, source: LogSource = 'SYSTEM'): void {
    const datetime = new Date();
    const formatted = this.formatMessage(message);
    const timeStr = dayjs(datetime).format('HH:mm:ss');
    const levelTag = chalk.gray.bold('VERBOSE');
    const sourceTag = chalk.gray.bold(source);

    console.log(`${timeStr} [${levelTag}] [${sourceTag}] ${formatted}`);
    this.writeLog(datetime, 'verbose', source, formatted);
  }
}

// Export a singleton factory for easy usage or let users instantiate their own
export const createLogger = (options: LoggerOptions) => new Logger(options);
