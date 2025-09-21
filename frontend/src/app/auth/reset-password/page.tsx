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
import { XMarkIcon } from '@heroicons/react/24/outline'
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline'

const resetPasswordSchema = Yup.object({
  password: Yup.string().min(6, 'Password must be at least 6 characters').required('Password is required'),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref('password')], 'Passwords must match')
    .required('Confirm password is required'),
})

export default function ResetPasswordPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isLoading, setIsLoading] = useState(false)
  const [token, setToken] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  useEffect(() => {
    const tokenParam = searchParams.get('token')
    if (!tokenParam) {
      toast.error('Invalid reset link')
      router.push('/auth/forgot-password')
      return
    }
    setToken(tokenParam)
  }, [searchParams, router])

  const formik = useFormik({
    initialValues: {
      password: '',
      confirmPassword: '',
    },
    validationSchema: resetPasswordSchema,
    onSubmit: async (values) => {
      try {
        setIsLoading(true)
        await authApi.resetPassword({ token, password: values.password })
        toast.success('Password reset successful! Please login with your new password.')
        router.push('/auth/login')
      } catch (error: any) {
        toast.error(error.response?.data?.message || 'Failed to reset password')
      } finally {
        setIsLoading(false)
      }
    },
  })

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background py-12 px-4 sm:px-6 lg:px-8">
        <Card className="w-full max-w-md bg-card border-border card-glow">
          <CardHeader className="space-y-1 text-center">
            <div className="text-center mb-4">
              <Logo size="md" variant="stacked" />
            </div>
            <div className="mx-auto mb-4">
              <XMarkIcon className="h-12 w-12 text-destructive mx-auto" />
            </div>
            <CardTitle className="text-2xl font-bold text-destructive">Invalid Link</CardTitle>
            <CardDescription className="text-muted-foreground">
              This password reset link is invalid or has expired.
            </CardDescription>
          </CardHeader>
          <CardFooter>
            <Link href="/auth/forgot-password" className="w-full">
              <Button className="w-full">Request new reset link</Button>
            </Link>
          </CardFooter>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md card-enhanced">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center text-foreground">Reset Password</CardTitle>
          <CardDescription className="text-center text-muted-foreground">
            Enter your new password below
          </CardDescription>
        </CardHeader>
        <form onSubmit={formik.handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium text-foreground">
                New Password
              </label>
              <div className="relative">
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your new password"
                  value={formik.values.password}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  className={`card-enhanced2 text-foreground placeholder:text-muted-foreground pr-10 ${formik.touched.password && formik.errors.password ? 'border-destructive' : ''}`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? (
                    <EyeSlashIcon className="h-5 w-5" />
                  ) : (
                    <EyeIcon className="h-5 w-5" />
                  )}
                </button>
              </div>
              {formik.touched.password && formik.errors.password && (
                <p className="text-sm text-red-500">{formik.errors.password}</p>
              )}
            </div>

            <div className="space-y-2">
              <label htmlFor="confirmPassword" className="text-sm font-medium text-foreground">
                Confirm New Password
              </label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Confirm your new password"
                  value={formik.values.confirmPassword}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  className={`card-enhanced2 text-foreground placeholder:text-muted-foreground pr-10 ${formik.touched.confirmPassword && formik.errors.confirmPassword ? 'border-destructive' : ''}`}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-muted-foreground hover:text-foreground"
                >
                  {showConfirmPassword ? (
                    <EyeSlashIcon className="h-5 w-5" />
                  ) : (
                    <EyeIcon className="h-5 w-5" />
                  )}
                </button>
              </div>
              {formik.touched.confirmPassword && formik.errors.confirmPassword && (
                <p className="text-sm text-red-500">{formik.errors.confirmPassword}</p>
              )}
            </div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <Button type="submit" className="w-full bg-gradient-to-r from-blue-600 via-blue-500 to-blue-600 text-white shadow-lg transform scale-100 border border-blue-400/30" disabled={isLoading}>
              {isLoading ? 'Resetting...' : 'Reset password'}
            </Button>
            <Link href="/auth/login" className="text-center text-sm text-primary hover:text-primary/80 text-blue-500 hover:text-white transition-all duration-300 ease-in-out underline">
              Back to login
            </Link>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}