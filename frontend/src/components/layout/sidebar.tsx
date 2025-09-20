'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAuth } from '@/contexts/auth-context'
import { cn } from '@/lib/utils'
import Logo from '@/components/ui/logo'
import {
  HomeIcon,
  UsersIcon,
  CreditCardIcon,
  UserIcon,
  BellIcon,
  ClockIcon,
  DocumentTextIcon,
  Bars3Icon,
  XMarkIcon,
  ArrowRightOnRectangleIcon
} from '@heroicons/react/24/outline'
import { Tooltip } from 'react-tooltip'

interface SidebarProps {
  className?: string
}

const adminMenuItems = [
  {
    name: 'Dashboard',
    href: '/dashboard',
    icon: HomeIcon,
  },
  {
    name: 'All Users',
    href: '/dashboard/users',
    icon: UsersIcon,
  },
  {
    name: 'Payments',
    href: '/dashboard/payments',
    icon: CreditCardIcon,
  },
  {
    name: 'Profile',
    href: '/dashboard/profile',
    icon: UserIcon,
  },
  {
    name: 'Notifications',
    href: '/dashboard/notifications',
    icon: BellIcon,
  },
]

const userMenuItems = [
  {
    name: 'Payment History',
    href: '/dashboard/payment-history',
    icon: DocumentTextIcon,
  },
  {
    name: 'Profile',
    href: '/dashboard/profile',
    icon: UserIcon,
  },
  {
    name: 'Next Payments',
    href: '/dashboard/next-payments',
    icon: ClockIcon,
  },
  {
    name: 'Notifications',
    href: '/dashboard/notifications',
    icon: BellIcon,
  },
]

interface SidebarContentProps {
  menuItems: typeof adminMenuItems
  pathname: string
  user: any
  onLogout: () => void
  isCollapsed?: boolean
}

export default function Sidebar({ className }: SidebarProps) {
  const pathname = usePathname()
  const { user, logout } = useAuth()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)

  const menuItems = user?.role === 'admin' ? adminMenuItems : userMenuItems

  const handleLogout = () => {
    logout()
  }

  // Listen for sidebar toggle events
  useEffect(() => {
    const handleToggle = (e: CustomEvent) => {
      setIsSidebarCollapsed(e.detail)
    }

    window.addEventListener('sidebarToggle', handleToggle as EventListener)
    return () => window.removeEventListener('sidebarToggle', handleToggle as EventListener)
  }, [])

  // Check for saved sidebar state in localStorage
  useEffect(() => {
    const savedState = localStorage.getItem('sidebarCollapsed')
    if (savedState) {
      setIsSidebarCollapsed(JSON.parse(savedState))
    }
  }, [])

  return (
    <>
      {/* Mobile menu button */}
      {!isMobileMenuOpen && (
        <div className="lg:hidden fixed top-4 left-4 z-50">
          <button
            onClick={() => setIsMobileMenuOpen(true)}
            className="inline-flex items-center justify-center p-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary"
          >
            <Bars3Icon className="h-6 w-6" aria-hidden="true" />
          </button>
        </div>
      )}

      {/* Mobile menu overlay */}
      {isMobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-40 flex">
          <div className="fixed inset-0 bg-background/80 backdrop-blur-sm" onClick={() => setIsMobileMenuOpen(false)} />
          <div className="relative flex-1 flex flex-col max-w-xs w-full bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 border-r border-slate-700/50 shadow-2xl z-50">
            <div className="absolute top-0 right-0 -mr-10 pt-2 sm:-mr-12">
              <button
                onClick={() => setIsMobileMenuOpen(false)}
                className="ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary text-foreground bg-white shadow-lg"
              >
                <XMarkIcon className="h-6 w-6 text-foreground" aria-hidden="true" />
              </button>
            </div>
            <SidebarContent menuItems={menuItems} pathname={pathname} user={user} onLogout={handleLogout} isCollapsed={false} />
          </div>
        </div>
      )}

      {/* Desktop sidebar */}
      <div className={cn('hidden lg:flex lg:flex-shrink-0', className)}>
        <div className={cn('flex flex-col', isSidebarCollapsed ? 'w-20' : 'w-64')}>
          <div className="flex flex-col h-0 flex-1 bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 border-r border-slate-700/50 shadow-2xl">
            <SidebarContent menuItems={menuItems} pathname={pathname} user={user} onLogout={handleLogout} isCollapsed={isSidebarCollapsed} />
          </div>
        </div>
      </div>
    </>
  )
}

interface SidebarContentProps {
  menuItems: typeof adminMenuItems
  pathname: string
  user: any
  onLogout: () => void
  isCollapsed?: boolean
}

function SidebarContent({ menuItems, pathname, user, onLogout, isCollapsed = false }: SidebarContentProps) {
  return (
    <>
      {/* Header with Logo */}
      <div className="flex items-center h-16 flex-shrink-0 px-6 bg-gradient-to-r from-slate-800 to-slate-700 border-b border-slate-600/50">
        {!isCollapsed && (
          <Logo size="sm" variant="horizontal" className="filter brightness-110" />
        )}
        {isCollapsed && (
          <Logo size="sm" variant="icon" className="filter brightness-110" />
        )}
      </div>

      {/* Navigation */}
      <div className="flex-1 flex flex-col overflow-y-auto">
        <nav className="flex-1 px-4 py-6 space-y-3">
          {menuItems.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  isActive
                    ? 'bg-gradient-to-r from-blue-600 via-blue-500 to-blue-600 text-white shadow-lg transform scale-105 border border-blue-400/30'
                    : 'text-slate-300 hover:bg-gradient-to-r hover:from-slate-700 hover:to-slate-600 hover:text-white hover:shadow-md hover:transform hover:scale-102',
                  isCollapsed ? 'justify-center px-2 py-4' : 'px-4 py-3.5',
                  'group flex items-center text-sm font-medium rounded-xl transition-all duration-300 ease-out backdrop-blur-sm'
                )}
                data-tooltip-id="sidebar-tooltip"
                data-tooltip-content={item.name}
                data-tooltip-place="right"
              >
                <div className={cn(
                  isActive
                    ? 'bg-white/20 text-white shadow-inner'
                    : 'bg-slate-600/30 text-slate-300 group-hover:bg-slate-500/40 group-hover:text-white',
                  'p-2 rounded-lg transition-all duration-300',
                  isCollapsed ? 'mr-0' : 'mr-3'
                )}>
                  <item.icon
                    className="h-5 w-5"
                    aria-hidden="true"
                  />
                </div>
                {!isCollapsed && (
                  <>
                    <span className={cn(
                      isActive ? 'font-semibold text-white' : 'font-medium group-hover:font-semibold',
                      'transition-all duration-300'
                    )}>
                      {item.name}
                    </span>
                    {isActive && (
                      <div className="ml-auto">
                        <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                      </div>
                    )}
                  </>
                )}
              </Link>
            )
          })}
        </nav>

        {/* User Profile Section */}
        <div className="flex-shrink-0 border-t border-slate-600/50 bg-gradient-to-r from-slate-800 to-slate-700">
          <div className="p-6">
            {!isCollapsed && (
              <>
                <div className="flex items-center space-x-4">
                  <div className="flex-shrink-0">
                    <div className="h-12 w-12 rounded-full bg-gradient-to-br from-blue-500 via-blue-600 to-purple-600 flex items-center justify-center shadow-lg border-2 border-blue-400/30">
                      <span className="text-sm font-bold text-white">
                        {user?.name?.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-white truncate">{user?.name}</p>
                    <p className="text-xs text-slate-300 capitalize font-medium">{user?.role} Account</p>
                  </div>
                </div>
                <button
                  onClick={onLogout}
                  className="mt-4 w-full flex items-center px-4 py-3 text-sm font-medium text-slate-300 rounded-xl hover:bg-gradient-to-r hover:from-red-600 hover:to-red-500 hover:text-white transition-all duration-300 hover:shadow-lg group"
                >
                  <div className="p-1.5 rounded-lg bg-slate-600/30 group-hover:bg-white/20 transition-all duration-300 mr-3">
                    <ArrowRightOnRectangleIcon className="h-4 w-4" aria-hidden="true" />
                  </div>
                  <span className="group-hover:font-semibold transition-all duration-300">Sign out</span>
                </button>
              </>
            )}
            {isCollapsed && (
              <div className="flex flex-col items-center space-y-4">
                <div className="flex-shrink-0">
                  <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 via-blue-600 to-purple-600 flex items-center justify-center shadow-lg border-2 border-blue-400/30">
                    <span className="text-xs font-bold text-white">
                      {user?.name?.charAt(0).toUpperCase()}
                    </span>
                  </div>
                </div>
                <button
                  onClick={onLogout}
                  className="flex items-center justify-center p-2 text-slate-300 rounded-xl hover:bg-gradient-to-r hover:from-red-600 hover:to-red-500 hover:text-white transition-all duration-300 hover:shadow-lg group"
                  title="Sign out"
                  data-tooltip-id="sidebar-tooltip"
                  data-tooltip-content="Sign out"
                  data-tooltip-place="right"
                >
                  <ArrowRightOnRectangleIcon className="h-5 w-5" aria-hidden="true" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Tooltip component */}
      <Tooltip
        id="sidebar-tooltip"
        className="z-50 rounded-md bg-slate-800 px-3 py-2 text-sm text-white shadow-lg border border-slate-600"
        noArrow={false}
        place="right"
      />
    </>
  )
}
