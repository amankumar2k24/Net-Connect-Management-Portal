'use client'

import { useAuth } from '@/contexts/auth-context'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import Sidebar from './sidebar'
import SidebarToggle from '@/components/ui/sidebar-toggle'
import AuthDebug from '@/components/debug/auth-debug'

interface DashboardLayoutProps {
  children: React.ReactNode
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const { isAuthenticated, isLoading, user } = useAuth()
  const router = useRouter()

  useEffect(() => {
    console.log('🔍 Dashboard Layout: Auth state check', {
      isLoading,
      isAuthenticated,
      user: user?.email
    })

    if (!isLoading && !isAuthenticated) {
      console.log('🚨 Dashboard Layout: User not authenticated, redirecting to login')
      router.push('/auth/login')
    }
  }, [isAuthenticated, isLoading, router, user])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return null
  }

  return (
    <div className="h-screen flex overflow-hidden bg-background">
      <Sidebar/>
      <div className="flex flex-col w-0 flex-1 overflow-hidden">
        {/* Top header bar */}
        <header className="bg-card border-b border-slate-600/50 px-6 py-3.5 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <SidebarToggle className="hidden md:block" />
              <h1 className="text-xl font-semibold text-foreground lg:text-2xl pl-10 md:pl-0">
                {user?.role === 'admin' ? 'Admin Dashboard' : 'User Dashboard'}
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-muted-foreground hidden sm:inline">
                Welcome back, {user?.fullName || [user?.firstName, user?.lastName].filter(Boolean).join(' ') || user?.email}
              </span>
            </div>
          </div>
        </header>

        <main className="flex-1 relative overflow-y-auto focus:outline-none">
          <div className="py-6 px-4 lg:px-8">
            <div className="max-w-7xl mx-auto">
              {children}
            </div>
          </div>
        </main>
      </div>
      {/* {process.env.NODE_ENV === 'development' && <AuthDebug />} */}
    </div>
  )
}
