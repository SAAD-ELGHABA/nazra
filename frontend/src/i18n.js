import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";

// Import translations
import enTranslation from './locales/en/translation.json';
import frTranslation from './locales/fr/translation.json';
import arTranslation from './locales/ar/translation.json';
import { homeTranslations } from "./locales/homeTranslations";

// Configure i18next
i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: { ...enTranslation, home: homeTranslations.en } },
      fr: { translation: { ...frTranslation, home: homeTranslations.fr } },
      ar: { 
        translation: { ...arTranslation, home: homeTranslations.ar },
      }
    },
    lng: localStorage.getItem('i18nextLng') || 'fr',
    fallbackLng: 'fr',
    interpolation: {
      escapeValue: false
    }
  });

export const setDocumentDirection = (lng) => {
  const language = lng?.split("-")[0] || "fr";
  document.documentElement.dir = language === "ar" ? "rtl" : "ltr";
  document.documentElement.lang = language;
};

i18n.on('languageChanged', (lng) => {
  setDocumentDirection(lng);
  localStorage.setItem('i18nextLng', lng);
});

setDocumentDirection(i18n.language);

export default i18n;
