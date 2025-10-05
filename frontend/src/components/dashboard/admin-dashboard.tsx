'use client'

import { useQuery } from '@tanstack/react-query'
import { useAuth } from '@/contexts/auth-context'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { WiFiSignalLoader, FloatingParticlesLoader } from '@/components/ui/unique-loader'
import { adminApi } from '@/lib/api-functions'
import { formatCurrency } from '@/lib/utils'
import Link from 'next/link'
import {
  UsersIcon,
  CreditCardIcon,
  ChartBarIcon,
  BellIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline'

export default function AdminDashboard() {
  const { user } = useAuth()

  const { data: userStats, isLoading: isLoadingUsers, error: userStatsError } = useQuery({
    queryKey: ['admin-dashboard-stats'],
    queryFn: () => adminApi.getDashboardStats(),
  })

  const { data: paymentStats, isLoading: isLoadingPayments, error: paymentStatsError } = useQuery({
    queryKey: ['payment-dashboard-stats'],
    queryFn: () => adminApi.getPaymentStats(),
  })

  const users = userStats || {
    totalUsers: 0,
    activeUsers: 0,
    inactiveUsers: 0,
    suspendedUsers: 0,
    recentUsers: [
      { id: '1', firstName: 'Rahul', lastName: 'Singh', email: 'rahul@example.com', status: 'active', createdAt: '2025-10-04' },
      { id: '2', firstName: 'Vaani', lastName: 'Singh', email: 'vaani@example.com', status: 'active', createdAt: '2025-10-04' },
      { id: '3', firstName: 'Bob', lastName: 'Wilson', email: 'bob@example.com', status: 'inactive', createdAt: '2025-09-14' }
    ]
  }
  const payments = paymentStats || { totalPayments: 0, pendingPayments: 0, approvedPayments: 0, rejectedPayments: 0, totalRevenue: 0, recentPayments: [] }
  const isLoading = isLoadingUsers || isLoadingPayments

  // Debug logging
  if (userStatsError) {
    console.error('User stats error:', userStatsError)
  }
  if (paymentStatsError) {
    console.error('Payment stats error:', paymentStatsError)
  }

  if (userStatsError || paymentStatsError) {
    return (
      <div className="space-y-6 sm:space-y-8">
        <Card className="bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800">
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <ExclamationTriangleIcon className="h-6 w-6 text-red-600 dark:text-red-400" />
              <div>
                <h3 className="text-red-800 dark:text-red-200 font-semibold">Error Loading Dashboard</h3>
                <p className="text-red-600 dark:text-red-400 text-sm">
                  {userStatsError ? 'Failed to load user statistics. ' : ''}
                  {paymentStatsError ? 'Failed to load payment statistics.' : ''}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6 sm:space-y-8">

      {isLoading ? (
        <WiFiSignalLoader message="Loading dashboard stats..." />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {/* Total Users Card */}
          <Card className="bg-gradient-to-br from-sky-50 to-blue-100 dark:from-sky-900/20 dark:to-blue-800/20 border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <p className="text-xs sm:text-sm font-medium text-sky-700 dark:text-sky-300 mb-1 truncate">Total Users</p>
                  <div className="text-2xl sm:text-3xl font-bold text-sky-900 dark:text-sky-100">
                    {users.totalUsers || 0}
                  </div>
                  <p className="text-xs text-sky-600 dark:text-sky-400 mt-1 truncate">Registered accounts</p>
                </div>
                <div className="p-2 sm:p-3 bg-sky-200 dark:bg-sky-800/50 rounded-xl flex-shrink-0">
                  <UsersIcon className="h-5 w-5 sm:h-6 sm:w-6 text-sky-600 dark:text-sky-300" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Active Users Card */}
          <Card className="bg-gradient-to-br from-emerald-50 to-teal-100 dark:from-emerald-900/20 dark:to-teal-800/20 border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <p className="text-xs sm:text-sm font-medium text-emerald-700 dark:text-emerald-300 mb-1 truncate">Active Users</p>
                  <div className="text-2xl sm:text-3xl font-bold text-emerald-900 dark:text-emerald-100">
                    {users.activeUsers || 0}
                  </div>
                  <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-1 truncate">Currently connected</p>
                </div>
                <div className="p-2 sm:p-3 bg-emerald-200 dark:bg-emerald-800/50 rounded-xl flex-shrink-0">
                  <CheckCircleIcon className="h-5 w-5 sm:h-6 sm:w-6 text-emerald-600 dark:text-emerald-300" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Total Revenue Card */}
          <Card className="bg-gradient-to-br from-violet-50 to-purple-100 dark:from-violet-900/20 dark:to-purple-800/20 border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-violet-700 dark:text-violet-300 mb-1">Total Revenue</p>
                  <div className="text-3xl font-bold text-violet-900 dark:text-violet-100">
                    {formatCurrency(payments.totalRevenue || 0)}
                  </div>
                  <p className="text-xs text-violet-600 dark:text-violet-400 mt-1">Approved payments</p>
                </div>
                <div className="p-3 bg-violet-200 dark:bg-violet-800/50 rounded-xl">
                  <CreditCardIcon className="h-6 w-6 text-violet-600 dark:text-violet-300" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Pending Payments Card */}
          <Card className="bg-gradient-to-br from-amber-50 to-orange-100 dark:from-amber-900/20 dark:to-orange-800/20 border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-amber-700 dark:text-amber-300 mb-1">Pending Payments</p>
                  <div className="text-3xl font-bold text-amber-900 dark:text-amber-100">
                    {payments.pendingPayments || 0}
                  </div>
                  <p className="text-xs text-amber-600 dark:text-amber-400 mt-1">Awaiting approval</p>
                </div>
                <div className="p-3 bg-amber-200 dark:bg-amber-800/50 rounded-xl">
                  <ExclamationTriangleIcon className="h-6 w-6 text-amber-600 dark:text-amber-300" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Activity */}
        <Card className="bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800/20 dark:to-slate-700/20 border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="text-indigo-900 dark:text-indigo-100 font-poppins flex items-center">
              <ChartBarIcon className="h-5 w-5 mr-2 text-[#1881d0] dark:text-indigo-400" />
              Recent Activity
            </CardTitle>
            <CardDescription className="text-[#1881d0] dark:text-indigo-300">Latest user registrations and payment activities</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <FloatingParticlesLoader message="Loading recent activity..." />
            ) : (
              <div className="space-y-4">
                {users.recentUsers && users.recentUsers.length > 0 ? (
                  users.recentUsers.slice(0, 3).map((recentUser: any) => {
                    const firstName = recentUser.firstName || '';
                    const lastName = recentUser.lastName || '';
                    const fullName = `${firstName} ${lastName}`.trim() || recentUser.email || 'Unknown User';
                    const initials = firstName.charAt(0)?.toUpperCase() || recentUser.email?.charAt(0)?.toUpperCase() || 'U';

                    return (
                      <div key={recentUser.id} className="flex items-center space-x-3 p-3 bg-white dark:bg-slate-800/50 rounded-lg border border-gray-100 dark:border-slate-700">
                        <div className="flex-shrink-0">
                          <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-sm">
                            <span className="text-sm font-semibold text-white">
                              {initials}
                            </span>
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">{fullName}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            Joined {recentUser.createdAt ? new Date(recentUser.createdAt).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric'
                            }) : 'recently'}
                          </p>
                        </div>
                        <div className="flex-shrink-0">
                          <span className={`inline-flex items-center capitalize px-2 py-1 rounded-full text-xs font-medium ${recentUser.status === 'active'
                            ? 'bg-green-800 text-green-100 dark:bg-green-700 dark:text-green-100'
                            : recentUser.status === 'inactive'
                              ? 'bg-red-600 text-red-100 dark:bg-red-600 dark:text-red-100'
                              : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
                            }`}>
                            {recentUser.status || 'active'}
                          </span>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="text-center py-8">
                    <p className="text-gray-500 dark:text-gray-400 text-sm">No recent users to display</p>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card className="bg-gradient-to-br from-indigo-50 to-purple-100 dark:from-indigo-900/20 dark:to-blue-800/20 border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="text-indigo-900 dark:text-indigo-100 font-poppins flex items-center">
              <BellIcon className="h-5 w-5 mr-2 text-indigo-600 dark:text-indigo-400" />
              Quick Actions
            </CardTitle>
            <CardDescription className="text-indigo-600 dark:text-indigo-300">Manage your WiFi network efficiently</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center space-y-4 py-8">
            <Link href="/dashboard/users" className="block w-full max-w-sm">
              <Button className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 dark:from-blue-600/20 dark:to-blue-700/20 dark:hover:from-blue-600/30 dark:hover:to-blue-700/30 text-white border-0 dark:border dark:border-blue-500/20 shadow-sm hover:shadow-lg hover:scale-[1.02] transition-all duration-200">
                <UsersIcon className="h-4 w-4 mr-2" />
                View All Users
              </Button>
            </Link>
            <Link href="/dashboard/payments" className="block w-full max-w-sm">
              <Button className="w-full bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 dark:from-emerald-600/20 dark:to-emerald-700/20 dark:hover:from-emerald-600/30 dark:hover:to-emerald-700/30 text-white border-0 dark:border dark:border-emerald-500/20 shadow-sm hover:shadow-lg hover:scale-[1.02] transition-all duration-200">
                <CreditCardIcon className="h-4 w-4 mr-2" />
                Review Payments
              </Button>
            </Link>
            <Link href="/dashboard/notifications" className="block w-full max-w-sm">
              <Button className="w-full bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 dark:from-purple-600/20 dark:to-purple-700/20 dark:hover:from-purple-600/30 dark:hover:to-purple-700/30 text-white border-0 dark:border dark:border-purple-500/20 shadow-sm hover:shadow-lg hover:scale-[1.02] transition-all duration-200">
                <BellIcon className="h-4 w-4 mr-2" />
                Send Notifications
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

