import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import HttpBackend from 'i18next-http-backend'
import LanguageDetector from 'i18next-browser-languagedetector'

i18n
  // Load translations from public/locales/
  .use(HttpBackend)
  
  // Detect user language from:
  // 1. localStorage 
  // 2. Browser language setting
  .use(LanguageDetector)
  
  // Pass to React
  .use(initReactI18next)
  
  .init({
    // Default language
    fallbackLng: 'he',
    
    // Supported languages
    supportedLngs: ['he', 'ru'],
    
    // Enable console warnings during development
    debug: true,
    
    // Language detection settings
    detection: {
      // Check these in order:
      order: ['localStorage', 'navigator', 'htmlTag'],
      
      // Save selected language to:
      caches: ['localStorage'],
      
      // localStorage key name
      lookupLocalStorage: 'i18nextLng',
    },

    // React interpolation settings
    interpolation: {
      escapeValue: false, // React already escapes by default
    },

    // where to load translations
    backend: {
      loadPath: '/locales/{{lng}}/translation.json',
    },

    // Namespace settingsm- use default
    ns: ['translation'],
    defaultNS: 'translation',
  })

export default i18n