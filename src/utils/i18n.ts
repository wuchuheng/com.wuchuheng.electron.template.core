export type Translations = Record<string, any>;

export interface I18nOptions {
  translations: {
    zh: Translations;
    en: Translations;
  };
  initialLocale?: 'zh' | 'en';
}

export class I18n {
  private currentLocale: 'zh' | 'en';
  private translations: { zh: Translations; en: Translations };

  constructor(options: I18nOptions) {
    this.translations = options.translations;
    this.currentLocale = options.initialLocale || 'zh';
  }

  /**
   * Lightweight translation helper for the main process.
   */
  t(key: string, options?: Record<string, string | number>): string {
    const translations = this.translations[this.currentLocale];

    // Navigate through the nested object using the dot-notation key (e.g., 'update.title')
    const keys = key.split('.');
    let result: any = translations;

    for (const k of keys) {
      if (result && typeof result === 'object' && k in result) {
        result = result[k];
      } else {
        return key; // Return the key itself if not found
      }
    }

    if (typeof result !== 'string') return key;

    // Basic placeholder replacement (e.g., {{version}} or {{appName}})
    if (options) {
      let finalString = result;
      for (const [optKey, optValue] of Object.entries(options)) {
        finalString = finalString.replace(new RegExp(`{{${optKey}}}`, 'g'), String(optValue));
      }
      return finalString;
    }

    return result;
  }

  /**
   * Set the locale for the main process translations.
   */
  setLocale(locale: 'zh' | 'en'): void {
    this.currentLocale = locale;
  }

  getLocale(): 'zh' | 'en' {
    return this.currentLocale;
  }
}

export const createI18n = (options: I18nOptions) => new I18n(options);
