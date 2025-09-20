'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import Image from 'next/image'
import DashboardLayout from '@/components/layout/dashboard-layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
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
    queryFn: () => paymentApi.getUserPayments(user?.id || ''),
    enabled: !!user?.id,
  })

  const payments = paymentsData?.data?.data || []

  // Filter payments based on search and status
  const filteredPayments = payments.filter((payment: Payment) => {
    const matchesSearch = searchQuery === '' ||
      payment.amount.toString().includes(searchQuery) ||
      payment.duration.toString().includes(searchQuery)

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
        return 'text-green-600 bg-green-100'
      case 'pending':
        return 'text-yellow-600 bg-yellow-100'
      case 'rejected':
        return 'text-red-600 bg-red-100'
      default:
        return 'text-muted-foreground bg-muted/20'
    }
  }

  const getStatusBadge = (status: string) => {
    const colors = {
      approved: 'bg-green-100 text-green-800',
      pending: 'bg-yellow-100 text-yellow-800',
      rejected: 'bg-red-100 text-red-800'
    }
    return colors[status as keyof typeof colors] || 'bg-muted/20 text-muted-foreground'
  }

  const totalAmount = filteredPayments
    .filter((p: Payment) => p.status === 'approved')
    .reduce((sum: number, p: Payment) => sum + p.amount, 0)

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col space-y-2">
          <h1 className="text-2xl font-bold text-foreground lg:text-3xl">Payment History</h1>
          <p className="text-muted-foreground">Track all your WiFi service payments and transactions</p>
        </div>

        {/* Payment Statistics */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-700 mb-1">Total Payments</p>
                  <p className="text-3xl font-bold text-blue-900">{filteredPayments.length}</p>
                </div>
                <div className="p-3 bg-blue-200 rounded-xl">
                  <CreditCardIcon className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-50 to-green-100 border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-green-700 mb-1">Approved</p>
                  <p className="text-3xl font-bold text-green-900">
                    {filteredPayments.filter((p: Payment) => p.status === 'approved').length}
                  </p>
                </div>
                <div className="p-3 bg-green-200 rounded-xl">
                  <CheckCircleIcon className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100 border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-yellow-700 mb-1">Pending</p>
                  <p className="text-3xl font-bold text-yellow-900">
                    {filteredPayments.filter((p: Payment) => p.status === 'pending').length}
                  </p>
                </div>
                <div className="p-3 bg-yellow-200 rounded-xl">
                  <ClockIcon className="h-6 w-6 text-yellow-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-purple-700 mb-1">Total Spent</p>
                  <p className="text-3xl font-bold text-purple-900">{formatCurrency(totalAmount)}</p>
                </div>
                <div className="p-3 bg-purple-200 rounded-xl">
                  <CreditCardIcon className="h-6 w-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search & Filters */}
        <Card className="border-0 shadow-lg">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg font-semibold">Search & Filters</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="relative">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by amount or duration..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 border-0 bg-muted/50 focus:bg-background transition-colors"
                />
              </div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="rounded-lg border-0 bg-background text-foreground px-3 py-2.5 text-sm focus:bg-background focus:outline-none focus:ring-2 focus:ring-primary transition-colors"
              >
                <option value="" className="bg-background text-foreground">All Status</option>
                <option value="approved" className="bg-background text-foreground">Approved</option>
                <option value="pending" className="bg-background text-foreground">Pending</option>
                <option value="rejected" className="bg-background text-foreground">Rejected</option>
              </select>
              <Button
                onClick={() => {
                  setSearchQuery('')
                  setStatusFilter('')
                }}
                variant="outline"
                className="border-0 bg-muted/50 hover:bg-muted"
              >
                Clear Filters
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Payments List */}
        <Card className="border-0 shadow-lg">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg font-semibold">Your Payments ({filteredPayments.length})</CardTitle>
                <CardDescription className="mt-1">Complete history of your WiFi service payments</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-4">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="animate-pulse bg-muted/30 rounded-xl p-6">
                    <div className="flex items-center space-x-4">
                      <div className="rounded-full bg-muted h-12 w-12"></div>
                      <div className="flex-1 space-y-2">
                        <div className="h-4 bg-muted rounded w-3/4"></div>
                        <div className="h-3 bg-muted rounded w-1/2"></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : filteredPayments.length === 0 ? (
              <div className="text-center py-12">
                <div className="p-4 bg-muted/20 rounded-full w-fit mx-auto mb-4">
                  <CreditCardIcon className="h-12 w-12 text-muted-foreground" />
                </div>
                <p className="text-lg font-semibold text-foreground mb-2">No payments found</p>
                <p className="text-sm text-muted-foreground">
                  {searchQuery || statusFilter ? 'Try adjusting your search criteria' : 'You haven\'t made any payments yet'}
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredPayments.map((payment: Payment) => {
                  const StatusIcon = getStatusIcon(payment.status)
                  return (
                    <div key={payment.id} className="bg-muted/20 rounded-xl p-6 hover:bg-muted/30 transition-all duration-200">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className={`flex-shrink-0 p-3 rounded-xl ${getStatusColor(payment.status)}`}>
                            <StatusIcon className="h-6 w-6" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center space-x-3 mb-2">
                              <p className="text-xl font-bold text-foreground">
                                {formatCurrency(payment.amount)}
                              </p>
                              <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${getStatusBadge(payment.status)}`}>
                                {payment.status}
                              </span>
                            </div>
                            <div className="flex items-center space-x-4 text-sm text-muted-foreground mb-2">
                              <span className="flex items-center">
                                <CalendarIcon className="h-4 w-4 mr-1" />
                                {payment.duration} months
                              </span>
                              <span className="capitalize font-medium">{payment.method}</span>
                              {payment.upiNumber && (
                                <span>{payment.upiNumber}</span>
                              )}
                            </div>
                            <div className="flex flex-wrap gap-x-4 gap-y-1">
                              <span className="text-xs text-muted-foreground">
                                Submitted: {formatDate(payment.createdAt)}
                              </span>
                              {payment.activationDate && (
                                <span className="text-xs text-muted-foreground">
                                  Activated: {formatDate(payment.activationDate)}
                                </span>
                              )}
                              {payment.expiryDate && (
                                <span className="text-xs text-muted-foreground">
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
                              className="border-0 bg-muted/50 hover:bg-muted"
                            >
                              <PhotoIcon className="h-4 w-4 mr-1" />
                              Screenshot
                            </Button>
                          )}
                          <Button
                            size="sm"
                            onClick={() => handleViewPayment(payment)}
                            className="bg-primary hover:bg-primary/90"
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
                  <h3 className="text-lg font-medium text-foreground mb-4">Payment Information</h3>
                  <dl className="space-y-3">
                    <div>
                      <dt className="text-sm font-medium text-muted-foreground">Amount</dt>
                      <dd className="text-sm text-foreground">{formatCurrency(selectedPayment.amount)}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-muted-foreground">Duration</dt>
                      <dd className="text-sm text-foreground">{selectedPayment.duration} months</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-muted-foreground">Payment Method</dt>
                      <dd className="text-sm text-foreground capitalize">{selectedPayment.method}</dd>
                    </div>
                    {selectedPayment.upiNumber && (
                      <div>
                        <dt className="text-sm font-medium text-muted-foreground">UPI Number</dt>
                        <dd className="text-sm text-foreground">{selectedPayment.upiNumber}</dd>
                      </div>
                    )}
                    <div>
                      <dt className="text-sm font-medium text-muted-foreground">Status</dt>
                      <dd>
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadge(selectedPayment.status)}`}>
                          {selectedPayment.status}
                        </span>
                      </dd>
                    </div>
                  </dl>
                </div>

                <div>
                  <h3 className="text-lg font-medium text-foreground mb-4">Timeline</h3>
                  <dl className="space-y-3">
                    <div>
                      <dt className="text-sm font-medium text-muted-foreground">Submitted</dt>
                      <dd className="text-sm text-foreground">{formatDate(selectedPayment.createdAt)}</dd>
                    </div>
                    {selectedPayment.activationDate && (
                      <div>
                        <dt className="text-sm font-medium text-muted-foreground">Activated</dt>
                        <dd className="text-sm text-foreground">{formatDate(selectedPayment.activationDate)}</dd>
                      </div>
                    )}
                    {selectedPayment.expiryDate && (
                      <div>
                        <dt className="text-sm font-medium text-muted-foreground">Expires</dt>
                        <dd className="text-sm text-foreground">{formatDate(selectedPayment.expiryDate)}</dd>
                      </div>
                    )}
                    {selectedPayment.status === 'approved' && selectedPayment.expiryDate && (
                      <div>
                        <dt className="text-sm font-medium text-muted-foreground">Days Remaining</dt>
                        <dd className="text-sm text-foreground">
                          {Math.max(0, Math.ceil((new Date(selectedPayment.expiryDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)))} days
                        </dd>
                      </div>
                    )}
                  </dl>
                </div>
              </div>

              {selectedPayment.screenshot && (
                <div>
                  <h3 className="text-lg font-medium text-foreground mb-4">Payment Screenshot</h3>
                  <div className="border rounded-lg p-4">
                    <Image
                      src={selectedPayment.screenshot}
                      alt="Payment Screenshot"
                      width={500}
                      height={300}
                      className="max-w-full h-64 object-contain mx-auto cursor-pointer"
                      onClick={() => handleViewImage(selectedPayment.screenshot!)}
                    />
                    <p className="text-sm text-muted-foreground text-center mt-2">
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
    </DashboardLayout>
  )
}