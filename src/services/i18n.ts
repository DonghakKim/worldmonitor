import i18next from 'i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import enTranslation from '../locales/en.json';

type TranslationDictionary = Record<string, unknown>;

const SUPPORTED_LANGUAGES = ['en', 'cs', 'fr', 'de', 'el', 'es', 'it', 'pl', 'pt', 'nl', 'sv', 'ru', 'ar', 'zh', 'ja', 'ko', 'tr', 'th', 'vi'] as const;
type SupportedLanguage = typeof SUPPORTED_LANGUAGES[number];

const SUPPORTED_LANGUAGE_SET = new Set<SupportedLanguage>(SUPPORTED_LANGUAGES);
const loadedLanguages = new Set<SupportedLanguage>();

const localeModules = import.meta.glob<TranslationDictionary>(
  ['../locales/*.json', '!../locales/en.json'],
  { import: 'default' },
);

const RTL_LANGUAGES = new Set(['ar']);

function normalizeLanguage(lng: string): SupportedLanguage {
  const base = (lng || 'ko').split('-')[0]?.toLowerCase() || 'ko';
  if (SUPPORTED_LANGUAGE_SET.has(base as SupportedLanguage)) {
    return base as SupportedLanguage;
  }
  return 'ko';
}

function applyDocumentDirection(lang: string): void {
  const base = lang.split('-')[0] || lang;
  document.documentElement.setAttribute('lang', base === 'zh' ? 'zh-CN' : base);
  if (RTL_LANGUAGES.has(base)) {
    document.documentElement.setAttribute('dir', 'rtl');
  } else {
    document.documentElement.removeAttribute('dir');
  }
}

async function ensureLanguageLoaded(lng: string): Promise<SupportedLanguage> {
  const normalized = normalizeLanguage(lng);
  if (loadedLanguages.has(normalized) && i18next.hasResourceBundle(normalized, 'translation')) {
    return normalized;
  }

  let translation: TranslationDictionary;
  if (normalized === 'en') {
    translation = enTranslation as TranslationDictionary;
  } else {
    const loader = localeModules[`../locales/${normalized}.json`];
    if (!loader) {
      console.warn(`No locale file for "${normalized}", falling back to English`);
      translation = enTranslation as TranslationDictionary;
    } else {
      translation = await loader();
    }
  }

  i18next.addResourceBundle(normalized, 'translation', translation, true, true);
  loadedLanguages.add(normalized);
  return normalized;
}

export async function initI18n(): Promise<void> {
  if (i18next.isInitialized) {
    const currentLanguage = normalizeLanguage(i18next.language || 'ko');
    await ensureLanguageLoaded(currentLanguage);
    applyDocumentDirection(i18next.language || currentLanguage);
    return;
  }

  loadedLanguages.add('en');

  await i18next
    .use(LanguageDetector)
    .init({
      resources: {
        en: { translation: enTranslation as TranslationDictionary },
      },
      supportedLngs: [...SUPPORTED_LANGUAGES],
      nonExplicitSupportedLngs: true,
      fallbackLng: 'ko',
      debug: import.meta.env.DEV,
      interpolation: {
        escapeValue: false,
      },
      detection: {
        order: ['querystring', 'localStorage'],
        lookupQuerystring: 'lang',
        caches: ['localStorage'],
      },
    });

  const detectedLanguage = await ensureLanguageLoaded(i18next.language || 'ko');
  if (detectedLanguage !== 'ko') {
    await i18next.changeLanguage(detectedLanguage);
  }

  applyDocumentDirection(i18next.language || detectedLanguage);
}

export function t(key: string, options?: Record<string, unknown>): string {
  return i18next.t(key, options);
}

export async function changeLanguage(lng: string): Promise<void> {
  const normalized = await ensureLanguageLoaded(lng);
  await i18next.changeLanguage(normalized);
  applyDocumentDirection(normalized);
  window.location.reload();
}

export function getCurrentLanguage(): string {
  const lang = i18next.language || 'ko';
  return lang.split('-')[0]!;
}

export function isRTL(): boolean {
  return RTL_LANGUAGES.has(getCurrentLanguage());
}

export function getLocale(): string {
  const lang = getCurrentLanguage();
  const map: Record<string, string> = {
    en: 'en-US',
    cs: 'cs-CZ',
    el: 'el-GR',
    zh: 'zh-CN',
    pt: 'pt-BR',
    ja: 'ja-JP',
    ko: 'ko-KR',
    tr: 'tr-TR',
    th: 'th-TH',
    vi: 'vi-VN',
  };
  return map[lang] || lang;
}

export const LANGUAGES = [
  { code: 'ko', label: 'Korean', flag: 'KR' },
  { code: 'en', label: 'English', flag: 'EN' },
  { code: 'ar', label: 'Arabic', flag: 'AR' },
  { code: 'cs', label: 'Czech', flag: 'CZ' },
  { code: 'zh', label: 'Chinese', flag: 'CN' },
  { code: 'fr', label: 'French', flag: 'FR' },
  { code: 'de', label: 'German', flag: 'DE' },
  { code: 'el', label: 'Greek', flag: 'GR' },
  { code: 'es', label: 'Spanish', flag: 'ES' },
  { code: 'it', label: 'Italian', flag: 'IT' },
  { code: 'pl', label: 'Polish', flag: 'PL' },
  { code: 'pt', label: 'Portuguese', flag: 'PT' },
  { code: 'nl', label: 'Dutch', flag: 'NL' },
  { code: 'sv', label: 'Swedish', flag: 'SE' },
  { code: 'ru', label: 'Russian', flag: 'RU' },
  { code: 'ja', label: 'Japanese', flag: 'JP' },
  { code: 'th', label: 'Thai', flag: 'TH' },
  { code: 'tr', label: 'Turkish', flag: 'TR' },
  { code: 'vi', label: 'Vietnamese', flag: 'VN' },
];
