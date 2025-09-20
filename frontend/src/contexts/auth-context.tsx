'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import { AuthContextType, User } from '@/types'
import { authApi } from '@/lib/api-functions'

const STORAGE_TOKEN_KEY = 'token'
const STORAGE_USER_KEY = 'user'

const AuthContext = createContext<AuthContextType | undefined>(undefined)

const normalizeUser = (raw: any): User => {
  if (!raw) {
    throw new Error('Missing user payload')
  }

  const id = raw.id ?? raw._id ?? ''

  const firstName = raw.firstName ?? ''
  const lastName = raw.lastName ?? ''
  const fullName = [firstName, lastName].filter(Boolean).join(' ') || raw.name || raw.email || ''

  return {
    id,
    firstName,
    lastName,
    email: raw.email ?? '',
    phone: raw.phone ?? raw.mobile ?? undefined,
    role: raw.role ?? 'user',
    status: raw.status ?? 'active',
    isEmailVerified: Boolean(raw.isEmailVerified),
    profileImage: raw.profileImage ?? undefined,
    qrCodeUrl: raw.qrCodeUrl ?? undefined,
    upiId: raw.upiId ?? raw.upiNumber ?? undefined,
    lastLogin: raw.lastLogin ?? raw.lastLoggedIn ?? undefined,
    createdAt: raw.createdAt ?? new Date().toISOString(),
    updatedAt: raw.updatedAt ?? raw.createdAt ?? new Date().toISOString(),
    fullName,
  }
}

const persistUser = (user: User | null) => {
  if (!user) {
    localStorage.removeItem(STORAGE_USER_KEY)
    return
  }
  localStorage.setItem(STORAGE_USER_KEY, JSON.stringify(user))
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem(STORAGE_TOKEN_KEY)
    const storedUser = localStorage.getItem(STORAGE_USER_KEY)

    if (token && storedUser) {
      try {
        const parsed = normalizeUser(JSON.parse(storedUser))
        setUser(parsed)
      } catch (error) {
        console.error('AuthProvider:initAuth failed to parse stored user', error)
        localStorage.removeItem(STORAGE_TOKEN_KEY)
        localStorage.removeItem(STORAGE_USER_KEY)
      }
    }

    setIsLoading(false)
  }, [])

  const login = async (email: string, password: string) => {
    try {
      setIsLoading(true)
      const { token, user: payload } = await authApi.login({ email, password })
      const normalizedUser = normalizeUser(payload)

      localStorage.setItem(STORAGE_TOKEN_KEY, token)
      persistUser(normalizedUser)
      setUser(normalizedUser)
    } catch (error) {
      console.error('AuthProvider:login failed', error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const logout = async () => {
    try {
      await authApi.logout()
    } finally {
      localStorage.removeItem(STORAGE_TOKEN_KEY)
      localStorage.removeItem(STORAGE_USER_KEY)
      setUser(null)
    }
  }

  const forceLogout = () => {
    localStorage.removeItem(STORAGE_TOKEN_KEY)
    localStorage.removeItem(STORAGE_USER_KEY)
    setUser(null)
  }

  const value: AuthContextType = {
    user,
    login,
    logout,
    forceLogout,
    isLoading,
    isAuthenticated: Boolean(user),
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
