'use client'

import { Button } from '@/components/ui/button'
import { WifiIcon, BoltIcon, ShieldCheckIcon } from '@heroicons/react/24/outline'
import Link from 'next/link'

export default function Hero() {
    const scrollToPlans = () => {
        const element = document.querySelector('#plans')
        if (element) {
            element.scrollIntoView({ behavior: 'smooth' })
        }
    }

    return (
        <section id="home" className="relative min-h-screen flex items-center justify-center overflow-hidden">
            {/* Background Elements */}
            <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900" />

            {/* Animated Background Shapes */}
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-400/20 rounded-full blur-3xl animate-pulse-slow" />
                <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-indigo-400/20 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '1s' }} />
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-purple-400/10 rounded-full blur-3xl animate-spin-slow" />
            </div>

            <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                <div className="max-w-4xl mx-auto">
                    {/* Hero Badge */}
                    <div className="inline-flex items-center px-4 py-2 sm:mt-3 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 text-sm font-medium mb-8 animate-fade-in">
                        <WifiIcon className="w-4 h-4 mr-2" />
                        Premium WiFi Solutions
                    </div>

                    {/* Main Heading */}
                    <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-foreground mb-6 animate-slide-up">
                        Experience
                        <span className="block pt-3 text-gradient">Lightning-Fast</span>
                        WiFi Connectivity
                    </h1>

                    {/* Subtitle */}
                    <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-3xl mx-auto leading-relaxed animate-slide-up" style={{ animationDelay: '0.2s' }}>
                        Join thousands of satisfied customers who trust FlowLink for reliable, high-speed internet.
                        From homes to businesses, we deliver seamless connectivity that powers your digital life.
                    </p>

                    {/* CTA Buttons */}
                    <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12 animate-slide-up" style={{ animationDelay: '0.4s' }}>
                        <Button
                            variant="gradient"
                            size="xl"
                            onClick={scrollToPlans}
                            className="min-w-[200px] shadow-2xl"
                        >
                            View Plans
                        </Button>
                        <Link href="http://localhost:3000/auth/register">
                            <Button
                                variant="outline"
                                size="xl"
                                className="min-w-[200px] border-2"
                            >
                                Get Started Free
                            </Button>
                        </Link>
                    </div>

                    {/* Feature Highlights */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto animate-slide-up" style={{ animationDelay: '0.6s' }}>
                        <div className="flex items-center justify-center space-x-3 p-4 rounded-lg bg-card/50 backdrop-blur-sm border border-border/50">
                            <BoltIcon className="w-6 h-6 text-yellow-500" />
                            <span className="font-semibold text-foreground">Ultra-Fast Speeds</span>
                        </div>
                        <div className="flex items-center justify-center space-x-3 p-4 rounded-lg bg-card/50 backdrop-blur-sm border border-border/50">
                            <ShieldCheckIcon className="w-6 h-6 text-green-500" />
                            <span className="font-semibold text-foreground">99.9% Uptime</span>
                        </div>
                        <div className="flex items-center justify-center space-x-3 p-4 rounded-lg bg-card/50 backdrop-blur-sm border border-border/50">
                            <WifiIcon className="w-6 h-6 text-blue-500" />
                            <span className="font-semibold text-foreground">24/7 Support</span>
                        </div>
                    </div>
                </div>

                {/* Floating WiFi Icon */}
                <div className="absolute top-20 right-10 hidden lg:block">
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center shadow-lg floating-animation">
                        <WifiIcon className="w-8 h-8 text-white" />
                    </div>
                </div>

                {/* Floating Speed Icon */}
                <div className="absolute bottom-20 left-10 hidden lg:block">
                    <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center shadow-lg floating-animation" style={{ animationDelay: '1s' }}>
                        <BoltIcon className="w-6 h-6 text-white" />
                    </div>
                </div>
            </div>
        </section>
    )
}