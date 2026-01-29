import { useTranslation } from 'react-i18next'
import { useState } from 'react'
import LanguageSwitcher from './LanguageSwitcher'

function Header({ isAuthenticated = false, isAdmin = false }) {
  const { i18n } = useTranslation()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const isHebrew = i18n.language === 'he'

  const handleLogout = () => {
    localStorage.removeItem('access_token')
    localStorage.removeItem('user_role')
    localStorage.removeItem('user_email')
    window.location.href = '/'
  }

  return (
    <header className="bg-white shadow-md sticky top-0 z-50" dir={isHebrew ? 'rtl' : 'ltr'}>
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <a href="/" className="flex items-center gap-2">
            <span className="text-2xl">⚖️</span>
            <span className="text-xl font-bold text-gray-800">
              advocate-online
            </span>
          </a>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-6">
            <a href="/" className="text-gray-700 hover:text-blue-600 transition font-medium">
              {isHebrew ? 'דף הבית' : 'Главная'}
            </a>
            <a href="/about" className="text-gray-700 hover:text-blue-600 transition font-medium">
              {isHebrew ? 'אודות' : 'О нас'}
            </a>
            <a href="/contact" className="text-gray-700 hover:text-blue-600 transition font-medium">
              {isHebrew ? 'צור קשר' : 'Контакты'}
            </a>
            
            {isAdmin && (
              <a href="/admin" className="text-blue-600 hover:text-blue-800 transition font-medium">
                {isHebrew ? 'ניהול' : 'Управление'}
              </a>
            )}
          </nav>

          {/* Right Side Actions */}
          <div className="hidden md:flex items-center gap-4">
            <LanguageSwitcher />
            
            {isAuthenticated ? (
              <button
                onClick={handleLogout}
                className="px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition font-medium"
              >
                {isHebrew ? 'התנתק' : 'Выйти'}
              </button>
            ) : (
              <a
                href="/login"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
              >
                {isHebrew ? 'התחבר' : 'Войти'}
              </a>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {mobileMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t py-4 space-y-4">
            <a href="/" className="block text-gray-700 hover:text-blue-600 transition font-medium">
              {isHebrew ? 'דף הבית' : 'Главная'}
            </a>
            <a href="/about" className="block text-gray-700 hover:text-blue-600 transition font-medium">
              {isHebrew ? 'אודות' : 'О нас'}
            </a>
            <a href="/contact" className="block text-gray-700 hover:text-blue-600 transition font-medium">
              {isHebrew ? 'צור קשר' : 'Контакты'}
            </a>
            
            {isAdmin && (
              <a href="/admin" className="block text-blue-600 hover:text-blue-800 transition font-medium">
                {isHebrew ? 'ניהול' : 'Управление'}
              </a>
            )}

            <div className="pt-4 border-t">
              <LanguageSwitcher />
            </div>

            {isAuthenticated ? (
              <button
                onClick={handleLogout}
                className="w-full px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition font-medium text-left"
              >
                {isHebrew ? 'התנתק' : 'Выйти'}
              </button>
            ) : (
              <a
                href="/login"
                className="block w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium text-center"
              >
                {isHebrew ? 'התחבר' : 'Войти'}
              </a>
            )}
          </div>
        )}
      </div>
    </header>
  )
}

export default Header