import { useTranslation } from 'react-i18next'
import LanguageSwitcher from './LanguageSwitcher'

function Header() {
  const { t } = useTranslation()
  
  return (
    <header className="bg-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">
          {t('header.title')}
        </h1>
        <div className="flex items-center gap-4">
          <LanguageSwitcher />
          <button className="text-blue-600 hover:text-blue-800 font-medium">
            {t('header.login')}
          </button>
        </div>
      </div>
    </header>
  )
}

export default Header