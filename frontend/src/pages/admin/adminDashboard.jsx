import { useState, useEffect } from 'react'

// Import login page component 

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check if user is already logged in
    const token = localStorage.getItem('access_token')
    if (token) {
      setIsLoggedIn(true)
    }
    setLoading(false)
  }, [])

  const handleLogout = () => {
    localStorage.removeItem('access_token')
    localStorage.removeItem('user_role')
    localStorage.removeItem('user_email')
    setIsLoggedIn(false)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">טוען...</div>
      </div>
    )
  }

  if (!isLoggedIn) {
    return <LoginPage onLoginSuccess={() => setIsLoggedIn(true)} />
  }

  return <AdminDashboard onLogout={handleLogout} />
}

function LoginPage({ onLoginSuccess }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleLogin = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const formData = new URLSearchParams()
      formData.append('username', email)
      formData.append('password', password)

      const response = await fetch('http://localhost:8000/auth/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: formData
      })

      if (!response.ok) {
        throw new Error('שם משתמש או סיסמה שגויים')
      }

      const data = await response.json()
      localStorage.setItem('access_token', data.access_token)
      localStorage.setItem('user_role', 'admin')
      localStorage.setItem('user_email', email)
      
      onLoginSuccess()
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-8" dir="rtl">
        <div className="text-center mb-8">
          <div className="text-5xl mb-4">⚖️</div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">לוח ניהול עורך דין</h1>
          <p className="text-gray-600">התחבר כדי לגשת למערכת</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-700 text-center">{error}</p>
          </div>
        )}

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">אימייל</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              placeholder="lawyer@example.com"
              disabled={loading}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">סיסמה</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleLogin(e)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              placeholder="••••••••"
              disabled={loading}
            />
          </div>

          <button
            onClick={handleLogin}
            disabled={loading}
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition disabled:opacity-50"
          >
            {loading ? 'מתחבר...' : 'התחבר'}
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
            <span>כניסה ללשכת עורכי הדין בישראל</span>
          </a>
        </div>
      </div>
    </div>
  )
}

function AdminDashboard({ onLogout }) {
  const [activeTab, setActiveTab] = useState('overview')
  
  // Mock data - will be replaced with API calls
  const stats = {
    newMessages: 5,
    todayAppointments: 3,
    activeCases: 12,
    pendingTasks: 7
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Navigation Bar */}
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-800">לוח ניהול עורך דין</h1>
            
            <div className="flex items-center gap-4">
              {/* Israel Bar Association Link */}
              <a 
                href="https://www.israelbar.biz/login/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
                לשכת עורכי הדין
              </a>
              
              {/* User Menu */}
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">שלום, עו"ד</span>
                <button 
                  onClick={onLogout}
                  className="px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition"
                >
                  התנתק
                </button>
              </div>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Quick Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <StatCard
            title="הודעות חדשות"
            value={stats.newMessages}
            color="blue"
          />
          <StatCard
            title="פגישות היום"
            value={stats.todayAppointments}
            color="green"
          />
          <StatCard
            title="תיקים פעילים"
            value={stats.activeCases}
            color="purple"
          />
          <StatCard
            title="משימות ממתינות"
            value={stats.pendingTasks}
            color="orange"
          />
        </div>

        {/* Main Content Tabs */}
        <div className="bg-white rounded-lg shadow">
          {/* Tab Navigation */}
          <div className="border-b">
            <nav className="flex gap-1 px-4" dir="rtl">
              <TabButton
                active={activeTab === 'overview'}
                onClick={() => setActiveTab('overview')}
              >
                סקירה כללית
              </TabButton>
              <TabButton
                active={activeTab === 'calendar'}
                onClick={() => setActiveTab('calendar')}
              >
                לוח שנה
              </TabButton>
              <TabButton
                active={activeTab === 'clients'}
                onClick={() => setActiveTab('clients')}
              >
                לקוחות
              </TabButton>
              <TabButton
                active={activeTab === 'tasks'}
                onClick={() => setActiveTab('tasks')}
              >
                משימות
              </TabButton>
              <TabButton
                active={activeTab === 'messages'}
                onClick={() => setActiveTab('messages')}
              >
                הודעות
              </TabButton>
              <TabButton
                active={activeTab === 'articles'}
                onClick={() => setActiveTab('articles')}
              >
                מאמרים
              </TabButton>
            </nav>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {activeTab === 'overview' && <OverviewTab />}
            {activeTab === 'calendar' && <CalendarTab />}
            {activeTab === 'clients' && <ClientsTab />}
            {activeTab === 'tasks' && <TasksTab />}
            {activeTab === 'messages' && <MessagesTab />}
            {activeTab === 'articles' && <ArticlesTab />}
          </div>
        </div>
      </div>
    </div>
  )
}

// Reusable Components

function StatCard({ title, value, icon, color }) {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-green-50 text-green-600',
    purple: 'bg-purple-50 text-purple-600',
    orange: 'bg-orange-50 text-orange-600'
  }

  return (
    <div className="bg-white rounded-lg shadow p-6" dir="rtl">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600 mb-1">{title}</p>
          <p className="text-3xl font-bold text-gray-800">{value}</p>
        </div>
        <div className={`text-4xl ${colorClasses[color]} w-16 h-16 rounded-full flex items-center justify-center`}>
          {icon}
        </div>
      </div>
    </div>
  )
}

function TabButton({ active, onClick, children }) {
  return (
    <button
      onClick={onClick}
      className={`px-6 py-3 font-medium transition ${
        active
          ? 'border-b-2 border-blue-600 text-blue-600'
          : 'text-gray-600 hover:text-gray-800'
      }`}
    >
      {children}
    </button>
  )
}

// Tab Content Components (Basic Placeholders)

function OverviewTab() {
  return (
    <div className="space-y-6" dir="rtl">
      <h2 className="text-xl font-bold text-gray-800 mb-4">סקירה יומית</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Today's Schedule */}
        <div className="border rounded-lg p-4">
          <h3 className="font-semibold text-gray-800 mb-3">לוח זמנים להיום</h3>
          <div className="space-y-2">
            <ScheduleItem time="09:00" title="פגישה עם לקוח חדש" />
            <ScheduleItem time="11:30" title="דיון בבית משפט" />
            <ScheduleItem time="14:00" title="ייעוץ טלפוני" />
          </div>
        </div>

        {/* Recent Messages */}
        <div className="border rounded-lg p-4">
          <h3 className="font-semibold text-gray-800 mb-3">הודעות אחרונות</h3>
          <div className="space-y-2">
            <MessagePreview name="יוסי כהן" preview="בנוגע למאמר על פיצויי פיטורים..." time="לפני 5 דקות" />
            <MessagePreview name="שרה לוי" preview="שאלה לגבי הליך גירושין..." time="לפני שעה" />
            <MessagePreview name="דוד מזרחי" preview="תודה על הייעוץ!" time="לפני 3 שעות" />
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="border-t pt-4">
        <h3 className="font-semibold text-gray-800 mb-3">פעולות מהירות</h3>
        <div className="flex flex-wrap gap-3">
          <QuickActionButton icon="📝" text="מאמר חדש" />
          <QuickActionButton icon="👤" text="לקוח חדש" />
          <QuickActionButton icon="📊" text="דוחות ואנליטיקה" />
          <QuickActionButton icon="⚙️" text="הגדרות" />
        </div>
      </div>
    </div>
  )
}

function CalendarTab() {
  return (
    <div className="text-center py-12" dir="rtl">
      <div className="text-6xl mb-4">📅</div>
      <h3 className="text-xl font-semibold text-gray-800 mb-2">לוח שנה</h3>
      <p className="text-gray-600 mb-4">אינטגרציה עם Google Calendar / Outlook</p>
      <button className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
        חבר לוח שנה
      </button>
    </div>
  )
}

function ClientsTab() {
  const clients = [
    { id: 1, name: 'יוסי כהן', email: 'yossi@example.com', phone: '050-1234567', status: 'פעיל', lastContact: '16/01/2026' },
    { id: 2, name: 'שרה לוי', email: 'sara@example.com', phone: '052-9876543', status: 'פעיל', lastContact: '15/01/2026' },
    { id: 3, name: 'דוד מזרחי', email: 'david@example.com', phone: '054-5555555', status: 'סגור', lastContact: '10/01/2026' },
  ]

  return (
    <div dir="rtl">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-gray-800">רשימת לקוחות</h2>
        <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
          + לקוח חדש
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b">
              <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">שם</th>
              <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">אימייל</th>
              <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">טלפון</th>
              <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">סטטוס</th>
              <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">קשר אחרון</th>
              <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">פעולות</th>
            </tr>
          </thead>
          <tbody>
            {clients.map(client => (
              <tr key={client.id} className="border-b hover:bg-gray-50">
                <td className="px-4 py-3 text-sm text-gray-800 font-medium">{client.name}</td>
                <td className="px-4 py-3 text-sm text-gray-600">{client.email}</td>
                <td className="px-4 py-3 text-sm text-gray-600">{client.phone}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    client.status === 'פעיל' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                  }`}>
                    {client.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-sm text-gray-600">{client.lastContact}</td>
                <td className="px-4 py-3">
                  <button className="text-blue-600 hover:text-blue-800 text-sm">
                    פרטים
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function TasksTab() {
  const tasks = [
    { id: 1, title: 'הכנת כתב תביעה - יוסי כהן', priority: 'high', due: 'היום', completed: false },
    { id: 2, title: 'ייעוץ טלפוני - שרה לוי', priority: 'medium', due: 'מחר', completed: false },
    { id: 3, title: 'סקירת מסמכים - תיק מזרחי', priority: 'low', due: '20/01', completed: true },
  ]

  return (
    <div dir="rtl">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-gray-800">משימות יומיות</h2>
        <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
          + משימה חדשה
        </button>
      </div>

      <div className="space-y-3">
        {tasks.map(task => (
          <TaskItem key={task.id} task={task} />
        ))}
      </div>
    </div>
  )
}

function MessagesTab() {
  return (
    <div className="text-center py-12" dir="rtl">
      <div className="text-6xl mb-4">💬</div>
      <h3 className="text-xl font-semibold text-gray-800 mb-2">הודעות מלקוחות</h3>
      <p className="text-gray-600 mb-4">כאן תוצג תיבת הדואר הנכנס עם הודעות מלקוחות</p>
      <button className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
        עבור לתיבת הדואר
      </button>
    </div>
  )
}

function ArticlesTab() {
  return (
    <div className="text-center py-12" dir="rtl">
      <div className="text-6xl mb-4">📝</div>
      <h3 className="text-xl font-semibold text-gray-800 mb-2">ניהול מאמרים</h3>
      <p className="text-gray-600 mb-4">כתוב ופרסם מאמרים משפטיים עבור האתר</p>
      <button className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
        מאמר חדש
      </button>
    </div>
  )
}

// Helper Components

function ScheduleItem({ time, title }) {
  return (
    <div className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded">
      <div className="text-sm font-semibold text-blue-600 w-16">{time}</div>
      <div className="text-sm text-gray-700">{title}</div>
    </div>
  )
}

function MessagePreview({ name, preview, time }) {
  return (
    <div className="p-3 hover:bg-gray-50 rounded cursor-pointer">
      <div className="flex justify-between items-start mb-1">
        <span className="font-medium text-gray-800 text-sm">{name}</span>
        <span className="text-xs text-gray-500">{time}</span>
      </div>
      <p className="text-sm text-gray-600 truncate">{preview}</p>
    </div>
  )
}

function QuickActionButton({ icon, text }) {
  return (
    <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition">
      <span className="text-xl">{icon}</span>
      <span className="text-sm font-medium text-gray-700">{text}</span>
    </button>
  )
}

function TaskItem({ task }) {
  const priorityColors = {
    high: 'border-red-500 bg-red-50',
    medium: 'border-yellow-500 bg-yellow-50',
    low: 'border-green-500 bg-green-50'
  }

  return (
    <div className={`border-r-4 p-4 rounded ${priorityColors[task.priority]} ${task.completed ? 'opacity-50' : ''}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <input
            type="checkbox"
            checked={task.completed}
            className="w-5 h-5 rounded"
            readOnly
          />
          <div>
            <p className={`font-medium ${task.completed ? 'line-through text-gray-500' : 'text-gray-800'}`}>
              {task.title}
            </p>
            <p className="text-sm text-gray-600">תאריך יעד: {task.due}</p>
          </div>
        </div>
        <button className="text-gray-400 hover:text-gray-600">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
          </svg>
        </button>
      </div>
    </div>
  )
}

export default App