'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useFormik } from 'formik'
import * as Yup from 'yup'
import Image from 'next/image'
import DashboardLayout from '@/components/layout/dashboard-layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Modal } from '@/components/ui/modal'
import { paymentApi, adminApi } from '@/lib/api-functions'
import { formatCurrency, formatDate } from '@/lib/utils'
import { useAuth } from '@/contexts/auth-context'
import { toast } from 'react-hot-toast'
import {
  CalendarDaysIcon,
  CheckCircleIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  CreditCardIcon,
  QrCodeIcon,
  DevicePhoneMobileIcon,
  PhotoIcon,
  XMarkIcon
} from '@heroicons/react/24/outline'

const paymentSchema = Yup.object({
  amount: Yup.number().min(1, 'Amount must be greater than 0').required('Amount is required'),
  duration: Yup.number().min(1, 'Duration must be at least 1 month').required('Duration is required'),
  method: Yup.string().oneOf(['qr', 'upi'], 'Invalid payment method').required('Payment method is required'),
  upiNumber: Yup.string().when('method', {
    is: 'upi',
    then: (schema) => schema.required('UPI number is required for UPI payments'),
    otherwise: (schema) => schema.notRequired(),
  }),
  screenshot: Yup.mixed().required('Payment screenshot is required'),
})

export default function NextPaymentsPage() {
  const { user } = useAuth()
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false)
  const [selectedScreenshot, setSelectedScreenshot] = useState<File | null>(null)
  const [isImagePreviewOpen, setIsImagePreviewOpen] = useState(false)
  const [previewImageUrl, setPreviewImageUrl] = useState('')

  const queryClient = useQueryClient()

  const { data: userPayments, isLoading: paymentsLoading } = useQuery({
    queryKey: ['user-payment-schedule', user?.id],
    queryFn: () => paymentApi.getUserPayments(user?.id || ''),
    enabled: !!user?.id,
  })

  const { data: adminSettings } = useQuery({
    queryKey: ['admin-settings'],
    queryFn: () => adminApi.getSettings(),
  })

  const createPaymentMutation = useMutation({
    mutationFn: (data: any) => paymentApi.createPayment(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-payment-schedule'] })
      toast.success('Payment submitted successfully! It will be reviewed by admin.')
      setIsPaymentModalOpen(false)
      formik.resetForm()
      setSelectedScreenshot(null)
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to submit payment')
    },
  })

  const payments = userPayments?.data?.data || []
  const settings = adminSettings?.data?.data || {}

  // Get current active payment and next payment
  const activePayment = payments.find((p: any) =>
    p.status === 'approved' &&
    new Date(p.expiryDate) > new Date()
  )

  const pendingPayment = payments.find((p: any) => p.status === 'pending')

  // Calculate next payment date based on active payment
  const getNextPaymentDate = () => {
    if (!activePayment) return new Date()
    return new Date(activePayment.expiryDate)
  }

  const nextPaymentDate = getNextPaymentDate()
  const daysUntilPayment = Math.ceil((nextPaymentDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))

  const formik = useFormik({
    initialValues: {
      amount: 500,
      duration: 1,
      method: 'qr' as 'qr' | 'upi',
      upiNumber: '',
      screenshot: null,
    },
    validationSchema: paymentSchema,
    onSubmit: async (values) => {
      if (!selectedScreenshot) {
        toast.error('Please upload payment screenshot')
        return
      }

      const formData = {
        ...values,
        screenshot: selectedScreenshot,
      }

      createPaymentMutation.mutate(formData)
    },
  })

  const handleScreenshotChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setSelectedScreenshot(file)
      formik.setFieldValue('screenshot', file)
    }
  }

  const handleDurationChange = (duration: number) => {
    formik.setFieldValue('duration', duration)
    formik.setFieldValue('amount', duration * 500) // ₹500 per month
  }

  const handlePreviewImage = (imageUrl: string) => {
    setPreviewImageUrl(imageUrl)
    setIsImagePreviewOpen(true)
  }

  const paymentSchedule = [
    // Current active payment
    ...(activePayment ? [{
      id: activePayment.id,
      type: 'current' as const,
      amount: activePayment.amount,
      duration: activePayment.duration,
      status: 'active',
      startDate: activePayment.activationDate || activePayment.createdAt,
      endDate: activePayment.expiryDate,
      daysRemaining: Math.max(0, Math.ceil((new Date(activePayment.expiryDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)))
    }] : []),
    // Pending payment
    ...(pendingPayment ? [{
      id: pendingPayment.id,
      type: 'pending' as const,
      amount: pendingPayment.amount,
      duration: pendingPayment.duration,
      status: 'pending',
      startDate: pendingPayment.createdAt,
      endDate: null,
      daysRemaining: null
    }] : []),
    // Next payment (if no pending payment and active payment exists)
    ...(!pendingPayment && activePayment ? [{
      id: 'next',
      type: 'upcoming' as const,
      amount: 0,
      duration: 0,
      status: 'due',
      startDate: activePayment.expiryDate,
      endDate: null,
      daysRemaining: daysUntilPayment
    }] : []),
  ]

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="md:flex md:items-center md:justify-between">
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl font-bold leading-7 text-foreground sm:text-3xl sm:truncate">
              Next Payment Dates
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Manage your current plan and upcoming payments
            </p>
          </div>
          <div className="mt-4 flex md:mt-0 md:ml-4">
            <Button
              onClick={() => setIsPaymentModalOpen(true)}
              disabled={!!pendingPayment}
            >
              <CreditCardIcon className="h-4 w-4 mr-2" />
              {pendingPayment ? 'Payment Pending' : 'Make Payment'}
            </Button>
          </div>
        </div>

        {/* Payment Schedule */}
        <div className="space-y-4">
          {paymentSchedule.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <CalendarDaysIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium text-foreground mb-2">No Active Plan</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  You don't have any active WiFi plan. Make your first payment to get started.
                </p>
                <Button onClick={() => setIsPaymentModalOpen(true)}>
                  <CreditCardIcon className="h-4 w-4 mr-2" />
                  Make First Payment
                </Button>
              </CardContent>
            </Card>
          ) : (
            paymentSchedule.map((payment) => (
              <Card key={payment.id} className={`${payment.type === 'current' ? 'bg-green-50 border-green-200' :
                payment.type === 'pending' ? 'bg-yellow-50 border-yellow-200' :
                  'bg-red-50 border-red-200'
                }`}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className={`flex-shrink-0 p-3 rounded-full ${payment.type === 'current' ? 'bg-green-100' :
                        payment.type === 'pending' ? 'bg-yellow-100' :
                          'bg-red-100'
                        }`}>
                        {payment.type === 'current' ? (
                          <CheckCircleIcon className="h-6 w-6 text-green-600" />
                        ) : payment.type === 'pending' ? (
                          <ClockIcon className="h-6 w-6 text-yellow-600" />
                        ) : (
                          <ExclamationTriangleIcon className="h-6 w-6 text-red-600" />
                        )}
                      </div>
                      <div>
                        <h3 className={`text-lg font-semibold ${payment.type === 'current' ? 'text-green-900' :
                          payment.type === 'pending' ? 'text-yellow-900' :
                            'text-red-900'
                          }`}>
                          {payment.type === 'current' ? 'Current Active Plan' :
                            payment.type === 'pending' ? 'Payment Under Review' :
                              'Payment Due'}
                        </h3>
                        <p className={`text-sm ${payment.type === 'current' ? 'text-green-700' :
                          payment.type === 'pending' ? 'text-yellow-700' :
                            'text-red-700'
                          }`}>
                          {payment.type === 'current' ?
                            `${formatCurrency(payment.amount)} for ${payment.duration} months` :
                            payment.type === 'pending' ?
                              `${formatCurrency(payment.amount)} for ${payment.duration} months - Awaiting approval` :
                              'Make payment to continue WiFi service'}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      {payment.type === 'current' && (
                        <>
                          <p className="text-sm font-medium text-foreground">
                            {payment.daysRemaining !== null ? payment.daysRemaining : 0} days remaining
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Expires: {payment.endDate ? formatDate(payment.endDate) : 'N/A'}
                          </p>
                        </>
                      )}
                      {payment.type === 'pending' && (
                        <p className="text-sm font-medium text-yellow-700">
                          Submitted: {formatDate(payment.startDate)}
                        </p>
                      )}
                      {payment.type === 'upcoming' && (
                        <>
                          <p className="text-sm font-medium text-red-900">
                            {payment.daysRemaining !== null && payment.daysRemaining > 0 ? `Due in ${payment.daysRemaining} days` : 'Overdue'}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Due: {formatDate(payment.startDate)}
                          </p>
                        </>
                      )}
                    </div>
                  </div>

                  {payment.type === 'current' && (
                    <div className="mt-4 grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Plan Started</p>
                        <p className="font-medium">{formatDate(payment.startDate)}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Plan Duration</p>
                        <p className="font-medium">{payment.duration} months</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Amount Paid</p>
                        <p className="font-medium">{formatCurrency(payment.amount)}</p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Payment Reminder */}
        {activePayment && daysUntilPayment <= 5 && daysUntilPayment > 0 && !pendingPayment && (
          <Card className="bg-orange-50 border-orange-200">
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <ExclamationTriangleIcon className="h-8 w-8 text-orange-600" />
                <div>
                  <h3 className="text-lg font-semibold text-orange-900">Payment Reminder</h3>
                  <p className="text-sm text-orange-700">
                    Your WiFi plan expires in {daysUntilPayment} days. Make your next payment to avoid service interruption.
                  </p>
                </div>
                <Button
                  onClick={() => setIsPaymentModalOpen(true)}
                  className="bg-orange-600 hover:bg-orange-700"
                >
                  Pay Now
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Payment Instructions */}
        <Card>
          <CardHeader>
            <CardTitle>Payment Instructions</CardTitle>
            <CardDescription>How to make your WiFi service payment</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium text-foreground mb-2">Available Payment Methods</h4>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-center">
                    <QrCodeIcon className="h-4 w-4 mr-2" />
                    QR Code Payment
                  </li>
                  <li className="flex items-center">
                    <DevicePhoneMobileIcon className="h-4 w-4 mr-2" />
                    UPI Payment
                  </li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium text-foreground mb-2">Payment Process</h4>
                <ol className="list-decimal list-inside space-y-1 text-sm text-muted-foreground">
                  <li>Choose your payment duration</li>
                  <li>Select payment method (QR/UPI)</li>
                  <li>Make payment and take screenshot</li>
                  <li>Upload screenshot for verification</li>
                  <li>Wait for admin approval</li>
                </ol>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Payment Modal */}
        <Modal
          isOpen={isPaymentModalOpen}
          onClose={() => setIsPaymentModalOpen(false)}
          title="Make Payment"
          size="lg"
        >
          <form onSubmit={formik.handleSubmit} className="space-y-6">
            {/* Duration Selection */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-3">
                Select Duration
              </label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {[
                  { months: 1, price: 500 },
                  { months: 2, price: 1000 },
                  { months: 3, price: 1500 },
                  { months: 6, price: 3000 },
                  { months: 12, price: 6000 },
                ].map(({ months, price }) => (
                  <button
                    key={months}
                    type="button"
                    onClick={() => handleDurationChange(months)}
                    className={`p-3 rounded-lg border text-center transition-colors ${formik.values.duration === months
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-300 hover:border-gray-400'
                      }`}
                  >
                    <div className="font-medium">{months} Month{months > 1 ? 's' : ''}</div>
                    <div className="text-sm text-muted-foreground">{formatCurrency(price)}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Amount Display */}
            <div>
              <label className="block text-sm font-medium text-foreground">Total Amount</label>
              <div className="mt-1 text-2xl font-bold text-foreground">
                {formatCurrency(formik.values.amount)}
              </div>
            </div>

            {/* Payment Method */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-3">
                Payment Method
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => formik.setFieldValue('method', 'qr')}
                  className={`p-3 rounded-lg border text-center transition-colors ${formik.values.method === 'qr'
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-300 hover:border-gray-400'
                    }`}
                >
                  <QrCodeIcon className="h-6 w-6 mx-auto mb-2" />
                  QR Code
                </button>
                <button
                  type="button"
                  onClick={() => formik.setFieldValue('method', 'upi')}
                  className={`p-3 rounded-lg border text-center transition-colors ${formik.values.method === 'upi'
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-300 hover:border-gray-400'
                    }`}
                >
                  <DevicePhoneMobileIcon className="h-6 w-6 mx-auto mb-2" />
                  UPI
                </button>
              </div>
            </div>

            {/* Payment Details */}
            {formik.values.method === 'qr' && settings.qrCode && (
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Scan QR Code
                </label>
                <div className="border rounded-lg p-4 text-center bg-muted/20">
                  <QrCodeIcon className="h-16 w-16 text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">QR Code for Payment</p>
                </div>
              </div>
            )}

            {formik.values.method === 'upi' && (
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  UPI ID: {settings.upiNumber || 'Contact admin for UPI details'}
                </label>
                <Input
                  name="upiNumber"
                  placeholder="Enter UPI number used for payment"
                  value={formik.values.upiNumber}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  className={formik.touched.upiNumber && formik.errors.upiNumber ? 'border-red-500' : ''}
                />
                {formik.touched.upiNumber && formik.errors.upiNumber && (
                  <p className="mt-1 text-sm text-red-700">{formik.errors.upiNumber}</p>
                )}
              </div>
            )}

            {/* Screenshot Upload */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Payment Screenshot
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={handleScreenshotChange}
                className="block w-full text-sm text-muted-foreground file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              />
              {formik.touched.screenshot && formik.errors.screenshot && (
                <p className="mt-1 text-sm text-red-700">{formik.errors.screenshot}</p>
              )}
              {selectedScreenshot && (
                <div className="mt-2">
                  <Image
                    src={URL.createObjectURL(selectedScreenshot)}
                    alt="Payment screenshot preview"
                    width={128}
                    height={128}
                    className="h-32 w-32 object-cover rounded border"
                  />
                </div>
              )}
            </div>

            {/* Submit Button */}
            <div className="flex justify-end space-x-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsPaymentModalOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={createPaymentMutation.isPending}
              >
                {createPaymentMutation.isPending ? 'Submitting...' : 'Submit Payment'}
              </Button>
            </div>
          </form>
        </Modal>

        {/* Image Preview Modal */}
        <Modal
          isOpen={isImagePreviewOpen}
          onClose={() => setIsImagePreviewOpen(false)}
          title="Image Preview"
          size="xl"
        >
          <div className="text-center">
            <Image
              src={previewImageUrl}
              alt="Preview"
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