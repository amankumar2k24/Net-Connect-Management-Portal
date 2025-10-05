'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import Image from 'next/image'
import DashboardLayout from '@/components/layout/dashboard-layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import Select, { SelectOption } from '@/components/ui/select'
import { Modal } from '@/components/ui/modal'
import { paymentApi } from '@/lib/api-functions'
import { formatCurrency, formatDate } from '@/lib/utils'
import { useAuth } from '@/contexts/auth-context'
import { Payment } from '@/types'
import {
  MagnifyingGlassIcon,
  EyeIcon,
  CreditCardIcon,
  CalendarIcon,
  CheckCircleIcon,
  ClockIcon,
  XCircleIcon,
  PhotoIcon
} from '@heroicons/react/24/outline'
import { DNAHelixLoader } from '@/components/ui/unique-loader'

const statusOptions: SelectOption[] = [
  { label: 'All Status', value: '' },
  { label: 'Approved', value: 'approved' },
  { label: 'Pending', value: 'pending' },
  { label: 'Rejected', value: 'rejected' }
]

export default function PaymentHistoryPage() {
  const { user } = useAuth()
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null)
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false)
  const [isImageModalOpen, setIsImageModalOpen] = useState(false)
  const [selectedImage, setSelectedImage] = useState('')

  const { data: paymentsData, isLoading } = useQuery({
    queryKey: ['user-payment-history', user?.id, searchQuery, statusFilter],
    queryFn: () => paymentApi.getMyPayments(),
    enabled: !!user?.id,
  })

  const payments = paymentsData?.payments ?? []

  // Debug logging
  console.log('🔍 Payment History Debug:', {
    paymentsData,
    paymentsLength: payments.length,
    searchQuery,
    statusFilter,
    user: user?.id
  })

  // Filter payments based on search and status
  const filteredPayments = payments.filter((payment: Payment) => {
    const matchesSearch = searchQuery === '' ||
      payment.amount.toString().includes(searchQuery) ||
      payment.durationMonths.toString().includes(searchQuery)

    const matchesStatus = statusFilter === '' || payment.status === statusFilter

    return matchesSearch && matchesStatus
  })

  const handleViewPayment = (payment: Payment) => {
    setSelectedPayment(payment)
    setIsPaymentModalOpen(true)
  }

  const handleViewImage = (imageUrl: string) => {
    setSelectedImage(imageUrl)
    setIsImageModalOpen(true)
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return CheckCircleIcon
      case 'pending':
        return ClockIcon
      case 'rejected':
        return XCircleIcon
      default:
        return ClockIcon
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'text-green-400 bg-green-900 border border-green-500/30'
      case 'pending':
        return 'text-yellow-400 bg-yellow-900 border border-yellow-500/30'
      case 'rejected':
        return 'text-red-900 bg-red-900 border border-red-500/30'
      default:
        return 'text-gray-400 bg-gray-800/30 border border-gray-600/30'
    }
  }

  const getStatusBadge = (status: string) => {
    const colors = {
      approved: 'bg-green-900 text-green-300 border border-green-500/50',
      pending: 'bg-yellow-900 text-yellow-300 border border-yellow-500/50',
      rejected: 'bg-red-900 text-red-300 border border-red-500/50'
    }
    return colors[status as keyof typeof colors] || 'bg-gray-800/50 text-gray-300 border border-gray-600/50'
  }

  const totalAmount = filteredPayments
    .filter((p: Payment) => p.status === 'approved')
    .reduce((sum: number, p: Payment) => sum + p.amount, 0)

  return (
    <DashboardLayout>
      <div className="min-h-screen card-enhanced text-white">
        <div className="space-y-8 p-6">
          {/* Header */}
          <div className="flex flex-col space-y-2">
            <h1 className="text-2xl font-bold text-white lg:text-3xl">Payment History</h1>
            <p className="text-gray-300">Track all your WiFi service payments and transactions</p>
          </div>

          {/* Payment Statistics */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {/* Total Payments Card - Dark theme */}
            <Card className="bg-gray-800 border border-gray-700 shadow-lg hover:shadow-xl transition-shadow duration-300">
              <CardContent className="p-4 sm:p-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <p className="text-xs sm:text-sm font-medium !text-white mb-1 truncate">Total Payments</p>
                    <div className="text-2xl sm:text-3xl font-bold !text-white">
                      {filteredPayments.length}
                    </div>
                    <p className="text-xs !text-white mt-1 truncate">All transactions</p>
                  </div>
                  <div className="p-2 sm:p-3 !text-white rounded-xl flex-shrink-0">
                    <CreditCardIcon className="h-5 w-5 sm:h-6 sm:w-6 !text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Approved Payments Card - Green theme */}
            <Card className="bg-green-900/30 border border-green-500/30 shadow-lg hover:shadow-xl hover:shadow-green-500/20 transition-all duration-300">
              <CardContent className="p-4 sm:p-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <p className="text-xs sm:text-sm font-medium text-green-300 mb-1 truncate">Approved</p>
                    <div className="text-2xl sm:text-3xl font-bold text-green-400">
                      {filteredPayments.filter((p: Payment) => p.status === 'approved').length}
                    </div>
                    <p className="text-xs text-green-400/80 mt-1 truncate">Successful payments</p>
                  </div>
                  <div className="p-2 sm:p-3 bg-green-800/50 rounded-xl flex-shrink-0">
                    <CheckCircleIcon className="h-5 w-5 sm:h-6 sm:w-6 text-green-400" />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Total Revenue Card - Dark theme */}
            <Card className="bg-gray-800 border border-gray-700 shadow-lg hover:shadow-xl transition-shadow duration-300">
              <CardContent className="p-4 sm:p-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <p className="text-xs sm:text-sm font-medium !text-white mb-1 truncate">Total Spent</p>
                    <div className="text-2xl sm:text-3xl font-bold !text-white">
                      {formatCurrency(totalAmount)}
                    </div>
                    <p className="text-xs !text-white mt-1 truncate">Approved payments</p>
                  </div>
                  <div className="p-2 sm:p-3 bg-gray-700 rounded-xl flex-shrink-0">
                    <CreditCardIcon className="h-5 w-5 sm:h-6 sm:w-6 !text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Pending Payments Card - Red theme */}
            <Card className="bg-red-900/30 border border-red-500/30 shadow-lg hover:shadow-xl hover:shadow-red-500/20 transition-all duration-300">
              <CardContent className="p-4 sm:p-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <p className="text-xs sm:text-sm font-medium text-red-300 mb-1 truncate">Pending</p>
                    <div className="text-2xl sm:text-3xl font-bold text-red-400">
                      {filteredPayments.filter((p: Payment) => p.status === 'pending').length}
                    </div>
                    <p className="text-xs text-red-400/80 mt-1 truncate">Awaiting approval</p>
                  </div>
                  <div className="p-2 sm:p-3 bg-red-800/50 rounded-xl flex-shrink-0">
                    <ClockIcon className="h-5 w-5 sm:h-6 sm:w-6 !text-white dark:text-red-400" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Search & Filters */}
          <Card className="bg-gray-800 border border-gray-700">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg font-semibold !text-white">Search & Filters</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-300" htmlFor="payment-search">Search</label>
                  <div className="relative">
                    <MagnifyingGlassIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-gray-400" />
                    <Input
                      id="payment-search"
                      placeholder="Search by amount or duration..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10 border border-gray-600 bg-gray-700 text-white placeholder-gray-400 transition-colors focus:border-gray-500 h-11"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-300">Status</label>
                  <Select
                    value={statusFilter}
                    onChange={setStatusFilter}
                    options={statusOptions}
                    className="w-full"
                  />
                </div>
                <div className="flex items-end">
                  <Button
                    onClick={() => {
                      setSearchQuery('')
                      setStatusFilter('')
                    }}
                    variant="outline"
                    className="w-full border-2 border-gray-600 bg-gray-700 text-white hover:bg-gray-600 md:w-auto"
                  >
                    Clear Filters
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Payments List */}
          <Card className="bg-gray-800 border border-gray-700">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg font-semibold !text-white">All Payments ({filteredPayments.length})</CardTitle>
                  <CardDescription className="mt-1 !text-white">Complete history of your WiFi service payments</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <DNAHelixLoader message="Loading your payment history..." />
              ) : filteredPayments.length === 0 ? (
                <div className="text-center py-12">
                  <div className="p-4 bg-gray-700/50 rounded-full w-fit mx-auto mb-4">
                    <CreditCardIcon className="h-12 w-12 text-gray-400" />
                  </div>
                  <p className="text-lg font-semibold !text-white mb-2">No payments found</p>
                  <p className="text-sm text-gray-300">
                    {searchQuery || statusFilter ? 'Try adjusting your search criteria' : 'You haven\'t made any payments yet'}
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredPayments.map((payment: Payment) => {
                    const StatusIcon = getStatusIcon(payment.status)
                    return (
                      <div key={payment.id} className="bg-gray-700/50 rounded-xl p-6 hover:bg-gray-700/70 transition-all duration-200 border border-gray-600/50">
                        <div className="flex items-center !text-white justify-between">
                          <div className="flex items-center space-x-4">
                            <div className={`flex-shrink-0 p-3 rounded-xl ${getStatusColor(payment.status)}`}>
                              <StatusIcon className="h-6 w-6" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center space-x-3 mb-2">
                                <p className="text-xl font-bold text-white">
                                  {formatCurrency(payment.amount)}
                                </p>
                                <span className={`inline-flex capitalize px-3 py-1 text-xs font-semibold rounded-full ${getStatusBadge(payment.status)}`}>
                                  {payment.status}
                                </span>
                              </div>
                              <div className="flex items-center space-x-4 text-sm text-gray-300 mb-2">
                                <span className="flex items-center">
                                  <CalendarIcon className="h-4 w-4 mr-1" />
                                  {payment.durationMonths} months
                                </span>
                                <span className="capitalize font-medium">{payment.method}</span>
                                {payment.upiNumber && (
                                  <span>{payment.upiNumber}</span>
                                )}
                              </div>
                              <div className="flex flex-wrap gap-x-4 gap-y-1">
                                <span className="text-xs text-gray-400">
                                  Submitted: {formatDate(payment.createdAt)}
                                </span>
                                {payment.activationDate && (
                                  <span className="text-xs text-gray-400">
                                    Activated: {formatDate(payment.activationDate)}
                                  </span>
                                )}
                                {payment.expiryDate && (
                                  <span className="text-xs text-gray-400">
                                    Expires: {formatDate(payment.expiryDate)}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            {payment.screenshot && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleViewImage(payment.screenshot!)}
                                className="border border-gray-600 bg-gray-700 text-white hover:bg-gray-600"
                              >
                                <PhotoIcon className="h-4 w-4 mr-1" />
                                Screenshot
                              </Button>
                            )}
                            <Button
                              size="sm"
                              onClick={() => handleViewPayment(payment)}
                              className="bg-blue-600 hover:bg-blue-700 text-white"
                            >
                              <EyeIcon className="h-4 w-4 mr-1" />
                              Details
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

          {/* Payment Details Modal */}
          <Modal
            isOpen={isPaymentModalOpen}
            onClose={() => setIsPaymentModalOpen(false)}
            title="Payment Details"
            size="lg"
          >
            {selectedPayment && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-lg font-medium text-white mb-4">Payment Information</h3>
                    <dl className="space-y-3">
                      <div>
                        <dt className="text-sm font-medium text-gray-300">Amount</dt>
                        <dd className="text-sm text-white">{formatCurrency(selectedPayment.amount)}</dd>
                      </div>
                      <div>
                        <dt className="text-sm font-medium text-gray-300">Duration</dt>
                        <dd className="text-sm text-white">{selectedPayment.durationMonths} months</dd>
                      </div>
                      <div>
                        <dt className="text-sm font-medium text-gray-300">Payment Method</dt>
                        <dd className="text-sm text-white capitalize">{selectedPayment.method}</dd>
                      </div>
                      {selectedPayment.upiNumber && (
                        <div>
                          <dt className="text-sm font-medium text-gray-300">UPI Number</dt>
                          <dd className="text-sm text-white">{selectedPayment.upiNumber}</dd>
                        </div>
                      )}
                      <div>
                        <dt className="text-sm font-medium text-gray-300">Status</dt>
                        <dd>
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadge(selectedPayment.status)}`}>
                            {selectedPayment.status}
                          </span>
                        </dd>
                      </div>
                    </dl>
                  </div>

                  <div>
                    <h3 className="text-lg font-medium text-white mb-4">Timeline</h3>
                    <dl className="space-y-3">
                      <div>
                        <dt className="text-sm font-medium text-gray-300">Submitted</dt>
                        <dd className="text-sm text-white">{formatDate(selectedPayment.createdAt)}</dd>
                      </div>
                      {selectedPayment.activationDate && (
                        <div>
                          <dt className="text-sm font-medium text-gray-300">Activated</dt>
                          <dd className="text-sm text-white">{formatDate(selectedPayment.activationDate)}</dd>
                        </div>
                      )}
                      {selectedPayment.expiryDate && (
                        <div>
                          <dt className="text-sm font-medium text-gray-300">Expires</dt>
                          <dd className="text-sm text-white">{formatDate(selectedPayment.expiryDate)}</dd>
                        </div>
                      )}
                      {selectedPayment.status === 'approved' && selectedPayment.expiryDate && (
                        <div>
                          <dt className="text-sm font-medium text-gray-300">Days Remaining</dt>
                          <dd className="text-sm text-white">
                            {Math.max(0, Math.ceil((new Date(selectedPayment.expiryDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)))} days
                          </dd>
                        </div>
                      )}
                    </dl>
                  </div>
                </div>

                {selectedPayment.screenshot && (
                  <div>
                    <h3 className="text-lg font-medium text-white mb-4">Payment Screenshot</h3>
                    <div className="border border-gray-600 rounded-lg p-4 bg-gray-800">
                      <Image
                        src={selectedPayment.screenshot}
                        alt="Payment Screenshot"
                        width={500}
                        height={300}
                        className="max-w-full h-64 object-contain mx-auto cursor-pointer"
                        onClick={() => handleViewImage(selectedPayment.screenshot!)}
                      />
                      <p className="text-sm text-gray-300 text-center mt-2">
                        Click to view full size
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </Modal>

          {/* Image Modal */}
          <Modal
            isOpen={isImageModalOpen}
            onClose={() => setIsImageModalOpen(false)}
            title="Payment Screenshot"
            size="xl"
          >
            <div className="text-center">
              <Image
                src={selectedImage}
                alt="Payment Screenshot"
                width={800}
                height={600}
                className="max-w-full max-h-96 object-contain mx-auto"
              />
            </div>
          </Modal>
        </div>
      </div>
    </DashboardLayout>
  )
}


