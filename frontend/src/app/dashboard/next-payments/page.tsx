"use client"

import { useMemo, useState, useEffect } from "react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import Image from "next/image"
import { useRouter, useSearchParams } from "next/navigation"
import * as yup from 'yup'
import DashboardLayout from "@/components/layout/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Modal } from "@/components/ui/modal"
import { paymentApi, paymentPlansApi } from "@/lib/api-functions"
import { formatCurrency, formatDate, formatDateTime } from "@/lib/utils"
import { toast } from "react-hot-toast"
import { CreditCardIcon, ArrowUpTrayIcon, CheckCircleIcon } from "@heroicons/react/24/outline"
import { FloatingParticlesLoader, MorphingShapesLoader } from "@/components/ui/unique-loader"



// Validation schema
const paymentValidationSchema = yup.object().shape({
  selectedPlanId: yup.string().required('Please select a payment plan'),
  method: yup.string().oneOf(['qr_code', 'upi'], 'Please select a payment method').required('Payment method is required'),
  upiId: yup.string().when('method', {
    is: 'upi',
    then: (schema) => schema.required('UPI ID is required for UPI payments').matches(/^[\w.-]+@[\w.-]+$/, 'Please enter a valid UPI ID'),
    otherwise: (schema) => schema.notRequired(),
  }),
  screenshotFile: yup.mixed().required('Payment screenshot is mandatory for verification'),
  notes: yup.string().notRequired(),
})

export default function NextPaymentsPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const queryClient = useQueryClient()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [screenshotFile, setScreenshotFile] = useState<File | null>(null)
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({})

  const [formState, setFormState] = useState({
    selectedPlanId: "",
    amount: 0,
    durationMonths: 1,
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

  const { data: paymentPlansData, isLoading: isLoadingPlans } = useQuery({
    queryKey: ["payment-plans", "active"],
    queryFn: () => paymentPlansApi.getActive(),
  })

  const history = paymentHistory?.payments ?? []
  const upcoming = upcomingPayments?.upcomingPayments ?? []
  const paymentPlans = paymentPlansData?.paymentPlans ?? []

  const activePayment = useMemo(() => history.find((payment) => payment.status === "approved"), [history])

  const validateForm = async () => {
    try {
      await paymentValidationSchema.validate({
        selectedPlanId: formState.selectedPlanId,
        method: formState.method,
        upiId: formState.upiId,
        screenshotFile,
        notes: formState.notes,
      }, { abortEarly: false })

      setValidationErrors({})
      return true
    } catch (error) {
      if (error instanceof yup.ValidationError) {
        const errors: Record<string, string> = {}
        error.inner.forEach((err) => {
          if (err.path) {
            errors[err.path] = err.message
          }
        })
        setValidationErrors(errors)

        // Show the first error as a toast
        const firstError = error.inner[0]?.message
        if (firstError) {
          toast.error(firstError)
        }
      }
      return false
    }
  }

  const createPaymentMutation = useMutation({
    mutationFn: async () => {
      const isValid = await validateForm()
      if (!isValid) {
        throw new Error("Please fix the validation errors")
      }

      return paymentApi.createPayment({
        amount: formState.amount,
        durationMonths: formState.durationMonths,
        method: formState.method,
        screenshotFile: screenshotFile!,
        upiId: formState.method === "upi" ? formState.upiId : undefined,
        notes: formState.notes || undefined,
      })
    },
    onSuccess: () => {
      toast.success("Payment submitted successfully")
      setIsModalOpen(false)
      setScreenshotFile(null)
      setValidationErrors({})
      setFormState({
        selectedPlanId: "",
        amount: 0,
        durationMonths: 1,
        method: "qr_code",
        upiId: "",
        notes: "",
      })
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
      // Clear validation error for screenshotFile
      if (validationErrors.screenshotFile) {
        setValidationErrors(prev => ({ ...prev, screenshotFile: '' }))
      }
    }
  }

  const handlePlanSelect = (planId: string) => {
    const selectedPlan = paymentPlans.find(plan => plan.id === planId)
    if (selectedPlan) {
      setFormState(prev => ({
        ...prev,
        selectedPlanId: planId,
        amount: selectedPlan.amount,
        durationMonths: selectedPlan.durationMonths,
      }))
      // Clear validation error for selectedPlanId
      if (validationErrors.selectedPlanId) {
        setValidationErrors(prev => ({ ...prev, selectedPlanId: '' }))
      }
    }
  }

  const handleMethodChange = (method: 'qr_code' | 'upi') => {
    setFormState(prev => ({ ...prev, method }))
    // Clear validation errors for method and upiId
    if (validationErrors.method) {
      setValidationErrors(prev => ({ ...prev, method: '' }))
    }
    if (method === 'qr_code' && validationErrors.upiId) {
      setValidationErrors(prev => ({ ...prev, upiId: '' }))
    }
  }

  const handleUpiIdChange = (upiId: string) => {
    setFormState(prev => ({ ...prev, upiId }))
    // Clear validation error for upiId
    if (validationErrors.upiId) {
      setValidationErrors(prev => ({ ...prev, upiId: '' }))
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
                  <div key={payment.id} className="grid gap-4 px-6 py-4 text-sm text-foreground md:grid-cols-[1fr_1fr_2fr_0.5fr] md:items-center">
                    <div>
                      <p className="text-xs text-muted-foreground">Reference</p>
                      <p className="font-semibold text-foreground">{payment.id.slice(0, 8)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Amount</p>
                      <p className="font-semibold text-foreground">{formatCurrency(payment.amount)}</p>
                    </div>
                    <div>
                      <div className="space-y-1">
                        <div>
                          <p className="text-xs text-muted-foreground">Submitted</p>
                          <p className="font-medium text-foreground text-xs">{formatDateTime(payment.createdAt)}</p>
                        </div>
                        {payment.approvedAt && (
                          <div>
                            <p className="text-xs text-muted-foreground">Approved</p>
                            <p className="font-medium text-foreground text-xs">{formatDateTime(payment.approvedAt)}</p>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex justify-end">
                      <span
                        className={`inline-flex capitalize items-center rounded-full px-2.5 py-1 text-xs font-semibold ${payment.status === 'approved'
                          ? 'bg-green-500 text-green-400'
                          : payment.status === 'pending'
                            ? 'bg-yellow-500 text-yellow-400'
                            : 'bg-red-500 text-red-400'
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
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Select Duration</label>
              {isLoadingPlans ? (
                <div className="text-sm text-gray-500">Loading payment plans...</div>
              ) : (
                <div className="grid gap-3 md:grid-cols-2">
                  {paymentPlans.map((plan) => (
                    <div
                      key={plan.id}
                      className={`cursor-pointer rounded-lg border-2 p-4 transition-all ${formState.selectedPlanId === plan.id
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                        : validationErrors.selectedPlanId
                          ? 'border-red-500 hover:border-red-400'
                          : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                        }`}
                      onClick={() => handlePlanSelect(plan.id)}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-gray-900 dark:text-gray-100">{plan.durationLabel}</p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">{plan.durationMonths} month{plan.durationMonths > 1 ? 's' : ''}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-bold text-gray-900 dark:text-gray-100">₹{plan.amount}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              {validationErrors.selectedPlanId && (
                <p className="text-xs text-red-500">{validationErrors.selectedPlanId}</p>
              )}
            </div>

            {formState.selectedPlanId && (
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Amount (INR)</label>
                  <Input
                    type="number"
                    min={100}
                    value={formState.amount}
                    readOnly
                    className="w-full bg-gray-50 dark:bg-gray-800"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Duration</label>
                  <Input
                    value={`${formState.durationMonths} month${formState.durationMonths > 1 ? 's' : ''}`}
                    readOnly
                    className="w-full bg-gray-50 dark:bg-gray-800"
                  />
                </div>
              </div>
            )}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Payment Method</label>
              <div className="grid grid-cols-2 gap-3">
                <Button
                  type="button"
                  variant={formState.method === 'qr_code' ? 'default' : 'outline'}
                  onClick={() => handleMethodChange('qr_code')}
                  className={validationErrors.method ? 'border-red-500' : ''}
                >
                  QR Code
                </Button>
                <Button
                  type="button"
                  variant={formState.method === 'upi' ? 'default' : 'outline'}
                  onClick={() => handleMethodChange('upi')}
                  className={validationErrors.method ? 'border-red-500' : ''}
                >
                  UPI
                </Button>
              </div>
              {validationErrors.method && (
                <p className="text-xs text-red-500">{validationErrors.method}</p>
              )}
            </div>
            {formState.method === 'upi' && (
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">UPI ID</label>
                <Input
                  value={formState.upiId}
                  onChange={(event) => handleUpiIdChange(event.target.value)}
                  placeholder="yourname@upi"
                  className={validationErrors.upiId ? 'border-red-500 focus:border-red-500' : ''}
                />
                {validationErrors.upiId && (
                  <p className="text-xs text-red-500">{validationErrors.upiId}</p>
                )}
              </div>
            )}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Payment Screenshot <span className="text-red-500">*</span>
            </label>
            <label className={`flex h-32 cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed bg-gray-50 dark:bg-gray-800 text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${validationErrors.screenshotFile
              ? 'border-red-500 hover:border-red-400'
              : 'border-gray-300 dark:border-gray-600 hover:border-blue-500'
              }`}>
              <ArrowUpTrayIcon className="h-5 w-5" />
              <span>Click to upload screenshot (Required)</span>
              <input type="file" accept="image/*" className="hidden" onChange={handleFileChange} required />
            </label>
            {screenshotFile && (
              <div className="overflow-hidden rounded-xl border border-gray-200 dark:border-gray-700">
                <Image
                  src={URL.createObjectURL(screenshotFile)}
                  alt="Payment screenshot preview"
                  width={400}
                  height={220}
                  className="max-h-48 w-full object-cover"
                />
              </div>
            )}
            {validationErrors.screenshotFile && (
              <p className="text-xs text-red-500">{validationErrors.screenshotFile}</p>
            )}
            {!screenshotFile && !validationErrors.screenshotFile && (
              <p className="text-xs text-red-500">Payment screenshot is mandatory for verification</p>
            )}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Notes (optional)</label>
            <Input
              value={formState.notes}
              onChange={(event) => setFormState((prev) => ({ ...prev, notes: event.target.value }))}
              placeholder="Any additional information"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={() => createPaymentMutation.mutate()}
              disabled={createPaymentMutation.isPending || !screenshotFile || !formState.selectedPlanId}
              className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white"
            >
              <CreditCardIcon className="h-4 w-4 mr-2" />
              {createPaymentMutation.isPending ? 'Submitting...' : 'Submit Payment'}
            </Button>
          </div>
        </div>
      </Modal>
    </DashboardLayout>
  )
}