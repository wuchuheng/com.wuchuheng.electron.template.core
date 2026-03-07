import { describe, it, expect } from 'vitest';
import { I18n } from '../utils/i18n';

describe('I18n', () => {
  const translations = {
    zh: {
      welcome: '欢迎',
      user: {
        name: '用户名',
      },
      greet: '你好, {{name}}!',
    },
    en: {
      welcome: 'Welcome',
      user: {
        name: 'Username',
      },
      greet: 'Hello, {{name}}!',
    },
  };

  it('should translate simple keys', () => {
    const i18n = new I18n({ translations });
    expect(i18n.t('welcome')).toBe('欢迎');

    i18n.setLocale('en');
    expect(i18n.t('welcome')).toBe('Welcome');
  });

  it('should translate nested keys', () => {
    const i18n = new I18n({ translations });
    expect(i18n.t('user.name')).toBe('用户名');

    i18n.setLocale('en');
    expect(i18n.t('user.name')).toBe('Username');
  });

  it('should handle placeholders', () => {
    const i18n = new I18n({ translations });
    expect(i18n.t('greet', { name: 'World' })).toBe('你好, World!');

    i18n.setLocale('en');
    expect(i18n.t('greet', { name: 'World' })).toBe('Hello, World!');
  });

  it('should return the key if translation is missing', () => {
    const i18n = new I18n({ translations });
    expect(i18n.t('missing.key')).toBe('missing.key');
  });
});
