import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { Logger } from '../utils/logger';
import fs from 'node:fs';
import path from 'node:path';
import dayjs from 'dayjs';

describe('Logger', () => {
  const testLogDir = path.join(__dirname, 'test-logs');

  beforeEach(() => {
    if (fs.existsSync(testLogDir)) {
      fs.rmSync(testLogDir, { recursive: true, force: true });
    }
    fs.mkdirSync(testLogDir, { recursive: true });
  });

  afterEach(() => {
    if (fs.existsSync(testLogDir)) {
      fs.rmSync(testLogDir, { recursive: true, force: true });
    }
  });

  it('should create daily log directory and write log files', () => {
    const logger = new Logger({ logDir: testLogDir });
    const message = 'Test info message';

    logger.info(message);

    const dailyDir = path.join(testLogDir, dayjs().format('YYYY-MM-DD'));
    const logFile = path.join(dailyDir, 'info.log');

    expect(fs.existsSync(logFile)).toBe(true);
    const content = fs.readFileSync(logFile, 'utf-8');
    expect(content).toContain('["info"]');
    expect(content).toContain('[SYSTEM]');
    expect(content).toContain(message);
  });

  it('should append dots to messages if missing', () => {
    const logger = new Logger({ logDir: testLogDir });
    logger.info('Message without dot');

    const dailyDir = path.join(testLogDir, dayjs().format('YYYY-MM-DD'));
    const logFile = path.join(dailyDir, 'info.log');
    const content = fs.readFileSync(logFile, 'utf-8');
    expect(content).toContain('Message without dot.');
  });
});
