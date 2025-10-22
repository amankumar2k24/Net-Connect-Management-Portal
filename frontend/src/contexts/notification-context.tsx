'use client'

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { notificationApi } from '@/lib/api-functions'
import { useAuth } from './auth-context'

interface NotificationContextType {
    unreadCount: number
    refreshUnreadCount: () => Promise<void>
    markAsRead: (id: string) => Promise<void>
    markAllAsRead: () => Promise<void>
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined)

export function NotificationProvider({ children }: { children: React.ReactNode }) {
    const [unreadCount, setUnreadCount] = useState(0)
    const { user } = useAuth()

    const refreshUnreadCount = useCallback(async () => {
        if (!user) {
            setUnreadCount(0)
            return
        }

        try {
            const count = await notificationApi.getUnreadCount()
            setUnreadCount(count)
        } catch (error) {
            console.error('Error fetching unread count:', error)
            setUnreadCount(0)
        }
    }, [user])

    const markAsRead = useCallback(async (id: string) => {
        try {
            await notificationApi.markAsRead(id)
            await refreshUnreadCount() // Refresh count after marking as read
        } catch (error) {
            console.error('Error marking notification as read:', error)
        }
    }, [refreshUnreadCount])

    const markAllAsRead = useCallback(async () => {
        try {
            await notificationApi.markAllAsRead()
            setUnreadCount(0) // Immediately set to 0
        } catch (error) {
            console.error('Error marking all notifications as read:', error)
        }
    }, [])

    // Initial fetch and periodic updates
    useEffect(() => {
        if (user) {
            refreshUnreadCount()

            // Poll for new notifications every 30 seconds
            const interval = setInterval(refreshUnreadCount, 30000)

            return () => clearInterval(interval)
        }
    }, [user, refreshUnreadCount])

    const value = {
        unreadCount,
        refreshUnreadCount,
        markAsRead,
        markAllAsRead,
    }

    return (
        <NotificationContext.Provider value={value}>
            {children}
        </NotificationContext.Provider>
    )
}

export function useNotifications() {
    const context = useContext(NotificationContext)
    if (context === undefined) {
        throw new Error('useNotifications must be used within a NotificationProvider')
    }
    return context
}