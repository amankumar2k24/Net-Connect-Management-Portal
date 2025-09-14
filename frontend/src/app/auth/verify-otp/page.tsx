'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { useFormik } from 'formik'
import * as Yup from 'yup'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import Logo from '@/components/ui/logo'
import { authApi } from '@/lib/api-functions'
import { toast } from 'react-hot-toast'

const otpSchema = Yup.object({
  otp: Yup.string().matches(/^[0-9]{6}$/, 'OTP must be 6 digits').required('OTP is required'),
})

export default function VerifyOtpPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isLoading, setIsLoading] = useState(false)
  const [isResending, setIsResending] = useState(false)
  const [email, setEmail] = useState('')
  const [countdown, setCountdown] = useState(0)

  useEffect(() => {
    const emailParam = searchParams.get('email')
    if (!emailParam) {
      toast.error('Invalid verification link')
      router.push('/auth/register')
      return
    }
    setEmail(emailParam)
  }, [searchParams, router])

  useEffect(() => {
    let timer: NodeJS.Timeout
    if (countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000)
    }
    return () => clearTimeout(timer)
  }, [countdown])

  const formik = useFormik({
    initialValues: {
      otp: '',
    },
    validationSchema: otpSchema,
    onSubmit: async (values) => {
      try {
        setIsLoading(true)
        await authApi.verifyOtp({ email, otp: values.otp })
        toast.success('Email verified successfully! Please login.')
        router.push('/auth/login')
      } catch (error: any) {
        toast.error(error.response?.data?.message || 'OTP verification failed')
      } finally {
        setIsLoading(false)
      }
    },
  })

  const handleResendOtp = async () => {
    try {
      setIsResending(true)
      await authApi.resendOtp(email)
      toast.success('OTP sent successfully!')
      setCountdown(60) // 60 seconds countdown
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to resend OTP')
    } finally {
      setIsResending(false)
    }
  }

  if (!email) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background py-12 px-4 sm:px-6 lg:px-8">
        <Card className="w-full max-w-md bg-card border-border card-glow">
          <CardHeader className="space-y-1 text-center">
            <div className="text-center mb-4">
              <Logo size="md" variant="stacked" />
            </div>
            <CardTitle className="text-2xl font-bold text-destructive">Invalid Link</CardTitle>
            <CardDescription className="text-muted-foreground">
              This verification link is invalid.
            </CardDescription>
          </CardHeader>
          <CardFooter>
            <Link href="/auth/register" className="w-full">
              <Button className="w-full">Go to registration</Button>
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
          <CardTitle className="text-2xl font-bold text-center text-foreground">Verify Your Email</CardTitle>
          <CardDescription className="text-center text-muted-foreground">
            We've sent a 6-digit verification code to <br />
            <span className="font-medium text-foreground">{email}</span>
          </CardDescription>
        </CardHeader>
        <form onSubmit={formik.handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="otp" className="text-sm font-medium text-foreground">
                Verification Code
              </label>
              <Input
                id="otp"
                name="otp"
                type="text"
                placeholder="Enter 6-digit code"
                maxLength={6}
                value={formik.values.otp}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                className={`text-center text-lg tracking-wider bg-input border-border text-foreground placeholder:text-muted-foreground ${formik.touched.otp && formik.errors.otp ? 'border-destructive' : ''
                  }`}
              />
              {formik.touched.otp && formik.errors.otp && (
                <p className="text-sm text-destructive">{formik.errors.otp}</p>
              )}
            </div>

            <div className="text-center">
              <p className="text-sm text-muted-foreground">
                Didn't receive the code?{' '}
                {countdown > 0 ? (
                  <span className="text-muted-foreground">
                    Resend in {countdown}s
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={handleResendOtp}
                    disabled={isResending}
                    className="text-primary hover:text-primary/80 transition-colors"
                  >
                    {isResending ? 'Sending...' : 'Resend OTP'}
                  </button>
                )}
              </p>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? 'Verifying...' : 'Verify Email'}
            </Button>
            <Link href="/auth/register" className="text-center text-sm text-primary hover:text-primary/80">
              Back to registration
            </Link>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}