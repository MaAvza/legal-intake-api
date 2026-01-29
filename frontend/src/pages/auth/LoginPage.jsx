import { useState } from 'react'

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
      // Create form data for OAuth2 password flow
      const formData = new URLSearchParams()
      formData.append('username', email)  // OAuth2 uses 'username' field
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
      
      // Save token to localStorage
      localStorage.setItem('access_token', data.access_token)
      
      // Verify user is admin
      const userResponse = await fetch('http://localhost:8000/tickets', {
        headers: {
          'Authorization': `Bearer ${data.access_token}`
        }
      })

      if (userResponse.ok) {
        // User is admin (can access protected route)
        localStorage.setItem('user_role', 'admin')
        localStorage.setItem('user_email', email)
        
        // Call success callback
        if (onLoginSuccess) {
          onLoginSuccess()
        }
      } else {
        throw new Error('משתמש זה אינו מורשה לגשת למערכת הניהול')
      }

    } catch (err) {
      setError(err.message)
      localStorage.removeItem('access_token')
      localStorage.removeItem('user_role')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-8" dir="rtl">
        {/* Logo/Title */}
        <div className="text-center mb-8">
          <div className="text-5xl mb-4">⚖️</div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">לוח ניהול עורך דין</h1>
          <p className="text-gray-600">התחבר כדי לגשת למערכת</p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-700 text-center">{error}</p>
          </div>
        )}

        {/* Login Form */}
        <div className="space-y-6">
          {/* Email Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              אימייל
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              placeholder="lawyer@example.com"
              required
              disabled={loading}
            />
          </div>

          {/* Password Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              סיסמה
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  handleLogin(e)
                }
              }}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              placeholder="••••••••"
              required
              disabled={loading}
            />
          </div>

          {/* Remember Me & Forgot Password */}
          <div className="flex items-center justify-between text-sm">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" className="w-4 h-4 rounded border-gray-300" />
              <span className="text-gray-600">זכור אותי</span>
            </label>
            <a href="#" className="text-blue-600 hover:text-blue-700">
              שכחת סיסמה?
            </a>
          </div>

          {/* Login Button */}
          <button
            onClick={handleLogin}
            disabled={loading}
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'מתחבר...' : 'התחבר'}
          </button>
        </div>

        {/* External Link */}
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

        {/* Footer */}
        <div className="mt-6 text-center text-sm text-gray-500">
          <p>© 2026 כל הזכויות שמורות</p>
        </div>
      </div>
    </div>
  )
}

export default LoginPage