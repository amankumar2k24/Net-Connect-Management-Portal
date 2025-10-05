"use client"

import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import Image from "next/image"
import DashboardLayout from "@/components/layout/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Modal } from "@/components/ui/modal"
import Select, { SelectOption } from "@/components/ui/select"
import { paymentApi } from "@/lib/api-functions"
import { formatCurrency, formatDate } from "@/lib/utils"
import { Payment } from "@/types"
import { toast } from "react-hot-toast"
import {
  MagnifyingGlassIcon,
  EyeIcon,
  CheckIcon,
  XMarkIcon,
  CreditCardIcon,
  ExclamationTriangleIcon,
  ClockIcon,
  BanknotesIcon,
  ChartBarIcon,
} from "@heroicons/react/24/outline"
import { WiFiSignalLoader, FloatingParticlesLoader } from "@/components/ui/unique-loader"

const statusOptions: SelectOption[] = [
  { label: "All Status", value: "" },
  { label: "Pending", value: "pending" },
  { label: "Approved", value: "approved" },
  { label: "Rejected", value: "rejected" },
]

const methodOptions: SelectOption[] = [
  { label: "All Methods", value: "" },
  { label: "QR Code", value: "qr_code" },
  { label: "UPI", value: "upi" },
]

const getStatusBadge = (status: Payment["status"]) => {
  switch (status) {
    case "approved":
      return "bg-green-500/15 text-green-400"
    case "pending":
      return "bg-yellow-500/15 text-yellow-400"
    case "rejected":
      return "bg-red-500/15 text-red-400"
    default:
      return "bg-muted text-muted-foreground"
  }
}

export default function PaymentsPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("")
  const [methodFilter, setMethodFilter] = useState("")
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null)
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false)
  const [isImageModalOpen, setIsImageModalOpen] = useState(false)
  const [selectedImageUrl, setSelectedImageUrl] = useState<string>("")

  const queryClient = useQueryClient()

  const { data: paymentsData, isLoading } = useQuery({
    queryKey: ["payments", searchQuery, statusFilter, methodFilter],
    queryFn: () =>
      paymentApi.getPayments({
        userId: searchQuery || undefined,
        status: statusFilter || undefined,
        method: methodFilter || undefined,
      }),
  })

  const { data: paymentStats, isLoading: isLoadingStats } = useQuery({
    queryKey: ['payment-dashboard-stats'],
    queryFn: () => paymentApi.getDashboardStats(),
  })

  const payments = paymentsData?.payments ?? []
  const totalPayments = paymentsData?.pagination?.total ?? payments.length
  const stats = paymentStats || { totalPayments: 0, pendingPayments: 0, approvedPayments: 0, rejectedPayments: 0, totalRevenue: 0 }

  const updatePaymentStatusMutation = useMutation({
    mutationFn: ({ paymentId, status }: { paymentId: string; status: Payment["status"] }) =>
      paymentApi.updatePaymentStatus(paymentId, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["payments"] })
      toast.success("Payment status updated")
      setIsPaymentModalOpen(false)
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Failed to update payment")
    },
  })

  const handleViewPayment = (payment: Payment) => {
    setSelectedPayment(payment)
    setIsPaymentModalOpen(true)
  }

  const handleApprove = (payment: Payment) => {
    updatePaymentStatusMutation.mutate({ paymentId: payment.id, status: "approved" })
  }

  const handleReject = (payment: Payment) => {
    updatePaymentStatusMutation.mutate({ paymentId: payment.id, status: "rejected" })
  }

  const handleImageClick = (imageUrl: string) => {
    setSelectedImageUrl(imageUrl)
    setIsImageModalOpen(true)
  }

  return (
    <DashboardLayout>
      <div className="space-y-6 sm:space-y-8">
        <div className="md:flex md:items-center md:justify-between">
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl font-bold leading-7 text-foreground sm:text-3xl sm:truncate">
              Payment History
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Track all your WiFi service payments and transactions
            </p>
          </div>
        </div>

        {/* Stats Cards */}
        {isLoadingStats ? (
          <WiFiSignalLoader message="Loading payment stats..." />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {/* Total Payments Card */}
            <Card className="bg-gradient-to-br from-blue-600 to-blue-700 dark:from-blue-600 dark:to-blue-700 border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
              <CardContent className="p-4 sm:p-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <p className="text-xs sm:text-sm font-medium text-blue-100 mb-1 truncate">Total Payments</p>
                    <div className="text-2xl sm:text-3xl font-bold text-white">
                      {stats.totalPayments || 0}
                    </div>
                    <p className="text-xs text-blue-200 mt-1 truncate">All transactions</p>
                  </div>
                  <div className="p-2 sm:p-3 bg-blue-500/30 rounded-xl flex-shrink-0">
                    <CreditCardIcon className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Approved Payments Card */}
            <Card className="bg-gradient-to-br from-emerald-600 to-emerald-700 dark:from-emerald-600 dark:to-emerald-700 border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
              <CardContent className="p-4 sm:p-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <p className="text-xs sm:text-sm font-medium text-emerald-100 mb-1 truncate">Approved</p>
                    <div className="text-2xl sm:text-3xl font-bold text-white">
                      {stats.approvedPayments || 0}
                    </div>
                    <p className="text-xs text-emerald-200 mt-1 truncate">Successful payments</p>
                  </div>
                  <div className="p-2 sm:p-3 bg-emerald-500/30 rounded-xl flex-shrink-0">
                    <CheckIcon className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Pending Payments Card */}
            <Card className="bg-gradient-to-br from-amber-600 to-orange-600 dark:from-amber-600 dark:to-orange-600 border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
              <CardContent className="p-4 sm:p-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <p className="text-xs sm:text-sm font-medium text-amber-100 mb-1 truncate">Pending</p>
                    <div className="text-2xl sm:text-3xl font-bold text-white">
                      {stats.pendingPayments || 0}
                    </div>
                    <p className="text-xs text-amber-200 mt-1 truncate">Awaiting approval</p>
                  </div>
                  <div className="p-2 sm:p-3 bg-amber-500/30 rounded-xl flex-shrink-0">
                    <ClockIcon className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Total Revenue Card */}
            <Card className="bg-gradient-to-br from-violet-600 to-purple-600 dark:from-violet-600 dark:to-purple-600 border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
              <CardContent className="p-4 sm:p-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <p className="text-xs sm:text-sm font-medium text-violet-100 mb-1 truncate">Total Revenue</p>
                    <div className="text-2xl sm:text-3xl font-bold text-white">
                      {formatCurrency(stats.totalRevenue || 0)}
                    </div>
                    <p className="text-xs text-violet-200 mt-1 truncate">Approved payments</p>
                  </div>
                  <div className="p-2 sm:p-3 bg-violet-500/30 rounded-xl flex-shrink-0">
                    <BanknotesIcon className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Search & Filters */}
        <Card className="card-enhanced">
          <CardHeader>
            <CardTitle className="text-white dark:text-white font-poppins flex items-center">
              <MagnifyingGlassIcon className="h-5 w-5 mr-2 text-blue-400" />
              Search & Filters
            </CardTitle>
            <CardDescription className="text-slate-300">Quickly locate payments using filters and smart search</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground" htmlFor="payment-search">Search</label>
                <div className="relative">
                  <MagnifyingGlassIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-muted-foreground" />
                  <Input
                    id="payment-search"
                    placeholder="Search by amount or duration..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 border-0 bg-muted/50 transition-colors focus:bg-background h-11"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">Status</label>
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
                  className="w-full border-2 bg-muted/50 hover:bg-muted md:w-auto"
                >
                  Clear Filters
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Payment History */}
        <Card className="card-enhanced">
          <CardHeader>
            <CardTitle className="text-white dark:text-indigo-100 font-poppins flex items-center">
              <ChartBarIcon className="h-5 w-5 mr-2 text-indigo-600 dark:text-indigo-400" />
              Your Payments ({totalPayments})
            </CardTitle>
            <CardDescription className="text-indigo-600 dark:text-indigo-300">Complete history of your WiFi service payments</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <FloatingParticlesLoader message="Loading payment transactions..." />
            ) : payments.length === 0 ? (
              <div className="text-center py-8">
                <CreditCardIcon className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <p className="text-gray-500 dark:text-gray-400 text-sm">No payments to display</p>
                <p className="text-gray-400 dark:text-gray-500 text-xs mt-1">Your payment history will appear here</p>
              </div>
            ) : (
              <div className="space-y-4">
                {payments.slice(0, 5).map((payment) => (
                  <div key={payment.id} className="flex items-center space-x-3 p-3 bg-white dark:bg-slate-800/50 rounded-lg border border-gray-100 dark:border-slate-700">
                    <div className="flex-shrink-0">
                      <div className={`h-10 w-10 rounded-full flex items-center justify-center shadow-sm ${payment.status === 'approved'
                        ? 'bg-gradient-to-br from-green-500 to-green-600'
                        : payment.status === 'pending'
                          ? 'bg-gradient-to-br from-yellow-500 to-yellow-600'
                          : 'bg-gradient-to-br from-red-500 to-red-600'
                        }`}>
                        {payment.status === 'approved' ? (
                          <CheckIcon className="h-5 w-5 text-white" />
                        ) : payment.status === 'pending' ? (
                          <ClockIcon className="h-5 w-5 text-white" />
                        ) : (
                          <XMarkIcon className="h-5 w-5 text-white" />
                        )}
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                        {formatCurrency(payment.amount)} - {payment.durationMonths} month{payment.durationMonths > 1 ? 's' : ''}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {formatDate(payment.createdAt)} • {payment.method.replace('_', ' ').toUpperCase()}
                      </p>
                    </div>
                    <div className="flex-shrink-0 flex items-center space-x-2">
                      <span className={`inline-flex items-center capitalize px-2 py-1 rounded-full text-xs font-medium ${payment.status === 'approved'
                        ? 'bg-green-800 text-green-100 dark:bg-green-700 dark:text-green-100'
                        : payment.status === 'pending'
                          ? 'bg-yellow-800 text-yellow-100 dark:bg-yellow-700 dark:text-yellow-100'
                          : 'bg-red-600 text-red-100 dark:bg-red-600 dark:text-red-100'
                        }`}>
                        {payment.status}
                      </span>
                      <Button size="sm" variant="outline" onClick={() => handleViewPayment(payment)} className="gap-1">
                        <EyeIcon className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}

                {payments.length > 5 && (
                  <div className="text-center pt-4">
                    <p className="text-sm text-muted-foreground">
                      Showing 5 of {totalPayments} payments
                    </p>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Modal isOpen={isPaymentModalOpen} onClose={() => setIsPaymentModalOpen(false)} title="Payment Details" size="lg">
        {selectedPayment && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-indigo-900 dark:text-indigo-100 flex items-center">
                  <CreditCardIcon className="h-4 w-4 mr-2" />
                  Payment Information
                </h3>
                <dl className="space-y-2 rounded-xl border border-indigo-200 dark:border-indigo-800 bg-gradient-to-br from-indigo-50 to-blue-50 dark:from-indigo-900/20 dark:to-blue-900/20 p-4">
                  <div>
                    <dt className="text-xs text-indigo-600 dark:text-indigo-400">Amount</dt>
                    <dd className="text-sm font-semibold text-indigo-900 dark:text-indigo-100">{formatCurrency(selectedPayment.amount)}</dd>
                  </div>
                  <div>
                    <dt className="text-xs text-indigo-600 dark:text-indigo-400">Duration</dt>
                    <dd className="text-sm text-indigo-800 dark:text-indigo-200">{selectedPayment.durationMonths} months</dd>
                  </div>
                  <div>
                    <dt className="text-xs text-indigo-600 dark:text-indigo-400">Method</dt>
                    <dd className="text-sm text-indigo-800 dark:text-indigo-200 capitalize">{selectedPayment.method.replace('_', ' ')}</dd>
                  </div>
                  <div>
                    <dt className="text-xs text-indigo-600 dark:text-indigo-400">Submitted</dt>
                    <dd className="text-sm text-indigo-800 dark:text-indigo-200">{formatDate(selectedPayment.createdAt)}</dd>
                  </div>
                </dl>
              </div>
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-indigo-900 dark:text-indigo-100 flex items-center">
                  <CheckIcon className="h-4 w-4 mr-2" />
                  Status & Details
                </h3>
                <dl className="space-y-2 rounded-xl border border-indigo-200 dark:border-indigo-800 bg-gradient-to-br from-indigo-50 to-blue-50 dark:from-indigo-900/20 dark:to-blue-900/20 p-4">
                  <div>
                    <dt className="text-xs text-indigo-600 dark:text-indigo-400">Status</dt>
                    <dd className="text-sm">
                      <span className={`inline-flex items-center capitalize px-2 py-1 rounded-full text-xs font-medium ${selectedPayment.status === 'approved'
                        ? 'bg-green-800 text-green-100'
                        : selectedPayment.status === 'pending'
                          ? 'bg-yellow-800 text-yellow-100'
                          : 'bg-red-600 text-red-100'
                        }`}>
                        {selectedPayment.status}
                      </span>
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs text-indigo-600 dark:text-indigo-400">Reference ID</dt>
                    <dd className="text-sm text-indigo-800 dark:text-indigo-200 font-mono">{selectedPayment.id.slice(0, 12)}...</dd>
                  </div>
                </dl>
              </div>
            </div>

            {selectedPayment.screenshotUrl && (
              <div>
                <h3 className="text-sm font-semibold text-indigo-900 dark:text-indigo-100 mb-3 flex items-center">
                  <EyeIcon className="h-4 w-4 mr-2" />
                  Payment Proof
                </h3>
                <div className="overflow-hidden rounded-xl border border-indigo-200 dark:border-indigo-800 bg-gradient-to-br from-indigo-50 to-blue-50 dark:from-indigo-900/20 dark:to-blue-900/20">
                  <Image
                    src={selectedPayment.screenshotUrl}
                    alt="Payment screenshot"
                    width={900}
                    height={600}
                    className="max-h-96 w-full object-contain bg-white dark:bg-slate-800 cursor-pointer hover:opacity-90 transition-opacity"
                    onClick={() => selectedPayment.screenshotUrl && handleImageClick(selectedPayment.screenshotUrl)}
                  />
                </div>
              </div>
            )}

            {selectedPayment.status === "pending" && (
              <div className="flex justify-end gap-3 border-t border-indigo-200 dark:border-indigo-800 pt-4">
                <Button
                  variant="destructive"
                  onClick={() => handleReject(selectedPayment)}
                  disabled={updatePaymentStatusMutation.isPending}
                  className="gap-2"
                >
                  <XMarkIcon className="h-4 w-4" />
                  Reject
                </Button>
                <Button
                  onClick={() => handleApprove(selectedPayment)}
                  disabled={updatePaymentStatusMutation.isPending}
                  className="gap-2 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800"
                >
                  <CheckIcon className="h-4 w-4" />
                  Approve
                </Button>
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* Image Modal for Full Size View */}
      <Modal
        isOpen={isImageModalOpen}
        onClose={() => setIsImageModalOpen(false)}
        title="Payment Screenshot"
        size="xl"
      >
        <div className="flex justify-center">
          <Image
            src={selectedImageUrl}
            alt="Payment screenshot - Full size"
            width={1200}
            height={800}
            className="max-w-full max-h-[80vh] object-contain rounded-lg"
          />
        </div>
      </Modal>
    </DashboardLayout>
  )
}