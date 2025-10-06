'use client'

import { useState, useEffect } from 'react'
import { CheckIcon } from '@heroicons/react/24/outline'
import { getPaymentPlans } from '@/lib/api'
import { WiFiRotatingLoader } from '@/components/ui/rotating-loader'
import PricingCarousel from '@/components/ui/pricing-carousel-simple'

interface PaymentPlan {
    id: string
    name?: string
    description?: string
    amount: number
    durationMonths: number
    durationLabel?: string
    features?: string[]
    isPopular?: boolean
    isActive: boolean
    sortOrder: number
}

const getDefaultFeatures = (durationMonths: number): string[] => {
    const baseFeatures = ['High-Speed Internet', '24/7 Customer Support', 'No Setup Fee']

    if (durationMonths === 1) {
        return [...baseFeatures, 'Monthly Billing', 'Basic Support']
    } else if (durationMonths <= 3) {
        return [...baseFeatures, 'Quarterly Billing', 'Priority Support', '10% Discount']
    } else if (durationMonths <= 6) {
        return [...baseFeatures, 'Semi-Annual Billing', 'Premium Support', '15% Discount', 'Free Installation']
    } else {
        return [...baseFeatures, 'Annual Billing', 'VIP Support', '20% Discount', 'Free Installation', 'Free Router']
    }
}

export default function Pricing() {
    const [plans, setPlans] = useState<PaymentPlan[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchPlans = async () => {
            try {
                // Add minimum loading time to show the beautiful loader
                const [data] = await Promise.all([
                    getPaymentPlans(),
                    new Promise(resolve => setTimeout(resolve, 2000)) // 2 second minimum
                ])
                const plans = data.paymentPlans || []
                setPlans(plans.sort((a: PaymentPlan, b: PaymentPlan) => a.sortOrder - b.sortOrder))
            } catch (error) {
                console.error('Failed to fetch payment plans:', error)
                // Fallback plans if API fails
                setPlans([
                    {
                        id: '1',
                        name: 'Basic',
                        description: 'Perfect for light internet usage',
                        amount: 599,
                        durationMonths: 1,
                        features: ['50 Mbps Speed', '100 GB Data', 'Basic Support', '1 Device'],
                        isPopular: false,
                        isActive: true,
                        sortOrder: 1
                    },
                    {
                        id: '2',
                        name: 'Premium',
                        description: 'Ideal for families and small businesses',
                        amount: 999,
                        durationMonths: 1,
                        features: ['100 Mbps Speed', 'Unlimited Data', 'Priority Support', '5 Devices', 'Free Installation'],
                        isPopular: true,
                        isActive: true,
                        sortOrder: 2
                    },
                    {
                        id: '3',
                        name: 'Enterprise',
                        description: 'For businesses requiring maximum performance',
                        amount: 1999,
                        durationMonths: 1,
                        features: ['500 Mbps Speed', 'Unlimited Data', '24/7 Support', 'Unlimited Devices', 'Free Installation', 'Dedicated Support Manager'],
                        isPopular: false,
                        isActive: true,
                        sortOrder: 3
                    }
                ])
            } finally {
                setLoading(false)
            }
        }

        fetchPlans()
    }, [])

    if (loading) {
        return (
            <section id="plans" className="py-20 bg-muted/30">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                            Choose Your Perfect Plan
                        </h2>
                        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                            Flexible pricing options designed to meet your connectivity needs. All plans include our premium features and 24/7 support.
                        </p>
                    </div>

                    {/* Rotating 3D Light Loader */}
                    <div className="flex justify-center items-center min-h-[400px]">
                        <WiFiRotatingLoader
                            message="Loading premium plans..."
                            size="lg"
                            className="relative z-10"
                        />
                    </div>
                </div>
            </section>
        )
    }

    return (
        <section id="plans" className="py-20 bg-muted/30">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-16">
                    <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                        Choose Your Perfect Plan
                    </h2>
                    <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                        Flexible pricing options designed to meet your connectivity needs.
                        All plans include our premium features and 24/7 support.
                    </p>
                </div>

                {/* 3D Glassmorphism Pricing Carousel */}
                <PricingCarousel
                    plans={plans}
                    getDefaultFeatures={getDefaultFeatures}
                />

                {/* Additional Info */}
                <div className="text-center mt-12">
                    <p className="text-muted-foreground mb-4">
                        All plans include free installation and 30-day money-back guarantee
                    </p>
                    <div className="flex flex-wrap justify-center gap-6 text-sm text-muted-foreground">
                        <div className="flex items-center space-x-2">
                            <CheckIcon className="w-4 h-4 text-green-500" />
                            <span>No Setup Fees</span>
                        </div>
                        <div className="flex items-center space-x-2">
                            <CheckIcon className="w-4 h-4 text-green-500" />
                            <span>Cancel Anytime</span>
                        </div>
                        <div className="flex items-center space-x-2">
                            <CheckIcon className="w-4 h-4 text-green-500" />
                            <span>24/7 Support</span>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}