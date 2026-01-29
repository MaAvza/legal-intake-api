import { useTranslation } from 'react-i18next'

function Footer() {
  const { t, i18n } = useTranslation()
  const isHebrew = i18n.language === 'he'

  return (
    <footer className="bg-gray-800 text-white py-12 mt-auto" dir={isHebrew ? 'rtl' : 'ltr'}>
      <div className="container mx-auto px-4">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          {/* About */}
          <div>
            <h3 className="text-lg font-bold mb-4">
              {isHebrew ? 'אודות' : 'О нас'}
            </h3>
            <p className="text-gray-300 text-sm leading-relaxed">
              {isHebrew 
                ? 'משרד עורכי דין מקצועי המתמחה במגוון רחב של תחומי משפט. אנו כאן כדי לעזור לך.'
                : 'Профессиональная юридическая фирма, специализирующаяся на широком спектре правовых областей. Мы здесь, чтобы помочь вам.'
              }
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-bold mb-4">
              {isHebrew ? 'קישורים מהירים' : 'Быстрые ссылки'}
            </h3>
            <ul className="space-y-2">
              <li>
                <a href="/" className="text-gray-300 hover:text-white transition text-sm">
                  {isHebrew ? 'דף הבית' : 'Главная'}
                </a>
              </li>
              <li>
                <a href="/about" className="text-gray-300 hover:text-white transition text-sm">
                  {isHebrew ? 'אודות' : 'О нас'}
                </a>
              </li>
              <li>
                <a href="/contact" className="text-gray-300 hover:text-white transition text-sm">
                  {isHebrew ? 'צור קשר' : 'Контакты'}
                </a>
              </li>
              <li>
                <a 
                  href="https://www.israelbar.biz/login/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-gray-300 hover:text-white transition text-sm"
                >
                  {isHebrew ? 'לשכת עורכי הדין' : 'Палата адвокатов'}
                </a>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-lg font-bold mb-4">
              {isHebrew ? 'יצירת קשר' : 'Контакты'}
            </h3>
            <ul className="space-y-2 text-sm text-gray-300">
              <li className="flex items-center gap-2">
                <span>📧</span>
                <a href="mailto:info@advocate-online.co.il" className="hover:text-white transition">
                  info@advocate-online.co.il
                </a>
              </li>
              <li className="flex items-center gap-2">
                <span>📞</span>
                <span>[מספר טלפון]</span>
              </li>
              <li className="flex items-center gap-2">
                <span>📍</span>
                <span>{isHebrew ? '[כתובת המשרד]' : '[Адрес офиса]'}</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Legal Links */}
        <div className="border-t border-gray-700 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            {/* Copyright */}
            <p className="text-sm text-gray-400">
              © 2026 advocate-online.co.il - {isHebrew ? 'כל הזכויות שמורות' : 'Все права защищены'}
            </p>

            {/* Legal Links */}
            <div className="flex flex-wrap gap-6 text-sm">
              <a href="/privacy-policy" className="text-gray-400 hover:text-white transition">
                {isHebrew ? 'מדיניות פרטיות' : 'Политика конфиденциальности'}
              </a>
              <a href="/terms-of-service" className="text-gray-400 hover:text-white transition">
                {isHebrew ? 'תנאי שימוש' : 'Условия использования'}
              </a>
              <a href="/cookie-policy" className="text-gray-400 hover:text-white transition">
                {isHebrew ? 'מדיניות עוגיות' : 'Политика cookies'}
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer