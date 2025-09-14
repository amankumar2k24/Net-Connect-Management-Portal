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
import { useAuth } from '@/contexts/auth-context'
import { toast } from 'react-hot-toast'

const loginSchema = Yup.object({
  email: Yup.string().email('Invalid email address').required('Email is required'),
  password: Yup.string().min(6, 'Password must be at least 6 characters').required('Password is required'),
})

export default function LoginPage() {
  const router = useRouter()
  const { login } = useAuth()
  const [isLoading, setIsLoading] = useState(false)

  const formik = useFormik({
    initialValues: {
      email: '',
      password: '',
    },
    validationSchema: loginSchema,
    onSubmit: async (values) => {
      try {
        setIsLoading(true)
        await login(values.email, values.password)
        toast.success('Login successful!')
        router.push('/dashboard')
      } catch (error: any) {
        toast.error(error.response?.data?.message || 'Login failed')
      } finally {
        setIsLoading(false)
      }
    },
  })

  return (
    <div className="min-h-screen flex items-center justify-center bg-background py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md bg-card border-border card-glow">
        <CardHeader className="space-y-1">
          <div className="text-center mb-4">
            <Logo size="md" variant="stacked" />
          </div>
          <CardTitle className="text-2xl font-bold text-center text-foreground">Log in</CardTitle>
          <CardDescription className="text-center text-muted-foreground">
            Enter your credentials to access your dashboard
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
            <div className="flex items-center justify-between">
              <Link
                href="/auth/forgot-password"
                className="text-sm text-primary hover:text-primary/80"
              >
                Forgot your password?
              </Link>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? 'Signing in...' : 'Sign in'}
            </Button>
            <p className="text-center text-sm text-muted-foreground">
              Don't have an account?{' '}
              <Link href="/auth/register" className="text-primary hover:text-primary/80">
                Sign up
              </Link>
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}