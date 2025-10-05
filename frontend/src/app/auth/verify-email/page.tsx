'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import Logo from '@/components/ui/logo'
import { CheckCircleIcon, XMarkIcon, ArrowPathIcon } from '@heroicons/react/24/outline'
import { toast } from 'react-hot-toast'

export default function VerifyEmailPage() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const [isLoading, setIsLoading] = useState(true)
    const [isVerified, setIsVerified] = useState(false)
    const [error, setError] = useState('')

    useEffect(() => {
        const verifyEmail = async () => {
            const token = searchParams.get('token')

            if (!token) {
                setError('Invalid verification link')
                setIsLoading(false)
                return
            }

            // Check if backend is available first
            try {
                const healthCheck = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/profile`, {
                    method: 'GET',
                })
                // If backend is not running, the fetch will fail
            } catch (error) {
                setError('Backend server is not running. Please contact the administrator.')
                setIsLoading(false)
                return
            }

            try {
                const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/verify-email?token=${token}`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                })

                if (!response.ok) {
                    if (response.status === 404) {
                        throw new Error('Verification endpoint not found')
                    } else if (response.status === 400) {
                        const errorData = await response.json()
                        throw new Error(errorData.message || 'Invalid verification token')
                    } else {
                        throw new Error(`HTTP error! status: ${response.status}`)
                    }
                }

                const data = await response.json()

                // Check if the verification was successful
                if (data.message === 'Email verified successfully') {
                    setIsVerified(true)
                    toast.success('Email verified successfully!')
                } else {
                    setError(data.message || 'Verification failed')
                }
            } catch (error: any) {
                console.error('Verification error:', error)
                if (error.message.includes('Failed to fetch')) {
                    setError('Cannot connect to server. Please make sure the backend is running on port 5510.')
                } else if (error.message.includes('404')) {
                    setError('Verification endpoint not found. Please contact support.')
                } else {
                    setError(error.message || 'Network error occurred')
                }
            } finally {
                setIsLoading(false)
            }
        }

        verifyEmail()
    }, [searchParams])

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background py-12 px-4 sm:px-6 lg:px-8">
                <Card className="w-full max-w-md bg-card border-border card-glow">
                    <CardContent className="p-8 text-center">
                        <div className="text-center mb-4">
                            <Logo size="md" variant="stacked" />
                        </div>
                        <ArrowPathIcon className="h-12 w-12 text-primary mx-auto mb-4 animate-spin" />
                        <h3 className="text-lg font-medium text-foreground mb-2">Verifying Email</h3>
                        <p className="text-sm text-muted-foreground">
                            Please wait while we verify your email address...
                        </p>
                    </CardContent>
                </Card>
            </div>
        )
    }

    if (error) {
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
                        <CardTitle className="text-2xl font-bold text-destructive">Verification Failed</CardTitle>
                        <CardDescription className="text-muted-foreground">
                            {error}
                        </CardDescription>
                    </CardHeader>
                    <CardFooter className="flex flex-col space-y-4">
                        <Link href="/auth/register" className="w-full">
                            <Button className="w-full">
                                Back to Registration
                            </Button>
                        </Link>
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
            <Card className="w-full max-w-md card-enhanced">
                <CardHeader className="space-y-1 text-center">
                    <div className="mx-auto mb-4">
                        <CheckCircleIcon className="h-12 w-12 text-green-500 mx-auto" />
                    </div>
                    <CardTitle className="text-2xl font-bold text-green-600">Email Verified!</CardTitle>
                    <CardDescription className="text-muted-foreground">
                        Your email address has been successfully verified. You can now sign in to your account.
                    </CardDescription>
                </CardHeader>
                <CardFooter className="flex flex-col space-y-4">
                    <Button
                        onClick={() => router.push('/auth/login')}
                        className="w-full"
                    >
                        Continue to Sign In
                    </Button>
                    <p className="text-center text-sm text-muted-foreground">
                        Welcome to WaveNet! 🎉
                    </p>
                </CardFooter>
            </Card>
        </div>
    )
}