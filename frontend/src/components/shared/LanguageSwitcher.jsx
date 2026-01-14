import { useTranslation } from 'react-i18next'
import { useEffect } from 'react'

function LanguageSwitcher() {
  const { i18n } = useTranslation()

  // Set document direction on mount and language change
  useEffect(() => {
    const direction = i18n.language === 'he' ? 'rtl' : 'ltr'
    document.documentElement.dir = direction
    document.documentElement.lang = i18n.language
  }, [i18n.language])

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng)
  }

  return (
    <div className="flex gap-2">
      <button
        onClick={() => changeLanguage('he')}
        className={`px-4 py-2 rounded-lg font-medium transition-all ${
          i18n.language === 'he'
            ? 'bg-blue-600 text-white shadow-md'
            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
        }`}
        aria-label="Switch to Hebrew"
      >
        עברית
      </button>
      <button
        onClick={() => changeLanguage('ru')}
        className={`px-4 py-2 rounded-lg font-medium transition-all ${
          i18n.language === 'ru'
            ? 'bg-blue-600 text-white shadow-md'
            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
        }`}
        aria-label="Switch to Russian"
      >
        Русский
      </button>
    </div>
  )
}

export default LanguageSwitcher
