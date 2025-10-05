"use client"

import { useState, useEffect } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import Image from "next/image"
import DashboardLayout from "@/components/layout/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Modal } from "@/components/ui/modal"
import { Textarea } from "@/components/ui/textarea"
import Select, { SelectOption } from "@/components/ui/select"
import { paymentApi } from "@/lib/api-functions"
import { formatCurrency, formatDate, formatDateTime } from "@/lib/utils"
import { Payment } from "@/types"
import { toast } from "react-hot-toast"
import {
  MagnifyingGlassIcon,
  EyeIcon,
  CheckIcon,
  XMarkIcon,
  CreditCardIcon,
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
  const [activeTab, setActiveTab] = useState<'payments' | 'renewals'>('payments')
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("")
  const [methodFilter, setMethodFilter] = useState("")
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null)
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false)
  const [isImageModalOpen, setIsImageModalOpen] = useState(false)
  const [selectedImageUrl, setSelectedImageUrl] = useState<string>("")
  const [rejectionNotes, setRejectionNotes] = useState("")
  const [showRejectionForm, setShowRejectionForm] = useState(false)
  const [rejectionError, setRejectionError] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize] = useState(10)
  const [renewalsPage, setRenewalsPage] = useState(1)
  const [renewalsPageSize] = useState(10)

  const queryClient = useQueryClient()

  const { data: paymentsData, isLoading } = useQuery({
    queryKey: ["payments", searchQuery, statusFilter, methodFilter, currentPage, pageSize],
    queryFn: () =>
      paymentApi.getPayments({
        page: currentPage,
        limit: pageSize,
        userId: searchQuery || undefined,
        status: statusFilter || undefined,
        method: methodFilter || undefined,
      }),
  })

  const { data: paymentStats, isLoading: isLoadingStats } = useQuery({
    queryKey: ['payment-dashboard-stats'],
    queryFn: () => paymentApi.getDashboardStats(),
  })

  const { data: upcomingRenewals, isLoading: isLoadingRenewals } = useQuery({
    queryKey: ["upcoming-renewals", renewalsPage, renewalsPageSize],
    queryFn: () => paymentApi.getUpcomingPayments(renewalsPage, renewalsPageSize),
  })

  const payments = paymentsData?.payments ?? []
  const totalPayments = paymentsData?.pagination?.total ?? payments.length
  const stats = paymentStats || { totalPayments: 0, pendingPayments: 0, approvedPayments: 0, rejectedPayments: 0, totalRevenue: 0 }
  const renewalsList = upcomingRenewals?.upcomingPayments ?? []
  const renewalsPagination = upcomingRenewals?.pagination

  const updatePaymentStatusMutation = useMutation({
    mutationFn: ({ paymentId, status, options }: {
      paymentId: string;
      status: Payment["status"];
      options?: { notes?: string; reason?: string }
    }) =>
      paymentApi.updatePaymentStatus(paymentId, status, options),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["payments"] })
      toast.success("Payment status updated")
      setIsPaymentModalOpen(false)
      setShowRejectionForm(false)
      setRejectionNotes("")
      setRejectionError("")
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
    setShowRejectionForm(true)
    setRejectionError("")
  }

  const handleConfirmReject = () => {
    const trimmedNotes = rejectionNotes.trim()

    if (!trimmedNotes) {
      setRejectionError("Rejection notes are required")
      return
    }

    if (trimmedNotes.length < 10) {
      setRejectionError("Rejection notes must be at least 10 characters long")
      return
    }

    if (selectedPayment) {
      updatePaymentStatusMutation.mutate({
        paymentId: selectedPayment.id,
        status: "rejected",
        options: {
          reason: trimmedNotes,
          // Don't send notes - only the rejection reason
        }
      })
    }
  }

  const handleCancelReject = () => {
    setShowRejectionForm(false)
    setRejectionNotes("")
    setRejectionError("")
  }

  const handleImageClick = (imageUrl: string) => {
    setSelectedImageUrl(imageUrl)
    setIsImageModalOpen(true)
  }

  // Reset to first page when search/filter changes
  useEffect(() => {
    setCurrentPage(1)
  }, [searchQuery, statusFilter, methodFilter])

  // Reset renewals page when tab changes
  useEffect(() => {
    if (activeTab === 'renewals') {
      setRenewalsPage(1)
    }
  }, [activeTab])

  const handlePreviousPage = () => {
    setCurrentPage(prev => Math.max(1, prev - 1))
  }

  const handleNextPage = () => {
    if (paymentsData?.pagination && currentPage < paymentsData.pagination.totalPages) {
      setCurrentPage(prev => prev + 1)
    }
  }

  const handleRenewalsPreviousPage = () => {
    setRenewalsPage(prev => Math.max(1, prev - 1))
  }

  const handleRenewalsNextPage = () => {
    if (renewalsPagination && renewalsPage < renewalsPagination.totalPages) {
      setRenewalsPage(prev => prev + 1)
    }
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

        {/* Tabs Navigation */}
        <div className="flex space-x-1 bg-slate-800/50 p-1 rounded-lg border border-slate-700/50">
          <button
            onClick={() => setActiveTab('payments')}
            className={`flex-1 px-4 py-2 text-sm font-medium rounded-md transition-all ${activeTab === 'payments'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
              }`}
          >
            <CreditCardIcon className="h-4 w-4 inline mr-2" />
            Payment Management
          </button>
          <button
            onClick={() => setActiveTab('renewals')}
            className={`flex-1 px-4 py-2 text-sm font-medium rounded-md transition-all ${activeTab === 'renewals'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
              }`}
          >
            <ClockIcon className="h-4 w-4 inline mr-2" />
            Upcoming Renewals
          </button>
        </div>

        {activeTab === 'payments' && (
          <>
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

            {/* Payments Table */}
            <Card className="card-enhanced">
              <CardHeader>
                <CardTitle className="text-white dark:text-indigo-100 font-poppins flex items-center">
                  <ChartBarIcon className="h-5 w-5 mr-2 text-indigo-600 dark:text-indigo-400" />
                  Payment Management ({totalPayments})
                </CardTitle>
                <CardDescription className="text-indigo-600 dark:text-indigo-300">Manage and review all payment transactions</CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <FloatingParticlesLoader message="Loading payment transactions..." />
                ) : payments.length === 0 ? (
                  <div className="text-center py-12">
                    <CreditCardIcon className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                    <p className="text-gray-500 dark:text-gray-400 text-lg font-medium">No payments found</p>
                    <p className="text-gray-400 dark:text-gray-500 text-sm mt-1">Payment transactions will appear here</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                      <thead className="bg-gray-50 dark:bg-gray-800">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                            Payment Details
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                            Amount
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                            Method
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                            Status
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                            Date
                          </th>
                          <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white dark:bg-gray-800/30 divide-y divide-gray-200 dark:divide-gray-700">
                        {payments.map((payment) => (
                          <tr key={payment.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <div className={`flex-shrink-0 h-10 w-10 rounded-full flex items-center justify-center ${payment.status === 'approved'
                                  ? 'bg-white dark:bg-green-900'
                                  : payment.status === 'pending'
                                    ? 'bg-white dark:bg-yellow-900'
                                    : 'bg-white dark:bg-red-900'
                                  }`}>
                                  {payment.status === 'approved' ? (
                                    <CheckIcon className="h-5 w-5 text-white" />
                                  ) : payment.status === 'pending' ? (
                                    <ClockIcon className="h-5 w-5 ttext-white" />
                                  ) : (
                                    <XMarkIcon className="h-5 w-5 text-white" />
                                  )}
                                </div>
                                <div className="ml-4">
                                  <div className="text-sm font-medium text-gray-900 dark:text-white">
                                    {payment.user ? `${payment.user.firstName} ${payment.user.lastName}` : 'Unknown User'}
                                  </div>
                                  <div className="text-sm text-gray-500 dark:text-gray-400">
                                    {payment.durationMonths} month{payment.durationMonths > 1 ? 's' : ''} service • ID: {payment.id.slice(0, 8)}...
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-semibold text-gray-900 dark:text-white">
                                {formatCurrency(payment.amount)}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900 dark:text-white capitalize">
                                {payment.method.replace('_', ' ')}
                              </div>
                              {payment.upiNumber && (
                                <div className="text-xs text-gray-500 dark:text-gray-400 font-mono">
                                  {payment.upiNumber}
                                </div>
                              )}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full capitalize ${payment.status === 'approved'
                                ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                                : payment.status === 'pending'
                                  ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300'
                                  : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
                                }`}>
                                {payment.status}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                              {formatDateTime(payment.createdAt)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                              <div className="flex items-center justify-end space-x-2">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleViewPayment(payment)}
                                  className="gap-1"
                                >
                                  <EyeIcon className="h-4 w-4" />
                                  View
                                </Button>
                                {payment.status === 'pending' && (
                                  <>
                                    <Button
                                      size="sm"
                                      onClick={() => handleApprove(payment)}
                                      disabled={updatePaymentStatusMutation.isPending}
                                      className="gap-1 bg-green-600 hover:bg-green-700 text-white"
                                    >
                                      <CheckIcon className="h-4 w-4" />
                                      Approve
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() => {
                                        setSelectedPayment(payment)
                                        handleReject(payment)
                                      }}
                                      disabled={updatePaymentStatusMutation.isPending}
                                      className="gap-1 border-red-300 text-red-700 hover:bg-red-50 dark:border-red-700 dark:text-red-400 dark:hover:bg-red-900/20"
                                    >
                                      <XMarkIcon className="h-4 w-4" />
                                      Reject
                                    </Button>
                                  </>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
              {!isLoading && payments.length > 0 && paymentsData?.pagination && paymentsData.pagination.totalPages > 1 && (
                <CardContent className="pt-0">
                  <div className="flex items-center justify-between border-t border-border/50 pt-4">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span>Page {currentPage} of {paymentsData.pagination.totalPages}</span>
                      <span className="text-muted-foreground/60">•</span>
                      <span>{totalPayments} total payments</span>
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
                        disabled={!paymentsData?.pagination || currentPage >= paymentsData.pagination.totalPages}
                        className="text-xs px-3 py-1.5 h-auto"
                      >
                        Next →
                      </Button>
                    </div>
                  </div>
                </CardContent>
              )}
            </Card>
          </>
        )}

        {activeTab === 'renewals' && (
          <Card className="card-enhanced">
            <CardHeader>
              <CardTitle className="text-white dark:text-indigo-100 font-poppins flex items-center">
                <ClockIcon className="h-5 w-5 mr-2 text-orange-400" />
                Upcoming Renewals ({renewalsList.length})
              </CardTitle>
              <CardDescription className="text-indigo-600 dark:text-indigo-300">
                Users with plans expiring within 3 days
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingRenewals ? (
                <FloatingParticlesLoader message="Loading upcoming renewals..." />
              ) : renewalsList.length === 0 ? (
                <div className="text-center py-12">
                  <ClockIcon className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                  <p className="text-gray-500 dark:text-gray-400 text-lg font-medium">No upcoming renewals</p>
                  <p className="text-gray-400 dark:text-gray-500 text-sm mt-1">Users with expiring plans will appear here</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-800">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          User Details
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          Contact Info
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          Plan Details
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          Expiry Date
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          Days Left
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-800/30 divide-y divide-gray-200 dark:divide-gray-700">
                      {renewalsList.map((payment) => {
                        const daysLeft = payment.endDate
                          ? Math.ceil((new Date(payment.endDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
                          : 0
                        return (
                          <tr key={payment.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <div className="flex-shrink-0 h-10 w-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center">
                                  <span className="text-white font-semibold text-sm">
                                    {payment.user?.firstName?.charAt(0) || 'U'}
                                  </span>
                                </div>
                                <div className="ml-4">
                                  <div className="text-sm font-medium text-gray-900 dark:text-white">
                                    {payment.user?.firstName} {payment.user?.lastName}
                                  </div>
                                  <div className="text-sm text-gray-500 dark:text-gray-400">
                                    ID: {payment.user?.id?.slice(0, 8)}...
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900 dark:text-white">
                                {payment.user?.email}
                              </div>
                              <div className="text-sm text-gray-500 dark:text-gray-400">
                                {payment.user?.phone || 'No phone'}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-semibold text-gray-900 dark:text-white">
                                {formatCurrency(payment.amount)}
                              </div>
                              <div className="text-sm text-gray-500 dark:text-gray-400">
                                {payment.durationMonths} month{payment.durationMonths > 1 ? 's' : ''} plan
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900 dark:text-white">
                                {payment.endDate ? formatDate(payment.endDate) : 'No end date'}
                              </div>
                              <div className="text-sm text-gray-500 dark:text-gray-400">
                                Started: {formatDateTime(payment.createdAt)}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${daysLeft <= 1
                                ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
                                : daysLeft <= 2
                                  ? 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300'
                                  : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300'
                                }`}>
                                {daysLeft <= 0 ? 'Expired' : `${daysLeft} day${daysLeft > 1 ? 's' : ''}`}
                              </span>
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
            {!isLoadingRenewals && renewalsList.length > 0 && renewalsPagination && renewalsPagination.totalPages > 1 && (
              <CardContent className="pt-0">
                <div className="flex items-center justify-between border-t border-border/50 pt-4">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span>Page {renewalsPage} of {renewalsPagination.totalPages}</span>
                    <span className="text-muted-foreground/60">•</span>
                    <span>{renewalsPagination.total} total renewals</span>
                  </div>
                  <div className="flex gap-1">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleRenewalsPreviousPage}
                      disabled={renewalsPage <= 1}
                      className="text-xs px-3 py-1.5 h-auto"
                    >
                      ← Previous
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleRenewalsNextPage}
                      disabled={!renewalsPagination || renewalsPage >= renewalsPagination.totalPages}
                      className="text-xs px-3 py-1.5 h-auto"
                    >
                      Next →
                    </Button>
                  </div>
                </div>
              </CardContent>
            )}
          </Card>
        )}
      </div>

      <Modal isOpen={isPaymentModalOpen} onClose={() => setIsPaymentModalOpen(false)} title="Payment Details" size="2xl">
        {selectedPayment && (
          <div className="space-y-6">
            {/* Card-based Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Payment Information Card */}
              <Card className="bg-slate-800/50 border-slate-700/50 backdrop-blur-sm">
                <CardHeader className="pb-4">
                  <div className="flex items-center space-x-2">
                    <CreditCardIcon className="h-5 w-5 text-blue-400" />
                    <CardTitle className="text-white text-lg">Payment Information</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400 text-sm">Amount</span>
                    <span className="text-white font-semibold text-lg">{formatCurrency(selectedPayment.amount)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400 text-sm">Duration</span>
                    <span className="text-white">{selectedPayment.durationMonths} months</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400 text-sm">Payment Method</span>
                    <span className="text-white capitalize">{selectedPayment.method.replace('_', ' ')}</span>
                  </div>
                  {selectedPayment.upiNumber && (
                    <div className="flex justify-between items-center">
                      <span className="text-slate-400 text-sm">UPI Number</span>
                      <span className="text-white font-mono text-sm">{selectedPayment.upiNumber}</span>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Timeline Card */}
              <Card className="bg-slate-800/50 border-slate-700/50 backdrop-blur-sm">
                <CardHeader className="pb-4">
                  <div className="flex items-center space-x-2">
                    <ClockIcon className="h-5 w-5 text-green-400" />
                    <CardTitle className="text-white text-lg">Timeline</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                    <div className="flex-1">
                      <div className="flex justify-between items-center">
                        <span className="text-white font-medium">Submitted</span>
                        <span className="text-slate-400 text-sm">{formatDateTime(selectedPayment.createdAt)}</span>
                      </div>
                    </div>
                  </div>
                  {selectedPayment.approvedAt && (
                    <div className="flex items-center space-x-3">
                      <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                      <div className="flex-1">
                        <div className="flex justify-between items-center">
                          <span className="text-white font-medium">Approved</span>
                          <span className="text-slate-400 text-sm">{formatDateTime(selectedPayment.approvedAt)}</span>
                        </div>
                      </div>
                    </div>
                  )}
                  <div className="flex justify-between items-center pt-2 border-t border-slate-700">
                    <span className="text-slate-400 text-sm">Reference ID</span>
                    <span className="text-white font-mono text-sm">{selectedPayment.id.slice(0, 12)}...</span>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Payment Proof */}
            {selectedPayment.screenshotUrl && (
              <div>
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Payment Proof</h3>
                <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                  <Image
                    src={selectedPayment.screenshotUrl}
                    alt="Payment screenshot"
                    width={600}
                    height={400}
                    className="w-full h-64 object-contain bg-gray-50 dark:bg-gray-800 cursor-pointer hover:opacity-90 transition-opacity"
                    onClick={() => selectedPayment.screenshotUrl && handleImageClick(selectedPayment.screenshotUrl)}
                  />
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 text-center">Click to view full size</p>
              </div>
            )}

            {/* Notes & Rejection Reason */}
            {(selectedPayment.notes || selectedPayment.rejectionReason) && (
              <div className="space-y-3">
                {selectedPayment.notes && selectedPayment.notes !== selectedPayment.rejectionReason && (
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">Notes</h3>
                    <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3 border border-blue-200 dark:border-blue-800">
                      <p className="text-sm text-blue-700 dark:text-blue-200">{selectedPayment.notes}</p>
                    </div>
                  </div>
                )}
                {selectedPayment.status === 'rejected' && selectedPayment.rejectionReason && (
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">Rejection Reason</h3>
                    <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-3 border border-red-200 dark:border-red-800">
                      <p className="text-sm text-red-700 dark:text-red-200">{selectedPayment.rejectionReason}</p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* Rejection Modal */}
      <Modal
        isOpen={showRejectionForm}
        onClose={handleCancelReject}
        title="Reject Payment"
        size="md"
      >
        {selectedPayment && (
          <div className="space-y-6">
            <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-4 border border-red-200 dark:border-red-800">
              <div className="flex items-center space-x-3 mb-3">
                <XMarkIcon className="h-5 w-5 text-red-600 dark:text-red-400" />
                <div>
                  <h3 className="text-sm font-medium text-red-800 dark:text-red-300">
                    Rejecting payment of {formatCurrency(selectedPayment.amount)}
                  </h3>
                  <p className="text-xs text-red-600 dark:text-red-400">
                    This action cannot be undone
                  </p>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Rejection Reason <span className="text-red-500">*</span>
              </label>
              <Textarea
                value={rejectionNotes}
                onChange={(e) => {
                  setRejectionNotes(e.target.value)
                  if (rejectionError) setRejectionError("")
                }}
                placeholder="Please provide a detailed reason for rejecting this payment (minimum 10 characters)..."
                rows={4}
                className={`w-full ${rejectionError ? 'border-red-500 focus:border-red-500' : ''}`}
              />
              <div className="flex justify-between items-center mt-2">
                <div>
                  {rejectionError && (
                    <p className="text-red-500 text-sm">{rejectionError}</p>
                  )}
                </div>
                <p className={`text-xs ${rejectionNotes.length < 10 ? 'text-red-500' : 'text-gray-500 dark:text-gray-400'}`}>
                  {rejectionNotes.length}/10 characters minimum
                </p>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
              <Button
                variant="outline"
                onClick={handleCancelReject}
                disabled={updatePaymentStatusMutation.isPending}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handleConfirmReject}
                disabled={updatePaymentStatusMutation.isPending}
                className="gap-2 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800"
              >
                <XMarkIcon className="h-4 w-4" />
                Confirm Reject
              </Button>
            </div>
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