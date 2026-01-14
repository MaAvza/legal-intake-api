import { useTranslation } from 'react-i18next'

function Footer() {
  const { t } = useTranslation()
  
  return (
    <footer className="bg-gray-800 text-white py-8 mt-16">
      <div className="max-w-7xl mx-auto px-4 text-center">
        <div className="flex justify-center gap-8 mb-4">
          <a href="#" className="hover:text-blue-400 transition">
            {t('footer.privacy')}
          </a>
          <a href="#" className="hover:text-blue-400 transition">
            {t('footer.deleteData')}
          </a>
        </div>
        <p className="text-gray-400 text-sm">
          © 2026 
        </p>
      </div>
    </footer>
  )
}

export default Footer