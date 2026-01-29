import { useTranslation } from 'react-i18next'
import { useEffect } from 'react'

function LanguageSwitcher() {
  const { i18n } = useTranslation()

  useEffect(() => {
    // Update HTML lang attribute when language changes
    document.documentElement.lang = i18n.language
  }, [i18n.language])

  const changeLanguage = (lang) => {
    i18n.changeLanguage(lang)
    // Save to localStorage
    localStorage.setItem('i18nextLng', lang)
  }

  const currentLang = i18n.language

  return (
    <div className="flex items-center gap-2 bg-gray-100 rounded-lg p-1">
      <button
        onClick={() => changeLanguage('he')}
        className={`px-3 py-2 rounded-md text-sm font-medium transition ${
          currentLang === 'he'
            ? 'bg-white text-blue-600 shadow-sm'
            : 'text-gray-600 hover:text-gray-900'
        }`}
      >
        עברית
      </button>
      <button
        onClick={() => changeLanguage('ru')}
        className={`px-3 py-2 rounded-md text-sm font-medium transition ${
          currentLang === 'ru'
            ? 'bg-white text-blue-600 shadow-sm'
            : 'text-gray-600 hover:text-gray-900'
        }`}
      >
        Русский
      </button>
    </div>
  )
}

export default LanguageSwitcher