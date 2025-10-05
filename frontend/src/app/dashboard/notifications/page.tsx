'use client'

import { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import DashboardLayout from '@/components/layout/dashboard-layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Modal } from '@/components/ui/modal'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import Select, { SelectOption } from '@/components/ui/select'
import { notificationApi, userApi } from '@/lib/api-functions'
import { Notification } from '@/types'
import { formatDate, formatDateTime } from '@/lib/utils'
import { toast } from 'react-hot-toast'
import { useAuth } from '@/contexts/auth-context'
import { FloatingParticlesLoader } from '@/components/ui/unique-loader'
import {
  BellIcon,
  CheckIcon,
  TrashIcon,
  EyeIcon,
  ExclamationTriangleIcon,

  CreditCardIcon,
  UserPlusIcon,
  PlusIcon
} from '@heroicons/react/24/outline'

const notificationTypes: SelectOption[] = [
  { label: 'System', value: 'system' },
  { label: 'Payment Reminder', value: 'payment_reminder' },
  { label: 'Payment Approved', value: 'payment_approved' },
  { label: 'Payment Rejected', value: 'payment_rejected' },
  { label: 'Account Status', value: 'account_status' },
]

export default function NotificationsPage() {
  const { user } = useAuth()
  const [selectedNotification, setSelectedNotification] = useState<Notification | null>(null)
  const [isNotificationModalOpen, setIsNotificationModalOpen] = useState(false)
  const [isCreateNotificationModalOpen, setIsCreateNotificationModalOpen] = useState(false)
  const [filter, setFilter] = useState<'all' | 'unread' | 'read'>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize] = useState(10)

  const [createNotificationForm, setCreateNotificationForm] = useState({
    userId: '',
    title: '',
    message: '',
    type: 'system',
  })

  const [userSearchQuery, setUserSearchQuery] = useState('')
  const [selectedUser, setSelectedUser] = useState<{ label: string; value: string } | null>(null)

  const queryClient = useQueryClient()

  // Helper function to convert backend response to frontend format
  const transformNotification = (notification: any): Notification => {
    return {
      ...notification,
      read: notification.status === 'read', // Add compatibility field
    }
  }

  const { data: notificationsData, isLoading } = useQuery({
    queryKey: ['notifications', filter, searchQuery, currentPage, pageSize],
    queryFn: () =>
      notificationApi.getNotifications({
        page: currentPage,
        limit: pageSize,
        search: searchQuery || undefined,
        status: filter === 'all' ? undefined : filter === 'read' ? 'read' : 'unread',
      }),
  })

  // Fetch users for the dropdown
  const { data: usersData } = useQuery({
    queryKey: ['users', userSearchQuery],
    queryFn: () => userApi.getAllUsers({
      search: userSearchQuery || undefined,
      limit: 50 // Limit to 50 users for performance
    }),
    enabled: isCreateNotificationModalOpen,
  })

  const rawNotifications = notificationsData?.notifications ?? []
  const notifications = rawNotifications.map(transformNotification)
  const unreadCount = notifications.filter((notification) => !notification.read).length
  const markAsReadMutation = useMutation({
    mutationFn: (notificationId: string) => notificationApi.markAsRead(notificationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] })
      toast.success('Notification marked as read!')
      // Close the modal if it's open
      setIsNotificationModalOpen(false)
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

  const createNotificationMutation = useMutation({
    mutationFn: async (data: { userId: string; title: string; message: string; type: string }) => {
      // If "all" is selected, send notifications to all users using bulk API
      if (data.userId === 'all') {
        const allUsers = usersData?.users || []
        const userIds = allUsers.map(user => user.id)
        const result = await notificationApi.createBulkNotification({
          userIds,
          title: data.title,
          message: data.message,
          type: data.type
        })
        return {
          ...result,
          message: `Notification sent to ${userIds.length} users`
        }
      } else {
        return notificationApi.createNotification(data)
      }
    },
    onSuccess: (result: any) => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] })
      const message = result?.message || 'Notification created successfully!'
      toast.success(message)
      setIsCreateNotificationModalOpen(false)
      setCreateNotificationForm({
        userId: '',
        title: '',
        message: '',
        type: 'system',
      })
      setSelectedUser(null)
      setUserSearchQuery('')
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to create notification')
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

  // Reset to first page when search/filter changes
  useEffect(() => {
    setCurrentPage(1)
  }, [searchQuery, filter])

  const handlePreviousPage = () => {
    setCurrentPage(prev => Math.max(1, prev - 1))
  }

  const handleNextPage = () => {
    if (notificationsData?.pagination && currentPage < notificationsData.pagination.totalPages) {
      setCurrentPage(prev => prev + 1)
    }
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
        return '!text-green-600'
      case 'payment_reminder':
        return 'text-yellow-600'
      case 'payment_rejected':
        return 'text-red-600'
      case 'account_status':
        return 'text-blue-600'
      case 'system':
      default:
        return '!text-yellow-600'
    }
  }

  const filteredNotifications = notifications.filter((notification: Notification) => {
    if (filter === 'read') return notification.read
    if (filter === 'unread') return !notification.read
    return true
  })

  // Create user options for dropdown
  const userOptions = [
    { label: '📢 All Users', value: 'all' },
    ...(usersData?.users || []).map(user => ({
      label: `${user.firstName} ${user.lastName} (${user.email})`,
      value: user.id
    }))
  ]

  const handleUserSelect = (value: string) => {
    const selectedOption = userOptions.find(option => option.value === value)
    setSelectedUser(selectedOption || null)
    setCreateNotificationForm({ ...createNotificationForm, userId: value })
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="md:flex md:items-center md:justify-between">
          <div className="flex-1 min-w-0">
            <h1 className="text-3xl font-bold leading-7 text-foreground sm:text-4xl sm:truncate font-poppins">
              Notifications
            </h1>
            <p className="mt-2 text-base text-muted-foreground">
              Stay updated with payment requests, user activities, and system updates
            </p>
          </div>
          <div className="mt-4 flex md:mt-0 md:ml-4 space-x-3">
            {user?.role === 'admin' && (
              <Button
                onClick={() => setIsCreateNotificationModalOpen(true)}
                className="bg-gradient-to-r from-blue-600 via-blue-500 to-blue-600 text-white shadow-lg transform scale-100 border border-blue-400/30"
              >
                <PlusIcon className="h-4 w-4 mr-2" />
                Add Notification
              </Button>
            )}
            {unreadCount > 0 && (
              <Button
                onClick={handleMarkAllAsRead}
                disabled={markAllAsReadMutation.isPending}
                className="bg-primary hover:bg-primary/90 text-primary-foreground"
              >
                <CheckIcon className="h-4 w-4 mr-2" />
                Mark All Read ({unreadCount})
              </Button>
            )}
          </div>
        </div>

        {/* Notification Statistics */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
          <Card className="card-enhanced">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-foreground/80 mb-1">Total</p>
                  <p className="text-3xl font-bold text-foreground">{notifications.length}</p>
                </div>
                <div className="p-3 bg-primary/10 rounded-xl">
                  <BellIcon className="h-6 w-6 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="card-enhanced">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-foreground/80 mb-1">Unread</p>
                  <p className="text-3xl font-bold text-foreground">{unreadCount}</p>
                </div>
                <div className="p-3 bg-yellow-500/10 rounded-xl">
                  <ExclamationTriangleIcon className="h-6 w-6 text-yellow-500" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="card-enhanced">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-foreground/80 mb-1">Read</p>
                  <p className="text-3xl font-bold text-foreground">{notifications.length - unreadCount}</p>
                </div>
                <div className="p-3 bg-green-500/10 rounded-xl">
                  <CheckIcon className="h-6 w-6 text-green-500" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search & Filters */}
        <Card className="card-enhanced">
          <CardHeader>
            <CardTitle className="text-foreground font-poppins">Search & Filter Notifications</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Search */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-4 w-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <Input
                type="text"
                placeholder="Search notifications by title or message..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Filter Buttons */}
            <div className="hidden sm:flex space-x-4">
              <Button
                variant={filter === 'all' ? 'default' : 'outline'}
                onClick={() => setFilter('all')}
                className={filter === 'all' ? 'card-enhanced2 !border-gray-400 !border-2 text-primary-foreground hover:bg-primary/90' : 'card-enhanced2 text-foreground hover:bg-accent hover:text-accent-foreground'}
              >
                All ({notifications.length})
              </Button>
              <Button
                variant={filter === 'unread' ? 'default' : 'outline'}
                onClick={() => setFilter('unread')}
                className={filter === 'unread' ? 'card-enhanced2 !border-gray-400 !border-2 text-primary-foreground hover:bg-primary/90' : 'card-enhanced2 text-foreground hover:bg-accent hover:text-accent-foreground'}
              >
                Unread ({unreadCount})
              </Button>
              <Button
                variant={filter === 'read' ? 'default' : 'outline'}
                onClick={() => setFilter('read')}
                className={filter === 'read' ? 'card-enhanced2 !border-gray-400 !border-2 text-primary-foreground hover:bg-primary/90' : 'card-enhanced2 text-foreground hover:bg-accent hover:text-accent-foreground'}
              >
                Read ({notifications.length - unreadCount})
              </Button>
            </div>

            {/* Dropdown for smaller screens */}
            <div className="sm:hidden">
              <Select
                value={filter}
                onChange={(value) => setFilter(value as 'all' | 'unread' | 'read')}
                options={[
                  { label: `All (${notifications.length})`, value: 'all' },
                  { label: `Unread (${unreadCount})`, value: 'unread' },
                  { label: `Read (${notifications.length - unreadCount})`, value: 'read' }
                ]}
              />
            </div>
          </CardContent>
        </Card>

        {/* Notifications List */}
        <Card className="card-enhanced">
          <CardHeader>
            <CardTitle className="text-foreground">
              Notifications ({filteredNotifications.length})
            </CardTitle>
            <CardDescription className="text-muted-foreground">Recent notifications and updates</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <FloatingParticlesLoader message="Loading notifications..." />
            ) : filteredNotifications.length === 0 ? (
              <div className="text-center py-8">
                <BellIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground text-lg font-medium">No notifications found</p>
                <p className="text-muted-foreground/80 text-sm">
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
                      className={`border border-border rounded-lg p-4 hover:bg-accent cursor-pointer transition-colors ${!notification.read ? 'bg-accent/50' : 'bg-card'
                        }`}
                      onClick={() => handleViewNotification(notification)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-4">
                          <div className={`flex-shrink-0 p-2 border-2 !rounded-full ${getNotificationColor(notification.type)}`}>
                            <IconComponent className="h-5 w-5" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center space-x-2">
                              <h3 className={`text-sm font-medium ${!notification.read ? 'text-foreground' : 'text-foreground/80'}`}>
                                {notification.title}
                              </h3>
                              {!notification.read && (
                                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-primary/20 animate-pulse !text-red-600">
                                  New
                                </span>
                              )}
                            </div>
                            <p className={`mt-1 text-sm ${!notification.read ? 'text-foreground/90' : 'text-foreground/70'}`}>
                              {notification.message.length > 100
                                ? `${notification.message.substring(0, 100)}...`
                                : notification.message}
                            </p>
                            <p className="mt-1 text-xs text-muted-foreground">
                              {formatDateTime(notification.createdAt)}
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
                            className="card-enhanced2 hover:bg-accent hover:text-accent-foreground text-foreground"
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
                              className="card-enhanced2 hover:bg-accent hover:text-accent-foreground text-foreground"
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
                            className="bg-destructive hover:bg-destructive/90 border-0"
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
          {!isLoading && notifications.length > 0 && notificationsData?.pagination && notificationsData.pagination.totalPages > 1 && (
            <CardContent className="pt-0">
              <div className="flex items-center justify-between border-t border-border/50 pt-4">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span>Page {currentPage} of {notificationsData.pagination.totalPages}</span>
                  <span className="text-muted-foreground/60">•</span>
                  <span>{notificationsData.pagination.total} total notifications</span>
                </div>
                <div className="flex gap-1">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handlePreviousPage}
                    disabled={currentPage <= 1}
                    className="text-xs px-3 py-1.5 h-auto"
                  >
                    ← Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleNextPage}
                    disabled={!notificationsData?.pagination || currentPage >= notificationsData.pagination.totalPages}
                    className="text-xs px-3 py-1.5 h-auto"
                  >
                    Next →
                  </Button>
                </div>
              </div>
            </CardContent>
          )}
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
                  <h3 className="text-lg font-medium text-foreground">
                    {selectedNotification.title}
                  </h3>
                  <p className="text-sm text-muted-foreground capitalize">
                    {selectedNotification.type} notification
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">
                    {formatDateTime(selectedNotification.createdAt)}
                  </p>
                  {!selectedNotification.read && (
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 mt-1">
                      Unread
                    </span>
                  )}
                </div>
              </div>

              <div className="border-t pt-4">
                <h4 className="text-sm font-medium text-foreground mb-2">Message</h4>
                <p className="text-sm text-foreground whitespace-pre-wrap">
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
                  className='bg-red-800 hover:bg-red-600'
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

        {/* Create Notification Modal */}
        <Modal
          isOpen={isCreateNotificationModalOpen}
          onClose={() => {
            setIsCreateNotificationModalOpen(false)
            setCreateNotificationForm({
              userId: '',
              title: '',
              message: '',
              type: 'system',
            })
            setSelectedUser(null)
            setUserSearchQuery('')
          }}
          title="Create Notification"
          size="lg"
        >
          <div className="space-y-6">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300">Select User</label>
                <div className="space-y-2">
                  <Input
                    variant="modal"
                    value={userSearchQuery}
                    onChange={(e) => setUserSearchQuery(e.target.value)}
                    placeholder="Search users by name or email..."
                    className="mb-2"
                  />
                  <Select
                    variant="modal"
                    value={createNotificationForm.userId}
                    onChange={handleUserSelect}
                    options={userOptions}
                    placeholder="Choose a user or select All"
                  />
                  {selectedUser && (
                    <div className="text-xs text-gray-400 mt-1">
                      Selected: {selectedUser.label}
                    </div>
                  )}
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300">Notification Type</label>
                <Select
                  variant="modal"
                  value={createNotificationForm.type}
                  onChange={(value) => setCreateNotificationForm({ ...createNotificationForm, type: value })}
                  options={notificationTypes}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-300">Title</label>
              <Input
                variant="modal"
                value={createNotificationForm.title}
                onChange={(e) => setCreateNotificationForm({ ...createNotificationForm, title: e.target.value })}
                placeholder="Enter notification title"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-300">Message</label>
              <Textarea
                variant="modal"
                value={createNotificationForm.message}
                onChange={(e) => setCreateNotificationForm({ ...createNotificationForm, message: e.target.value })}
                placeholder="Enter notification message"
                rows={4}
              />
            </div>

            <div className="flex justify-end space-x-3 pt-4">
              <Button
                variant="outline"
                className="card-enhanced2"
                onClick={() => {
                  setIsCreateNotificationModalOpen(false)
                  setCreateNotificationForm({
                    userId: '',
                    title: '',
                    message: '',
                    type: 'system',
                  })
                  setSelectedUser(null)
                  setUserSearchQuery('')
                }}
              >
                Cancel
              </Button>
              <Button
                onClick={() => createNotificationMutation.mutate(createNotificationForm)}
                disabled={createNotificationMutation.isPending || !createNotificationForm.userId || !createNotificationForm.title || !createNotificationForm.message}
                className='bg-gradient-to-r from-blue-600 via-blue-500 to-blue-600 text-white shadow-lg transform scale-100 border border-blue-400/30'
              >
                {createNotificationMutation.isPending ? 'Creating...' : 'Create Notification'}
              </Button>
            </div>
          </div>
        </Modal>
      </div>
    </DashboardLayout>
  )
}