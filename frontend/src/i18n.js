import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";

// Import translations
import enTranslation from './locales/en/translation.json';
import frTranslation from './locales/fr/translation.json';
import arTranslation from './locales/ar/translation.json';

// Configure i18next
i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: enTranslation },
      fr: { translation: frTranslation },
      ar: { 
        translation: arTranslation,
        dir: 'rtl' // Set RTL for Arabic
      }
    },
    lng: localStorage.getItem('i18nextLng') || 'en',
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false
    }
  });

// Function to set document direction based on language
// export const setDocumentDirection = (lng) => {
//   const dir = lng === 'ar' ? 'rtl' : 'ltr';
//   document.documentElement.dir = dir;
//   document.documentElement.lang = lng;
//   document.body.style.direction = dir;
//   document.body.style.textAlign = lng === 'ar' ? 'right' : 'left';
// };

// Set initial direction
i18n.on('languageChanged', (lng) => {
//   setDocumentDirection(lng);
  localStorage.setItem('i18nextLng', lng);
});

// Set initial direction on load
// setDocumentDirection(i18n.language);

export default i18n;
