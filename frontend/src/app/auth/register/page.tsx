'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useFormik } from 'formik'
import * as Yup from 'yup'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import Logo from '@/components/ui/logo'
import { authApi } from '@/lib/api-functions'
import { toast } from 'react-hot-toast'
import { CheckCircleIcon, EnvelopeIcon } from '@heroicons/react/24/outline'

const registerSchema = Yup.object({
  firstName: Yup.string().min(2, 'First name must be at least 2 characters').required('First name is required'),
  lastName: Yup.string().min(2, 'Last name must be at least 2 characters').required('Last name is required'),
  email: Yup.string().email('Invalid email address').required('Email is required'),
  phone: Yup.string().matches(/^[0-9]{10,15}$/, 'Phone number must be 10-15 digits').optional(),
  address: Yup.string().min(10, 'Address must be at least 10 characters').optional(),
  password: Yup.string().min(6, 'Password must be at least 6 characters').required('Password is required'),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref('password')], 'Passwords must match')
    .required('Confirm password is required'),
})

export default function RegisterPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [isRegistered, setIsRegistered] = useState(false)

  const formik = useFormik({
    initialValues: {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      address: '',
      password: '',
      confirmPassword: '',
    },
    validationSchema: registerSchema,
    onSubmit: async (values) => {
      try {
        setIsLoading(true)
        const { confirmPassword, address, ...registerData } = values
        await authApi.register(registerData)
        toast.success('Registration successful! Please check your email for verification.')
        // Show success message instead of redirecting to OTP
        setIsRegistered(true)
      } catch (error: any) {
        toast.error(error.response?.data?.message || 'Registration failed')
      } finally {
        setIsLoading(false)
      }
    },
  })

  // Show success message after registration
  if (isRegistered) {
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
            <CardTitle className="text-2xl font-bold text-green-600">Registration Successful!</CardTitle>
            <CardDescription className="text-muted-foreground">
              We've sent a verification email to <br />
              <span className="font-medium text-foreground">{formik.values.email}</span>
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-primary/10 border border-primary/20 rounded-lg p-4">
              <div className="flex items-center space-x-3">
                <EnvelopeIcon className="h-5 w-5 text-primary flex-shrink-0" />
                <div className="text-sm">
                  <p className="font-medium text-foreground">Check your email</p>
                  <p className="text-muted-foreground">Click the verification link in your email to activate your account.</p>
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <Button
              onClick={() => setIsRegistered(false)}
              className="w-full"
            >
              Register Another Account
            </Button>
            <Link href="/auth/login" className="text-center text-sm text-primary hover:text-primary/80">
              Already verified? Sign in
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
          <CardTitle className="text-2xl font-bold text-center text-foreground">Create Account</CardTitle>
          <CardDescription className="text-center text-muted-foreground">
            Sign up for your WiFi dashboard account
          </CardDescription>
        </CardHeader>
        <form onSubmit={formik.handleSubmit}>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="firstName" className="text-sm font-medium text-foreground">
                  First Name
                </label>
                <Input
                  id="firstName"
                  name="firstName"
                  type="text"
                  placeholder="First name"
                  value={formik.values.firstName}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  className={`bg-input border-border text-foreground placeholder:text-muted-foreground ${formik.touched.firstName && formik.errors.firstName ? 'border-destructive' : ''}`}
                />
                {formik.touched.firstName && formik.errors.firstName && (
                  <p className="text-sm text-destructive">{formik.errors.firstName}</p>
                )}
              </div>

              <div className="space-y-2">
                <label htmlFor="lastName" className="text-sm font-medium text-foreground">
                  Last Name
                </label>
                <Input
                  id="lastName"
                  name="lastName"
                  type="text"
                  placeholder="Last name"
                  value={formik.values.lastName}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  className={`bg-input border-border text-foreground placeholder:text-muted-foreground ${formik.touched.lastName && formik.errors.lastName ? 'border-destructive' : ''}`}
                />
                {formik.touched.lastName && formik.errors.lastName && (
                  <p className="text-sm text-destructive">{formik.errors.lastName}</p>
                )}
              </div>
            </div>

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

            <div className="space-y-2">
              <label htmlFor="phone" className="text-sm font-medium text-foreground">
                Phone Number
              </label>
              <Input
                id="phone"
                name="phone"
                type="tel"
                placeholder="Enter your phone number"
                value={formik.values.phone}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                className={`bg-input border-border text-foreground placeholder:text-muted-foreground ${formik.touched.phone && formik.errors.phone ? 'border-destructive' : ''}`}
              />
              {formik.touched.phone && formik.errors.phone && (
                <p className="text-sm text-destructive">{formik.errors.phone}</p>
              )}
            </div>

            <div className="space-y-2">
              <label htmlFor="address" className="text-sm font-medium text-foreground">
                Address
              </label>
              <Textarea
                id="address"
                name="address"
                placeholder="Enter your full address"
                value={formik.values.address}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                className={`bg-input border-border text-foreground placeholder:text-muted-foreground ${formik.touched.address && formik.errors.address ? 'border-destructive' : ''}`}
              />
              {formik.touched.address && formik.errors.address && (
                <p className="text-sm text-destructive">{formik.errors.address}</p>
              )}
            </div>

            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium text-foreground">
                Password
              </label>
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="Enter your password"
                value={formik.values.password}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                className={`bg-input border-border text-foreground placeholder:text-muted-foreground ${formik.touched.password && formik.errors.password ? 'border-destructive' : ''}`}
              />
              {formik.touched.password && formik.errors.password && (
                <p className="text-sm text-destructive">{formik.errors.password}</p>
              )}
            </div>

            <div className="space-y-2">
              <label htmlFor="confirmPassword" className="text-sm font-medium text-foreground">
                Confirm Password
              </label>
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                placeholder="Confirm your password"
                value={formik.values.confirmPassword}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                className={`bg-input border-border text-foreground placeholder:text-muted-foreground ${formik.touched.confirmPassword && formik.errors.confirmPassword ? 'border-destructive' : ''}`}
              />
              {formik.touched.confirmPassword && formik.errors.confirmPassword && (
                <p className="text-sm text-destructive">{formik.errors.confirmPassword}</p>
              )}
            </div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <Button
              type="submit"
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? 'Creating account...' : 'Create account'}
            </Button>
            <p className="text-center text-sm text-muted-foreground">
              Already have an account?{' '}
              <Link href="/auth/login" className="text-primary hover:text-primary/80">
                Sign in
              </Link>
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}