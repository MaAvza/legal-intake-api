import { useTranslation } from 'react-i18next'

function Hero() {
  const { t } = useTranslation()
  
  return (
    <div className="bg-gradient-to-br from-blue-600 to-purple-700 text-white py-20">
      <div className="max-w-7xl mx-auto px-4 text-center">
        <h1 className="text-5xl font-bold mb-4">
          {t('hero.welcome')}
        </h1>
        <p className="text-xl text-blue-100">
          {t('hero.subtitle')}
        </p>
      </div>
    </div>
  )
}

export default Hero