import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import Header from './components/shared/Header'
import HomePage from './pages/public/HomePage'
import CookieConsentBanner from './components/legal/CookieConsentBanner'

function App() {
  const { i18n } = useTranslation()
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isAdmin, setIsAdmin] = useState(false)
  const [currentPage, setCurrentPage] = useState('home')

  useEffect(() => {
    // Update HTML lang attribute
    document.documentElement.lang = i18n.language
  }, [i18n.language])

  useEffect(() => {
    // Check authentication status
    const token = localStorage.getItem('access_token')
    const role = localStorage.getItem('user_role')
    
    if (token) {
      setIsAuthenticated(true)
      setIsAdmin(role === 'admin')
    }

    // Handle basic routing based on URL hash
    const handleRouteChange = () => {
      const hash = window.location.hash.slice(1) || 'home'
      setCurrentPage(hash)
    }

    handleRouteChange()
    window.addEventListener('hashchange', handleRouteChange)
    
    return () => window.removeEventListener('hashchange', handleRouteChange)
  }, [])

  // Simple page rendering
  const renderPage = () => {
    switch(currentPage) {
      case 'home':
        return <HomePage />
      case 'about':
        return <AboutPage />
      case 'contact':
        return <ContactPage />
      case 'login':
        return <LoginPage setAuth={setIsAuthenticated} setIsAdmin={setIsAdmin} />
      case 'admin':
        return isAdmin ? <AdminDashboard onLogout={handleLogout} /> : <LoginPage setAuth={setIsAuthenticated} setIsAdmin={setIsAdmin} />
      default:
        return <HomePage />
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('access_token')
    localStorage.removeItem('user_role')
    localStorage.removeItem('user_email')
    setIsAuthenticated(false)
    setIsAdmin(false)
    window.location.hash = '#home'
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header 
        isAuthenticated={isAuthenticated} 
        isAdmin={isAdmin}
      />
      
      <main className="flex-grow">
        {renderPage()}
      </main>

      <CookieConsentBanner />
    </div>
  )
}

// Placeholder pages 

function AboutPage() {
  const { i18n } = useTranslation()
  const isHebrew = i18n.language === 'he'

  return (
    <div className="container mx-auto px-4 py-16" dir={isHebrew ? 'rtl' : 'ltr'}>
      <h1 className="text-4xl font-bold mb-6">
        {isHebrew ? 'אודות' : 'О нас'}
      </h1>
      <p className="text-lg text-gray-700 leading-relaxed">
        {isHebrew 
          ? 'משרד עורכי דין מקצועי עם ניסיון של מעל 15 שנה...'
          : 'Профессиональная юридическая фирма с более чем 15-летним опытом...'
        }
      </p>
    </div>
  )
}

function ContactPage() {
  const { i18n } = useTranslation()
  const isHebrew = i18n.language === 'he'
  const [formData, setFormData] = useState({
    client_name: '',
    client_email: '',
    client_phone: '',
    event_summary: '',
    urgency_level: 'Low'
  })
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState(null)

  const handleSubmit = async () => {
    setLoading(true)
    setError(null)

    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'
      const response = await fetch(`${API_URL}/intake`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      if (!response.ok) throw new Error('Failed to submit')

      setSubmitted(true)
      setFormData({
        client_name: '',
        client_email: '',
        client_phone: '',
        event_summary: '',
        urgency_level: 'Low'
      })

      setTimeout(() => setSubmitted(false), 5000)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  if (submitted) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-md mx-auto bg-green-50 border border-green-200 rounded-lg p-8 text-center">
          <div className="text-6xl mb-4">✓</div>
          <h2 className="text-2xl font-bold text-green-800 mb-2">
            {isHebrew ? 'פנייתך נשלחה בהצלחה!' : 'Ваш запрос отправлен!'}
          </h2>
          <p className="text-green-700">
            {isHebrew ? 'ניצור קשר בהקדם' : 'Мы свяжемся с вами в ближайшее время'}
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-16" dir={isHebrew ? 'rtl' : 'ltr'}>
      <div className="max-w-2xl mx-auto">
        <h1 className="text-4xl font-bold mb-6 text-center">
          {isHebrew ? 'צור קשר' : 'Связаться'}
        </h1>
        
        <div className="card">
          <div className="space-y-4">
            <div>
              <label className="label">{isHebrew ? 'שם מלא' : 'Полное имя'}</label>
              <input
                className="input"
                value={formData.client_name}
                onChange={(e) => setFormData({...formData, client_name: e.target.value})}
                placeholder={isHebrew ? 'הזן שם מלא' : 'Введите имя'}
              />
            </div>

            <div>
              <label className="label">{isHebrew ? 'דוא"ל' : 'Email'}</label>
              <input
                type="email"
                className="input"
                value={formData.client_email}
                onChange={(e) => setFormData({...formData, client_email: e.target.value})}
                placeholder="example@email.com"
              />
            </div>

            <div>
              <label className="label">{isHebrew ? 'טלפון' : 'Телефон'}</label>
              <input
                type="tel"
                className="input"
                value={formData.client_phone}
                onChange={(e) => setFormData({...formData, client_phone: e.target.value})}
                placeholder="050-1234567"
              />
            </div>

            <div>
              <label className="label">{isHebrew ? 'תיאור המקרה' : 'Описание случая'}</label>
              <textarea
                className="textarea"
                rows={6}
                value={formData.event_summary}
                onChange={(e) => setFormData({...formData, event_summary: e.target.value})}
                placeholder={isHebrew ? 'נא לתאר את המצב המשפטי' : 'Опишите вашу ситуацию'}
              />
            </div>

            <div>
              <label className="label">{isHebrew ? 'דחיפות' : 'Срочность'}</label>
              <select
                className="select"
                value={formData.urgency_level}
                onChange={(e) => setFormData({...formData, urgency_level: e.target.value})}
              >
                <option value="Low">{isHebrew ? 'נמוכה' : 'Низкая'}</option>
                <option value="Medium">{isHebrew ? 'בינונית' : 'Средняя'}</option>
                <option value="Court Date Soon">{isHebrew ? 'דחופה' : 'Срочная'}</option>
              </select>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded p-4 text-red-700 text-sm">
                {error}
              </div>
            )}

            <button
              onClick={handleSubmit}
              disabled={loading}
              className="btn btn-primary w-full"
            >
              {loading 
                ? (isHebrew ? 'שולח...' : 'Отправка...') 
                : (isHebrew ? 'שלח פנייה' : 'Отправить запрос')
              }
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

function LoginPage({ setAuth, setIsAdmin }) {
  const { i18n } = useTranslation()
  const isHebrew = i18n.language === 'he'
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleLogin = async () => {
    setLoading(true)
    setError('')

    try {
      const formData = new URLSearchParams()
      formData.append('username', email)
      formData.append('password', password)

      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'
      const response = await fetch(`${API_URL}/auth/token`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: formData
      })

      if (!response.ok) throw new Error(isHebrew ? 'שגיאת התחברות' : 'Ошибка входа')

      const data = await response.json()
      localStorage.setItem('access_token', data.access_token)
      localStorage.setItem('user_role', 'admin')
      localStorage.setItem('user_email', email)
      
      setAuth(true)
      setIsAdmin(true)
      window.location.hash = '#admin'
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-8" dir={isHebrew ? 'rtl' : 'ltr'}>
        <div className="text-center mb-8">
          <div className="text-5xl mb-4">⚖️</div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            {isHebrew ? 'כניסה למערכת' : 'Вход в систему'}
          </h1>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm text-center">
            {error}
          </div>
        )}

        <div className="space-y-6">
          <div>
            <label className="label">{isHebrew ? 'אימייל' : 'Email'}</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
              className="input"
              placeholder="lawyer@example.com"
              disabled={loading}
            />
          </div>

          <div>
            <label className="label">{isHebrew ? 'סיסמה' : 'Пароль'}</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
              className="input"
              placeholder="••••••••"
              disabled={loading}
            />
          </div>

          <button
            onClick={handleLogin}
            disabled={loading}
            className="btn btn-primary w-full"
          >
            {loading 
              ? (isHebrew ? 'מתחבר...' : 'Вход...') 
              : (isHebrew ? 'התחבר' : 'Войти')
            }
          </button>
        </div>

        <div className="mt-8 pt-6 border-t">
          <a
            href="https://www.israelbar.biz/login/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 w-full py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition text-gray-700"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
            <span>{isHebrew ? 'לשכת עורכי הדין' : 'Палата адвокатов'}</span>
          </a>
        </div>
      </div>
    </div>
  )
}

// Import the admin dashboard we created earlier
function AdminDashboard({ onLogout }) {
  // This would be the full admin dashboard component
  // For now, placeholder
  return (
    <div className="container mx-auto px-4 py-16">
      <h1 className="text-3xl font-bold mb-4">Admin Dashboard</h1>
      <p>Full admin dashboard goes here</p>
      <button onClick={onLogout} className="btn btn-danger mt-4">
        Logout
      </button>
    </div>
  )
}

export default App