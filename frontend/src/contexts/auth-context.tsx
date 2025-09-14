'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import { User, AuthContextType } from '@/types'
import { authApi } from '@/lib/api-functions'

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const initAuth = () => {
      const token = localStorage.getItem('token')
      const userData = localStorage.getItem('user')

      console.log('🔍 Auth Debug - Token:', token ? 'exists' : 'missing')
      console.log('🔍 Auth Debug - User data:', userData ? 'exists' : 'missing')

      if (token && userData) {
        try {
          const parsedUser = JSON.parse(userData)
          console.log('✅ Auth Debug - Setting user:', parsedUser)
          console.log('🔑 Auth Debug - User role:', parsedUser.role)
          console.log('🔑 Auth Debug - Is admin:', parsedUser.role === 'admin')
          setUser(parsedUser)
        } catch (error) {
          console.error('❌ Auth Debug - JSON parse error:', error)
          localStorage.removeItem('token')
          localStorage.removeItem('user')
        }
      } else {
        console.log('⚠️ Auth Debug - No token or user data found')
      }
      setIsLoading(false)
    }

    initAuth()
  }, [])

  const login = async (email: string, password: string) => {
    try {
      setIsLoading(true)
      console.log('🔄 Auth Debug - Starting login...')
      const response = await authApi.login({ email, password })
      // NestJS backend returns data directly, not nested in data.data
      const { token, user: userData } = response.data

      console.log('✅ Auth Debug - Login response received')
      console.log('🔑 Auth Debug - Token:', token ? 'received' : 'missing')
      console.log('👤 Auth Debug - User data:', userData)

      if (!token || !userData) {
        throw new Error('Invalid response: missing token or user data')
      }

      localStorage.setItem('token', token)
      localStorage.setItem('user', JSON.stringify(userData))
      setUser(userData)

      console.log('✅ Auth Debug - Login completed, user set')
    } catch (error: any) {
      console.error('❌ Auth Debug - Login error:', error)
      // Don't redirect here, let the component handle the error
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const logout = async () => {
    try {
      console.log('🔄 Auth Debug - Starting logout...')
      await authApi.logout()
    } catch (error) {
      console.error('Logout error:', error)
      // Continue with logout even if API call fails
    } finally {
      console.log('🔄 Auth Debug - Clearing local storage and user state')
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      setUser(null)
    }
  }

  // Function to handle force logout (called by API interceptor)
  const forceLogout = () => {
    console.log('🚨 Auth Debug - Force logout triggered')
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setUser(null)
  }

  const value: AuthContextType = {
    user,
    login,
    logout,
    forceLogout,
    isLoading,
    isAuthenticated: !!user,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}