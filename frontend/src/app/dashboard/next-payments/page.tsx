"use client"

import { useMemo, useState, useEffect } from "react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import Image from "next/image"
import { useRouter, useSearchParams } from "next/navigation"
import DashboardLayout from "@/components/layout/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Modal } from "@/components/ui/modal"
import Select, { SelectOption } from "@/components/ui/select"
import { paymentApi } from "@/lib/api-functions"
import { formatCurrency, formatDate } from "@/lib/utils"
import { Payment } from "@/types"
import { toast } from "react-hot-toast"
import { CreditCardIcon, ClockIcon, ArrowUpTrayIcon, CheckCircleIcon } from "@heroicons/react/24/outline"
import { FloatingParticlesLoader, MorphingShapesLoader } from "@/components/ui/unique-loader"

const durationOptions: SelectOption[] = [
  { label: "1 Month", value: "1" },
  { label: "3 Months", value: "3" },
  { label: "6 Months", value: "6" },
  { label: "12 Months", value: "12" },
]

export default function NextPaymentsPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const queryClient = useQueryClient()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [screenshotFile, setScreenshotFile] = useState<File | null>(null)

  const [formState, setFormState] = useState({
    amount: 500,
    durationMonths: "1",
    method: "qr_code" as "qr_code" | "upi",
    upiId: "",
    notes: "",
  })

  const { data: paymentHistory, isLoading: isLoadingHistory } = useQuery({
    queryKey: ["my-payments", "history"],
    queryFn: () => paymentApi.getMyPayments({ limit: 10 }),
  })

  const { data: upcomingPayments, isLoading: isLoadingUpcoming } = useQuery({
    queryKey: ["my-payments", "upcoming"],
    queryFn: () => paymentApi.getUpcomingPayments(),
  })

  const history = paymentHistory?.payments ?? []
  const upcoming = upcomingPayments?.upcomingPayments ?? []

  const activePayment = useMemo(() => history.find((payment) => payment.status === "approved"), [history])

  const createPaymentMutation = useMutation({
    mutationFn: () =>
      paymentApi.createPayment({
        amount: Number(formState.amount),
        durationMonths: Number(formState.durationMonths),
        method: formState.method,
        screenshotFile,
        upiId: formState.method === "upi" ? formState.upiId : undefined,
        notes: formState.notes || undefined,
      }),
    onSuccess: () => {
      toast.success("Payment submitted successfully")
      setIsModalOpen(false)
      setScreenshotFile(null)
      setFormState((prev) => ({ ...prev, notes: "" }))
      queryClient.invalidateQueries({ queryKey: ["my-payments"] })
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Failed to submit payment")
    },
  })

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setScreenshotFile(file)
    }
  }

  const nextPaymentDate = activePayment ? new Date(activePayment.endDate ?? activePayment.createdAt) : null

  useEffect(() => {
    const openModal = searchParams.get('openModal')
    if (openModal === 'true') {
      setIsModalOpen(true)
      router.replace('/dashboard/next-payments')
    }
  }, [searchParams, router])

  return (
    <DashboardLayout>
      <section className="space-y-8">
        <header className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-2">
            <p className="text-sm uppercase tracking-wide text-primary/80">Subscription</p>
            <h1 className="text-3xl font-semibold text-foreground">Next Payments</h1>
            <p className="text-sm text-muted-foreground">
              Track your upcoming renewals and submit payment proofs for review.
            </p>
          </div>
          <Button className="bg-gradient-to-r from-blue-600 via-blue-500 to-blue-600 text-white shadow-lg transform scale-100 border border-blue-400/30 px-6 py-3" onClick={() => setIsModalOpen(true)}>
            <CreditCardIcon className="mr-2 h-4 w-4" /> Submit Payment
          </Button>
        </header>

        <div className="grid gap-6 lg:grid-cols-2">
          <Card className="card-enhanced">
            <CardHeader>
              <CardTitle>Upcoming Renewals</CardTitle>
              <CardDescription>Payments that are due soon</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingUpcoming ? (
                <FloatingParticlesLoader message="Loading upcoming payments..." />
              ) : upcoming.length === 0 ? (
                <p className="text-sm text-muted-foreground">You have no upcoming payments.</p>
              ) : (
                <div className="space-y-4">
                  {upcoming.map((payment) => (
                    <div key={payment.id} className="flex items-center justify-between rounded-xl card-enhanced2 px-4 py-3">
                      <div>
                        <p className="text-sm font-semibold text-foreground">{formatCurrency(payment.amount)}</p>
                        <p className="text-xs text-muted-foreground">Due {formatDate(payment.endDate)}</p>
                      </div>
                      <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${payment.status === 'approved' ? 'bg-green-500/15 text-green-400' : 'bg-yellow-500/15 text-yellow-400'
                        }`}>
                        {payment.status}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="card-enhanced">
            <CardHeader>
              <CardTitle>Current Plan</CardTitle>
              <CardDescription>Overview of your active subscription</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between rounded-xl card-enhanced2 px-4 py-3">
                <div>
                  <p className="text-xs text-muted-foreground">Status</p>
                  <p className="text-sm font-semibold text-foreground">
                    {activePayment ? 'Active' : 'Inactive'}
                  </p>
                </div>
                <CheckCircleIcon className="h-6 w-6 text-primary" />
              </div>
              <div className="rounded-xl card-enhanced2 px-4 py-3">
                <p className="text-xs text-muted-foreground">Next Payment Date</p>
                <p className="text-sm font-semibold text-foreground">
                  {nextPaymentDate ? formatDate(nextPaymentDate) : 'No payment scheduled'}
                </p>
              </div>
              <div className="rounded-xl card-enhanced2 px-4 py-3">
                <p className="text-xs text-muted-foreground">Recent Amount</p>
                <p className="text-sm font-semibold text-foreground">
                  {activePayment ? formatCurrency(activePayment.amount) : 'N/A'}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="card-enhanced">
          <CardHeader>
            <CardTitle>Payment History</CardTitle>
            <CardDescription>Review your latest submissions</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoadingHistory ? (
              <MorphingShapesLoader message="Loading payment history..." />
            ) : history.length === 0 ? (
              <p className="text-sm text-muted-foreground">No payment history available yet.</p>
            ) : (
              <div className="divide-y divide-border/70 rounded-2xl bg-card">
                {history.map((payment) => (
                  <div key={payment.id} className="grid gap-4 px-6 py-4 text-sm text-foreground md:grid-cols-[1fr_1fr_1fr_0.5fr] md:items-center">
                    <div>
                      <p className="text-xs text-muted-foreground">Reference</p>
                      <p className="font-semibold text-foreground">{payment.id.slice(0, 8)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Amount</p>
                      <p className="font-semibold text-foreground">{formatCurrency(payment.amount)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Submitted</p>
                      <p className="font-medium text-foreground">{formatDate(payment.createdAt)}</p>
                    </div>
                    <div className="flex justify-end">
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${payment.status === 'approved'
                          ? 'bg-green-500/15 text-green-400'
                          : payment.status === 'pending'
                            ? 'bg-yellow-500/15 text-yellow-400'
                            : 'bg-red-500/15 text-red-400'
                          }`}
                      >
                        {payment.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </section>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Submit Payment" size="lg">
        <div className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-300">Amount (INR)</label>
              <Input
                variant="modal"
                type="number"
                min={100}
                value={formState.amount}
                onChange={(event) => setFormState((prev) => ({ ...prev, amount: Number(event.target.value) }))}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-300">Duration</label>
              <Select
                variant="modal"
                value={formState.durationMonths}
                onChange={(value) => setFormState((prev) => ({ ...prev, durationMonths: value }))}
                options={durationOptions}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-300">Payment Method</label>
              <div className="grid grid-cols-2 gap-3">
                <Button
                  type="button"
                  variant={formState.method === 'qr_code' ? 'default' : 'outline'}
                  className={formState.method === 'qr_code' ? 'btn-primary ' : ''}
                  onClick={() => setFormState((prev) => ({ ...prev, method: 'qr_code' }))}
                >
                  QR Code
                </Button>
                <Button
                  type="button"
                  variant={formState.method === 'upi' ? 'default' : 'outline'}
                  className={formState.method === 'upi' ? 'btn-primary' : ''}
                  onClick={() => setFormState((prev) => ({ ...prev, method: 'upi' }))}
                >
                  UPI
                </Button>
              </div>
            </div>
            {formState.method === 'upi' && (
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300">UPI ID</label>
                <Input
                  variant="modal"
                  value={formState.upiId}
                  onChange={(event) => setFormState((prev) => ({ ...prev, upiId: event.target.value }))}
                  placeholder="yourname@upi"
                />
              </div>
            )}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-300">Payment Screenshot</label>
            <label className="flex h-32 cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-border/70 bg-card text-sm text-muted-foreground hover:border-primary">
              <ArrowUpTrayIcon className="h-5 w-5" />
              <span>Click to upload screenshot</span>
              <input type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
            </label>
            {screenshotFile && (
              <div className="overflow-hidden rounded-xl border border-border/70">
                <Image
                  src={URL.createObjectURL(screenshotFile)}
                  alt="Payment screenshot preview"
                  width={400}
                  height={220}
                  className="max-h-48 w-full object-cover"
                />
              </div>
            )}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-300">Notes (optional)</label>
            <Input
              variant="modal"
              value={formState.notes}
              onChange={(event) => setFormState((prev) => ({ ...prev, notes: event.target.value }))}
              placeholder="Any additional information"
            />
          </div>

          <div className="flex justify-end gap-3">
            <Button className="card-enhanced2" variant="outline" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={() => createPaymentMutation.mutate()}
              disabled={createPaymentMutation.isPending || (!screenshotFile && formState.method === 'qr_code')}
              className=" bg-gradient-to-r from-blue-600 via-blue-500 to-blue-600 text-white shadow-lg transform scale-100 border border-blue-400/30 gap-2"
            >
              <CreditCardIcon className="h-4 w-4" />
              {createPaymentMutation.isPending ? 'Submitting...' : 'Submit Payment'}
            </Button>
          </div>
        </div>
      </Modal>
    </DashboardLayout>
  )
}