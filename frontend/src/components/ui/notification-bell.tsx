'use client'

import { useRouter } from 'next/navigation'
import { BellIcon } from '@heroicons/react/24/outline'
import { BellIcon as BellSolidIcon } from '@heroicons/react/24/solid'
import { useNotifications } from '@/contexts/notification-context'

interface NotificationBellProps {
    className?: string
}

export default function NotificationBell({ className = '' }: NotificationBellProps) {
    const { unreadCount } = useNotifications()
    const router = useRouter()

    const handleClick = () => {
        // Navigate to notifications page
        router.push('/dashboard/notifications')
    }

    return (
        <button
            onClick={handleClick}
            className={`relative p-2 rounded-lg hover:bg-muted transition-all duration-200 group ${className}`}
            title={`Notifications${unreadCount > 0 ? ` (${unreadCount} unread)` : ''}`}
        >
            {/* Bell Icon */}
            {unreadCount > 0 ? (
                <BellSolidIcon className="w-6 h-6 text-primary group-hover:scale-110 transition-transform duration-200" />
            ) : (
                <BellIcon className="w-6 h-6 text-muted-foreground hover:text-foreground group-hover:scale-110 transition-all duration-200" />
            )}

            {/* Notification Badge */}
            {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full min-w-[20px] h-5 flex items-center justify-center px-1 shadow-lg border-2 border-background">
                    {unreadCount > 99 ? '99+' : unreadCount}
                </span>
            )}

            {/* Pulse animation for new notifications */}
            {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 rounded-full min-w-[20px] h-5 animate-ping opacity-75"></span>
            )}
        </button>
    )
}