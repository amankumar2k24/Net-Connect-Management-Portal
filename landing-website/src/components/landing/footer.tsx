'use client'

import Link from 'next/link'
import { Logo } from '@/components/ui/logo'
import {
    MapPinIcon,
    PhoneIcon,
    EnvelopeIcon,
    GlobeAltIcon
} from '@heroicons/react/24/outline'

const footerLinks = {
    services: [
        { name: 'Residential WiFi', href: '#plans' },
        { name: 'Business Solutions', href: '#plans' },
        { name: 'Enterprise Plans', href: '#plans' },
        { name: 'Technical Support', href: '#contact' },
    ],
    company: [
        { name: 'About Us', href: '#about' },
        { name: 'Our Team', href: '#about' },
        { name: 'Careers', href: '#contact' },
        { name: 'Press', href: '#contact' },
    ],
    support: [
        { name: 'Help Center', href: '#contact' },
        { name: 'Contact Support', href: '#contact' },
        { name: 'Network Status', href: '#features' },
        { name: 'Installation Guide', href: '#features' },
    ],
    legal: [
        { name: 'Privacy Policy', href: '#' },
        { name: 'Terms of Service', href: '#' },
        { name: 'Cookie Policy', href: '#' },
        { name: 'Acceptable Use', href: '#' },
    ]
}

const socialLinks = [
    { name: 'Facebook', href: '#', icon: '📘' },
    { name: 'Twitter', href: '#', icon: '🐦' },
    { name: 'LinkedIn', href: '#', icon: '💼' },
    { name: 'Instagram', href: '#', icon: '📷' },
]

export default function Footer() {
    const scrollToSection = (href: string) => {
        if (href.startsWith('#')) {
            const element = document.querySelector(href)
            if (element) {
                element.scrollIntoView({ behavior: 'smooth' })
            }
        }
    }

    return (
        <footer className="bg-card border-t border-border">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Main Footer Content */}
                <div className="py-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-8">
                    {/* Company Info */}
                    <div className="lg:col-span-2">
                        <Logo size="md" className="mb-4" />
                        <p className="text-muted-foreground mb-6 max-w-sm">
                            Connecting communities with premium WiFi solutions.
                            Experience the difference with FlowLink's reliable,
                            high-speed internet services.
                        </p>

                        {/* Contact Info */}
                        <div className="space-y-3">
                            <div className="flex items-center space-x-3 text-sm text-muted-foreground">
                                <MapPinIcon className="w-4 h-4 flex-shrink-0" />
                                <span>123 Tech Street, Digital City, DC 12345</span>
                            </div>
                            <div className="flex items-center space-x-3 text-sm text-muted-foreground">
                                <PhoneIcon className="w-4 h-4 flex-shrink-0" />
                                <span>+1 (555) 123-4567</span>
                            </div>
                            <div className="flex items-center space-x-3 text-sm text-muted-foreground">
                                <EnvelopeIcon className="w-4 h-4 flex-shrink-0" />
                                <span>support@flowlink.com</span>
                            </div>
                            <div className="flex items-center space-x-3 text-sm text-muted-foreground">
                                <GlobeAltIcon className="w-4 h-4 flex-shrink-0" />
                                <span>www.flowlink.com</span>
                            </div>
                        </div>
                    </div>

                    {/* Services */}
                    <div>
                        <h3 className="font-semibold text-foreground mb-4">Services</h3>
                        <ul className="space-y-3">
                            {footerLinks.services.map((link) => (
                                <li key={link.name}>
                                    <button
                                        onClick={() => scrollToSection(link.href)}
                                        className="text-sm text-muted-foreground hover:text-foreground transition-colors duration-200"
                                    >
                                        {link.name}
                                    </button>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Company */}
                    <div>
                        <h3 className="font-semibold text-foreground mb-4">Company</h3>
                        <ul className="space-y-3">
                            {footerLinks.company.map((link) => (
                                <li key={link.name}>
                                    <button
                                        onClick={() => scrollToSection(link.href)}
                                        className="text-sm text-muted-foreground hover:text-foreground transition-colors duration-200"
                                    >
                                        {link.name}
                                    </button>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Support */}
                    <div>
                        <h3 className="font-semibold text-foreground mb-4">Support</h3>
                        <ul className="space-y-3">
                            {footerLinks.support.map((link) => (
                                <li key={link.name}>
                                    <button
                                        onClick={() => scrollToSection(link.href)}
                                        className="text-sm text-muted-foreground hover:text-foreground transition-colors duration-200"
                                    >
                                        {link.name}
                                    </button>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Legal */}
                    <div>
                        <h3 className="font-semibold text-foreground mb-4">Legal</h3>
                        <ul className="space-y-3">
                            {footerLinks.legal.map((link) => (
                                <li key={link.name}>
                                    <a
                                        href={link.href}
                                        className="text-sm text-muted-foreground hover:text-foreground transition-colors duration-200"
                                    >
                                        {link.name}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

                {/* Newsletter Signup */}
                <div className="py-8 border-t border-border">
                    <div className="flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0">
                        <div>
                            <h3 className="font-semibold text-foreground mb-2">Stay Connected</h3>
                            <p className="text-sm text-muted-foreground">
                                Get the latest updates on our services and special offers.
                            </p>
                        </div>
                        <div className="flex space-x-4">
                            <Link href="http://localhost:3000/auth/register">
                                <button className="bg-primary text-primary-foreground px-6 py-2 rounded-lg hover:bg-primary/90 transition-colors duration-200 text-sm font-medium">
                                    Get Started
                                </button>
                            </Link>
                            <button
                                onClick={() => scrollToSection('#contact')}
                                className="border border-border text-foreground px-6 py-2 rounded-lg hover:bg-accent transition-colors duration-200 text-sm font-medium"
                            >
                                Contact Us
                            </button>
                        </div>
                    </div>
                </div>

                {/* Bottom Footer */}
                <div className="py-6 border-t border-border">
                    <div className="flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0">
                        <div className="text-sm text-muted-foreground">
                            © 2024 FlowLink. All rights reserved.
                        </div>

                        {/* Social Links */}
                        <div className="flex items-center space-x-4">
                            <span className="text-sm text-muted-foreground">Follow us:</span>
                            {socialLinks.map((social) => (
                                <a
                                    key={social.name}
                                    href={social.href}
                                    className="text-muted-foreground hover:text-foreground transition-colors duration-200"
                                    aria-label={social.name}
                                >
                                    <span className="text-lg">{social.icon}</span>
                                </a>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    )
}