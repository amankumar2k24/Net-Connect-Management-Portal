import axios from 'axios'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5510'

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
    console.log('🔍 API Request Debug:', {
      url: config.url,
      method: config.method,
      hasToken: !!token,
      tokenLength: token?.length,
      tokenPreview: token?.substring(0, 20) + '...'
    })

    if (token && isTokenValid(token)) {
      config.headers.Authorization = `Bearer ${token}`
      console.log('🔑 API: Adding valid token to request')
    } else if (token) {
      console.log('⚠️ API: Invalid token detected, removing from storage')
      localStorage.removeItem('token')
      localStorage.removeItem('user')
    } else {
      console.log('❌ API: No token found in localStorage')
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
        url: error.config?.url,
        errorMessage: error.response?.data?.message
      })

      // Check for specific account status errors
      const isAccountInactive = error.response?.data?.message?.includes('Account is not active') ||
        error.response?.data?.message?.includes('not active')

      const isTokenExpired = error.response?.data?.message?.includes('expired') ||
        error.response?.data?.message?.includes('invalid token')

      // Force logout and redirect if:
      // 1. Account is inactive (admin deactivated the user) OR
      // 2. We're on a dashboard page AND had a token AND it's expired/invalid
      if (isAccountInactive || (currentPath.includes('/dashboard') && hadToken && !isAuthEndpoint && isTokenExpired)) {
        console.log('🚨 API: Account inactive or token expired - forcing logout')
        handleAuthFailure()
      } else {
        console.log('⚠️ API: 401 error but not redirecting:', {
          reason: isAccountInactive ? 'account inactive' : isTokenExpired ? 'token expired' : 'other auth issue',
          path: currentPath,
          isAuth: isAuthEndpoint
        })
      }
    }
    return Promise.reject(error)
  }
)

export default api