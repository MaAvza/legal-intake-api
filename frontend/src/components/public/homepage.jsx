import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import LoadingSpinner from '../components/shared/LoadingSpinner'
import Footer from '../components/shared/Footer'

function HomePage() {
  const { t, i18n } = useTranslation()
  const [articles, setArticles] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const isHebrew = i18n.language === 'he'

  useEffect(() => {
    fetchRecentArticles()
  }, [i18n.language])

  const fetchRecentArticles = async () => {
    try {
      setLoading(true)
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'
      const response = await fetch(`${API_URL}/blog/articles?language=${i18n.language}&limit=6`)
      
      if (!response.ok) throw new Error('Failed to fetch articles')
      
      const data = await response.json()
      setArticles(data)
    } catch (err) {
      console.error('Error fetching articles:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Hero Section */}
      <section 
        className="bg-gradient-to-br from-blue-600 to-blue-800 text-white py-20" 
        dir={isHebrew ? 'rtl' : 'ltr'}
      >
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-5xl font-bold mb-6">
              {isHebrew ? 'שירותים משפטיים מקצועיים' : 'Профессиональные юридические услуги'}
            </h1>
            <p className="text-xl mb-8 text-blue-100">
              {isHebrew 
                ? 'אנו כאן כדי לעזור לך בכל שאלה משפטית. ייעוץ מקצועי, מסור ואמין.'
                : 'Мы здесь, чтобы помочь вам с любым юридическим вопросом. Профессиональная, надежная консультация.'
              }
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <a 
                href="/contact" 
                className="btn btn-primary bg-white text-blue-600 hover:bg-blue-50 px-8 py-3 text-lg"
              >
                {isHebrew ? 'צור קשר' : 'Связаться'}
              </a>
              <a 
                href="#articles" 
                className="btn btn-outline border-white text-white hover:bg-white hover:text-blue-600 px-8 py-3 text-lg"
              >
                {isHebrew ? 'מאמרים משפטיים' : 'Юридические статьи'}
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Practice Areas Section */}
      <section className="py-16 bg-white" dir={isHebrew ? 'rtl' : 'ltr'}>
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center text-gray-800 mb-12">
            {isHebrew ? 'תחומי התמחות' : 'Области практики'}
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <PracticeAreaCard
              icon="⚖️"
              title={isHebrew ? 'דיני עבודה' : 'Трудовое право'}
              description={isHebrew 
                ? 'ייצוג עובדים ומעסיקים, פיטורים, פיצויים, תביעות עבודה'
                : 'Представительство работников и работодателей, увольнения, компенсации'
              }
            />
            <PracticeAreaCard
              icon="👨‍👩‍👧‍👦"
              title={isHebrew ? 'דיני משפחה' : 'Семейное право'}
              description={isHebrew 
                ? 'גירושין, משמורת ילדים, מזונות, הסכמי ממון'
                : 'Разводы, опека над детьми, алименты, брачные договоры'
              }
            />
            <PracticeAreaCard
              icon="🏢"
              title={isHebrew ? 'דיני נדל"ן' : 'Недвижимость'}
              description={isHebrew 
                ? 'קניית ומכירת נכסים, חוזי שכירות, סכסוכי דיירים'
                : 'Покупка и продажа недвижимости, договоры аренды, споры'
              }
            />
          </div>
        </div>
      </section>

      {/* Recent Articles Section */}
      <section id="articles" className="py-16 bg-gray-50" dir={isHebrew ? 'rtl' : 'ltr'}>
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-12">
            <h2 className="text-3xl font-bold text-gray-800">
              {isHebrew ? 'מאמרים אחרונים' : 'Последние статьи'}
            </h2>
            <a 
              href="/articles" 
              className="text-blue-600 hover:text-blue-800 font-medium"
            >
              {isHebrew ? 'כל המאמרים ←' : 'Все статьи →'}
            </a>
          </div>

          {loading ? (
            <div className="flex justify-center py-12">
              <LoadingSpinner size="lg" text={isHebrew ? 'טוען מאמרים...' : 'Загрузка статей...'} />
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <p className="text-red-600 mb-4">
                {isHebrew ? 'שגיאה בטעינת המאמרים' : 'Ошибка загрузки статей'}
              </p>
              <button 
                onClick={fetchRecentArticles}
                className="btn btn-primary"
              >
                {isHebrew ? 'נסה שוב' : 'Попробовать снова'}
              </button>
            </div>
          ) : articles.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-lg shadow">
              <p className="text-gray-600 text-lg">
                {isHebrew ? 'אין מאמרים זמינים כרגע' : 'Статей пока нет'}
              </p>
              <p className="text-gray-500 text-sm mt-2">
                {isHebrew ? 'חזור בקרוב לעוד תוכן משפטי' : 'Скоро здесь появятся статьи'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {articles.map(article => (
                <ArticleCard key={article.id} article={article} isHebrew={isHebrew} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-blue-600 text-white" dir={isHebrew ? 'rtl' : 'ltr'}>
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">
            {isHebrew ? 'זקוק לייעוץ משפטי?' : 'Нужна юридическая консультация?'}
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            {isHebrew 
              ? 'צור קשר עוד היום לייעוץ ראשוני ללא התחייבות'
              : 'Свяжитесь с нами сегодня для первичной консультации без обязательств'
            }
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <a 
              href="/contact" 
              className="btn btn-primary bg-white text-blue-600 hover:bg-blue-50 px-8 py-3 text-lg"
            >
              {isHebrew ? 'שלח פנייה' : 'Отправить запрос'}
            </a>
            <a 
              href="tel:+972501234567" 
              className="btn btn-outline border-white text-white hover:bg-white hover:text-blue-600 px-8 py-3 text-lg"
            >
              📞 {isHebrew ? 'התקשר עכשיו' : 'Позвонить сейчас'}
            </a>
          </div>
        </div>
      </section>

      {/* Trust Indicators */}
      <section className="py-16 bg-white" dir={isHebrew ? 'rtl' : 'ltr'}>
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center">
            <TrustIndicator
              number="15+"
              label={isHebrew ? 'שנות ניסיון' : 'Лет опыта'}
            />
            <TrustIndicator
              number="500+"
              label={isHebrew ? 'לקוחות מרוצים' : 'Довольных клиентов'}
            />
            <TrustIndicator
              number="95%"
              label={isHebrew ? 'תיקים שזכו' : 'Выигранных дел'}
            />
            <TrustIndicator
              number="24/7"
              label={isHebrew ? 'זמינות' : 'Доступность'}
            />
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}

// Sub-components

function PracticeAreaCard({ icon, title, description }) {
  return (
    <div className="card hover:shadow-lg transition-shadow">
      <div className="text-5xl mb-4">{icon}</div>
      <h3 className="text-xl font-bold text-gray-800 mb-3">{title}</h3>
      <p className="text-gray-600 leading-relaxed">{description}</p>
    </div>
  )
}

function ArticleCard({ article, isHebrew }) {
  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString(isHebrew ? 'he-IL' : 'ru-RU', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  return (
    <article className="article-card">
      <div className="article-card-header">
        <div className="flex items-center gap-2 mb-3">
          <span className="badge badge-primary">{article.category}</span>
          <span className="text-xs text-gray-500">
            {formatDate(article.published_at || article.created_at)}
          </span>
        </div>
        <h3 className="article-card-title hover:text-blue-600 transition">
          <a href={`/articles/${article.slug}`}>{article.title}</a>
        </h3>
        <p className="article-card-excerpt">{article.excerpt}</p>
      </div>
      
      <div className="article-card-footer">
        <div className="flex items-center gap-4 text-sm text-gray-500">
          <span className="flex items-center gap-1">
            👁️ {article.view_count || 0}
          </span>
        </div>
        <a 
          href={`/articles/${article.slug}`}
          className="btn btn-outline btn-sm"
        >
          {isHebrew ? 'קרא עוד' : 'Читать далее'} →
        </a>
      </div>
    </article>
  )
}

function TrustIndicator({ number, label }) {
  return (
    <div className="p-6">
      <div className="text-4xl font-bold text-blue-600 mb-2">{number}</div>
      <div className="text-gray-600 font-medium">{label}</div>
    </div>
  )
}

export default HomePage