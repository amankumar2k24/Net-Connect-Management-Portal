'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/auth-context'

export default function HomePage() {
  const router = useRouter()
  const { isAuthenticated, isLoading } = useAuth()

  useEffect(() => {
    console.log('🏠 HomePage - isLoading:', isLoading, 'isAuthenticated:', isAuthenticated)

    if (!isLoading) {
      if (isAuthenticated) {
        console.log('✅ HomePage - User is authenticated, redirecting to dashboard')
        router.push('/dashboard')
      } else {
        console.log('❌ HomePage - User not authenticated, redirecting to login')
        router.push('/auth/login')
      }
    }
  }, [isAuthenticated, isLoading, router])

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
        <p className="mt-4 text-muted-foreground">Loading...</p>
      </div>
    </div>
  )
}
