// Base API configuration
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

export const api = {
  async request(endpoint, options = {}) {
    const token = localStorage.getItem('access_token')
    
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers,
    }
    
    if (token && !options.skipAuth) {
      headers['Authorization'] = `Bearer ${token}`
    }
    
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    })
    
    if (!response.ok) {
      if (response.status === 401) {
        // Unauthorized - clear token and redirect
        localStorage.removeItem('access_token')
        window.location.href = '/login'
      }
      throw new Error(`API Error: ${response.statusText}`)
    }
    
    return response.json()
  },
  
  get(endpoint, options) {
    return this.request(endpoint, { ...options, method: 'GET' })
  },
  
  post(endpoint, data, options) {
    return this.request(endpoint, {
      ...options,
      method: 'POST',
      body: JSON.stringify(data),
    })
  },
  
  put(endpoint, data, options) {
    return this.request(endpoint, {
      ...options,
      method: 'PUT',
      body: JSON.stringify(data),
    })
  },
  
  delete(endpoint, options) {
    return this.request(endpoint, { ...options, method: 'DELETE' })
  },
}