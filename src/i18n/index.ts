import i18next from 'i18next';
import { initReactI18next } from 'react-i18next';
import { resources } from './resources';

const storedLanguage = localStorage.getItem('png-grid-language') ?? 'uk';

void i18next.use(initReactI18next).init({
  resources,
  lng: storedLanguage,
  fallbackLng: 'uk',
  interpolation: {
    escapeValue: false
  }
});

export { i18next };
