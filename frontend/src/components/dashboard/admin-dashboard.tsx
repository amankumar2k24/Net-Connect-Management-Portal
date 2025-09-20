'use client'

import { useQuery } from '@tanstack/react-query'
import { useAuth } from '@/contexts/auth-context'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { LoadingSpinner, LoadingCard } from '@/components/ui/loading'
import { adminApi } from '@/lib/api-functions'
import { formatCurrency } from '@/lib/utils'
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

  const { data: userStats, isLoading: isLoadingUsers } = useQuery({
    queryKey: ['admin-dashboard-stats'],
    queryFn: () => adminApi.getDashboardStats(),
  })

  const { data: paymentStats, isLoading: isLoadingPayments } = useQuery({
    queryKey: ['payment-dashboard-stats'],
    queryFn: () => adminApi.getPaymentStats(),
  })

  const users = userStats || { totalUsers: 0, activeUsers: 0, inactiveUsers: 0, suspendedUsers: 0, recentUsers: [] }
  const payments = paymentStats || { totalPayments: 0, pendingPayments: 0, approvedPayments: 0, rejectedPayments: 0, totalRevenue: 0, recentPayments: [] }
  const isLoading = isLoadingUsers || isLoadingPayments

  return (
    <div className="space-y-8">
      <div className="flex flex-col space-y-3">
        <h1 className="text-4xl font-bold text-foreground font-poppins">Dashboard</h1>
        <p className="text-muted-foreground text-lg">
          Welcome back, {user?.firstName} {user?.lastName}! Here's what's happening with your WiFi network.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Users Card */}
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-700 mb-1">Total Users</p>
                <div className="text-3xl font-bold text-blue-900">
                  {isLoading ? <LoadingSpinner size="sm" /> : users.totalUsers || 0}
                </div>
                <p className="text-xs text-blue-600 mt-1">Registered accounts</p>
              </div>
              <div className="p-3 bg-blue-200 rounded-xl">
                <UsersIcon className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Active Users Card */}
        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-700 mb-1">Active Users</p>
                <p className="text-3xl font-bold text-green-900">
                  {isLoading ? <LoadingSpinner size="sm" /> : users.activeUsers || 0}
                </p>
                <p className="text-xs text-green-600 mt-1">Currently connected</p>
              </div>
              <div className="p-3 bg-green-200 rounded-xl">
                <CheckCircleIcon className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Total Revenue Card */}
        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-700 mb-1">Total Revenue</p>
                <p className="text-3xl font-bold text-purple-900">
                  {isLoading ? <LoadingSpinner size="sm" /> : formatCurrency(payments.totalRevenue || 0)}
                </p>
                <p className="text-xs text-purple-600 mt-1">Approved payments</p>
              </div>
              <div className="p-3 bg-purple-200 rounded-xl">
                <CreditCardIcon className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Pending Payments Card */}
        <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100 border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-yellow-700 mb-1">Pending Payments</p>
                <p className="text-3xl font-bold text-yellow-900">
                  {isLoading ? <LoadingSpinner size="sm" /> : payments.pendingPayments || 0}
                </p>
                <p className="text-xs text-yellow-600 mt-1">Awaiting approval</p>
              </div>
              <div className="p-3 bg-yellow-200 rounded-xl">
                <ExclamationTriangleIcon className="h-6 w-6 text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Activity */}
        <Card className="bg-gradient-to-br from-slate-50 to-slate-100 border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="text-indigo-900 font-poppins flex items-center">
              <ChartBarIcon className="h-5 w-5 mr-2 text-indigo-600" />
              Recent Activity
            </CardTitle>
            <CardDescription className="text-indigo-600">Latest user registrations and payment activities</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-4">
                {Array.from({ length: 3 }).map((_, i) => (
                  <LoadingCard key={i} className="h-16" />
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {users.recentUsers?.slice(0, 3).map((recentUser: any) => (
                  <div key={recentUser.id} className="flex items-center space-x-3 p-3 bg-card rounded-lg">
                    <div className="flex-shrink-0">
                      <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                        <span className="text-sm font-medium text-blue-600">
                          {recentUser.firstName?.charAt(0).toUpperCase()}
                        </span>
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground">{recentUser.firstName} {recentUser.lastName}</p>
                      <p className="text-xs text-black">Joined recently</p>
                    </div>
                  </div>
                )) || (
                    <p className="text-black text-center py-4">No recent activity to display.</p>
                  )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card className="bg-gradient-to-br from-indigo-50 to-indigo-100 border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="text-indigo-900 font-poppins flex items-center">
              <BellIcon className="h-5 w-5 mr-2 text-indigo-600" />
              Quick Actions
            </CardTitle>
            <CardDescription className="text-indigo-600">Manage your WiFi network efficiently</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button className="w-full bg-card hover:bg-accent text-indigo-700 border-0 shadow-sm hover:shadow-md transition-all duration-200" variant="outline">
              <UsersIcon className="h-4 w-4 mr-2" />
              View All Users
            </Button>
            <Button className="w-full bg-card hover:bg-accent text-indigo-700 border-0 shadow-sm hover:shadow-md transition-all duration-200" variant="outline">
              <CreditCardIcon className="h-4 w-4 mr-2" />
              Review Payments
            </Button>
            <Button className="w-full bg-card hover:bg-accent text-indigo-700 border-0 shadow-sm hover:shadow-md transition-all duration-200" variant="outline">
              <BellIcon className="h-4 w-4 mr-2" />
              Send Notifications
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

