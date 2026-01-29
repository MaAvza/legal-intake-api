const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

export const authService = {
  async login(email, password) {
    const formData = new URLSearchParams()
    formData.append('username', email)
    formData.append('password', password)
    
    const response = await fetch(`${API_BASE_URL}/auth/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: formData,
    })
    
    if (!response.ok) {
      throw new Error('שם משתמש או סיסמה שגויים')
    }
    
    const data = await response.json()
    localStorage.setItem('access_token', data.access_token)
    
    return data
  },
  
  logout() {
    localStorage.removeItem('access_token')
    localStorage.removeItem('user_role')
    localStorage.removeItem('user_email')
  },
  
  isAuthenticated() {
    return !!localStorage.getItem('access_token')
  },
}