'use client'

import Image from 'next/image'
import {
    UserGroupIcon,
    TrophyIcon,
    HeartIcon,
    LightBulbIcon
} from '@heroicons/react/24/outline'

const values = [
    {
        icon: UserGroupIcon,
        title: 'Customer First',
        description: 'Every decision we make is centered around delivering the best experience for our customers.',
        color: 'text-blue-500'
    },
    {
        icon: TrophyIcon,
        title: 'Excellence',
        description: 'We strive for excellence in everything we do, from network infrastructure to customer service.',
        color: 'text-yellow-500'
    },
    {
        icon: HeartIcon,
        title: 'Reliability',
        description: 'You can count on us for consistent, dependable internet connectivity when you need it most.',
        color: 'text-red-500'
    },
    {
        icon: LightBulbIcon,
        title: 'Innovation',
        description: 'We continuously invest in cutting-edge technology to bring you the latest in connectivity solutions.',
        color: 'text-purple-500'
    }
]

const team = [
    {
        name: 'Sarah Johnson',
        role: 'CEO & Founder',
        image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&h=400&fit=crop&crop=face',
        description: '15+ years in telecommunications industry'
    },
    {
        name: 'Michael Chen',
        role: 'CTO',
        image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=face',
        description: 'Network infrastructure expert'
    },
    {
        name: 'Emily Rodriguez',
        role: 'Head of Customer Success',
        image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop&crop=face',
        description: 'Passionate about customer experience'
    }
]

export default function About() {
    return (
        <section id="about" className="py-20 bg-background">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Section Header */}
                <div className="text-center mb-16">
                    <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                        About FlowLink
                    </h2>
                    <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
                        Founded in 2018, FlowLink has been at the forefront of providing premium WiFi solutions
                        to homes and businesses. Our mission is to connect communities with reliable,
                        high-speed internet that empowers digital transformation.
                    </p>
                </div>

                {/* Story Section */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-20">
                    <div>
                        <h3 className="text-2xl md:text-3xl font-bold text-foreground mb-6">
                            Our Story
                        </h3>
                        <div className="space-y-4 text-muted-foreground">
                            <p>
                                FlowLink was born from a simple observation: reliable internet connectivity
                                shouldn't be a luxury. Our founders, frustrated with inconsistent service
                                and poor customer support from traditional providers, set out to create
                                a better solution.
                            </p>
                            <p>
                                Starting with a small team of network engineers and customer service
                                specialists, we've grown to serve over 10,000 customers across the region.
                                Our commitment to quality, transparency, and customer satisfaction has made
                                us the preferred choice for discerning users.
                            </p>
                            <p>
                                Today, we continue to invest in the latest technology and infrastructure
                                to ensure our customers always have access to the fastest, most reliable
                                internet connection available.
                            </p>
                        </div>
                    </div>

                    <div className="relative">
                        <div className="w-full h-96 bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-2xl overflow-hidden relative">
                            <Image
                                src="https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=600&h=400&fit=crop"
                                alt="FlowLink team working"
                                fill
                                className="object-cover"
                                sizes="(max-width: 768px) 100vw, 50vw"
                            />
                        </div>
                        {/* Floating Stats */}
                        <div className="absolute -bottom-6 -left-6 bg-card rounded-xl p-4 shadow-lg border border-border">
                            <div className="text-2xl font-bold text-primary">10K+</div>
                            <div className="text-sm text-muted-foreground">Happy Customers</div>
                        </div>
                        <div className="absolute -top-6 -right-6 bg-card rounded-xl p-4 shadow-lg border border-border">
                            <div className="text-2xl font-bold text-primary">99.9%</div>
                            <div className="text-sm text-muted-foreground">Uptime</div>
                        </div>
                    </div>
                </div>

                {/* Values Section */}
                <div className="mb-20">
                    <div className="text-center mb-12">
                        <h3 className="text-2xl md:text-3xl font-bold text-foreground mb-4">
                            Our Values
                        </h3>
                        <p className="text-muted-foreground max-w-2xl mx-auto">
                            These core values guide everything we do and shape how we serve our community.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {values.map((value, index) => (
                            <div
                                key={index}
                                className="text-center p-6 bg-card rounded-xl border border-border hover:border-primary/50 transition-all duration-300 card-hover"
                            >
                                <div className={`w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-${value.color.split('-')[1]}-100 to-${value.color.split('-')[1]}-200 dark:from-${value.color.split('-')[1]}-900/20 dark:to-${value.color.split('-')[1]}-800/20 flex items-center justify-center`}>
                                    <value.icon className={`w-8 h-8 ${value.color}`} />
                                </div>
                                <h4 className="text-xl font-semibold text-foreground mb-3">{value.title}</h4>
                                <p className="text-muted-foreground">{value.description}</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Team Section */}
                <div>
                    <div className="text-center mb-12">
                        <h3 className="text-2xl md:text-3xl font-bold text-foreground mb-4">
                            Meet Our Team
                        </h3>
                        <p className="text-muted-foreground max-w-2xl mx-auto">
                            The passionate professionals behind FlowLink's success, dedicated to
                            delivering exceptional connectivity solutions.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
                        {team.map((member, index) => (
                            <div
                                key={index}
                                className="text-center p-6 bg-card rounded-xl border border-border hover:border-primary/50 transition-all duration-300 card-hover"
                            >
                                <div className="w-24 h-24 mx-auto mb-4 rounded-full overflow-hidden relative bg-gray-200 dark:bg-gray-700">
                                    <Image
                                        src={member.image}
                                        alt={member.name}
                                        fill
                                        className="object-cover"
                                        sizes="96px"
                                        onError={(e) => {
                                            console.log('Image failed to load:', member.image);
                                        }}
                                    />
                                </div>
                                <h4 className="text-xl font-semibold text-foreground mb-1">{member.name}</h4>
                                <p className="text-primary font-medium mb-2">{member.role}</p>
                                <p className="text-sm text-muted-foreground">{member.description}</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Mission Statement */}
                <div className="mt-20 text-center">
                    <div className="max-w-4xl mx-auto p-8 md:p-12 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-slate-800 dark:to-slate-700 rounded-3xl">
                        <h3 className="text-2xl md:text-3xl font-bold text-foreground mb-6">
                            Our Mission
                        </h3>
                        <p className="text-lg text-muted-foreground leading-relaxed">
                            "To democratize access to premium internet connectivity by delivering reliable,
                            high-speed WiFi solutions that empower individuals, families, and businesses
                            to thrive in the digital age. We believe that exceptional connectivity should
                            be accessible, affordable, and backed by unparalleled customer service."
                        </p>
                    </div>
                </div>
            </div>
        </section>
    )
}