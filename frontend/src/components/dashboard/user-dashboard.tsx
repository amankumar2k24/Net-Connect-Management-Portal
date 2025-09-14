'use client'

import { useQuery } from '@tanstack/react-query'
import { useAuth } from '@/contexts/auth-context'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { LoadingSpinner, LoadingCard } from '@/components/ui/loading'
import { paymentApi } from '@/lib/api-functions'
import { formatCurrency, formatDate } from '@/lib/utils'
import {
  CreditCardIcon,
  DocumentTextIcon,
  ClockIcon,
  BellIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  CalendarDaysIcon
} from '@heroicons/react/24/outline'

export default function UserDashboard() {
  const { user } = useAuth()

  const { data: paymentsData, isLoading: isLoadingPayments } = useQuery({
    queryKey: ['my-payments'],
    queryFn: () => paymentApi.getPayments({ limit: 5 }),
  })

  const { data: upcomingPayments, isLoading: isLoadingUpcoming } = useQuery({
    queryKey: ['upcoming-payments'],
    queryFn: () => paymentApi.getUserPayments(user?.id || ''),
    enabled: !!user?.id,
  })

  const recentPayments = paymentsData?.data?.payments || []
  const upcoming = upcomingPayments?.data?.data || []
  const isLoading = isLoadingPayments || isLoadingUpcoming

  // Calculate stats
  const activeSubscription = recentPayments.filter((p: any) => p.status === 'approved').length
  const totalPayments = recentPayments.length
  const pendingPayments = recentPayments.filter((p: any) => p.status === 'pending').length

  return (
    <div className="space-y-8">
      <div className="flex flex-col space-y-3">
        <h1 className="text-4xl font-bold text-foreground font-poppins">Dashboard</h1>
        <p className="text-muted-foreground text-lg">
          Welcome back, {user?.firstName} {user?.lastName}! Manage your WiFi subscription here.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Active Subscription Card */}
        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-700 mb-1">Active Subscriptions</p>
                <p className="text-3xl font-bold text-green-900">
                  {isLoading ? <LoadingSpinner size="sm" /> : activeSubscription}
                </p>
                <p className="text-xs text-green-600 mt-1">Currently active</p>
              </div>
              <div className="p-3 bg-green-200 rounded-xl">
                <CheckCircleIcon className="h-6 w-6 text-green-600" />
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
                  {isLoading ? <LoadingSpinner size="sm" /> : pendingPayments}
                </p>
                <p className="text-xs text-yellow-600 mt-1">Awaiting approval</p>
              </div>
              <div className="p-3 bg-yellow-200 rounded-xl">
                <ExclamationTriangleIcon className="h-6 w-6 text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Total Payments Card */}
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-700 mb-1">Total Payments</p>
                <p className="text-3xl font-bold text-blue-900">
                  {isLoading ? <LoadingSpinner size="sm" /> : totalPayments}
                </p>
                <p className="text-xs text-blue-600 mt-1">All time</p>
              </div>
              <div className="p-3 bg-blue-200 rounded-xl">
                <DocumentTextIcon className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Payments */}
        <Card className="bg-gradient-to-br from-slate-50 to-slate-100 border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="text-slate-900 font-poppins flex items-center">
              <CreditCardIcon className="h-5 w-5 mr-2 text-slate-600" />
              Recent Payments
            </CardTitle>
            <CardDescription className="text-slate-600">Your latest payment history</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-4">
                {Array.from({ length: 3 }).map((_, i) => (
                  <LoadingCard key={i} className="h-16" />
                ))}
              </div>
            ) : recentPayments.length > 0 ? (
              <div className="space-y-4">
                {recentPayments.slice(0, 3).map((payment: any) => (
                  <div key={payment.id} className="flex items-center justify-between p-3 bg-white/70 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className={`p-2 rounded-lg ${payment.status === 'approved' ? 'bg-green-100' :
                          payment.status === 'pending' ? 'bg-yellow-100' : 'bg-red-100'
                        }`}>
                        <CreditCardIcon className={`h-4 w-4 ${payment.status === 'approved' ? 'text-green-600' :
                            payment.status === 'pending' ? 'text-yellow-600' : 'text-red-600'
                          }`} />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-slate-900">{formatCurrency(payment.amount)}</p>
                        <p className="text-xs text-slate-500">{payment.duration} months</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${payment.status === 'approved' ? 'bg-green-100 text-green-800' :
                          payment.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                        }`}>
                        {payment.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-slate-500 text-center py-4">No recent payments to display.</p>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="text-purple-900 font-poppins flex items-center">
              <CalendarDaysIcon className="h-5 w-5 mr-2 text-purple-600" />
              Quick Actions
            </CardTitle>
            <CardDescription className="text-purple-600">Manage your subscription</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button className="w-full bg-white/70 hover:bg-white/90 text-purple-700 border-0 shadow-sm hover:shadow-md transition-all duration-200" variant="outline">
              <CreditCardIcon className="h-4 w-4 mr-2" />
              Make Payment
            </Button>
            <Button className="w-full bg-white/70 hover:bg-white/90 text-purple-700 border-0 shadow-sm hover:shadow-md transition-all duration-200" variant="outline">
              <DocumentTextIcon className="h-4 w-4 mr-2" />
              View Payment History
            </Button>
            <Button className="w-full bg-white/70 hover:bg-white/90 text-purple-700 border-0 shadow-sm hover:shadow-md transition-all duration-200" variant="outline">
              <ClockIcon className="h-4 w-4 mr-2" />
              Check Next Payment
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
