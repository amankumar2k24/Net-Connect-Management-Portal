'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { CheckIcon, StarIcon, ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline'
import { formatCurrency } from '@/lib/utils'
import Link from 'next/link'

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

interface PricingCarouselProps {
    plans: PaymentPlan[]
    getDefaultFeatures: (durationMonths: number) => string[]
}

export default function PricingCarousel({ plans, getDefaultFeatures }: PricingCarouselProps) {
    const [currentIndex, setCurrentIndex] = useState(0)
    const [isAnimating, setIsAnimating] = useState(false)
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        setMounted(true)
    }, [])

    const nextPlan = () => {
        if (isAnimating) return
        setIsAnimating(true)
        setCurrentIndex((prev) => (prev + 1) % plans.length)
        setTimeout(() => setIsAnimating(false), 600)
    }

    const prevPlan = () => {
        if (isAnimating) return
        setIsAnimating(true)
        setCurrentIndex((prev) => (prev - 1 + plans.length) % plans.length)
        setTimeout(() => setIsAnimating(false), 600)
    }

    const goToPlan = (index: number) => {
        if (isAnimating || index === currentIndex) return
        setIsAnimating(true)
        setCurrentIndex(index)
        setTimeout(() => setIsAnimating(false), 600)
    }

    // Auto-rotate every 5 seconds
    useEffect(() => {
        if (!mounted) return

        const interval = setInterval(() => {
            if (!isAnimating) {
                nextPlan()
            }
        }, 5000)

        return () => clearInterval(interval)
    }, [currentIndex, isAnimating, mounted])

    // Get the visible cards (current, previous, next)
    const getVisibleCards = () => {
        if (!mounted || plans.length === 0) return []

        const cards = []
        const totalPlans = plans.length

        // Previous card
        const prevIndex = (currentIndex - 1 + totalPlans) % totalPlans
        cards.push({ plan: plans[prevIndex], position: 'left', index: prevIndex })

        // Current card
        cards.push({ plan: plans[currentIndex], position: 'center', index: currentIndex })

        // Next card
        const nextIndex = (currentIndex + 1) % totalPlans
        cards.push({ plan: plans[nextIndex], position: 'right', index: nextIndex })

        return cards
    }

    if (!mounted) {
        return (
            <div className="relative w-full max-w-6xl mx-auto px-4">
                <div className="relative h-[600px] flex items-center justify-center">
                    <div className="w-80 h-[500px] rounded-3xl bg-card border border-border shadow-lg animate-pulse" />
                </div>
            </div>
        )
    }

    const visibleCards = getVisibleCards()

    return (
        <div className="relative w-full max-w-6xl mx-auto px-4">
            {/* Carousel Container */}
            <div className="relative h-[600px] flex items-center justify-center overflow-hidden">
                {visibleCards.map(({ plan, position, index }) => {
                    const features = plan.features || getDefaultFeatures(plan.durationMonths)

                    return (
                        <div
                            key={`${plan.id}-${position}`}
                            className={`absolute w-80 h-[500px] cursor-pointer transition-all duration-600 ease-out ${position === 'center'
                                    ? 'z-30 scale-100 opacity-100'
                                    : position === 'left'
                                        ? 'z-20 scale-90 opacity-70 -translate-x-96'
                                        : 'z-20 scale-90 opacity-70 translate-x-96'
                                } ${isAnimating ? 'pointer-events-none' : ''}`}
                            onClick={() => goToPlan(index)}
                        >
                            {/* 3D Solid Card */}
                            <div className={`
                                relative w-full h-full rounded-3xl p-8 
                                bg-card border border-border shadow-2xl
                                ${plan.isPopular
                                    ? 'bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950 dark:to-purple-950 ring-2 ring-blue-500 shadow-blue-500/25'
                                    : 'bg-card'
                                }
                                hover:shadow-3xl transition-all duration-300
                                transform-gpu
                            `}>
                                {/* 3D Card Edge Effect */}
                                <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-white/5 to-transparent pointer-events-none" />

                                {/* Card Shine Effect */}
                                <div className="absolute top-0 left-1/4 w-1/2 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />

                                {/* Popular Badge */}
                                {plan.isPopular && (
                                    <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-10">
                                        <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-2 rounded-full text-sm font-semibold flex items-center space-x-2 shadow-lg">
                                            <StarIcon className="w-4 h-4" />
                                            <span>Most Popular</span>
                                        </div>
                                    </div>
                                )}

                                {/* Card Content */}
                                <div className="relative z-10 h-full flex flex-col">
                                    {/* Header */}
                                    <div className="text-center mb-6">
                                        <h3 className="text-2xl font-bold text-foreground mb-2">
                                            {plan.name || plan.durationLabel || `${plan.durationMonths} Month${plan.durationMonths > 1 ? 's' : ''} Plan`}
                                        </h3>
                                        <p className="text-muted-foreground text-sm mb-4">
                                            {plan.description || `Perfect for ${plan.durationMonths === 1 ? 'monthly' : 'long-term'} usage`}
                                        </p>

                                        {/* Price */}
                                        <div className="flex items-baseline justify-center mb-2">
                                            <span className="text-4xl font-bold text-foreground">
                                                {formatCurrency(plan.amount)}
                                            </span>
                                            <span className="text-muted-foreground ml-2 text-sm">
                                                /{plan.durationMonths === 1 ? 'month' : `${plan.durationMonths} months`}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Features */}
                                    <div className="flex-1 space-y-3 mb-6">
                                        {features.slice(0, 5).map((feature, featureIndex) => (
                                            <div key={featureIndex} className="flex items-center space-x-3">
                                                <div className="flex-shrink-0 w-5 h-5 rounded-full bg-green-500/20 flex items-center justify-center">
                                                    <CheckIcon className="w-3 h-3 text-green-500" />
                                                </div>
                                                <span className="text-foreground text-sm">{feature}</span>
                                            </div>
                                        ))}
                                    </div>

                                    {/* CTA Button */}
                                    <Link href="http://localhost:3000/auth/register" className="block">
                                        <Button
                                            variant={plan.isPopular ? "default" : "outline"}
                                            className={`w-full py-3 rounded-xl font-semibold transition-all duration-300 ${plan.isPopular
                                                    ? 'bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white shadow-lg hover:shadow-xl'
                                                    : 'border-border hover:bg-accent hover:text-accent-foreground'
                                                }`}
                                        >
                                            Choose Plan
                                        </Button>
                                    </Link>
                                </div>

                                {/* 3D Decorative Elements */}
                                <div className="absolute top-4 right-4 w-12 h-12 rounded-full bg-gradient-to-br from-blue-400/10 to-purple-400/10 dark:from-blue-400/20 dark:to-purple-400/20 blur-xl" />
                                <div className="absolute bottom-4 left-4 w-8 h-8 rounded-full bg-gradient-to-br from-pink-400/10 to-blue-400/10 dark:from-pink-400/20 dark:to-blue-400/20 blur-lg" />
                            </div>
                        </div>
                    )
                })}
            </div>

            {/* Navigation Arrows */}
            <button
                onClick={prevPlan}
                disabled={isAnimating}
                className="absolute left-4 top-1/2 transform -translate-y-1/2 z-40 w-12 h-12 rounded-full bg-card border border-border shadow-lg flex items-center justify-center text-foreground hover:bg-accent hover:text-accent-foreground transition-all duration-300 disabled:opacity-50"
            >
                <ChevronLeftIcon className="w-6 h-6" />
            </button>

            <button
                onClick={nextPlan}
                disabled={isAnimating}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 z-40 w-12 h-12 rounded-full bg-card border border-border shadow-lg flex items-center justify-center text-foreground hover:bg-accent hover:text-accent-foreground transition-all duration-300 disabled:opacity-50"
            >
                <ChevronRightIcon className="w-6 h-6" />
            </button>

            {/* Dots Indicator */}
            <div className="flex justify-center space-x-3 mt-8">
                {plans.map((_, index) => (
                    <button
                        key={index}
                        onClick={() => goToPlan(index)}
                        disabled={isAnimating}
                        className={`w-3 h-3 rounded-full transition-all duration-300 ${index === currentIndex
                                ? 'bg-primary scale-125 shadow-lg'
                                : 'bg-muted-foreground/40 hover:bg-muted-foreground/60'
                            }`}
                    />
                ))}
            </div>

            {/* Swipe Hint */}
            <div className="text-center mt-6">
                <p className="text-muted-foreground text-sm">
                    Click arrows or dots to explore plans
                </p>
            </div>
        </div>
    )
}