import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";

// Import translations
import enTranslation from './locales/en/translation.json';
import frTranslation from './locales/fr/translation.json';
import arTranslation from './locales/ar/translation.json';
import { homeTranslations } from "./locales/homeTranslations";
import { storeTranslations } from "./locales/storeTranslations";
import { aboutTranslations } from "./locales/aboutTranslations";
import { productTranslations } from "./locales/productTranslations";
import { contactTranslations } from "./locales/contactTranslations";
import { discoverTranslations } from "./locales/discoverTranslations";
import { legalTranslations } from "./locales/legalTranslations";
import { cookieTranslations } from "./locales/cookieTranslations";

// Configure i18next
i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: { ...enTranslation, home: homeTranslations.en, store: storeTranslations.en, about: aboutTranslations.en, productDetails: productTranslations.en, contactPage: contactTranslations.en, discover: discoverTranslations.en, legal: legalTranslations.en, cookies: cookieTranslations.en } },
      fr: { translation: { ...frTranslation, home: homeTranslations.fr, store: storeTranslations.fr, about: aboutTranslations.fr, productDetails: productTranslations.fr, contactPage: contactTranslations.fr, discover: discoverTranslations.fr, legal: legalTranslations.fr, cookies: cookieTranslations.fr } },
      ar: {
        translation: { ...arTranslation, home: homeTranslations.ar, store: storeTranslations.ar, about: aboutTranslations.ar, productDetails: productTranslations.ar, contactPage: contactTranslations.ar, discover: discoverTranslations.ar, legal: legalTranslations.ar, cookies: cookieTranslations.ar },
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
