'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import DashboardLayout from '@/components/layout/dashboard-layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Modal } from '@/components/ui/modal'
import { notificationApi } from '@/lib/api-functions'
import { Notification } from '@/types'
import { formatDate } from '@/lib/utils'
import { toast } from 'react-hot-toast'
import {
  BellIcon,
  CheckIcon,
  TrashIcon,
  EyeIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  CreditCardIcon,
  UserPlusIcon
} from '@heroicons/react/24/outline'

export default function NotificationsPage() {
  const [selectedNotification, setSelectedNotification] = useState<Notification | null>(null)
  const [isNotificationModalOpen, setIsNotificationModalOpen] = useState(false)
  const [filter, setFilter] = useState<'all' | 'unread' | 'read'>('all')

  const queryClient = useQueryClient()

  // Helper function to convert backend response to frontend format
  const transformNotification = (notification: any): Notification => {
    return {
      ...notification,
      read: notification.status === 'read', // Add compatibility field
    }
  }

  const { data: notificationsData, isLoading } = useQuery({
    queryKey: ['notifications', filter],
    queryFn: () => notificationApi.getNotifications({
      read: filter === 'all' ? undefined : filter === 'read'
    }),
  })

  // Transform notifications to add compatibility fields
  const rawNotifications = notificationsData?.data?.notifications || notificationsData?.data?.data || []
  const notifications = rawNotifications.map(transformNotification)
  const unreadCount = notificationsData?.data?.unreadCount || notifications.filter((n: Notification) => !n.read).length

  const markAsReadMutation = useMutation({
    mutationFn: (notificationId: string) => notificationApi.markAsRead(notificationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] })
      toast.success('Notification marked as read!')
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to mark notification as read')
    },
  })

  const markAllAsReadMutation = useMutation({
    mutationFn: () => notificationApi.markAllAsRead(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] })
      toast.success('All notifications marked as read!')
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to mark all notifications as read')
    },
  })

  const deleteNotificationMutation = useMutation({
    mutationFn: (notificationId: string) => notificationApi.deleteNotification(notificationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] })
      toast.success('Notification deleted!')
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to delete notification')
    },
  })

  const handleMarkAsRead = (notification: Notification) => {
    if (!notification.read) {
      markAsReadMutation.mutate(notification.id)
    }
  }

  const handleMarkAllAsRead = () => {
    markAllAsReadMutation.mutate()
  }

  const handleDeleteNotification = (notification: Notification) => {
    deleteNotificationMutation.mutate(notification.id)
  }

  const handleViewNotification = (notification: Notification) => {
    setSelectedNotification(notification)
    setIsNotificationModalOpen(true)
    if (!notification.read) {
      handleMarkAsRead(notification)
    }
  }

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'payment_reminder':
      case 'payment_approved':
      case 'payment_rejected':
        return CreditCardIcon
      case 'account_status':
        return UserPlusIcon
      case 'system':
      default:
        return BellIcon
    }
  }

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'payment_approved':
        return 'text-green-600 bg-green-100'
      case 'payment_reminder':
        return 'text-yellow-600 bg-yellow-100'
      case 'payment_rejected':
        return 'text-red-600 bg-red-100'
      case 'account_status':
        return 'text-blue-600 bg-blue-100'
      case 'system':
      default:
        return 'text-gray-600 bg-gray-100'
    }
  }

  const filteredNotifications = notifications.filter((notification: Notification) => {
    if (filter === 'read') return notification.read
    if (filter === 'unread') return !notification.read
    return true
  })

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="md:flex md:items-center md:justify-between">
          <div className="flex-1 min-w-0">
            <h1 className="text-3xl font-bold leading-7 text-foreground sm:text-4xl sm:truncate font-poppins">
              Notifications
            </h1>
            <p className="mt-1 text-base text-muted-foreground">
              Stay updated with payment requests, user activities, and system updates
            </p>
          </div>
          <div className="mt-4 flex md:mt-0 md:ml-4">
            {unreadCount > 0 && (
              <Button
                onClick={handleMarkAllAsRead}
                disabled={markAllAsReadMutation.isPending}
              >
                <CheckIcon className="h-4 w-4 mr-2" />
                Mark All Read ({unreadCount})
              </Button>
            )}
          </div>
        </div>

        {/* Notification Statistics */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-700 mb-1">Total</p>
                  <p className="text-3xl font-bold text-blue-900">{notifications.length}</p>
                </div>
                <div className="p-3 bg-blue-200 rounded-xl">
                  <BellIcon className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100 border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-yellow-700 mb-1">Unread</p>
                  <p className="text-3xl font-bold text-yellow-900">{unreadCount}</p>
                </div>
                <div className="p-3 bg-yellow-200 rounded-xl">
                  <ExclamationTriangleIcon className="h-6 w-6 text-yellow-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-50 to-green-100 border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-green-700 mb-1">Read</p>
                  <p className="text-3xl font-bold text-green-900">{notifications.length - unreadCount}</p>
                </div>
                <div className="p-3 bg-green-200 rounded-xl">
                  <CheckIcon className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="bg-gradient-to-br from-slate-50 to-slate-100 border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="text-slate-900 font-poppins">Filter Notifications</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex space-x-4">
              <Button
                variant={filter === 'all' ? 'default' : 'outline'}
                onClick={() => setFilter('all')}
                className={filter === 'all' ? 'bg-primary text-primary-foreground' : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'}
              >
                All ({notifications.length})
              </Button>
              <Button
                variant={filter === 'unread' ? 'default' : 'outline'}
                onClick={() => setFilter('unread')}
                className={filter === 'unread' ? 'bg-primary text-primary-foreground' : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'}
              >
                Unread ({unreadCount})
              </Button>
              <Button
                variant={filter === 'read' ? 'default' : 'outline'}
                onClick={() => setFilter('read')}
                className={filter === 'read' ? 'bg-primary text-primary-foreground' : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'}
              >
                Read ({notifications.length - unreadCount})
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Notifications List */}
        <Card>
          <CardHeader>
            <CardTitle>
              Notifications ({filteredNotifications.length})
            </CardTitle>
            <CardDescription>Recent notifications and updates</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-4">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="animate-pulse border rounded-lg p-4">
                    <div className="flex items-center space-x-4">
                      <div className="rounded-full bg-gray-200 h-10 w-10"></div>
                      <div className="flex-1 space-y-2">
                        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                        <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : filteredNotifications.length === 0 ? (
              <div className="text-center py-8">
                <BellIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 text-lg font-medium">No notifications found</p>
                <p className="text-gray-400 text-sm">
                  {filter === 'unread' ? 'All caught up! No unread notifications.' :
                    filter === 'read' ? 'No read notifications yet.' :
                      'You have no notifications at this time.'}
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredNotifications.map((notification: Notification) => {
                  const IconComponent = getNotificationIcon(notification.type)
                  return (
                    <div
                      key={notification.id}
                      className={`border rounded-lg p-4 hover:bg-gray-50 cursor-pointer transition-colors ${!notification.read ? 'bg-blue-50 border-blue-200' : ''
                        }`}
                      onClick={() => handleViewNotification(notification)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-4">
                          <div className={`flex-shrink-0 p-2 rounded-full ${getNotificationColor(notification.type)}`}>
                            <IconComponent className="h-5 w-5" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center space-x-2">
                              <h3 className={`text-sm font-medium ${!notification.read ? 'text-gray-900' : 'text-gray-700'}`}>
                                {notification.title}
                              </h3>
                              {!notification.read && (
                                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                  New
                                </span>
                              )}
                            </div>
                            <p className={`mt-1 text-sm ${!notification.read ? 'text-gray-600' : 'text-gray-500'}`}>
                              {notification.message.length > 100
                                ? `${notification.message.substring(0, 100)}...`
                                : notification.message}
                            </p>
                            <p className="mt-1 text-xs text-gray-400">
                              {formatDate(notification.createdAt)}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2 ml-4">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleViewNotification(notification)
                            }}
                          >
                            <EyeIcon className="h-4 w-4" />
                          </Button>
                          {!notification.read && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={(e) => {
                                e.stopPropagation()
                                handleMarkAsRead(notification)
                              }}
                              disabled={markAsReadMutation.isPending}
                            >
                              <CheckIcon className="h-4 w-4" />
                            </Button>
                          )}
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleDeleteNotification(notification)
                            }}
                            disabled={deleteNotificationMutation.isPending}
                          >
                            <TrashIcon className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Notification Details Modal */}
        <Modal
          isOpen={isNotificationModalOpen}
          onClose={() => setIsNotificationModalOpen(false)}
          title="Notification Details"
          size="md"
        >
          {selectedNotification && (
            <div className="space-y-4">
              <div className="flex items-start space-x-4">
                <div className={`flex-shrink-0 p-3 rounded-full ${getNotificationColor(selectedNotification.type)}`}>
                  {(() => {
                    const IconComponent = getNotificationIcon(selectedNotification.type)
                    return <IconComponent className="h-6 w-6" />
                  })()}
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-medium text-gray-900">
                    {selectedNotification.title}
                  </h3>
                  <p className="text-sm text-gray-500 capitalize">
                    {selectedNotification.type} notification
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-500">
                    {formatDate(selectedNotification.createdAt)}
                  </p>
                  {!selectedNotification.read && (
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 mt-1">
                      Unread
                    </span>
                  )}
                </div>
              </div>

              <div className="border-t pt-4">
                <h4 className="text-sm font-medium text-gray-900 mb-2">Message</h4>
                <p className="text-sm text-gray-700 whitespace-pre-wrap">
                  {selectedNotification.message}
                </p>
              </div>

              <div className="flex justify-end space-x-3 pt-4 border-t">
                {!selectedNotification.read && (
                  <Button
                    variant="outline"
                    onClick={() => handleMarkAsRead(selectedNotification)}
                    disabled={markAsReadMutation.isPending}
                  >
                    <CheckIcon className="h-4 w-4 mr-2" />
                    Mark as Read
                  </Button>
                )}
                <Button
                  variant="destructive"
                  onClick={() => {
                    handleDeleteNotification(selectedNotification)
                    setIsNotificationModalOpen(false)
                  }}
                  disabled={deleteNotificationMutation.isPending}
                >
                  <TrashIcon className="h-4 w-4 mr-2" />
                  Delete
                </Button>
              </div>
            </div>
          )}
        </Modal>
      </div>
    </DashboardLayout>
  )
}