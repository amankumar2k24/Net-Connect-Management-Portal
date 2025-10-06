'use client'

import React from 'react'
import {
    WifiIcon,
    BoltIcon,
    ShieldCheckIcon,
    ClockIcon,
    PhoneIcon,
    CogIcon,
    GlobeAltIcon,
    ChartBarIcon
} from '@heroicons/react/24/outline'

const features = [
    {
        icon: BoltIcon,
        title: 'Lightning Fast Speeds',
        description: 'Experience blazing-fast internet speeds up to 1 Gbps for seamless streaming, gaming, and work.',
        color: 'text-yellow-500'
    },
    {
        icon: ShieldCheckIcon,
        title: '99.9% Uptime Guarantee',
        description: 'Reliable connection you can count on with our industry-leading uptime guarantee.',
        color: 'text-green-500'
    },
    {
        icon: PhoneIcon,
        title: '24/7 Expert Support',
        description: 'Round-the-clock technical support from our certified network engineers.',
        color: 'text-blue-500'
    },
    {
        icon: CogIcon,
        title: 'Easy Installation',
        description: 'Professional installation within 24 hours with no hidden fees or complications.',
        color: 'text-purple-500'
    },
    {
        icon: GlobeAltIcon,
        title: 'Wide Coverage',
        description: 'Extensive network coverage across the city with multiple connection points.',
        color: 'text-indigo-500'
    },
    {
        icon: ChartBarIcon,
        title: 'Real-time Monitoring',
        description: 'Monitor your usage, speed, and connection status through our advanced dashboard.',
        color: 'text-orange-500'
    }
]

export default function Features() {
    return (
        <section id="features" className="py-20 bg-background">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Section Header */}
                <div className="text-center mb-16">
                    <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                        Why Choose FlowLink?
                    </h2>
                    <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                        We deliver more than just internet connectivity. Experience the difference
                        with our premium features and unmatched service quality.
                    </p>
                </div>

                {/* Features Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {features.map((feature, index) => (
                        <div
                            key={index}
                            className="group p-8 bg-card rounded-2xl border border-border hover:border-primary/50 transition-all duration-300 card-hover"
                        >
                            {/* Icon */}
                            <div className="mb-6">
                                <div className={`w-12 h-12 rounded-lg bg-gradient-to-br from-${feature.color.split('-')[1]}-100 to-${feature.color.split('-')[1]}-200 dark:from-${feature.color.split('-')[1]}-900/20 dark:to-${feature.color.split('-')[1]}-800/20 flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                                    <feature.icon className={`w-6 h-6 ${feature.color}`} />
                                </div>
                            </div>

                            {/* Content */}
                            <h3 className="text-xl font-semibold text-foreground mb-3 group-hover:text-primary transition-colors duration-300">
                                {feature.title}
                            </h3>
                            <p className="text-muted-foreground leading-relaxed">
                                {feature.description}
                            </p>
                        </div>
                    ))}
                </div>

                {/* Stats Section */}
                <div className="mt-20 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-slate-800 dark:to-slate-700 rounded-3xl p-8 md:p-12">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
                        <div>
                            <div className="text-3xl md:text-4xl font-bold text-primary mb-2">10K+</div>
                            <div className="text-muted-foreground">Happy Customers</div>
                        </div>
                        <div>
                            <div className="text-3xl md:text-4xl font-bold text-primary mb-2">99.9%</div>
                            <div className="text-muted-foreground">Uptime</div>
                        </div>
                        <div>
                            <div className="text-3xl md:text-4xl font-bold text-primary mb-2">1Gbps</div>
                            <div className="text-muted-foreground">Max Speed</div>
                        </div>
                        <div>
                            <div className="text-3xl md:text-4xl font-bold text-primary mb-2">24/7</div>
                            <div className="text-muted-foreground">Support</div>
                        </div>
                    </div>
                </div>

                {/* Technology Section */}
                <div className="mt-20">
                    <div className="text-center mb-12">
                        <h3 className="text-2xl md:text-3xl font-bold text-foreground mb-4">
                            Powered by Advanced Technology
                        </h3>
                        <p className="text-muted-foreground max-w-2xl mx-auto">
                            Our infrastructure is built on cutting-edge technology to ensure
                            you get the best possible internet experience.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                        {/* Technology Features */}
                        <div className="space-y-6">
                            <div className="flex items-start space-x-4">
                                <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center flex-shrink-0 mt-1">
                                    <WifiIcon className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                                </div>
                                <div>
                                    <h4 className="font-semibold text-foreground mb-2">Fiber Optic Network</h4>
                                    <p className="text-muted-foreground">Ultra-fast fiber optic cables deliver consistent high-speed internet directly to your location.</p>
                                </div>
                            </div>

                            <div className="flex items-start space-x-4">
                                <div className="w-8 h-8 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center flex-shrink-0 mt-1">
                                    <ClockIcon className="w-4 h-4 text-green-600 dark:text-green-400" />
                                </div>
                                <div>
                                    <h4 className="font-semibold text-foreground mb-2">Low Latency</h4>
                                    <p className="text-muted-foreground">Optimized routing ensures minimal delay for gaming, video calls, and real-time applications.</p>
                                </div>
                            </div>

                            <div className="flex items-start space-x-4">
                                <div className="w-8 h-8 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center flex-shrink-0 mt-1">
                                    <ShieldCheckIcon className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                                </div>
                                <div>
                                    <h4 className="font-semibold text-foreground mb-2">Advanced Security</h4>
                                    <p className="text-muted-foreground">Enterprise-grade security protocols protect your data and ensure safe browsing.</p>
                                </div>
                            </div>
                        </div>

                        {/* Visual Element */}
                        <div className="relative">
                            <div className="w-full h-64 bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-2xl flex items-center justify-center">
                                <div className="relative">
                                    {/* Central Hub */}
                                    <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center shadow-lg">
                                        <WifiIcon className="w-8 h-8 text-white" />
                                    </div>

                                    {/* Orbiting Elements */}
                                    <div className="absolute inset-0 animate-spin-slow">
                                        <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 w-4 h-4 bg-green-500 rounded-full"></div>
                                        <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 w-4 h-4 bg-yellow-500 rounded-full"></div>
                                        <div className="absolute top-1/2 -left-8 transform -translate-y-1/2 w-4 h-4 bg-purple-500 rounded-full"></div>
                                        <div className="absolute top-1/2 -right-8 transform -translate-y-1/2 w-4 h-4 bg-pink-500 rounded-full"></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}