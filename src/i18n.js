import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import en from './locales/en.json';
import ta from './locales/ta.json';

// Use the stored language if available, otherwise default to Tamil
const storedLng = typeof window !== 'undefined' && localStorage.getItem('language') ? localStorage.getItem('language') : 'ta';

i18n
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: en },
      ta: { translation: ta },
    },
    lng: storedLng,
    fallbackLng: 'en',
    interpolation: { escapeValue: false },
  });

export default i18n;
