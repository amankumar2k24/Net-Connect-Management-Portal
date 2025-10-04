import axios from 'axios'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5501'

// Utility function to check if token is likely valid
const isTokenValid = (token: string | null): boolean => {
  if (!token) return false
  try {
    // Basic token validation - you can enhance this based on your token format
    return token.length > 10 && !token.includes('undefined') && !token.includes('null')
  } catch {
    return false
  }
}

// Function to handle authentication failure
const handleAuthFailure = () => {
  const currentPath = window.location.pathname
  // Only redirect if we're not already on auth pages
  if (!currentPath.includes('/auth/')) {
    console.log('🚨 API: Authentication failed - redirecting to login')
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    // Use a small delay to prevent race conditions
    setTimeout(() => {
      window.location.href = '/auth/login'
    }, 100)
  }
}

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token && isTokenValid(token)) {
      config.headers.Authorization = `Bearer ${token}`
      console.log('🔑 API: Adding valid token to request')
    } else if (token) {
      console.log('⚠️ API: Invalid token detected, removing from storage')
      localStorage.removeItem('token')
      localStorage.removeItem('user')
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => {
    return response
  },
  (error) => {
    console.log('🚨 API Error:', {
      status: error.response?.status,
      url: error.config?.url,
      method: error.config?.method,
      message: error.response?.data?.message,
      data: error.response?.data
    })

    if (error.response?.status === 401) {
      console.log('🚨 API: 401 Unauthorized detected')

      // Check if the request had a token
      const hadToken = error.config?.headers?.Authorization
      const currentPath = window.location.pathname
      const isAuthEndpoint = error.config?.url?.includes('/auth/')

      // Get user role to avoid redirecting admins unnecessarily
      const userData = localStorage.getItem('user')
      const user = userData ? JSON.parse(userData) : null

      console.log('🔍 Auth Check:', {
        hadToken: !!hadToken,
        currentPath,
        isDashboard: currentPath.includes('/dashboard'),
        isAuth: currentPath.includes('/auth/'),
        isAuthEndpoint,
        userRole: user?.role,
        url: error.config?.url
      })

      // Only redirect if:
      // 1. We're on a dashboard page AND
      // 2. The request had a token (meaning it was supposed to be authenticated) AND
      // 3. It's not a login/register attempt AND
      // 4. The error message indicates token expiry (not just missing endpoint)
      const isTokenExpired = error.response?.data?.message?.includes('expired') ||
        error.response?.data?.message?.includes('invalid token')

      if (currentPath.includes('/dashboard') && hadToken && !isAuthEndpoint && isTokenExpired) {
        console.log('🚨 API: Token expired - redirecting to login')
        handleAuthFailure()
      } else {
        console.log('⚠️ API: 401 error but not redirecting:', {
          reason: isTokenExpired ? 'endpoint issue' : 'token issue',
          path: currentPath,
          isAuth: isAuthEndpoint
        })
      }
    }
    return Promise.reject(error)
  }
)

export default api