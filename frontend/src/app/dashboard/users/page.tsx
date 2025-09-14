'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import DashboardLayout from '@/components/layout/dashboard-layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Modal } from '@/components/ui/modal'
import { userApi, paymentApi } from '@/lib/api-functions'
import { formatCurrency, getUserStatusColor, formatDate } from '@/lib/utils'
import { User, Payment } from '@/types'
import { toast } from 'react-hot-toast'
import {
  MagnifyingGlassIcon,
  EyeIcon,
  UserMinusIcon,
  UserPlusIcon,
  ExclamationTriangleIcon,
  CreditCardIcon
} from '@heroicons/react/24/outline'

export default function AllUsersPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [paymentStatusFilter, setPaymentStatusFilter] = useState('')
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [isUserModalOpen, setIsUserModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [userToDelete, setUserToDelete] = useState<User | null>(null)
  const [isActivationModalOpen, setIsActivationModalOpen] = useState(false)
  const [userToActivate, setUserToActivate] = useState<User | null>(null)
  const [activationDuration, setActivationDuration] = useState(1)

  const queryClient = useQueryClient()

  const { data: usersData, isLoading } = useQuery({
    queryKey: ['users', searchQuery, statusFilter, paymentStatusFilter],
    queryFn: () => userApi.getAllUsers({
      search: searchQuery || undefined,
      status: statusFilter || undefined,
      paymentStatus: paymentStatusFilter || undefined
    }),
  })

  const { data: userPayments } = useQuery({
    queryKey: ['user-payments', selectedUser?.id],
    queryFn: () => selectedUser ? paymentApi.getUserPayments(selectedUser.id) : null,
    enabled: !!selectedUser?.id,
  })

  const updateUserStatusMutation = useMutation({
    mutationFn: ({ userId, status }: { userId: string; status: 'active' | 'inactive' | 'suspended' }) =>
      userApi.updateUserStatus(userId, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] })
      toast.success('User status updated successfully!')
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to update user status')
    },
  })

  const deleteUserMutation = useMutation({
    mutationFn: (userId: string) => userApi.deleteUser(userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] })
      toast.success('User deleted successfully!')
      setIsDeleteModalOpen(false)
      setUserToDelete(null)
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to delete user')
    },
  })

  const activateUserMutation = useMutation({
    mutationFn: ({ userId, duration }: { userId: string; duration: number }) =>
      paymentApi.createPayment({
        amount: duration * 500, // Assuming 500 per month
        duration,
        method: 'qr'
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] })
      toast.success('User activated successfully!')
      setIsActivationModalOpen(false)
      setUserToActivate(null)
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to activate user')
    },
  })

  const users = usersData?.data?.data?.data || []

  const handleUserStatusChange = (user: User, status: 'active' | 'inactive' | 'suspended') => {
    updateUserStatusMutation.mutate({ userId: user.id, status })
  }

  const handleDeleteUser = (user: User) => {
    setUserToDelete(user)
    setIsDeleteModalOpen(true)
  }

  const confirmDelete = () => {
    if (userToDelete) {
      deleteUserMutation.mutate(userToDelete.id)
    }
  }

  const handleActivateUser = (user: User) => {
    setUserToActivate(user)
    setIsActivationModalOpen(true)
  }

  const confirmActivation = () => {
    if (userToActivate) {
      activateUserMutation.mutate({
        userId: userToActivate.id,
        duration: activationDuration
      })
    }
  }

  const handleViewUser = (user: User) => {
    setSelectedUser(user)
    setIsUserModalOpen(true)
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="md:flex md:items-center md:justify-between">
          <div className="flex-1 min-w-0">
            <h1 className="text-3xl font-bold leading-7 text-foreground sm:text-4xl sm:truncate font-poppins">
              All Users
            </h1>
            <p className="mt-1 text-base text-muted-foreground">
              Manage all registered users and their WiFi access
            </p>
          </div>
        </div>

        {/* Filters */}
        <Card className="bg-gradient-to-br from-slate-50 to-slate-100 border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="text-slate-900 font-poppins">Search & Filters</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="relative">
                <MagnifyingGlassIcon className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name or email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-white border-slate-200 text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-primary"
                />
              </div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              >
                <option value="">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="suspended">Suspended</option>
              </select>
              <select
                value={paymentStatusFilter}
                onChange={(e) => setPaymentStatusFilter(e.target.value)}
                className="rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              >
                <option value="">All Payment Status</option>
                <option value="paid">Paid</option>
                <option value="pending">Pending</option>
                <option value="overdue">Overdue</option>
              </select>
              <Button
                onClick={() => {
                  setSearchQuery('')
                  setStatusFilter('')
                  setPaymentStatusFilter('')
                }}
                variant="outline"
                className="bg-white border-slate-200 hover:bg-slate-50 text-slate-700"
              >
                Clear Filters
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Users List */}
        <Card className="bg-gradient-to-br from-white to-slate-50 border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="text-slate-900 font-poppins">Users ({users.length})</CardTitle>
            <CardDescription className="text-slate-600">Manage user accounts and WiFi access</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-4">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="animate-pulse border rounded-lg p-4">
                    <div className="flex items-center space-x-4">
                      <div className="rounded-full bg-gray-200 h-12 w-12"></div>
                      <div className="flex-1 space-y-2">
                        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                        <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : users.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500">No users found matching your criteria</p>
              </div>
            ) : (
              <div className="space-y-4">
                {users.map((user: User) => (
                  <div key={user.id} className="border border-slate-200 rounded-xl p-6 hover:bg-gradient-to-r hover:from-slate-50 hover:to-blue-50 transition-all duration-200 bg-white shadow-sm">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="flex-shrink-0">
                          <div className="h-14 w-14 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg">
                            <span className="text-xl font-bold text-white">
                              {user.name.charAt(0).toUpperCase()}
                            </span>
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-lg font-semibold text-slate-900 font-poppins">{user.name}</p>
                          <p className="text-sm text-slate-600 font-medium">{user.email}</p>
                          <p className="text-sm text-slate-500">{user.phone}</p>
                          <div className="flex items-center space-x-2 mt-2">
                            <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${getUserStatusColor(user.status)}`}>
                              {user.status}
                            </span>
                            <span className="text-xs text-slate-500 font-medium">
                              Joined {formatDate(user.createdAt)}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleViewUser(user)}
                          className="bg-white border-slate-200 hover:bg-slate-50 text-slate-700"
                        >
                          <EyeIcon className="h-4 w-4 mr-1" />
                          View
                        </Button>
                        {user.status === 'active' ? (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleUserStatusChange(user, 'inactive')}
                            className="border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300"
                          >
                            <UserMinusIcon className="h-4 w-4 mr-1" />
                            Deactivate
                          </Button>
                        ) : (
                          <Button
                            size="sm"
                            onClick={() => handleActivateUser(user)}
                            className="bg-green-600 hover:bg-green-700 text-white border-0"
                          >
                            <UserPlusIcon className="h-4 w-4 mr-1" />
                            Activate
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleDeleteUser(user)}
                          className="bg-red-600 hover:bg-red-700 border-0"
                        >
                          Delete
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* User Details Modal */}
        <Modal
          isOpen={isUserModalOpen}
          onClose={() => setIsUserModalOpen(false)}
          title={selectedUser ? `${selectedUser.name} - Details` : ''}
          size="lg"
        >
          {selectedUser && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h3 className="text-lg font-medium text-gray-900">User Information</h3>
                  <dl className="mt-2 space-y-2">
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Name</dt>
                      <dd className="text-sm text-gray-900">{selectedUser.name}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Email</dt>
                      <dd className="text-sm text-gray-900">{selectedUser.email}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Phone</dt>
                      <dd className="text-sm text-gray-900">{selectedUser.phone}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Address</dt>
                      <dd className="text-sm text-gray-900">{selectedUser.address}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Status</dt>
                      <dd>
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getUserStatusColor(selectedUser.status)}`}>
                          {selectedUser.status}
                        </span>
                      </dd>
                    </div>
                  </dl>
                </div>
                <div>
                  <h3 className="text-lg font-medium text-gray-900">Payment History</h3>
                  <div className="mt-2 space-y-2 max-h-64 overflow-y-auto">
                    {userPayments?.data?.data?.map((payment: Payment) => (
                      <div key={payment.id} className="border rounded p-2">
                        <div className="flex justify-between items-center">
                          <div>
                            <p className="text-sm font-medium">{formatCurrency(payment.amount)}</p>
                            <p className="text-xs text-gray-500">{payment.duration} months</p>
                          </div>
                          <div className="text-right">
                            <p className="text-xs">{formatDate(payment.createdAt)}</p>
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${payment.status === 'approved' ? 'bg-green-100 text-green-800' :
                              payment.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                'bg-red-100 text-red-800'
                              }`}>
                              {payment.status}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </Modal>

        {/* Delete Confirmation Modal */}
        <Modal
          isOpen={isDeleteModalOpen}
          onClose={() => setIsDeleteModalOpen(false)}
          title="Delete User"
          size="sm"
        >
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <ExclamationTriangleIcon className="h-6 w-6 text-red-600" />
              <div>
                <h3 className="text-lg font-medium text-gray-900">Are you sure?</h3>
                <p className="text-sm text-gray-500">
                  This action cannot be undone. This will permanently delete {userToDelete?.name}'s account and all associated data.
                </p>
              </div>
            </div>
            <div className="flex justify-end space-x-3">
              <Button
                variant="outline"
                onClick={() => setIsDeleteModalOpen(false)}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={confirmDelete}
                disabled={deleteUserMutation.isPending}
              >
                {deleteUserMutation.isPending ? 'Deleting...' : 'Delete User'}
              </Button>
            </div>
          </div>
        </Modal>

        {/* Activation Modal */}
        <Modal
          isOpen={isActivationModalOpen}
          onClose={() => setIsActivationModalOpen(false)}
          title="Activate User WiFi"
          size="sm"
        >
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-medium text-gray-900">
                Activate WiFi for {userToActivate?.name}
              </h3>
              <p className="text-sm text-gray-500">
                Select the duration for WiFi activation
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Duration (months)
              </label>
              <select
                value={activationDuration}
                onChange={(e) => setActivationDuration(Number(e.target.value))}
                className="mt-1 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value={1}>1 Month - ₹500</option>
                <option value={2}>2 Months - ₹1,000</option>
                <option value={3}>3 Months - ₹1,500</option>
                <option value={6}>6 Months - ₹3,000</option>
                <option value={12}>12 Months - ₹6,000</option>
              </select>
            </div>
            <div className="flex justify-end space-x-3">
              <Button
                variant="outline"
                onClick={() => setIsActivationModalOpen(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={confirmActivation}
                disabled={activateUserMutation.isPending}
              >
                <CreditCardIcon className="h-4 w-4 mr-2" />
                {activateUserMutation.isPending ? 'Activating...' : 'Activate WiFi'}
              </Button>
            </div>
          </div>
        </Modal>
      </div>
    </DashboardLayout>
  )
}