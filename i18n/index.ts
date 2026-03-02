// ═══════════════════════════════════════
// 靈犀 多語言設定（i18n）
// 支援：繁體中文、簡體中文、日文、英文、德文、法文
// ═══════════════════════════════════════

import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import * as Localization from 'expo-localization';

import zhTW from './locales/zh-TW.json';
import zhCN from './locales/zh-CN.json';
import ja from './locales/ja.json';
import en from './locales/en.json';
import de from './locales/de.json';
import fr from './locales/fr.json';

// 支援的語系
export const SUPPORTED_LANGUAGES = {
  'zh-TW': { label: '繁體中文', nativeLabel: '繁體中文', flag: '🇹🇼' },
  'zh-CN': { label: '简体中文', nativeLabel: '简体中文', flag: '🇨🇳' },
  'ja':    { label: '日本語',   nativeLabel: '日本語',   flag: '🇯🇵' },
  'en':    { label: 'English',  nativeLabel: 'English',  flag: '🇺🇸' },
  'de':    { label: 'Deutsch',  nativeLabel: 'Deutsch',  flag: '🇩🇪' },
  'fr':    { label: 'Français', nativeLabel: 'Français', flag: '🇫🇷' },
} as const;

export type SupportedLanguage = keyof typeof SUPPORTED_LANGUAGES;

// 偵測用戶系統語言，對應到支援的語系
function detectLanguage(): SupportedLanguage {
  const deviceLocale = Localization.getLocales()[0]?.languageTag || 'en';

  // 精確匹配
  if (deviceLocale in SUPPORTED_LANGUAGES) {
    return deviceLocale as SupportedLanguage;
  }

  // 語言碼匹配（例如 zh-Hant-TW → zh-TW）
  const langCode = deviceLocale.split('-')[0];
  if (deviceLocale.includes('Hant') || deviceLocale.includes('TW') || deviceLocale.includes('HK')) return 'zh-TW';
  if (deviceLocale.includes('Hans') || deviceLocale.includes('CN')) return 'zh-CN';
  if (langCode === 'ja') return 'ja';
  if (langCode === 'de') return 'de';
  if (langCode === 'fr') return 'fr';
  if (langCode === 'zh') return 'zh-TW'; // 預設繁體

  return 'en'; // 其他語言預設英文
}

i18n
  .use(initReactI18next)
  .init({
    resources: {
      'zh-TW': { translation: zhTW },
      'zh-CN': { translation: zhCN },
      'ja':    { translation: ja },
      'en':    { translation: en },
      'de':    { translation: de },
      'fr':    { translation: fr },
    },
    lng: detectLanguage(),
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false,
    },
    react: {
      useSuspense: false,
    },
  });

export default i18n;
