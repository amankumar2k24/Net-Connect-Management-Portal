'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/auth-context'
import { WiFiSignalLoader } from '@/components/ui/unique-loader'

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
      <WiFiSignalLoader message="Initializing application..." />
    </div>
  )
}
