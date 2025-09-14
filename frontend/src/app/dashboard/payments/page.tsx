'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import Image from 'next/image'
import DashboardLayout from '@/components/layout/dashboard-layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Modal } from '@/components/ui/modal'
import { paymentApi } from '@/lib/api-functions'
import { formatCurrency, getPaymentStatusColor, formatDate } from '@/lib/utils'
import { Payment } from '@/types'
import { toast } from 'react-hot-toast'
import {
  MagnifyingGlassIcon,
  EyeIcon,
  CheckIcon,
  XMarkIcon,
  PhotoIcon,
  CreditCardIcon,
  CalendarIcon,
  UserIcon
} from '@heroicons/react/24/outline'

export default function PaymentsPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [methodFilter, setMethodFilter] = useState('')
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null)
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false)
  const [isImageModalOpen, setIsImageModalOpen] = useState(false)
  const [selectedImage, setSelectedImage] = useState('')

  const queryClient = useQueryClient()

  const { data: paymentsData, isLoading } = useQuery({
    queryKey: ['payments', searchQuery, statusFilter, methodFilter],
    queryFn: () => paymentApi.getPayments({
      userId: searchQuery || undefined,
      status: statusFilter || undefined,
      method: methodFilter || undefined
    }),
  })

  const updatePaymentStatusMutation = useMutation({
    mutationFn: ({ paymentId, status }: { paymentId: string; status: 'approved' | 'rejected' }) =>
      paymentApi.updatePaymentStatus(paymentId, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payments'] })
      toast.success('Payment status updated successfully!')
      setIsPaymentModalOpen(false)
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to update payment status')
    },
  })

  const payments = paymentsData?.data?.data?.data || []

  const handleApprovePayment = (payment: Payment) => {
    updatePaymentStatusMutation.mutate({
      paymentId: payment.id,
      status: 'approved'
    })
  }

  const handleRejectPayment = (payment: Payment) => {
    updatePaymentStatusMutation.mutate({
      paymentId: payment.id,
      status: 'rejected'
    })
  }

  const handleViewPayment = (payment: Payment) => {
    setSelectedPayment(payment)
    setIsPaymentModalOpen(true)
  }

  const handleViewImage = (imageUrl: string) => {
    setSelectedImage(imageUrl)
    setIsImageModalOpen(true)
  }

  const getMethodIcon = (method: string) => {
    if (method === 'qr') return '🔗'
    if (method === 'upi') return '💳'
    return '💰'
  }

  const getStatusBadge = (status: string) => {
    const colors = {
      pending: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/20',
      approved: 'bg-green-500/20 text-green-400 border-green-500/20',
      rejected: 'bg-red-500/20 text-red-400 border-red-500/20'
    }
    return colors[status as keyof typeof colors] || 'bg-muted text-muted-foreground border-border'
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="md:flex md:items-center md:justify-between">
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl font-bold leading-7 text-foreground sm:text-3xl sm:truncate">
              Payments
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Manage user payments and approval process
            </p>
          </div>
        </div>

        {/* Payment Statistics */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <Card className="card-glow">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <CreditCardIcon className="h-6 w-6 text-primary" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-muted-foreground truncate">Total Payments</dt>
                    <dd className="text-lg font-semibold text-foreground">{payments.length}</dd>
                  </dl>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="card-glow">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <CheckIcon className="h-6 w-6 text-green-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-muted-foreground truncate">Approved</dt>
                    <dd className="text-lg font-semibold text-foreground">
                      {payments.filter((p: Payment) => p.status === 'approved').length}
                    </dd>
                  </dl>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="card-glow">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <CalendarIcon className="h-6 w-6 text-yellow-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-muted-foreground truncate">Pending</dt>
                    <dd className="text-lg font-semibold text-foreground">
                      {payments.filter((p: Payment) => p.status === 'pending').length}
                    </dd>
                  </dl>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="card-glow">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <XMarkIcon className="h-6 w-6 text-red-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-muted-foreground truncate">Rejected</dt>
                    <dd className="text-lg font-semibold text-foreground">
                      {payments.filter((p: Payment) => p.status === 'rejected').length}
                    </dd>
                  </dl>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle>Search & Filters</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="relative">
                <MagnifyingGlassIcon className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by username..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              >
                <option value="">All Status</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>
              <select
                value={methodFilter}
                onChange={(e) => setMethodFilter(e.target.value)}
                className="rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              >
                <option value="">All Methods</option>
                <option value="qr">QR Code</option>
                <option value="upi">UPI</option>
              </select>
              <Button
                onClick={() => {
                  setSearchQuery('')
                  setStatusFilter('')
                  setMethodFilter('')
                }}
                variant="outline"
              >
                Clear Filters
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Payments List */}
        <Card>
          <CardHeader>
            <CardTitle>Payments ({payments.length})</CardTitle>
            <CardDescription>Review and manage payment requests</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-4">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="animate-pulse border rounded-lg p-4">
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
            ) : payments.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No payments found matching your criteria</p>
              </div>
            ) : (
              <div className="space-y-4">
                {payments.map((payment: Payment) => (
                  <div key={payment.id} className="border border-border rounded-lg p-4 hover:bg-muted/50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="flex-shrink-0">
                          <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                            <span className="text-lg">
                              {getMethodIcon(payment.method)}
                            </span>
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2">
                            <UserIcon className="h-4 w-4 text-muted-foreground" />
                            <p className="text-lg font-medium text-foreground">
                              {payment.user?.name || 'Unknown User'}
                            </p>
                          </div>
                          <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                            <span>{formatCurrency(payment.amount)}</span>
                            <span>•</span>
                            <span>{payment.duration} months</span>
                            <span>•</span>
                            <span className="capitalize">{payment.method}</span>
                            {payment.upiNumber && (
                              <>
                                <span>•</span>
                                <span>{payment.upiNumber}</span>
                              </>
                            )}
                          </div>
                          <div className="flex items-center space-x-2 mt-1">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full border ${getStatusBadge(payment.status)}`}>
                              {payment.status}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {formatDate(payment.createdAt)}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        {payment.screenshot && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleViewImage(payment.screenshot!)}
                          >
                            <PhotoIcon className="h-4 w-4 mr-1" />
                            View
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleViewPayment(payment)}
                        >
                          <EyeIcon className="h-4 w-4 mr-1" />
                          Details
                        </Button>
                        {payment.status === 'pending' && (
                          <>
                            <Button
                              size="sm"
                              onClick={() => handleApprovePayment(payment)}
                              className="bg-green-600 hover:bg-green-700 border-green-500 wifi-glow"
                              disabled={updatePaymentStatusMutation.isPending}
                            >
                              <CheckIcon className="h-4 w-4 mr-1" />
                              Approve
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleRejectPayment(payment)}
                              disabled={updatePaymentStatusMutation.isPending}
                              className="hover:bg-red-700"
                            >
                              <XMarkIcon className="h-4 w-4 mr-1" />
                              Reject
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
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
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full border ${getStatusBadge(selectedPayment.status)}`}>
                          {selectedPayment.status}
                        </span>
                      </dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-muted-foreground">Submitted</dt>
                      <dd className="text-sm text-foreground">{formatDate(selectedPayment.createdAt)}</dd>
                    </div>
                  </dl>
                </div>

                <div>
                  <h3 className="text-lg font-medium text-foreground mb-4">User Information</h3>
                  <dl className="space-y-3">
                    <div>
                      <dt className="text-sm font-medium text-muted-foreground">Name</dt>
                      <dd className="text-sm text-foreground">{selectedPayment.user?.name}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-muted-foreground">Email</dt>
                      <dd className="text-sm text-foreground">{selectedPayment.user?.email}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-muted-foreground">Phone</dt>
                      <dd className="text-sm text-foreground">{selectedPayment.user?.phone}</dd>
                    </div>
                  </dl>
                </div>
              </div>

              {selectedPayment.screenshot && (
                <div>
                  <h3 className="text-lg font-medium text-foreground mb-4">Payment Screenshot</h3>
                  <div className="border border-border rounded-lg p-4 bg-muted/20">
                    <Image
                      src={selectedPayment.screenshot}
                      alt="Payment Screenshot"
                      width={500}
                      height={300}
                      className="max-w-full h-64 object-contain mx-auto cursor-pointer rounded-md"
                      onClick={() => handleViewImage(selectedPayment.screenshot!)}
                    />
                    <p className="text-sm text-muted-foreground text-center mt-2">
                      Click to view full size
                    </p>
                  </div>
                </div>
              )}

              {selectedPayment.status === 'pending' && (
                <div className="flex justify-end space-x-3 pt-4 border-t">
                  <Button
                    variant="destructive"
                    onClick={() => handleRejectPayment(selectedPayment)}
                    disabled={updatePaymentStatusMutation.isPending}
                  >
                    <XMarkIcon className="h-4 w-4 mr-2" />
                    Reject Payment
                  </Button>
                  <Button
                    onClick={() => handleApprovePayment(selectedPayment)}
                    disabled={updatePaymentStatusMutation.isPending}
                    className="bg-green-600 hover:bg-green-700 wifi-glow"
                  >
                    <CheckIcon className="h-4 w-4 mr-2" />
                    Approve Payment
                  </Button>
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