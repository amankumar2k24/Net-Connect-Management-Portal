'use client'

import { useQuery } from '@tanstack/react-query'
import { useAuth } from '@/contexts/auth-context'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { WiFiSignalLoader, FloatingParticlesLoader } from '@/components/ui/unique-loader'
import { paymentApi } from '@/lib/api-functions'
import { formatCurrency, formatDate } from '@/lib/utils'
import Link from 'next/link'
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
    queryFn: () => paymentApi.getMyPayments({ limit: 5 }),
  })

  const { data: upcomingPayments, isLoading: isLoadingUpcoming } = useQuery({
    queryKey: ['upcoming-payments'],
    queryFn: () => paymentApi.getUpcomingPayments(),
    enabled: !!user?.id,
  })

  const recentPayments = paymentsData?.payments ?? []
  const upcoming = upcomingPayments?.upcomingPayments ?? []
  const isLoading = isLoadingPayments || isLoadingUpcoming

  // Calculate stats
  const activeSubscription = recentPayments.filter((p: any) => p.status === 'approved').length
  const totalPayments = recentPayments.length
  const pendingPayments = recentPayments.filter((p: any) => p.status === 'pending').length

  return (
    <div className="space-y-8">

      {isLoading ? (
        <WiFiSignalLoader message="Loading your dashboard..." />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Active Subscription Card */}
          <Card className="bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-emerald-900/20 dark:to-teal-800/20 border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-700 dark:text-emerald-300 mb-1">Active Subscriptions</p>
                  <div className="text-3xl font-bold text-blue-900 dark:text-emerald-100">
                    {activeSubscription}
                  </div>
                  <p className="text-xs text-blue-600 dark:text-emerald-400 mt-1">Currently active</p>
                </div>
                <div className="p-3 bg-blue-200 dark:bg-emerald-800/50 rounded-xl">
                  <CheckCircleIcon className="h-6 w-6 text-blue-600 dark:text-emerald-300" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Pending Payments Card */}
          <Card className="bg-gradient-to-br from-rose-50 to-pink-100 dark:from-amber-900/20 dark:to-orange-800/20 border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-rose-700 dark:text-amber-300 mb-1">Pending Payments</p>
                  <div className="text-3xl font-bold text-rose-900 dark:text-amber-100">
                    {pendingPayments}
                  </div>
                  <p className="text-xs text-rose-600 dark:text-amber-400 mt-1">Awaiting approval</p>
                </div>
                <div className="p-3 bg-rose-200 dark:bg-amber-800/50 rounded-xl">
                  <ExclamationTriangleIcon className="h-6 w-6 text-rose-600 dark:text-amber-300" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Total Payments Card */}
          <Card className="bg-gradient-to-br from-emerald-50 to-green-100 dark:from-violet-900/20 dark:to-purple-800/20 border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-emerald-700 dark:text-violet-300 mb-1">Total Payments</p>
                  <div className="text-3xl font-bold text-emerald-900 dark:text-violet-100">
                    {totalPayments}
                  </div>
                  <p className="text-xs text-emerald-600 dark:text-violet-400 mt-1">All time</p>
                </div>
                <div className="p-3 bg-emerald-200 dark:bg-violet-800/50 rounded-xl">
                  <DocumentTextIcon className="h-6 w-6 text-emerald-600 dark:text-violet-300" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Payments */}
        <Card className="bg-gradient-to-br from-cyan-50 to-sky-100 dark:from-slate-800/20 dark:to-slate-700/20 border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="text-cyan-800 dark:text-slate-100 font-poppins flex items-center">
              <CreditCardIcon className="h-5 w-5 mr-2 text-cyan-600 dark:text-slate-400" />
              Recent Payments
            </CardTitle>
            <CardDescription className="text-cyan-600 dark:text-slate-300">Your latest payment history</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <FloatingParticlesLoader message="Loading payment history..." />
            ) : recentPayments.length > 0 ? (
              <div className="space-y-4">
                {recentPayments.slice(0, 3).map((payment: any) => (
                  <div key={payment.id} className="flex items-center justify-between p-3 bg-white dark:bg-slate-800/50 rounded-lg border border-gray-100 dark:border-slate-700">
                    <div className="flex items-center space-x-3 capitalize">
                      <div className={`p-2 rounded-lg ${payment.status === 'approved' ? 'bg-green-100 dark:bg-green-800/50' :
                        payment.status === 'pending' ? 'bg-yellow-100 dark:bg-yellow-800/50' : 'bg-red-100 dark:bg-red-800/50'
                        }`}>
                        <CreditCardIcon className={`h-4 w-4 ${payment.status === 'approved' ? 'text-green-600 dark:text-green-300' :
                          payment.status === 'pending' ? 'text-yellow-600 dark:text-yellow-300' : 'text-red-600 dark:text-red-300'
                          }`} />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{formatCurrency(payment.amount)}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{payment.durationMonths} months</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className={`inline-flex px-2 py-1 capitalize text-xs font-semibold rounded-full ${payment.status === 'approved' ? 'bg-green-800 text-green-100 dark:bg-green-700 dark:text-green-100' :
                        payment.status === 'pending' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300' :
                          'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
                        }`}>
                        {payment.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500 dark:text-gray-400 text-sm">No recent payments to display</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card className="bg-gradient-to-br from-violet-50 to-purple-100 dark:from-indigo-900/20 dark:to-blue-800/20 border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="text-violet-900 dark:text-indigo-100 font-poppins flex items-center">
              <CalendarDaysIcon className="h-5 w-5 mr-2 text-violet-600 dark:text-indigo-400" />
              Quick Actions
            </CardTitle>
            <CardDescription className="text-violet-600 dark:text-indigo-300">Manage your subscription</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center space-y-4 py-8">
            <Link href="/dashboard/next-payments?openModal=true" className="block w-full max-w-sm">
              <Button className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 dark:from-blue-600/20 dark:to-blue-700/20 dark:hover:from-blue-600/30 dark:hover:to-blue-700/30 text-white border-0 dark:border dark:border-blue-500/20 shadow-sm hover:shadow-lg hover:scale-[1.02] transition-all duration-200">
                <CreditCardIcon className="h-4 w-4 mr-2" />
                Make Payment
              </Button>
            </Link>
            <Link href="/dashboard/payment-history" className="block w-full max-w-sm">
              <Button className="w-full bg-gradient-to-r from-teal-600 to-teal-700 hover:from-teal-700 hover:to-teal-800 dark:from-teal-600/20 dark:to-teal-700/20 dark:hover:from-teal-600/30 dark:hover:to-teal-700/30 text-white border-0 dark:border dark:border-teal-500/20 shadow-sm hover:shadow-lg hover:scale-[1.02] transition-all duration-200">
                <DocumentTextIcon className="h-4 w-4 mr-2" />
                View Payment History
              </Button>
            </Link>
            <Link href="/dashboard/next-payments" className="block w-full max-w-sm">
              <Button className="w-full bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 dark:from-purple-600/20 dark:to-purple-700/20 dark:hover:from-purple-600/30 dark:hover:to-purple-700/30 text-white border-0 dark:border dark:border-purple-500/20 shadow-sm hover:shadow-lg hover:scale-[1.02] transition-all duration-200">
                <ClockIcon className="h-4 w-4 mr-2" />
                Check Next Payment
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

