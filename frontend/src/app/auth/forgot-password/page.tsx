'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useFormik } from 'formik'
import * as Yup from 'yup'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import Logo from '@/components/ui/logo'
import { authApi } from '@/lib/api-functions'
import { toast } from 'react-hot-toast'
import { CheckCircleIcon, EnvelopeIcon } from '@heroicons/react/24/outline'

const forgotPasswordSchema = Yup.object({
  email: Yup.string().email('Invalid email address').required('Email is required'),
})

export default function ForgotPasswordPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [emailSent, setEmailSent] = useState(false)

  const formik = useFormik({
    initialValues: {
      email: '',
    },
    validationSchema: forgotPasswordSchema,
    onSubmit: async (values) => {
      try {
        setIsLoading(true)
        await authApi.forgotPassword(values.email)
        setEmailSent(true)
        toast.success('Password reset link sent to your email!')
      } catch (error: any) {
        toast.error(error.response?.data?.message || 'Failed to send reset email')
      } finally {
        setIsLoading(false)
      }
    },
  })

  if (emailSent) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background py-12 px-4 sm:px-6 lg:px-8">
        <Card className="w-full max-w-md bg-card border-border card-glow">
          <CardHeader className="space-y-1 text-center">
            <div className="text-center mb-4">
              <Logo size="md" variant="stacked" />
            </div>
            <div className="mx-auto mb-4">
              <CheckCircleIcon className="h-12 w-12 text-green-500 mx-auto" />
            </div>
            <CardTitle className="text-2xl font-bold text-green-600">Email Sent!</CardTitle>
            <CardDescription className="text-muted-foreground">
              We've sent a password reset link to <br />
              <span className="font-medium text-foreground">{formik.values.email}</span>
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-primary/10 border border-primary/20 rounded-lg p-4">
              <div className="flex items-center space-x-3">
                <EnvelopeIcon className="h-5 w-5 text-primary flex-shrink-0" />
                <div className="text-sm">
                  <p className="font-medium text-foreground">Check your email</p>
                  <p className="text-muted-foreground">Click the reset link in your email to create a new password.</p>
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <Button
              onClick={() => {
                setEmailSent(false)
                formik.resetForm()
              }}
              variant="outline"
              className="w-full"
            >
              Send another email
            </Button>
            <Link href="/auth/login" className="text-center text-sm text-primary hover:text-primary/80">
              Back to login
            </Link>
          </CardFooter>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md bg-card border-border card-glow">
        <CardHeader className="space-y-1">
          <div className="text-center mb-4">
            <Logo size="md" variant="stacked" />
          </div>
          <CardTitle className="text-2xl font-bold text-center text-foreground">Forgot Password</CardTitle>
          <CardDescription className="text-center text-muted-foreground">
            Enter your email address and we'll send you a link to reset your password
          </CardDescription>
        </CardHeader>
        <form onSubmit={formik.handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium text-foreground">
                Email
              </label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="Enter your email"
                value={formik.values.email}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                className={`bg-input border-border text-foreground placeholder:text-muted-foreground ${formik.touched.email && formik.errors.email ? 'border-destructive' : ''}`}
              />
              {formik.touched.email && formik.errors.email && (
                <p className="text-sm text-destructive">{formik.errors.email}</p>
              )}
            </div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? 'Sending...' : 'Send reset link'}
            </Button>
            <Link href="/auth/login" className="text-center text-sm text-primary hover:text-primary/80">
              Back to login
            </Link>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}