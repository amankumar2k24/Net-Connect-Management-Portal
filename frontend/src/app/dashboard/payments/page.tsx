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
} from "@heroicons/react/24/outline"
import { DNAHelixLoader } from "@/components/ui/unique-loader"

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

  const payments = paymentsData?.payments ?? []
  const totalPayments = paymentsData?.pagination.total ?? payments.length

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

  return (
    <DashboardLayout>
      <section className="space-y-8">
        <header className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-2">
            <p className="text-sm uppercase tracking-wide text-primary/80">Finance Desk</p>
            <h1 className="text-3xl font-semibold text-foreground">Payments</h1>
            <p className="text-sm text-muted-foreground">
              Review incoming payments, approve activations, and track outstanding dues.
            </p>
          </div>
        </header>

        <Card className="card-enhanced">
          <CardHeader>
            <CardTitle>Search & Filters</CardTitle>
            <CardDescription>Quickly locate payments using filters and smart search.</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div>
              <label className="mb-2 block text-sm font-medium text-muted-foreground">Search by User ID</label>
              <div className="relative">
                <MagnifyingGlassIcon className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                  placeholder="Enter user id"
                  className="pl-9"
                />
              </div>
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-muted-foreground">Status</label>
              <Select value={statusFilter} onChange={setStatusFilter} options={statusOptions} />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-muted-foreground">Method</label>
              <Select value={methodFilter} onChange={setMethodFilter} options={methodOptions} />
            </div>
          </CardContent>
        </Card>

        <Card className="card-enhanced">
          <CardHeader className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <CardTitle>Transactions ({totalPayments})</CardTitle>
              <CardDescription className="pt-2">Track every payment submitted by your customers.</CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <div className="hidden text-xs font-semibold uppercase tracking-wide text-muted-foreground lg:grid lg:grid-cols-[1fr_1.5fr_1fr_1fr_0.8fr] lg:gap-4 lg:rounded-2xl lg:bg-secondary/70 lg:px-6 lg:py-4">
              <span>Reference</span>
              <span>User</span>
              <span>Amount</span>
              <span>Date</span>
              <span className="text-right">Status</span>
            </div>

            <div className="divide-y divide-border/70 rounded-2xl bg-card shadow-sm">
              {isLoading && <DNAHelixLoader message="Loading payment transactions..." />}

              {!isLoading && payments.length === 0 && (
                <div className="flex flex-col items-center justify-center gap-2 p-12 text-center">
                  <CreditCardIcon className="h-10 w-10 text-muted-foreground" />
                  <p className="text-base font-medium text-foreground">No payments found</p>
                  <p className="text-sm text-muted-foreground">Adjust your filters or check back later.</p>
                </div>
              )}

              {payments.map((payment) => (
                <div
                  key={payment.id}
                  className="grid grid-cols-1 gap-3 px-6 py-5 text-sm text-foreground transition hover:bg-primary/5 lg:grid-cols-[1fr_1.5fr_1fr_1fr_0.8fr] lg:items-center"
                >
                  <span className="font-medium text-muted-foreground">{payment.id.slice(0, 8)}</span>
                  <div className="flex flex-col">
                    <span className="font-medium">
                      {payment.user
                        ? `${payment.user.firstName} ${payment.user.lastName}`.trim()
                        : 'N/A'}
                    </span>
                    <span className="text-xs text-muted-foreground">{payment.user?.email || 'N/A'}</span>
                  </div>
                  <span className="font-semibold">{formatCurrency(payment.amount)}</span>
                  <span className="text-sm text-muted-foreground">{formatDate(payment.createdAt)}</span>
                  <div className="flex flex-col items-end gap-2 text-sm">
                    <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${getStatusBadge(payment.status)}`}>
                      {payment.status}
                    </span>
                    <div className="flex items-center gap-2">
                      <Button size="sm" variant="outline" onClick={() => handleViewPayment(payment)} className="gap-1">
                        <EyeIcon className="h-4 w-4" /> View
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </section>

      <Modal isOpen={isPaymentModalOpen} onClose={() => setIsPaymentModalOpen(false)} title="Payment Details" size="lg">
        {selectedPayment && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-muted-foreground">Payment Information</h3>
                <dl className="space-y-2 rounded-xl border border-border/70 bg-card p-4">
                  <div>
                    <dt className="text-xs text-muted-foreground">Amount</dt>
                    <dd className="text-sm font-semibold text-foreground">{formatCurrency(selectedPayment.amount)}</dd>
                  </div>
                  <div>
                    <dt className="text-xs text-muted-foreground">Duration</dt>
                    <dd className="text-sm text-foreground">{selectedPayment.durationMonths} months</dd>
                  </div>
                  <div>
                    <dt className="text-xs text-muted-foreground">Method</dt>
                    <dd className="text-sm text-foreground capitalize">{selectedPayment.method.replace('_', ' ')}</dd>
                  </div>
                  <div>
                    <dt className="text-xs text-muted-foreground">Submitted</dt>
                    <dd className="text-sm text-foreground">{formatDate(selectedPayment.createdAt)}</dd>
                  </div>
                </dl>
              </div>
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-muted-foreground">User</h3>
                <dl className="space-y-2 rounded-xl border border-border/70 bg-card p-4">
                  <div>
                    <dt className="text-xs text-muted-foreground">Name</dt>
                    <dd className="text-sm text-foreground">
                      {selectedPayment.user
                        ? `${selectedPayment.user.firstName} ${selectedPayment.user.lastName}`.trim()
                        : 'N/A'}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs text-muted-foreground">Email</dt>
                    <dd className="text-sm text-foreground">{selectedPayment.user?.email || 'N/A'}</dd>
                  </div>
                </dl>
              </div>
            </div>

            {selectedPayment.screenshotUrl && (
              <div>
                <h3 className="text-sm font-semibold text-muted-foreground mb-3">Payment Proof</h3>
                <div className="overflow-hidden rounded-xl border border-border/70 bg-card">
                  <Image
                    src={selectedPayment.screenshotUrl}
                    alt="Payment screenshot"
                    width={900}
                    height={600}
                    className="max-h-96 w-full object-contain bg-background"
                  />
                </div>
              </div>
            )}

            {selectedPayment.status === "pending" && (
              <div className="flex justify-end gap-3 border-t border-border/70 pt-4">
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
                  className="gap-2"
                >
                  <CheckIcon className="h-4 w-4" />
                  Approve
                </Button>
              </div>
            )}
          </div>
        )}
      </Modal>
    </DashboardLayout>
  )
}